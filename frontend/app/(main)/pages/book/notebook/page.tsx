'use client';

import React, {
    useEffect,
    useRef,
    useState
} from 'react';

import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { Divider } from 'primereact/divider';
import { ProgressBar } from 'primereact/progressbar';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { TabView, TabPanel } from 'primereact/tabview';

import {
    GuidanceNotebook,
    GuidanceTask,
    createNotebook,
    createTask,
    createSession,
    updateTaskStatus,
    getNotebookById,
    getCurrentUserId,
    getMyNotebooks
} from '@/app/api/notebooks/guidanceNotebookService';
import {
    getPreProjects,
    PreProject
} from '@/app/api/pre-projects/preProjectService';
// import { GuidanceNotebook } from '@/app/api/notebooks/guidanceNotebookService';


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


// =====================================================
// STATUS NOTEBOOK
// =====================================================

const getTaskStatus = (
    status: string
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
        config[status] || {
            label: status,
            severity: 'info' as const
        }
    );
};


// =====================================================
// COMPONENT
// =====================================================

const GuidanceNotebooks = () => {

    const toast = useRef<Toast>(null);


    // =====================================================
    // STATE
    // =====================================================

    const [
        preProjects,
        setPreProjects
    ] = useState<PreProject[]>([]);

    const [
        notebooks,
        setNotebooks
    ] = useState<GuidanceNotebook[]>([]);

    const [
        selectedNotebook,
        setSelectedNotebook
    ] = useState<GuidanceNotebook | null>(null);

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        creating,
        setCreating
    ] = useState(false);

    const [
        createDialog,
        setCreateDialog
    ] = useState(false);

    const [
        taskDialog,
        setTaskDialog
    ] = useState(false);


    // =====================================================
    // FORM CREATE NOTEBOOK
    // =====================================================

    const [
        selectedPreProject,
        setSelectedPreProject
    ] = useState<PreProject | null>(null);


    // =====================================================
    // TASK FORM
    // =====================================================

    const [
        taskTitle,
        setTaskTitle
    ] = useState('');

    const [
        taskDescription,
        setTaskDescription
    ] = useState('');

    const [
        taskDeadline,
        setTaskDeadline
    ] = useState<Date | null>(null);

    const [
        savingTask,
        setSavingTask
    ] = useState(false);


    // =====================================================
// SESSION FORM
// =====================================================

const [
    sessionDialog,
    setSessionDialog
] = useState(false);

const [
    sessionDate,
    setSessionDate
] = useState<Date | null>(new Date());

const [
    sessionNotes,
    setSessionNotes
] = useState('');

const [
    savingSession,
    setSavingSession
] = useState(false);

    // =====================================================
    // LOAD PRE-PROJECTS
    // =====================================================

    const loadData = async () => {

        try {

            setLoading(true);

            const userId = getCurrentUserId();

            if (!userId) {
                throw new Error(
                    'Utilizador autenticado não encontrado.'
                );
            }

            // ==========================================
            // 1. CARREGAR PRÉ-PROJECTOS
            // ==========================================

            const projects = await getPreProjects({
                advisor_id: userId
            });

            setPreProjects(projects);


            // ==========================================
            // 2. CARREGAR CADERNOS DO ORIENTADOR
            // ==========================================

            const myNotebooks = await getMyNotebooks();

            setNotebooks(myNotebooks);

        } catch (error: any) {

            console.error(error);

            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail:
                    error?.response?.data?.message ||
                    error?.message ||
                    'Não foi possível carregar os dados.',
                life: 5000
            });

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {

        loadData();

    }, []);


    // =====================================================
    // CREATE NOTEBOOK
    // =====================================================

   const handleCreateNotebook = async () => {

    if (!selectedPreProject) {

        toast.current?.show({
            severity: 'warn',
            summary: 'Atenção',
            detail: 'Selecione um estudante/pré-projecto.',
            life: 4000
        });

        return;
    }

    try {

        setCreating(true);

        const advisorId = getCurrentUserId();

        if (!advisorId) {
            throw new Error(
                'Orientador autenticado não encontrado.'
            );
        }

        const notebook = await createNotebook({

            student_id:
                selectedPreProject.student_id,

            advisor_id:
                advisorId,

            pre_project_id:
                selectedPreProject.id
        });

        toast.current?.show({
            severity: 'success',
            summary: 'Sucesso',
            detail:
                'Caderno de orientação criado com sucesso.',
            life: 4000
        });

        setCreateDialog(false);

        setSelectedPreProject(null);


        // ==========================================
        // RECARREGAR CADERNOS
        // ==========================================

        const updatedNotebooks =
            await getMyNotebooks();

        setNotebooks(updatedNotebooks);


        // ==========================================
        // ABRIR CADERNO CRIADO
        // ==========================================

        if (notebook?.id) {

            const details =
                await getNotebookById(
                    notebook.id
                );

            setSelectedNotebook(details);
        }

    } catch (error: any) {

        console.error(error);

        toast.current?.show({
            severity: 'error',
            summary: 'Erro',
            detail:
                error?.response?.data?.message ||
                error?.message ||
                'Não foi possível criar o caderno.',
            life: 5000
        });

    } finally {

        setCreating(false);
    }
};


    // =====================================================
    // OPEN NOTEBOOK
    // =====================================================

    const openNotebook = async (
        notebook: GuidanceNotebook
    ) => {

        try {

            setLoading(true);

            const details =
                await getNotebookById(
                    notebook.id
                );

            setSelectedNotebook(
                details
            );

        } catch (error: any) {

            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail:
                    error?.message ||
                    'Não foi possível carregar o caderno.',
                life: 5000
            });

        } finally {

            setLoading(false);

        }
    };


    // =====================================================
    // CREATE TASK
    // =====================================================

    const handleCreateTask = async () => {

        if (!selectedNotebook) {
            return;
        }

        if (!taskTitle.trim()) {

            toast.current?.show({
                severity: 'warn',
                summary: 'Atenção',
                detail: 'Informe o título da tarefa.',
                life: 4000
            });

            return;
        }

        try {

            setSavingTask(true);

            await createTask({

                notebook_id:
                    selectedNotebook.id,

                title:
                    taskTitle,

                description:
                    taskDescription,

                deadline:
                    taskDeadline
                        ? taskDeadline
                            .toISOString()
                            .split('T')[0]
                        : undefined
            });

            toast.current?.show({
                severity: 'success',
                summary: 'Sucesso',
                detail:
                    'Tarefa atribuída ao estudante.',
                life: 4000
            });

            setTaskDialog(false);

            setTaskTitle('');
            setTaskDescription('');
            setTaskDeadline(null);

            /*
             * Atualizar caderno.
             */

            const updated =
                await getNotebookById(
                    selectedNotebook.id
                );

            setSelectedNotebook(
                updated
            );

        } catch (error: any) {

            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail:
                    error?.response?.data?.message ||
                    error?.message ||
                    'Não foi possível criar a tarefa.',
                life: 5000
            });

        } finally {

            setSavingTask(false);

        }
    };

    // =====================================================
// CREATE SESSION
// =====================================================

const handleCreateSession = async () => {

    if (!selectedNotebook) {
        return;
    }

    if (!sessionDate) {

        toast.current?.show({
            severity: 'warn',
            summary: 'Atenção',
            detail: 'Informe a data da sessão.',
            life: 4000
        });

        return;
    }

    try {

        setSavingSession(true);

        await createSession({

            notebook_id:
                selectedNotebook.id,

            session_date:
                sessionDate
                    .toISOString()
                    .split('T')[0],

            advisor_notes:
                sessionNotes.trim() || undefined,

            evaluations: []
        });

        toast.current?.show({
            severity: 'success',
            summary: 'Sucesso',
            detail:
                'Sessão de orientação registada com sucesso.',
            life: 4000
        });

        setSessionDialog(false);

        setSessionDate(new Date());

        setSessionNotes('');

        // ==========================================
        // RECARREGAR CADERNO
        // ==========================================

        const updated =
            await getNotebookById(
                selectedNotebook.id
            );

        setSelectedNotebook(updated);

    } catch (error: any) {

        console.error(error);

        toast.current?.show({
            severity: 'error',
            summary: 'Erro',
            detail:
                error?.response?.data?.message ||
                error?.message ||
                'Não foi possível registrar a sessão.',
            life: 5000
        });

    } finally {

        setSavingSession(false);
    }
};


    // =====================================================
    // UPDATE TASK
    // =====================================================

    const handleTaskStatus = async (
        task: GuidanceTask,
        status:
            | 'PENDENTE'
            | 'EM_PROGRESSO'
            | 'ENTREGUE'
            | 'CONCLUIDA'
    ) => {

        try {

            await updateTaskStatus(
                task.id,
                status
            );

            toast.current?.show({
                severity: 'success',
                summary: 'Actualizado',
                detail:
                    'Estado da tarefa actualizado.',
                life: 3000
            });

            if (selectedNotebook) {

                const updated =
                    await getNotebookById(
                        selectedNotebook.id
                    );

                setSelectedNotebook(
                    updated
                );
            }

        } catch (error: any) {

            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail:
                    error?.message ||
                    'Não foi possível actualizar a tarefa.',
                life: 4000
            });

        }
    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading && !selectedNotebook) {

        return (

            <div className="grid">

                <Toast ref={toast} />

                <div className="col-12">

                    <Card>

                        <div className="
                            flex
                            flex-column
                            align-items-center
                            justify-content-center
                            py-8
                        ">

                            <ProgressSpinner />

                            <span className="text-600 mt-3">
                                A carregar cadernos...
                            </span>

                        </div>

                    </Card>

                </div>

            </div>
        );
    }


    // =====================================================
    // NOTEBOOK DETAILS
    // =====================================================

    if (selectedNotebook) {

        const tasks =
            selectedNotebook.tasks || [];

        const completedTasks =
            tasks.filter(
                task =>
                    task.status === 'CONCLUIDA'
            ).length;

        const taskPercentage =
            tasks.length > 0
                ? Math.round(
                    (
                        completedTasks /
                        tasks.length
                    ) * 100
                )
                : 0;


        return (

            <div className="grid">

                <Toast ref={toast} />

                {/* HEADER */}

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

                            <Button
                                label="Voltar"
                                icon="pi pi-arrow-left"
                                text
                                onClick={() =>
                                    setSelectedNotebook(null)
                                }
                            />

                            <h2 className="
                                text-900
                                font-semibold
                                mt-3
                                mb-2
                            ">
                                Caderno de Orientação
                            </h2>

                            <p className="
                                text-600
                                m-0
                            ">
                                Acompanhamento do estudante,
                                tarefas e progresso da orientação.
                            </p>

                        </div>

                        <Button
                            label="Actualizar"
                            icon="pi pi-refresh"
                            outlined
                            onClick={() =>
                                openNotebook(
                                    selectedNotebook
                                )
                            }
                        />

                    </div>

                </div>


                {/* STUDENT */}

                <div className="col-12">

                    <Card>

                        <div className="
                            flex
                            flex-column
                            md:flex-row
                            md:align-items-center
                            md:justify-content-between
                            gap-4
                        ">

                            <div className="
                                flex
                                align-items-center
                                gap-3
                            ">

                                <div
                                    className="
                                        flex
                                        align-items-center
                                        justify-content-center
                                        border-circle
                                        surface-100
                                    "
                                    style={{
                                        width: '60px',
                                        height: '60px'
                                    }}
                                >

                                    <i className="
                                        pi
                                        pi-user
                                        text-primary
                                        text-2xl
                                    " />

                                </div>

                                <div>

                                    <span className="
                                        text-600
                                        block
                                        mb-1
                                    ">
                                        Estudante
                                    </span>

                                    <h3 className="
                                        text-900
                                        m-0
                                    ">
                                        {
                                            selectedNotebook.student_name ||
                                            'Estudante'
                                        }
                                    </h3>

                                    <span className="text-600">
                                        {
                                            selectedNotebook.student_email ||
                                            '-'
                                        }
                                    </span>

                                </div>

                            </div>


                            <div>

                                <span className="
                                    text-600
                                    block
                                    mb-2
                                ">
                                    Pré-projecto
                                </span>

                                <strong className="text-900">
                                    {
                                        selectedNotebook.pre_project_title ||
                                        'Pré-projecto'
                                    }
                                </strong>

                            </div>

                        </div>

                    </Card>

                </div>


                {/* STATISTICS */}

                <div className="col-12">

                    <div className="grid">

                        <div className="col-12 md:col-3">

                            <Card>

                                <span className="text-600 block mb-2">
                                    Tarefas
                                </span>

                                <span className="
                                    text-900
                                    text-3xl
                                    font-semibold
                                ">
                                    {tasks.length}
                                </span>

                            </Card>

                        </div>


                        <div className="col-12 md:col-3">

                            <Card>

                                <span className="text-600 block mb-2">
                                    Concluídas
                                </span>

                                <span className="
                                    text-green-600
                                    text-3xl
                                    font-semibold
                                ">
                                    {completedTasks}
                                </span>

                            </Card>

                        </div>


                        <div className="col-12 md:col-3">

                            <Card>

                                <span className="text-600 block mb-2">
                                    Pendentes
                                </span>

                                <span className="
                                    text-orange-500
                                    text-3xl
                                    font-semibold
                                ">
                                    {
                                        tasks.filter(
                                            task =>
                                                task.status ===
                                                'PENDENTE'
                                        ).length
                                    }
                                </span>

                            </Card>

                        </div>


                        <div className="col-12 md:col-3">

                            <Card>

                                <span className="text-600 block mb-2">
                                    Progresso
                                </span>

                                <span className="
                                    text-primary
                                    text-3xl
                                    font-semibold
                                ">
                                    {taskPercentage}%
                                </span>

                            </Card>

                        </div>

                    </div>

                </div>


                {/* PROGRESS */}

                <div className="col-12">

                    <Card>

                        <div className="
                            flex
                            justify-content-between
                            mb-2
                        ">

                            <span className="text-900 font-semibold">
                                Progresso das tarefas
                            </span>

                            <span className="text-600">
                                {completedTasks} / {tasks.length}
                            </span>

                        </div>

                        <ProgressBar
                            value={taskPercentage}
                            showValue={false}
                        />

                    </Card>

                </div>


                {/* TABS */}

                <div className="col-12">

                    <Card>

                        <TabView>

                            {/* =================================================
                                OVERVIEW
                            ================================================= */}

                            <TabPanel
                                header="Visão Geral"
                                leftIcon="pi pi-home mr-2"
                            >

                                <div className="grid">

                                    <div className="col-12">

                                        <Card>

                                            <h4 className="
                                                text-900
                                                mt-0
                                            ">
                                                Pré-projecto
                                            </h4>

                                            <Divider />

                                            <h3 className="text-900">
                                                {
                                                    selectedNotebook
                                                        .pre_project_title
                                                }
                                            </h3>

                                            <div className="
                                                flex
                                                gap-2
                                                flex-wrap
                                            ">

                                                <Tag
                                                    value={
                                                        selectedNotebook
                                                            .pre_project_thematic_area ||
                                                        'Área temática'
                                                    }
                                                    severity="info"
                                                />

                                                <Tag
                                                    value={
                                                        selectedNotebook
                                                            .pre_project_status ||
                                                        'Pendente'
                                                    }
                                                    severity="warning"
                                                />

                                            </div>

                                        </Card>

                                    </div>


                                    <div className="col-12 md:col-6">

                                        <Card>

                                            <h4 className="text-900 mt-0">
                                                Orientador
                                            </h4>

                                            <Divider />

                                            <span className="text-900 font-semibold">
                                                {
                                                    selectedNotebook
                                                        .advisor_name ||
                                                    'Orientador'
                                                }
                                            </span>

                                        </Card>

                                    </div>


                                    <div className="col-12 md:col-6">

                                        <Card>

                                            <h4 className="text-900 mt-0">
                                                Caderno criado
                                            </h4>

                                            <Divider />

                                            <span className="text-900 font-semibold">
                                                {
                                                    formatDate(
                                                        selectedNotebook.created_at
                                                    )
                                                }
                                            </span>

                                        </Card>

                                    </div>

                                </div>

                            </TabPanel>


                            {/* =================================================
                                TASKS
                            ================================================= */}

                            <TabPanel
                                header="Tarefas"
                                leftIcon="pi pi-check-square mr-2"
                            >

                                <div className="
                                    flex
                                    justify-content-between
                                    align-items-center
                                    mb-4
                                ">

                                    <div>

                                        <h3 className="
                                            text-900
                                            mt-0
                                            mb-1
                                        ">
                                            Tarefas do estudante
                                        </h3>

                                        <span className="text-600">
                                            Atribua actividades e acompanhe
                                            o progresso.
                                        </span>

                                    </div>

                                    <Button
                                        label="Nova tarefa"
                                        icon="pi pi-plus"
                                        onClick={() =>
                                            setTaskDialog(true)
                                        }
                                    />

                                </div>


                                {tasks.length === 0 ? (

                                    <div className="
                                        surface-100
                                        border-round
                                        p-5
                                        text-center
                                    ">

                                        <i className="
                                            pi
                                            pi-check-square
                                            text-500
                                            text-4xl
                                            mb-3
                                        " />

                                        <p className="
                                            text-600
                                            m-0
                                        ">
                                            Nenhuma tarefa foi atribuída.
                                        </p>

                                    </div>

                                ) : (

                                    <div className="grid">

                                        {tasks.map(task => {

                                            const status =
                                                getTaskStatus(
                                                    task.status
                                                );

                                            return (

                                                <div
                                                    key={task.id}
                                                    className="
                                                        col-12
                                                        md:col-6
                                                    "
                                                >

                                                    <Card>

                                                        <div className="
                                                            flex
                                                            justify-content-between
                                                            gap-3
                                                        ">

                                                            <div>

                                                                <h4 className="
                                                                    text-900
                                                                    mt-0
                                                                    mb-2
                                                                ">
                                                                    {
                                                                        task.title
                                                                    }
                                                                </h4>

                                                                <span className="
                                                                    text-600
                                                                    line-height-3
                                                                ">
                                                                    {
                                                                        task.description ||
                                                                        'Sem descrição.'
                                                                    }
                                                                </span>

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

                                                        <Divider />

                                                        <div className="
                                                            flex
                                                            justify-content-between
                                                            align-items-center
                                                            gap-2
                                                        ">

                                                            <div>

                                                                <small className="
                                                                    text-600
                                                                    block
                                                                ">
                                                                    Prazo
                                                                </small>

                                                                <span className="text-900">
                                                                    {
                                                                        formatDate(
                                                                            task.deadline
                                                                        )
                                                                    }
                                                                </span>

                                                            </div>


                                                            <Dropdown
                                                                value={
                                                                    task.status
                                                                }
                                                                options={[
                                                                    {
                                                                        label:
                                                                            'Pendente',
                                                                        value:
                                                                            'PENDENTE'
                                                                    },
                                                                    {
                                                                        label:
                                                                            'Em progresso',
                                                                        value:
                                                                            'EM_PROGRESSO'
                                                                    },
                                                                    {
                                                                        label:
                                                                            'Entregue',
                                                                        value:
                                                                            'ENTREGUE'
                                                                    },
                                                                    {
                                                                        label:
                                                                            'Concluída',
                                                                        value:
                                                                            'CONCLUIDA'
                                                                    }
                                                                ]}
                                                                onChange={
                                                                    event =>
                                                                        handleTaskStatus(
                                                                            task,
                                                                            event.value
                                                                        )
                                                                }
                                                                className="w-12rem"
                                                            />

                                                        </div>

                                                    </Card>

                                                </div>

                                            );

                                        })}

                                    </div>

                                )}

                            </TabPanel>


                            {/* =================================================
                                SESSIONS
                            ================================================= */}

                            {/* <TabPanel
                                header="Sessões"
                                leftIcon="pi pi-calendar mr-2"
                            >

                                {
                                    selectedNotebook.sessions?.length ? (

                                        <div className="grid">

                                            {
                                                selectedNotebook.sessions.map(
                                                    session => (

                                                        <div
                                                            key={session.id}
                                                            className="
                                                                col-12
                                                                md:col-6
                                                            "
                                                        >

                                                            <Card>

                                                                <div className="
                                                                    flex
                                                                    align-items-center
                                                                    gap-3
                                                                ">

                                                                    <i className="
                                                                        pi
                                                                        pi-calendar
                                                                        text-primary
                                                                        text-2xl
                                                                    " />

                                                                    <div>

                                                                        <span className="
                                                                            text-600
                                                                            block
                                                                        ">
                                                                            Sessão
                                                                        </span>

                                                                        <strong className="text-900">
                                                                            {
                                                                                formatDate(
                                                                                    session.session_date
                                                                                )
                                                                            }
                                                                        </strong>

                                                                    </div>

                                                                </div>

                                                                <Divider />

                                                                <p className="
                                                                    text-700
                                                                    line-height-3
                                                                ">
                                                                    {
                                                                        session.advisor_notes ||
                                                                        'Sem observações.'
                                                                    }
                                                                </p>

                                                            </Card>

                                                        </div>

                                                    )
                                                )
                                            }

                                        </div>

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

                                            <p className="text-600 m-0">
                                                Ainda não existem sessões
                                                de orientação.
                                            </p>

                                        </div>

                                    )
                                }

                            </TabPanel> */}

                            <TabPanel
    header="Sessões"
    leftIcon="pi pi-calendar mr-2"
>

    {/* HEADER DA ABA */}

    <div className="
        flex
        flex-column
        md:flex-row
        md:justify-content-between
        md:align-items-center
        gap-3
        mb-4
    ">

        <div>

            <h3 className="
                text-900
                mt-0
                mb-1
            ">
                Sessões de orientação
            </h3>

            <span className="text-600">
                Registe os encontros realizados com o estudante.
            </span>

        </div>

        <Button
            label="Nova sessão"
            icon="pi pi-plus"
            onClick={() => {

                setSessionDate(new Date());

                setSessionNotes('');

                setSessionDialog(true);

            }}
        />

    </div>


    {/* LISTA DE SESSÕES */}

    {
        selectedNotebook.sessions?.length ? (

            <div className="grid">

                {
                    selectedNotebook.sessions.map(
                        session => (

                            <div
                                key={session.id}
                                className="
                                    col-12
                                    md:col-6
                                "
                            >

                                <Card>

                                    <div className="
                                        flex
                                        justify-content-between
                                        align-items-start
                                        gap-3
                                    ">

                                        <div className="
                                            flex
                                            align-items-center
                                            gap-3
                                        ">

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

                                                <i className="
                                                    pi
                                                    pi-calendar
                                                    text-primary
                                                    text-xl
                                                " />

                                            </div>

                                            <div>

                                                <span className="
                                                    text-600
                                                    block
                                                    mb-1
                                                ">
                                                    Sessão
                                                </span>

                                                <strong className="text-900">
                                                    {
                                                        formatDate(
                                                            session.session_date
                                                        )
                                                    }
                                                </strong>

                                            </div>

                                        </div>

                                        <Tag
                                            value="Realizada"
                                            severity="success"
                                        />

                                    </div>

                                    <Divider />

                                    <span className="
                                        text-600
                                        block
                                        mb-2
                                    ">
                                        Observações do orientador
                                    </span>

                                    <p className="
                                        text-700
                                        line-height-3
                                        m-0
                                    ">
                                        {
                                            session.advisor_notes ||
                                            'Sem observações.'
                                        }
                                    </p>

                                </Card>

                            </div>

                        )
                    )
                }

            </div>

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

                <h3 className="
                    text-900
                    mt-0
                    mb-2
                ">
                    Nenhuma sessão registada
                </h3>

                <p className="
                    text-600
                    mb-4
                ">
                    Registe a primeira sessão de orientação
                    deste estudante.
                </p>

                <Button
                    label="Registar primeira sessão"
                    icon="pi pi-plus"
                    onClick={() => {

                        setSessionDate(new Date());

                        setSessionNotes('');

                        setSessionDialog(true);

                    }}
                />

            </div>

        )
    }

</TabPanel>


                            {/* =================================================
                                DECLARATIONS
                            ================================================= */}

                            <TabPanel
                                header="Declarações"
                                leftIcon="pi pi-file mr-2"
                            >

                                <div className="grid">

                                    {
                                        selectedNotebook.declarations?.map(
                                            declaration => (

                                                <div
                                                    key={declaration.id}
                                                    className="
                                                        col-12
                                                        md:col-6
                                                    "
                                                >

                                                    <Card>

                                                        <div className="
                                                            flex
                                                            justify-content-between
                                                            align-items-center
                                                        ">

                                                            <div>

                                                                <span className="
                                                                    text-600
                                                                    block
                                                                    mb-2
                                                                ">
                                                                    Tipo
                                                                </span>

                                                                <Tag
                                                                    value={
                                                                        declaration.declaration_type ===
                                                                            'ADVISOR'
                                                                            ? 'Orientador'
                                                                            : 'Estudante'
                                                                    }
                                                                    severity="info"
                                                                />

                                                            </div>

                                                            <Button
                                                                icon="pi pi-eye"
                                                                outlined
                                                                rounded
                                                                tooltip="Abrir documento"
                                                                onClick={() => {

                                                                    if (
                                                                        declaration.document_url
                                                                    ) {

                                                                        window.open(
                                                                            declaration.document_url,
                                                                            '_blank'
                                                                        );

                                                                    }

                                                                }}
                                                            />

                                                        </div>

                                                    </Card>

                                                </div>

                                            )
                                        )
                                    }

                                </div>

                            </TabPanel>

                        </TabView>

                    </Card>

                </div>


                {/* TASK DIALOG */}

                <Dialog
                    header="Nova tarefa"
                    visible={taskDialog}
                    style={{
                        width: '550px'
                    }}
                    modal
                    onHide={() =>
                        setTaskDialog(false)
                    }
                >

                    <div className="field">

                        <label className="
                            block
                            text-900
                            font-medium
                            mb-2
                        ">
                            Título
                        </label>

                        <InputText
                            value={taskTitle}
                            onChange={event =>
                                setTaskTitle(
                                    event.target.value
                                )
                            }
                            className="w-full"
                            placeholder="Ex.: Revisão bibliográfica"
                        />

                    </div>


                    <div className="field">

                        <label className="
                            block
                            text-900
                            font-medium
                            mb-2
                        ">
                            Descrição
                        </label>

                        <InputTextarea
                            value={taskDescription}
                            onChange={event =>
                                setTaskDescription(
                                    event.target.value
                                )
                            }
                            rows={5}
                            className="w-full"
                            placeholder="Descreva a actividade..."
                        />

                    </div>


                    <div className="field">

                        <label className="
                            block
                            text-900
                            font-medium
                            mb-2
                        ">
                            Prazo
                        </label>

                        <Calendar
                            value={taskDeadline}
                            onChange={event =>
                                setTaskDeadline(
                                    event.value as Date
                                )
                            }
                            dateFormat="dd/mm/yy"
                            className="w-full"
                            showIcon
                        />

                    </div>


                    <div className="
                        flex
                        justify-content-end
                        gap-2
                        mt-4
                    ">

                        <Button
                            label="Cancelar"
                            outlined
                            onClick={() =>
                                setTaskDialog(false)
                            }
                        />

                        <Button
                            label="Atribuir tarefa"
                            icon="pi pi-check"
                            loading={savingTask}
                            onClick={
                                handleCreateTask
                            }
                        />

                    </div>

                </Dialog>

                {/* =====================================================
    SESSION DIALOG
===================================================== */}

<Dialog
    header="Nova sessão de orientação"
    visible={sessionDialog}
    style={{
        width: '600px'
    }}
    modal
    onHide={() => {

        if (!savingSession) {
            setSessionDialog(false);
        }

    }}
>

    <div className="mb-4">

        <div className="
            flex
            align-items-center
            gap-3
            surface-100
            border-round
            p-3
        ">

            <div
                className="
                    flex
                    align-items-center
                    justify-content-center
                    border-circle
                    surface-0
                "
                style={{
                    width: '45px',
                    height: '45px'
                }}
            >

                <i className="
                    pi
                    pi-user
                    text-primary
                    text-xl
                " />

            </div>

            <div>

                <span className="
                    text-600
                    block
                    text-sm
                ">
                    Estudante
                </span>

                <strong className="text-900">
                    {
                        selectedNotebook?.student_name ||
                        'Estudante'
                    }
                </strong>

            </div>

        </div>

    </div>


    {/* DATA */}

    <div className="field">

        <label className="
            block
            text-900
            font-medium
            mb-2
        ">
            Data da sessão
        </label>

        <Calendar
            value={sessionDate}
            onChange={event =>
                setSessionDate(
                    event.value as Date
                )
            }
            dateFormat="dd/mm/yy"
            className="w-full"
            showIcon
            maxDate={new Date()}
        />

    </div>


    {/* OBSERVAÇÕES */}

    <div className="field">

        <label className="
            block
            text-900
            font-medium
            mb-2
        ">
            Observações do orientador
        </label>

        <InputTextarea
            value={sessionNotes}
            onChange={event =>
                setSessionNotes(
                    event.target.value
                )
            }
            rows={6}
            className="w-full"
            placeholder="
                Registe os principais assuntos tratados,
                orientações dadas, dificuldades identificadas,
                próximos passos, etc.
            "
            autoResize
        />

    </div>


    {/* INFO */}

    <div className="
        surface-100
        border-round
        p-3
        mt-4
    ">

        <div className="
            flex
            align-items-start
            gap-2
        ">

            <i className="
                pi
                pi-info-circle
                text-primary
                mt-1
            " />

            <small className="
                text-600
                line-height-3
            ">
                Depois de registrar a sessão, ela ficará
                associada ao caderno de orientação deste
                estudante.
            </small>

        </div>

    </div>


    {/* FOOTER */}

    <div className="
        flex
        justify-content-end
        gap-2
        mt-5
    ">

        <Button
            label="Cancelar"
            outlined
            disabled={savingSession}
            onClick={() =>
                setSessionDialog(false)
            }
        />

        <Button
            label="Registar sessão"
            icon="pi pi-check"
            loading={savingSession}
            onClick={
                handleCreateSession
            }
        />

    </div>

</Dialog>

            </div>
        );
    }


    // =====================================================
    // MAIN LIST
    // =====================================================

    return (

        <div className="grid">

            <Toast ref={toast} />


            {/* HEADER */}

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

                        <h2 className="
                            text-900
                            font-semibold
                            m-0
                        ">
                            Cadernos de Orientação
                        </h2>

                        <p className="
                            text-600
                            mt-2
                            mb-0
                        ">
                            Gerencie o acompanhamento dos seus
                            estudantes e respectivas actividades.
                        </p>

                    </div>


                    <Button
                        label="Novo caderno"
                        icon="pi pi-plus"
                        onClick={() =>
                            setCreateDialog(true)
                        }
                    />

                </div>

            </div>


            {/* STATISTICS */}

            <div className="col-12">

                <div className="grid">

                    <div className="col-12 md:col-3">

                        <Card>

                            <span className="
                                text-600
                                block
                                mb-2
                            ">
                                Estudantes
                            </span>

                            <span className="
                                text-900
                                text-3xl
                                font-semibold
                            ">
                                {notebooks.length}
                            </span>

                        </Card>

                    </div>


                    <div className="col-12 md:col-3">

                        <Card>

                            <span className="
                                text-600
                                block
                                mb-2
                            ">
                                Tarefas
                            </span>

                            <span className="
                                text-primary
                                text-3xl
                                font-semibold
                            ">
                                {
                                    notebooks.reduce(
                                        (
                                            total,
                                            notebook
                                        ) =>
                                            total +
                                            (
                                                notebook.tasks?.length ||
                                                0
                                            ),
                                        0
                                    )
                                }
                            </span>

                        </Card>

                    </div>


                    <div className="col-12 md:col-3">

                        <Card>

                            <span className="
                                text-600
                                block
                                mb-2
                            ">
                                Pendentes
                            </span>

                            <span className="
                                text-orange-500
                                text-3xl
                                font-semibold
                            ">
                                {
                                    notebooks.reduce(
                                        (
                                            total,
                                            notebook
                                        ) =>
                                            total +
                                            (
                                                notebook.tasks?.filter(
                                                    task =>
                                                        task.status ===
                                                        'PENDENTE'
                                                ).length ||
                                                0
                                            ),
                                        0
                                    )
                                }
                            </span>

                        </Card>

                    </div>


                    <div className="col-12 md:col-3">

                        <Card>

                            <span className="
                                text-600
                                block
                                mb-2
                            ">
                                Concluídas
                            </span>

                            <span className="
                                text-green-600
                                text-3xl
                                font-semibold
                            ">
                                {
                                    notebooks.reduce(
                                        (
                                            total,
                                            notebook
                                        ) =>
                                            total +
                                            (
                                                notebook.tasks?.filter(
                                                    task =>
                                                        task.status ===
                                                        'CONCLUIDA'
                                                ).length ||
                                                0
                                            ),
                                        0
                                    )
                                }
                            </span>

                        </Card>

                    </div>

                </div>

            </div>


            {/* NOTEBOOKS */}

            <div className="col-12">

                <Card>

                    <div className="
                        flex
                        justify-content-between
                        align-items-center
                        mb-4
                    ">

                        <div>

                            <h3 className="
                                text-900
                                mt-0
                                mb-1
                            ">
                                Meus cadernos
                            </h3>

                            <span className="text-600">
                                Estudantes sob sua orientação.
                            </span>

                        </div>

                    </div>


                    {notebooks.length === 0 ? (

                        <div className="
                            surface-100
                            border-round
                            p-6
                            text-center
                        ">

                            <i className="
                                pi
                                pi-book
                                text-500
                                text-5xl
                                mb-3
                            " />

                            <h3 className="
                                text-900
                                mt-0
                            ">
                                Nenhum caderno criado
                            </h3>

                            <p className="
                                text-600
                                mb-4
                            ">
                                Comece criando um caderno de
                                orientação para um estudante.
                            </p>

                            <Button
                                label="Criar primeiro caderno"
                                icon="pi pi-plus"
                                onClick={() =>
                                    setCreateDialog(true)
                                }
                            />

                        </div>

                    ) : (

                        <div className="grid">

                            {
                                notebooks.map(
                                    notebook => {

                                        const tasks =
                                            notebook.tasks ||
                                            [];

                                        const completed =
                                            tasks.filter(
                                                task =>
                                                    task.status ===
                                                    'CONCLUIDA'
                                            ).length;

                                        const percentage =
                                            tasks.length
                                                ? Math.round(
                                                    (
                                                        completed /
                                                        tasks.length
                                                    ) * 100
                                                )
                                                : 0;

                                        return (

                                            <div
                                                key={
                                                    notebook.id
                                                }
                                                className="
                                                    col-12
                                                    md:col-6
                                                    lg:col-4
                                                "
                                            >

                                                <Card>

                                                    <div className="
                                                        flex
                                                        align-items-center
                                                        gap-3
                                                    ">

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

                                                            <i className="
                                                                pi
                                                                pi-user
                                                                text-primary
                                                                text-xl
                                                            " />

                                                        </div>

                                                        <div>

                                                            <span className="
                                                                text-900
                                                                font-semibold
                                                                block
                                                            ">
                                                                {
                                                                    notebook.student_name ||
                                                                    'Estudante'
                                                                }
                                                            </span>

                                                            <small className="text-600">
                                                                {
                                                                    notebook.student_email ||
                                                                    '-'
                                                                }
                                                            </small>

                                                        </div>

                                                    </div>


                                                    <Divider />


                                                    <span className="
                                                        text-600
                                                        block
                                                        mb-2
                                                    ">
                                                        Pré-projecto
                                                    </span>

                                                    <strong className="
                                                        text-900
                                                        line-height-3
                                                        block
                                                    ">
                                                        {
                                                            notebook.pre_project_title ||
                                                            'Pré-projecto'
                                                        }
                                                    </strong>


                                                    <div className="mt-4">

                                                        <div className="
                                                            flex
                                                            justify-content-between
                                                            mb-2
                                                        ">

                                                            <small className="text-600">
                                                                Progresso
                                                            </small>

                                                            <small className="text-900 font-semibold">
                                                                {
                                                                    percentage
                                                                }%
                                                            </small>

                                                        </div>

                                                        <ProgressBar
                                                            value={
                                                                percentage
                                                            }
                                                            showValue={
                                                                false
                                                            }
                                                        />

                                                    </div>


                                                    <Button
                                                        label="Abrir caderno"
                                                        icon="pi pi-arrow-right"
                                                        className="
                                                            w-full
                                                            mt-4
                                                        "
                                                        onClick={() =>
                                                            openNotebook(
                                                                notebook
                                                            )
                                                        }
                                                    />

                                                </Card>

                                            </div>
                                        );
                                    }
                                )
                            }

                        </div>

                    )}

                </Card>

            </div>


            {/* =====================================================
                CREATE NOTEBOOK DIALOG
            ===================================================== */}

            <Dialog
                header="Criar Caderno de Orientação"
                visible={createDialog}
                style={{
                    width: '650px'
                }}
                modal
                onHide={() => {

                    if (!creating) {
                        setCreateDialog(false);
                    }

                }}
            >

                <div className="mb-4">

                    <p className="
                        text-600
                        line-height-3
                        mt-0
                    ">
                        Selecione um estudante. O sistema irá
                        apresentar automaticamente o pré-projecto
                        associado ao estudante.
                    </p>

                </div>


                <div className="field">

                    <label className="
                        block
                        text-900
                        font-medium
                        mb-2
                    ">
                        Estudante / Pré-projecto
                    </label>

                    <Dropdown
                        value={
                            selectedPreProject
                        }
                        options={
                            preProjects
                        }
                        optionLabel="student_name"
                        placeholder="Seleccione o estudante"
                        className="w-full"
                        filter
                        emptyMessage="
                            Nenhum estudante encontrado.
                        "
                        onChange={event => {

                            setSelectedPreProject(
                                event.value
                            );

                        }}
                        itemTemplate={
                            (project: PreProject) => (

                                <div>

                                    <span className="
                                        text-900
                                        font-semibold
                                        block
                                    ">
                                        {
                                            project.student_name ||
                                            `Estudante #${project.student_id}`
                                        }
                                    </span>

                                    <small className="text-600">
                                        {
                                            project.title
                                        }
                                    </small>

                                </div>
                            )
                        }
                        valueTemplate={
                            (project: PreProject) => {

                                if (!project) {
                                    return (
                                        <span>
                                            Seleccione o estudante
                                        </span>
                                    );
                                }

                                return (
                                    <span>
                                        {
                                            project.student_name ||
                                            `Estudante #${project.student_id}`
                                        }
                                    </span>
                                );
                            }
                        }
                    />

                </div>


                {/* PRE-PROJECT PREVIEW */}

                {selectedPreProject && (

                    <Card className="
                        surface-100
                        mt-4
                    ">

                        <div className="
                            flex
                            align-items-center
                            gap-2
                            mb-3
                        ">

                            <i className="
                                pi
                                pi-file
                                text-primary
                            " />

                            <strong className="text-900">
                                Pré-projecto associado
                            </strong>

                        </div>


                        <div className="mb-3">

                            <span className="
                                text-600
                                block
                                mb-1
                            ">
                                Estudante
                            </span>

                            <strong className="text-900">
                                {
                                    selectedPreProject.student_name ||
                                    '-'
                                }
                            </strong>

                        </div>


                        <div className="mb-3">

                            <span className="
                                text-600
                                block
                                mb-1
                            ">
                                Título
                            </span>

                            <strong className="text-900">
                                {
                                    selectedPreProject.title
                                }
                            </strong>

                        </div>


                        <div>

                            <span className="
                                text-600
                                block
                                mb-1
                            ">
                                Área temática
                            </span>

                            <Tag
                                value={
                                    selectedPreProject.thematic_area
                                }
                                severity="info"
                            />

                        </div>

                    </Card>

                )}


                <div className="
                    flex
                    justify-content-end
                    gap-2
                    mt-5
                ">

                    <Button
                        label="Cancelar"
                        outlined
                        disabled={creating}
                        onClick={() =>
                            setCreateDialog(false)
                        }
                    />

                    <Button
                        label="Criar caderno"
                        icon="pi pi-check"
                        loading={creating}
                        disabled={
                            !selectedPreProject
                        }
                        onClick={
                            handleCreateNotebook
                        }
                    />

                </div>

            </Dialog>

        </div>
    );
};

export default GuidanceNotebooks;