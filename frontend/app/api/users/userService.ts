

// =====================================================
// TYPES
// =====================================================

import api from "../api";
import pathUrls from "../pathApi";


import { getUserFromStorage } from "../auth/authService";

// =====================================================
// TYPES
// =====================================================

export interface User {
    id: number;
    name: string;
    email: string;
    code_number?: string | null;
    is_active: boolean;
    created_at?: string;
    roles: string[];
}

export interface CreateUserData {
    name: string;
    email: string;
    password: string;
    code_number?: string;
    role_ids?: number[];
}

export interface UpdateUserData {
    name?: string;
    email?: string;
    code_number?: string;
    is_active?: boolean;
    password?: string;
    role_ids?: number[];
}

export interface UserFilters {
    role?: string;
    is_active?: boolean;
}

export interface Role {
    id: number;
    name: string;
    description?: string;
    permissions?: string[];
}


// =====================================================
// TOKEN
// =====================================================

const getAuthHeaders = () => {

    const userData = getUserFromStorage();
console.log(`userData: ${userData}`)
    const token = userData?.data?.token;
    console.log(`Token pass: ${token}`)

    if (!token) {
        throw new Error(
            'Token de autenticação não encontrado.'
        );
    }

    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};


// =====================================================
// GET USERS
// =====================================================

export const getUsers = async (
    filters?: UserFilters
): Promise<User[]> => {

    const params: Record<string, any> = {};

    if (filters?.role) {
        params.role = filters.role;
    }

    if (filters?.is_active !== undefined) {
        params.is_active = filters.is_active;
    }

    const response = await api.get(
        pathUrls.users,
        {
            params,
            headers: getAuthHeaders()
        }
    );

    return response.data.data;
};


// =====================================================
// GET USER BY ID
// =====================================================

export const getUserById = async (
    id: number
): Promise<User> => {

    const response = await api.get(
        `${pathUrls.users}/${id}`,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data.data;
};


// =====================================================
// CREATE USER
// =====================================================

export const createUser = async (
    data: CreateUserData
) => {

    const response = await api.post(
        pathUrls.users,
        data,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data;
};


// =====================================================
// UPDATE USER
// =====================================================

export const updateUser = async (
    id: number,
    data: UpdateUserData
) => {

    const response = await api.put(
        `${pathUrls.users}/${id}`,
        data,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data;
};


// =====================================================
// DELETE USER
// =====================================================

export const deleteUser = async (
    id: number
) => {

    const response = await api.delete(
        `${pathUrls.users}/${id}`,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data;
};


// =====================================================
// GET ROLES
// =====================================================

// export const getRoles = async (): Promise<Role[]> => {

//     const response = await api.get(
//         pathUrls.roles,
//         {
//             headers: getAuthHeaders()
//         }
//     );

//     return response.data.data;
// };

// =====================================================
// ROLE TYPES
// =====================================================

// export interface Role {
//     id: number;
//     name: string;
//     description?: string | null;
//     permissions?: string[];
// }

export interface CreateRoleData {
    name: string;
    description?: string;
}

export interface UpdateRoleData {
    name: string;
    description?: string;
}

export interface Permission {
    id: number;
    name: string;
    description?: string | null;
}

export interface AssignPermissionsData {
    permission_ids: number[];
}


// =====================================================
// GET ROLES
// =====================================================

export const getRoles = async (): Promise<Role[]> => {

    const response = await api.get(
        pathUrls.roles,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data.data;
};


// =====================================================
// CREATE ROLE
// =====================================================

export const createRole = async (
    data: CreateRoleData
): Promise<Role> => {

    const response = await api.post(
        pathUrls.roles,
        data,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data.data;
};


// =====================================================
// UPDATE ROLE
// =====================================================

export const updateRole = async (
    id: number,
    data: UpdateRoleData
): Promise<Role> => {

    const response = await api.put(
        `${pathUrls.roles2}/${id}`,
        data,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data.data;
};


// =====================================================
// DELETE ROLE
// =====================================================

export const deleteRole = async (
    id: number
) => {

    const response = await api.delete(
        `${pathUrls.roles2}/${id}`,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data;
};


// =====================================================
// GET PERMISSIONS
// =====================================================

// export const getPermissions = async (): Promise<Permission[]> => {

//     const response = await api.get(
//         pathUrls.permition,
//         {
//             headers: getAuthHeaders()
//         }
//     );

//     return response.data.data;
// };


// // =====================================================
// // ASSIGN PERMISSIONS TO ROLE
// // =====================================================

// export const assignPermissionsToRole = async (
//     roleId: number,
//     permissionIds: number[]
// ) => {

//     const response = await api.put(
//         `${pathUrls.roles2}/${roleId}/permissions`,
//         {
//             permission_ids: permissionIds
//         },
//         {
//             headers: getAuthHeaders()
//         }
//     );

//     return response.data;
// };

// =====================================================
// GET PERMISSIONS
// =====================================================

export const getPermissions = async (): Promise<Permission[]> => {

    const response = await api.get(
        pathUrls.permition,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data.data;
};


// =====================================================
// CREATE PERMISSION
// =====================================================

export const createPermission = async (
    data: {
        name: string;
        description?: string;
    }
): Promise<Permission> => {

    const response = await api.post(
        pathUrls.permition,
        data,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data.data;
};


// =====================================================
// UPDATE PERMISSION
// =====================================================

export const updatePermission = async (
    id: number,
    data: {
        name: string;
        description?: string;
    }
): Promise<Permission> => {

    const response = await api.put(
        `${pathUrls.permition2}/${id}`,
        data,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data.data;
};


// =====================================================
// DELETE PERMISSION
// =====================================================

export const deletePermission = async (
    id: number
) => {

    const response = await api.delete(
        `${pathUrls.permition2}/${id}`,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data;
};


// =====================================================
// ASSIGN PERMISSIONS TO ROLE
// =====================================================

export const assignPermissionsToRole = async (
    roleId: number,
    permissionIds: number[]
) => {

    const response = await api.put(
        `${pathUrls.roles2}/${roleId}/permissions`,
        {
            permission_ids: permissionIds
        },
        {
            headers: getAuthHeaders()
        }
    );

    return response.data;
};