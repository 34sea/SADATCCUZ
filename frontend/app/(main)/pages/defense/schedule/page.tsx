'use client';

import React, {
    useEffect,
    useRef,
    useState
} from 'react';

import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Tag } from 'primereact/tag';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Divider } from 'primereact/divider';
import { Toast } from 'primereact/toast';
import { MultiSelect } from 'primereact/multiselect';
import { ProgressSpinner } from 'primereact/progressspinner';

import {
    DefenseSchedule,
    DefenseRoom,
    DefenseStatus,
    JuryRole,
    CreateDefenseScheduleData,
    getDefenseRooms,
    getDefenseSchedules,
    createDefenseSchedule,
    updateDefenseSchedule,
    createDefenseRoom,
    addJuryMember
} from '@/app/api/scheduleDefense/scheduleDefense';

import {
    User,
    getUsers
} from '@/app/api/users/userService';
import { getPreProjects, PreProject } from '@/app/api/pre-projects/preProjectService';
import { getNotebookByPreProject, GuidanceNotebook3 } from '@/app/api/notebooks/guidanceNotebookService';

// import {
//     PreProject,
//     getPreProjects
// } from '@/app/api/preProject/preProjectService';


// =====================================================
// PAGE
// =====================================================

const DefenseSchedulePage = () => {

    const toast = useRef<Toast>(null);

    // =====================================================
    // DATA
    // =====================================================

    const [notebookId, setNotebookId] =
        useState<number | null>(null);

    const [notebook, setNotebook] =
        useState<GuidanceNotebook3 | null>(null);
    const [loadingNotebook, setLoadingNotebook] =
        useState(false);

    const [schedules, setSchedules] =
        useState<DefenseSchedule[]>([]);

    const [rooms, setRooms] =
        useState<DefenseRoom[]>([]);

    const [users, setUsers] =
        useState<User[]>([]);

    const [approvedProjects, setApprovedProjects] =
        useState<PreProject[]>([]);

    const [loading, setLoading] =
        useState(false);

    const [loadingUsers, setLoadingUsers] =
        useState(false);

    const [loadingProjects, setLoadingProjects] =
        useState(false);


    // =====================================================
    // FILTERS
    // =====================================================

    const [filterDate, setFilterDate] =
        useState<Date | null>(null);

    const [filterRoom, setFilterRoom] =
        useState<number | null>(null);

    const [filterStatus, setFilterStatus] =
        useState<DefenseStatus | null>(null);


    // =====================================================
    // DEFENSE DIALOG
    // =====================================================

    const [showDefenseDialog, setShowDefenseDialog] =
        useState(false);

    const [savingDefense, setSavingDefense] =
        useState(false);


    // =====================================================
    // DEFENSE FORM
    // =====================================================

    const [studentId, setStudentId] =
        useState<number | null>(null);

    // const [notebookId, setNotebookId] =
    //     useState<number | null>(null);

    const [tccTitle, setTccTitle] =
        useState('');

    const [defenseDate, setDefenseDate] =
        useState<Date | null>(null);

    const [startTime, setStartTime] =
        useState<Date | null>(null);

    const [endTime, setEndTime] =
        useState<Date | null>(null);

    const [roomId, setRoomId] =
        useState<number | null>(null);


    // =====================================================
    // JURY
    // =====================================================

    const [presidentId, setPresidentId] =
        useState<number | null>(null);

    const [opponentId, setOpponentId] =
        useState<number | null>(null);

    const [advisorId, setAdvisorId] =
        useState<number | null>(null);

    const [memberId, setMemberId] =
        useState<number | null>(null);


    // =====================================================
    // ROOM DIALOG
    // =====================================================

    const [showRoomDialog, setShowRoomDialog] =
        useState(false);

    const [savingRoom, setSavingRoom] =
        useState(false);

    const [roomName, setRoomName] =
        useState('');

    const [roomLocation, setRoomLocation] =
        useState('');

    const [roomCapacity, setRoomCapacity] =
        useState<number | null>(null);


    // =====================================================
    // LOAD DATA
    // =====================================================

    const loadData = async () => {

        try {

            setLoading(true);

            const [
                roomsData,
                schedulesData
            ] = await Promise.all([
                getDefenseRooms(),
                getDefenseSchedules()
            ]);

            setRooms(roomsData);
            setSchedules(schedulesData);

        } catch (error: any) {

            console.error(error);

            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail:
                    error?.response?.data?.message ||
                    'Não foi possível carregar os dados.',
                life: 4000
            });

        } finally {

            setLoading(false);
        }
    };


    // =====================================================
    // LOAD USERS
    // =====================================================

    const loadUsers = async () => {

        try {

            setLoadingUsers(true);

            const data = await getUsers({
                is_active: true
            });

            setUsers(data);

        } catch (error: any) {

            console.error(error);

            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail:
                    error?.response?.data?.message ||
                    'Não foi possível carregar os utilizadores.',
                life: 4000
            });

        } finally {

            setLoadingUsers(false);
        }
    };


    // =====================================================
    // LOAD APPROVED PROJECTS
    // =====================================================

    const loadApprovedProjects = async () => {

        try {

            setLoadingProjects(true);

            const data = await getPreProjects({
                status: 'APROVADO'
            });

            setApprovedProjects(data);

        } catch (error: any) {

            console.error(error);

            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail:
                    error?.response?.data?.message ||
                    'Não foi possível carregar os pré-projectos aprovados.',
                life: 4000
            });

        } finally {

            setLoadingProjects(false);
        }
    };


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        loadData();
        loadUsers();
        loadApprovedProjects();

    }, []);


    // =====================================================
    // FILTERS
    // =====================================================

    const applyFilters = async () => {

        try {

            setLoading(true);

            const data =
                await getDefenseSchedules({

                    defense_date:
                        filterDate
                            ? formatDateForApi(filterDate)
                            : undefined,

                    room_id:
                        filterRoom || undefined,

                    status:
                        filterStatus || undefined
                });

            setSchedules(data);

        } catch (error: any) {

            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail:
                    error?.response?.data?.message ||
                    'Erro ao filtrar as defesas.',
                life: 4000
            });

        } finally {

            setLoading(false);
        }
    };


    // =====================================================
    // CLEAR FILTERS
    // =====================================================

    const clearFilters = async () => {

        setFilterDate(null);
        setFilterRoom(null);
        setFilterStatus(null);

        await loadData();
    };


    // =====================================================
    // SELECT APPROVED PROJECT
    // =====================================================

    // const handleProjectChange = (
    //     projectId: number | null
    // ) => {

    //     if (!projectId) {

    //         setStudentId(null);
    //         setTccTitle('');
    //         setAdvisorId(null);

    //         return;
    //     }

    //     const project =
    //         approvedProjects.find(
    //             item => item.id === projectId
    //         );

    //     if (!project) {
    //         return;
    //     }

    //     setStudentId(project.student_id);

    //     setTccTitle(project.title);

    //     /*
    //      * Se o pré-projecto tiver orientador proposto,
    //      * utilizamos automaticamente como orientador da banca.
    //      */
    //     if (project.proposed_advisor_id) {

    //         setAdvisorId(
    //             project.proposed_advisor_id
    //         );
    //     }
    // };
    const handleProjectChange = async (
        projectId: number | null
    ) => {

        // ==========================================
        // LIMPAR
        // ==========================================

        if (!projectId) {

            setStudentId(null);
            setNotebookId(null);
            setTccTitle('');
            setAdvisorId(null);

            return;
        }

        // ==========================================
        // ENCONTRAR PRÉ-PROJECTO
        // ==========================================

        const project =
            approvedProjects.find(
                item => item.id === projectId
            );

        if (!project) {
            return;
        }

        // ==========================================
        // PREENCHER DADOS DO PROJECTO
        // ==========================================

        setStudentId(project.student_id);

        setTccTitle(project.title);

        // ==========================================
        // ORIENTADOR
        // ==========================================

        if (project.proposed_advisor_id) {

            setAdvisorId(
                project.proposed_advisor_id
            );

        } else {

            setAdvisorId(null);

        }

        // ==========================================
        // BUSCAR CADERNO DE ORIENTAÇÃO
        // ==========================================

        try {

            setLoadingNotebook(true);

            setNotebookId(null);

            const notebook =
                await getNotebookByPreProject(
                    project.id
                );
            setNotebook(notebook)

            // ======================================
            // PREENCHER AUTOMATICAMENTE
            // ======================================

            setNotebookId(
                notebook.id
            );

            // Se o orientador do caderno for a
            // referência oficial, também podemos
            // garantir o orientador automaticamente.
            if (notebook.advisor_id) {

                setAdvisorId(
                    notebook.advisor_id
                );
            }

        } catch (error: any) {

            console.error(
                'Erro ao buscar caderno:',
                error
            );

            setNotebookId(null);

            toast.current?.show({
                severity: 'warn',
                summary: 'Caderno de orientação',
                detail:
                    error?.response?.data?.message ||
                    'Este pré-projecto ainda não possui um caderno de orientação.',
                life: 5000
            });

        } finally {

            setLoadingNotebook(false);
        }
    };


    // =====================================================
    // CREATE DEFENSE
    // =====================================================

    const handleCreateDefense = async () => {

        if (!notebookId) {

            toast.current?.show({
                severity: 'warn',
                summary: 'Caderno de orientação',
                detail:
                    'O estudante selecionado não possui um caderno de orientação associado ao pré-projecto.',
                life: 5000
            });

            return;
        }

        if (
            !studentId ||
            !notebookId ||
            !tccTitle ||
            !defenseDate ||
            !startTime ||
            !endTime ||
            !roomId
        ) {

            toast.current?.show({
                severity: 'warn',
                summary: 'Atenção',
                detail:
                    'Preencha todos os campos obrigatórios.',
                life: 4000
            });

            return;
        }


        // =================================================
        // VALIDATE TIME
        // =================================================

        if (
            startTime &&
            endTime &&
            startTime >= endTime
        ) {

            toast.current?.show({
                severity: 'warn',
                summary: 'Horário inválido',
                detail:
                    'A hora de início deve ser anterior à hora de fim.',
                life: 4000
            });

            return;
        }


        // =================================================
        // VALIDATE JURY
        // =================================================

        const selectedJury = [
            presidentId,
            opponentId,
            advisorId,
            memberId
        ].filter(
            (id): id is number => id !== null
        );


        const uniqueJury =
            new Set(selectedJury);


        if (
            selectedJury.length !==
            uniqueJury.size
        ) {

            toast.current?.show({
                severity: 'warn',
                summary: 'Banca inválida',
                detail:
                    'Um mesmo utilizador não pode ocupar mais de uma função na banca.',
                life: 4000
            });

            return;
        }


        try {

            setSavingDefense(true);


            // =================================================
            // CREATE SCHEDULE
            // =================================================

            const payload:
                CreateDefenseScheduleData = {

                student_id: studentId,

                notebook_id: notebookId,

                tcc_title: tccTitle,

                defense_date:
                    formatDateForApi(
                        defenseDate
                    ),

                start_time:
                    formatTimeForApi(
                        startTime
                    ),

                end_time:
                    formatTimeForApi(
                        endTime
                    ),

                room_id: roomId
            };


            const defense =
                await createDefenseSchedule(
                    payload
                );


            // =================================================
            // ADD PRESIDENT
            // =================================================

            if (presidentId) {

                await addJuryMember(
                    defense.id,
                    presidentId,
                    'PRESIDENTE'
                );
            }


            // =================================================
            // ADD OPPONENT
            // =================================================

            if (opponentId) {

                await addJuryMember(
                    defense.id,
                    opponentId,
                    'OPONENTE'
                );
            }


            // =================================================
            // ADD ADVISOR
            // =================================================

            if (advisorId) {

                await addJuryMember(
                    defense.id,
                    advisorId,
                    'ORIENTADOR'
                );
            }


            // =================================================
            // ADD MEMBER
            // =================================================

            if (memberId) {

                await addJuryMember(
                    defense.id,
                    memberId,
                    'VOGAL'
                );
            }


            toast.current?.show({
                severity: 'success',
                summary: 'Sucesso',
                detail:
                    'Defesa agendada e banca atribuída com sucesso.',
                life: 5000
            });


            setShowDefenseDialog(false);

            resetDefenseForm();

            await loadData();

        } catch (error: any) {

            console.error(error);

            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail:
                    error?.response?.data?.message ||
                    'Não foi possível agendar a defesa.',
                life: 5000
            });

        } finally {

            setSavingDefense(false);
        }
    };


    // =====================================================
    // CREATE ROOM
    // =====================================================

    const handleCreateRoom = async () => {

        if (!roomName.trim()) {

            toast.current?.show({
                severity: 'warn',
                summary: 'Atenção',
                detail:
                    'Informe o nome da sala.',
                life: 4000
            });

            return;
        }


        if (
            roomCapacity !== null &&
            roomCapacity <= 0
        ) {

            toast.current?.show({
                severity: 'warn',
                summary: 'Capacidade inválida',
                detail:
                    'A capacidade deve ser maior que zero.',
                life: 4000
            });

            return;
        }


        try {

            setSavingRoom(true);

            await createDefenseRoom({

                name:
                    roomName.trim(),

                location:
                    roomLocation.trim() ||
                    undefined,

                capacity:
                    roomCapacity ||
                    undefined
            });


            toast.current?.show({
                severity: 'success',
                summary: 'Sucesso',
                detail:
                    'Sala criada com sucesso.',
                life: 4000
            });


            setShowRoomDialog(false);

            resetRoomForm();

            await loadData();

        } catch (error: any) {

            console.error(error);

            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail:
                    error?.response?.data?.message ||
                    'Não foi possível criar a sala.',
                life: 5000
            });

        } finally {

            setSavingRoom(false);
        }
    };


    // =====================================================
    // UPDATE STATUS
    // =====================================================

    const handleStatusChange = async (
        schedule: DefenseSchedule,
        status: DefenseStatus
    ) => {

        try {

            await updateDefenseSchedule(
                schedule.id,
                { status }
            );

            toast.current?.show({
                severity: 'success',
                summary: 'Atualizado',
                detail:
                    'Estado da defesa atualizado.',
                life: 3000
            });

            await loadData();

        } catch (error: any) {

            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail:
                    error?.response?.data?.message ||
                    'Não foi possível atualizar o estado.',
                life: 4000
            });
        }
    };


    // =====================================================
    // RESET DEFENSE FORM
    // =====================================================

    const resetDefenseForm = () => {

        setStudentId(null);
        setNotebookId(null);
        setTccTitle('');

        setDefenseDate(null);

        setStartTime(null);
        setEndTime(null);

        setRoomId(null);

        setPresidentId(null);
        setOpponentId(null);
        setAdvisorId(null);
        setMemberId(null);
    };


    // =====================================================
    // RESET ROOM FORM
    // =====================================================

    const resetRoomForm = () => {

        setRoomName('');
        setRoomLocation('');
        setRoomCapacity(null);
    };


    // =====================================================
    // OPEN DEFENSE DIALOG
    // =====================================================

    const openDefenseDialog = () => {

        resetDefenseForm();

        setShowDefenseDialog(true);
    };


    // =====================================================
    // STATUS TEMPLATE
    // =====================================================

    const statusTemplate = (
        row: DefenseSchedule
    ) => {

        const severity =
            row.status === 'AGENDADO'
                ? 'info'
                : row.status === 'REALIZADO'
                    ? 'success'
                    : 'danger';

        return (
            <Tag
                value={row.status}
                severity={severity}
            />
        );
    };


    // =====================================================
    // DATE TEMPLATE
    // =====================================================

    const dateTemplate = (
        row: DefenseSchedule
    ) => {

        if (!row.defense_date) {
            return '-';
        }

        return new Date(
            row.defense_date
        ).toLocaleDateString(
            'pt-PT'
        );
    };


    // =====================================================
    // ROOM TEMPLATE
    // =====================================================

    const roomTemplate = (
        row: DefenseSchedule
    ) => {

        return (
            <div>

                <span className="block font-medium">
                    {row.room_name ||
                        'Sala não definida'}
                </span>

                {row.room_location && (
                    <small className="text-500">
                        {row.room_location}
                    </small>
                )}

            </div>
        );
    };


    // =====================================================
    // JURY TEMPLATE
    // =====================================================

    const juryTemplate = (
        row: DefenseSchedule
    ) => {

        if (
            !row.jury_members ||
            row.jury_members.length === 0
        ) {

            return (
                <span className="text-500">
                    Banca não definida
                </span>
            );
        }


        return (
            <div className="flex flex-column gap-1">

                {row.jury_members.map(
                    (
                        member,
                        index
                    ) => (

                        <div
                            key={
                                member.id ||
                                `${member.user_id}-${index}`
                            }
                            className="flex align-items-center gap-2"
                        >

                            <i className="pi pi-user text-500" />

                            <span>
                                {member.member_name ||
                                    `Utilizador #${member.user_id}`}
                            </span>

                            <Tag
                                value={
                                    formatJuryRole(
                                        member.role_in_jury
                                    )
                                }
                                severity="info"
                            />

                        </div>
                    )
                )}

            </div>
        );
    };


    // =====================================================
    // DOCUMENT TEMPLATE
    // =====================================================

    const documentTemplate = (
        row: DefenseSchedule
    ) => {

        if (!row.tcc_document_url) {

            return (
                <Tag
                    value="Pendente"
                    severity="warning"
                    icon="pi pi-clock"
                />
            );
        }


        // return (
        //     <Button
        //         label="PDF"
        //         icon="pi pi-file-pdf"
        //         size="small"
        //         text
        //         onClick={() =>
        //             window.open(
        //                 row.tcc_document_url,
        //                 '_blank',
        //                 'noopener,noreferrer'
        //             )
        //         }
        //     />
        // );
        <Button
            label="PDF"
            icon="pi pi-file-pdf"
            size="small"
            text
            disabled={!row.tcc_document_url} // Option 1: Disable button if null
            onClick={() => {
                if (row.tcc_document_url) { // Option 2: Check inside click handler
                    window.open(
                        row.tcc_document_url,
                        '_blank',
                        'noopener,noreferrer'
                    );
                }
            }}
        />
    };


    // =====================================================
    // ACTIONS TEMPLATE
    // =====================================================

    const actionsTemplate = (
        row: DefenseSchedule
    ) => {

        return (
            <div className="flex gap-1">

                {row.status === 'AGENDADO' && (

                    <Button
                        icon="pi pi-check"
                        rounded
                        text
                        severity="success"
                        tooltip="Marcar como realizada"
                        onClick={() =>
                            handleStatusChange(
                                row,
                                'REALIZADO'
                            )
                        }
                    />

                )}


                {row.status === 'AGENDADO' && (

                    <Button
                        icon="pi pi-times"
                        rounded
                        text
                        severity="danger"
                        tooltip="Cancelar defesa"
                        onClick={() =>
                            handleStatusChange(
                                row,
                                'CANCELADO'
                            )
                        }
                    />

                )}

            </div>
        );
    };


    // =====================================================
    // ROOM OPTIONS
    // =====================================================

    const roomOptions = rooms
        .filter(
            room => room.is_active
        )
        .map(
            room => ({
                label:
                    room.location
                        ? `${room.name} — ${room.location}`
                        : room.name,

                value: room.id
            })
        );


    // =====================================================
    // PROJECT OPTIONS
    // =====================================================

    const projectOptions =
        approvedProjects.map(
            project => ({
                label:
                    `${project.student_name || `Estudante #${project.student_id}`} — ${project.title}`,

                value: project.id
            })
        );


    // =====================================================
    // USER OPTIONS
    // =====================================================

    const userOptions = users
        .filter(
            user =>
                user.id !== studentId
        )
        .map(
            user => ({
                label:
                    `${user.name} — ${user.email}`,

                value: user.id
            })
        );


    // =====================================================
    // STATUS OPTIONS
    // =====================================================

    const statusOptions = [

        {
            label: 'Agendado',
            value: 'AGENDADO'
        },

        {
            label: 'Realizado',
            value: 'REALIZADO'
        },

        {
            label: 'Cancelado',
            value: 'CANCELADO'
        }

    ];


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

                <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-3">

                    <div>

                        <h3 className="text-900 font-semibold m-0">
                            Agendamento de Defesas
                        </h3>

                        <p className="text-600 mt-2 mb-0">
                            Agende as defesas, organize as salas
                            e atribua a banca examinadora.
                        </p>

                    </div>


                    <div className="flex gap-2">

                        <Button
                            label="Salas"
                            icon="pi pi-building"
                            outlined
                            onClick={() => {

                                resetRoomForm();

                                setShowRoomDialog(true);

                            }}
                        />

                        <Button
                            label="Agendar defesa"
                            icon="pi pi-calendar-plus"
                            onClick={
                                openDefenseDialog
                            }
                        />

                    </div>

                </div>

            </div>


            {/* =====================================================
                SUMMARY
            ===================================================== */}

            <div className="col-12 md:col-3">

                <Card>

                    <div className="flex justify-content-between">

                        <div>

                            <span className="text-500 block mb-2">
                                Total de defesas
                            </span>

                            <span className="text-900 text-2xl font-semibold">
                                {schedules.length}
                            </span>

                        </div>

                        <div
                            className="flex align-items-center justify-content-center bg-blue-100 border-round"
                            style={{
                                width: '2.5rem',
                                height: '2.5rem'
                            }}
                        >
                            <i className="pi pi-calendar text-blue-500 text-xl" />
                        </div>

                    </div>

                </Card>

            </div>


            <div className="col-12 md:col-3">

                <Card>

                    <div className="flex justify-content-between">

                        <div>

                            <span className="text-500 block mb-2">
                                Agendadas
                            </span>

                            <span className="text-900 text-2xl font-semibold">

                                {
                                    schedules.filter(
                                        s =>
                                            s.status ===
                                            'AGENDADO'
                                    ).length
                                }

                            </span>

                        </div>

                        <div
                            className="flex align-items-center justify-content-center bg-orange-100 border-round"
                            style={{
                                width: '2.5rem',
                                height: '2.5rem'
                            }}
                        >
                            <i className="pi pi-clock text-orange-500 text-xl" />
                        </div>

                    </div>

                </Card>

            </div>


            <div className="col-12 md:col-3">

                <Card>

                    <div className="flex justify-content-between">

                        <div>

                            <span className="text-500 block mb-2">
                                Realizadas
                            </span>

                            <span className="text-900 text-2xl font-semibold">

                                {
                                    schedules.filter(
                                        s =>
                                            s.status ===
                                            'REALIZADO'
                                    ).length
                                }

                            </span>

                        </div>

                        <div
                            className="flex align-items-center justify-content-center bg-green-100 border-round"
                            style={{
                                width: '2.5rem',
                                height: '2.5rem'
                            }}
                        >
                            <i className="pi pi-check-circle text-green-500 text-xl" />
                        </div>

                    </div>

                </Card>

            </div>


            <div className="col-12 md:col-3">

                <Card>

                    <div className="flex justify-content-between">

                        <div>

                            <span className="text-500 block mb-2">
                                PDFs entregues
                            </span>

                            <span className="text-900 text-2xl font-semibold">

                                {
                                    schedules.filter(
                                        s =>
                                            !!s.tcc_document_url
                                    ).length
                                }

                            </span>

                        </div>

                        <div
                            className="flex align-items-center justify-content-center bg-purple-100 border-round"
                            style={{
                                width: '2.5rem',
                                height: '2.5rem'
                            }}
                        >
                            <i className="pi pi-file-pdf text-purple-500 text-xl" />
                        </div>

                    </div>

                </Card>

            </div>


            {/* =====================================================
                FILTERS
            ===================================================== */}

            <div className="col-12">

                <Card>

                    <div className="grid">

                        <div className="col-12 md:col-3">

                            <label className="block text-900 font-medium mb-2">
                                Data
                            </label>

                            <Calendar
                                value={filterDate}
                                onChange={e =>
                                    setFilterDate(
                                        e.value as Date
                                    )
                                }
                                dateFormat="dd/mm/yy"
                                showIcon
                                className="w-full"
                                placeholder="Filtrar por data"
                            />

                        </div>


                        <div className="col-12 md:col-3">

                            <label className="block text-900 font-medium mb-2">
                                Sala
                            </label>

                            <Dropdown
                                value={filterRoom}
                                options={roomOptions}
                                onChange={e =>
                                    setFilterRoom(
                                        e.value
                                    )
                                }
                                placeholder="Todas as salas"
                                className="w-full"
                                showClear
                            />

                        </div>


                        <div className="col-12 md:col-3">

                            <label className="block text-900 font-medium mb-2">
                                Estado
                            </label>

                            <Dropdown
                                value={filterStatus}
                                options={statusOptions}
                                onChange={e =>
                                    setFilterStatus(
                                        e.value
                                    )
                                }
                                placeholder="Todos os estados"
                                className="w-full"
                                showClear
                            />

                        </div>


                        <div className="col-12 md:col-3 flex align-items-end gap-2">

                            <Button
                                label="Filtrar"
                                icon="pi pi-filter"
                                className="flex-1"
                                onClick={
                                    applyFilters
                                }
                                loading={loading}
                            />

                            <Button
                                icon="pi pi-refresh"
                                outlined
                                tooltip="Limpar filtros"
                                onClick={
                                    clearFilters
                                }
                            />

                        </div>

                    </div>

                </Card>

            </div>


            {/* =====================================================
                TABLE
            ===================================================== */}

            <div className="col-12">

                <Card>

                    <div className="flex justify-content-between align-items-center">

                        <div>

                            <h5 className="text-900 m-0">
                                Calendário de Defesas
                            </h5>

                            <small className="text-500">
                                Defesas registadas no sistema
                            </small>

                        </div>

                    </div>


                    <Divider />


                    <DataTable
                        value={schedules}
                        loading={loading}
                        paginator
                        rows={10}
                        responsiveLayout="scroll"
                        emptyMessage="Nenhuma defesa encontrada."
                    >

                        <Column
                            field="student_name"
                            header="Estudante"
                        />

                        <Column
                            field="tcc_title"
                            header="Tema do TCC"
                            style={{
                                minWidth: '280px'
                            }}
                        />

                        <Column
                            header="Data"
                            body={dateTemplate}
                        />

                        <Column
                            header="Horário"
                            body={(row: DefenseSchedule) =>
                                `${row.start_time} - ${row.end_time}`
                            }
                        />

                        <Column
                            header="Sala"
                            body={roomTemplate}
                        />

                        <Column
                            header="Banca"
                            body={juryTemplate}
                            style={{
                                minWidth: '320px'
                            }}
                        />

                        <Column
                            header="Documento"
                            body={documentTemplate}
                        />

                        <Column
                            header="Estado"
                            body={statusTemplate}
                        />

                        <Column
                            header="Ações"
                            body={actionsTemplate}
                        />

                    </DataTable>

                </Card>

            </div>


            {/* =====================================================
                DEFENSE DIALOG
            ===================================================== */}

            <Dialog
                visible={showDefenseDialog}
                onHide={() =>
                    setShowDefenseDialog(false)
                }
                header="Agendar Defesa"
                modal
                style={{
                    width: '850px'
                }}
                breakpoints={{
                    '960px': '90vw',
                    '640px': '95vw'
                }}
            >

                <div className="grid">

                    {/* =================================================
                        PROJECT
                    ================================================= */}

                    <div className="col-12">

                        <div className="surface-100 border-round p-3 mb-3">

                            <div className="flex align-items-center gap-2 mb-2">

                                <i className="pi pi-file text-primary" />

                                <span className="font-semibold text-900">
                                    Trabalho de Culminação de Curso
                                </span>

                            </div>

                            <small className="text-600">
                                Selecione um pré-projecto aprovado.
                                O estudante e o título serão preenchidos
                                automaticamente.
                            </small>

                        </div>

                    </div>


                    {/* PROJECT */}

                    <div className="col-12">

                        <label className="block text-900 font-medium mb-2">
                            Pré-projecto aprovado *
                        </label>

                        <Dropdown
                            value={
                                approvedProjects.find(
                                    project =>
                                        project.student_id ===
                                        studentId &&
                                        project.title ===
                                        tccTitle
                                )?.id || null
                            }
                            options={
                                projectOptions
                            }
                            onChange={e =>
                                handleProjectChange(
                                    e.value
                                )
                            }
                            placeholder={
                                loadingProjects
                                    ? 'Carregando pré-projectos...'
                                    : 'Selecionar pré-projecto aprovado'
                            }
                            className="w-full"
                            filter
                            showClear
                            disabled={
                                loadingProjects
                            }
                        />

                    </div>


                    {/* STUDENT */}

                    <div className="col-12 md:col-6">

                        <label className="block text-900 font-medium mb-2">
                            Estudante
                        </label>

                        <InputText
                            value={
                                studentId
                                    ? (
                                        approvedProjects.find(
                                            p =>
                                                p.student_id ===
                                                studentId &&
                                                p.title ===
                                                tccTitle
                                        )?.student_name ||
                                        `Estudante #${studentId}`
                                    )
                                    : ''
                            }
                            className="w-full"
                            disabled
                            placeholder="Será preenchido automaticamente"
                        />

                    </div>


                    {/* NOTEBOOK */}

                    <div className="col-12 md:col-6">

                        <label className="block text-900 font-medium mb-2">
                            Caderno de orientação *
                        </label>

                        <InputText
                            value={
                                loadingNotebook
                                    ? 'A carregar caderno...'
                                    : notebook
                                        ? `Caderno #${notebook.id} — ${notebook.advisor_name || 'Orientador'}`
                                        : ''
                            }
                            className="w-full"
                            disabled
                            placeholder="Será preenchido automaticamente"
                        />

                        <small
                            className={
                                notebook
                                    ? 'text-green-600'
                                    : 'text-500'
                            }
                        >
                            {loadingNotebook
                                ? 'A procurar o caderno de orientação...'
                                : notebook
                                    ? 'Caderno associado automaticamente ao pré-projecto.'
                                    : 'Selecione um pré-projecto aprovado.'
                            }
                        </small>

                    </div>


                    {/* TITLE */}

                    <div className="col-12">

                        <label className="block text-900 font-medium mb-2">
                            Título do TCC *
                        </label>

                        <InputText
                            value={tccTitle}
                            onChange={e =>
                                setTccTitle(
                                    e.target.value
                                )
                            }
                            className="w-full"
                            placeholder="Título do Trabalho de Culminação de Curso"
                        />

                    </div>


                    {/* DATE */}

                    <div className="col-12 md:col-4">

                        <label className="block text-900 font-medium mb-2">
                            Data *
                        </label>

                        <Calendar
                            value={defenseDate}
                            onChange={e =>
                                setDefenseDate(
                                    e.value as Date
                                )
                            }
                            className="w-full"
                            showIcon
                            dateFormat="dd/mm/yy"
                            minDate={
                                new Date()
                            }
                        />

                    </div>


                    {/* START */}

                    <div className="col-12 md:col-4">

                        <label className="block text-900 font-medium mb-2">
                            Início *
                        </label>

                        <Calendar
                            value={startTime}
                            onChange={e =>
                                setStartTime(
                                    e.value as Date
                                )
                            }
                            timeOnly
                            hourFormat="24"
                            className="w-full"
                        />

                    </div>


                    {/* END */}

                    <div className="col-12 md:col-4">

                        <label className="block text-900 font-medium mb-2">
                            Fim *
                        </label>

                        <Calendar
                            value={endTime}
                            onChange={e =>
                                setEndTime(
                                    e.value as Date
                                )
                            }
                            timeOnly
                            hourFormat="24"
                            className="w-full"
                        />

                    </div>


                    {/* ROOM */}

                    <div className="col-12">

                        <label className="block text-900 font-medium mb-2">
                            Sala *
                        </label>

                        <Dropdown
                            value={roomId}
                            options={
                                roomOptions
                            }
                            onChange={e =>
                                setRoomId(
                                    e.value
                                )
                            }
                            placeholder="Selecionar sala"
                            className="w-full"
                            filter
                            showClear
                        />

                    </div>


                    {/* =================================================
                        JURY
                    ================================================= */}

                    <div className="col-12">

                        <Divider align="left">

                            <div className="flex align-items-center gap-2">

                                <i className="pi pi-users" />

                                <span className="font-semibold">
                                    Composição da banca
                                </span>

                            </div>

                        </Divider>

                        <small className="text-500">
                            Atribua os membros da banca de acordo
                            com a função que irão desempenhar.
                        </small>

                    </div>


                    {/* PRESIDENT */}

                    <div className="col-12 md:col-6">

                        <label className="block text-900 font-medium mb-2">

                            <i className="pi pi-star-fill mr-2 text-primary" />

                            Presidente

                        </label>

                        <Dropdown
                            value={presidentId}
                            options={
                                userOptions.filter(
                                    user =>
                                        user.value !==
                                        opponentId &&
                                        user.value !==
                                        advisorId &&
                                        user.value !==
                                        memberId
                                )
                            }
                            onChange={e =>
                                setPresidentId(
                                    e.value
                                )
                            }
                            placeholder="Selecionar presidente"
                            className="w-full"
                            filter
                            showClear
                            disabled={loadingUsers}
                            emptyMessage={loadingUsers ? "Carregando usuários..." : "Nenhum resultado encontrado"}
                        // loading={
                        //     loadingUsers
                        // }
                        />

                    </div>


                    {/* OPPONENT */}

                    <div className="col-12 md:col-6">

                        <label className="block text-900 font-medium mb-2">

                            <i className="pi pi-comments mr-2 text-orange-500" />

                            Oponente

                        </label>

                        <Dropdown
                            value={opponentId}
                            options={
                                userOptions.filter(
                                    user =>
                                        user.value !==
                                        presidentId &&
                                        user.value !==
                                        advisorId &&
                                        user.value !==
                                        memberId
                                )
                            }
                            onChange={e =>
                                setOpponentId(
                                    e.value
                                )
                            }
                            placeholder="Selecionar oponente"
                            className="w-full"
                            filter
                            showClear
                            disabled={loadingUsers}
                            emptyMessage={loadingUsers ? "Carregando usuários..." : "Nenhum resultado encontrado"}
                        />

                    </div>


                    {/* ADVISOR */}

                    <div className="col-12 md:col-6">

                        <label className="block text-900 font-medium mb-2">

                            <i className="pi pi-user mr-2 text-green-500" />

                            Orientador

                        </label>

                        <Dropdown
                            value={advisorId}
                            options={
                                userOptions.filter(
                                    user =>
                                        user.value !==
                                        presidentId &&
                                        user.value !==
                                        opponentId &&
                                        user.value !==
                                        memberId
                                )
                            }
                            onChange={e =>
                                setAdvisorId(
                                    e.value
                                )
                            }
                            placeholder="Selecionar orientador"
                            className="w-full"
                            filter
                            showClear
                            disabled={loadingUsers}
                            emptyMessage={loadingUsers ? "Carregando usuários..." : "Nenhum resultado encontrado"}
                        />

                    </div>


                    {/* VOGAL */}

                    <div className="col-12 md:col-6">

                        <label className="block text-900 font-medium mb-2">

                            <i className="pi pi-user-plus mr-2 text-purple-500" />

                            Vogal

                        </label>

                        <Dropdown
                            value={memberId}
                            options={
                                userOptions.filter(
                                    user =>
                                        user.value !==
                                        presidentId &&
                                        user.value !==
                                        opponentId &&
                                        user.value !==
                                        advisorId
                                )
                            }
                            onChange={e =>
                                setMemberId(
                                    e.value
                                )
                            }
                            placeholder="Selecionar vogal"
                            className="w-full"
                            filter
                            showClear
                            disabled={loadingUsers}
                            emptyMessage={loadingUsers ? "Carregando usuários..." : "Nenhum resultado encontrado"}
                        />

                    </div>


                    {/* DOCUMENT NOTICE */}

                    <div className="col-12">

                        <div className="surface-100 border-round p-3 flex align-items-start gap-3">

                            <i className="pi pi-info-circle text-primary text-xl mt-1" />

                            <div>

                                <span className="font-semibold text-900 block mb-1">
                                    Documento do TCC
                                </span>

                                <span className="text-600 text-sm">
                                    O PDF não é carregado durante o agendamento.
                                    Depois de a defesa ser agendada, o estudante
                                    poderá entrar no sistema e carregar o seu
                                    documento final.
                                </span>

                            </div>

                        </div>

                    </div>


                    {/* FOOTER */}

                    <div className="col-12">

                        <Divider />

                        <div className="flex justify-content-end gap-2">

                            <Button
                                label="Cancelar"
                                icon="pi pi-times"
                                text
                                onClick={() =>
                                    setShowDefenseDialog(
                                        false
                                    )
                                }
                            />

                            <Button
                                label="Agendar defesa"
                                icon="pi pi-calendar-plus"
                                loading={
                                    savingDefense
                                }
                                onClick={
                                    handleCreateDefense
                                }
                            />

                        </div>

                    </div>

                </div>

            </Dialog>


            {/* =====================================================
                ROOM DIALOG
            ===================================================== */}

            <Dialog
                visible={showRoomDialog}
                onHide={() =>
                    setShowRoomDialog(false)
                }
                header="Gestão de Salas"
                modal
                style={{
                    width: '650px'
                }}
                breakpoints={{
                    '640px': '95vw'
                }}
            >

                <div className="grid">

                    {/* INFORMATION */}

                    <div className="col-12">

                        <div className="surface-100 border-round p-3">

                            <div className="flex align-items-center gap-2 mb-2">

                                <i className="pi pi-building text-primary" />

                                <span className="font-semibold">
                                    Nova sala de defesa
                                </span>

                            </div>

                            <small className="text-600">
                                Cadastre a sala onde as defesas
                                serão realizadas.
                            </small>

                        </div>

                    </div>


                    {/* NAME */}

                    <div className="col-12">

                        <label className="block text-900 font-medium mb-2">
                            Nome da sala *
                        </label>

                        <InputText
                            value={
                                roomName
                            }
                            onChange={e =>
                                setRoomName(
                                    e.target.value
                                )
                            }
                            className="w-full"
                            placeholder="Ex.: Sala de Defesas 01"
                        />

                    </div>


                    {/* LOCATION */}

                    <div className="col-12 md:col-6">

                        <label className="block text-900 font-medium mb-2">
                            Localização
                        </label>

                        <InputText
                            value={
                                roomLocation
                            }
                            onChange={e =>
                                setRoomLocation(
                                    e.target.value
                                )
                            }
                            className="w-full"
                            placeholder="Ex.: Bloco A, 2º andar"
                        />

                    </div>


                    {/* CAPACITY */}

                    <div className="col-12 md:col-6">

                        <label className="block text-900 font-medium mb-2">
                            Capacidade
                        </label>

                        <InputText
                            value={
                                roomCapacity !== null
                                    ? String(
                                        roomCapacity
                                    )
                                    : ''
                            }
                            onChange={e => {

                                const value =
                                    e.target.value;

                                setRoomCapacity(
                                    value
                                        ? Number(value)
                                        : null
                                );

                            }}
                            type="number"
                            min={1}
                            className="w-full"
                            placeholder="Ex.: 30"
                        />

                    </div>


                    {/* EXISTING ROOMS */}

                    <div className="col-12">

                        <Divider align="left">

                            <span className="font-semibold">
                                Salas existentes
                            </span>

                        </Divider>


                        {rooms.length === 0 ? (

                            <div className="text-center text-500 p-4">
                                Nenhuma sala cadastrada.
                            </div>

                        ) : (

                            <div className="flex flex-column gap-2">

                                {rooms.map(
                                    room => (

                                        <div
                                            key={
                                                room.id
                                            }
                                            className="surface-100 border-round p-3 flex justify-content-between align-items-center"
                                        >

                                            <div>

                                                <span className="font-medium text-900 block">
                                                    {room.name}
                                                </span>

                                                {room.location && (
                                                    <small className="text-500">
                                                        {room.location}
                                                    </small>
                                                )}

                                            </div>


                                            <div className="flex align-items-center gap-2">

                                                {room.capacity && (

                                                    <Tag
                                                        value={`${room.capacity} lugares`}
                                                        severity="info"
                                                    />

                                                )}

                                                <Tag
                                                    value={
                                                        room.is_active
                                                            ? 'Ativa'
                                                            : 'Inativa'
                                                    }
                                                    severity={
                                                        room.is_active
                                                            ? 'success'
                                                            : 'danger'
                                                    }
                                                />

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                    </div>


                    {/* FOOTER */}

                    <div className="col-12">

                        <Divider />

                        <div className="flex justify-content-end gap-2">

                            <Button
                                label="Cancelar"
                                icon="pi pi-times"
                                text
                                onClick={() =>
                                    setShowRoomDialog(
                                        false
                                    )
                                }
                            />

                            <Button
                                label="Criar sala"
                                icon="pi pi-plus"
                                loading={
                                    savingRoom
                                }
                                onClick={
                                    handleCreateRoom
                                }
                            />

                        </div>

                    </div>

                </div>

            </Dialog>

        </div>
    );
};


// =====================================================
// HELPERS
// =====================================================

const formatDateForApi = (
    date: Date
): string => {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, '0');

    const day =
        String(
            date.getDate()
        ).padStart(2, '0');

    return `${year}-${month}-${day}`;
};


const formatTimeForApi = (
    date: Date
): string => {

    const hours =
        String(
            date.getHours()
        ).padStart(2, '0');

    const minutes =
        String(
            date.getMinutes()
        ).padStart(2, '0');

    const seconds =
        String(
            date.getSeconds()
        ).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
};


const formatJuryRole = (
    role: JuryRole
): string => {

    switch (role) {

        case 'PRESIDENTE':
            return 'Presidente';

        case 'OPONENTE':
            return 'Oponente';

        case 'ORIENTADOR':
            return 'Orientador';

        case 'VOGAL':
            return 'Vogal';

        default:
            return role;
    }
};


export default DefenseSchedulePage;