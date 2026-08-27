'use client';

import React, { useEffect, useState } from 'react';

import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { ProgressBar } from 'primereact/progressbar';
import { Tag } from 'primereact/tag';
import { Timeline } from 'primereact/timeline';
import { Button } from 'primereact/button';
import { Skeleton } from 'primereact/skeleton';
import { GuidanceNotebook2, GuidanceTask, GuidanceSession2, getMyStudentNotebook } from '@/app/api/notebooks/guidanceNotebookService';

// import {
//     GuidanceNotebook,
//     GuidanceTask,
//     GuidanceSession2,
//     getMyStudentNotebook
// } from '@/service/guidanceService';

const StudentOrientationDashboard = () => {

    const [notebook, setNotebook] =
        useState<GuidanceNotebook2 | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);


    // =====================================================
    // CARREGAR CADERNO DO ALUNO
    // =====================================================

    useEffect(() => {

        const loadNotebook = async () => {

            try {

                setLoading(true);

                const data = await getMyStudentNotebook();

                setNotebook(data);

            } catch (err: any) {

                console.error(
                    'Erro ao carregar caderno:',
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    'Não foi possível carregar o caderno de orientação.'
                );

            } finally {

                setLoading(false);

            }
        };

        loadNotebook();

    }, []);


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div className="grid">

                <div className="col-12">
                    <Skeleton height="100px" />
                </div>

                <div className="col-12 md:col-6 xl:col-3">
                    <Skeleton height="130px" />
                </div>

                <div className="col-12 md:col-6 xl:col-3">
                    <Skeleton height="130px" />
                </div>

                <div className="col-12 md:col-6 xl:col-3">
                    <Skeleton height="130px" />
                </div>

                <div className="col-12 md:col-6 xl:col-3">
                    <Skeleton height="130px" />
                </div>

                <div className="col-12 lg:col-8">
                    <Skeleton height="400px" />
                </div>

                <div className="col-12 lg:col-4">
                    <Skeleton height="400px" />
                </div>

            </div>
        );
    }


    // =====================================================
    // ERRO
    // =====================================================

    if (error) {

        return (
            <Card>

                <div className="flex flex-column align-items-center justify-content-center py-6">

                    <i
                        className="pi pi-exclamation-circle text-red-500"
                        style={{ fontSize: '3rem' }}
                    />

                    <h4 className="text-900 mt-3">
                        Não foi possível carregar o caderno
                    </h4>

                    <p className="text-600">
                        {error}
                    </p>

                    <Button
                        label="Tentar novamente"
                        icon="pi pi-refresh"
                        onClick={() => window.location.reload()}
                    />

                </div>

            </Card>
        );
    }


    if (!notebook) {
        return null;
    }


    // =====================================================
    // DADOS
    // =====================================================

    const tasks = notebook.tasks || [];

    const sessions = notebook.sessions || [];

    const progress = notebook.progress;

    const taskProgress =
        progress?.tasks?.percentage ?? 0;

    const overallProgress =
        progress?.overall ?? 0;

    const totalTasks =
        progress?.tasks?.total ?? tasks.length;

    const completedTasks =
        progress?.tasks?.completed ??
        tasks.filter(
            task => task.status === 'CONCLUIDA'
        ).length;

    const pendingTasks =
        progress?.tasks?.pending ??
        tasks.filter(
            task => task.status === 'PENDENTE'
        ).length;

    const inProgressTasks =
        progress?.tasks?.in_progress ??
        tasks.filter(
            task => task.status === 'EM_PROGRESSO'
        ).length;


    // =====================================================
    // STATUS
    // =====================================================

    const getTaskSeverity = (
        status: GuidanceTask['status']
    ) => {

        switch (status) {

            case 'CONCLUIDA':
                return 'success';

            case 'EM_PROGRESSO':
                return 'info';

            case 'ENTREGUE':
                return 'warning';

            case 'PENDENTE':
            default:
                return 'warning';
        }
    };


    const getTaskLabel = (
        status: GuidanceTask['status']
    ) => {

        switch (status) {

            case 'CONCLUIDA':
                return 'Concluída';

            case 'EM_PROGRESSO':
                return 'Em progresso';

            case 'ENTREGUE':
                return 'Entregue';

            case 'PENDENTE':
                return 'Pendente';

            default:
                return status;
        }
    };


    const formatDate = (date?: string | null) => {

        if (!date) {
            return '-';
        }

        return new Date(date).toLocaleDateString(
            'pt-PT',
            {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }
        );
    };


    // =====================================================
    // TIMELINE
    // =====================================================

    const timelineTemplate = (
        item: GuidanceSession2
    ) => {

        return (

            <div className="flex flex-column">

                <div className="flex align-items-center gap-2 mb-2">

                    <span className="font-medium text-900">
                        Sessão de Orientação
                    </span>

                    <Tag
                        value="Realizada"
                        severity="success"
                    />

                </div>

                <span className="text-500 text-sm mb-2">

                    {formatDate(item.session_date)}

                </span>

                <span className="text-600 line-height-3">

                    {item.advisor_notes ||
                        'Sem observações registadas.'}

                </span>

            </div>

        );
    };


    const timelineMarker = () => {

        return (

            <span
                className="flex align-items-center justify-content-center border-circle bg-green-100"
                style={{
                    width: '2rem',
                    height: '2rem'
                }}
            >

                <i className="pi pi-check text-green-500" />

            </span>

        );
    };


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="grid">

            {/* ================================================= */}
            {/* CABEÇALHO */}
            {/* ================================================= */}

            <div className="col-12">

                <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-3">

                    <div>

                        <h3 className="text-900 font-semibold m-0">
                            Meu Caderno de Orientação
                        </h3>

                        <p className="text-600 mt-2 mb-0">

                            Acompanhe o progresso do seu
                            Trabalho de Culminação de Curso.

                        </p>

                    </div>


                    <Tag
                        value={
                            notebook.is_completed
                                ? 'Concluído'
                                : 'Em acompanhamento'
                        }
                        severity={
                            notebook.is_completed
                                ? 'success'
                                : 'info'
                        }
                    />

                </div>

            </div>


            {/* ================================================= */}
            {/* INFORMAÇÃO DO PROJECTO */}
            {/* ================================================= */}

            <div className="col-12">

                <Card>

                    <div className="flex flex-column gap-2">

                        <span className="text-500">
                            Trabalho de Culminação de Curso
                        </span>

                        <h4 className="text-900 m-0">
                            {notebook.pre_project_title}
                        </h4>

                        <div className="flex flex-wrap gap-2 mt-2">

                            <Tag
                                value={
                                    notebook.pre_project_thematic_area
                                }
                                severity="info"
                            />

                            <Tag
                                value={
                                    notebook.pre_project_status
                                }
                                severity="success"
                            />

                        </div>

                        {notebook.pre_project_abstract && (

                            <p className="text-600 line-height-3 mb-0 mt-2">

                                {notebook.pre_project_abstract}

                            </p>

                        )}

                    </div>

                </Card>

            </div>


            {/* ================================================= */}
            {/* RESUMO */}
            {/* ================================================= */}

            <div className="col-12 lg:col-6 xl:col-3">

                <div className="card mb-0">

                    <div className="flex justify-content-between mb-3">

                        <div>

                            <span className="block text-500 font-medium mb-3">
                                Progresso
                            </span>

                            <div className="text-900 font-medium text-2xl">
                                {overallProgress}%
                            </div>

                        </div>

                        <div
                            className="flex align-items-center justify-content-center bg-blue-100 border-round"
                            style={{
                                width: '2.5rem',
                                height: '2.5rem'
                            }}
                        >

                            <i className="pi pi-chart-line text-blue-500 text-xl" />

                        </div>

                    </div>

                    <ProgressBar
                        value={overallProgress}
                        showValue={false}
                        style={{ height: '6px' }}
                    />

                </div>

            </div>


            {/* ================================================= */}
            {/* SESSÕES */}
            {/* ================================================= */}

            <div className="col-12 lg:col-6 xl:col-3">

                <div className="card mb-0">

                    <div className="flex justify-content-between mb-3">

                        <div>

                            <span className="block text-500 font-medium mb-3">
                                Sessões realizadas
                            </span>

                            <div className="text-900 font-medium text-2xl">
                                {sessions.length}
                            </div>

                        </div>

                        <div
                            className="flex align-items-center justify-content-center bg-green-100 border-round"
                            style={{
                                width: '2.5rem',
                                height: '2.5rem'
                            }}
                        >

                            <i className="pi pi-calendar-check text-green-500 text-xl" />

                        </div>

                    </div>

                    <span className="text-500">
                        Encontros presenciais registados
                    </span>

                </div>

            </div>


            {/* ================================================= */}
            {/* TAREFAS PENDENTES */}
            {/* ================================================= */}

            <div className="col-12 lg:col-6 xl:col-3">

                <div className="card mb-0">

                    <div className="flex justify-content-between mb-3">

                        <div>

                            <span className="block text-500 font-medium mb-3">
                                Tarefas pendentes
                            </span>

                            <div className="text-900 font-medium text-2xl">
                                {pendingTasks}
                            </div>

                        </div>

                        <div
                            className="flex align-items-center justify-content-center bg-orange-100 border-round"
                            style={{
                                width: '2.5rem',
                                height: '2.5rem'
                            }}
                        >

                            <i className="pi pi-list text-orange-500 text-xl" />

                        </div>

                    </div>

                    <span className="text-orange-500">
                        Aguardam realização
                    </span>

                </div>

            </div>


            {/* ================================================= */}
            {/* TAREFAS */}
            {/* ================================================= */}

            <div className="col-12 lg:col-6 xl:col-3">

                <div className="card mb-0">

                    <div className="flex justify-content-between mb-3">

                        <div>

                            <span className="block text-500 font-medium mb-3">
                                Tarefas
                            </span>

                            <div className="text-900 font-medium text-2xl">
                                {completedTasks} / {totalTasks}
                            </div>

                        </div>

                        <div
                            className="flex align-items-center justify-content-center bg-purple-100 border-round"
                            style={{
                                width: '2.5rem',
                                height: '2.5rem'
                            }}
                        >

                            <i className="pi pi-check-square text-purple-500 text-xl" />

                        </div>

                    </div>

                    <span className="text-500">
                        {inProgressTasks} em progresso
                    </span>

                </div>

            </div>


            {/* ================================================= */}
            {/* PROGRESSO DAS TAREFAS */}
            {/* ================================================= */}

            <div className="col-12 lg:col-8">

                <Card>

                    <div className="flex justify-content-between align-items-center">

                        <div>

                            <h5 className="text-900 m-0">
                                Progresso das Tarefas
                            </h5>

                            <small className="text-500">
                                Tarefas atribuídas pelo orientador
                            </small>

                        </div>

                        <span className="text-primary font-medium">
                            {taskProgress}%
                        </span>

                    </div>

                    <Divider />


                    <ProgressBar
                        value={taskProgress}
                        showValue={false}
                        style={{
                            height: '8px'
                        }}
                    />


                    {/* RESUMO */}

                    <div className="flex flex-wrap gap-4 mt-4">

                        <div className="flex align-items-center gap-2">

                            <i className="pi pi-check-circle text-green-500" />

                            <span className="text-600">
                                {completedTasks} concluídas
                            </span>

                        </div>


                        <div className="flex align-items-center gap-2">

                            <i className="pi pi-clock text-blue-500" />

                            <span className="text-600">
                                {inProgressTasks} em progresso
                            </span>

                        </div>


                        <div className="flex align-items-center gap-2">

                            <i className="pi pi-exclamation-circle text-orange-500" />

                            <span className="text-600">
                                {pendingTasks} pendentes
                            </span>

                        </div>

                    </div>

                </Card>

            </div>


            {/* ================================================= */}
            {/* PRÓXIMA TAREFA */}
            {/* ================================================= */}

            <div className="col-12 lg:col-4">

                <Card>

                    <h5 className="text-900 m-0">
                        Próxima tarefa
                    </h5>

                    <Divider />

                    {tasks.length === 0 ? (

                        <div className="text-center py-4">

                            <i
                                className="pi pi-check-circle text-green-500"
                                style={{ fontSize: '2rem' }}
                            />

                            <p className="text-600">
                                Nenhuma tarefa atribuída.
                            </p>

                        </div>

                    ) : (

                        (() => {

                            const nextTask =
                                tasks.find(
                                    task =>
                                        task.status !== 'CONCLUIDA'
                                );

                            if (!nextTask) {

                                return (

                                    <div className="text-center py-4">

                                        <i
                                            className="pi pi-check-circle text-green-500"
                                            style={{ fontSize: '2rem' }}
                                        />

                                        <p className="text-600 mb-0">
                                            Todas as tarefas foram concluídas.
                                        </p>

                                    </div>

                                );

                            }

                            return (

                                <div className="surface-50 border-round p-3">

                                    <div className="flex align-items-center gap-2 mb-3">

                                        <Tag
                                            value={getTaskLabel(
                                                nextTask.status
                                            )}
                                            severity={getTaskSeverity(
                                                nextTask.status
                                            )}
                                        />

                                    </div>


                                    <h6 className="text-900 mb-2">
                                        {nextTask.title}
                                    </h6>


                                    {nextTask.description && (

                                        <p className="text-600 line-height-3 mb-3">

                                            {nextTask.description}

                                        </p>

                                    )}


                                    {nextTask.deadline && (

                                        <div className="flex align-items-center gap-2 text-500">

                                            <i className="pi pi-calendar" />

                                            <span>
                                                Prazo: {formatDate(
                                                    nextTask.deadline
                                                )}
                                            </span>

                                        </div>

                                    )}

                                </div>

                            );

                        })()

                    )}

                </Card>

            </div>


            {/* ================================================= */}
            {/* LISTA DE TAREFAS */}
            {/* ================================================= */}

            <div className="col-12">

                <Card>

                    <div className="flex align-items-center justify-content-between">

                        <div>

                            <h5 className="text-900 m-0">
                                Tarefas atribuídas
                            </h5>

                            <small className="text-500">
                                Acompanhe as atividades definidas pelo orientador
                            </small>

                        </div>

                        <Tag
                            value={`${tasks.length} tarefas`}
                            severity="info"
                        />

                    </div>

                    <Divider />


                    {tasks.length === 0 ? (

                        <div className="text-center py-5">

                            <i
                                className="pi pi-inbox text-400"
                                style={{ fontSize: '2.5rem' }}
                            />

                            <p className="text-500">
                                Ainda não existem tarefas atribuídas.
                            </p>

                        </div>

                    ) : (

                        <div className="flex flex-column gap-3">

                            {tasks.map((task) => (

                                <div
                                    key={task.id}
                                    className="surface-50 border-round p-3"
                                >

                                    <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-3">

                                        <div className="flex-1">

                                            <div className="flex align-items-center gap-2 mb-2">

                                                <span className="font-medium text-900">
                                                    {task.title}
                                                </span>

                                                <Tag
                                                    value={getTaskLabel(
                                                        task.status
                                                    )}
                                                    severity={getTaskSeverity(
                                                        task.status
                                                    )}
                                                />

                                            </div>


                                            {task.description && (

                                                <p className="text-600 line-height-3 m-0">

                                                    {task.description}

                                                </p>

                                            )}

                                        </div>


                                        <div className="flex align-items-center gap-2 text-500">

                                            <i className="pi pi-calendar" />

                                            <span>

                                                {task.deadline
                                                    ? formatDate(
                                                        task.deadline
                                                    )
                                                    : 'Sem prazo'
                                                }

                                            </span>

                                        </div>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </Card>

            </div>


            {/* ================================================= */}
            {/* ÚLTIMA SESSÃO */}
            {/* ================================================= */}

            <div className="col-12 lg:col-4">

                <Card>

                    <h5 className="text-900 m-0">
                        Última sessão
                    </h5>

                    <Divider />

                    {sessions.length === 0 ? (

                        <div className="text-center py-4">

                            <i
                                className="pi pi-calendar text-400"
                                style={{ fontSize: '2rem' }}
                            />

                            <p className="text-500">
                                Ainda não existem sessões registadas.
                            </p>

                        </div>

                    ) : (

                        (() => {

                            const lastSession =
                                sessions[0];

                            return (

                                <div>

                                    <div className="flex align-items-center gap-2 mb-2">

                                        <span className="font-medium text-900">
                                            Sessão de Orientação
                                        </span>

                                        <Tag
                                            value="Realizada"
                                            severity="success"
                                        />

                                    </div>


                                    <span className="block text-500 text-sm mb-3">

                                        {formatDate(
                                            lastSession.session_date
                                        )}

                                    </span>


                                    <p className="text-600 line-height-3">

                                        {lastSession.advisor_notes ||
                                            'Sem observações registadas.'}

                                    </p>

                                </div>

                            );

                        })()

                    )}

                </Card>

            </div>


            {/* ================================================= */}
            {/* VERIFICAÇÕES */}
            {/* ================================================= */}

            <div className="col-12 lg:col-8">

                <Card>

                    <div className="flex align-items-center justify-content-between">

                        <div>

                            <h5 className="text-900 m-0">
                                Verificação do Caderno
                            </h5>

                            <small className="text-500">
                                Estado das verificações departamentais
                            </small>

                        </div>

                        <i className="pi pi-verified text-primary text-2xl" />

                    </div>

                    <Divider />

                    <div className="grid">

                        <div className="col-12 md:col-6">

                            <div className="surface-50 border-round p-3">

                                <div className="flex justify-content-between mb-3">

                                    <span className="text-900 font-medium">
                                        Verificação Intermédia
                                    </span>

                                    <Tag
                                        value={
                                            notebook.intermediate_check_passed
                                                ? 'Aprovada'
                                                : 'Pendente'
                                        }
                                        severity={
                                            notebook.intermediate_check_passed
                                                ? 'success'
                                                : 'warning'
                                        }
                                    />

                                </div>

                            </div>

                        </div>


                        <div className="col-12 md:col-6">

                            <div className="surface-50 border-round p-3">

                                <div className="flex justify-content-between mb-3">

                                    <span className="text-900 font-medium">
                                        Verificação Final
                                    </span>

                                    <Tag
                                        value={
                                            notebook.final_check_passed
                                                ? 'Aprovada'
                                                : 'Pendente'
                                        }
                                        severity={
                                            notebook.final_check_passed
                                                ? 'success'
                                                : 'warning'
                                        }
                                    />

                                </div>

                            </div>

                        </div>

                    </div>

                </Card>

            </div>


            {/* ================================================= */}
            {/* HISTÓRICO */}
            {/* ================================================= */}

            <div className="col-12">

                <Card>

                    <div className="flex align-items-center justify-content-between">

                        <div>

                            <h5 className="text-900 m-0">
                                Histórico de Orientações
                            </h5>

                            <small className="text-500">
                                Registo dos encontros realizados com o orientador
                            </small>

                        </div>

                    </div>

                    <Divider />

                    {sessions.length === 0 ? (

                        <div className="text-center py-5 text-500">

                            Ainda não existem sessões registadas.

                        </div>

                    ) : (

                        <Timeline
                            value={sessions}
                            align="left"
                            className="customized-timeline"
                            content={timelineTemplate}
                            marker={timelineMarker}
                        />

                    )}

                </Card>

            </div>

        </div>
    );
};

export default StudentOrientationDashboard;