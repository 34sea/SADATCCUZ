/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useContext, useEffect, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Avatar } from 'primereact/avatar';
import { Divider } from 'primereact/divider';
import { Chart } from 'primereact/chart';
import { ProgressBar } from 'primereact/progressbar';
// import { LayoutContext } from '../../../layout/context/layoutcontext';
import { ChartData, ChartOptions } from 'chart.js';
import { LayoutContext } from '@/layout/context/layoutcontext';

interface UserProfile {
    nome: string;
    email: string;
    telefone: string;
    departamento: string;
    cargo: string;
    numRegisto: string;
    funcoes: string[];
}

const ProfileUser = () => {
    const [loading, setLoading] = useState(false);
    const { layoutConfig } = useContext(LayoutContext);
    const [barOptions, setBarOptions] = useState<ChartOptions>({});

    const [profile, setProfile] = useState<UserProfile>({
        nome: 'Dra. Sheila Guambe',
        email: 'sheila.guambe@sada.ac.mz',
        telefone: '+258 84 987 6543',
        departamento: 'Engenharia informática',
        cargo: 'Orientadora',
        numRegisto: 'DOC-2026-089',
        funcoes: ['Orientadora', 'Avaliadora', 'Membro do Júri']
    });

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Gráfico de Barras: Comparativo de Atividades do Semestre
    const barData: ChartData = {
        labels: ['Semestre I (2025)', 'Semestre II (2025)', 'Semestre I (2026)', 'Semestre II (2026)'],
        datasets: [
            {
                label: 'Pré-Projectos Avaliados',
                backgroundColor: '#3B82F6',
                data: [12, 19, 15, 22]
            },
            {
                label: 'Defesas Realizadas',
                backgroundColor: '#10B981',
                data: [8, 14, 10, 18]
            }
        ]
    };

    useEffect(() => {
        const isDark = layoutConfig.colorScheme === 'dark';
        const textColor = isDark ? '#ebedef' : '#495057';
        const gridColor = isDark ? 'rgba(160, 167, 181, .3)' : '#ebedef';

        setBarOptions({
            plugins: {
                legend: { labels: { color: textColor } }
            },
            scales: {
                x: {
                    ticks: { color: textColor },
                    grid: { color: gridColor }
                },
                y: {
                    ticks: { color: textColor },
                    grid: { color: gridColor }
                }
            }
        });
    }, [layoutConfig.colorScheme]);

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => setLoading(false), 1000);
    };

    return (
        <div className="grid p-fluid">
            {/* Header / Estatísticas Rápidas */}
            <div className="col-12">
                <div className="card mb-4 surface-card shadow-1 p-4 border-round flex flex-column md:flex-row justify-content-between align-items-center gap-4">
                    <div className="flex align-items-center gap-4">
                        <Avatar 
                            image="https://plus.unsplash.com/premium_photo-1661589836910-b3b0bf644bd5?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                            size="xlarge" 
                            shape="circle" 
                            className="w-7rem h-7rem shadow-2"
                        />
                        <div>
                            <h2 className="text-900 font-bold m-0">{profile.nome}</h2>
                            <p className="text-600 m-0 mt-1">{profile.cargo} — <span className="font-semibold text-primary">{profile.departamento}</span></p>
                            {/* <div className="flex gap-2 mt-2">
                                {profile.funcoes.map((f, i) => (
                                    <Tag key={i} value={f} severity="info" className="px-2 py-1 text-xs" />
                                ))}
                            </div> */}
                        </div>
                    </div>
                    <div className="flex gap-4 border-top-1 md:border-top-none md:border-left-1 surface-border pt-3 md:pt-0 md:pl-4 w-full md:w-auto justify-content-around">
                        <div className="text-center">
                            <span className="block text-500 font-medium">Orientados</span>
                            <span className="text-900 font-bold text-2xl">14</span>
                        </div>
                        <div className="text-center">
                            <span className="block text-500 font-medium">Avaliações</span>
                            <span className="text-900 font-bold text-2xl">38</span>
                        </div>
                        <div className="text-center">
                            <span className="block text-500 font-medium">Júris</span>
                            <span className="text-900 font-bold text-2xl">21</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Coluna Esquerda: Informações Gerais & Segurança */}
            <div className="col-12 lg:col-7">
                {/* Edição de Dados Pessoais */}
                <div className="card mb-4">
                    <h5 className="mb-4 text-900">Dados Institucionais</h5>
                    <form onSubmit={handleSaveProfile} className="grid">
                        <div className="col-12 md:col-6 field mb-3">
                            <label htmlFor="nome" className="font-medium text-900">Nome Completo</label>
                            <InputText id="nome" value={profile.nome} onChange={(e) => setProfile({ ...profile, nome: e.target.value })} required />
                        </div>

                        <div className="col-12 md:col-6 field mb-3">
                            <label htmlFor="numRegisto" className="font-medium text-900">Nº de Registo Docente</label>
                            <InputText id="numRegisto" value={profile.numRegisto} disabled className="surface-200" />
                        </div>

                        <div className="col-12 md:col-6 field mb-3">
                            <label htmlFor="email" className="font-medium text-900">Email Institucional</label>
                            <InputText id="email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} required />
                        </div>

                        <div className="col-12 md:col-6 field mb-3">
                            <label htmlFor="telefone" className="font-medium text-900">Telefone / Contacto</label>
                            <InputText id="telefone" value={profile.telefone} onChange={(e) => setProfile({ ...profile, telefone: e.target.value })} />
                        </div>

                        <div className="col-12 field mb-3">
                            <label htmlFor="departamento" className="font-medium text-900">Departamento</label>
                            <InputText id="departamento" value={profile.departamento} disabled className="surface-200" />
                        </div>

                        <div className="col-12 flex justify-content-end mt-2">
                            <Button type="submit" label="Salvar Alterações" icon="pi pi-check" loading={loading} className="w-auto" />
                        </div>
                    </form>
                </div>

                {/* Alteração de Palavra-passe */}
                <div className="card">
                    <h5 className="mb-4 text-900">Segurança & Credenciais</h5>
                    <div className="grid">
                        <div className="col-12 md:col-4 field mb-3">
                            <label htmlFor="currentPassword" className="font-medium text-900">Palavra-passe Atual</label>
                            <Password id="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} toggleMask feedback={false} />
                        </div>

                        <div className="col-12 md:col-4 field mb-3">
                            <label htmlFor="newPassword" className="font-medium text-900">Nova Palavra-passe</label>
                            <Password id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} toggleMask />
                        </div>

                        <div className="col-12 md:col-4 field mb-3">
                            <label htmlFor="confirmPassword" className="font-medium text-900">Confirmar Nova</label>
                            <Password id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} toggleMask feedback={false} />
                        </div>

                        <div className="col-12 flex justify-content-end mt-2">
                            <Button type="button" label="Atualizar Palavra-passe" icon="pi pi-key" severity="warning" className="w-auto" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Coluna Direita: Gráficos de Produção & Metas */}
            <div className="col-12 lg:col-5">
                {/* Gráfico de Barras de Produção Académica */}
                <div className="card mb-4">
                    <h5 className="mb-3 text-900">Histórico de Atividades por Semestre</h5>
                    <Chart type="bar" data={barData} options={barOptions} />
                </div>

                {/* Progresso de Metas de Orientação */}
                <div className="card">
                    <h5 className="mb-4 text-900">Metas de Acompanhamento (2026)</h5>

                    <div className="mb-3">
                        <div className="flex justify-content-between mb-2">
                            <span className="text-700 font-medium">Revisão de Cadernos de TCC</span>
                            <span className="text-900 font-bold">88%</span>
                        </div>
                        <ProgressBar value={88} showValue={false} style={{ height: '8px' }} />
                    </div>

                    <div className="mb-3">
                        <div className="flex justify-content-between mb-2">
                            <span className="text-700 font-medium">Emissão de Pareceres Finais</span>
                            <span className="text-900 font-bold">95%</span>
                        </div>
                        <ProgressBar value={95} color="#10B981" showValue={false} style={{ height: '8px' }} />
                    </div>

                    <div>
                        <div className="flex justify-content-between mb-2">
                            <span className="text-700 font-medium">Atribuição de Actas Digitais</span>
                            <span className="text-900 font-bold">64%</span>
                        </div>
                        <ProgressBar value={64} color="#F59E0B" showValue={false} style={{ height: '8px' }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileUser;