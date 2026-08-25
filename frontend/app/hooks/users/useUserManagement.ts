// import { User, UserFilters } from '@/app/api/users/userService';
import { useCallback, useEffect, useState } from 'react';

import {
    User,
    Role,
    CreateUserData,
    UpdateUserData,
    UserFilters,
    getUsers,
    getRoles,
    createUser,
    updateUser,
    deleteUser
} from '@/app/api/users/userService';

export const useUserManagement = () => {

    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState<string | null>(null);

    // =====================================================
    // LOAD USERS
    // =====================================================

    const loadUsers = useCallback(
        async (filters?: UserFilters) => {

            setLoading(true);
            setError(null);

            try {

                const result = await getUsers(filters);

                setUsers(result);

            } catch (err: any) {

                console.error(
                    'Erro ao carregar utilizadores:',
                    err
                );

                setError(
                    err.response?.data?.message ||
                    'Erro ao carregar utilizadores.'
                );

            } finally {

                setLoading(false);
            }
        },
        []
    );

    // =====================================================
    // LOAD ROLES
    // =====================================================

    const loadRoles = useCallback(
        async () => {

            try {

                const result = await getRoles();

                setRoles(result);

            } catch (err: any) {

                console.error(
                    'Erro ao carregar perfis:',
                    err
                );

            }
        },
        []
    );

    // =====================================================
    // CREATE
    // =====================================================

    const addUser = async (
        data: CreateUserData
    ) => {

        setSaving(true);
        setError(null);

        try {

            const result = await createUser(data);

            await loadUsers();

            return result;

        } catch (err: any) {

            console.error(
                'Erro ao criar utilizador:',
                err
            );

            const message =
                err.response?.data?.message ||
                'Erro ao criar utilizador.';

            setError(message);

            throw err;

        } finally {

            setSaving(false);
        }
    };

    // =====================================================
    // UPDATE
    // =====================================================

    const editUser = async (
        id: number,
        data: UpdateUserData
    ) => {

        setSaving(true);
        setError(null);

        try {

            const result = await updateUser(
                id,
                data
            );

            await loadUsers();

            return result;

        } catch (err: any) {

            console.error(
                'Erro ao actualizar utilizador:',
                err
            );

            const message =
                err.response?.data?.message ||
                'Erro ao actualizar utilizador.';

            setError(message);

            throw err;

        } finally {

            setSaving(false);
        }
    };

    // =====================================================
    // DELETE
    // =====================================================

    const removeUser = async (
        id: number
    ) => {

        setSaving(true);
        setError(null);

        try {

            const result = await deleteUser(id);

            await loadUsers();

            return result;

        } catch (err: any) {

            console.error(
                'Erro ao eliminar utilizador:',
                err
            );

            const message =
                err.response?.data?.message ||
                'Erro ao eliminar utilizador.';

            setError(message);

            throw err;

        } finally {

            setSaving(false);
        }
    };

    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        loadUsers();
        loadRoles();

    }, [loadUsers, loadRoles]);

    return {
        users,
        roles,

        loading,
        saving,
        error,

        loadUsers,
        loadRoles,

        addUser,
        editUser,
        removeUser
    };
};