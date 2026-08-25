'use client';

import React, { useMemo, useState } from 'react';

import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';

import { useRef } from 'react';

import {
    User,
    CreateUserData,
    UpdateUserData
} from '@/app/api/users/userService';

// import { useUserManagement } from '@/hooks/useUserManagement';
import { useUserManagement } from '@/app/hooks/users/useUserManagement';


// =====================================================
// COMPONENT
// =====================================================

const UserManagement = () => {

    const toast = useRef<Toast>(null);

    const {
        users,
        roles,
        loading,
        saving,
        error,
        loadUsers,
        addUser,
        editUser,
        removeUser
    } = useUserManagement();


    // =====================================================
    // FILTERS
    // =====================================================

    const [search, setSearch] = useState('');

    const [selectedRole, setSelectedRole] =
        useState<string | null>(null);

    const [selectedStatus, setSelectedStatus] =
        useState<boolean | null>(null);


    // =====================================================
    // DIALOG
    // =====================================================

    const [dialogVisible, setDialogVisible] =
        useState(false);

    const [editingUser, setEditingUser] =
        useState<User | null>(null);


    // =====================================================
    // FORM
    // =====================================================

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [codeNumber, setCodeNumber] = useState('');
    const [password, setPassword] = useState('');

    const [active, setActive] =
        useState(true);

    const [selectedRoles, setSelectedRoles] =
        useState<number[]>([]);


    // =====================================================
    // FILTERED USERS
    // =====================================================

    const filteredUsers = useMemo(() => {

        return users.filter((user) => {

            const searchValue =
                search.toLowerCase().trim();

            const searchMatch =
                !searchValue ||
                user.name
                    ?.toLowerCase()
                    .includes(searchValue) ||
                user.email
                    ?.toLowerCase()
                    .includes(searchValue) ||
                user.code_number
                    ?.toLowerCase()
                    .includes(searchValue);

            const roleMatch =
                !selectedRole ||
                user.roles.includes(selectedRole);

            const statusMatch =
                selectedStatus === null ||
                user.is_active === selectedStatus;

            return (
                searchMatch &&
                roleMatch &&
                statusMatch
            );
        });

    }, [
        users,
        search,
        selectedRole,
        selectedStatus
    ]);


    // =====================================================
    // STATISTICS
    // =====================================================

    const totalUsers = users.length;

    const activeUsers =
        users.filter(
            user => user.is_active
        ).length;

    const inactiveUsers =
        users.filter(
            user => !user.is_active
        ).length;

    const adminUsers =
        users.filter(
            user => user.roles.includes('ADMIN')
        ).length;


    // =====================================================
    // OPEN CREATE
    // =====================================================

    const openCreateDialog = () => {

        setEditingUser(null);

        setName('');
        setEmail('');
        setCodeNumber('');
        setPassword('');
        setActive(true);
        setSelectedRoles([]);

        setDialogVisible(true);
    };


    // =====================================================
    // OPEN EDIT
    // =====================================================

    const openEditDialog = (user: User) => {

        setEditingUser(user);

        setName(user.name || '');
        setEmail(user.email || '');
        setCodeNumber(user.code_number || '');
        setPassword('');
        setActive(user.is_active);

        const roleIds = roles
            .filter(role =>
                user.roles.includes(role.name)
            )
            .map(role => role.id);

        setSelectedRoles(roleIds);

        setDialogVisible(true);
    };


    // =====================================================
    // SAVE
    // =====================================================

    const handleSave = async () => {

        if (!name.trim()) {

            toast.current?.show({
                severity: 'warn',
                summary: 'Atenção',
                detail: 'Informe o nome do utilizador.',
                life: 3000
            });

            return;
        }

        if (!email.trim()) {

            toast.current?.show({
                severity: 'warn',
                summary: 'Atenção',
                detail: 'Informe o email.',
                life: 3000
            });

            return;
        }


        try {

            if (editingUser) {

                const data: UpdateUserData = {
                    name,
                    email,
                    code_number: codeNumber,
                    is_active: active,
                    role_ids: selectedRoles
                };

                if (password.trim()) {
                    data.password = password;
                }

                await editUser(
                    editingUser.id,
                    data
                );

                toast.current?.show({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Utilizador actualizado com sucesso.',
                    life: 3000
                });

            } else {

                if (!password.trim()) {

                    toast.current?.show({
                        severity: 'warn',
                        summary: 'Atenção',
                        detail: 'Informe a palavra-passe.',
                        life: 3000
                    });

                    return;
                }

                const data: CreateUserData = {
                    name,
                    email,
                    password,
                    code_number: codeNumber,
                    role_ids: selectedRoles
                };

                await addUser(data);

                toast.current?.show({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Utilizador criado com sucesso.',
                    life: 3000
                });
            }

            setDialogVisible(false);

        } catch (err: any) {

            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail:
                    err.response?.data?.message ||
                    'Não foi possível guardar o utilizador.',
                life: 4000
            });
        }
    };


    // =====================================================
    // DELETE
    // =====================================================

    const handleDelete = (user: User) => {

        confirmDialog({

            message:
                `Tem certeza que deseja eliminar o utilizador "${user.name}"?`,

            header: 'Confirmar eliminação',

            icon: 'pi pi-exclamation-triangle',

            acceptLabel: 'Sim, eliminar',

            rejectLabel: 'Cancelar',

            acceptClassName: 'p-button-danger',

            accept: async () => {

                try {

                    await removeUser(user.id);

                    toast.current?.show({
                        severity: 'success',
                        summary: 'Sucesso',
                        detail: 'Utilizador eliminado.',
                        life: 3000
                    });

                } catch (err: any) {

                    toast.current?.show({
                        severity: 'error',
                        summary: 'Erro',
                        detail:
                            err.response?.data?.message ||
                            'Erro ao eliminar utilizador.',
                        life: 4000
                    });
                }
            }
        });
    };


    // =====================================================
    // CLEAR FILTERS
    // =====================================================

    const clearFilters = () => {

        setSearch('');
        setSelectedRole(null);
        setSelectedStatus(null);
    };


    // =====================================================
    // STATUS TEMPLATE
    // =====================================================

    const statusTemplate = (user: User) => {

        return (
            <Tag
                value={
                    user.is_active
                        ? 'Activo'
                        : 'Inactivo'
                }
                severity={
                    user.is_active
                        ? 'success'
                        : 'danger'
                }
            />
        );
    };


    // =====================================================
    // ROLE TEMPLATE
    // =====================================================

    const roleTemplate = (user: User) => {

        return (
            <div className="flex flex-wrap gap-1">

                {user.roles.length > 0 ? (

                    user.roles.map(role => (

                        <Tag
                            key={role}
                            value={role}
                            severity={
                                role === 'ADMIN'
                                    ? 'warning'
                                    : 'info'
                            }
                        />

                    ))

                ) : (

                    <span className="text-500">
                        Sem perfil
                    </span>

                )}

            </div>
        );
    };


    // =====================================================
    // DATE TEMPLATE
    // =====================================================

    const dateTemplate = (user: User) => {

        if (!user.created_at) {
            return '-';
        }

        return new Date(
            user.created_at
        ).toLocaleDateString('pt-PT');
    };


    // =====================================================
    // ACTION TEMPLATE
    // =====================================================

    const actionTemplate = (user: User) => {

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
                        openEditDialog(user)
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
                        handleDelete(user)
                    }
                />

            </div>
        );
    };


    // =====================================================
    // ROLE OPTIONS
    // =====================================================

    const roleOptions = roles.map(role => ({
        label: role.name,
        value: role.name
    }));


    // =====================================================
    // STATUS OPTIONS
    // =====================================================

    const statusOptions = [
        {
            label: 'Activos',
            value: true
        },
        {
            label: 'Inactivos',
            value: false
        }
    ];


    // =====================================================
    // RETURN
    // =====================================================

    return (

        <div className="grid">

            <Toast ref={toast} />

            <ConfirmDialog />


            {/* =====================================================
                HEADER
            ===================================================== */}

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

                        <h2 className="text-900 font-semibold m-0">
                            Gestão de Utilizadores
                        </h2>

                        <p className="text-600 mt-2 mb-0">
                            Consulte, crie e administre os utilizadores do sistema.
                        </p>

                    </div>

                    <Button
                        label="Novo utilizador"
                        icon="pi pi-user-plus"
                        onClick={openCreateDialog}
                    />

                </div>

            </div>


            {/* =====================================================
                CARDS
            ===================================================== */}

            <div className="col-12 lg:col-6 xl:col-3">

                <div className="card mb-0 h-full">

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
                                Total de utilizadores
                            </span>

                            <div className="
                                text-900
                                font-medium
                                text-2xl
                            ">
                                {totalUsers}
                            </div>

                            <span className="text-500 text-sm">
                                Registados no sistema
                            </span>

                        </div>

                        <div
                            className="
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
                                pi-users
                                text-blue-500
                                text-xl
                            " />
                        </div>

                    </div>

                </div>

            </div>


            <div className="col-12 lg:col-6 xl:col-3">

                <div className="card mb-0 h-full">

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
                                Activos
                            </span>

                            <div className="
                                text-900
                                font-medium
                                text-2xl
                            ">
                                {activeUsers}
                            </div>

                            <span className="text-500 text-sm">
                                Contas activas
                            </span>

                        </div>

                        <div
                            className="
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
                                pi-user
                                text-green-500
                                text-xl
                            " />
                        </div>

                    </div>

                </div>

            </div>


            <div className="col-12 lg:col-6 xl:col-3">

                <div className="card mb-0 h-full">

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
                                Inactivos
                            </span>

                            <div className="
                                text-900
                                font-medium
                                text-2xl
                            ">
                                {inactiveUsers}
                            </div>

                            <span className="text-500 text-sm">
                                Contas desactivadas
                            </span>

                        </div>

                        <div
                            className="
                                flex
                                align-items-center
                                justify-content-center
                                bg-red-100
                                border-round
                            "
                            style={{
                                width: '2.5rem',
                                height: '2.5rem'
                            }}
                        >
                            <i className="
                                pi
                                pi-user-minus
                                text-red-500
                                text-xl
                            " />
                        </div>

                    </div>

                </div>

            </div>


            <div className="col-12 lg:col-6 xl:col-3">

                <div className="card mb-0 h-full">

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
                                Administradores
                            </span>

                            <div className="
                                text-900
                                font-medium
                                text-2xl
                            ">
                                {adminUsers}
                            </div>

                            <span className="text-500 text-sm">
                                Perfil ADMIN
                            </span>

                        </div>

                        <div
                            className="
                                flex
                                align-items-center
                                justify-content-center
                                bg-orange-100
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
                                text-orange-500
                                text-xl
                            " />
                        </div>

                    </div>

                </div>

            </div>


            {/* =====================================================
                FILTROS
            ===================================================== */}

            <div className="col-12">

                <Card>

                    <div className="
                        flex
                        align-items-center
                        justify-content-between
                        mb-4
                    ">

                        <div>

                            <h5 className="m-0 text-900">
                                Pesquisa e filtros
                            </h5>

                            <span className="
                                text-500
                                text-sm
                            ">
                                Pesquise e filtre os utilizadores
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
                            md:col-4
                        ">

                            <label className="
                                block
                                text-900
                                font-medium
                                mb-2
                            ">
                                Pesquisa
                            </label>

                            <span className="p-input-icon-left w-full">

                                <i className="pi pi-search" />

                                <InputText
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(
                                            e.target.value
                                        )
                                    }
                                    placeholder="
                                        Nome, email ou código
                                    "
                                    className="w-full"
                                />

                            </span>

                        </div>


                        <div className="
                            col-12
                            md:col-3
                        ">

                            <label className="
                                block
                                text-900
                                font-medium
                                mb-2
                            ">
                                Perfil
                            </label>

                            <Dropdown
                                value={selectedRole}
                                onChange={(e) =>
                                    setSelectedRole(
                                        e.value
                                    )
                                }
                                options={roleOptions}
                                placeholder="Todos os perfis"
                                className="w-full"
                                showClear
                            />

                        </div>


                        <div className="
                            col-12
                            md:col-3
                        ">

                            <label className="
                                block
                                text-900
                                font-medium
                                mb-2
                            ">
                                Estado
                            </label>

                            <Dropdown
                                value={selectedStatus}
                                onChange={(e) =>
                                    setSelectedStatus(
                                        e.value
                                    )
                                }
                                options={statusOptions}
                                placeholder="Todos os estados"
                                className="w-full"
                                showClear
                            />

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
                                onClick={clearFilters}
                            />

                        </div>

                    </div>

                </Card>

            </div>


            {/* =====================================================
                TABLE
            ===================================================== */}

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

                            <h5 className="m-0 text-900">
                                Utilizadores
                            </h5>

                            <span className="
                                text-500
                                text-sm
                            ">
                                {filteredUsers.length}
                                {' '}utilizador(es) encontrado(s)
                            </span>

                        </div>

                        <Button
                            icon="pi pi-refresh"
                            label="Actualizar"
                            outlined
                            size="small"
                            loading={loading}
                            onClick={() =>
                                loadUsers()
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
                        value={filteredUsers}
                        loading={loading}
                        paginator
                        rows={10}
                        responsiveLayout="scroll"
                        emptyMessage="
                            Nenhum utilizador encontrado.
                        "
                        stripedRows
                        showGridlines
                    >

                        <Column
                            field="name"
                            header="Nome"
                            sortable
                        />

                        <Column
                            field="email"
                            header="Email"
                            sortable
                        />

                        <Column
                            field="code_number"
                            header="Código"
                            body={(user: User) =>
                                user.code_number || '-'
                            }
                        />

                        <Column
                            header="Perfil"
                            body={roleTemplate}
                        />

                        <Column
                            header="Estado"
                            body={statusTemplate}
                        />

                        <Column
                            field="created_at"
                            header="Data de registo"
                            body={dateTemplate}
                            sortable
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


            {/* =====================================================
                USER DIALOG
            ===================================================== */}

            <Dialog
                header={
                    editingUser
                        ? 'Editar utilizador'
                        : 'Novo utilizador'
                }
                visible={dialogVisible}
                style={{
                    width: '650px',
                    maxWidth: '95vw'
                }}
                onHide={() =>
                    setDialogVisible(false)
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
                            Nome *
                        </label>

                        <InputText
                            value={name}
                            onChange={(e) =>
                                setName(
                                    e.target.value
                                )
                            }
                            placeholder="
                                Nome completo
                            "
                            className="w-full"
                        />

                    </div>


                    {/* EMAIL */}

                    <div>

                        <label className="
                            block
                            text-900
                            font-medium
                            mb-2
                        ">
                            Email *
                        </label>

                        <InputText
                            value={email}
                            onChange={(e) =>
                                setEmail(
                                    e.target.value
                                )
                            }
                            type="email"
                            placeholder="
                                utilizador@email.com
                            "
                            className="w-full"
                        />

                    </div>


                    {/* CODE */}

                    <div>

                        <label className="
                            block
                            text-900
                            font-medium
                            mb-2
                        ">
                            Código
                        </label>

                        <InputText
                            value={codeNumber}
                            onChange={(e) =>
                                setCodeNumber(
                                    e.target.value
                                )
                            }
                            placeholder="Ex.: ADM001"
                            className="w-full"
                        />

                    </div>


                    {/* PASSWORD */}

                    <div>

                        <label className="
                            block
                            text-900
                            font-medium
                            mb-2
                        ">
                            Palavra-passe
                            {!editingUser && ' *'}
                        </label>

                        <Password
                            value={password}
                            onChange={(e) =>
                                setPassword(
                                    e.target.value
                                )
                            }
                            placeholder={
                                editingUser
                                    ? 'Deixe vazio para manter'
                                    : 'Palavra-passe'
                            }
                            toggleMask
                            feedback={!editingUser}
                            className="w-full"
                            inputClassName="w-full"
                        />

                    </div>


                    {/* ROLES */}

                    <div>

                        <label className="
                            block
                            text-900
                            font-medium
                            mb-2
                        ">
                            Perfis
                        </label>

                        <MultiSelect
                            value={selectedRoles}
                            onChange={(e) =>
                                setSelectedRoles(
                                    e.value
                                )
                            }
                            options={
                                roles.map(role => ({
                                    label: role.name,
                                    value: role.id
                                }))
                            }
                            placeholder="
                                Seleccione os perfis
                            "
                            className="w-full"
                            display="chip"
                            filter
                        />

                    </div>


                    {/* STATUS */}

                    {editingUser && (

                        <div>

                            <label className="
                                block
                                text-900
                                font-medium
                                mb-2
                            ">
                                Estado
                            </label>

                            <Dropdown
                                value={active}
                                onChange={(e) =>
                                    setActive(
                                        e.value
                                    )
                                }
                                options={[
                                    {
                                        label: 'Activo',
                                        value: true
                                    },
                                    {
                                        label: 'Inactivo',
                                        value: false
                                    }
                                ]}
                                className="w-full"
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
                            onClick={() =>
                                setDialogVisible(false)
                            }
                            disabled={saving}
                        />

                        <Button
                            label={
                                editingUser
                                    ? 'Actualizar'
                                    : 'Criar utilizador'
                            }
                            icon={
                                editingUser
                                    ? 'pi pi-check'
                                    : 'pi pi-user-plus'
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

export default UserManagement;