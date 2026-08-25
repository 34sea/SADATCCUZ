'use client';

import React, { useEffect, useRef, useState } from 'react';

import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { Toast } from 'primereact/toast';
import { MultiSelect } from 'primereact/multiselect';
import { TabView, TabPanel } from 'primereact/tabview';
import { ProgressSpinner } from 'primereact/progressspinner';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

import {
    getPreProjects,
    getPreProjectById,
    assignEvaluators,
    finalizeDecision,
    PreProject
} from '@/app/api/pre-projects/preProjectService';

import {
    getUsers,
    User
} from '@/app/api/users/userService';


// =====================================================
// TYPES
// =====================================================

interface EvaluatorOption {
    label: string;
    value: number;
}

type FinalDecision =
    | 'APROVADO'
    | 'REPROVADO'
    | 'EM_REVISAO';


// =====================================================
// STATUS OPTIONS
// =====================================================

const statusOptions = [
    {
        label: 'Todos',
        value: null
    },
    {
        label: 'Submetido',
        value: 'SUBMETIDO'
    },
    {
        label: 'Em atribuição de avaliadores',
        value: 'EM_ATRIBUICAO_AVALIADORES'
    },
    {
        label: 'Em avaliação',
        value: 'EM_AVALIACAO'
    },
    {
        label: 'Aprovado',
        value: 'APROVADO'
    },
    {
        label: 'Reprovado',
        value: 'REPROVADO'
    },
    {
        label: 'Em revisão',
        value: 'EM_REVISAO'
    },
    {
        label: 'Resubmetido',
        value: 'RESUBMETIDO'
    }
];


// =====================================================
// COMPONENT
// =====================================================

const ManagePreProject = () => {

    const toast = useRef<Toast>(null);


    // =====================================================
    // DATA
    // =====================================================

    const [projects, setProjects] =
        useState<PreProject[]>([]);

    const [loading, setLoading] =
        useState(false);


    // =====================================================
    // FILTERS
    // =====================================================

    const [search, setSearch] =
        useState('');

    const [selectedStatus, setSelectedStatus] =
        useState<string | null>(null);


    // =====================================================
    // DETAILS
    // =====================================================

    const [selectedProject, setSelectedProject] =
        useState<PreProject | null>(null);

    const [detailsVisible, setDetailsVisible] =
        useState(false);

    const [loadingDetails, setLoadingDetails] =
        useState(false);


    // =====================================================
    // EVALUATORS
    // =====================================================

    const [evaluators, setEvaluators] =
        useState<User[]>([]);

    const [selectedEvaluators, setSelectedEvaluators] =
        useState<number[]>([]);

    const [loadingEvaluators, setLoadingEvaluators] =
        useState(false);

    const [assigning, setAssigning] =
        useState(false);


    // =====================================================
    // DECISION
    // =====================================================

  const [decision, setDecision] =
    useState<FinalDecision | null>(null);
    const [decisionComments, setDecisionComments] =
        useState('');

    const [finalizing, setFinalizing] =
        useState(false);


    // =====================================================
    // LOAD PROJECTS
    // =====================================================

    const loadProjects = async () => {

        try {

            setLoading(true);

            const data =
                await getPreProjects(
                    selectedStatus
                        ? {
                            status: selectedStatus
                        }
                        : undefined
                );

            setProjects(data);

        } catch (error: any) {

            console.error(
                'Erro ao carregar pré-projectos:',
                error
            );

            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail:
                    error?.response?.data?.message ||
                    error?.response?.data?.error ||
                    error?.message ||
                    'Erro ao carregar os pré-projectos.',
                life: 5000
            });

        } finally {

            setLoading(false);

        }
    };


    // =====================================================
    // LOAD EVALUATORS
    // =====================================================

    const loadEvaluators = async () => {

        try {

            setLoadingEvaluators(true);

            const users =
                await getUsers({
                    role: 'AVALIADOR_PRE_PROJECTO',
                    is_active: true
                });

            setEvaluators(users);

        } catch (error: any) {

            console.error(
                'Erro ao carregar avaliadores:',
                error
            );

            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail:
                    error?.response?.data?.message ||
                    error?.response?.data?.error ||
                    'Não foi possível carregar os avaliadores.',
                life: 5000
            });

        } finally {

            setLoadingEvaluators(false);

        }
    };


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        loadProjects();
        loadEvaluators();

    }, []);


    // =====================================================
    // RELOAD STATUS
    // =====================================================

    useEffect(() => {

        loadProjects();

    }, [selectedStatus]);


    // =====================================================
    // EVALUATOR OPTIONS
    // =====================================================

    const evaluatorOptions: EvaluatorOption[] =
        evaluators.map((user) => ({
            label:
                `${user.name}${user.email ? ` (${user.email})` : ''}`,
            value: user.id
        }));


    // =====================================================
    // SEARCH
    // =====================================================

    const filteredProjects =
        projects.filter((project) => {

            const value =
                search.toLowerCase().trim();

            if (!value) {
                return true;
            }

            return (

                project.title
                    ?.toLowerCase()
                    .includes(value) ||

                project.student_name
                    ?.toLowerCase()
                    .includes(value) ||

                project.student_email
                    ?.toLowerCase()
                    .includes(value) ||

                project.thematic_area
                    ?.toLowerCase()
                    .includes(value)

            );

        });


    // =====================================================
    // OPEN DETAILS
    // =====================================================

    const openDetails = async (
        project: PreProject
    ) => {

        try {

            setDetailsVisible(true);

            setLoadingDetails(true);

            setSelectedProject(null);

            setDecision(null);

            setDecisionComments('');

            const data =
                await getPreProjectById(
                    project.id
                );

            setSelectedProject(data);

            const assignedIds =
                data.evaluators?.map(
                    evaluator =>
                        evaluator.evaluator_id
                ) || [];

            setSelectedEvaluators(
                assignedIds
            );

        } catch (error: any) {

            console.error(
                'Erro ao carregar detalhes:',
                error
            );

            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail:
                    error?.response?.data?.message ||
                    error?.response?.data?.error ||
                    error?.message ||
                    'Não foi possível carregar os detalhes.',
                life: 5000
            });

            setDetailsVisible(false);

        } finally {

            setLoadingDetails(false);

        }
    };


    // =====================================================
    // ASSIGN EVALUATORS
    // =====================================================

    const handleAssignEvaluators = async () => {

        if (!selectedProject) {
            return;
        }

        if (selectedEvaluators.length === 0) {

            toast.current?.show({
                severity: 'warn',
                summary: 'Avaliadores',
                detail:
                    'Seleccione pelo menos um avaliador.',
                life: 4000
            });

            return;
        }

        try {

            setAssigning(true);

            await assignEvaluators(
                selectedProject.id,
                selectedEvaluators
            );

            toast.current?.show({
                severity: 'success',
                summary: 'Avaliadores atribuídos',
                detail:
                    'Os avaliadores foram atribuídos com sucesso.',
                life: 4000
            });

            const updated =
                await getPreProjectById(
                    selectedProject.id
                );

            setSelectedProject(updated);

            const assignedIds =
                updated.evaluators?.map(
                    evaluator =>
                        evaluator.evaluator_id
                ) || [];

            setSelectedEvaluators(
                assignedIds
            );

            await loadProjects();

        } catch (error: any) {

            console.error(
                'Erro ao atribuir avaliadores:',
                error
            );

            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail:
                    error?.response?.data?.message ||
                    error?.response?.data?.error ||
                    error?.message ||
                    'Erro ao atribuir avaliadores.',
                life: 5000
            });

        } finally {

            setAssigning(false);

        }
    };


    // =====================================================
    // FINAL DECISION
    // =====================================================

    const handleFinalizeDecision = () => {

        if (!selectedProject) {
            return;
        }

        if (!decision) {

            toast.current?.show({
                severity: 'warn',
                summary: 'Decisão',
                detail:
                    'Seleccione uma decisão.',
                life: 4000
            });

            return;
        }

        confirmDialog({

            message:
                `Tem certeza que deseja registar a decisão "${decision}" para este pré-projecto?`,

            header: 'Confirmar decisão',

            icon: 'pi pi-exclamation-triangle',

            acceptLabel: 'Sim, confirmar',

            rejectLabel: 'Cancelar',

            acceptClassName:
                decision === 'APROVADO'
                    ? 'p-button-success'
                    : decision === 'REPROVADO'
                        ? 'p-button-danger'
                        : 'p-button-warning',

            accept: async () => {

                try {

                    setFinalizing(true);

                    await finalizeDecision(
                        selectedProject.id,
                        {
                            final_decision:
                                decision,

                            comments:
                                decisionComments.trim() ||
                                undefined
                        }
                    );

                    toast.current?.show({
                        severity: 'success',
                        summary: 'Decisão registada',
                        detail:
                            `O pré-projecto foi marcado como ${decision}.`,
                        life: 5000
                    });

                    const updated =
                        await getPreProjectById(
                            selectedProject.id
                        );

                    setSelectedProject(
                        updated
                    );

                    await loadProjects();

                    setDecision(null);

                    setDecisionComments('');

                } catch (error: any) {

                    console.error(
                        'Erro ao registar decisão:',
                        error
                    );

                    toast.current?.show({
                        severity: 'error',
                        summary: 'Erro',
                        detail:
                            error?.response?.data?.message ||
                            error?.response?.data?.error ||
                            error?.message ||
                            'Erro ao registar a decisão.',
                        life: 5000
                    });

                } finally {

                    setFinalizing(false);

                }

            }

        });

    };


    // =====================================================
    // STATUS TEMPLATE
    // =====================================================

    const statusTemplate = (rowData: PreProject) => {

    const config: Record<
        string,
        {
            label: string;
            severity:
                | 'success'
                | 'info'
                | 'warning'
                | 'danger';
        }
    > = {

        SUBMETIDO: {
            label: 'Submetido',
            severity: 'info'
        },

        EM_AVALIACAO: {
            label: 'Em avaliação',
            severity: 'warning'
        },

        APROVADO: {
            label: 'Aprovado',
            severity: 'success'
        },

        REPROVADO: {
            label: 'Reprovado',
            severity: 'danger'
        },

        EM_REVISAO: {
            label: 'Em revisão',
            severity: 'warning'
        },

        RESUBMETIDO: {
            label: 'Resubmetido',
            severity: 'info'
        }
    };

    const current = config[rowData.status];

    if (!current) {
        return (
            <Tag
                value={rowData.status || 'Desconhecido'}
                severity="info"
            />
        );
    }

    return (
        <Tag
            value={current.label}
            severity={current.severity}
        />
    );
};


    // =====================================================
    // ACTION TEMPLATE
    // =====================================================

    const actionTemplate = (
        rowData: PreProject
    ) => {

        return (
            <Button
                icon="pi pi-eye"
                rounded
                outlined
                tooltip="Ver detalhes"
                onClick={() =>
                    openDetails(rowData)
                }
            />
        );
    };


    // =====================================================
    // EVALUATORS COUNT
    // =====================================================

    const evaluatorsTemplate = (
        rowData: PreProject
    ) => {

        const count =
            rowData.evaluators?.length || 0;

        return (
            <Tag
                value={
                    `${count} avaliador${count !== 1 ? 'es' : ''}`
                }
                severity={
                    count > 0
                        ? 'success'
                        : 'warning'
                }
            />
        );
    };


    // =====================================================
    // DATE
    // =====================================================

    const dateTemplate = (
        rowData: PreProject
    ) => {

        if (!rowData.updated_at) {
            return '-';
        }

        return new Date(
            rowData.updated_at
        ).toLocaleString('pt-PT');
    };


    // =====================================================
    // DECISION OPTIONS
    // =====================================================

   const decisionOptions: {
    label: string;
    value: FinalDecision;
}[] = [
    {
        label: 'Aprovado',
        value: 'APROVADO'
    },
    {
        label: 'Reprovado',
        value: 'REPROVADO'
    },
    {
        label: 'Em revisão',
        value: 'EM_REVISAO'
    }
];


    // =====================================================
    // OPINION TEMPLATE
    // =====================================================

    const opinionTemplate = (
        opinion?: string | null
    ) => {

        if (!opinion) {

            return (
                <Tag
                    value="Pendente"
                    severity="warning"
                />
            );

        }

        const config: Record<
            string,
            {
                label: string;
                severity:
                'success' |
                'warning' |
                'danger' |
                'info';
            }
        > = {

            FAVORAVEL: {
                label: 'Favorável',
                severity: 'success'
            },

            FAVORAVEL_COM_RECOMENDACOES: {
                label:
                    'Favorável c/ recomendações',
                severity: 'warning'
            },

            DESFAVORAVEL: {
                label: 'Desfavorável',
                severity: 'danger'
            }

        };

        const item =
            config[opinion];

        return (
            <Tag
                value={
                    item?.label ||
                    opinion
                }
                severity={
                    item?.severity ||
                    'info'
                }
            />
        );
    };


    // =====================================================
    // FOOTER
    // =====================================================

    const dialogFooter = (

        <div>

            <Button
                label="Fechar"
                icon="pi pi-times"
                outlined
                onClick={() =>
                    setDetailsVisible(false)
                }
            />

        </div>

    );


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="grid">

            <Toast ref={toast} />

            <ConfirmDialog />


            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="col-12">

                <div className="
                    flex
                    flex-column
                    md:flex-row
                    md:align-items-center
                    md:justify-content-between
                    gap-3
                ">

                    <div>

                        <h3 className="
                            text-900
                            font-semibold
                            m-0
                        ">
                            Gestão de Pré-Projectos
                        </h3>

                        <p className="
                            text-600
                            mt-2
                            mb-0
                        ">
                            Gerencie submissões, avaliadores,
                            pareceres e decisões dos
                            pré-projectos.
                        </p>

                    </div>

                    <Button
                        label="Actualizar"
                        icon="pi pi-refresh"
                        outlined
                        loading={loading}
                        onClick={loadProjects}
                    />

                </div>

            </div>


            {/* =====================================================
                STATISTICS
            ===================================================== */}

            <div className="col-12">

                <div className="grid">

                    <div className="col-12 md:col-3">

                        <Card>

                            <div className="
                                flex
                                align-items-center
                                justify-content-between
                            ">

                                <div>

                                    <span className="
                                        text-600
                                        block
                                        mb-2
                                    ">
                                        Total
                                    </span>

                                    <span className="
                                        text-900
                                        text-2xl
                                        font-semibold
                                    ">
                                        {
                                            projects.length
                                        }
                                    </span>

                                </div>

                                <i className="
                                    pi
                                    pi-folder
                                    text-primary
                                    text-2xl
                                " />

                            </div>

                        </Card>

                    </div>


                    <div className="col-12 md:col-3">

                        <Card>

                            <div className="
                                flex
                                align-items-center
                                justify-content-between
                            ">

                                <div>

                                    <span className="
                                        text-600
                                        block
                                        mb-2
                                    ">
                                        Em avaliação
                                    </span>

                                    <span className="
                                        text-900
                                        text-2xl
                                        font-semibold
                                    ">
                                        {
                                            projects.filter(
                                                p =>
                                                    p.status ===
                                                    'EM_AVALIACAO'
                                            ).length
                                        }
                                    </span>

                                </div>

                                <i className="
                                    pi
                                    pi-search
                                    text-orange-500
                                    text-2xl
                                " />

                            </div>

                        </Card>

                    </div>


                    <div className="col-12 md:col-3">

                        <Card>

                            <div className="
                                flex
                                align-items-center
                                justify-content-between
                            ">

                                <div>

                                    <span className="
                                        text-600
                                        block
                                        mb-2
                                    ">
                                        Aprovados
                                    </span>

                                    <span className="
                                        text-900
                                        text-2xl
                                        font-semibold
                                    ">
                                        {
                                            projects.filter(
                                                p =>
                                                    p.status ===
                                                    'APROVADO'
                                            ).length
                                        }
                                    </span>

                                </div>

                                <i className="
                                    pi
                                    pi-check-circle
                                    text-green-500
                                    text-2xl
                                " />

                            </div>

                        </Card>

                    </div>


                    <div className="col-12 md:col-3">

                        <Card>

                            <div className="
                                flex
                                align-items-center
                                justify-content-between
                            ">

                                <div>

                                    <span className="
                                        text-600
                                        block
                                        mb-2
                                    ">
                                        Em revisão
                                    </span>

                                    <span className="
                                        text-900
                                        text-2xl
                                        font-semibold
                                    ">
                                        {
                                            projects.filter(
                                                p =>
                                                    p.status ===
                                                    'EM_REVISAO'
                                            ).length
                                        }
                                    </span>

                                </div>

                                <i className="
                                    pi
                                    pi-exclamation-circle
                                    text-orange-500
                                    text-2xl
                                " />

                            </div>

                        </Card>

                    </div>

                </div>

            </div>


            {/* =====================================================
                TABLE
            ===================================================== */}

            <div className="col-12">

                <Card>

                    <div className="
                        flex
                        flex-column
                        md:flex-row
                        gap-3
                        mb-4
                    ">

                        <span className="p-input-icon-left flex-1">

                            <i className="pi pi-search" />

                            <InputText
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                placeholder="
                                    Pesquisar por título,
                                    estudante ou área...
                                "
                                className="w-full"
                            />

                        </span>


                        <Dropdown
                            value={selectedStatus}
                            options={statusOptions}
                            onChange={(e) =>
                                setSelectedStatus(
                                    e.value
                                )
                            }
                            placeholder="Filtrar por estado"
                            className="md:w-20rem"
                            showClear
                            optionLabel="label"
                            optionValue="value"
                        />

                    </div>


                    <DataTable
                        value={filteredProjects}
                        loading={loading}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[
                            10,
                            25,
                            50
                        ]}
                        responsiveLayout="scroll"
                        emptyMessage="
                            Nenhum pré-projecto encontrado.
                        "
                        stripedRows
                    >

                        <Column
                            field="id"
                            header="#"
                            sortable
                            style={{
                                width: '5rem'
                            }}
                        />


                        <Column
                            field="title"
                            header="Pré-Projecto"
                            sortable
                            style={{
                                minWidth: '20rem'
                            }}
                        />


                        <Column
                            field="student_name"
                            header="Estudante"
                            sortable
                            style={{
                                minWidth: '15rem'
                            }}
                            body={(row: PreProject) =>
                                row.student_name || '-'
                            }
                        />


                        <Column
                            field="thematic_area"
                            header="Área"
                            sortable
                        />


                        <Column
                            field="proposed_advisor_name"
                            header="Orientador"
                            body={(row: PreProject) =>
                                row.proposed_advisor_name ||
                                'Não atribuído'
                            }
                        />


                        <Column
                            header="Avaliadores"
                            body={evaluatorsTemplate}
                        />


                        <Column
                            field="status"
                            header="Estado"
                            body={statusTemplate}
                        />


                        <Column
                            header="Actualizado"
                            body={dateTemplate}
                        />


                        <Column
                            header="Acções"
                            body={actionTemplate}
                            style={{
                                width: '6rem'
                            }}
                        />

                    </DataTable>

                </Card>

            </div>


            {/* =====================================================
                DETAILS
            ===================================================== */}

            <Dialog
                header={
                    selectedProject
                        ? `Pré-Projecto #${selectedProject.id}`
                        : 'Detalhes'
                }
                visible={detailsVisible}
                style={{
                    width: '90vw',
                    maxWidth: '1200px'
                }}
                modal
                maximizable
                onHide={() =>
                    setDetailsVisible(false)
                }
                footer={dialogFooter}
            >

                {loadingDetails ? (

                    <div className="
                        flex
                        justify-content-center
                        align-items-center
                        py-6
                    ">

                        <ProgressSpinner />

                    </div>

                ) : selectedProject ? (

                    <TabView>


                        {/* =====================================================
                            INFORMAÇÕES
                        ===================================================== */}

                        <TabPanel
                            header="Informações"
                            leftIcon="pi pi-info-circle mr-2"
                        >

                            <div className="grid">

                                <div className="col-12">

                                    <h4 className="
                                        text-900
                                        mt-0
                                    ">
                                        {
                                            selectedProject.title
                                        }
                                    </h4>

                                    <div className="
                                        flex
                                        gap-2
                                        flex-wrap
                                    ">

                                        {statusTemplate(
                                            selectedProject
                                        )}

                                        <Tag
                                            value={
                                                `Versão ${selectedProject.version}`
                                            }
                                            severity="info"
                                        />

                                    </div>

                                </div>


                                <div className="
                                    col-12
                                    md:col-6
                                ">

                                    <Card>

                                        <h5>
                                            Estudante
                                        </h5>

                                        <p className="
                                            text-900
                                            font-medium
                                        ">
                                            {
                                                selectedProject.student_name ||
                                                '-'
                                            }
                                        </p>

                                        <small className="
                                            text-600
                                        ">
                                            {
                                                selectedProject.student_email ||
                                                '-'
                                            }
                                        </small>

                                    </Card>

                                </div>


                                <div className="
                                    col-12
                                    md:col-6
                                ">

                                    <Card>

                                        <h5>
                                            Orientador Proposto
                                        </h5>

                                        <p className="
                                            text-900
                                            font-medium
                                        ">
                                            {
                                                selectedProject
                                                    .proposed_advisor_name ||
                                                'Não atribuído'
                                            }
                                        </p>

                                    </Card>

                                </div>


                                <div className="col-12">

                                    <Card>

                                        <h5>
                                            Área Temática
                                        </h5>

                                        <Tag
                                            value={
                                                selectedProject
                                                    .thematic_area
                                            }
                                            severity="info"
                                        />

                                    </Card>

                                </div>


                                <div className="col-12">

                                    <Card>

                                        <h5>
                                            Resumo
                                        </h5>

                                        <p className="
                                            text-700
                                            line-height-3
                                            white-space-pre-line
                                        ">
                                            {
                                                selectedProject.abstract
                                            }
                                        </p>

                                    </Card>

                                </div>


                                <div className="col-12">

                                    <Button
                                        label="Abrir documento"
                                        icon="pi pi-file-pdf"
                                        outlined
                                        disabled={
                                            !selectedProject.document_url
                                        }
                                        onClick={() => {

                                            if (
                                                selectedProject.document_url
                                            ) {

                                                window.open(
                                                    selectedProject.document_url,
                                                    '_blank'
                                                );

                                            }

                                        }}
                                    />

                                </div>

                            </div>

                        </TabPanel>


                        {/* =====================================================
                            AVALIADORES
                        ===================================================== */}

                        <TabPanel
                            header="Avaliadores"
                            leftIcon="pi pi-users mr-2"
                        >

                            <div className="grid">

                                <div className="col-12">

                                    <Card>

                                        <h5 className="mt-0">
                                            Atribuir avaliadores
                                        </h5>

                                        <p className="
                                            text-600
                                        ">
                                            Seleccione os utilizadores
                                            responsáveis pela avaliação
                                            deste pré-projecto.
                                        </p>


                                        <MultiSelect
                                            value={
                                                selectedEvaluators
                                            }
                                            options={
                                                evaluatorOptions
                                            }
                                            onChange={(e) =>
                                                setSelectedEvaluators(
                                                    e.value
                                                )
                                            }
                                            placeholder={
                                                loadingEvaluators
                                                    ? 'A carregar avaliadores...'
                                                    : 'Seleccione avaliadores'
                                            }
                                            className="w-full"
                                            filter
                                            display="chip"
                                            optionLabel="label"
                                            optionValue="value"
                                            disabled={
                                                assigning ||
                                                loadingEvaluators
                                            }
                                            emptyMessage="
                                                Nenhum avaliador encontrado.
                                            "
                                            emptyFilterMessage="
                                                Nenhum avaliador encontrado.
                                            "
                                        />


                                        <div className="
                                            flex
                                            justify-content-end
                                            mt-3
                                        ">

                                            <Button
                                                label="Atribuir avaliadores"
                                                icon="pi pi-users"
                                                loading={
                                                    assigning
                                                }
                                                disabled={
                                                    assigning ||
                                                    loadingEvaluators
                                                }
                                                onClick={
                                                    handleAssignEvaluators
                                                }
                                            />

                                        </div>

                                    </Card>

                                </div>


                                <div className="col-12">

                                    <h5>
                                        Avaliadores atribuídos
                                    </h5>


                                    {selectedProject.evaluators &&
                                        selectedProject.evaluators.length >
                                        0 ? (

                                        <DataTable
                                            value={
                                                selectedProject.evaluators
                                            }
                                            responsiveLayout="scroll"
                                            stripedRows
                                        >

                                            <Column
                                                field="evaluator_name"
                                                header="Avaliador"
                                            />

                                            <Column
                                                field="assigned_by_name"
                                                header="Atribuído por"
                                            />

                                            <Column
                                                header="Parecer"
                                                body={(row) =>
                                                    opinionTemplate(
                                                        row.opinion
                                                    )
                                                }
                                            />

                                            <Column
                                                field="score"
                                                header="Nota"
                                                body={(row) =>
                                                    row.score ??
                                                    '-'
                                                }
                                            />

                                            <Column
                                                field="submitted_at"
                                                header="Data"
                                                body={(row) =>
                                                    row.submitted_at
                                                        ? new Date(
                                                            row.submitted_at
                                                        ).toLocaleString(
                                                            'pt-PT'
                                                        )
                                                        : 'Pendente'
                                                }
                                            />

                                        </DataTable>

                                    ) : (

                                        <div className="
                                            surface-100
                                            border-round
                                            p-4
                                            text-600
                                        ">

                                            <i className="
                                                pi
                                                pi-info-circle
                                                mr-2
                                            " />

                                            Ainda não existem
                                            avaliadores atribuídos.

                                        </div>

                                    )}

                                </div>

                            </div>

                        </TabPanel>


                        {/* =====================================================
                            PARECERES
                        ===================================================== */}

                        <TabPanel
                            header="Pareceres"
                            leftIcon="pi pi-comments mr-2"
                        >

                            {selectedProject.evaluators?.length ? (

                                <div className="grid">

                                    {selectedProject.evaluators.map(
                                        (evaluator) => (

                                            <div
                                                className="col-12"
                                                key={
                                                    evaluator
                                                        .evaluator_assignment_id
                                                }
                                            >

                                                <Card>

                                                    <div className="
                                                        flex
                                                        flex-column
                                                        md:flex-row
                                                        md:justify-content-between
                                                        gap-3
                                                    ">

                                                        <div>

                                                            <h5 className="m-0">

                                                                {
                                                                    evaluator.evaluator_name
                                                                }

                                                            </h5>

                                                            <small className="
                                                                text-600
                                                            ">

                                                                {
                                                                    evaluator.submitted_at

                                                                        ? `Submetido em ${new Date(
                                                                            evaluator.submitted_at
                                                                        ).toLocaleString(
                                                                            'pt-PT'
                                                                        )}`

                                                                        : 'Parecer ainda não submetido'
                                                                }

                                                            </small>

                                                        </div>


                                                        <div className="
                                                            flex
                                                            align-items-center
                                                            gap-2
                                                        ">

                                                            {
                                                                opinionTemplate(
                                                                    evaluator.opinion
                                                                )
                                                            }


                                                            {
                                                                evaluator.score !==
                                                                null &&
                                                                evaluator.score !==
                                                                undefined && (

                                                                    <Tag
                                                                        value={
                                                                            `Nota: ${evaluator.score}`
                                                                        }
                                                                        severity="info"
                                                                    />

                                                                )
                                                            }

                                                        </div>

                                                    </div>


                                                    <Divider />


                                                    <div>

                                                        <h6>
                                                            Observações
                                                        </h6>

                                                        <p className="
                                                            text-700
                                                            line-height-3
                                                            white-space-pre-line
                                                        ">

                                                            {
                                                                evaluator.observations ||
                                                                'Sem observações.'
                                                            }

                                                        </p>

                                                    </div>

                                                </Card>

                                            </div>

                                        )
                                    )}

                                </div>

                            ) : (

                                <div className="
                                    surface-100
                                    p-5
                                    border-round
                                    text-center
                                    text-600
                                ">

                                    Nenhum avaliador foi atribuído.

                                </div>

                            )}

                        </TabPanel>


                        {/* =====================================================
                            DECISÃO
                        ===================================================== */}

                        <TabPanel
                            header="Decisão"
                            leftIcon="pi pi-check-circle mr-2"
                        >

                            <Card>

                                <h5 className="mt-0">
                                    Homologação
                                </h5>

                                <p className="
                                    text-600
                                ">
                                    Registe a decisão final do
                                    Coordenador sobre este pré-projecto.
                                </p>


                                <div className="grid">

                                    <div className="
                                        col-12
                                        md:col-6
                                    ">

                                        <label className="
                                            block
                                            text-900
                                            font-medium
                                            mb-2
                                        ">
                                            Decisão
                                        </label>


                                        <Dropdown
                                            value={decision}
                                            options={
                                                decisionOptions
                                            }
                                            onChange={(e) =>
                                                setDecision(
                                                    e.value
                                                )
                                            }
                                            placeholder="
                                                Seleccione a decisão
                                            "
                                            className="w-full"
                                            optionLabel="label"
                                            optionValue="value"
                                            disabled={
                                                finalizing
                                            }
                                        />

                                    </div>


                                    <div className="col-12">

                                        <label className="
                                            block
                                            text-900
                                            font-medium
                                            mb-2
                                        ">
                                            Comentários
                                        </label>


                                        <textarea
                                            value={
                                                decisionComments
                                            }
                                            onChange={(e) =>
                                                setDecisionComments(
                                                    e.target.value
                                                )
                                            }
                                            className="
                                                p-inputtextarea
                                                p-inputtext
                                                w-full
                                            "
                                            rows={5}
                                            placeholder="
                                                Adicione comentários
                                                sobre a decisão...
                                            "
                                            disabled={
                                                finalizing
                                            }
                                        />

                                    </div>


                                    <div className="
                                        col-12
                                        flex
                                        justify-content-end
                                    ">

                                        <Button
                                            label="Registar decisão"
                                            icon="pi pi-check"
                                            loading={
                                                finalizing
                                            }
                                            disabled={
                                                !decision ||
                                                finalizing
                                            }
                                            onClick={
                                                handleFinalizeDecision
                                            }
                                        />

                                    </div>

                                </div>

                            </Card>


                            {
                                selectedProject.final_decision && (

                                    <Card className="mt-4">

                                        <h5>
                                            Decisão actual
                                        </h5>

                                        <Tag
                                            value={
                                                selectedProject
                                                    .final_decision
                                            }
                                            severity={
                                                selectedProject
                                                    .final_decision ===
                                                    'APROVADO'

                                                    ? 'success'

                                                    : selectedProject
                                                        .final_decision ===
                                                        'REPROVADO'

                                                        ? 'danger'

                                                        : 'warning'
                                            }
                                        />

                                    </Card>

                                )
                            }

                        </TabPanel>


                        {/* =====================================================
                            HISTÓRICO
                        ===================================================== */}

                        <TabPanel
                            header="Histórico"
                            leftIcon="pi pi-history mr-2"
                        >

                            {
                                selectedProject.status_history?.length ? (

                                    <DataTable
                                        value={
                                            selectedProject.status_history
                                        }
                                        responsiveLayout="scroll"
                                        stripedRows
                                    >

                                        <Column
                                            field="previous_status"
                                            header="Estado anterior"
                                            body={(row) =>
                                                row.previous_status ||
                                                '-'
                                            }
                                        />

                                        <Column
                                            field="new_status"
                                            header="Novo estado"
                                            body={(row) => (

                                                <Tag
                                                    value={
                                                        row.new_status
                                                    }
                                                    severity="info"
                                                />

                                            )}
                                        />

                                        <Column
                                            field="changed_by_name"
                                            header="Alterado por"
                                        />

                                        <Column
                                            field="comments"
                                            header="Comentários"
                                            body={(row) =>
                                                row.comments ||
                                                '-'
                                            }
                                        />

                                        <Column
                                            field="created_at"
                                            header="Data"
                                            body={(row) =>
                                                new Date(
                                                    row.created_at
                                                ).toLocaleString(
                                                    'pt-PT'
                                                )
                                            }
                                        />

                                    </DataTable>

                                ) : (

                                    <div className="
                                        surface-100
                                        p-5
                                        border-round
                                        text-center
                                        text-600
                                    ">

                                        Nenhum histórico disponível.

                                    </div>

                                )
                            }

                        </TabPanel>

                    </TabView>

                ) : null}

            </Dialog>

        </div>
    );
};

export default ManagePreProject;