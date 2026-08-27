'use client';
import { useEffect, useState } from 'react';
import { getScheduledDefenses, ScheduledDefense } from '@/app/api/scheduleDefense/scheduleDefense';

// import {
//     getScheduledDefenses,
//     ScheduledDefense
// } from '../services/defenseService';

export default function ScheduledDefenses() {

    const [defenses, setDefenses] = useState<ScheduledDefense[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState('');
    const [date, setDate] = useState('');

    // =====================================================
    // CARREGAR DEFESAS
    // =====================================================

    const loadDefenses = async () => {

        try {

            setLoading(true);
            setError(null);

            const response = await getScheduledDefenses({
                search: search || undefined,
                defense_date: date || undefined
            });

            if (response.success) {
                setDefenses(response.data);
            } else {
                setDefenses([]);
            }

        } catch (err: any) {

            console.error('Erro ao carregar defesas:', err);

            setError(
                err?.response?.data?.message ||
                'Não foi possível carregar as defesas.'
            );

        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // PRIMEIRO CARREGAMENTO
    // =====================================================

    useEffect(() => {
        loadDefenses();
    }, []);

    // =====================================================
    // PESQUISAR
    // =====================================================

    const handleSearch = () => {
        loadDefenses();
    };

    // =====================================================
    // ENTER NA PESQUISA
    // =====================================================

    const handleKeyDown = (
        event: React.KeyboardEvent<HTMLInputElement>
    ) => {

        if (event.key === 'Enter') {
            loadDefenses();
        }
    };

    // =====================================================
    // FORMATAR DATA
    // =====================================================

    const formatDate = (date: string) => {

        if (!date) return '-';

        const [year, month, day] = date.split('T')[0].split('-');

        return `${day}/${month}/${year}`;
    };

    // =====================================================
    // FORMATAR HORA
    // =====================================================

    const formatTime = (time: string) => {

        if (!time) return '-';

        return time.substring(0, 5);
    };

    // =====================================================
    // ROLE
    // =====================================================

    const getRoleLabel = (role: string) => {

        switch (role) {

            case 'PRESIDENTE':
                return 'Presidente';

            case 'ORIENTADOR':
                return 'Orientador';

            case 'OPONENTE':
                return 'Oponente';

            default:
                return role;
        }
    };

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div className="flex justify-content-center align-items-center p-5">
                <i className="pi pi-spin pi-spinner text-3xl"></i>
            </div>
        );
    }

    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="surface-ground min-h-screen p-3 md:p-5">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="mb-4">

                <h1 className="text-3xl font-bold text-900 m-0">
                    Defesas de TCC
                </h1>

                <p className="text-600 mt-2">
                    Consulte as defesas agendadas, datas, salas e bancas examinadoras.
                </p>

            </div>


            {/* =================================================
                PESQUISA
            ================================================= */}

            <div className="surface-card border-round-xl shadow-1 p-3 mb-4">

                <div className="grid">

                    {/* Pesquisa */}

                    <div className="col-12 md:col-7">

                        <label className="block font-medium text-900 mb-2">
                            Pesquisar
                        </label>

                        <span className="p-input-icon-left w-full">

                            <i className="pi pi-search" />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Nome do estudante ou título do TCC..."
                                className="p-inputtext p-component w-full"
                            />

                        </span>

                    </div>


                    {/* Data */}

                    <div className="col-12 md:col-3">

                        <label className="block font-medium text-900 mb-2">
                            Data da defesa
                        </label>

                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="p-inputtext p-component w-full"
                        />

                    </div>


                    {/* Botão */}

                    <div className="col-12 md:col-2 flex align-items-end">

                        <button
                            type="button"
                            onClick={handleSearch}
                            className="p-button p-component w-full"
                        >

                            <i className="pi pi-search mr-2"></i>

                            Pesquisar

                        </button>

                    </div>

                </div>

            </div>


            {/* =================================================
                ERRO
            ================================================= */}

            {error && (

                <div className="p-message p-message-error mb-4">

                    <i className="pi pi-exclamation-circle mr-2"></i>

                    {error}

                </div>

            )}


            {/* =================================================
                RESULTADOS
            ================================================= */}

            <div className="flex justify-content-between align-items-center mb-3">

                <div>

                    <span className="text-xl font-semibold text-900">
                        Defesas agendadas
                    </span>

                    <span className="ml-2 text-600">
                        ({defenses.length})
                    </span>

                </div>

            </div>


            {/* =================================================
                SEM RESULTADOS
            ================================================= */}

            {defenses.length === 0 && (

                <div className="surface-card border-round-xl shadow-1 p-6 text-center">

                    <i className="pi pi-calendar-times text-5xl text-400"></i>

                    <h3 className="text-900 mt-3">
                        Nenhuma defesa encontrada
                    </h3>

                    <p className="text-600">
                        Não existem defesas agendadas para os critérios informados.
                    </p>

                </div>

            )}


            {/* =================================================
                LISTA
            ================================================= */}

            <div className="grid">

                {defenses.map((defense) => (

                    <div
                        key={defense.id}
                        className="col-12"
                    >

                        <div className="surface-card border-round-xl shadow-1 overflow-hidden">

                            {/* =================================================
                                TOPO
                            ================================================= */}

                            <div className="p-4 border-bottom-1 surface-border">

                                <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-start gap-3">

                                    <div>

                                        <div className="text-sm text-600 mb-1">
                                            ESTUDANTE
                                        </div>

                                        <h2 className="text-xl font-bold text-900 m-0">
                                            {defense.student.name}
                                        </h2>

                                        <div className="text-600 mt-1">
                                            {defense.student.email}
                                        </div>

                                    </div>


                                    <span className="p-tag p-component p-tag-success">

                                        <i className="pi pi-check-circle mr-2"></i>

                                        Defesa agendada

                                    </span>

                                </div>

                            </div>


                            {/* =================================================
                                INFORMAÇÕES
                            ================================================= */}

                            <div className="p-4">

                                <div className="grid">

                                    {/* TCC */}

                                    <div className="col-12">

                                        <div className="flex gap-3">

                                            <div className="flex align-items-center justify-content-center border-round bg-primary-50 w-3rem h-3rem">

                                                <i className="pi pi-book text-primary text-xl"></i>

                                            </div>

                                            <div>

                                                <div className="text-sm text-600">
                                                    Título do TCC
                                                </div>

                                                <div className="font-semibold text-900 mt-1">
                                                    {defense.tcc.title}
                                                </div>

                                            </div>

                                        </div>

                                    </div>


                                    {/* DATA */}

                                    <div className="col-12 md:col-4">

                                        <div className="flex gap-3">

                                            <div className="flex align-items-center justify-content-center border-round bg-blue-50 w-3rem h-3rem">

                                                <i className="pi pi-calendar text-blue-500 text-xl"></i>

                                            </div>

                                            <div>

                                                <div className="text-sm text-600">
                                                    Data
                                                </div>

                                                <div className="font-semibold text-900 mt-1">
                                                    {formatDate(defense.schedule.date)}
                                                </div>

                                            </div>

                                        </div>

                                    </div>


                                    {/* HORA */}

                                    <div className="col-12 md:col-4">

                                        <div className="flex gap-3">

                                            <div className="flex align-items-center justify-content-center border-round bg-orange-50 w-3rem h-3rem">

                                                <i className="pi pi-clock text-orange-500 text-xl"></i>

                                            </div>

                                            <div>

                                                <div className="text-sm text-600">
                                                    Horário
                                                </div>

                                                <div className="font-semibold text-900 mt-1">

                                                    {formatTime(
                                                        defense.schedule.start_time
                                                    )}

                                                    {' - '}

                                                    {formatTime(
                                                        defense.schedule.end_time
                                                    )}

                                                </div>

                                            </div>

                                        </div>

                                    </div>


                                    {/* SALA */}

                                    <div className="col-12 md:col-4">

                                        <div className="flex gap-3">

                                            <div className="flex align-items-center justify-content-center border-round bg-purple-50 w-3rem h-3rem">

                                                <i className="pi pi-building text-purple-500 text-xl"></i>

                                            </div>

                                            <div>

                                                <div className="text-sm text-600">
                                                    Sala
                                                </div>

                                                <div className="font-semibold text-900 mt-1">
                                                    {defense.room.name}
                                                </div>

                                                {defense.room.location && (

                                                    <div className="text-sm text-600 mt-1">
                                                        {defense.room.location}
                                                    </div>

                                                )}

                                            </div>

                                        </div>

                                    </div>

                                </div>


                                {/* =================================================
                                    BANCA
                                ================================================= */}

                                <div className="border-top-1 surface-border mt-3 pt-4">

                                    <div className="flex align-items-center gap-2 mb-3">

                                        <i className="pi pi-users text-primary text-xl"></i>

                                        <span className="font-bold text-lg text-900">
                                            Banca examinadora
                                        </span>

                                    </div>


                                    {defense.jury.length === 0 ? (

                                        <div className="text-600 text-sm">
                                            Banca ainda não definida.
                                        </div>

                                    ) : (

                                        <div className="grid">

                                            {defense.jury.map((member) => (

                                                <div
                                                    key={member.id}
                                                    className="col-12 md:col-4"
                                                >

                                                    <div className="surface-ground border-round-lg p-3 h-full">

                                                        <div className="flex align-items-center gap-3">

                                                            <div className="flex align-items-center justify-content-center border-circle bg-primary text-white w-3rem h-3rem">

                                                                <i className="pi pi-user"></i>

                                                            </div>


                                                            <div className="min-w-0">

                                                                <div className="font-semibold text-900">

                                                                    {member.name}

                                                                </div>

                                                                <div className="text-sm text-primary font-medium mt-1">

                                                                    {getRoleLabel(
                                                                        member.role
                                                                    )}

                                                                </div>

                                                            </div>

                                                        </div>

                                                    </div>

                                                </div>

                                            ))}

                                        </div>

                                    )}

                                </div>

                            </div>

                        </div>

                    </div>

                ))}

            </div>

        </div>
    );
}