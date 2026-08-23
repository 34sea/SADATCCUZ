'use client';

import React from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { ProgressBar } from 'primereact/progressbar';
import { Tag } from 'primereact/tag';
import { Timeline } from 'primereact/timeline';
import { Avatar } from 'primereact/avatar';

const OrientationDashboard = () => {

    const sessions = [
        {
            date: '12/08/2026',
            title: 'Sessão 8 — Metodologia',
            description:
                'Análise da metodologia proposta e definição dos instrumentos de recolha de dados.',
            status: 'Concluída',
            icon: 'pi pi-check'
        },
        {
            date: '05/08/2026',
            title: 'Sessão 7 — Enquadramento teórico',
            description:
                'Revisão da fundamentação teórica e das referências bibliográficas.',
            status: 'Concluída',
            icon: 'pi pi-check'
        },
        {
            date: '29/07/2026',
            title: 'Sessão 6 — Problematização',
            description:
                'Revisão do problema de investigação, hipótese e objectivos.',
            status: 'Concluída',
            icon: 'pi pi-check'
        }
    ];

    const timelineTemplate = (item: any) => {
        return (
            <div className="flex flex-column">

                <div className="flex align-items-center gap-2 mb-2">

                    <span className="font-medium text-900">
                        {item.title}
                    </span>

                    <Tag
                        value={item.status}
                        severity="success"
                    />

                </div>

                <span className="text-500 text-sm mb-2">
                    {item.date}
                </span>

                <span className="text-600 line-height-3">
                    {item.description}
                </span>

            </div>
        );
    };

    const timelineMarker = (item: any) => {
        return (
            <span
                className="flex align-items-center justify-content-center border-circle bg-green-100"
                style={{
                    width: '2rem',
                    height: '2rem'
                }}
            >
                <i className={`${item.icon} text-green-500`} />
            </span>
        );
    };

    return (
        <div className="grid">

            {/* CABEÇALHO */}
            <div className="col-12">

                <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-3">

                    <div>
                        <h3 className="text-900 font-semibold m-0">
                            Painel do Caderno de Orientações
                        </h3>

                        <p className="text-600 mt-2 mb-0">
                            Acompanhe o progresso das orientações e o estado
                            do seu Trabalho de Culminação de Curso.
                        </p>
                    </div>

                    <Tag
                        value="Em acompanhamento"
                        severity="info"
                    />

                </div>

            </div>

            {/* CARDS DE RESUMO */}

            <div className="col-12 lg:col-6 xl:col-3">

                <div className="card mb-0">

                    <div className="flex justify-content-between mb-3">

                        <div>
                            <span className="block text-500 font-medium mb-3">
                                Progresso
                            </span>

                            <div className="text-900 font-medium text-2xl">
                                68%
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
                        value={68}
                        showValue={false}
                        style={{ height: '6px' }}
                    />

                </div>

            </div>

            <div className="col-12 lg:col-6 xl:col-3">

                <div className="card mb-0">

                    <div className="flex justify-content-between mb-3">

                        <div>
                            <span className="block text-500 font-medium mb-3">
                                Sessões realizadas
                            </span>

                            <div className="text-900 font-medium text-2xl">
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
                            <i className="pi pi-calendar-check text-green-500 text-xl" />
                        </div>

                    </div>
{/* 
                    <span className="text-500">
                        de 12 sessões previstas
                    </span> */}

                </div>

            </div>

            <div className="col-12 lg:col-6 xl:col-3">

                <div className="card mb-0">

                    <div className="flex justify-content-between mb-3">

                        <div>
                            <span className="block text-500 font-medium mb-3">
                                Tarefas pendentes
                            </span>

                            <div className="text-900 font-medium text-2xl">
                                4
                            </div>
                        </div>

                        <div
                            className="flex align-items-center justify-content-center bg-orange-100 border-round"
                            style={{
                                width: '2.5rem',
                                height: '2.5rem'
                            }}
                        >
                            <i className="pi pi-list-check text-orange-500 text-xl" />
                        </div>

                    </div>

                    {/* <span className="text-orange-500">
                        Requerem atenção
                    </span> */}

                </div>

            </div>

            <div className="col-12 lg:col-6 xl:col-3">

                <div className="card mb-0">

                    <div className="flex justify-content-between mb-3">

                        <div>
                            <span className="block text-500 font-medium mb-3">
                                Indicadores
                            </span>

                            <div className="text-900 font-medium text-2xl">
                                24 / 30
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

                    {/* <span className="text-500">
                        indicadores cumpridos
                    </span> */}

                </div>

            </div>

            {/* PROGRESSO DO CADERNO */}

            <div className="col-12 lg:col-8">

                <Card>

                    <div className="flex justify-content-between align-items-center">

                        <div>
                            <h5 className="text-900 m-0">
                                Progresso do Caderno
                            </h5>

                            <small className="text-500">
                                Acompanhamento dos blocos de orientação
                            </small>
                        </div>

                        <span className="text-primary font-medium">
                            68%
                        </span>

                    </div>

                    <Divider />

                    {/* BLOCO 1 */}

                    <div className="mb-4">

                        <div className="flex justify-content-between mb-2">

                            <span className="text-900 font-medium">
                                1. Tema e Problematização
                            </span>

                            <span className="text-500">
                                100%
                            </span>

                        </div>

                        <ProgressBar
                            value={100}
                            showValue={false}
                            style={{ height: '7px' }}
                        />

                    </div>

                    {/* BLOCO 2 */}

                    <div className="mb-4">

                        <div className="flex justify-content-between mb-2">

                            <span className="text-900 font-medium">
                                2. Revisão da Literatura
                            </span>

                            <span className="text-500">
                                100%
                            </span>

                        </div>

                        <ProgressBar
                            value={100}
                            showValue={false}
                            style={{ height: '7px' }}
                        />

                    </div>

                    {/* BLOCO 3 */}

                    <div className="mb-4">

                        <div className="flex justify-content-between mb-2">

                            <span className="text-900 font-medium">
                                3. Metodologia
                            </span>

                            <span className="text-500">
                                75%
                            </span>

                        </div>

                        <ProgressBar
                            value={75}
                            showValue={false}
                            style={{ height: '7px' }}
                        />

                    </div>

                    {/* BLOCO 4 */}

                    <div className="mb-4">

                        <div className="flex justify-content-between mb-2">

                            <span className="text-900 font-medium">
                                4. Desenvolvimento
                            </span>

                            <span className="text-500">
                                50%
                            </span>

                        </div>

                        <ProgressBar
                            value={50}
                            showValue={false}
                            style={{ height: '7px' }}
                        />

                    </div>

                    {/* BLOCO 5 */}

                    <div className="mb-4">

                        <div className="flex justify-content-between mb-2">

                            <span className="text-900 font-medium">
                                5. Resultados
                            </span>

                            <span className="text-500">
                                30%
                            </span>

                        </div>

                        <ProgressBar
                            value={30}
                            showValue={false}
                            style={{ height: '7px' }}
                        />

                    </div>

                    {/* BLOCO 6 */}

                    <div>

                        <div className="flex justify-content-between mb-2">

                            <span className="text-900 font-medium">
                                6. Conclusão e preparação da defesa
                            </span>

                            <span className="text-500">
                                0%
                            </span>

                        </div>

                        <ProgressBar
                            value={0}
                            showValue={false}
                            style={{ height: '7px' }}
                        />

                    </div>

                </Card>

            </div>

            {/* PRÓXIMA TAREFA */}

            <div className="col-12 lg:col-4">

                <Card>

                    <h5 className="text-900 m-0">
                        Próxima tarefa
                    </h5>

                    <Divider />

                    <div
                        className="surface-50 border-round p-3"
                    >

                        <div className="flex align-items-center gap-2 mb-3">

                            <div
                                className="flex align-items-center justify-content-center bg-orange-100 border-circle"
                                style={{
                                    width: '2.5rem',
                                    height: '2.5rem'
                                }}
                            >
                                <i className="pi pi-clock text-orange-500" />
                            </div>

                            <Tag
                                value="Pendente"
                                severity="warning"
                            />

                        </div>

                        <h6 className="text-900 mb-2">
                            Rever capítulo de resultados
                        </h6>

                        <p className="text-600 line-height-3 mb-3">
                            Actualizar os resultados apresentados de acordo
                            com as observações do orientador.
                        </p>

                        <div className="flex align-items-center gap-2 text-500">

                            <i className="pi pi-calendar" />

                            <span>
                                Prazo: 20/08/2026
                            </span>

                        </div>

                    </div>

                    <Button
                        label="Ver tarefas"
                        icon="pi pi-arrow-right"
                        text
                        className="mt-3 p-0"
                    />

                </Card>

            </div>

            {/* ÚLTIMA SESSÃO */}

            <div className="col-12 lg:col-4">

                <Card>

                    <h5 className="text-900 m-0">
                        Última sessão
                    </h5>

                    <Divider />

                    <div className="flex gap-3">

                        {/* <Avatar
                            label="CF"
                            shape="circle"
                            size="large"
                            className="bg-primary text-white"
                        /> */}

                        <div>

                            <span className="block text-900 font-medium">
                                Sessão 8 — Metodologia
                            </span>

                            <span className="block text-500 text-sm mt-1">
                                12 de Agosto de 2026
                            </span>

                            <p className="text-600 line-height-3">
                                Foram analisados os instrumentos de recolha
                                de dados e realizadas correcções na
                                metodologia.
                            </p>

                            <Tag
                                value="Concluída"
                                severity="success"
                            />

                        </div>

                    </div>

                </Card>

            </div>

            {/* VERIFICAÇÃO */}

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
                                        value="Concluída"
                                        severity="success"
                                    />

                                </div>

                                <span className="block text-500 text-sm">
                                    Realizada em 15/07/2026
                                </span>

                            </div>

                        </div>

                        <div className="col-12 md:col-6">

                            <div className="surface-50 border-round p-3">

                                <div className="flex justify-content-between mb-3">

                                    <span className="text-900 font-medium">
                                        Verificação Final
                                    </span>

                                    <Tag
                                        value="Pendente"
                                        severity="warning"
                                    />

                                </div>

                                <span className="block text-500 text-sm">
                                    Será realizada após a conclusão
                                    do caderno.
                                </span>

                            </div>

                        </div>

                    </div>

                </Card>

            </div>

            {/* HISTÓRICO */}

            <div className="col-12">

                <Card>

                    <div className="flex align-items-center justify-content-between">

                        <div>
                            <h5 className="text-900 m-0">
                                Histórico de Orientações
                            </h5>

                            <small className="text-500">
                                Registo das últimas sessões realizadas
                            </small>
                        </div>

                        <Button
                            label="Ver histórico completo"
                            icon="pi pi-history"
                            text
                        />

                    </div>

                    <Divider />

                    <Timeline
                        value={sessions}
                        align="left"
                        className="customized-timeline"
                        content={timelineTemplate}
                        marker={timelineMarker}
                    />

                </Card>

            </div>

            {/* ACÇÕES */}

            <div className="col-12">

                <div className="flex justify-content-end gap-2">

                    <Button
                        label="Consultar caderno"
                        icon="pi pi-book"
                        outlined
                    />

                    <Button
                        label="Registar sessão"
                        icon="pi pi-plus"
                    />

                </div>

            </div>

        </div>
    );
};

export default OrientationDashboard;