'use client';

import React, {
    useEffect,
    useMemo,
    useRef,
    useState
} from 'react';

import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { ProgressBar } from 'primereact/progressbar';
import { Tag } from 'primereact/tag';
import { Timeline } from 'primereact/timeline';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Dialog } from 'primereact/dialog';

import {
    GuidanceNotebook,
    GuidanceTask,
    getMyNotebooks,
    getNotebookById
} from '@/app/api/notebooks/guidanceNotebookService';


// =====================================================
// HELPERS
// =====================================================

const formatDate = (
    date?: string | null
) => {

    if (!date) {
        return '-';
    }

    return new Date(date).toLocaleDateString(
        'pt-PT',
        {
            dateStyle: 'medium'
        }
    );
};


const formatDateShort = (
    date?: string | null
) => {

    if (!date) {
        return '-';
    }

    return new Date(date).toLocaleDateString(
        'pt-PT'
    );
};


// =====================================================
// TASK STATUS
// =====================================================

const getTaskStatus = (
    status?: string
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
        }
    > = {

        PENDENTE: {
            label: 'Pendente',
            severity: 'warning'
        },

        EM_PROGRESSO: {
            label: 'Em progresso',
            severity: 'info'
        },

        ENTREGUE: {
            label: 'Entregue',
            severity: 'success'
        },

        CONCLUIDA: {
            label: 'Concluída',
            severity: 'success'
        }
    };

    return (
        config[status || ''] || {
            label: status || 'Desconhecido',
            severity: 'info' as const
        }
    );
};


// =====================================================
// SESSION TOPIC STATUS
// =====================================================

const getSessionStatus = (
    status?: string
) => {

    switch (status) {

        case 'CUMPRIDO':
        case 'CONCLUIDO':
        case 'CONCLUÍDO':
            return {
                label: 'Concluído',
                severity: 'success' as const,
                icon: 'pi pi-check'
            };

        case 'CUMPRIDO_PARCIALMENTE':
        case 'EM_PROGRESSO':
            return {
                label: 'Em progresso',
                severity: 'warning' as const,
                icon: 'pi pi-clock'
            };

        case 'NAO_CUMPRIDO':
            return {
                label: 'Não concluído',
                severity: 'danger' as const,
                icon: 'pi pi-times'
            };

        default:
            return {
                label: status || 'Registado',
                severity: 'info' as const,
                icon: 'pi pi-info-circle'
            };
    }
};


// =====================================================
// COMPONENT
// =====================================================

const OrientationDashboard = () => {

    const toast = useRef<Toast>(null);


    // =====================================================
    // STATE
    // =====================================================

    const [
        notebook,
        setNotebook
    ] = useState<GuidanceNotebook | null>(null);

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        selectedSession,
        setSelectedSession
    ] = useState<any | null>(null);

    const [
        sessionDialog,
        setSessionDialog
    ] = useState(false);


    // =====================================================
    // LOAD NOTEBOOK
    // =====================================================

    const loadNotebook = async () => {

        try {

            setLoading(true);

            const notebooks =
                await getMyNotebooks();

            if (!notebooks || notebooks.length === 0) {

                setNotebook(null);

                return;
            }

            /*
             * O aluno normalmente terá apenas
             * um caderno activo.
             */

            const currentNotebook =
                notebooks[0];

            /*
             * Buscar detalhes completos.
             * Isto garante sessões, tarefas,
             * declarações e verificações.
             */

            const details =
                await getNotebookById(
                    currentNotebook.id
                );

            setNotebook(details);

        } catch (error: any) {

            console.error(error);

            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail:
                    error?.response?.data?.message ||
                    error?.message ||
                    'Não foi possível carregar o caderno.',
                life: 5000
            });

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        loadNotebook();

    }, []);


    // =====================================================
    // DATA
    // =====================================================

    const tasks =
        notebook?.tasks || [];

    const sessions =
        notebook?.sessions || [];

    const declarations =
        notebook?.declarations || [];

    const verifications =
        notebook?.department_verifications || [];


    // =====================================================
    // TASK STATISTICS
    // =====================================================

    const completedTasks =
        tasks.filter(
            task =>
                task.status === 'CONCLUIDA'
        ).length;

    const pendingTasks =
        tasks.filter(
            task =>
                task.status === 'PENDENTE'
        ).length;

    const inProgressTasks =
        tasks.filter(
            task =>
                task.status === 'EM_PROGRESSO'
        ).length;

    const taskProgress =
        tasks.length > 0
            ? Math.round(
                (
                    completedTasks /
                    tasks.length
                ) * 100
            )
            : 0;


    // =====================================================
    // NEXT TASK
    // =====================================================

    const nextTask =
        useMemo(() => {

            const pending =
                tasks
                    .filter(
                        task =>
                            task.status === 'PENDENTE' ||
                            task.status === 'EM_PROGRESSO'
                    )
                    .sort(
                        (a, b) => {

                            if (
                                !a.deadline
                            ) {
                                return 1;
                            }

                            if (
                                !b.deadline
                            ) {
                                return -1;
                            }

                            return new Date(
                                a.deadline
                            ).getTime()
                                -
                                new Date(
                                    b.deadline
                                ).getTime();
                        }
                    );

            return pending[0] || null;

        }, [tasks]);


    // =====================================================
    // LAST SESSION
    // =====================================================

    const lastSession =
        useMemo(() => {

            if (!sessions.length) {
                return null;
            }

            return [
                ...sessions
            ].sort(
                (a, b) =>
                    new Date(
                        b.session_date
                    ).getTime()
                    -
                    new Date(
                        a.session_date
                    ).getTime()
            )[0];

        }, [sessions]);


    // =====================================================
    // INDICATORS
    // =====================================================

    /*
     * Caso o backend retorne avaliações
     * dentro das sessões.
     */

    const allEvaluations =
        sessions.flatMap(
            (session: any) =>
                session.evaluations || []
        );

    const totalIndicators =
        allEvaluations.length;

    const completedIndicators =
        allEvaluations.filter(
            (evaluation: any) =>
                evaluation.status === 'CUMPRIDO'
        ).length;

    const indicatorProgress =
        totalIndicators > 0
            ? Math.round(
                (
                    completedIndicators /
                    totalIndicators
                ) * 100
            )
            : 0;


    // =====================================================
    // GENERAL PROGRESS
    // =====================================================

    const generalProgress =
        tasks.length > 0
            ? taskProgress
            : indicatorProgress;


    // =====================================================
    // OPEN SESSION
    // =====================================================

    const openSession = (
        session: any
    ) => {

        setSelectedSession(
            session
        );

        setSessionDialog(
            true
        );
    };


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
                                A carregar o seu caderno...
                            </span>

                        </div>

                    </Card>

                </div>

            </div>
        );
    }


    // =====================================================
    // NO NOTEBOOK
    // =====================================================

    if (!notebook) {

        return (

            <div className="grid">

                <Toast ref={toast} />

                <div className="col-12">

                    <Card>

                        <div className="text-center py-8">

                            <i
                                className="
                                    pi
                                    pi-book
                                    text-500
                                    text-5xl
                                    mb-3
                                "
                            />

                            <h3 className="text-900">
                                Caderno de orientação
                            </h3>

                            <p className="text-600">
                                Ainda não existe um caderno de
                                orientação associado à sua conta.
                            </p>

                        </div>

                    </Card>

                </div>

            </div>
        );
    }


    // =====================================================
    // MAIN
    // =====================================================

    return (

        <div className="grid">

            <Toast ref={toast} />


            {/* =================================================
                HEADER
            ================================================= */}

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

                        <h3 className="
                            text-900
                            font-semibold
                            m-0
                        ">
                            Painel do Caderno de Orientação
                        </h3>

                        <p className="
                            text-600
                            mt-2
                            mb-0
                        ">
                            Acompanhe o progresso do seu Trabalho
                            de Culminação de Curso.
                        </p>

                    </div>

                    <div className="
                        flex
                        align-items-center
                        gap-2
                    ">

                        <Tag
                            value={
                                notebook.pre_project_status ||
                                'Em acompanhamento'
                            }
                            severity="info"
                        />

                        <Button
                            icon="pi pi-refresh"
                            outlined
                            rounded
                            tooltip="Actualizar"
                            onClick={
                                loadNotebook
                            }
                        />

                    </div>

                </div>

            </div>


            {/* =================================================
                STUDENT / PROJECT
            ================================================= */}

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

                        <div>

                            <span className="
                                text-500
                                block
                                mb-2
                            ">
                                Meu pré-projecto
                            </span>

                            <h3 className="
                                text-900
                                mt-0
                                mb-2
                            ">
                                {
                                    notebook.pre_project_title ||
                                    'Pré-projecto'
                                }
                            </h3>

                            <div className="
                                flex
                                flex-wrap
                                gap-2
                            ">

                                <Tag
                                    value={
                                        notebook.pre_project_thematic_area ||
                                        'Área temática'
                                    }
                                    severity="info"
                                />

                            </div>

                        </div>


                        <div>

                            <span className="
                                text-500
                                block
                                mb-2
                            ">
                                Orientador
                            </span>

                            <div className="
                                flex
                                align-items-center
                                gap-2
                            ">

                                <i className="
                                    pi
                                    pi-user
                                    text-primary
                                " />

                                <span className="
                                    text-900
                                    font-medium
                                ">
                                    {
                                        notebook.advisor_name ||
                                        'Orientador'
                                    }
                                </span>

                            </div>

                        </div>

                    </div>

                </Card>

            </div>


            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <div className="col-12 lg:col-6 xl:col-3">

                <div className="card mb-0">

                    <div className="
                        flex
                        justify-content-between
                        mb-3
                    ">

                        <div>

                            <span className="
                                block
                                text-500
                                font-medium
                                mb-3
                            ">
                                Progresso
                            </span>

                            <div className="
                                text-900
                                font-medium
                                text-2xl
                            ">
                                {generalProgress}%
                            </div>

                        </div>

                        <div className="
                            flex
                            align-items-center
                            justify-content-center
                            bg-blue-100
                            border-round
                        "
                            style={{
                                width: '2.5rem',
                                height: '2.5rem'
                            }}
                        >

                            <i className="
                                pi
                                pi-chart-line
                                text-blue-500
                                text-xl
                            " />

                        </div>

                    </div>

                    <ProgressBar
                        value={generalProgress}
                        showValue={false}
                        style={{
                            height: '6px'
                        }}
                    />

                </div>

            </div>


            <div className="col-12 lg:col-6 xl:col-3">

                <div className="card mb-0">

                    <div className="
                        flex
                        justify-content-between
                        mb-3
                    ">

                        <div>

                            <span className="
                                block
                                text-500
                                font-medium
                                mb-3
                            ">
                                Sessões realizadas
                            </span>

                            <div className="
                                text-900
                                font-medium
                                text-2xl
                            ">
                                {sessions.length}
                            </div>

                        </div>

                        <div className="
                            flex
                            align-items-center
                            justify-content-center
                            bg-green-100
                            border-round
                        "
                            style={{
                                width: '2.5rem',
                                height: '2.5rem'
                            }}
                        >

                            <i className="
                                pi
                                pi-calendar-check
                                text-green-500
                                text-xl
                            " />

                        </div>

                    </div>

                    <span className="text-500">
                        Encontros presenciais registados
                    </span>

                </div>

            </div>


            <div className="col-12 lg:col-6 xl:col-3">

                <div className="card mb-0">

                    <div className="
                        flex
                        justify-content-between
                        mb-3
                    ">

                        <div>

                            <span className="
                                block
                                text-500
                                font-medium
                                mb-3
                            ">
                                Tarefas pendentes
                            </span>

                            <div className="
                                text-900
                                font-medium
                                text-2xl
                            ">
                                {pendingTasks}
                            </div>

                        </div>

                        <div className="
                            flex
                            align-items-center
                            justify-content-center
                            bg-orange-100
                            border-round
                        "
                            style={{
                                width: '2.5rem',
                                height: '2.5rem'
                            }}
                        >

                            <i className="
                                pi
                                pi-list-check
                                text-orange-500
                                text-xl
                            " />

                        </div>

                    </div>

                    <span className="text-orange-500">
                        {inProgressTasks} em progresso
                    </span>

                </div>

            </div>


            <div className="col-12 lg:col-6 xl:col-3">

                <div className="card mb-0">

                    <div className="
                        flex
                        justify-content-between
                        mb-3
                    ">

                        <div>

                            <span className="
                                block
                                text-500
                                font-medium
                                mb-3
                            ">
                                Indicadores
                            </span>

                            <div className="
                                text-900
                                font-medium
                                text-2xl
                            ">
                                {completedIndicators} / {totalIndicators}
                            </div>

                        </div>

                        <div className="
                            flex
                            align-items-center
                            justify-content-center
                            bg-purple-100
                            border-round
                        "
                            style={{
                                width: '2.5rem',
                                height: '2.5rem'
                            }}
                        >

                            <i className="
                                pi
                                pi-check-square
                                text-purple-500
                                text-xl
                            " />

                        </div>

                    </div>

                    <span className="text-500">
                        Indicadores acompanhados
                    </span>

                </div>

            </div>


            {/* =================================================
                PROGRESS + NEXT TASK
            ================================================= */}

            <div className="col-12 lg:col-8">

                <Card>

                    <div className="
                        flex
                        justify-content-between
                        align-items-center
                    ">

                        <div>

                            <h5 className="
                                text-900
                                m-0
                            ">
                                Progresso do Caderno
                            </h5>

                            <small className="text-500">
                                Acompanhamento das actividades
                                da orientação
                            </small>

                        </div>

                        <span className="
                            text-primary
                            font-medium
                        ">
                            {generalProgress}%
                        </span>

                    </div>

                    <Divider />

                    <div className="mb-4">

                        <div className="
                            flex
                            justify-content-between
                            mb-2
                        ">

                            <span className="text-900 font-medium">
                                Tarefas atribuídas
                            </span>

                            <span className="text-500">
                                {completedTasks} / {tasks.length}
                            </span>

                        </div>

                        <ProgressBar
                            value={taskProgress}
                            showValue={false}
                            style={{
                                height: '7px'
                            }}
                        />

                    </div>


                    <div>

                        <div className="
                            flex
                            justify-content-between
                            mb-2
                        ">

                            <span className="text-900 font-medium">
                                Indicadores cumpridos
                            </span>

                            <span className="text-500">
                                {
                                    completedIndicators
                                } / {
                                    totalIndicators
                                }
                            </span>

                        </div>

                        <ProgressBar
                            value={indicatorProgress}
                            showValue={false}
                            style={{
                                height: '7px'
                            }}
                        />

                    </div>

                </Card>

            </div>


            {/* =================================================
                NEXT TASK
            ================================================= */}

            <div className="col-12 lg:col-4">

                <Card>

                    <h5 className="
                        text-900
                        m-0
                    ">
                        Próxima tarefa
                    </h5>

                    <Divider />

                    {nextTask ? (

                        <div className="
                            surface-50
                            border-round
                            p-3
                        ">

                            <div className="
                                flex
                                align-items-center
                                gap-2
                                mb-3
                            ">

                                <div className="
                                    flex
                                    align-items-center
                                    justify-content-center
                                    bg-orange-100
                                    border-circle
                                "
                                    style={{
                                        width: '2.5rem',
                                        height: '2.5rem'
                                    }}
                                >

                                    <i className="
                                        pi
                                        pi-clock
                                        text-orange-500
                                    " />

                                </div>

                                <Tag
                                    value={
                                        getTaskStatus(
                                            nextTask.status
                                        ).label
                                    }
                                    severity={
                                        getTaskStatus(
                                            nextTask.status
                                        ).severity
                                    }
                                />

                            </div>

                            <h6 className="
                                text-900
                                mb-2
                            ">
                                {nextTask.title}
                            </h6>

                            <p className="
                                text-600
                                line-height-3
                                mb-3
                            ">
                                {
                                    nextTask.description ||
                                    'Sem descrição.'
                                }
                            </p>

                            <div className="
                                flex
                                align-items-center
                                gap-2
                                text-500
                            ">

                                <i className="pi pi-calendar" />

                                <span>
                                    Prazo: {
                                        formatDateShort(
                                            nextTask.deadline
                                        )
                                    }
                                </span>

                            </div>

                        </div>

                    ) : (

                        <div className="
                            surface-50
                            border-round
                            p-4
                            text-center
                        ">

                            <i className="
                                pi
                                pi-check-circle
                                text-green-500
                                text-3xl
                                mb-3
                            " />

                            <p className="
                                text-600
                                m-0
                            ">
                                Não existem tarefas pendentes.
                            </p>

                        </div>

                    )}

                </Card>

            </div>


            {/* =================================================
                LAST SESSION
            ================================================= */}

            <div className="col-12 lg:col-4">

                <Card>

                    <h5 className="
                        text-900
                        m-0
                    ">
                        Última sessão
                    </h5>

                    <Divider />

                    {lastSession ? (

                        <div>

                            <div className="
                                flex
                                align-items-center
                                gap-3
                            ">

                                <div className="
                                    flex
                                    align-items-center
                                    justify-content-center
                                    bg-green-100
                                    border-circle
                                "
                                    style={{
                                        width: '2.8rem',
                                        height: '2.8rem'
                                    }}
                                >

                                    <i className="
                                        pi
                                        pi-calendar-check
                                        text-green-500
                                    " />

                                </div>

                                <div>

                                    <span className="
                                        block
                                        text-900
                                        font-medium
                                    ">
                                        Sessão de orientação
                                    </span>

                                    <span className="
                                        block
                                        text-500
                                        text-sm
                                        mt-1
                                    ">
                                        {
                                            formatDate(
                                                lastSession.session_date
                                            )
                                        }
                                    </span>

                                </div>

                            </div>

                            <p className="
                                text-600
                                line-height-3
                            ">
                                {
                                    lastSession.advisor_notes ||
                                    'Não foram registadas observações.'
                                }
                            </p>

                            <Button
                                label="Ver sessão"
                                icon="pi pi-eye"
                                text
                                className="p-0"
                                onClick={() =>
                                    openSession(
                                        lastSession
                                    )
                                }
                            />

                        </div>

                    ) : (

                        <p className="text-600">
                            Ainda não existem sessões registadas.
                        </p>

                    )}

                </Card>

            </div>


            {/* =================================================
                VERIFICATIONS
            ================================================= */}

            <div className="col-12 lg:col-8">

                <Card>

                    <div className="
                        flex
                        align-items-center
                        justify-content-between
                    ">

                        <div>

                            <h5 className="
                                text-900
                                m-0
                            ">
                                Verificação do Caderno
                            </h5>

                            <small className="text-500">
                                Estado das verificações departamentais
                            </small>

                        </div>

                        <i className="
                            pi
                            pi-verified
                            text-primary
                            text-2xl
                        " />

                    </div>

                    <Divider />

                    <div className="grid">

                        {[
                            'INTERMEDIA',
                            'FINAL'
                        ].map(type => {

                            const verification =
                                verifications.find(
                                    (item: any) =>
                                        item.verification_type ===
                                        type
                                );

                            return (

                                <div
                                    key={type}
                                    className="
                                        col-12
                                        md:col-6
                                    "
                                >

                                    <div className="
                                        surface-50
                                        border-round
                                        p-3
                                    ">

                                        <div className="
                                            flex
                                            justify-content-between
                                            align-items-center
                                            gap-2
                                        ">

                                            <span className="
                                                text-900
                                                font-medium
                                            ">
                                                {
                                                    type ===
                                                    'INTERMEDIA'
                                                        ? 'Verificação Intermédia'
                                                        : 'Verificação Final'
                                                }
                                            </span>

                                            <Tag
                                                value={
                                                    verification?.status ||
                                                    'Pendente'
                                                }
                                                severity={
                                                    verification?.status ===
                                                    'APROVADO'
                                                        ? 'success'
                                                        : 'warning'
                                                }
                                            />

                                        </div>

                                        {verification?.created_at && (

                                            <span className="
                                                block
                                                text-500
                                                text-sm
                                                mt-2
                                            ">
                                                Realizada em {
                                                    formatDate(
                                                        verification.created_at
                                                    )
                                                }
                                            </span>

                                        )}

                                        {verification?.comments && (

                                            <p className="
                                                text-600
                                                text-sm
                                                line-height-3
                                                mb-0
                                                mt-2
                                            ">
                                                {
                                                    verification.comments
                                                }
                                            </p>

                                        )}

                                    </div>

                                </div>

                            );

                        })}

                    </div>

                </Card>

            </div>


            {/* =================================================
                ALL SESSIONS
            ================================================= */}

            <div className="col-12">

                <Card>

                    <div className="
                        flex
                        align-items-center
                        justify-content-between
                    ">

                        <div>

                            <h5 className="
                                text-900
                                m-0
                            ">
                                Histórico de Orientações
                            </h5>

                            <small className="text-500">
                                Registo dos encontros realizados
                                com o orientador
                            </small>

                        </div>

                        <Tag
                            value={`${sessions.length} sessões`}
                            severity="info"
                        />

                    </div>

                    <Divider />

                    {sessions.length > 0 ? (

                        <Timeline
                            value={[
                                ...sessions
                            ].sort(
                                (a, b) =>
                                    new Date(
                                        b.session_date
                                    ).getTime()
                                    -
                                    new Date(
                                        a.session_date
                                    ).getTime()
                            )}
                            align="left"
                            className="customized-timeline"
                            marker={(item: any) => (

                                <span
                                    className="
                                        flex
                                        align-items-center
                                        justify-content-center
                                        border-circle
                                        bg-green-100
                                    "
                                    style={{
                                        width: '2rem',
                                        height: '2rem'
                                    }}
                                >

                                    <i className="
                                        pi
                                        pi-calendar-check
                                        text-green-500
                                    " />

                                </span>

                            )}
                            content={(item: any) => (

                                <div className="
                                    pb-4
                                ">

                                    <div className="
                                        flex
                                        flex-wrap
                                        align-items-center
                                        gap-2
                                        mb-2
                                    ">

                                        <span className="
                                            font-medium
                                            text-900
                                        ">
                                            Sessão de orientação
                                        </span>

                                        <Tag
                                            value={
                                                formatDate(
                                                    item.session_date
                                                )
                                            }
                                            severity="info"
                                        />

                                    </div>

                                    <p className="
                                        text-600
                                        line-height-3
                                        mt-0
                                        mb-3
                                    ">
                                        {
                                            item.advisor_notes ||
                                            'Sem observações registadas.'
                                        }
                                    </p>

                                    <Button
                                        label="Ver assuntos discutidos"
                                        icon="pi pi-eye"
                                        text
                                        className="p-0"
                                        onClick={() =>
                                            openSession(
                                                item
                                            )
                                        }
                                    />

                                </div>

                            )}
                        />

                    ) : (

                        <div className="
                            surface-100
                            border-round
                            p-5
                            text-center
                        ">

                            <i className="
                                pi
                                pi-calendar
                                text-500
                                text-4xl
                                mb-3
                            " />

                            <p className="
                                text-600
                                m-0
                            ">
                                Ainda não existem sessões de orientação.
                            </p>

                        </div>

                    )}

                </Card>

            </div>


            {/* =================================================
                SESSION DETAILS DIALOG
            ================================================= */}

            <Dialog
                header="Detalhes da Sessão de Orientação"
                visible={sessionDialog}
                style={{
                    width: '700px'
                }}
                modal
                onHide={() =>
                    setSessionDialog(false)
                }
            >

                {selectedSession && (

                    <div>

                        {/* DATE */}

                        <div className="
                            flex
                            align-items-center
                            gap-3
                            mb-4
                        ">

                            <div className="
                                flex
                                align-items-center
                                justify-content-center
                                bg-primary-100
                                border-circle
                            "
                                style={{
                                    width: '3rem',
                                    height: '3rem'
                                }}
                            >

                                <i className="
                                    pi
                                    pi-calendar
                                    text-primary
                                    text-xl
                                " />

                            </div>

                            <div>

                                <span className="
                                    block
                                    text-500
                                    text-sm
                                ">
                                    Data do encontro
                                </span>

                                <strong className="text-900">
                                    {
                                        formatDate(
                                            selectedSession.session_date
                                        )
                                    }
                                </strong>

                            </div>

                        </div>


                        {/* ADVISOR NOTES */}

                        <div className="mb-4">

                            <h5 className="
                                text-900
                                mt-0
                            ">
                                Observações do orientador
                            </h5>

                            <div className="
                                surface-50
                                border-round
                                p-3
                            ">

                                <span className="
                                    text-600
                                    line-height-3
                                ">
                                    {
                                        selectedSession.advisor_notes ||
                                        'Sem observações.'
                                    }
                                </span>

                            </div>

                        </div>


                        {/* TOPICS */}

                        <div>

                            <div className="
                                flex
                                justify-content-between
                                align-items-center
                                mb-3
                            ">

                                <h5 className="
                                    text-900
                                    m-0
                                ">
                                    Assuntos discutidos
                                </h5>

                                <Tag
                                    value={
                                        `${
                                            (
                                                selectedSession.evaluations ||
                                                []
                                            ).length
                                        } tópicos`
                                    }
                                    severity="info"
                                />

                            </div>


                            {
                                selectedSession.evaluations?.length ? (

                                    <div className="flex flex-column gap-3">

                                        {
                                            selectedSession.evaluations.map(
                                                (
                                                    evaluation: any,
                                                    index: number
                                                ) => {

                                                    const status =
                                                        getSessionStatus(
                                                            evaluation.status
                                                        );

                                                    /*
                                                     * Dependendo do backend,
                                                     * o nome pode estar em:
                                                     *
                                                     * indicator_name
                                                     * title
                                                     * description
                                                     */

                                                    const topic =
                                                        evaluation.indicator_name ||
                                                        evaluation.title ||
                                                        evaluation.description ||
                                                        `Indicador ${index + 1}`;

                                                    return (

                                                        <div
                                                            key={
                                                                evaluation.id ||
                                                                index
                                                            }
                                                            className="
                                                                surface-50
                                                                border-round
                                                                p-3
                                                            "
                                                        >

                                                            <div className="
                                                                flex
                                                                justify-content-between
                                                                align-items-start
                                                                gap-3
                                                            ">

                                                                <div className="
                                                                    flex
                                                                    gap-3
                                                                ">

                                                                    <div className="
                                                                        flex
                                                                        align-items-center
                                                                        justify-content-center
                                                                        border-circle
                                                                        bg-white
                                                                    "
                                                                        style={{
                                                                            width: '2.3rem',
                                                                            height: '2.3rem'
                                                                        }}
                                                                    >

                                                                        <i
                                                                            className={`${status.icon} text-primary`}
                                                                        />

                                                                    </div>

                                                                    <div>

                                                                        <span className="
                                                                            block
                                                                            text-900
                                                                            font-medium
                                                                        ">
                                                                            {topic}
                                                                        </span>

                                                                        {
                                                                            evaluation.observations && (

                                                                                <span className="
                                                                                    block
                                                                                    text-600
                                                                                    text-sm
                                                                                    line-height-3
                                                                                    mt-1
                                                                                ">
                                                                                    {
                                                                                        evaluation.observations
                                                                                    }
                                                                                </span>

                                                                            )
                                                                        }

                                                                    </div>

                                                                </div>

                                                                <Tag
                                                                    value={
                                                                        status.label
                                                                    }
                                                                    severity={
                                                                        status.severity
                                                                    }
                                                                />

                                                            </div>

                                                        </div>

                                                    );

                                                }
                                            )
                                        }

                                    </div>

                                ) : (

                                    <div className="
                                        surface-100
                                        border-round
                                        p-4
                                        text-center
                                    ">

                                        <span className="text-600">
                                            Não foram registados indicadores
                                            específicos nesta sessão.
                                        </span>

                                    </div>

                                )
                            }

                        </div>

                    </div>

                )}

            </Dialog>

        </div>
    );
};

export default OrientationDashboard;