'use client';

import React, {
    useEffect,
    useRef,
    useState
} from 'react';

import { useParams, useRouter } from 'next/navigation';

import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Divider } from 'primereact/divider';

import {
    getPreProjectById,
    submitReview,
    PreProject,
    PreProjectEvaluator
} from '@/app/api/pre-projects/preProjectService';

import {
    getUserFromStorage
} from '@/app/api/auth/authService';


// =====================================================
// COMPONENT
// =====================================================

const EvaluatePreProject = () => {

    const router = useRouter();

    const params =
        useParams();

    const toast =
        useRef<Toast>(null);

    const id =
        Number(params.id);


    const [project, setProject] =
        useState<PreProject | null>(null);

    const [evaluation, setEvaluation] =
        useState<PreProjectEvaluator | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [submitting, setSubmitting] =
        useState(false);


    // =====================================================
    // FORM
    // =====================================================

    const [score, setScore] =
        useState<number | null>(null);

    const [opinion, setOpinion] =
        useState<
            | 'FAVORAVEL'
            | 'FAVORAVEL_COM_RECOMENDACOES'
            | 'DESFAVORAVEL'
            | null
        >(null);

    const [observations, setObservations] =
        useState('');


    // =====================================================
    // OPINIONS
    // =====================================================

    const opinionOptions = [

        {
            label: 'Favorável',
            value: 'FAVORAVEL'
        },

        {
            label: 'Favorável com recomendações',
            value: 'FAVORAVEL_COM_RECOMENDACOES'
        },

        {
            label: 'Desfavorável',
            value: 'DESFAVORAVEL'
        }

    ];


    // =====================================================
    // LOAD
    // =====================================================

    useEffect(() => {

        loadProject();

    }, [id]);


    const loadProject = async () => {

    try {

        setLoading(true);

        const data =
            await getPreProjectById(id);

        setProject(data);


        // =====================================================
        // UTILIZADOR LOGADO
        // =====================================================

        const user =
            getUserFromStorage();

        console.log('USER LOGADO:', user);

        const userId =
            user?.data?.user?.id ??
            user?.data?.id ??
            user?.user?.id ??
            user?.id;

        console.log('USER ID:', userId);


        if (!userId) {

            toast.current?.show({
                severity: 'error',
                summary: 'Erro de autenticação',
                detail:
                    'Não foi possível identificar o utilizador autenticado.',
                life: 5000
            });

            router.push(
                '/pages/preProject/evaluator'
            );

            return;
        }


        // =====================================================
        // PROCURAR A ATRIBUIÇÃO DO AVALIADOR
        // =====================================================

        const myAssignment =
            data.evaluators?.find(
                evaluator =>
                    Number(evaluator.evaluator_id) ===
                    Number(userId)
            );


        console.log(
            'MINHA ATRIBUIÇÃO:',
            myAssignment
        );


        // =====================================================
        // NÃO FOI ATRIBUÍDO
        // =====================================================

        if (!myAssignment) {

            toast.current?.show({
                severity: 'error',
                summary: 'Acesso negado',
                detail:
                    'Este pré-projecto não foi atribuído a si.',
                life: 5000
            });

            router.push(
                '/pages/preProject/evaluator'
            );

            return;
        }


        // =====================================================
        // GUARDAR ATRIBUIÇÃO
        // =====================================================

        setEvaluation(
            myAssignment
        );


        // =====================================================
        // CARREGAR AVALIAÇÃO EXISTENTE
        // =====================================================

        if (myAssignment.opinion) {

            setOpinion(
                myAssignment.opinion as
                    | 'FAVORAVEL'
                    | 'FAVORAVEL_COM_RECOMENDACOES'
                    | 'DESFAVORAVEL'
            );

            setScore(
                myAssignment.score ?? null
            );

            setObservations(
                myAssignment.observations ?? ''
            );

        } else {

            // Limpar formulário caso ainda não tenha avaliação

            setOpinion(null);
            setScore(null);
            setObservations('');

        }

    } catch (error: any) {

        console.error(error);

        toast.current?.show({
            severity: 'error',
            summary: 'Erro',
            detail:
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                'Não foi possível carregar o pré-projecto.',
            life: 5000
        });

    } finally {

        setLoading(false);

    }
};


    // =====================================================
    // SUBMIT
    // =====================================================

    const handleSubmit = async () => {

        if (!evaluation) {
            return;
        }

        if (!opinion) {

            toast.current?.show({
                severity: 'warn',
                summary: 'Parecer',
                detail:
                    'Seleccione o parecer.',
                life: 4000
            });

            return;
        }


        if (
            score === null ||
            score < 0 ||
            score > 20
        ) {

            toast.current?.show({
                severity: 'warn',
                summary: 'Nota',
                detail:
                    'Informe uma nota entre 0 e 20.',
                life: 4000
            });

            return;
        }


        try {

            setSubmitting(true);


            await submitReview({

                evaluator_assignment_id:
                    evaluation.evaluator_assignment_id,

                score,

                opinion,

                observations:
                    observations.trim() ||
                    null

            });


            toast.current?.show({
                severity: 'success',
                summary: 'Avaliação submetida',
                detail:
                    'O seu parecer foi registado com sucesso.',
                life: 4000
            });


            // voltar à lista depois de pequeno delay

            setTimeout(() => {

                router.push(
                    '/pages/preProject/evaluator'
                );

            }, 800);


        } catch (error: any) {

            console.error(error);

            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail:
                    error?.response?.data?.message ||
                    error?.response?.data?.error ||
                    error?.message ||
                    'Não foi possível submeter a avaliação.',
                life: 5000
            });

        } finally {

            setSubmitting(false);

        }

    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="
                flex
                justify-content-center
                align-items-center
                py-8
            ">

                <ProgressSpinner />

            </div>

        );

    }


    if (!project) {

        return (

            <div className="p-4">

                <Button
                    label="Voltar"
                    icon="pi pi-arrow-left"
                    outlined
                    onClick={() =>
                        router.push(
                            '/pages/preProject/evaluator'
                        )
                    }
                />

                <div className="mt-4">

                    <Card>

                        Pré-projecto não encontrado.

                    </Card>

                </div>

            </div>

        );

    }


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="grid">

            <Toast ref={toast} />


            {/* HEADER */}

            <div className="col-12">

                <Button
                    label="Voltar aos pré-projectos"
                    icon="pi pi-arrow-left"
                    text
                    onClick={() =>
                        router.push(
                            '/pages/preProject/evaluator'
                        )
                    }
                />

            </div>


            {/* PROJECT INFORMATION */}

            <div className="col-12">

                <Card>

                    <div className="
                        flex
                        flex-column
                        md:flex-row
                        md:justify-content-between
                        gap-3
                    ">

                        <div>

                            <h2 className="
                                text-900
                                mt-0
                                mb-2
                            ">

                                {project.title}

                            </h2>


                            <div className="
                                flex
                                flex-wrap
                                gap-2
                            ">

                                <Tag
                                    value={
                                        project.thematic_area
                                    }
                                    severity="info"
                                />

                                <Tag
                                    value={
                                        `Versão ${project.version}`
                                    }
                                />

                            </div>

                        </div>


                        <div>

                            <Tag
                                value={
                                    evaluation?.opinion
                                        ? 'Avaliação já submetida'
                                        : 'Avaliação pendente'
                                }
                                severity={
                                    evaluation?.opinion
                                        ? 'success'
                                        : 'warning'
                                }
                            />

                        </div>

                    </div>

                </Card>

            </div>


            {/* STUDENT */}

            <div className="
                col-12
                md:col-4
            ">

                <Card>

                    <h5 className="mt-0">
                        Estudante
                    </h5>

                    <div className="
                        text-900
                        font-semibold
                    ">

                        {project.student_name}

                    </div>

                    <small className="text-600">

                        {project.student_email}

                    </small>

                </Card>

            </div>


            {/* ADVISOR */}

            <div className="
                col-12
                md:col-4
            ">

                <Card>

                    <h5 className="mt-0">
                        Orientador proposto
                    </h5>

                    <div className="
                        text-900
                        font-semibold
                    ">

                        {
                            project.proposed_advisor_name ||
                            'Não atribuído'
                        }

                    </div>

                </Card>

            </div>


            {/* DOCUMENT */}

            <div className="
                col-12
                md:col-4
            ">

                <Card>

                    <h5 className="mt-0">
                        Documento
                    </h5>

                    <Button
                        label="Abrir pré-projecto"
                        icon="pi pi-file-pdf"
                        outlined
                        className="w-full"
                        onClick={() =>
                            window.open(
                                project.document_url,
                                '_blank'
                            )
                        }
                    />

                </Card>

            </div>


            {/* ABSTRACT */}

            <div className="col-12">

                <Card>

                    <h4 className="mt-0">
                        Resumo do pré-projecto
                    </h4>

                    <Divider />

                    <p className="
                        text-700
                        line-height-3
                        white-space-pre-line
                    ">

                        {project.abstract}

                    </p>

                </Card>

            </div>


            {/* EVALUATION */}

            <div className="col-12">

                <Card>

                    <h3 className="mt-0">

                        Avaliação

                    </h3>

                    <p className="text-600">

                        Analise o documento e registe
                        o seu parecer sobre o pré-projecto.

                    </p>


                    <Divider />


                    <div className="grid">


                        {/* SCORE */}

                        <div className="
                            col-12
                            md:col-4
                        ">

                            <label className="
                                block
                                text-900
                                font-medium
                                mb-2
                            ">

                                Nota

                            </label>

                            <InputNumber
                                value={score}
                                onValueChange={(e) =>
                                    setScore(
                                        e.value ?? null
                                    )
                                }
                                min={0}
                                max={20}
                                minFractionDigits={0}
                                maxFractionDigits={2}
                                className="w-full"
                                inputClassName="w-full"
                                disabled={submitting}
                                placeholder="0 - 20"
                            />

                        </div>


                        {/* OPINION */}

                        <div className="
                            col-12
                            md:col-8
                        ">

                            <label className="
                                block
                                text-900
                                font-medium
                                mb-2
                            ">

                                Parecer

                            </label>

                            <Dropdown
                                value={opinion}
                                options={
                                    opinionOptions
                                }
                                onChange={(e) =>
                                    setOpinion(
                                        e.value
                                    )
                                }
                                placeholder="
                                    Seleccione o parecer
                                "
                                className="w-full"
                                disabled={
                                    submitting
                                }
                            />

                        </div>


                        {/* OBSERVATIONS */}

                        <div className="col-12">

                            <label className="
                                block
                                text-900
                                font-medium
                                mb-2
                            ">

                                Observações / Recomendações

                            </label>

                            <textarea
                                value={
                                    observations
                                }
                                onChange={(e) =>
                                    setObservations(
                                        e.target.value
                                    )
                                }
                                rows={7}
                                className="
                                    p-inputtextarea
                                    p-inputtext
                                    w-full
                                "
                                placeholder="
                                    Escreva aqui as observações,
                                    recomendações ou justificativa
                                    do seu parecer...
                                "
                                disabled={
                                    submitting
                                }
                            />

                        </div>


                        {/* ACTIONS */}

                        <div className="
                            col-12
                            flex
                            justify-content-end
                            gap-2
                        ">

                            <Button
                                label="Cancelar"
                                icon="pi pi-times"
                                outlined
                                disabled={
                                    submitting
                                }
                                onClick={() =>
                                    router.push(
                                        '/pages/preProject/evaluator'
                                    )
                                }
                            />

                            <Button
                                label={
                                    evaluation?.opinion
                                        ? 'Actualizar avaliação'
                                        : 'Submeter avaliação'
                                }
                                icon="pi pi-check"
                                loading={
                                    submitting
                                }
                                onClick={
                                    handleSubmit
                                }
                            />

                        </div>

                    </div>

                </Card>

            </div>

        </div>
    );
};

export default EvaluatePreProject;