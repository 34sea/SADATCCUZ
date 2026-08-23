/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useContext, useEffect, useState } from 'react';
import { Chart } from 'primereact/chart';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { LayoutContext } from '../../../layout/context/layoutcontext';
import { ChartData, ChartOptions } from 'chart.js';

interface Defesa {
    id: number;
    estudante: string;
    titulo: string;
    data: string;
    hora: string;
    sala: string;
    estado: string;
}

const Dashboard = () => {
    const { layoutConfig } = useContext(LayoutContext);

    const [lineOptions, setLineOptions] = useState<ChartOptions>({});

    // ============================================================
    // DADOS DE EXEMPLO
    // Posteriormente substituir pelos dados da API
    // ============================================================

    const defesas: Defesa[] = [
        {
            id: 1,
            estudante: 'João Manuel',
            titulo: 'Sistema de Gestão Académica',
            data: '18/08/2026',
            hora: '09:00',
            sala: 'Sala 01',
            estado: 'Agendada'
        },
        {
            id: 2,
            estudante: 'Maria José',
            titulo: 'Aplicação Web para Gestão de TCC',
            data: '19/08/2026',
            hora: '10:30',
            sala: 'Sala 02',
            estado: 'Agendada'
        },
        {
            id: 3,
            estudante: 'Carlos Alberto',
            titulo: 'Sistema Inteligente de Apoio ao Estudante',
            data: '20/08/2026',
            hora: '14:00',
            sala: 'Sala 01',
            estado: 'Agendada'
        },
        {
            id: 4,
            estudante: 'Ana Paulo',
            titulo: 'Plataforma de Gestão de Bibliotecas',
            data: '22/08/2026',
            hora: '09:00',
            sala: 'Sala 03',
            estado: 'Agendada'
        }
    ];

    // ============================================================
    // GRÁFICO DE EVOLUÇÃO
    // ============================================================

    const lineData: ChartData = {
        labels: [
            'Jan',
            'Fev',
            'Mar',
            'Abr',
            'Mai',
            'Jun',
            'Jul',
            'Ago'
        ],
        datasets: [
            {
                label: 'Pré-projectos submetidos',
                data: [8, 12, 10, 15, 18, 14, 20, 25],
                fill: false,
                tension: 0.4
            },
            {
                label: 'Pré-projectos aprovados',
                data: [5, 8, 7, 11, 14, 12, 16, 20],
                fill: false,
                tension: 0.4
            },
            {
                label: 'Defesas realizadas',
                data: [2, 3, 4, 5, 7, 8, 10, 12],
                fill: false,
                tension: 0.4
            }
        ]
    };

    // ============================================================
    // GRÁFICO DE DISTRIBUIÇÃO
    // ============================================================

    const doughnutData: ChartData = {
        labels: [
            'Em orientação',
            'Em avaliação',
            'Em revisão',
            'Defesas agendadas',
            'Defendidos'
        ],
        datasets: [
            {
                data: [12, 6, 4, 5, 8]
            }
        ]
    };

    // ============================================================
    // CONFIGURAÇÃO DO GRÁFICO
    // ============================================================

    useEffect(() => {
        const dark = layoutConfig.colorScheme === 'dark';

        const textColor = dark
            ? '#ebedef'
            : '#495057';

        const gridColor = dark
            ? 'rgba(160, 167, 181, .2)'
            : '#ebedef';

        const options: ChartOptions = {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: textColor,
                        font: {
                            size: 11
                        },
                        usePointStyle: true,
                        padding: 15
                    }
                }
            },

            scales: {
                x: {
                    ticks: {
                        color: textColor,
                        font: {
                            size: 10
                        }
                    },
                    grid: {
                        color: gridColor
                    }
                },

                y: {
                    beginAtZero: true,

                    ticks: {
                        color: textColor,
                        font: {
                            size: 10
                        }
                    },

                    grid: {
                        color: gridColor
                    }
                }
            }
        };

        setLineOptions(options);
    }, [layoutConfig.colorScheme]);

    // ============================================================
    // ESTADO DA DEFESA
    // ============================================================

    const estadoTemplate = (rowData: Defesa) => {
        return (
            <Tag
                value={rowData.estado}
                severity="info"
                className="text-xs"
            />
        );
    };

    // ============================================================
    // DASHBOARD
    // ============================================================

    return (
        <div className="grid">

            {/* =====================================================
                CABEÇALHO
            ====================================================== */}

            <div className="col-12">

                <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-3">

                    <div>
                        <h3 className="text-900 font-semibold m-0">
                            Painel Geral
                        </h3>

                        <span className="text-500 text-sm">
                            Visão geral do ciclo de vida dos Trabalhos de
                            Culminação de Curso
                        </span>
                    </div>

                    <Button
                        label="Actualizar"
                        icon="pi pi-refresh"
                        outlined
                        size="small"
                        className="mt-3 md:mt-0"
                    />

                </div>

            </div>

            {/* =====================================================
                CARD 1 - TCCs EM ANDAMENTO
            ====================================================== */}

            <div className="col-12 sm:col-6 xl:col-3">

                <div className="card mb-0">

                    <div className="flex justify-content-between mb-3">

                        <div>

                            <span className="block text-500 font-medium mb-2 text-sm">
                                TCCs em andamento
                            </span>

                            <div className="text-900 font-semibold text-xl">
                                35
                            </div>

                        </div>

                        <div
                            className="flex align-items-center justify-content-center bg-blue-100 border-round"
                            style={{
                                width: '2.5rem',
                                height: '2.5rem'
                            }}
                        >
                            <i className="pi pi-book text-blue-500" />
                        </div>

                    </div>

                    {/* <span className="text-green-500 text-sm font-medium">
                        +8
                    </span>

                    <span className="text-500 text-sm ml-2">
                        este mês
                    </span> */}

                </div>

            </div>

            {/* =====================================================
                CARD 2 - PRÉ-PROJECTOS
            ====================================================== */}

            <div className="col-12 sm:col-6 xl:col-3">

                <div className="card mb-0">

                    <div className="flex justify-content-between mb-3">

                        <div>

                            <span className="block text-500 font-medium mb-2 text-sm">
                                Pré-projectos
                            </span>

                            <div className="text-900 font-semibold text-xl">
                                18
                            </div>

                        </div>

                        <div
                            className="flex align-items-center justify-content-center bg-orange-100 border-round"
                            style={{
                                width: '2.5rem',
                                height: '2.5rem'
                            }}
                        >
                            <i className="pi pi-file text-orange-500" />
                        </div>

                    </div>

                    {/* <span className="text-orange-500 text-sm font-medium">
                        5
                    </span>

                    <span className="text-500 text-sm ml-2">
                        em avaliação
                    </span> */}

                </div>

            </div>

            {/* =====================================================
                CARD 3 - DEFESAS
            ====================================================== */}

            <div className="col-12 sm:col-6 xl:col-3">

                <div className="card mb-0">

                    <div className="flex justify-content-between mb-3">

                        <div>

                            <span className="block text-500 font-medium mb-2 text-sm">
                                Defesas agendadas
                            </span>

                            <div className="text-900 font-semibold text-xl">
                                12
                            </div>

                        </div>

                        <div
                            className="flex align-items-center justify-content-center bg-cyan-100 border-round"
                            style={{
                                width: '2.5rem',
                                height: '2.5rem'
                            }}
                        >
                            <i className="pi pi-calendar text-cyan-500" />
                        </div>

                    </div>

                    {/* <span className="text-cyan-500 text-sm font-medium">
                        Próximos 30 dias
                    </span> */}

                </div>

            </div>

            {/* =====================================================
                CARD 4 - TCCs DEFENDIDOS
            ====================================================== */}

            <div className="col-12 sm:col-6 xl:col-3">

                <div className="card mb-0">

                    <div className="flex justify-content-between mb-3">

                        <div>

                            <span className="block text-500 font-medium mb-2 text-sm">
                                TCCs defendidos
                            </span>

                            <div className="text-900 font-semibold text-xl">
                                8
                            </div>

                        </div>

                        <div
                            className="flex align-items-center justify-content-center bg-green-100 border-round"
                            style={{
                                width: '2.5rem',
                                height: '2.5rem'
                            }}
                        >
                            <i className="pi pi-check-circle text-green-500" />
                        </div>

                    </div>

                    {/* <span className="text-green-500 text-sm font-medium">
                        Ano 2026
                    </span> */}

                </div>

            </div>

            {/* =====================================================
                GRÁFICO DE LINHA - 100% DA LARGURA
            ====================================================== */}

            <div className="col-12">

                <div className="card">

                    <div className="mb-3">

                        <h5 className="m-0 text-lg font-semibold">
                            Evolução dos TCCs
                        </h5>

                        <span className="text-500 text-sm">
                            Submissões, aprovações e defesas
                        </span>

                    </div>

                    <div
                        style={{
                            width: '100%',
                            height: '350px',
                            position: 'relative'
                        }}
                    >

                        <Chart
                            type="line"
                            data={lineData}
                            options={lineOptions}
                            style={{
                                width: '100%',
                                height: '100%'
                            }}
                        />

                    </div>

                </div>

            </div>

            {/* =====================================================
                ESTADO DOS TCCs
            ====================================================== */}

            <div className="col-12 xl:col-4">

                <div className="card">

                    <div className="mb-3">

                        <h5 className="m-0 text-lg font-semibold">
                            Estado dos TCCs
                        </h5>

                        <span className="text-500 text-sm">
                            Distribuição actual
                        </span>

                    </div>

                    <div
                        style={{
                            width: '100%',
                            height: '300px',
                            position: 'relative'
                        }}
                    >

                        <Chart
                            type="doughnut"
                            data={doughnutData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,

                                plugins: {
                                    legend: {
                                        position: 'bottom',

                                        labels: {
                                            font: {
                                                size: 10
                                            },

                                            usePointStyle: true,
                                            padding: 12
                                        }
                                    }
                                }
                            }}
                            style={{
                                width: '100%',
                                height: '100%'
                            }}
                        />

                    </div>

                </div>

            </div>

            {/* =====================================================
                PRÓXIMAS DEFESAS
            ====================================================== */}

            <div className="col-12 xl:col-8">

                <div className="card">

                    <div className="flex align-items-center justify-content-between mb-3">

                        <div>

                            <h5 className="m-0 text-lg font-semibold">
                                Próximas Defesas
                            </h5>

                            <span className="text-500 text-sm">
                                Defesas públicas agendadas
                            </span>

                        </div>

                        <Button
                            label="Calendário"
                            icon="pi pi-calendar"
                            text
                            size="small"
                        />

                    </div>

                    <DataTable
                        value={defesas}
                        responsiveLayout="scroll"
                        paginator
                        rows={5}
                        size="small"
                        emptyMessage="Nenhuma defesa encontrada."
                    >

                        <Column
                            field="estudante"
                            header="Estudante"
                        />

                        <Column
                            field="titulo"
                            header="Título do TCC"
                        />

                        <Column
                            field="data"
                            header="Data"
                        />

                        <Column
                            field="hora"
                            header="Hora"
                        />

                        <Column
                            field="sala"
                            header="Sala"
                        />

                        <Column
                            field="estado"
                            header="Estado"
                            body={estadoTemplate}
                        />

                    </DataTable>

                </div>

            </div>

            {/* =====================================================
                ACTIVIDADES RECENTES
            ====================================================== */}

            <div className="col-12">

                <div className="card">

                    <div className="mb-3">

                        <h5 className="m-0 text-lg font-semibold">
                            Actividades recentes
                        </h5>

                        <span className="text-500 text-sm">
                            Últimas actividades realizadas no sistema
                        </span>

                    </div>

                    <ul className="p-0 m-0 list-none">

                        {/* ACTIVIDADE 1 */}

                        <li className="flex align-items-center py-3 border-bottom-1 surface-border">

                            <div
                                className="flex align-items-center justify-content-center bg-blue-100 border-circle mr-3 flex-shrink-0"
                                style={{
                                    width: '2.5rem',
                                    height: '2.5rem'
                                }}
                            >
                                <i className="pi pi-upload text-blue-500" />
                            </div>

                            <div>

                                <span className="text-900 font-medium text-sm">
                                    Novo pré-projecto submetido
                                </span>

                                <p className="text-500 text-sm m-0 mt-1">
                                    João Manuel submeteu um novo pré-projecto.
                                </p>

                            </div>

                            <span className="ml-auto text-500 text-xs">
                                Há 20 min
                            </span>

                        </li>

                        {/* ACTIVIDADE 2 */}

                        <li className="flex align-items-center py-3 border-bottom-1 surface-border">

                            <div
                                className="flex align-items-center justify-content-center bg-green-100 border-circle mr-3 flex-shrink-0"
                                style={{
                                    width: '2.5rem',
                                    height: '2.5rem'
                                }}
                            >
                                <i className="pi pi-check text-green-500" />
                            </div>

                            <div>

                                <span className="text-900 font-medium text-sm">
                                    Pré-projecto aprovado
                                </span>

                                <p className="text-500 text-sm m-0 mt-1">
                                    O pré-projecto de Maria José foi aprovado.
                                </p>

                            </div>

                            <span className="ml-auto text-500 text-xs">
                                Há 1 hora
                            </span>

                        </li>

                        {/* ACTIVIDADE 3 */}

                        <li className="flex align-items-center py-3 border-bottom-1 surface-border">

                            <div
                                className="flex align-items-center justify-content-center bg-orange-100 border-circle mr-3 flex-shrink-0"
                                style={{
                                    width: '2.5rem',
                                    height: '2.5rem'
                                }}
                            >
                                <i className="pi pi-calendar text-orange-500" />
                            </div>

                            <div>

                                <span className="text-900 font-medium text-sm">
                                    Nova defesa agendada
                                </span>

                                <p className="text-500 text-sm m-0 mt-1">
                                    Defesa de Carlos Alberto agendada para
                                    20/08/2026.
                                </p>

                            </div>

                            <span className="ml-auto text-500 text-xs">
                                Há 2 horas
                            </span>

                        </li>

                        {/* ACTIVIDADE 4 */}

                        <li className="flex align-items-center py-3">

                            <div
                                className="flex align-items-center justify-content-center bg-purple-100 border-circle mr-3 flex-shrink-0"
                                style={{
                                    width: '2.5rem',
                                    height: '2.5rem'
                                }}
                            >
                                <i className="pi pi-book text-purple-500" />
                            </div>

                            <div>

                                <span className="text-900 font-medium text-sm">
                                    Sessão de orientação registada
                                </span>

                                <p className="text-500 text-sm m-0 mt-1">
                                    O orientador registou uma nova sessão.
                                </p>

                            </div>

                            <span className="ml-auto text-500 text-xs">
                                Há 3 horas
                            </span>

                        </li>

                    </ul>

                </div>

            </div>

        </div>
    );
};

export default Dashboard;