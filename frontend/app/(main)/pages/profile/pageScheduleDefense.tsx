'use client';

import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { MultiSelect } from 'primereact/multiselect';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';

interface Option {
    name: string;
    id: number;
}

const ScheduleDefense = () => {
    const toast = useRef<Toast>(null);

    const [student, setStudent] = useState<Option | null>(null);
    const [date, setDate] = useState<Date | null>(null);
    const [time, setTime] = useState<Date | null>(null);
    const [room, setRoom] = useState<Option | null>(null);
    const [jury, setJury] = useState<Option[]>([]);
    const [conflict, setConflict] = useState(false);
    const [checking, setChecking] = useState(false);

    const students: Option[] = [
        { id: 1, name: 'João Manuel' },
        { id: 2, name: 'Maria da Conceição' },
        { id: 3, name: 'Carlos Alberto' },
        { id: 4, name: 'Ana Paula' }
    ];

    const rooms: Option[] = [
        { id: 1, name: 'Sala de Defesas 01' },
        { id: 2, name: 'Sala de Defesas 02' },
        { id: 3, name: 'Laboratório 01' },
        { id: 4, name: 'Auditório FCT' }
    ];

    const professors: Option[] = [
        { id: 1, name: 'Mestre Cristian Franklin Coulon' },
        { id: 2, name: 'Dr. António Manuel' },
        { id: 3, name: 'Mestre Carlos Domingos' },
        { id: 4, name: 'Dra. Maria José' },
        { id: 5, name: 'Mestre Paulo Alberto' }
    ];

    const tccTitles: Record<number, string> = {
        1: 'Desenvolvimento de uma plataforma web para gestão académica',
        2: 'Sistema inteligente de acompanhamento de Trabalhos de Culminação de Curso',
        3: 'Aplicação móvel para gestão de processos académicos',
        4: 'Sistema de informação para gestão universitária'
    };

    const checkConflict = () => {
        if (!student || !date || !time || !room || jury.length === 0) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Dados incompletos',
                detail: 'Preencha todos os campos obrigatórios.',
                life: 3000
            });

            return;
        }

        setChecking(true);

        setTimeout(() => {
            setChecking(false);

            // Simulação
            const hasConflict = false;

            setConflict(hasConflict);

            if (hasConflict) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Conflito detectado',
                    detail: 'Existe um conflito de horário ou disponibilidade.',
                    life: 4000
                });
            } else {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Sem conflitos',
                    detail: 'A data, sala e composição do júri estão disponíveis.',
                    life: 3000
                });
            }
        }, 800);
    };

    const scheduleDefense = () => {
        if (conflict) {
            toast.current?.show({
                severity: 'error',
                summary: 'Agendamento bloqueado',
                detail: 'Resolva os conflitos antes de confirmar.',
                life: 4000
            });

            return;
        }

        toast.current?.show({
            severity: 'success',
            summary: 'Defesa agendada',
            detail: 'A defesa foi agendada com sucesso.',
            life: 4000
        });
    };

    return (
        <div className="grid">

            <Toast ref={toast} />

            {/* CABEÇALHO */}
            <div className="col-12">
                <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-3">

                    <div>
                        <h2 className="text-900 font-semibold m-0">
                            Agendamento de Defesa
                        </h2>

                        <p className="text-600 mt-2 mb-0">
                            Agende a defesa pública do Trabalho de Culminação de Curso.
                        </p>
                    </div>

                    <Tag
                        value="Novo agendamento"
                        icon="pi pi-calendar-plus"
                        severity="info"
                        className="w-fit"
                    />

                </div>
            </div>

            {/* DADOS DO TCC */}
            <div className="col-12 lg:col-8">

                <Card title="Dados da Defesa">

                    <div className="grid">

                        {/* ESTUDANTE */}
                        <div className="col-12">
                            <label
                                htmlFor="student"
                                className="block text-900 font-medium mb-2"
                            >
                                Estudante <span className="text-red-500">*</span>
                            </label>

                            <Dropdown
                                id="student"
                                value={student}
                                onChange={(e) => {
                                    setStudent(e.value);
                                    setConflict(false);
                                }}
                                options={students}
                                optionLabel="name"
                                placeholder="Selecione o estudante"
                                className="w-full"
                                filter
                            />
                        </div>

                        {/* TÍTULO */}
                        <div className="col-12">

                            <label
                                htmlFor="title"
                                className="block text-900 font-medium mb-2"
                            >
                                Título do TCC
                            </label>

                            <InputText
                                id="title"
                                value={
                                    student
                                        ? tccTitles[student.id] || ''
                                        : ''
                                }
                                readOnly
                                className="w-full"
                                placeholder="O título será preenchido automaticamente"
                            />

                        </div>

                        {/* DATA */}
                        <div className="col-12 md:col-6">

                            <label
                                htmlFor="date"
                                className="block text-900 font-medium mb-2"
                            >
                                Data da Defesa <span className="text-red-500">*</span>
                            </label>

                            <Calendar
                                id="date"
                                value={date}
                                onChange={(e) => {
                                    setDate(e.value as Date);
                                    setConflict(false);
                                }}
                                className="w-full"
                                inputClassName="w-full"
                                dateFormat="dd/mm/yy"
                                minDate={new Date()}
                                showIcon
                                placeholder="Selecione a data"
                            />

                        </div>

                        {/* HORA */}
                        <div className="col-12 md:col-6">

                            <label
                                htmlFor="time"
                                className="block text-900 font-medium mb-2"
                            >
                                Hora <span className="text-red-500">*</span>
                            </label>

                            <Calendar
                                id="time"
                                value={time}
                                onChange={(e) => {
                                    setTime(e.value as Date);
                                    setConflict(false);
                                }}
                                className="w-full"
                                inputClassName="w-full"
                                timeOnly
                                hourFormat="24"
                                showIcon
                                placeholder="Selecione a hora"
                            />

                        </div>

                        {/* SALA */}
                        <div className="col-12">

                            <label
                                htmlFor="room"
                                className="block text-900 font-medium mb-2"
                            >
                                Sala <span className="text-red-500">*</span>
                            </label>

                            <Dropdown
                                id="room"
                                value={room}
                                onChange={(e) => {
                                    setRoom(e.value);
                                    setConflict(false);
                                }}
                                options={rooms}
                                optionLabel="name"
                                placeholder="Selecione a sala"
                                className="w-full"
                                filter
                            />

                        </div>

                    </div>

                </Card>

            </div>

            {/* RESUMO */}
            <div className="col-12 lg:col-4">

                <Card title="Resumo do Agendamento">

                    <div className="flex flex-column gap-4">

                        <div>
                            <span className="text-500 block mb-1">
                                Estudante
                            </span>

                            <span className="text-900 font-medium">
                                {student?.name || 'Não selecionado'}
                            </span>
                        </div>

                        <div>
                            <span className="text-500 block mb-1">
                                Data
                            </span>

                            <span className="text-900 font-medium">
                                {date
                                    ? date.toLocaleDateString('pt-PT')
                                    : 'Não definida'}
                            </span>
                        </div>

                        <div>
                            <span className="text-500 block mb-1">
                                Hora
                            </span>

                            <span className="text-900 font-medium">
                                {time
                                    ? time.toLocaleTimeString('pt-PT', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })
                                    : 'Não definida'}
                            </span>
                        </div>

                        <div>
                            <span className="text-500 block mb-1">
                                Sala
                            </span>

                            <span className="text-900 font-medium">
                                {room?.name || 'Não selecionada'}
                            </span>
                        </div>

                    </div>

                </Card>

            </div>

            {/* COMPOSIÇÃO DO JÚRI */}
            <div className="col-12">

                <Card title="Composição do Júri">

                    <div className="grid">

                        <div className="col-12 md:col-8">

                            <label
                                htmlFor="jury"
                                className="block text-900 font-medium mb-2"
                            >
                                Membros do Júri <span className="text-red-500">*</span>
                            </label>

                            <MultiSelect
                                id="jury"
                                value={jury}
                                onChange={(e) => {
                                    setJury(e.value);
                                    setConflict(false);
                                }}
                                options={professors}
                                optionLabel="name"
                                placeholder="Selecione os membros do júri"
                                className="w-full"
                                display="chip"
                                filter
                            />

                            <small className="text-500 block mt-2">
                                Selecione os docentes que irão participar da defesa.
                            </small>

                        </div>

                        <div className="col-12 md:col-4">

                            <div className="surface-100 border-round p-3 h-full">

                                <div className="flex align-items-center gap-2 mb-2">
                                    <i className="pi pi-users text-primary" />

                                    <span className="font-medium text-900">
                                        Júri seleccionado
                                    </span>
                                </div>

                                <span className="text-600">
                                    {jury.length} membro(s)
                                </span>

                            </div>

                        </div>

                    </div>

                </Card>

            </div>

            {/* VERIFICAÇÃO */}
            <div className="col-12">

                <Card title="Validação do Agendamento">

                    <div className="flex flex-column gap-3">

                        <div className="flex align-items-center gap-3 p-3 surface-50 border-round">

                            <i className="pi pi-calendar text-primary text-xl" />

                            <div className="flex-1">

                                <span className="block font-medium text-900">
                                    Conflito de horário
                                </span>

                                <span className="text-600 text-sm">
                                    Verifica se existe outra defesa no mesmo horário.
                                </span>

                            </div>

                            <Tag
                                value="Verificar"
                                severity="info"
                            />

                        </div>

                        <div className="flex align-items-center gap-3 p-3 surface-50 border-round">

                            <i className="pi pi-users text-primary text-xl" />

                            <div className="flex-1">

                                <span className="block font-medium text-900">
                                    Disponibilidade do júri
                                </span>

                                <span className="text-600 text-sm">
                                    Verifica se algum membro do júri está ocupado.
                                </span>

                            </div>

                            <Tag
                                value="Verificar"
                                severity="info"
                            />

                        </div>

                        <div className="flex align-items-center gap-3 p-3 surface-50 border-round">

                            <i className="pi pi-building text-primary text-xl" />

                            <div className="flex-1">

                                <span className="block font-medium text-900">
                                    Disponibilidade da sala
                                </span>

                                <span className="text-600 text-sm">
                                    Verifica se a sala está disponível na data e hora seleccionadas.
                                </span>

                            </div>

                            <Tag
                                value="Verificar"
                                severity="info"
                            />

                        </div>

                        <div className="flex align-items-center gap-3 p-3 surface-50 border-round">

                            <i className="pi pi-check-circle text-primary text-xl" />

                            <div className="flex-1">

                                <span className="block font-medium text-900">
                                    Caderno de orientações
                                </span>

                                <span className="text-600 text-sm">
                                    Verifica se o estudante concluiu o caderno de orientações.
                                </span>

                            </div>

                            <Tag
                                value="Verificar"
                                severity="info"
                            />

                        </div>

                    </div>

                    <Divider />

                    {conflict && (
                        <Message
                            severity="error"
                            text="Não é possível confirmar o agendamento porque foi detectado um conflito."
                            className="w-full mb-3"
                        />
                    )}

                    <div className="flex flex-column md:flex-row justify-content-end gap-2">

                        <Button
                            label="Verificar disponibilidade"
                            icon="pi pi-search"
                            outlined
                            loading={checking}
                            onClick={checkConflict}
                        />

                        <Button
                            label="Confirmar agendamento"
                            icon="pi pi-calendar-plus"
                            disabled={conflict || !student || !date || !time || !room || jury.length === 0}
                            onClick={scheduleDefense}
                        />

                    </div>

                </Card>

            </div>

        </div>
    );
};

export default ScheduleDefense;