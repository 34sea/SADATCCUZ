
import api from '../api';
import pathUrls from '../pathApi';
import { getUserFromStorage } from '../auth/authService';

// =====================================================
// TYPES
// =====================================================

export type DefenseStatus =
    | 'AGENDADO'
    | 'REALIZADO'
    | 'CANCELADO';

export type JuryRole =
    | 'PRESIDENTE'
    | 'OPONENTE'
    | 'ORIENTADOR'
    | 'VOGAL';


// =====================================================
// ROOM
// =====================================================

export interface DefenseRoom {
    id: number;
    name: string;
    location?: string | null;
    capacity?: number;
    is_active: boolean;
    // created_at?: string;
    // updated_at?: string;
}


// =====================================================
// JURY MEMBER
// =====================================================

export interface JuryMember {
    id?: number;
    user_id: number;

    role_in_jury: JuryRole;

    member_name?: string;
    member_email?: string;
}


// =====================================================
// DEFENSE SCHEDULE
// =====================================================

export interface DefenseSchedule {
    id: number;

    student_id: number;
    notebook_id: number;

    tcc_title: string;

    defense_date: string;

    start_time: string;
    end_time: string;

    room_id: number;

    /**
     * URL completa do documento.
     * Será null enquanto o estudante ainda não carregar o PDF.
     */
    tcc_document_url: string | null;

    status: DefenseStatus;

    created_by?: number;
    created_at?: string;

    student_name?: string;
    student_email?: string;

    room_name?: string;
    room_location?: string;

    created_by_name?: string;

    jury_members?: JuryMember[];
}


// =====================================================
// CREATE ROOM
// =====================================================

export interface CreateDefenseRoomData {
    name: string;
    location?: string;
    capacity?: number;
}


// =====================================================
// CREATE DEFENSE
// =====================================================

export interface CreateDefenseScheduleData {
    student_id: number;

    notebook_id: number;

    tcc_title: string;

    defense_date: string;

    start_time: string;

    end_time: string;

    room_id: number;

    /**
     * O documento NÃO é carregado durante o agendamento.
     */
    jury_members?: {
        user_id: number;
        role_in_jury: JuryRole;
    }[];
}


// =====================================================
// UPDATE DEFENSE
// =====================================================

export interface UpdateDefenseScheduleData {
    status?: DefenseStatus;

    tcc_title?: string;
}


// =====================================================
// UPLOAD DEFENSE DOCUMENT
// =====================================================

export interface UploadDefenseDocumentResponse {
    id: number;

    tcc_document_url: string;

    filename?: string;
}


// =====================================================
// AUTH
// =====================================================

const getAuthHeaders = () => {

    const userData = getUserFromStorage();

    const token = userData?.data?.token;

    if (!token) {
        throw new Error(
            'Token de autenticação não encontrado.'
        );
    }

    return {
        Authorization: `Bearer ${token}`
    };
};


// =====================================================
// ROOMS
// =====================================================

export const getDefenseRooms = async (): Promise<
    DefenseRoom[]
> => {

    const response = await api.get(
        `${pathUrls.rooms}`,
        {
            headers: getAuthHeaders()
        }
    );

    console.log("Salas de defesa:")
    console.log(response.data);
    console.log("---------------------------------------")
    console.log(response.data.data)
    console.log("---------------------------------------")

    return response.data.data;
};


// =====================================================
// CREATE ROOM
// =====================================================

export const createDefenseRoom = async (
    data: CreateDefenseRoomData
): Promise<DefenseRoom> => {

    const response = await api.post(
        `${pathUrls.rooms}`,
        data,
        {
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            }
        }
    );

    return response.data.data;
};


// =====================================================
// UPDATE ROOM
// =====================================================

export const updateDefenseRoom = async (
    roomId: number,
    data: Partial<CreateDefenseRoomData> & {
        is_active?: boolean;
    }
) => {

    const response = await api.put(
        `${pathUrls.rooms}/${roomId}`,
        data,
        {
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            }
        }
    );

    return response.data;
};


// =====================================================
// CREATE DEFENSE SCHEDULE
// =====================================================

export const createDefenseSchedule = async (
    data: CreateDefenseScheduleData
): Promise<DefenseSchedule> => {

    const response = await api.post(
        `${pathUrls.defenses}`,
        data,
        {
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            }
        }
    );

    return response.data.data;
};


// =====================================================
// GET DEFENSE SCHEDULES
// =====================================================

export interface DefenseScheduleFilters {
    defense_date?: string;
    room_id?: number;
    status?: DefenseStatus;
    student_id?: number;
}

export const getDefenseSchedules = async (
    filters?: DefenseScheduleFilters
): Promise<DefenseSchedule[]> => {

    const response = await api.get(
        `${pathUrls.defenses}`,
        {
            headers: getAuthHeaders(),
            params: filters
        }
    );

    return response.data.data;
};


// =====================================================
// GET DEFENSE BY ID
// =====================================================

export const getDefenseScheduleById = async (
    id: number
): Promise<DefenseSchedule> => {

    const response = await api.get(
        `${pathUrls.defenses}/${id}`,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data.data;
};


// =====================================================
// UPDATE DEFENSE
// =====================================================

export const updateDefenseSchedule = async (
    id: number,
    data: UpdateDefenseScheduleData
) => {

    const response = await api.put(
        `${pathUrls.defenses}/${id}`,
        data,
        {
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            }
        }
    );

    return response.data;
};


// =====================================================
// UPLOAD / UPDATE DEFENSE DOCUMENT
// =====================================================

/**
 * Carrega ou substitui o documento PDF da defesa.
 *
 * Endpoint:
 * POST /api/defenses/schedules/:id/document
 *
 * Campo multipart:
 * tcc_document
 *
 * O mesmo endpoint pode ser utilizado para:
 * - primeiro carregamento do PDF;
 * - substituição/atualização do PDF.
 */
export const uploadDefenseDocument = async (
    scheduleId: number,
    file: File
): Promise<UploadDefenseDocumentResponse> => {

    const formData = new FormData();

    formData.append(
        'tcc_document',
        file
    );

    const response = await api.post(
        `${pathUrls.defenses}/${scheduleId}/document`,
        formData,
        {
            headers: {
                ...getAuthHeaders()
            }
        }
    );

    return response.data.data;
};


// =====================================================
// ADD JURY MEMBER
// =====================================================

export const addJuryMember = async (
    scheduleId: number,
    userId: number,
    roleInJury: JuryRole
) => {

    const response = await api.post(
        `${pathUrls.defenses}/${scheduleId}/jury`,
        {
            user_id: userId,
            role_in_jury: roleInJury
        },
        {
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            }
        }
    );

    return response.data;
};


// =====================================================
// REMOVE JURY MEMBER
// =====================================================

export const removeJuryMember = async (
    memberId: number
) => {

    const response = await api.delete(
        `${pathUrls.defenses}/jury/${memberId}`,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data;
};

// import api from '../api';

// =====================================================
// TYPES
// =====================================================
export type JuryRole2 =
    | 'PRESIDENTE'
    | 'ORIENTADOR'
    | 'OPONENTE'
    | string;

export interface DefenseStudent {
    id: number;
    name: string;
    email: string;
}

export interface DefenseTcc {
    notebook_id: number;
    title: string;
}

export interface DefenseSchedule2 {
    date: string;
    start_time: string;
    end_time: string;
    status: 'AGENDADO' | 'REALIZADO' | 'CANCELADO' | string;
}

export interface DefenseRoom2 {
    id: number;
    name: string;
    location: string | null;
    capacity: number;
}

export interface JuryMember2 {
    id: number;
    user_id: number;
    name: string;
    email: string;
    role: JuryRole2;
}

export interface ScheduledDefense {
    id: number;
    student: DefenseStudent;
    tcc: DefenseTcc;
    schedule: DefenseSchedule2;
    room: DefenseRoom2;
    jury: JuryMember2[];
}

export interface ScheduledDefensesResponse {
    success: boolean;
    total: number;
    data: ScheduledDefense[];
}

// =====================================================
// PARAMS
// =====================================================

export interface ScheduledDefenseParams {
    search?: string;
    defense_date?: string;
    student_id?: number;
}


// =====================================================
// SERVICE
// =====================================================

export const getScheduledDefenses = async (
    params?: ScheduledDefenseParams
): Promise<ScheduledDefensesResponse> => {
    const response = await api.get<ScheduledDefensesResponse>(
        `${pathUrls.scheduled}`,
        {
            params
        }
    );

    return response.data;
};

// import api from '../api'; -- 2

// =====================================================
// TYPES
// =====================================================

export type DefenseStatus2 =
    | 'AGENDADO'
    | 'REALIZADO'
    | 'CANCELADO';

export type JuryRole3 =
    | 'PRESIDENTE'
    | 'ORIENTADOR'
    | 'OPONENTE'
    | string;

export interface JuryMember3 {
    id: number;
    user_id: number;
    name: string;
    email: string;
    role: JuryRole3;
}

export interface StudentDefense {
    id: number;

    student: {
        id: number;
        name: string;
        email: string;
    };

    tcc: {
        notebook_id: number;
        title: string;
    };

    schedule: {
        date: string;
        start_time: string;
        end_time: string;
        status: DefenseStatus2;
    };

    room: {
        id: number;
        name: string;
        location: string | null;
        capacity: number;
    };

    document: {
        uploaded: boolean;
        url: string | null;
    };

    jury: JuryMember3[];
}

export interface MyDefenseResponse {
    success: boolean;
    message?: string;
    data: StudentDefense | null;
}

// =====================================================
// BUSCAR MINHA DEFESA
// =====================================================

export async function getMyDefense(): Promise<StudentDefense | null> {
    const response = await api.get<MyDefenseResponse>(
        '/defenses/my-defense'
    );

    return response.data.data;
}

// =====================================================
// SUBMETER VERSÃO FINAL
// =====================================================

export async function uploadDefenseDocument2(
    defenseId: number,
    file: File
) {
    const formData = new FormData();

    // formData.append('document', file);
    formData.append('tcc_document', file);

    const response = await api.post(
        `/defenses/schedules/${defenseId}/document`,
        formData
    );

    return response.data;
}