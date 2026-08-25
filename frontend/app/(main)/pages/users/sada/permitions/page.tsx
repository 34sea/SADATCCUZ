'use client';

import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from 'react';

import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { Toast } from 'primereact/toast';
import {
    ConfirmDialog,
    confirmDialog
} from 'primereact/confirmdialog';

import {
    getPermissions,
    createPermission,
    updatePermission,
    deletePermission,
    Permission
} from '@/app/api/users/userService';


// =====================================================
// COMPONENT
// =====================================================

const UsersPermitions = () => {

    const toast = useRef<Toast>(null);


    // =====================================================
    // DATA
    // =====================================================

    const [permissions, setPermissions] =
        useState<Permission[]>([]);


    // =====================================================
    // LOADING
    // =====================================================

    const [loading, setLoading] =
        useState(false);

    const [saving, setSaving] =
        useState(false);


    // =====================================================
    // ERROR
    // =====================================================

    const [error, setError] =
        useState<string | null>(null);


    // =====================================================
    // FILTER
    // =====================================================

    const [search, setSearch] =
        useState('');


    // =====================================================
    // DIALOG
    // =====================================================

    const [dialogVisible, setDialogVisible] =
        useState(false);

    const [editingPermission, setEditingPermission] =
        useState<Permission | null>(null);


    // =====================================================
    // FORM
    // =====================================================

    const [name, setName] =
        useState('');

    const [description, setDescription] =
        useState('');


    // =====================================================
    // LOAD PERMISSIONS
    // =====================================================

    const loadPermissions = useCallback(
        async () => {

            setLoading(true);

            setError(null);

            try {

                const data =
                    await getPermissions();

                setPermissions(data);

            } catch (err: any) {

                const message =
                    err?.response?.data?.message ||
                    err?.message ||
                    'Erro ao carregar as permissões.';

                setError(message);

                toast.current?.show({
                    severity: 'error',
                    summary: 'Erro',
                    detail: message,
                    life: 4000
                });

            } finally {

                setLoading(false);
            }

        },
        []
    );


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        loadPermissions();

    }, [
        loadPermissions
    ]);


    // =====================================================
    // FILTERED PERMISSIONS
    // =====================================================

    const filteredPermissions =
        useMemo(() => {

            const value =
                search
                    .toLowerCase()
                    .trim();


            if (!value) {
                return permissions;
            }


            return permissions.filter(
                permission => {

                    const nameMatch =
                        permission.name
                            ?.toLowerCase()
                            .includes(value);


                    const descriptionMatch =
                        permission.description
                            ?.toLowerCase()
                            .includes(value);


                    return (
                        nameMatch ||
                        descriptionMatch
                    );
                }
            );

        }, [
            permissions,
            search
        ]);


    // =====================================================
    // STATISTICS
    // =====================================================

    const totalPermissions =
        permissions.length;


    const filteredCount =
        filteredPermissions.length;


    // =====================================================
    // OPEN CREATE
    // =====================================================

    const openCreateDialog = () => {

        setEditingPermission(null);

        setName('');

        setDescription('');

        setDialogVisible(true);
    };


    // =====================================================
    // OPEN EDIT
    // =====================================================

    const openEditDialog = (
        permission: Permission
    ) => {

        setEditingPermission(
            permission
        );

        setName(
            permission.name || ''
        );

        setDescription(
            permission.description || ''
        );

        setDialogVisible(true);
    };


    // =====================================================
    // CLOSE DIALOG
    // =====================================================

    const closeDialog = () => {

        if (saving) {
            return;
        }

        setDialogVisible(false);

        setEditingPermission(null);

        setName('');

        setDescription('');
    };


    // =====================================================
    // SAVE
    // =====================================================

    const handleSave = async () => {

        // -------------------------------------------------
        // VALIDATION
        // -------------------------------------------------

        if (!name.trim()) {

            toast.current?.show({
                severity: 'warn',
                summary: 'Atenção',
                detail:
                    'Informe o nome da permissão.',
                life: 3000
            });

            return;
        }


        setSaving(true);


        try {

            // =================================================
            // CREATE
            // =================================================

            if (!editingPermission) {

                await createPermission({

                    name:
                        name.trim(),

                    description:
                        description.trim() ||
                        undefined

                });


                toast.current?.show({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail:
                        'Permissão criada com sucesso.',
                    life: 3000
                });

            }

            // =================================================
            // UPDATE
            // =================================================

            else {

                await updatePermission(
                    editingPermission.id,
                    {
                        name:
                            name.trim(),

                        description:
                            description.trim()
                    }
                );


                toast.current?.show({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail:
                        'Permissão actualizada com sucesso.',
                    life: 3000
                });
            }


            // =================================================
            // RELOAD
            // =================================================

            await loadPermissions();

            closeDialog();

        } catch (err: any) {

            const message =
                err?.response?.data?.message ||
                err?.message ||
                'Não foi possível guardar a permissão.';

            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: message,
                life: 4000
            });

        } finally {

            setSaving(false);
        }
    };


    // =====================================================
    // DELETE
    // =====================================================

    const handleDelete = (
        permission: Permission
    ) => {

        confirmDialog({

            message:
                `Tem certeza que deseja eliminar a permissão "${permission.name}"?`,

            header:
                'Confirmar eliminação',

            icon:
                'pi pi-exclamation-triangle',

            acceptLabel:
                'Sim, eliminar',

            rejectLabel:
                'Cancelar',

            acceptClassName:
                'p-button-danger',

            accept: async () => {

                try {

                    setLoading(true);


                    await deletePermission(
                        permission.id
                    );


                    toast.current?.show({
                        severity: 'success',
                        summary: 'Sucesso',
                        detail:
                            'Permissão eliminada com sucesso.',
                        life: 3000
                    });


                    await loadPermissions();

                } catch (err: any) {

                    const message =
                        err?.response?.data?.message ||
                        err?.message ||
                        'Não foi possível eliminar a permissão.';

                    toast.current?.show({
                        severity: 'error',
                        summary: 'Erro',
                        detail: message,
                        life: 4000
                    });

                } finally {

                    setLoading(false);
                }
            }
        });
    };


    // =====================================================
    // CLEAR FILTER
    // =====================================================

    const clearFilter = () => {

        setSearch('');
    };


    // =====================================================
    // PERMISSION NAME TEMPLATE
    // =====================================================

    const permissionTemplate = (
        permission: Permission
    ) => {

        return (
            <Tag
                value={
                    permission.name
                }
                severity="info"
            />
        );
    };


    // =====================================================
    // DESCRIPTION TEMPLATE
    // =====================================================

    const descriptionTemplate = (
        permission: Permission
    ) => {

        return (
            <span className="text-600">

                {
                    permission.description ||
                    '-'
                }

            </span>
        );
    };


    // =====================================================
    // ACTION TEMPLATE
    // =====================================================

    const actionTemplate = (
        permission: Permission
    ) => {

        return (
            <div className="flex gap-1">

                <Button
                    icon="pi pi-pencil"
                    rounded
                    text
                    severity="info"
                    tooltip="Editar"
                    tooltipOptions={{
                        position: 'top'
                    }}
                    onClick={() =>
                        openEditDialog(
                            permission
                        )
                    }
                />


                <Button
                    icon="pi pi-trash"
                    rounded
                    text
                    severity="danger"
                    tooltip="Eliminar"
                    tooltipOptions={{
                        position: 'top'
                    }}
                    onClick={() =>
                        handleDelete(
                            permission
                        )
                    }
                />

            </div>
        );
    };


    // =====================================================
    // RETURN
    // =====================================================

    return (

        <div className="grid">

            <Toast ref={toast} />

            <ConfirmDialog />


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="col-12">

                <div className="
                    flex
                    flex-column
                    md:flex-row
                    md:align-items-center
                    md:justify-content-between
                    gap-3
                ">

                    <div>

                        <h2 className="
                            text-900
                            font-semibold
                            m-0
                        ">
                            Gestão de Permissões
                        </h2>


                        <p className="
                            text-600
                            mt-2
                            mb-0
                        ">
                            Consulte, crie e administre
                            as permissões do sistema.
                        </p>

                    </div>


                    <Button
                        label="Nova permissão"
                        icon="pi pi-key"
                        onClick={
                            openCreateDialog
                        }
                    />

                </div>

            </div>


            {/* =================================================
                STATISTICS
            ================================================= */}

            <div className="
                col-12
                lg:col-6
                xl:col-4
            ">

                <div className="
                    card
                    mb-0
                    h-full
                ">

                    <div className="
                        flex
                        justify-content-between
                        align-items-start
                    ">

                        <div>

                            <span className="
                                block
                                text-500
                                font-medium
                                mb-2
                            ">
                                Total de permissões
                            </span>


                            <div className="
                                text-900
                                font-medium
                                text-2xl
                            ">
                                {totalPermissions}
                            </div>


                            <span className="
                                text-500
                                text-sm
                            ">
                                Permissões registadas
                            </span>

                        </div>


                        <div className="
                            flex
                            align-items-center
                            justify-content-center
                            bg-blue-100
                            border-round
                        "
                        style={{
                            width: '2.5rem',
                            height: '2.5rem'
                        }}
                        >

                            <i className="
                                pi
                                pi-key
                                text-blue-500
                                text-xl
                            " />

                        </div>

                    </div>

                </div>

            </div>


            <div className="
                col-12
                lg:col-6
                xl:col-4
            ">

                <div className="
                    card
                    mb-0
                    h-full
                ">

                    <div className="
                        flex
                        justify-content-between
                        align-items-start
                    ">

                        <div>

                            <span className="
                                block
                                text-500
                                font-medium
                                mb-2
                            ">
                                Resultados
                            </span>


                            <div className="
                                text-900
                                font-medium
                                text-2xl
                            ">
                                {filteredCount}
                            </div>


                            <span className="
                                text-500
                                text-sm
                            ">
                                Encontradas na pesquisa
                            </span>

                        </div>


                        <div className="
                            flex
                            align-items-center
                            justify-content-center
                            bg-green-100
                            border-round
                        "
                        style={{
                            width: '2.5rem',
                            height: '2.5rem'
                        }}
                        >

                            <i className="
                                pi
                                pi-search
                                text-green-500
                                text-xl
                            " />

                        </div>

                    </div>

                </div>

            </div>


            <div className="
                col-12
                lg:col-12
                xl:col-4
            ">

                <div className="
                    card
                    mb-0
                    h-full
                ">

                    <div className="
                        flex
                        justify-content-between
                        align-items-start
                    ">

                        <div>

                            <span className="
                                block
                                text-500
                                font-medium
                                mb-2
                            ">
                                Estado
                            </span>


                            <div className="
                                text-900
                                font-medium
                                text-2xl
                            ">
                                Activo
                            </div>


                            <span className="
                                text-500
                                text-sm
                            ">
                                Sistema de permissões
                            </span>

                        </div>


                        <div className="
                            flex
                            align-items-center
                            justify-content-center
                            bg-purple-100
                            border-round
                        "
                        style={{
                            width: '2.5rem',
                            height: '2.5rem'
                        }}
                        >

                            <i className="
                                pi
                                pi-shield
                                text-purple-500
                                text-xl
                            " />

                        </div>

                    </div>

                </div>

            </div>


            {/* =================================================
                FILTER
            ================================================= */}

            <div className="col-12">

                <Card>

                    <div className="
                        flex
                        align-items-center
                        justify-content-between
                        mb-4
                    ">

                        <div>

                            <h5 className="
                                m-0
                                text-900
                            ">
                                Pesquisa e filtros
                            </h5>


                            <span className="
                                text-500
                                text-sm
                            ">
                                Pesquise pelas permissões disponíveis
                            </span>

                        </div>


                        <i className="
                            pi
                            pi-filter
                            text-primary
                            text-xl
                        " />

                    </div>


                    <div className="grid">

                        <div className="
                            col-12
                            md:col-10
                        ">

                            <label className="
                                block
                                text-900
                                font-medium
                                mb-2
                            ">
                                Pesquisa
                            </label>


                            <span className="
                                p-input-icon-left
                                w-full
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
                                        Nome ou descrição da permissão
                                    "
                                    className="w-full"
                                />

                            </span>

                        </div>


                        <div className="
                            col-12
                            md:col-2
                            flex
                            align-items-end
                        ">

                            <Button
                                label="Limpar"
                                icon="pi pi-filter-slash"
                                outlined
                                className="w-full"
                                onClick={
                                    clearFilter
                                }
                            />

                        </div>

                    </div>

                </Card>

            </div>


            {/* =================================================
                TABLE
            ================================================= */}

            <div className="col-12">

                <Card>

                    <div className="
                        flex
                        flex-column
                        md:flex-row
                        md:align-items-center
                        md:justify-content-between
                        gap-2
                        mb-4
                    ">

                        <div>

                            <h5 className="
                                m-0
                                text-900
                            ">
                                Permissões do sistema
                            </h5>


                            <span className="
                                text-500
                                text-sm
                            ">
                                {filteredCount}
                                {' '}
                                permissão(ões)
                                encontrada(s)
                            </span>

                        </div>


                        <Button
                            icon="pi pi-refresh"
                            label="Actualizar"
                            outlined
                            size="small"
                            loading={loading}
                            onClick={
                                loadPermissions
                            }
                        />

                    </div>


                    {error && (

                        <div className="
                            p-3
                            mb-3
                            border-round
                            bg-red-50
                            text-red-700
                        ">

                            <i className="
                                pi
                                pi-exclamation-circle
                                mr-2
                            " />

                            {error}

                        </div>

                    )}


                    <DataTable
                        value={
                            filteredPermissions
                        }
                        loading={loading}
                        paginator
                        rows={10}
                        responsiveLayout="scroll"
                        emptyMessage="
                            Nenhuma permissão encontrada.
                        "
                        stripedRows
                        showGridlines
                    >

                        <Column
                            header="Permissão"
                            body={
                                permissionTemplate
                            }
                            sortable
                        />


                        <Column
                            header="Descrição"
                            body={
                                descriptionTemplate
                            }
                        />


                        <Column
                            header="ID"
                            field="id"
                            sortable
                            style={{
                                width: '6rem'
                            }}
                        />


                        <Column
                            header="Acções"
                            body={
                                actionTemplate
                            }
                            style={{
                                width: '8rem'
                            }}
                        />

                    </DataTable>

                </Card>

            </div>


            {/* =================================================
                PERMISSION DIALOG
            ================================================= */}

            <Dialog
                header={
                    editingPermission
                        ? 'Editar permissão'
                        : 'Nova permissão'
                }
                visible={
                    dialogVisible
                }
                style={{
                    width: '600px',
                    maxWidth: '95vw'
                }}
                onHide={
                    closeDialog
                }
                modal
            >

                <div className="
                    flex
                    flex-column
                    gap-4
                ">


                    {/* NAME */}

                    <div>

                        <label className="
                            block
                            text-900
                            font-medium
                            mb-2
                        ">
                            Nome da permissão *
                        </label>


                        <InputText
                            value={name}
                            onChange={(e) =>
                                setName(
                                    e.target.value
                                )
                            }
                            placeholder="
                                Ex.: USER_CREATE
                            "
                            className="w-full"
                            disabled={saving}
                        />


                        <small className="
                            block
                            text-500
                            mt-2
                        ">
                            Utilize um nome único e descritivo.
                        </small>

                    </div>


                    {/* DESCRIPTION */}

                    <div>

                        <label className="
                            block
                            text-900
                            font-medium
                            mb-2
                        ">
                            Descrição
                        </label>


                        <InputText
                            value={
                                description
                            }
                            onChange={(e) =>
                                setDescription(
                                    e.target.value
                                )
                            }
                            placeholder="
                                Ex.: Permite criar utilizadores
                            "
                            className="w-full"
                            disabled={saving}
                        />

                    </div>


                    {/* PREVIEW */}

                    {name.trim() && (

                        <div className="
                            p-3
                            border-round
                            surface-100
                        ">

                            <span className="
                                block
                                text-500
                                text-sm
                                mb-2
                            ">
                                Pré-visualização
                            </span>


                            <Tag
                                value={
                                    name
                                }
                                severity="info"
                            />

                            {description.trim() && (

                                <p className="
                                    text-600
                                    text-sm
                                    mt-2
                                    mb-0
                                ">
                                    {description}
                                </p>

                            )}

                        </div>

                    )}


                    <Divider />


                    {/* ACTIONS */}

                    <div className="
                        flex
                        justify-content-end
                        gap-2
                    ">

                        <Button
                            label="Cancelar"
                            icon="pi pi-times"
                            outlined
                            onClick={
                                closeDialog
                            }
                            disabled={
                                saving
                            }
                        />


                        <Button
                            label={
                                editingPermission
                                    ? 'Actualizar'
                                    : 'Criar permissão'
                            }
                            icon={
                                editingPermission
                                    ? 'pi pi-check'
                                    : 'pi pi-key'
                            }
                            loading={
                                saving
                            }
                            onClick={
                                handleSave
                            }
                        />

                    </div>

                </div>

            </Dialog>

        </div>
    );
};

export default UsersPermitions;