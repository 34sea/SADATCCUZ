'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

import {
    getRoles,
    createRole,
    updateRole,
    deleteRole,
    getPermissions,
    assignPermissionsToRole,
    Role,
    Permission
} from '@/app/api/users/userService';




// =====================================================
// COMPONENT
// =====================================================

const UsersProfiles = () => {

    const toast = useRef<Toast>(null);


    // =====================================================
    // DATA
    // =====================================================

    const [roles, setRoles] =
        useState<Role[]>([]);

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

    const [editingRole, setEditingRole] =
        useState<Role | null>(null);


    // =====================================================
    // FORM
    // =====================================================

    const [name, setName] =
        useState('');

    const [description, setDescription] =
        useState('');

    const [selectedPermissions, setSelectedPermissions] =
        useState<number[]>([]);


    // =====================================================
    // LOAD DATA
    // =====================================================

    const loadData = useCallback(async () => {

        setLoading(true);
        setError(null);

        try {

            const [
                rolesData,
                permissionsData
            ] = await Promise.all([
                getRoles(),
                getPermissions()
            ]);

            setRoles(rolesData);
            setPermissions(permissionsData);

        } catch (err: any) {

            const message =
                err?.response?.data?.message ||
                err?.message ||
                'Erro ao carregar perfis e permissões.';

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

    }, []);


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        loadData();

    }, [loadData]);


    // =====================================================
    // FILTERED ROLES
    // =====================================================

    const filteredRoles = useMemo(() => {

        const value =
            search
                .toLowerCase()
                .trim();

        if (!value) {
            return roles;
        }

        return roles.filter(role => {

            const nameMatch =
                role.name
                    ?.toLowerCase()
                    .includes(value);

            const descriptionMatch =
                role.description
                    ?.toLowerCase()
                    .includes(value);

            const permissionMatch =
                role.permissions?.some(
                    permission =>
                        permission
                            .toLowerCase()
                            .includes(value)
                );

            return (
                nameMatch ||
                descriptionMatch ||
                permissionMatch
            );
        });

    }, [
        roles,
        search
    ]);


    // =====================================================
    // STATISTICS
    // =====================================================

    const totalRoles =
        roles.length;

    const rolesWithPermissions =
        roles.filter(
            role =>
                role.permissions &&
                role.permissions.length > 0
        ).length;

    const totalPermissions =
        permissions.length;

    const adminRole =
        roles.find(
            role =>
                role.name?.toUpperCase() === 'ADMIN'
        );


    // =====================================================
    // PERMISSION OPTIONS
    // =====================================================

    const permissionOptions = useMemo(() => {

        return permissions.map(permission => ({

            label:
                permission.name,

            value:
                permission.id

        }));

    }, [
        permissions
    ]);


    // =====================================================
    // OPEN CREATE
    // =====================================================

    const openCreateDialog = () => {

        setEditingRole(null);

        setName('');

        setDescription('');

        setSelectedPermissions([]);

        setDialogVisible(true);
    };


    // =====================================================
    // OPEN EDIT
    // =====================================================

    const openEditDialog = (
        role: Role
    ) => {

        setEditingRole(role);

        setName(
            role.name || ''
        );

        setDescription(
            role.description || ''
        );


        // Converter nomes das permissões
        // para IDs

        const permissionIds =
            permissions
                .filter(permission =>
                    role.permissions?.includes(
                        permission.name
                    )
                )
                .map(permission =>
                    permission.id
                );

        setSelectedPermissions(
            permissionIds
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

        setEditingRole(null);

        setName('');

        setDescription('');

        setSelectedPermissions([]);
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
                    'Informe o nome do perfil.',
                life: 3000
            });

            return;
        }


        setSaving(true);


        try {

            // =================================================
            // CREATE
            // =================================================

            if (!editingRole) {

                const createdRole =
                    await createRole({

                        name:
                            name.trim(),

                        description:
                            description.trim() ||
                            undefined

                    });


                // Atribuir permissões
                if (
                    selectedPermissions.length > 0
                ) {

                    await assignPermissionsToRole(
                        createdRole.id,
                        selectedPermissions
                    );

                }


                toast.current?.show({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail:
                        'Perfil criado com sucesso.',
                    life: 3000
                });

            }

            // =================================================
            // UPDATE
            // =================================================

            else {

                await updateRole(
                    editingRole.id,
                    {
                        name:
                            name.trim(),

                        description:
                            description.trim()
                    }
                );


                // Actualizar permissões
                await assignPermissionsToRole(
                    editingRole.id,
                    selectedPermissions
                );


                toast.current?.show({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail:
                        'Perfil actualizado com sucesso.',
                    life: 3000
                });
            }


            // =================================================
            // RELOAD
            // =================================================

            await loadData();

            closeDialog();

        } catch (err: any) {

            const message =
                err?.response?.data?.message ||
                err?.message ||
                'Não foi possível guardar o perfil.';

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
        role: Role
    ) => {

        const isAdmin =
            role.name?.toUpperCase() === 'ADMIN';


        if (isAdmin) {

            toast.current?.show({
                severity: 'warn',
                summary:
                    'Operação não permitida',
                detail:
                    'O perfil ADMIN não deve ser eliminado.',
                life: 4000
            });

            return;
        }


        confirmDialog({

            message:
                `Tem certeza que deseja eliminar o perfil "${role.name}"?`,

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


                    await deleteRole(
                        role.id
                    );


                    toast.current?.show({
                        severity: 'success',
                        summary: 'Sucesso',
                        detail:
                            'Perfil eliminado com sucesso.',
                        life: 3000
                    });


                    await loadData();

                } catch (err: any) {

                    const message =
                        err?.response?.data?.message ||
                        err?.message ||
                        'Não foi possível eliminar o perfil.';

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
    // ROLE TEMPLATE
    // =====================================================

    const roleTemplate = (
        role: Role
    ) => {

        const roleName =
            role.name?.toUpperCase();


        let severity:
            | 'success'
            | 'info'
            | 'warning'
            | 'danger'
            | 'secondary'
            | 'contrast'
            | undefined;


        if (roleName === 'ADMIN') {

            severity = 'warning';

        } else if (
            roleName === 'SUPERVISOR'
        ) {

            severity = 'info';

        } else {

            severity = 'success';
        }


        return (
            <Tag
                value={role.name}
                severity={severity}
            />
        );
    };


    // =====================================================
    // DESCRIPTION TEMPLATE
    // =====================================================

    const descriptionTemplate = (
        role: Role
    ) => {

        return (
            <span className="text-600">
                {role.description || '-'}
            </span>
        );
    };


    // =====================================================
    // PERMISSIONS TEMPLATE
    // =====================================================

    const permissionsTemplate = (
        role: Role
    ) => {

        const rolePermissions =
            role.permissions || [];


        if (
            rolePermissions.length === 0
        ) {

            return (
                <span className="text-500">
                    Sem permissões
                </span>
            );
        }


        return (
            <div className="
                flex
                flex-wrap
                gap-1
            ">

                {rolePermissions.map(
                    permission => (

                        <Tag
                            key={permission}
                            value={permission}
                            severity="info"
                        />

                    )
                )}

            </div>
        );
    };


    // =====================================================
    // PERMISSION COUNT
    // =====================================================

    const permissionCountTemplate = (
        role: Role
    ) => {

        const count =
            role.permissions?.length || 0;


        return (
            <div className="
                flex
                align-items-center
                gap-2
            ">

                <i className="
                    pi
                    pi-key
                    text-primary
                " />

                <span>
                    {count}
                </span>

            </div>
        );
    };


    // =====================================================
    // ACTION TEMPLATE
    // =====================================================

    const actionTemplate = (
        role: Role
    ) => {

        const isAdmin =
            role.name?.toUpperCase() === 'ADMIN';


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
                        openEditDialog(role)
                    }
                />


                <Button
                    icon="pi pi-trash"
                    rounded
                    text
                    severity="danger"
                    disabled={isAdmin}
                    tooltip={
                        isAdmin
                            ? 'ADMIN não pode ser eliminado'
                            : 'Eliminar'
                    }
                    tooltipOptions={{
                        position: 'top'
                    }}
                    onClick={() =>
                        handleDelete(role)
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
                            Funções e Perfis
                        </h2>

                        <p className="
                            text-600
                            mt-2
                            mb-0
                        ">
                            Consulte e administre as funções,
                            perfis e permissões do sistema.
                        </p>

                    </div>


                    <Button
                        label="Novo perfil"
                        icon="pi pi-shield"
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
                xl:col-3
            ">

                <div className="
                    card
                    mb-0
                    h-full
                ">

                    <span className="
                        block
                        text-500
                        font-medium
                        mb-2
                    ">
                        Total de perfis
                    </span>

                    <div className="
                        text-900
                        font-medium
                        text-2xl
                    ">
                        {totalRoles}
                    </div>

                    <span className="
                        text-500
                        text-sm
                    ">
                        Perfis registados
                    </span>

                </div>

            </div>


            <div className="
                col-12
                lg:col-6
                xl:col-3
            ">

                <div className="
                    card
                    mb-0
                    h-full
                ">

                    <span className="
                        block
                        text-500
                        font-medium
                        mb-2
                    ">
                        Administrador
                    </span>

                    <div className="
                        text-900
                        font-medium
                        text-2xl
                    ">
                        {adminRole ? 1 : 0}
                    </div>

                    <span className="
                        text-500
                        text-sm
                    ">
                        Perfil ADMIN
                    </span>

                </div>

            </div>


            <div className="
                col-12
                lg:col-6
                xl:col-3
            ">

                <div className="
                    card
                    mb-0
                    h-full
                ">

                    <span className="
                        block
                        text-500
                        font-medium
                        mb-2
                    ">
                        Perfis configurados
                    </span>

                    <div className="
                        text-900
                        font-medium
                        text-2xl
                    ">
                        {rolesWithPermissions}
                    </div>

                    <span className="
                        text-500
                        text-sm
                    ">
                        Com permissões
                    </span>

                </div>

            </div>


            <div className="
                col-12
                lg:col-6
                xl:col-3
            ">

                <div className="
                    card
                    mb-0
                    h-full
                ">

                    <span className="
                        block
                        text-500
                        font-medium
                        mb-2
                    ">
                        Permissões
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
                        Disponíveis no sistema
                    </span>

                </div>

            </div>


            {/* =================================================
                FILTER
            ================================================= */}

            <div className="col-12">

                <Card>

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
                                        Nome, descrição ou permissão
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
                                Perfis do sistema
                            </h5>

                            <span className="
                                text-500
                                text-sm
                            ">
                                {filteredRoles.length}
                                {' '}
                                perfil(is) encontrado(s)
                            </span>

                        </div>


                        <Button
                            icon="pi pi-refresh"
                            label="Actualizar"
                            outlined
                            size="small"
                            loading={loading}
                            onClick={loadData}
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
                        value={filteredRoles}
                        loading={loading}
                        paginator
                        rows={10}
                        responsiveLayout="scroll"
                        emptyMessage="
                            Nenhum perfil encontrado.
                        "
                        stripedRows
                        showGridlines
                    >

                        <Column
                            header="Perfil"
                            body={roleTemplate}
                            sortable
                        />

                        <Column
                            header="Descrição"
                            body={descriptionTemplate}
                        />

                        <Column
                            header="Permissões"
                            body={permissionsTemplate}
                        />

                        <Column
                            header="N.º Permissões"
                            body={permissionCountTemplate}
                            style={{
                                width: '10rem'
                            }}
                        />

                        <Column
                            header="Acções"
                            body={actionTemplate}
                            style={{
                                width: '8rem'
                            }}
                        />

                    </DataTable>

                </Card>

            </div>


            {/* =================================================
                ROLE DIALOG
            ================================================= */}

            <Dialog
                header={
                    editingRole
                        ? 'Editar perfil'
                        : 'Novo perfil'
                }
                visible={dialogVisible}
                style={{
                    width: '650px',
                    maxWidth: '95vw'
                }}
                onHide={closeDialog}
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
                            Nome do perfil *
                        </label>

                        <InputText
                            value={name}
                            onChange={(e) =>
                                setName(
                                    e.target.value
                                )
                            }
                            placeholder="
                                Ex.: SUPERVISOR
                            "
                            className="w-full"
                            disabled={saving}
                        />

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
                            value={description}
                            onChange={(e) =>
                                setDescription(
                                    e.target.value
                                )
                            }
                            placeholder="
                                Descrição do perfil
                            "
                            className="w-full"
                            disabled={saving}
                        />

                    </div>


                    {/* PERMISSIONS */}

                    <div>

                        <label className="
                            block
                            text-900
                            font-medium
                            mb-2
                        ">
                            Permissões
                        </label>

                        <MultiSelect
                            value={
                                selectedPermissions
                            }
                            onChange={(e) =>
                                setSelectedPermissions(
                                    e.value
                                )
                            }
                            options={
                                permissionOptions
                            }
                            placeholder="
                                Seleccione as permissões
                            "
                            className="w-full"
                            display="chip"
                            filter
                            showSelectAll
                            disabled={saving}
                        />

                        <small className="
                            block
                            text-500
                            mt-2
                        ">
                            Seleccione as permissões que
                            este perfil poderá utilizar.
                        </small>

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
                                value={name}
                                severity={
                                    name.toUpperCase() ===
                                    'ADMIN'
                                        ? 'warning'
                                        : 'info'
                                }
                            />

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
                            onClick={closeDialog}
                            disabled={saving}
                        />

                        <Button
                            label={
                                editingRole
                                    ? 'Actualizar'
                                    : 'Criar perfil'
                            }
                            icon={
                                editingRole
                                    ? 'pi pi-check'
                                    : 'pi pi-shield'
                            }
                            loading={saving}
                            onClick={handleSave}
                        />

                    </div>

                </div>

            </Dialog>

        </div>
    );
};

export default UsersProfiles;