/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';

const DefenseMinutes = () => {
    const toast = useRef<Toast>(null);

    const [resultado, setResultado] = useState<string | null>(null);
    const [classificacao, setClassificacao] = useState('');
    const [observacoes, setObservacoes] = useState('');

    const resultados = [
        {
            label: 'Aprovado',
            value: 'aprovado'
        },
        {
            label: 'Reprovado',
            value: 'reprovado'
        }
    ];

    const membrosJuri = [
        {
            nome: 'Mestre Joaquim Franklin',
            funcao: 'Presidente do Júri',
            nota: 17
        },
        {
            nome: 'Dr. João Manuel',
            funcao: 'Membro do Júri / Oponente',
            nota: 16
        },
        {
            nome: 'Dra. Maria José',
            funcao: 'Membro do Júri',
            nota: 17
        }
    ];

    const handleGenerate = (format: string) => {
        toast.current?.show({
            severity: 'success',
            summary: 'Acta gerada',
            detail: `A acta foi preparada para exportação em ${format}.`,
            life: 4000
        });
    };

    const handleSave = () => {
        toast.current?.show({
            severity: 'success',
            summary: 'Acta guardada',
            detail: 'Os dados da acta foram guardados com sucesso.',
            life: 4000
        });
    };

    return (
        <>
            <Toast ref={toast} />

            <div className="grid">

                {/* CABEÇALHO */}
                <div className="col-12">
                    <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-3">
                        <div>
                            <h3 className="text-900 font-semibold m-0">
                                Elaboração da Acta de Defesa
                            </h3>

                            <p className="text-600 mt-2 mb-0">
                                Geração e validação da Acta de Defesa Pública
                            </p>
                        </div>

                        <Tag
                            value="Em elaboração"
                            severity="warning"
                        />
                    </div>
                </div>

                {/* DADOS DA DEFESA */}
                <div className="col-12">
                    <Card>
                        <div className="flex align-items-center gap-2 mb-4">
                            <i className="pi pi-calendar text-primary text-xl"></i>

                            <h5 className="m-0 text-900">
                                Dados da Defesa
                            </h5>
                        </div>

                        <div className="grid">

                            <div className="col-12 md:col-8">
                                <label className="block text-600 font-medium mb-2">
                                    Título do Trabalho
                                </label>

                                <InputText
                                    value="Gestão Digital do Ciclo de Vida do Trabalho de Culminação de Curso"
                                    readOnly
                                    className="w-full"
                                />
                            </div>

                            <div className="col-12 md:col-4">
                                <label className="block text-600 font-medium mb-2">
                                    Código do TCC
                                </label>

                                <InputText
                                    value="TCC-2026-001"
                                    readOnly
                                    className="w-full"
                                />
                            </div>

                            <div className="col-12 md:col-3">
                                <label className="block text-600 font-medium mb-2">
                                    Data
                                </label>

                                <InputText
                                    value="28/08/2026"
                                    readOnly
                                    className="w-full"
                                />
                            </div>

                            <div className="col-12 md:col-3">
                                <label className="block text-600 font-medium mb-2">
                                    Hora
                                </label>

                                <InputText
                                    value="14:00"
                                    readOnly
                                    className="w-full"
                                />
                            </div>

                            <div className="col-12 md:col-3">
                                <label className="block text-600 font-medium mb-2">
                                    Sala
                                </label>

                                <InputText
                                    value="Sala de Defesas 01"
                                    readOnly
                                    className="w-full"
                                />
                            </div>

                            <div className="col-12 md:col-3">
                                <label className="block text-600 font-medium mb-2">
                                    Curso
                                </label>

                                <InputText
                                    value="Engenharia Informática"
                                    readOnly
                                    className="w-full"
                                />
                            </div>

                        </div>
                    </Card>
                </div>

                {/* DADOS DO ESTUDANTE */}
                <div className="col-12 lg:col-6">
                    <Card className="h-full">
                        <div className="flex align-items-center gap-2 mb-4">
                            <i className="pi pi-user text-primary text-xl"></i>

                            <h5 className="m-0 text-900">
                                Dados do Estudante
                            </h5>
                        </div>

                        <div className="grid">

                            <div className="col-12">
                                <label className="block text-600 font-medium mb-2">
                                    Nome completo
                                </label>

                                <InputText
                                    value="Elísio Simão"
                                    readOnly
                                    className="w-full"
                                />
                            </div>

                            <div className="col-12 md:col-6">
                                <label className="block text-600 font-medium mb-2">
                                    Nº de estudante
                                </label>

                                <InputText
                                    value="2020XXXX"
                                    readOnly
                                    className="w-full"
                                />
                            </div>

                            <div className="col-12 md:col-6">
                                <label className="block text-600 font-medium mb-2">
                                    Curso
                                </label>

                                <InputText
                                    value="Engenharia Informática"
                                    readOnly
                                    className="w-full"
                                />
                            </div>

                            <div className="col-12">
                                <label className="block text-600 font-medium mb-2">
                                    Orientador
                                </label>

                                <InputText
                                    value="Mestre Cristian Franklin Coulon"
                                    readOnly
                                    className="w-full"
                                />
                            </div>

                        </div>
                    </Card>
                </div>

                {/* JÚRI */}
                <div className="col-12 lg:col-6">
                    <Card className="h-full">
                        <div className="flex align-items-center gap-2 mb-4">
                            <i className="pi pi-users text-primary text-xl"></i>

                            <h5 className="m-0 text-900">
                                Composição do Júri
                            </h5>
                        </div>

                        <DataTable
                            value={membrosJuri}
                            size="small"
                            stripedRows
                        >
                            <Column
                                field="nome"
                                header="Membro"
                            />

                            <Column
                                field="funcao"
                                header="Função"
                            />
                        </DataTable>
                    </Card>
                </div>

                {/* AVALIAÇÕES */}
                <div className="col-12">
                    <Card>
                        <div className="flex align-items-center justify-content-between mb-4">

                            <div className="flex align-items-center gap-2">
                                <i className="pi pi-chart-bar text-primary text-xl"></i>

                                <h5 className="m-0 text-900">
                                    Resumo das Avaliações
                                </h5>
                            </div>

                            <Tag
                                value="Avaliações individuais"
                                severity="info"
                            />

                        </div>

                        <DataTable
                            value={membrosJuri}
                            responsiveLayout="scroll"
                            stripedRows
                            showGridlines
                        >
                            <Column
                                field="nome"
                                header="Membro do Júri"
                            />

                            <Column
                                field="funcao"
                                header="Função"
                            />

                            <Column
                                field="nota"
                                header="Classificação"
                                body={(rowData) => (
                                    <span className="font-semibold">
                                        {rowData.nota} valores
                                    </span>
                                )}
                            />

                            <Column
                                header="Estado"
                                body={() => (
                                    <Tag
                                        value="Submetida"
                                        severity="success"
                                    />
                                )}
                            />
                        </DataTable>

                        <Divider />

                        <div className="flex justify-content-end">
                            <div
                                className="surface-100 border-round p-3"
                                style={{ minWidth: '230px' }}
                            >
                                <span className="block text-600 mb-1">
                                    Média das avaliações
                                </span>

                                <span className="text-900 font-bold text-2xl">
                                    16,7 valores
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* DECISÃO DA DEFESA */}
                <div className="col-12 lg:col-6">
                    <Card className="h-full">

                        <div className="flex align-items-center gap-2 mb-4">
                            <i className="pi pi-check-circle text-primary text-xl"></i>

                            <h5 className="m-0 text-900">
                                Decisão da Defesa
                            </h5>
                        </div>

                        <div className="grid">

                            <div className="col-12">
                                <label className="block text-600 font-medium mb-2">
                                    Resultado
                                </label>

                                <Dropdown
                                    value={resultado}
                                    onChange={(e) =>
                                        setResultado(e.value)
                                    }
                                    options={resultados}
                                    placeholder="Seleccione o resultado"
                                    className="w-full"
                                />
                            </div>

                            <div className="col-12">
                                <label className="block text-600 font-medium mb-2">
                                    Classificação final
                                </label>

                                <InputText
                                    type="number"
                                    min="0"
                                    max="20"
                                    step="0.1"
                                    value={classificacao}
                                    onChange={(e) =>
                                        setClassificacao(e.target.value)
                                    }
                                    placeholder="Ex.: 16.7"
                                    className="w-full"
                                />
                            </div>

                        </div>

                    </Card>
                </div>

                {/* OBSERVAÇÕES */}
                <div className="col-12 lg:col-6">
                    <Card className="h-full">

                        <div className="flex align-items-center gap-2 mb-4">
                            <i className="pi pi-comment text-primary text-xl"></i>

                            <h5 className="m-0 text-900">
                                Considerações da Defesa
                            </h5>
                        </div>

                        <InputTextarea
                            value={observacoes}
                            onChange={(e) =>
                                setObservacoes(e.target.value)
                            }
                            rows={6}
                            className="w-full"
                            placeholder="Registe as considerações finais da defesa, recomendações ou observações do júri..."
                        />

                    </Card>
                </div>

                {/* PRÉ-VISUALIZAÇÃO */}
                <div className="col-12">
                    <Card>

                        <div className="flex align-items-center justify-content-between mb-4">

                            <div className="flex align-items-center gap-2">
                                <i className="pi pi-file text-primary text-xl"></i>

                                <h5 className="m-0 text-900">
                                    Documento da Acta
                                </h5>
                            </div>

                          <Tag
    value="Pré-visualização"
    severity="info"
/>

                        </div>

                        <div className="surface-100 border-round p-5">

                            <div className="text-center">

                                <div className="text-900 font-bold text-xl mb-2">
                                    UNIVERSIDADE ZAMBEZE
                                </div>

                                <div className="text-700 font-medium">
                                    FACULDADE DE CIÊNCIAS E TECNOLOGIA
                                </div>

                                <div className="text-700 mt-1">
                                    DEPARTAMENTO DE ENGENHARIA INFORMÁTICA
                                </div>

                                <Divider />

                                <div className="text-900 font-bold text-lg">
                                    ACTA DE DEFESA PÚBLICA
                                </div>

                            </div>

                            <p className="text-700 line-height-3 mt-4">
                                Aos 28 dias do mês de Agosto de 2026, realizou-se
                                a defesa pública do Trabalho de Culminação de
                                Curso intitulado
                                <strong>
                                    {' '}
                                    "Gestão Digital do Ciclo de Vida do Trabalho
                                    de Culminação de Curso"
                                </strong>
                                , apresentado pelo estudante
                                <strong> Elísio Simão</strong>, do curso de
                                Engenharia Informática.
                            </p>

                            <p className="text-700 line-height-3">
                                Após a apresentação e discussão do trabalho,
                                tendo em consideração as avaliações individuais
                                dos membros do júri, foi deliberado o resultado
                                final da defesa.
                            </p>

                            <div className="flex justify-content-center mt-4">
                                <div className="surface-card border-round p-4 text-center shadow-1">
                                    <span className="block text-600 mb-2">
                                        Classificação Final
                                    </span>

                                    <span className="text-primary font-bold text-3xl">
                                        {classificacao || '16,7'}
                                    </span>

                                    <span className="text-700 ml-2">
                                        valores
                                    </span>
                                </div>
                            </div>

                        </div>

                    </Card>
                </div>

                {/* AÇÕES */}
                <div className="col-12">
                    <Card>

                        <div className="flex flex-column md:flex-row justify-content-between align-items-center gap-3">

                            <div>
                                <span className="text-600">
                                    Depois de confirmar, a acta poderá ser
                                    exportada para os formatos oficiais.
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2">

                                <Button
                                    label="Guardar"
                                    icon="pi pi-save"
                                    outlined
                                    onClick={handleSave}
                                />

                                <Button
                                    label="Exportar PDF"
                                    icon="pi pi-file-pdf"
                                    severity="danger"
                                    outlined
                                    onClick={() =>
                                        handleGenerate('PDF')
                                    }
                                />

                                <Button
                                    label="Exportar Word"
                                    icon="pi pi-file-word"
                                    severity="info"
                                    outlined
                                    onClick={() =>
                                        handleGenerate('Word')
                                    }
                                />

                                <Button
                                    label="Confirmar Acta"
                                    icon="pi pi-check"
                                    onClick={() =>
                                        toast.current?.show({
                                            severity: 'success',
                                            summary: 'Acta confirmada',
                                            detail: 'A Acta de Defesa foi confirmada com sucesso.',
                                            life: 4000
                                        })
                                    }
                                />

                            </div>

                        </div>

                    </Card>
                </div>

            </div>
        </>
    );
};

export default DefenseMinutes;