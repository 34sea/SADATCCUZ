/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';

const EvaluationForm = () => {
    const toast = useRef<Toast>(null);

    const [nota, setNota] = useState<number | null>(null);
    const [recomendacao, setRecomendacao] = useState<string | null>(null);
    const [observacoes, setObservacoes] = useState('');

    const recomendacoes = [
        { label: 'Recomendar publicação', value: 'sim' },
        { label: 'Não recomendar publicação', value: 'nao' }
    ];

    const criterios = [
        {
            id: 1,
            criterio: 'Relevância e actualidade do tema',
            peso: '15%'
        },
        {
            id: 2,
            criterio: 'Qualidade do enquadramento teórico',
            peso: '15%'
        },
        {
            id: 3,
            criterio: 'Adequação da metodologia',
            peso: '20%'
        },
        {
            id: 4,
            criterio: 'Qualidade dos resultados apresentados',
            peso: '20%'
        },
        {
            id: 5,
            criterio: 'Discussão e interpretação dos resultados',
            peso: '15%'
        },
        {
            id: 6,
            criterio: 'Qualidade da apresentação e organização',
            peso: '15%'
        }
    ];

    const notaBody = () => (
        <InputText
            type="number"
            min="0"
            max="20"
            step="0.1"
            className="w-full"
            placeholder="0 - 20"
        />
    );

    const handleSubmit = () => {
        toast.current?.show({
            severity: 'success',
            summary: 'Avaliação registada',
            detail: 'A ficha de avaliação foi submetida com sucesso.',
            life: 4000
        });
    };

    return (
        <>
            <Toast ref={toast} />

            <div className="grid">

                {/* Cabeçalho */}
                <div className="col-12">
                    <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-3">
                        <div>
                            <h3 className="text-900 font-semibold m-0">
                                Ficha de Avaliação Individual
                            </h3>

                            <p className="text-600 mt-2 mb-0">
                                Avaliação individual do Trabalho de Culminação de Curso
                            </p>
                        </div>

                        <Tag
                            value="Em avaliação"
                            severity="warning"
                            className="text-sm"
                        />
                    </div>
                </div>

                {/* Informações do TCC */}
                <div className="col-12">
                    <Card>
                        <div className="flex align-items-center gap-2 mb-4">
                            <i className="pi pi-file text-primary text-xl"></i>

                            <h5 className="m-0 text-900">
                                Dados do Trabalho
                            </h5>
                        </div>

                        <div className="grid">

                            <div className="col-12 md:col-8">
                                <label className="block text-600 font-medium mb-2">
                                    Título do TCC
                                </label>

                                <InputText
                                    value="Sistema de Gestão Digital do Ciclo de Vida do TCC"
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

                            <div className="col-12 md:col-4">
                                <label className="block text-600 font-medium mb-2">
                                    Estudante
                                </label>

                                <InputText
                                    value="Elísio Simão"
                                    readOnly
                                    className="w-full"
                                />
                            </div>

                            <div className="col-12 md:col-4">
                                <label className="block text-600 font-medium mb-2">
                                    Curso
                                </label>

                                <InputText
                                    value="Engenharia Informática"
                                    readOnly
                                    className="w-full"
                                />
                            </div>

                            <div className="col-12 md:col-4">
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

                        <Divider />

                        <div className="flex flex-column sm:flex-row gap-2">
                            <Button
                                label="Consultar TCC"
                                icon="pi pi-file-pdf"
                                outlined
                            />

                            <Button
                                label="Baixar documento"
                                icon="pi pi-download"
                                outlined
                                severity="secondary"
                            />
                        </div>
                    </Card>
                </div>

                {/* Dados do avaliador */}
                <div className="col-12">
                    <Card>
                        <div className="flex align-items-center gap-2 mb-4">
                            <i className="pi pi-user text-primary text-xl"></i>

                            <h5 className="m-0 text-900">
                                Dados do Avaliador
                            </h5>
                        </div>

                        <div className="grid">

                            <div className="col-12 md:col-6">
                                <label className="block text-600 font-medium mb-2">
                                    Avaliador
                                </label>

                                <InputText
                                    value="Dr. João Manuel"
                                    readOnly
                                    className="w-full"
                                />
                            </div>

                            <div className="col-12 md:col-6">
                                <label className="block text-600 font-medium mb-2">
                                    Função no júri
                                </label>

                                <InputText
                                    value="Membro do Júri / Oponente"
                                    readOnly
                                    className="w-full"
                                />
                            </div>

                        </div>
                    </Card>
                </div>

                {/* Critérios */}
                <div className="col-12">
                    <Card>
                        <div className="flex align-items-center justify-content-between mb-4">
                            <div className="flex align-items-center gap-2">
                                <i className="pi pi-list-check text-primary text-xl"></i>

                                <h5 className="m-0 text-900">
                                    Grelha de Avaliação
                                </h5>
                            </div>

                            <Tag
                                value="Escala: 0 - 20 valores"
                                severity="info"
                            />
                        </div>

                        <DataTable
                            value={criterios}
                            responsiveLayout="scroll"
                            stripedRows
                            showGridlines
                        >
                            <Column
                                field="id"
                                header="#"
                                style={{ width: '60px' }}
                            />

                            <Column
                                field="criterio"
                                header="Critério de Avaliação"
                            />

                            <Column
                                field="peso"
                                header="Peso"
                                style={{ width: '100px' }}
                            />

                            <Column
                                header="Classificação"
                                body={notaBody}
                                style={{ width: '160px' }}
                            />
                        </DataTable>

                        <div className="flex justify-content-end mt-4">
                            <div
                                className="surface-100 border-round p-3"
                                style={{ minWidth: '220px' }}
                            >
                                <span className="text-600 block mb-1">
                                    Classificação final
                                </span>

                                <span className="text-900 font-bold text-2xl">
                                    {nota !== null ? `${nota} valores` : '--'}
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Considerações */}
                <div className="col-12 lg:col-8">
                    <Card>
                        <div className="flex align-items-center gap-2 mb-4">
                            <i className="pi pi-comment text-primary text-xl"></i>

                            <h5 className="m-0 text-900">
                                Considerações do Avaliador
                            </h5>
                        </div>

                        <label className="block text-600 font-medium mb-2">
                            Observações
                        </label>

                        <InputTextarea
                            value={observacoes}
                            onChange={(e) =>
                                setObservacoes(e.target.value)
                            }
                            rows={7}
                            className="w-full"
                            placeholder="Registe aqui as observações, recomendações ou aspectos que devem ser considerados pelo estudante..."
                        />
                    </Card>
                </div>

                {/* Publicação */}
                <div className="col-12 lg:col-4">
                    <Card>
                        <div className="flex align-items-center gap-2 mb-4">
                            <i className="pi pi-book text-primary text-xl"></i>

                            <h5 className="m-0 text-900">
                                Publicação
                            </h5>
                        </div>

                        <label className="block text-600 font-medium mb-2">
                            Recomendação de publicação
                        </label>

                        <Dropdown
                            value={recomendacao}
                            onChange={(e) =>
                                setRecomendacao(e.value)
                            }
                            options={recomendacoes}
                            placeholder="Seleccione uma opção"
                            className="w-full"
                        />

                        <small className="text-600 block mt-3 line-height-3">
                            Indique se considera que o trabalho apresenta
                            qualidade suficiente para ser recomendado para
                            publicação científica.
                        </small>
                    </Card>
                </div>

                {/* Ações */}
                <div className="col-12">
                    <Card>
                        <div className="flex flex-column sm:flex-row justify-content-end gap-2">

                            <Button
                                label="Cancelar"
                                icon="pi pi-times"
                                outlined
                                severity="secondary"
                            />

                            <Button
                                label="Guardar rascunho"
                                icon="pi pi-save"
                                outlined
                            />

                            <Button
                                label="Submeter avaliação"
                                icon="pi pi-check"
                                onClick={handleSubmit}
                            />

                        </div>
                    </Card>
                </div>

            </div>
        </>
    );
};

export default EvaluationForm;