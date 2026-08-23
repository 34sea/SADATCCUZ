'use client';

import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';

interface Defense {
    id: number;
    student: string;
    title: string;
    course: string;
    advisor: string;
    date: Date;
    time: string;
    room: string;
    status: string;
    jury: string[];
}

const AcademicDefenseCalendar = () => {

    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
    const [selectedAdvisor, setSelectedAdvisor] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

    const [selectedDefense, setSelectedDefense] = useState<Defense | null>(null);
    const [dialogVisible, setDialogVisible] = useState(false);

    const defenses: Defense[] = [
        {
            id: 1,
            student: 'João Manuel',
            title: 'Sistema de gestão digital do ciclo de vida do TCC',
            course: 'Engenharia Informática',
            advisor: 'Mestre Cristian Franklin Coulon',
            date: new Date(2026, 7, 20),
            time: '09:00',
            room: 'Sala de Defesas 01',
            status: 'Agendada',
            jury: [
                'Mestre Cristian Franklin Coulon',
                'Dr. António Manuel',
                'Mestre Carlos Domingos'
            ]
        },
        {
            id: 2,
            student: 'Maria da Conceição',
            title: 'Sistema inteligente de acompanhamento académico',
            course: 'Engenharia Informática',
            advisor: 'Dra. Maria José',
            date: new Date(2026, 7, 20),
            time: '11:00',
            room: 'Sala de Defesas 02',
            status: 'Agendada',
            jury: [
                'Dra. Maria José',
                'Mestre Paulo Alberto',
                'Dr. António Manuel'
            ]
        },
        {
            id: 3,
            student: 'Carlos Alberto',
            title: 'Aplicação móvel para gestão de processos académicos',
            course: 'Engenharia Informática',
            advisor: 'Mestre Carlos Domingos',
            date: new Date(2026, 7, 21),
            time: '09:00',
            room: 'Auditório FCT',
            status: 'Concluída',
            jury: [
                'Mestre Carlos Domingos',
                'Dra. Maria José',
                'Mestre Paulo Alberto'
            ]
        },
        {
            id: 4,
            student: 'Ana Paula',
            title: 'Plataforma web para gestão universitária',
            course: 'Engenharia Informática',
            advisor: 'Mestre Paulo Alberto',
            date: new Date(2026, 7, 22),
            time: '14:00',
            room: 'Sala de Defesas 01',
            status: 'Agendada',
            jury: [
                'Mestre Paulo Alberto',
                'Dr. António Manuel',
                'Mestre Carlos Domingos'
            ]
        }
    ];

    const courses = [
        { label: 'Engenharia Informática', value: 'Engenharia Informática' },
        { label: 'Gestão Portuária', value: 'Gestão Portuária' }
    ];

    const advisors = [
        {
            label: 'Mestre Cristian Franklin Coulon',
            value: 'Mestre Cristian Franklin Coulon'
        },
        {
            label: 'Dra. Maria José',
            value: 'Dra. Maria José'
        },
        {
            label: 'Mestre Carlos Domingos',
            value: 'Mestre Carlos Domingos'
        },
        {
            label: 'Mestre Paulo Alberto',
            value: 'Mestre Paulo Alberto'
        }
    ];

    const statuses = [
        { label: 'Agendada', value: 'Agendada' },
        { label: 'Concluída', value: 'Concluída' },
        { label: 'Cancelada', value: 'Cancelada' }
    ];

    const filteredDefenses = defenses.filter((defense) => {

        const courseMatch =
            !selectedCourse ||
            defense.course === selectedCourse;

        const advisorMatch =
            !selectedAdvisor ||
            defense.advisor === selectedAdvisor;

        const statusMatch =
            !selectedStatus ||
            defense.status === selectedStatus;

        const dateMatch =
            !selectedDate ||
            defense.date.toDateString() === selectedDate.toDateString();

        return courseMatch &&
            advisorMatch &&
            statusMatch &&
            dateMatch;
    });

    const statusTemplate = (rowData: Defense) => {

        let severity:
            | 'success'
            | 'warning'
            | 'danger'
            | 'info'
            | undefined;

        if (rowData.status === 'Agendada') {
            severity = 'info';
        }

        if (rowData.status === 'Concluída') {
            severity = 'success';
        }

        if (rowData.status === 'Cancelada') {
            severity = 'danger';
        }

        return (
            <Tag
                value={rowData.status}
                severity={severity}
            />
        );
    };

    const dateTemplate = (rowData: Defense) => {
        return rowData.date.toLocaleDateString('pt-PT');
    };

    const actionTemplate = (rowData: Defense) => {

        return (
            <Button
                icon="pi pi-eye"
                rounded
                text
                tooltip="Ver detalhes"
                tooltipOptions={{ position: 'top' }}
                onClick={() => {
                    setSelectedDefense(rowData);
                    setDialogVisible(true);
                }}
            />
        );
    };

    const clearFilters = () => {
        setSelectedDate(null);
        setSelectedCourse(null);
        setSelectedAdvisor(null);
        setSelectedStatus(null);
    };

    const calendarDateTemplate = (date: any) => {

        const currentDate = new Date(
            date.year,
            date.month,
            date.day
        );

        const hasDefense = defenses.some(
            (defense) =>
                defense.date.toDateString() === currentDate.toDateString()
        );

        return (
            <div
                className={
                    hasDefense
                        ? 'flex align-items-center justify-content-center border-circle bg-primary text-white'
                        : ''
                }
                style={{
                    width: '2rem',
                    height: '2rem'
                }}
            >
                {date.day}
            </div>
        );
    };

    return (
        <div className="grid">

            {/* CABEÇALHO */}
            <div className="col-12">

                <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-3">

                    <div>
                        <h2 className="text-900 font-semibold m-0">
                            Calendário Académico de Defesas
                        </h2>

                        <p className="text-600 mt-2 mb-0">
                            Consulte e acompanhe as defesas públicas agendadas.
                        </p>
                    </div>

                    <Button
                        label="Nova Defesa"
                        icon="pi pi-calendar-plus"
                        outlined
                        onClick={() => {
                            window.location.href =
                                '/pages/defesas/agendamento';
                        }}
                    />

                </div>

            </div>

            {/* =========================================================
    CARDS DE RESUMO
========================================================= */}

<div className="col-12 lg:col-6 xl:col-3">

    <div className="card mb-0 h-full">

        <div className="flex justify-content-between align-items-start">

            <div>

                <span className="block text-500 font-medium mb-2">
                    Total de defesas
                </span>

                <div className="text-900 font-medium text-2xl">
                    {defenses.length}
                </div>

                <span className="text-500 text-sm">
                    Registadas no sistema
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

    </div>

</div>


<div className="col-12 lg:col-6 xl:col-3">

    <div className="card mb-0 h-full">

        <div className="flex justify-content-between align-items-start">

            <div>

                <span className="block text-500 font-medium mb-2">
                    Agendadas
                </span>

                <div className="text-900 font-medium text-2xl">
                    {
                        defenses.filter(
                            d => d.status === 'Agendada'
                        ).length
                    }
                </div>

                <span className="text-500 text-sm">
                    Por realizar
                </span>

            </div>

            <div
                className="flex align-items-center justify-content-center bg-cyan-100 border-round"
                style={{
                    width: '2.5rem',
                    height: '2.5rem'
                }}
            >
                <i className="pi pi-clock text-cyan-500 text-xl" />
            </div>

        </div>

    </div>

</div>


<div className="col-12 lg:col-6 xl:col-3">

    <div className="card mb-0 h-full">

        <div className="flex justify-content-between align-items-start">

            <div>

                <span className="block text-500 font-medium mb-2">
                    Concluídas
                </span>

                <div className="text-900 font-medium text-2xl">
                    {
                        defenses.filter(
                            d => d.status === 'Concluída'
                        ).length
                    }
                </div>

                <span className="text-500 text-sm">
                    Defesas realizadas
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

    </div>

</div>


<div className="col-12 lg:col-6 xl:col-3">

    <div className="card mb-0 h-full">

        <div className="flex justify-content-between align-items-start">

            <div>

                <span className="block text-500 font-medium mb-2">
                    Este mês
                </span>

                <div className="text-900 font-medium text-2xl">
                    {
                        defenses.filter((defense) => {
                            const now = new Date();

                            return (
                                defense.date.getMonth() === now.getMonth() &&
                                defense.date.getFullYear() === now.getFullYear()
                            );
                        }).length
                    }
                </div>

                <span className="text-500 text-sm">
                    Defesas previstas
                </span>

            </div>

            <div
                className="flex align-items-center justify-content-center bg-orange-100 border-round"
                style={{
                    width: '2.5rem',
                    height: '2.5rem'
                }}
            >
                <i className="pi pi-calendar-plus text-orange-500 text-xl" />
            </div>

        </div>

    </div>

</div>

            {/* CALENDÁRIO */}
            {/* =========================================================
    CALENDÁRIO
========================================================= */}

<div className="col-12 lg:col-4">

    <div className="card h-full">

        <div className="flex align-items-center justify-content-between mb-4">

            <div>
                <h5 className="m-0 text-900">
                    Calendário
                </h5>

                <span className="text-500 text-sm">
                    Consulte as datas das defesas
                </span>
            </div>

            <i className="pi pi-calendar text-primary text-xl" />

        </div>

        <div className="flex justify-content-center">

            <Calendar
                value={selectedDate}
                onChange={(e) =>
                    setSelectedDate(e.value as Date)
                }
                inline
                dateTemplate={calendarDateTemplate}
            />

        </div>

        <Divider />

        <div className="flex align-items-center gap-2">

            <span
                className="border-circle bg-primary"
                style={{
                    width: '0.65rem',
                    height: '0.65rem'
                }}
            />

            <span className="text-500 text-sm">
                Defesa agendada
            </span>

        </div>

    </div>

</div>

            {/* FILTROS */}
            {/* =========================================================
    FILTROS
========================================================= */}

<div className="col-12 lg:col-8">

    <div className="card h-full">

        <div className="flex align-items-center justify-content-between mb-4">

            <div>

                <h5 className="m-0 text-900">
                    Pesquisa e filtros
                </h5>

                <span className="text-500 text-sm">
                    Filtre as defesas por diferentes critérios
                </span>

            </div>

            <i className="pi pi-filter text-primary text-xl" />

        </div>

        <div className="grid">

            <div className="col-12 md:col-6">

                <label className="block text-900 font-medium mb-2">
                    Curso
                </label>

                <Dropdown
                    value={selectedCourse}
                    onChange={(e) =>
                        setSelectedCourse(e.value)
                    }
                    options={courses}
                    placeholder="Todos os cursos"
                    className="w-full"
                    showClear
                />

            </div>

            <div className="col-12 md:col-6">

                <label className="block text-900 font-medium mb-2">
                    Orientador
                </label>

                <Dropdown
                    value={selectedAdvisor}
                    onChange={(e) =>
                        setSelectedAdvisor(e.value)
                    }
                    options={advisors}
                    placeholder="Todos os orientadores"
                    className="w-full"
                    showClear
                    filter
                />

            </div>

            <div className="col-12 md:col-6">

                <label className="block text-900 font-medium mb-2">
                    Estado
                </label>

                <Dropdown
                    value={selectedStatus}
                    onChange={(e) =>
                        setSelectedStatus(e.value)
                    }
                    options={statuses}
                    placeholder="Todos os estados"
                    className="w-full"
                    showClear
                />

            </div>

            <div className="col-12 md:col-6 flex align-items-end">

                <Button
                    label="Limpar filtros"
                    icon="pi pi-filter-slash"
                    outlined
                    className="w-full"
                    onClick={clearFilters}
                />

            </div>

        </div>

    </div>

</div>

            {/* LISTA DE DEFESAS */}
            <div className="col-12">

                <Card>

                    <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-2 mb-4">

                        <div>
                            <h5 className="m-0 text-900">
                                Defesas Agendadas
                            </h5>

                            <span className="text-500 text-sm">
                                {filteredDefenses.length} defesa(s) encontrada(s)
                            </span>
                        </div>

                        <Button
                            icon="pi pi-refresh"
                            label="Actualizar"
                            outlined
                            size="small"
                            onClick={() => window.location.reload()}
                        />

                    </div>

                    <DataTable
                        value={filteredDefenses}
                        paginator
                        rows={5}
                        responsiveLayout="scroll"
                        emptyMessage="Nenhuma defesa encontrada."
                        stripedRows
                        showGridlines
                    >

                        <Column
                            field="student"
                            header="Estudante"
                            sortable
                        />

                        <Column
                            field="title"
                            header="Título do TCC"
                            body={(rowData: Defense) => (
                                <span
                                    className="block"
                                    style={{
                                        maxWidth: '300px'
                                    }}
                                >
                                    {rowData.title}
                                </span>
                            )}
                        />

                        <Column
                            field="advisor"
                            header="Orientador"
                            sortable
                        />

                        <Column
                            field="date"
                            header="Data"
                            body={dateTemplate}
                            sortable
                        />

                        <Column
                            field="time"
                            header="Hora"
                            sortable
                        />

                        <Column
                            field="room"
                            header="Sala"
                        />

                        <Column
                            field="status"
                            header="Estado"
                            body={statusTemplate}
                        />

                        <Column
                            header="Acções"
                            body={actionTemplate}
                            style={{
                                width: '5rem'
                            }}
                        />

                    </DataTable>

                </Card>

            </div>

            {/* DIALOG DETALHES */}
            <Dialog
                header="Detalhes da Defesa"
                visible={dialogVisible}
                style={{
                    width: '600px',
                    maxWidth: '95vw'
                }}
                onHide={() => setDialogVisible(false)}
            >

                {selectedDefense && (

                    <div className="flex flex-column gap-4">

                        <div>

                            <span className="text-500 text-sm block mb-1">
                                Estudante
                            </span>

                            <span className="text-900 font-medium">
                                {selectedDefense.student}
                            </span>

                        </div>

                        <div>

                            <span className="text-500 text-sm block mb-1">
                                Título do TCC
                            </span>

                            <span className="text-900 font-medium line-height-3">
                                {selectedDefense.title}
                            </span>

                        </div>

                        <div className="grid">

                            <div className="col-6">

                                <span className="text-500 text-sm block mb-1">
                                    Data
                                </span>

                                <span className="text-900 font-medium">
                                    {selectedDefense.date.toLocaleDateString('pt-PT')}
                                </span>

                            </div>

                            <div className="col-6">

                                <span className="text-500 text-sm block mb-1">
                                    Hora
                                </span>

                                <span className="text-900 font-medium">
                                    {selectedDefense.time}
                                </span>

                            </div>

                            <div className="col-6">

                                <span className="text-500 text-sm block mb-1">
                                    Sala
                                </span>

                                <span className="text-900 font-medium">
                                    {selectedDefense.room}
                                </span>

                            </div>

                            <div className="col-6">

                                <span className="text-500 text-sm block mb-1">
                                    Estado
                                </span>

                                {statusTemplate(selectedDefense)}

                            </div>

                        </div>

                        <Divider />

                        <div>

                            <span className="text-500 text-sm block mb-2">
                                Composição do Júri
                            </span>

                            <div className="flex flex-column gap-2">

                                {selectedDefense.jury.map(
                                    (member, index) => (

                                        <div
                                            key={index}
                                            className="flex align-items-center gap-2"
                                        >

                                            <i className="pi pi-user text-primary" />

                                            <span className="text-900">
                                                {member}
                                            </span>

                                        </div>

                                    )
                                )}

                            </div>

                        </div>

                        <Divider />

                        <div className="flex justify-content-end gap-2">

                            <Button
                                label="Fechar"
                                icon="pi pi-times"
                                outlined
                                onClick={() =>
                                    setDialogVisible(false)
                                }
                            />

                            <Button
                                label="Ver TCC"
                                icon="pi pi-file"
                                onClick={() => {
                                    // Implementar navegação para o documento
                                }}
                            />

                        </div>

                    </div>

                )}

            </Dialog>

        </div>
    );
};

export default AcademicDefenseCalendar;