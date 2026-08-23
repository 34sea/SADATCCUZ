'use client';

import React, { useRef, useState } from 'react';

import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Panel } from 'primereact/panel';
import { Dialog } from 'primereact/dialog';

const ProjectEvaluation = () => {
    const toast = useRef<Toast>(null);

    const [classification, setClassification] = useState<number | null>(null);
    const [parecer, setParecer] = useState('');
    const [observacoes, setObservacoes] = useState('');
    const [showDocument, setShowDocument] = useState(false);

    const handleSubmit = () => {
        if (classification === null) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Classificação obrigatória',
                detail: 'Informe a classificação do Projecto.',
                life: 3000
            });

            return;
        }

        if (!parecer.trim()) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Parecer obrigatório',
                detail: 'Informe o parecer da avaliação.',
                life: 3000
            });

            return;
        }

        toast.current?.show({
            severity: 'success',
            summary: 'Avaliação submetida',
            detail: 'O parecer foi registado com sucesso.',
            life: 4000
        });
    };

    const handleSaveDraft = () => {
        toast.current?.show({
            severity: 'info',
            summary: 'Rascunho guardado',
            detail: 'A avaliação foi guardada como rascunho.',
            life: 3000
        });
    };

    return (
        <div className="grid">

            <Toast ref={toast} />

            {/* CABEÇALHO */}
            <div className="col-12">

                <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-3">

                    <div>
                        <h3 className="text-900 font-semibold m-0">
                            Avaliação de Projecto
                        </h3>

                        <p className="text-600 mt-2 mb-0">
                            Analise o Projecto submetido e registe o seu
                            parecer e classificação.
                        </p>
                    </div>

                    <Tag
                        value="Em avaliação"
                        severity="warning"
                    />

                </div>

            </div>

            {/* INFORMAÇÕES DO PROJECTO */}
            <div className="col-12 lg:col-8">

                <Card>

                    <div className="flex align-items-center gap-2 mb-3">

                        <i className="pi pi-file text-primary text-xl" />

                        <div>
                            <h5 className="m-0 text-900">
                                Informações do Projecto
                            </h5>

                            <small className="text-600">
                                Dados submetidos pelo estudante.
                            </small>
                        </div>

                    </div>

                    <Divider />

                    <div className="grid">

                        {/* ESTUDANTE */}
                        <div className="col-12 md:col-6">

                            <span className="block text-500 mb-2">
                                Estudante
                            </span>

                            <div className="text-900 font-medium">
                                Elísio Simão
                            </div>

                        </div>

                        {/* CÓDIGO */}
                        <div className="col-12 md:col-6">

                            <span className="block text-500 mb-2">
                                Código do TCC
                            </span>

                            <div className="text-900 font-medium">
                                TCC-2026-014
                            </div>

                        </div>

                        {/* TÍTULO */}
                        <div className="col-12">

                            <span className="block text-500 mb-2">
                                Título
                            </span>

                            <div className="text-900 font-medium text-lg line-height-3">
                                Gestão Digital do Ciclo de Vida do Trabalho de
                                Culminação de Curso
                            </div>

                        </div>

                        {/* ÁREA */}
                        <div className="col-12 md:col-6">

                            <span className="block text-500 mb-2">
                                Área Temática
                            </span>

                            <Tag
                                value="Engenharia de Software"
                                severity="info"
                            />

                        </div>

                        {/* ORIENTADOR */}
                        <div className="col-12 md:col-6">

                            <span className="block text-500 mb-2">
                                Orientador Proposto
                            </span>

                            <div className="text-900">
                                Mestre Joaquim Mateus
                            </div>

                        </div>

                        {/* RESUMO */}
                        <div className="col-12">

                            <span className="block text-500 mb-2">
                                Resumo
                            </span>

                            <div className="surface-50 border-round p-3 text-700 line-height-3">

                                O presente trabalho propõe o desenvolvimento
                                de uma solução informática destinada à
                                digitalização e gestão do ciclo de vida dos
                                Trabalhos de Culminação de Curso, permitindo
                                melhorar a eficiência, rastreabilidade e
                                acompanhamento das diferentes etapas do
                                processo académico.

                            </div>

                        </div>

                    </div>

                </Card>

            </div>

            {/* DOCUMENTO */}
            <div className="col-12 lg:col-4">

                <Card>

                    <h5 className="text-900 mt-0">
                        Documento submetido
                    </h5>

                    <Divider />

                    <div className="flex flex-column align-items-center text-center py-4">

                        <div
                            className="flex align-items-center justify-content-center bg-red-100 border-round mb-3"
                            style={{
                                width: '4.5rem',
                                height: '4.5rem'
                            }}
                        >
                            <i className="pi pi-file-pdf text-red-500 text-4xl" />
                        </div>

                        <span className="text-900 font-medium">
                            Pre-Projecto-Elisio-Simao.pdf
                        </span>

                        <small className="text-500 mt-2">
                            PDF · 3.8 MB
                        </small>

                        <Button
                            label="Visualizar documento"
                            icon="pi pi-eye"
                            outlined
                            className="mt-4"
                            onClick={() => setShowDocument(true)}
                        />

                        <Button
                            label="Baixar documento"
                            icon="pi pi-download"
                            text
                            className="mt-2"
                        />

                    </div>

                </Card>

            </div>

            {/* CRITÉRIOS DE AVALIAÇÃO */}
            <div className="col-12">

                <Card>

                    <div className="flex align-items-center gap-2">

                        <i className="pi pi-list-check text-primary text-xl" />

                        <div>
                            <h5 className="m-0 text-900">
                                Avaliação
                            </h5>

                            <small className="text-600">
                                Registe a classificação e o parecer do
                                Projecto.
                            </small>
                        </div>

                    </div>

                    <Divider />

                    <div className="grid">

                        {/* CLASSIFICAÇÃO */}
                        <div className="col-12 md:col-4">

                            <label
                                htmlFor="classification"
                                className="block text-900 font-medium mb-2"
                            >
                                Classificação
                                <span className="text-red-500 ml-1">
                                    *
                                </span>
                            </label>

                            <InputNumber
                                id="classification"
                                value={classification}
                                onValueChange={(e) =>
                                    setClassification(e.value ?? null)
                                }
                                min={0}
                                max={20}
                                minFractionDigits={0}
                                maxFractionDigits={2}
                                suffix=" valores"
                                placeholder="0 - 20"
                                className="w-full"
                                inputClassName="w-full"
                            />

                            <small className="text-500">
                                Classificação de 0 a 20 valores.
                            </small>

                        </div>

                        {/* RESULTADO */}
                        <div className="col-12 md:col-8">

                            <label className="block text-900 font-medium mb-2">
                                Resultado
                            </label>

                            <div className="surface-50 border-round p-3 flex align-items-center gap-3">

                                <i className="pi pi-info-circle text-primary text-xl" />

                                <div>
                                    <span className="block text-900 font-medium">
                                        Decisão individual
                                    </span>

                                    <small className="text-600">
                                        A decisão final será calculada pelo
                                        sistema com base nos pareceres dos
                                        três avaliadores.
                                    </small>
                                </div>

                            </div>

                        </div>

                        {/* PARECER */}
                        <div className="col-12">

                            <label
                                htmlFor="parecer"
                                className="block text-900 font-medium mb-2"
                            >
                                Parecer
                                <span className="text-red-500 ml-1">
                                    *
                                </span>
                            </label>

                            <InputTextarea
                                id="parecer"
                                value={parecer}
                                onChange={(e) =>
                                    setParecer(e.target.value)
                                }
                                rows={6}
                                autoResize
                                className="w-full"
                                placeholder="Apresente o seu parecer sobre o Projecto, considerando a relevância do tema, clareza dos objectivos, metodologia proposta e viabilidade do projecto."
                            />

                        </div>

                        {/* OBSERVAÇÕES */}
                        <div className="col-12">

                            <label
                                htmlFor="observacoes"
                                className="block text-900 font-medium mb-2"
                            >
                                Observações
                            </label>

                            <InputTextarea
                                id="observacoes"
                                value={observacoes}
                                onChange={(e) =>
                                    setObservacoes(e.target.value)
                                }
                                rows={4}
                                autoResize
                                className="w-full"
                                placeholder="Registe sugestões de melhoria, correcções ou outras observações."
                            />

                        </div>

                    </div>

                </Card>

            </div>

            {/* HISTÓRICO */}
            <div className="col-12">

                <Panel header="Informação do processo">

                    <div className="grid">

                        <div className="col-12 md:col-4">

                            <span className="block text-500 mb-2">
                                Estado
                            </span>

                            <Tag
                                value="Em Avaliação"
                                severity="warning"
                            />

                        </div>

                        <div className="col-12 md:col-4">

                            <span className="block text-500 mb-2">
                                Avaliadores atribuídos
                            </span>

                            <span className="text-900 font-medium">
                                3 avaliadores
                            </span>

                        </div>

                        <div className="col-12 md:col-4">

                            <span className="block text-500 mb-2">
                                Prazo de avaliação
                            </span>

                            <span className="text-900 font-medium">
                                30/08/2026
                            </span>

                        </div>

                    </div>

                </Panel>

            </div>

            {/* BOTÕES */}
            <div className="col-12">

                <div className="flex justify-content-end gap-2">

                    <Button
                        label="Guardar rascunho"
                        icon="pi pi-save"
                        severity="secondary"
                        outlined
                        onClick={handleSaveDraft}
                    />

                    <Button
                        label="Submeter avaliação"
                        icon="pi pi-check"
                        onClick={handleSubmit}
                    />

                </div>

            </div>

            {/* MODAL DOCUMENTO */}
            <Dialog
                header="Projecto"
                visible={showDocument}
                style={{ width: '90vw', height: '90vh' }}
                maximizable
                onHide={() => setShowDocument(false)}
            >

                <div
                    className="flex align-items-center justify-content-center surface-100 border-round"
                    style={{
                        height: '70vh'
                    }}
                >

                    <div className="text-center">

                        <i
                            className="pi pi-file-pdf text-red-500"
                            style={{ fontSize: '4rem' }}
                        />

                        <h4 className="text-900">
                            Projecto-Elisio-Simao.pdf
                        </h4>

                        <p className="text-600">
                            O visualizador do documento será integrado
                            posteriormente através do ficheiro disponibilizado
                            pela API.
                        </p>

                    </div>

                </div>

            </Dialog>

        </div>
    );
};

export default ProjectEvaluation;