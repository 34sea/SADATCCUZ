'use client';

import React, {
    useEffect,
    useRef,
    useState
} from 'react';

import { useRouter } from 'next/navigation';

import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';

import {
    getMyAssignedPreProjects,
    PreProject,
    PreProjectEvaluator
} from '@/app/api/pre-projects/preProjectService';


// =====================================================
// COMPONENT
// =====================================================

const EvaluatorPreProjects = () => {

    const router = useRouter();

    const toast = useRef<Toast>(null);

    const [projects, setProjects] =
        useState<PreProject[]>([]);

    const [loading, setLoading] =
        useState(false);

    const [search, setSearch] =
        useState('');


    // =====================================================
    // LOAD
    // =====================================================

    const loadProjects = async () => {

        try {

            setLoading(true);

            const data =
                await getMyAssignedPreProjects();

            setProjects(data);

        } catch (error: any) {

            console.error(error);

            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail:
                    error?.response?.data?.message ||
                    error?.message ||
                    'Não foi possível carregar os pré-projectos.',
                life: 5000
            });

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        loadProjects();

    }, []);


    // =====================================================
    // GET EVALUATOR ASSIGNMENT
    // =====================================================

    // const getMyEvaluation = (
    //     project: PreProject
    // ): PreProjectEvaluator | undefined => {

    //     const userData =
    //         localStorage.getItem(
    //             'user'
    //         );

    //     if (!userData) {
    //         return undefined;
    //     }

    //     try {

    //         const parsed =
    //             JSON.parse(userData);

    //         const userId =
    //             parsed?.data?.id ||
    //             parsed?.id ||
    //             parsed?.user?.id;

    //         return project.evaluators?.find(
    //             evaluator =>
    //                 evaluator.evaluator_id ===
    //                 userId
    //         );

    //     } catch {

    //         return undefined;

    //     }
    // };

    const getMyEvaluation = (
    project: PreProject
): PreProjectEvaluator | undefined => {

    return project.evaluators?.[0];
};


    // =====================================================
    // SEARCH
    // =====================================================

    const filteredProjects =
        projects.filter(project => {

            const value =
                search
                    .toLowerCase()
                    .trim();

            if (!value) {
                return true;
            }

            return (
                project.title
                    ?.toLowerCase()
                    .includes(value) ||

                project.student_name
                    ?.toLowerCase()
                    .includes(value) ||

                project.thematic_area
                    ?.toLowerCase()
                    .includes(value)
            );
        });


    // =====================================================
    // STATUS
    // =====================================================

    const statusTemplate = (
        row: PreProject
    ) => {

        const evaluation =
            getMyEvaluation(row);

        if (
            evaluation?.opinion
        ) {

            return (
                <Tag
                    value="Avaliado"
                    severity="success"
                />
            );
        }

        return (
            <Tag
                value="Pendente"
                severity="warning"
            />
        );
    };


    // =====================================================
    // PROJECT STATUS
    // =====================================================

    const projectStatusTemplate = (
        row: PreProject
    ) => {

        const config: Record<
            string,
            {
                label: string;
                severity:
                    | 'success'
                    | 'info'
                    | 'warning'
                    | 'danger'
                    | null;
            }
        > = {

            SUBMETIDO: {
                label: 'Submetido',
                severity: 'info'
            },

            EM_AVALIACAO: {
                label: 'Em avaliação',
                severity: 'warning'
            },

            APROVADO: {
                label: 'Aprovado',
                severity: 'success'
            },

            REPROVADO: {
                label: 'Reprovado',
                severity: 'danger'
            },

            EM_REVISAO: {
                label: 'Em revisão',
                severity: 'warning'
            },

            RESUBMETIDO: {
                label: 'Resubmetido',
                severity: 'info'
            }
        };

        const item =
            config[row.status];

        return (
            <Tag
                value={
                    item?.label ||
                    row.status
                }
                severity={
                    item?.severity ||
                    null
                }
            />
        );
    };


    // =====================================================
    // ACTION
    // =====================================================

    const actionTemplate = (
        row: PreProject
    ) => {

        const evaluation =
            getMyEvaluation(row);

        const evaluated =
            !!evaluation?.opinion;

        return (
            <Button
                label={
                    evaluated
                        ? 'Ver avaliação'
                        : 'Avaliar'
                }
                icon={
                    evaluated
                        ? 'pi pi-eye'
                        : 'pi pi-pencil'
                }
                severity={
                    evaluated
                        ? 'secondary'
                        : undefined
                }
                outlined
                onClick={() =>
                    router.push(
                        `/pages/preProject/projectEvaluation/${row.id}`
                    )
                }
            />
        );
    };


    // =====================================================
    // DATE
    // =====================================================

    const dateTemplate = (
        row: PreProject
    ) => {

        if (!row.updated_at) {
            return '-';
        }

        return new Date(
            row.updated_at
        ).toLocaleDateString(
            'pt-PT'
        );
    };


    // =====================================================
    // STATISTICS
    // =====================================================

    const total =
        projects.length;

    const evaluated =
        projects.filter(
            project =>
                !!getMyEvaluation(project)?.opinion
        ).length;

    const pending =
        total - evaluated;


    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="grid">

            <Toast ref={toast} />


            {/* HEADER */}

            <div className="col-12">

                <div className="
                    flex
                    flex-column
                    md:flex-row
                    md:justify-content-between
                    md:align-items-center
                    gap-3
                ">

                    <div>

                        <h3 className="
                            text-900
                            font-semibold
                            m-0
                        ">
                            Meus Pré-Projectos
                        </h3>

                        <p className="
                            text-600
                            mt-2
                            mb-0
                        ">
                            Pré-projectos atribuídos
                            para sua avaliação.
                        </p>

                    </div>


                    <Button
                        label="Actualizar"
                        icon="pi pi-refresh"
                        outlined
                        loading={loading}
                        onClick={loadProjects}
                    />

                </div>

            </div>


            {/* STATISTICS */}

            <div className="col-12">

                <div className="grid">

                    <div className="col-12 md:col-4">

                        <Card>

                            <div className="
                                flex
                                justify-content-between
                                align-items-center
                            ">

                                <div>

                                    <span className="
                                        block
                                        text-600
                                        mb-2
                                    ">
                                        Trabalhos atribuídos
                                    </span>

                                    <span className="
                                        text-900
                                        text-3xl
                                        font-semibold
                                    ">
                                        {total}
                                    </span>

                                </div>

                                <i className="
                                    pi
                                    pi-folder
                                    text-primary
                                    text-2xl
                                " />

                            </div>

                        </Card>

                    </div>


                    <div className="col-12 md:col-4">

                        <Card>

                            <div className="
                                flex
                                justify-content-between
                                align-items-center
                            ">

                                <div>

                                    <span className="
                                        block
                                        text-600
                                        mb-2
                                    ">
                                        Pendentes
                                    </span>

                                    <span className="
                                        text-900
                                        text-3xl
                                        font-semibold
                                    ">
                                        {pending}
                                    </span>

                                </div>

                                <i className="
                                    pi
                                    pi-clock
                                    text-orange-500
                                    text-2xl
                                " />

                            </div>

                        </Card>

                    </div>


                    <div className="col-12 md:col-4">

                        <Card>

                            <div className="
                                flex
                                justify-content-between
                                align-items-center
                            ">

                                <div>

                                    <span className="
                                        block
                                        text-600
                                        mb-2
                                    ">
                                        Avaliados
                                    </span>

                                    <span className="
                                        text-900
                                        text-3xl
                                        font-semibold
                                    ">
                                        {evaluated}
                                    </span>

                                </div>

                                <i className="
                                    pi
                                    pi-check-circle
                                    text-green-500
                                    text-2xl
                                " />

                            </div>

                        </Card>

                    </div>

                </div>

            </div>


            {/* TABLE */}

            <div className="col-12">

                <Card>

                    <div className="
                        flex
                        gap-3
                        mb-4
                    ">

                        <span className="
                            p-input-icon-left
                            flex-1
                        ">

                            <i className="
                                pi
                                pi-search
                            " />

                            <InputText
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                placeholder="
                                    Pesquisar por título,
                                    estudante ou área...
                                "
                                className="w-full"
                            />

                        </span>

                    </div>


                    <DataTable
                        value={filteredProjects}
                        loading={loading}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[
                            10,
                            25,
                            50
                        ]}
                        responsiveLayout="scroll"
                        stripedRows
                        emptyMessage="
                            Nenhum pré-projecto atribuído.
                        "
                    >

                        <Column
                            field="id"
                            header="#"
                            sortable
                        />

                        <Column
                            field="title"
                            header="Pré-Projecto"
                            sortable
                            style={{
                                minWidth: '22rem'
                            }}
                        />

                        <Column
                            field="student_name"
                            header="Estudante"
                            sortable
                        />

                        <Column
                            field="thematic_area"
                            header="Área temática"
                            sortable
                        />

                        <Column
                            header="Estado"
                            body={
                                projectStatusTemplate
                            }
                        />

                        <Column
                            header="Minha avaliação"
                            body={
                                statusTemplate
                            }
                        />

                        <Column
                            header="Actualizado"
                            body={
                                dateTemplate
                            }
                        />

                        <Column
                            header="Acção"
                            body={
                                actionTemplate
                            }
                        />

                    </DataTable>

                </Card>

            </div>

        </div>
    );
};

export default EvaluatorPreProjects;