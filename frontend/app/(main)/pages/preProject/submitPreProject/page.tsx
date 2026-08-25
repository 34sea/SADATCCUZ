'use client';

import React, {
    useEffect,
    useRef,
    useState
} from 'react';

import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { FileUpload } from 'primereact/fileupload';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';

import {
    getUsers,
    User
} from '@/app/api/users/userService';
import { submitPreProject } from '@/app/api/pre-projects/preProjectService';

// import {SubmitPreProject} from '../../profile/pageSubmitPreProject';

// =====================================================
// TYPES
// =====================================================

interface AreaOption {
    label: string;
    value: string;
}

// interface OrientadorOption {
//     label: string;
//     value: number;
// }

// =====================================================
// COMPONENT
// =====================================================

const SubmitPreProject = () => {


    const toast = useRef<Toast>(null);


    // =====================================================
    // FORM STATE
    // =====================================================

    const [title, setTitle] =
        useState('');

    const [area, setArea] =
        useState<string | null>(null);

    const [orientador, setOrientador] =
        useState<number | null>(null);

    const [summary, setSummary] =
        useState('');

    const [file, setFile] =
        useState<File | null>(null);


    // =====================================================
    // ORIENTADORES
    // =====================================================

    const [orientadores, setOrientadores] =
        useState<User[]>([]);

    const [loadingOrientadores, setLoadingOrientadores] =
        useState(false);


    // =====================================================
    // SUBMIT
    // =====================================================

    const [submitting, setSubmitting] =
        useState(false);


    // =====================================================
    // ÁREAS TEMÁTICAS
    // =====================================================

    const areas: AreaOption[] = [

        {
            label: 'Desenvolvimento de Software',
            value: 'Desenvolvimento de Software'
        },

        {
            label: 'Inteligência Artificial',
            value: 'Inteligência Artificial'
        },

        {
            label: 'Redes de Computadores',
            value: 'Redes de Computadores'
        },

        {
            label: 'Segurança Informática',
            value: 'Segurança Informática'
        },

        {
            label: 'Bases de Dados',
            value: 'Bases de Dados'
        },

        {
            label: 'Sistemas de Informação',
            value: 'Sistemas de Informação'
        },

        {
            label: 'Engenharia de Software',
            value: 'Engenharia de Software'
        }
    ];


    // =====================================================
    // LOAD ORIENTADORES
    // =====================================================

    const loadOrientadores = async () => {

        try {

            setLoadingOrientadores(true);

            const users = await getUsers({
                role: 'ORIENTADOR',
                is_active: true
            });


            // Segurança adicional:
            // mesmo que a API não filtre correctamente,
            // garantimos aqui que apenas ORIENTADOR aparece.

            const onlyOrientadores =
                users.filter((user) =>
                    user.roles?.some(
                        (role) =>
                            role.toUpperCase() === 'ORIENTADOR'
                    )
                );


            setOrientadores(
                onlyOrientadores
            );

        } catch (error: any) {

            const message =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                'Erro ao carregar os orientadores.';


            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: message,
                life: 5000
            });

        } finally {

            setLoadingOrientadores(false);

        }
    };


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        loadOrientadores();

    }, []);


    // =====================================================
    // ORIENTADOR OPTIONS
    // =====================================================

    // const orientadorOptions: OrientadorOption[] =
    //     orientadores.map((user) => ({

    //         label: user.name,

    //         value: user.id

    //     }));


    // =====================================================
    // FILE SELECT
    // =====================================================

    const handleFileSelect = (event: any) => {

        const selectedFile =
            event.files?.[0];


        if (!selectedFile) {
            return;
        }


        // Limite de 10 MB

        if (
            selectedFile.size >
            10 * 1024 * 1024
        ) {

            toast.current?.show({
                severity: 'error',
                summary: 'Ficheiro demasiado grande',
                detail:
                    'O documento não pode ultrapassar 10 MB.',
                life: 4000
            });

            return;
        }


        setFile(selectedFile);

    };


    // =====================================================
    // REMOVE FILE
    // =====================================================

    const handleRemoveFile = () => {

        setFile(null);

    };


    // =====================================================
    // VALIDATE FORM
    // =====================================================

    const validateForm = () => {

        if (!title.trim()) {

            toast.current?.show({
                severity: 'warn',
                summary: 'Campo obrigatório',
                detail:
                    'Informe o título do pré-projecto.',
                life: 3000
            });

            return false;
        }


        if (!area) {

            toast.current?.show({
                severity: 'warn',
                summary: 'Campo obrigatório',
                detail:
                    'Seleccione a área temática.',
                life: 3000
            });

            return false;
        }


        if (!orientador) {

            toast.current?.show({
                severity: 'warn',
                summary: 'Campo obrigatório',
                detail:
                    'Seleccione o orientador proposto.',
                life: 3000
            });

            return false;
        }


        if (!summary.trim()) {

            toast.current?.show({
                severity: 'warn',
                summary: 'Campo obrigatório',
                detail:
                    'Introduza o resumo do pré-projecto.',
                life: 3000
            });

            return false;
        }


        if (!file) {

            toast.current?.show({
                severity: 'warn',
                summary: 'Documento obrigatório',
                detail:
                    'Seleccione o ficheiro do pré-projecto.',
                life: 3000
            });

            return false;
        }


        return true;
    };


    // =====================================================
    // SUBMIT
    // =====================================================

    const handleSubmit = async () => {

        if (!validateForm()) {
            return;
        }


        if (!file || !orientador || !area) {
            return;
        }


        try {

            setSubmitting(true);


            const response =
                await submitPreProject({

                    title: title.trim(),

                    thematic_area: area,

                    proposed_advisor_id:
                        orientador,

                    abstract:
                        summary.trim(),

                    document:
                        file
                });


            toast.current?.show({
                severity: 'success',
                summary: 'Submissão realizada',
                detail:
                    response?.message ||
                    'Pré-projecto submetido com sucesso.',
                life: 5000
            });


            // =====================================================
            // LIMPAR FORMULÁRIO
            // =====================================================

            setTitle('');

            setArea(null);

            setOrientador(null);

            setSummary('');

            setFile(null);


        } catch (error: any) {

            console.error(
                'Erro ao submeter pré-projecto:',
                error
            );


            const message =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                'Erro ao submeter o pré-projecto.';


            toast.current?.show({
                severity: 'error',
                summary: 'Erro na submissão',
                detail: message,
                life: 5000
            });

        } finally {

            setSubmitting(false);

        }
    };


    // =====================================================
    // SAVE DRAFT
    // =====================================================

    const handleSaveDraft = () => {

        toast.current?.show({
            severity: 'info',
            summary: 'Rascunho',
            detail:
                'A funcionalidade de guardar rascunho ainda não está disponível na API.',
            life: 4000
        });

    };


    // =====================================================
    // FILE ICON
    // =====================================================

    const getFileIcon = () => {

        if (!file) {
            return 'pi pi-file';
        }


        const type =
            file.type.toLowerCase();


        if (
            type.includes('pdf')
        ) {
            return 'pi pi-file-pdf';
        }


        if (
            type.includes('word') ||
            file.name.toLowerCase().endsWith('.doc') ||
            file.name.toLowerCase().endsWith('.docx')
        ) {
            return 'pi pi-file-word';
        }


        return 'pi pi-file';

    };


    // =====================================================
    // RETURN
    // =====================================================

    return (

        <div className="grid">

            <Toast ref={toast} />


            {/* =====================================================
            HEADER
        ===================================================== */}

            <div className="col-12">

                <div
                    className="
                    flex
                    flex-column
                    md:flex-row
                    md:align-items-center
                    md:justify-content-between
                    gap-3
                "
                >

                    <div>

                        <h3
                            className="
                            text-900
                            font-semibold
                            m-0
                        "
                        >
                            Submissão de Pré-Projecto
                        </h3>


                        <p
                            className="
                            text-600
                            mt-2
                            mb-0
                        "
                        >
                            Preencha os dados e submeta o seu
                            Trabalho de Culminação de Curso
                            para avaliação.
                        </p>

                    </div>


                    <Tag
                        value="Novo"
                        severity="info"
                        className="align-self-start"
                    />

                </div>

            </div>


            {/* =====================================================
            PROJECT INFORMATION
        ===================================================== */}

            <div className="col-12">

                <Card>

                    <div
                        className="
                        flex
                        align-items-center
                        gap-2
                        mb-4
                    "
                    >

                        <i
                            className="
                            pi
                            pi-file-edit
                            text-primary
                            text-xl
                        "
                        />


                        <div>

                            <h5
                                className="
                                m-0
                                text-900
                            "
                            >
                                Dados do Pré-Projecto
                            </h5>


                            <small className="text-600">

                                Informe os dados principais
                                do seu trabalho.

                            </small>

                        </div>

                    </div>


                    <Divider />


                    <div className="grid">


                        {/* =====================================================
                        TITLE
                    ===================================================== */}

                        <div className="col-12">

                            <label
                                htmlFor="title"
                                className="
                                block
                                text-900
                                font-medium
                                mb-2
                            "
                            >
                                Título do Pré-Projecto

                                <span
                                    className="
                                    text-red-500
                                    ml-1
                                "
                                >
                                    *
                                </span>

                            </label>


                            <InputText
                                id="title"
                                value={title}
                                onChange={(e) =>
                                    setTitle(
                                        e.target.value
                                    )
                                }
                                placeholder="
                                Introduza o título do seu pré-projecto
                            "
                                className="w-full"
                                disabled={submitting}
                            />


                            <small className="text-500">

                                Utilize um título claro
                                e objectivo.

                            </small>

                        </div>


                        {/* =====================================================
                        AREA
                    ===================================================== */}

                        <div className="col-12 md:col-6">

                            <label
                                htmlFor="area"
                                className="
                                block
                                text-900
                                font-medium
                                mb-2
                            "
                            >

                                Área Temática

                                <span
                                    className="
                                    text-red-500
                                    ml-1
                                "
                                >
                                    *
                                </span>

                            </label>


                            <Dropdown
                                id="area"
                                value={area}
                                options={areas}
                                onChange={(e) =>
                                    setArea(
                                        e.value
                                    )
                                }
                                placeholder="
                                Seleccione a área temática
                            "
                                className="w-full"
                                filter
                                showClear
                                disabled={submitting}
                            />

                        </div>


                        {/* =====================================================
                        ORIENTADOR
                    ===================================================== */}

                        <div className="col-12 md:col-6">

                            <label
                                htmlFor="orientador"
                                className="
                                block
                                text-900
                                font-medium
                                mb-2
                            "
                            >

                                Orientador Proposto

                                <span
                                    className="
                                    text-red-500
                                    ml-1
                                "
                                >
                                    *
                                </span>

                            </label>


                            <Dropdown
    id="orientador"
    value={orientador}
    options={orientadores}
    onChange={(e) => setOrientador(e.value)}
    placeholder={
        loadingOrientadores
            ? 'A carregar orientadores...'
            : 'Seleccione o orientador'
    }
    className="w-full"
    filter
    showClear
    disabled={loadingOrientadores || submitting}
    optionLabel="name"
    optionValue="id"
    emptyMessage="Nenhum orientador encontrado."
    emptyFilterMessage="Nenhum orientador encontrado."
/>


                            <small className="text-500">

                                Apenas utilizadores com a função
                                ORIENTADOR são apresentados.

                            </small>

                        </div>


                        {/* =====================================================
                        ABSTRACT
                    ===================================================== */}

                        <div className="col-12">

                            <label
                                htmlFor="summary"
                                className="
                                block
                                text-900
                                font-medium
                                mb-2
                            "
                            >

                                Resumo

                                <span
                                    className="
                                    text-red-500
                                    ml-1
                                "
                                >
                                    *
                                </span>

                            </label>


                            <InputTextarea
                                id="summary"
                                value={summary}
                                onChange={(e) =>
                                    setSummary(
                                        e.target.value
                                    )
                                }
                                rows={7}
                                autoResize
                                placeholder="
                                Apresente de forma resumida o problema,
                                objectivos e proposta de solução do projecto.
                            "
                                className="w-full"
                                disabled={submitting}
                            />


                            <div
                                className="
                                flex
                                justify-content-between
                                mt-2
                            "
                            >

                                <small className="text-500">

                                    Apresente uma descrição
                                    clara do projecto.

                                </small>


                                <small className="text-500">

                                    {summary.length}
                                    {' '}
                                    caracteres

                                </small>

                            </div>

                        </div>

                    </div>

                </Card>

            </div>


            {/* =====================================================
            DOCUMENT UPLOAD
        ===================================================== */}

            <div className="col-12 lg:col-8">

                <Card>

                    <div
                        className="
                        flex
                        align-items-center
                        gap-2
                        mb-4
                    "
                    >

                        <i
                            className="
                            pi
                            pi-upload
                            text-primary
                            text-xl
                        "
                        />


                        <div>

                            <h5
                                className="
                                m-0
                                text-900
                            "
                            >
                                Documento do Pré-Projecto
                            </h5>


                            <small className="text-600">

                                Carregue o documento que será
                                enviado para avaliação.

                            </small>

                        </div>

                    </div>


                    <Divider />


                    <FileUpload
    name="document"
    accept=".pdf,.doc,.docx"
    maxFileSize={10000000}
    customUpload
    auto={false}
    chooseLabel="Seleccionar documento"
    disabled={submitting}
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


                    {/* =====================================================
                    SELECTED FILE
                ===================================================== */}

                    {file && (

                        <div className="mt-4">

                            <div
                                className="
                                flex
                                align-items-center
                                justify-content-between
                                p-3
                                surface-100
                                border-round
                            "
                            >

                                <div
                                    className="
                                    flex
                                    align-items-center
                                    gap-3
                                "
                                >

                                    <div
                                        className="
                                        flex
                                        align-items-center
                                        justify-content-center
                                        bg-red-100
                                        border-round
                                    "
                                        style={{
                                            width: '3rem',
                                            height: '3rem'
                                        }}
                                    >

                                        <i
                                            className={`
                                            ${getFileIcon()}
                                            text-red-500
                                            text-xl
                                        `}
                                        />

                                    </div>


                                    <div>

                                        <div
                                            className="
                                            text-900
                                            font-medium
                                        "
                                        >
                                            {file.name}
                                        </div>


                                        <small className="text-500">

                                            {(
                                                file.size /
                                                1024 /
                                                1024
                                            ).toFixed(2)}

                                            {' MB'}

                                        </small>

                                    </div>

                                </div>


                                <Button
                                    icon="pi pi-times"
                                    severity="danger"
                                    text
                                    rounded
                                    disabled={submitting}
                                    onClick={
                                        handleRemoveFile
                                    }
                                    tooltip="
                                    Remover documento
                                "
                                />

                            </div>

                        </div>

                    )}

                </Card>

            </div>


            {/* =====================================================
            STATUS CARD
        ===================================================== */}

            <div className="col-12 lg:col-4">

                <Card>

                    <h5
                        className="
                        text-900
                        mt-0
                    "
                    >
                        Estado da Submissão
                    </h5>


                    <Divider />


                    <div
                        className="
                        flex
                        align-items-center
                        gap-3
                        mb-4
                    "
                    >

                        <div
                            className="
                            flex
                            align-items-center
                            justify-content-center
                            bg-blue-100
                            border-circle
                        "
                            style={{
                                width: '2.5rem',
                                height: '2.5rem'
                            }}
                        >

                            <i
                                className="
                                pi
                                pi-file
                                text-blue-500
                            "
                            />

                        </div>


                        <div>

                            <span
                                className="
                                block
                                text-900
                                font-medium
                            "
                            >
                                Pré-projecto
                            </span>


                            <Tag
                                value="Em preenchimento"
                                severity="warning"
                            />

                        </div>

                    </div>


                    <div
                        className="
                        text-600
                        line-height-3
                    "
                    >

                        Depois da submissão, o pré-projecto
                        será encaminhado para o Coordenador
                        de TCC, que poderá atribuir os
                        avaliadores responsáveis pela análise.

                    </div>

                </Card>

            </div>


            {/* =====================================================
            BUTTONS
        ===================================================== */}

            <div className="col-12">

                <div
                    className="
                    flex
                    justify-content-end
                    gap-2
                "
                >

                    <Button
                        label="Guardar rascunho"
                        icon="pi pi-save"
                        severity="secondary"
                        outlined
                        disabled={submitting}
                        onClick={
                            handleSaveDraft
                        }
                    />


                    <Button
                        label={
                            submitting
                                ? 'A submeter...'
                                : 'Submeter pré-projecto'
                        }
                        icon={
                            submitting
                                ? 'pi pi-spin pi-spinner'
                                : 'pi pi-send'
                        }
                        loading={submitting}
                        disabled={submitting}
                        onClick={
                            handleSubmit
                        }
                    />

                </div>

            </div>

        </div>
    );


};

export default SubmitPreProject;
