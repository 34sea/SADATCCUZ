'use client';

import React, { useEffect, useRef, useState } from 'react';

import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { ProgressBar } from 'primereact/progressbar';
import { Divider } from 'primereact/divider';
import { TabView, TabPanel } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';

import {
    getMyPreProject,
    PreProject2,
    PreProjectEvaluator,
    StatusHistory
} from '@/app/api/pre-projects/preProjectService';


// =====================================================
// HELPERS
// =====================================================

const formatDate = (
    date?: string | null
) => {

    if (!date) {
        return '-';
    }

    try {

        return new Date(date).toLocaleString(
            'pt-PT',
            {
                dateStyle: 'medium',
                timeStyle: 'short'
            }
        );

    } catch {

        return '-';

    }
};


const formatDateOnly = (
    date?: string | null
) => {

    if (!date) {
        return '-';
    }

    try {

        return new Date(date).toLocaleDateString(
            'pt-PT',
            {
                dateStyle: 'medium'
            }
        );

    } catch {

        return '-';

    }
};


// =====================================================
// DOCUMENT URL
// =====================================================

const getDocumentUrl = (
    documentUrl?: string | null
) => {

    if (!documentUrl) {
        return null;
    }

    // Se já for URL completa
    if (
        documentUrl.startsWith('http://') ||
        documentUrl.startsWith('https://')
    ) {
        return documentUrl;
    }

    // Ajuste conforme o seu .env
    const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        '';

    return `${apiUrl.replace(/\/$/, '')}/${documentUrl.replace(/^\//, '')}`;
};


// =====================================================
// STATUS
// =====================================================

const getStatusConfig = (
    status?: string | null
) => {

    const config: Record<
        string,
        {
            label: string;
            severity:
                | 'success'
                | 'info'
                | 'warning'
                | 'danger';
            icon: string;
        }
    > = {

        SUBMETIDO: {
            label: 'Submetido',
            severity: 'info',
            icon: 'pi pi-send'
        },

        EM_ATRIBUICAO_AVALIADORES: {
            label: 'Em atribuição de avaliadores',
            severity: 'warning',
            icon: 'pi pi-users'
        },

        EM_AVALIACAO: {
            label: 'Em avaliação',
            severity: 'warning',
            icon: 'pi pi-search'
        },

        APROVADO: {
            label: 'Aprovado',
            severity: 'success',
            icon: 'pi pi-check-circle'
        },

        REPROVADO: {
            label: 'Reprovado',
            severity: 'danger',
            icon: 'pi pi-times-circle'
        },

        EM_REVISAO: {
            label: 'Em revisão',
            severity: 'warning',
            icon: 'pi pi-exclamation-circle'
        },

        RESUBMETIDO: {
            label: 'Resubmetido',
            severity: 'info',
            icon: 'pi pi-refresh'
        }
    };

    return (
        config[status || ''] || {
            label: status || 'Pendente',
            severity: 'info' as const,
            icon: 'pi pi-info-circle'
        }
    );
};


// =====================================================
// OPINION
// =====================================================

const getOpinionConfig = (
    opinion?: string | null
) => {

    if (!opinion) {

        return {
            label: 'Pendente',
            severity: 'warning' as const
        };

    }

    const config: Record<
        string,
        {
            label: string;
            severity:
                | 'success'
                | 'warning'
                | 'danger'
                | 'info';
        }
    > = {

        FAVORAVEL: {
            label: 'Favorável',
            severity: 'success'
        },

        FAVORAVEL_COM_RECOMENDACOES: {
            label: 'Favorável c/ recomendações',
            severity: 'warning'
        },

        DESFAVORAVEL: {
            label: 'Desfavorável',
            severity: 'danger'
        }

    };

    return (
        config[opinion] || {
            label: opinion,
            severity: 'info' as const
        }
    );
};


// =====================================================
// COMPONENT
// =====================================================

const StatusPreProjects = () => {

    const toast = useRef<Toast>(null);

    const [
        project,
        setProject
    ] = useState<PreProject2 | null>(null);

    const [
        loading,
        setLoading
    ] = useState(true);


    // =====================================================
    // LOAD
    // =====================================================

    const loadProject = async () => {

        try {

            setLoading(true);

            const data =
                await getMyPreProject();

            setProject(data);

        } catch (error: any) {

            console.error(
                'Erro ao carregar pré-projecto:',
                error
            );

            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail:
                    error?.response?.data?.message ||
                    error?.response?.data?.error ||
                    error?.message ||
                    'Não foi possível carregar o pré-projecto.',
                life: 5000
            });

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        loadProject();

    }, []);


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="grid">

                <Toast ref={toast} />

                <div className="col-12">

                    <Card>

                        <div
                            className="
                                flex
                                flex-column
                                align-items-center
                                justify-content-center
                                py-8
                            "
                        >

                            <ProgressSpinner />

                            <span className="text-600 mt-3">
                                A carregar o estado do pré-projecto...
                            </span>

                        </div>

                    </Card>

                </div>

            </div>

        );

    }


    // =====================================================
    // NO PROJECT
    // =====================================================

    if (!project) {

        return (

            <div className="grid">

                <Toast ref={toast} />

                <div className="col-12">

                    <Card>

                        <div
                            className="
                                flex
                                flex-column
                                align-items-center
                                justify-content-center
                                text-center
                                py-7
                            "
                        >

                            <i
                                className="
                                    pi
                                    pi-folder-open
                                    text-500
                                    text-5xl
                                    mb-4
                                "
                            />

                            <h3 className="text-900 mb-2">
                                Nenhum pré-projecto encontrado
                            </h3>

                            <p className="text-600 m-0 mb-4">
                                Ainda não existe um pré-projecto
                                associado à sua conta.
                            </p>

                            <Button
                                label="Actualizar"
                                icon="pi pi-refresh"
                                outlined
                                onClick={loadProject}
                            />

                        </div>

                    </Card>

                </div>

            </div>

        );

    }


    // =====================================================
    // STATUS
    // =====================================================

    const status =
        getStatusConfig(project.status);


    // =====================================================
    // EVALUATION SUMMARY
    // =====================================================

    const summary =
        project.evaluation_summary;

    const totalEvaluators =
        summary?.total_evaluators ||
        project.evaluators?.length ||
        0;

    const completedEvaluators =
        summary?.completed_evaluations ||
        project.evaluators?.filter(
            evaluator =>
                !!evaluator.submitted_at
        ).length ||
        0;

    const pendingEvaluators =
        summary?.pending_evaluations ??
        Math.max(
            totalEvaluators -
            completedEvaluators,
            0
        );

    const evaluationPercentage =
        totalEvaluators > 0
            ? Math.round(
                (
                    completedEvaluators /
                    totalEvaluators
                ) * 100
            )
            : 0;


    // =====================================================
    // FINAL DECISION
    // =====================================================

    const finalDecision =
        project.final_decision;

    const finalDecisionSeverity =
        finalDecision === 'APROVADO'
            ? 'success'
            : finalDecision === 'REPROVADO'
                ? 'danger'
                : 'warning';


    // =====================================================
    // DOCUMENT
    // =====================================================

    const documentUrl =
        getDocumentUrl(
            project.document_url
        );


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="grid">

            <Toast ref={toast} />


            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="col-12">

                <div
                    className="
                        flex
                        flex-column
                        md:flex-row
                        md:align-items-center
                        md:justify-content-between
                        gap-3
                    "
                >

                    <div>

                        <h2 className="text-900 font-semibold m-0">
                            Meu Pré-Projecto
                        </h2>

                        <p className="text-600 mt-2 mb-0">
                            Acompanhe o estado, avaliação e
                            decisão do seu pré-projecto.
                        </p>

                    </div>

                    <Button
                        label="Actualizar"
                        icon="pi pi-refresh"
                        outlined
                        onClick={loadProject}
                    />

                </div>

            </div>


            {/* =====================================================
                STATUS PRINCIPAL
            ===================================================== */}

            <div className="col-12">

                <Card>

                    <div
                        className="
                            flex
                            flex-column
                            md:flex-row
                            md:align-items-center
                            md:justify-content-between
                            gap-4
                        "
                    >

                        <div className="flex-1">

                            <div
                                className="
                                    flex
                                    align-items-center
                                    gap-2
                                    mb-3
                                "
                            >

                                <Tag
                                    value={status.label}
                                    severity={status.severity}
                                />

                                <Tag
                                    value={`Versão ${project.version}`}
                                    severity="info"
                                />

                            </div>


                            <h2 className="text-900 mt-0 mb-2">
                                {project.title}
                            </h2>


                            <div
                                className="
                                    flex
                                    flex-wrap
                                    gap-4
                                    text-600
                                "
                            >

                                <span>

                                    <i className="pi pi-calendar mr-2" />

                                    Submetido em:{' '}

                                    <strong className="text-900">

                                        {formatDate(
                                            project.submission_date ||
                                            project.created_at
                                        )}

                                    </strong>

                                </span>


                                <span>

                                    <i className="pi pi-bookmark mr-2" />

                                    Área:{' '}

                                    <strong className="text-900">
                                        {project.thematic_area}
                                    </strong>

                                </span>

                            </div>

                        </div>


                        <div
                            className="
                                flex
                                flex-column
                                align-items-center
                                justify-content-center
                                p-4
                                surface-100
                                border-round
                                min-w-15rem
                            "
                        >

                            <i
                                className={`
                                    ${status.icon}
                                    text-4xl
                                    mb-2
                                `}
                            />

                            <span className="text-600 text-sm">
                                Estado actual
                            </span>

                            <span className="text-900 font-semibold text-xl mt-1">
                                {status.label}
                            </span>

                        </div>

                    </div>

                </Card>

            </div>


            {/* =====================================================
                ESTATÍSTICAS
            ===================================================== */}

            <div className="col-12">

                <div className="grid">

                    {/* SUBMISSÃO */}

                    <div className="col-12 md:col-3">

                        <Card className="h-full">

                            <div
                                className="
                                    flex
                                    align-items-center
                                    justify-content-between
                                "
                            >

                                <div>

                                    <span className="text-600 block mb-2">
                                        Submissão
                                    </span>

                                    <span className="text-900 font-semibold">
                                        {formatDateOnly(
                                            project.submission_date ||
                                            project.created_at
                                        )}
                                    </span>

                                </div>

                                <i
                                    className="
                                        pi
                                        pi-send
                                        text-primary
                                        text-2xl
                                    "
                                />

                            </div>

                        </Card>

                    </div>


                    {/* AVALIAÇÕES */}

                    <div className="col-12 md:col-3">

                        <Card className="h-full">

                            <div
                                className="
                                    flex
                                    align-items-center
                                    justify-content-between
                                "
                            >

                                <div>

                                    <span className="text-600 block mb-2">
                                        Avaliações
                                    </span>

                                    <span className="text-900 text-2xl font-semibold">
                                        {completedEvaluators}
                                        /
                                        {totalEvaluators}
                                    </span>

                                </div>

                                <i
                                    className="
                                        pi
                                        pi-users
                                        text-orange-500
                                        text-2xl
                                    "
                                />

                            </div>

                        </Card>

                    </div>


                    {/* DECISÃO */}

                    <div className="col-12 md:col-3">

                        <Card className="h-full">

                            <div
                                className="
                                    flex
                                    align-items-center
                                    justify-content-between
                                "
                            >

                                <div>

                                    <span className="text-600 block mb-2">
                                        Decisão
                                    </span>

                                    <Tag
                                        value={
                                            finalDecision ||
                                            'Pendente'
                                        }
                                        severity={
                                            finalDecision
                                                ? finalDecisionSeverity
                                                : 'warning'
                                        }
                                    />

                                </div>

                                <i
                                    className="
                                        pi
                                        pi-check-circle
                                        text-green-500
                                        text-2xl
                                    "
                                />

                            </div>

                        </Card>

                    </div>


                    {/* ORIENTADOR */}

                    <div className="col-12 md:col-3">

                        <Card className="h-full">

                            <div
                                className="
                                    flex
                                    align-items-center
                                    justify-content-between
                                "
                            >

                                <div>

                                    <span className="text-600 block mb-2">
                                        Orientador
                                    </span>

                                    <span className="
                                        text-900
                                        font-semibold
                                        block
                                    ">
                                        {
                                            project.proposed_advisor_name ||
                                            'Não atribuído'
                                        }
                                    </span>

                                </div>

                                <i
                                    className="
                                        pi
                                        pi-user
                                        text-primary
                                        text-2xl
                                    "
                                />

                            </div>

                        </Card>

                    </div>

                </div>

            </div>


            {/* =====================================================
                PROGRESSO
            ===================================================== */}

            <div className="col-12">

                <Card>

                    <div
                        className="
                            flex
                            flex-column
                            md:flex-row
                            md:align-items-center
                            md:justify-content-between
                            gap-2
                            mb-3
                        "
                    >

                        <div>

                            <h4 className="text-900 mt-0 mb-1">
                                Progresso da avaliação
                            </h4>

                            <span className="text-600">

                                {completedEvaluators} de{' '}

                                {totalEvaluators}{' '}

                                avaliadores concluíram o parecer.

                            </span>

                        </div>

                        <span className="text-900 font-semibold">
                            {evaluationPercentage}%
                        </span>

                    </div>


                    <ProgressBar
                        value={evaluationPercentage}
                        showValue={false}
                        style={{
                            height: '10px'
                        }}
                    />


                    {totalEvaluators === 0 && (

                        <div
                            className="
                                flex
                                align-items-center
                                mt-3
                                text-orange-600
                            "
                        >

                            <i className="pi pi-info-circle mr-2" />

                            <span>
                                Ainda não existem avaliadores
                                atribuídos ao pré-projecto.
                            </span>

                        </div>

                    )}


                    {totalEvaluators > 0 &&
                        pendingEvaluators > 0 && (

                            <div
                                className="
                                    flex
                                    align-items-center
                                    mt-3
                                    text-orange-600
                                "
                            >

                                <i className="pi pi-clock mr-2" />

                                <span>
                                    Existem {pendingEvaluators}{' '}
                                    avaliações pendentes.
                                </span>

                            </div>

                        )}


                    {totalEvaluators > 0 &&
                        pendingEvaluators === 0 && (

                            <div
                                className="
                                    flex
                                    align-items-center
                                    mt-3
                                    text-green-600
                                "
                            >

                                <i className="pi pi-check-circle mr-2" />

                                <span>
                                    Todos os avaliadores já
                                    submeteram os seus pareceres.
                                </span>

                            </div>

                        )}

                </Card>

            </div>


            {/* =====================================================
                TABS
            ===================================================== */}

            <div className="col-12">

                <Card>

                    <TabView>


                        {/* =================================================
                            VISÃO GERAL
                        ================================================= */}

                        <TabPanel
                            header="Visão Geral"
                            leftIcon="pi pi-home mr-2"
                        >

                            <div className="grid">

                                <div className="col-12 md:col-8">

                                    <Card>

                                        <h4 className="text-900 mt-0">
                                            Informações do Pré-Projecto
                                        </h4>

                                        <Divider />

                                        <div className="grid">

                                            <div className="col-12 md:col-6">

                                                <span className="text-600 block mb-2">
                                                    Título
                                                </span>

                                                <span className="text-900 font-medium">
                                                    {project.title}
                                                </span>

                                            </div>


                                            <div className="col-12 md:col-6">

                                                <span className="text-600 block mb-2">
                                                    Área temática
                                                </span>

                                                <Tag
                                                    value={
                                                        project.thematic_area
                                                    }
                                                    severity="info"
                                                />

                                            </div>


                                            <div className="col-12 md:col-6">

                                                <span className="text-600 block mb-2">
                                                    Versão
                                                </span>

                                                <span className="text-900 font-medium">
                                                    {project.version}
                                                </span>

                                            </div>


                                            <div className="col-12 md:col-6">

                                                <span className="text-600 block mb-2">
                                                    Data de submissão
                                                </span>

                                                <span className="text-900 font-medium">
                                                    {
                                                        formatDate(
                                                            project.submission_date ||
                                                            project.created_at
                                                        )
                                                    }
                                                </span>

                                            </div>

                                        </div>

                                    </Card>

                                </div>


                                {/* ORIENTADOR */}

                                <div className="col-12 md:col-4">

                                    <Card className="h-full">

                                        <h4 className="text-900 mt-0">
                                            Orientador
                                        </h4>

                                        <Divider />

                                        <div
                                            className="
                                                flex
                                                align-items-center
                                                gap-3
                                            "
                                        >

                                            <div
                                                className="
                                                    flex
                                                    align-items-center
                                                    justify-content-center
                                                    border-circle
                                                    surface-100
                                                "
                                                style={{
                                                    width: '50px',
                                                    height: '50px'
                                                }}
                                            >

                                                <i
                                                    className="
                                                        pi
                                                        pi-user
                                                        text-primary
                                                        text-xl
                                                    "
                                                />

                                            </div>


                                            <div>

                                                <span
                                                    className="
                                                        text-900
                                                        font-semibold
                                                        block
                                                    "
                                                >
                                                    {
                                                        project.proposed_advisor_name ||
                                                        'Não atribuído'
                                                    }
                                                </span>

                                                <small className="text-600">
                                                    Supervisor / Orientador
                                                </small>

                                            </div>

                                        </div>

                                    </Card>

                                </div>


                                {/* RESULTADO */}

                                <div className="col-12">

                                    <Card>

                                        <h4 className="text-900 mt-0">
                                            Resultado final
                                        </h4>

                                        <Divider />

                                        {finalDecision ? (

                                            <div
                                                className="
                                                    flex
                                                    flex-column
                                                    align-items-center
                                                    text-center
                                                    py-4
                                                "
                                            >

                                                <i
                                                    className={`
                                                        ${
                                                            finalDecision ===
                                                            'APROVADO'
                                                                ? 'pi pi-check-circle text-green-500'
                                                                : finalDecision ===
                                                                    'REPROVADO'
                                                                    ? 'pi pi-times-circle text-red-500'
                                                                    : 'pi pi-exclamation-circle text-orange-500'
                                                        }
                                                        text-6xl
                                                        mb-3
                                                    `}
                                                />

                                                <h2 className="text-900 mt-0 mb-3">

                                                    {
                                                        finalDecision ===
                                                        'APROVADO'
                                                            ? 'Pré-projecto aprovado'
                                                            : finalDecision ===
                                                                'REPROVADO'
                                                                ? 'Pré-projecto reprovado'
                                                                : 'Pré-projecto em revisão'
                                                    }

                                                </h2>


                                                {project.decision_date && (

                                                    <span className="text-600">

                                                        Decisão registada em{' '}

                                                        <strong>
                                                            {
                                                                formatDate(
                                                                    project.decision_date
                                                                )
                                                            }
                                                        </strong>

                                                    </span>

                                                )}


                                                {project.decision_comments && (

                                                    <div
                                                        className="
                                                            surface-100
                                                            border-round
                                                            p-4
                                                            mt-4
                                                            w-full
                                                        "
                                                    >

                                                        <div
                                                            className="
                                                                flex
                                                                align-items-center
                                                                mb-2
                                                            "
                                                        >

                                                            <i className="pi pi-comments mr-2" />

                                                            <strong>
                                                                Observações da decisão
                                                            </strong>

                                                        </div>


                                                        <p
                                                            className="
                                                                text-700
                                                                line-height-3
                                                                white-space-pre-line
                                                                text-left
                                                                m-0
                                                            "
                                                        >
                                                            {
                                                                project.decision_comments
                                                            }
                                                        </p>

                                                    </div>

                                                )}

                                            </div>

                                        ) : (

                                            <div
                                                className="
                                                    flex
                                                    flex-column
                                                    align-items-center
                                                    text-center
                                                    py-5
                                                "
                                            >

                                                <i
                                                    className="
                                                        pi
                                                        pi-clock
                                                        text-orange-500
                                                        text-5xl
                                                        mb-3
                                                    "
                                                />

                                                <h3 className="text-900 mt-0">
                                                    Decisão pendente
                                                </h3>

                                                <p className="text-600 m-0">
                                                    A decisão final ainda
                                                    não foi registada.
                                                </p>

                                            </div>

                                        )}

                                    </Card>

                                </div>

                            </div>

                        </TabPanel>


                        {/* =================================================
                            AVALIAÇÕES
                        ================================================= */}

                        <TabPanel
                            header="Avaliações"
                            leftIcon="pi pi-users mr-2"
                        >

                            {project.evaluators?.length ? (

                                <div className="grid">

                                    {project.evaluators.map(
                                        (
                                            evaluator: PreProjectEvaluator,
                                            index
                                        ) => {

                                            const opinion =
                                                getOpinionConfig(
                                                    evaluator.opinion
                                                );

                                            const completed =
                                                !!evaluator.submitted_at;

                                            return (

                                                <div
                                                    className="col-12 md:col-6"
                                                    key={
                                                        evaluator.evaluator_assignment_id ||
                                                        index
                                                    }
                                                >

                                                    <Card>

                                                        <div
                                                            className="
                                                                flex
                                                                align-items-center
                                                                justify-content-between
                                                                gap-3
                                                            "
                                                        >

                                                            <div
                                                                className="
                                                                    flex
                                                                    align-items-center
                                                                    gap-3
                                                                "
                                                            >

                                                                <div
                                                                    className="
                                                                        flex
                                                                        align-items-center
                                                                        justify-content-center
                                                                        border-circle
                                                                        surface-100
                                                                    "
                                                                    style={{
                                                                        width: '45px',
                                                                        height: '45px'
                                                                    }}
                                                                >

                                                                    <i className="pi pi-user text-primary" />

                                                                </div>


                                                                <div>

                                                                    <span
                                                                        className="
                                                                            text-900
                                                                            font-semibold
                                                                            block
                                                                        "
                                                                    >
                                                                        {
                                                                            evaluator.evaluator_name ||
                                                                            `Avaliador ${index + 1}`
                                                                        }
                                                                    </span>

                                                                    <small className="text-600">

                                                                        {
                                                                            completed
                                                                                ? 'Avaliação concluída'
                                                                                : 'Avaliação pendente'
                                                                        }

                                                                    </small>

                                                                </div>

                                                            </div>


                                                            <Tag
                                                                value={
                                                                    completed
                                                                        ? 'Concluída'
                                                                        : 'Pendente'
                                                                }
                                                                severity={
                                                                    completed
                                                                        ? 'success'
                                                                        : 'warning'
                                                                }
                                                            />

                                                        </div>


                                                        <Divider />


                                                        <div className="grid">

                                                            <div className="col-12">

                                                                <span className="text-600 block mb-2">
                                                                    Parecer
                                                                </span>

                                                                <Tag
                                                                    value={
                                                                        opinion.label
                                                                    }
                                                                    severity={
                                                                        opinion.severity
                                                                    }
                                                                />

                                                            </div>


                                                            <div className="col-12 md:col-6">

                                                                <span className="text-600 block mb-2">
                                                                    Nota
                                                                </span>

                                                                <span className="text-900 font-semibold text-xl">

                                                                    {
                                                                        evaluator.score !==
                                                                            null &&
                                                                        evaluator.score !==
                                                                            undefined
                                                                            ? evaluator.score
                                                                            : '-'
                                                                    }

                                                                </span>

                                                            </div>


                                                            <div className="col-12 md:col-6">

                                                                <span className="text-600 block mb-2">
                                                                    Data
                                                                </span>

                                                                <span className="text-900">

                                                                    {
                                                                        evaluator.submitted_at
                                                                            ? formatDate(
                                                                                evaluator.submitted_at
                                                                            )
                                                                            : 'Pendente'
                                                                    }

                                                                </span>

                                                            </div>


                                                            <div className="col-12">

                                                                <span className="text-600 block mb-2">
                                                                    Observações
                                                                </span>

                                                                <div
                                                                    className="
                                                                        surface-100
                                                                        border-round
                                                                        p-3
                                                                    "
                                                                >

                                                                    <span
                                                                        className="
                                                                            text-700
                                                                            line-height-3
                                                                            white-space-pre-line
                                                                        "
                                                                    >
                                                                        {
                                                                            evaluator.observations ||
                                                                            'Nenhuma observação disponível.'
                                                                        }
                                                                    </span>

                                                                </div>

                                                            </div>

                                                        </div>

                                                    </Card>

                                                </div>

                                            );

                                        }
                                    )}

                                </div>

                            ) : (

                                <div
                                    className="
                                        surface-100
                                        border-round
                                        p-5
                                        text-center
                                    "
                                >

                                    <i
                                        className="
                                            pi
                                            pi-users
                                            text-500
                                            text-4xl
                                            mb-3
                                        "
                                    />

                                    <p className="text-600 m-0">
                                        Ainda não existem avaliadores
                                        atribuídos a este pré-projecto.
                                    </p>

                                </div>

                            )}

                        </TabPanel>


                        {/* =================================================
                            PRÉ-PROJECTO
                        ================================================= */}

                        <TabPanel
                            header="Pré-Projecto"
                            leftIcon="pi pi-file mr-2"
                        >

                            <div className="grid">

                                <div className="col-12">

                                    <Card>

                                        <h3 className="text-900 mt-0">
                                            {project.title}
                                        </h3>

                                        <div className="flex gap-2 flex-wrap mb-4">

                                            <Tag
                                                value={
                                                    project.thematic_area
                                                }
                                                severity="info"
                                            />

                                            <Tag
                                                value={
                                                    `Versão ${project.version}`
                                                }
                                                severity="info"
                                            />

                                            <Tag
                                                value={
                                                    status.label
                                                }
                                                severity={
                                                    status.severity
                                                }
                                            />

                                        </div>


                                        <Divider />


                                        <h5 className="text-900">
                                            Resumo
                                        </h5>

                                        <p
                                            className="
                                                text-700
                                                line-height-3
                                                white-space-pre-line
                                            "
                                        >
                                            {
                                                project.abstract ||
                                                'Nenhum resumo disponível.'
                                            }
                                        </p>


                                        <Divider />


                                        <div
                                            className="
                                                flex
                                                flex-column
                                                md:flex-row
                                                gap-2
                                            "
                                        >

                                            <Button
                                                label="Abrir documento"
                                                icon="pi pi-file-pdf"
                                                outlined
                                                disabled={!documentUrl}
                                                onClick={() => {

                                                    if (documentUrl) {

                                                        window.open(
                                                            documentUrl,
                                                            '_blank',
                                                            'noopener,noreferrer'
                                                        );

                                                    }

                                                }}
                                            />

                                        </div>

                                    </Card>

                                </div>

                            </div>

                        </TabPanel>


                        {/* =================================================
                            HISTÓRICO
                        ================================================= */}

                        <TabPanel
                            header="Histórico"
                            leftIcon="pi pi-history mr-2"
                        >

                            {
                                project.status_history?.length ? (

                                    <DataTable
                                        value={
                                            project.status_history
                                        }
                                        responsiveLayout="scroll"
                                        stripedRows
                                        emptyMessage="Nenhum histórico disponível."
                                    >

                                        <Column
                                            field="previous_status"
                                            header="Estado anterior"
                                            body={(
                                                row: StatusHistory
                                            ) => {

                                                if (!row.previous_status) {
                                                    return '-';
                                                }

                                                const config =
                                                    getStatusConfig(
                                                        row.previous_status
                                                    );

                                                return (
                                                    <Tag
                                                        value={
                                                            config.label
                                                        }
                                                        severity={
                                                            config.severity
                                                        }
                                                    />
                                                );

                                            }}
                                        />


                                        <Column
                                            field="new_status"
                                            header="Novo estado"
                                            body={(
                                                row: StatusHistory
                                            ) => {

                                                const config =
                                                    getStatusConfig(
                                                        row.new_status
                                                    );

                                                return (
                                                    <Tag
                                                        value={
                                                            config.label
                                                        }
                                                        severity={
                                                            config.severity
                                                        }
                                                    />
                                                );

                                            }}
                                        />


                                        <Column
                                            field="changed_by_name"
                                            header="Alterado por"
                                            body={(
                                                row: StatusHistory
                                            ) =>
                                                row.changed_by_name || '-'
                                            }
                                        />


                                        <Column
                                            field="comments"
                                            header="Observações"
                                            body={(
                                                row: StatusHistory
                                            ) =>
                                                row.comments || '-'
                                            }
                                        />


                                        <Column
                                            field="created_at"
                                            header="Data"
                                            body={(
                                                row: StatusHistory
                                            ) =>
                                                formatDate(
                                                    row.created_at
                                                )
                                            }
                                        />

                                    </DataTable>

                                ) : (

                                    <div
                                        className="
                                            surface-100
                                            border-round
                                            p-5
                                            text-center
                                            text-600
                                        "
                                    >

                                        <i
                                            className="
                                                pi
                                                pi-history
                                                mr-2
                                            "
                                        />

                                        Nenhum histórico disponível.

                                    </div>

                                )
                            }

                        </TabPanel>

                    </TabView>

                </Card>

            </div>

        </div>
    );
};

export default StatusPreProjects;