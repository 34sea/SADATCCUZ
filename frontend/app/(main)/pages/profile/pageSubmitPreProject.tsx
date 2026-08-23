'use client';

import React, { useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { FileUpload } from 'primereact/fileupload';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';

const SubmitPreProject = () => {
    const toast = useRef<Toast>(null);

    const [title, setTitle] = useState('');
    const [area, setArea] = useState(null);
    const [orientador, setOrientador] = useState(null);
    const [summary, setSummary] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const areas = [
        { label: 'Desenvolvimento de Software', value: 'software' },
        { label: 'Inteligência Artificial', value: 'ia' },
        { label: 'Redes de Computadores', value: 'redes' },
        { label: 'Segurança Informática', value: 'seguranca' },
        { label: 'Bases de Dados', value: 'bd' },
        { label: 'Sistemas de Informação', value: 'si' },
        { label: 'Engenharia de Software', value: 'engenharia-software' }
    ];

    const orientadores = [
        {
            label: 'Mestre Cristian Franklin Coulon',
            value: 'cristian-coulon'
        },
        {
            label: 'Dr. João Manuel',
            value: 'joao-manuel'
        },
        {
            label: 'Mestre António Paulo',
            value: 'antonio-paulo'
        }
    ];

    const handleFileSelect = (event: any) => {
        const selectedFile = event.files?.[0];

        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
    };

    const validateForm = () => {
        if (!title.trim()) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Campo obrigatório',
                detail: 'Informe o título do pré-projecto.',
                life: 3000
            });

            return false;
        }

        if (!area) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Campo obrigatório',
                detail: 'Seleccione a área temática.',
                life: 3000
            });

            return false;
        }

        if (!orientador) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Campo obrigatório',
                detail: 'Seleccione o orientador proposto.',
                life: 3000
            });

            return false;
        }

        if (!summary.trim()) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Campo obrigatório',
                detail: 'Introduza o resumo do pré-projecto.',
                life: 3000
            });

            return false;
        }

        if (!file) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Documento obrigatório',
                detail: 'Seleccione o ficheiro do pré-projecto.',
                life: 3000
            });

            return false;
        }

        return true;
    };

    const handleSaveDraft = () => {
        toast.current?.show({
            severity: 'info',
            summary: 'Rascunho guardado',
            detail: 'Os dados do pré-projecto foram guardados como rascunho.',
            life: 3000
        });
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        toast.current?.show({
            severity: 'success',
            summary: 'Pré-projecto submetido',
            detail: 'O pré-projecto foi submetido com sucesso para avaliação.',
            life: 4000
        });
    };

    return (
        <div className="grid">

            <Toast ref={toast} />

            {/* Cabeçalho */}
            <div className="col-12">
                <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-3">

                    <div>
                        <h3 className="text-900 font-semibold m-0">
                            Submissão de Pré-Projecto
                        </h3>

                        <p className="text-600 mt-2 mb-0">
                            Preencha os dados e submeta o seu Trabalho de
                            Culminação de Curso para avaliação.
                        </p>
                    </div>

                    <Tag
                        value="Novo"
                        severity="info"
                        className="align-self-start"
                    />

                </div>
            </div>

            {/* Informações da submissão */}
            <div className="col-12">
                <Card>

                    <div className="flex align-items-center gap-2 mb-4">
                        <i className="pi pi-file-edit text-primary text-xl" />

                        <div>
                            <h5 className="m-0 text-900">
                                Dados do Pré-Projecto
                            </h5>

                            <small className="text-600">
                                Informe os dados principais do seu trabalho.
                            </small>
                        </div>
                    </div>

                    <Divider />

                    <div className="grid">

                        {/* Título */}
                        <div className="col-12">
                            <label
                                htmlFor="title"
                                className="block text-900 font-medium mb-2"
                            >
                                Título do Pré-Projecto
                                <span className="text-red-500 ml-1">*</span>
                            </label>

                            <InputText
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Introduza o título do seu pré-projecto"
                                className="w-full"
                            />

                            <small className="text-500">
                                Utilize um título claro e objectivo.
                            </small>
                        </div>

                        {/* Área temática */}
                        <div className="col-12 md:col-6">

                            <label
                                htmlFor="area"
                                className="block text-900 font-medium mb-2"
                            >
                                Área Temática
                                <span className="text-red-500 ml-1">*</span>
                            </label>

                            <Dropdown
                                id="area"
                                value={area}
                                options={areas}
                                onChange={(e) => setArea(e.value)}
                                placeholder="Seleccione a área temática"
                                className="w-full"
                                filter
                            />

                        </div>

                        {/* Orientador */}
                        <div className="col-12 md:col-6">

                            <label
                                htmlFor="orientador"
                                className="block text-900 font-medium mb-2"
                            >
                                Orientador Proposto
                                <span className="text-red-500 ml-1">*</span>
                            </label>

                            <Dropdown
                                id="orientador"
                                value={orientador}
                                options={orientadores}
                                onChange={(e) => setOrientador(e.value)}
                                placeholder="Seleccione o orientador"
                                className="w-full"
                                filter
                            />

                        </div>

                        {/* Resumo */}
                        <div className="col-12">

                            <label
                                htmlFor="summary"
                                className="block text-900 font-medium mb-2"
                            >
                                Resumo
                                <span className="text-red-500 ml-1">*</span>
                            </label>

                            <InputTextarea
                                id="summary"
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                rows={7}
                                autoResize
                                placeholder="Apresente de forma resumida o problema, objectivos e proposta de solução do projecto."
                                className="w-full"
                            />

                            <div className="flex justify-content-between mt-2">
                                <small className="text-500">
                                    Apresente uma descrição clara do projecto.
                                </small>

                                <small className="text-500">
                                    {summary.length} caracteres
                                </small>
                            </div>

                        </div>

                    </div>

                </Card>
            </div>

            {/* Upload */}
            <div className="col-12 lg:col-8">

                <Card>

                    <div className="flex align-items-center gap-2 mb-4">
                        <i className="pi pi-upload text-primary text-xl" />

                        <div>
                            <h5 className="m-0 text-900">
                                Documento do Pré-Projecto
                            </h5>

                            <small className="text-600">
                                Carregue o documento que será enviado para
                                avaliação.
                            </small>
                        </div>
                    </div>

                    <Divider />

                    <FileUpload
                        name="preproject"
                        accept=".pdf,.doc,.docx"
                        maxFileSize={10000000}
                        customUpload
                        auto={false}
                        chooseLabel="Seleccionar documento"
                        uploadLabel="Carregar"
                        cancelLabel="Cancelar"
                        onSelect={handleFileSelect}
                        emptyTemplate={
                            <div className="flex flex-column align-items-center justify-content-center py-5">

                                <i
                                    className="pi pi-cloud-upload text-500 mb-3"
                                    style={{ fontSize: '3rem' }}
                                />

                                <span className="text-900 font-medium">
                                    Arraste o documento para aqui
                                </span>

                                <span className="text-500 mt-2">
                                    ou clique para seleccionar
                                </span>

                                <small className="text-500 mt-3">
                                    PDF, DOC ou DOCX · Máximo 10 MB
                                </small>

                            </div>
                        }
                    />

                    {file && (
                        <div className="mt-4">

                            <div className="flex align-items-center justify-content-between p-3 surface-100 border-round">

                                <div className="flex align-items-center gap-3">

                                    <div
                                        className="flex align-items-center justify-content-center bg-red-100 border-round"
                                        style={{
                                            width: '3rem',
                                            height: '3rem'
                                        }}
                                    >
                                        <i className="pi pi-file-pdf text-red-500 text-xl" />
                                    </div>

                                    <div>
                                        <div className="text-900 font-medium">
                                            {file.name}
                                        </div>

                                        <small className="text-500">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </small>
                                    </div>

                                </div>

                                <Button
                                    icon="pi pi-times"
                                    severity="danger"
                                    text
                                    rounded
                                    onClick={handleRemoveFile}
                                    tooltip="Remover documento"
                                />

                            </div>

                        </div>
                    )}

                </Card>

            </div>

            {/* Estado */}
            <div className="col-12 lg:col-4">

                <Card>

                    <h5 className="text-900 mt-0">
                        Estado da Submissão
                    </h5>

                    <Divider />

                    <div className="flex align-items-center gap-3 mb-4">

                        <div
                            className="flex align-items-center justify-content-center bg-blue-100 border-circle"
                            style={{
                                width: '2.5rem',
                                height: '2.5rem'
                            }}
                        >
                            <i className="pi pi-file text-blue-500" />
                        </div>

                        <div>
                            <span className="block text-900 font-medium">
                                Pré-projecto
                            </span>

                            <Tag
                                value="Em preenchimento"
                                severity="warning"
                            />
                        </div>

                    </div>

                    <div className="text-600 line-height-3">
                        Depois da submissão, o pré-projecto será encaminhado
                        para o Coordenador de TCC, que poderá atribuir os
                        avaliadores responsáveis pela análise.
                    </div>

                </Card>

            </div>

            {/* Botões */}
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
                        label="Submeter pré-projecto"
                        icon="pi pi-send"
                        onClick={handleSubmit}
                    />

                </div>

            </div>

        </div>
    );
};

export default SubmitPreProject;