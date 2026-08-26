import api from '../api';
import pathUrls from '../pathApi';
import { getUserFromStorage } from '../auth/authService';

// =====================================================
// TYPES
// =====================================================

export interface GuidanceNotebook {
    id: number;

    student_id: number;
    advisor_id: number;
    pre_project_id: number;

    student_name?: string;
    student_email?: string;

    advisor_name?: string;

    pre_project_title?: string;
    pre_project_status?: string;
    pre_project_thematic_area?: string;

    created_at?: string;
    updated_at?: string;

    sessions?: GuidanceSession[];
    tasks?: GuidanceTask[];
    declarations?: GuidanceDeclaration[];

    blocks?: GuidanceBlock[];

    department_verifications?: DepartmentVerification[];
}


// =====================================================
// SESSION
// =====================================================

export interface GuidanceSession {
    id: number;

    notebook_id: number;

    session_date: string;

    advisor_notes?: string | null;

    created_at?: string;

    evaluations?: SessionEvaluation[];
}


// =====================================================
// SESSION EVALUATION
// =====================================================

export interface SessionEvaluation {
    id?: number;

    indicator_id: number;

    indicator_name?: string;

    status:
        | 'CUMPRIDO'
        | 'CUMPRIDO_PARCIALMENTE'
        | 'NAO_CUMPRIDO';

    observations?: string | null;
}


// =====================================================
// TASK
// =====================================================

export interface GuidanceTask {
    id: number;

    notebook_id: number;

    session_id?: number | null;

    title: string;

    description?: string | null;

    deadline?: string | null;

    status:
        | 'PENDENTE'
        | 'EM_PROGRESSO'
        | 'ENTREGUE'
        | 'CONCLUIDA';

    created_at?: string;

    updated_at?: string;
}


// =====================================================
// DECLARATION
// =====================================================

export interface GuidanceDeclaration {
    id: number;

    notebook_id: number;

    declaration_type:
        | 'ADVISOR'
        | 'STUDENT';

    document_url?: string;

    created_at?: string;
}


// =====================================================
// BLOCK
// =====================================================

export interface GuidanceBlock {
    id: number;

    name: string;

    description?: string;

    indicators?: GuidanceIndicator[];
}


// =====================================================
// INDICATOR
// =====================================================

export interface GuidanceIndicator {
    id: number;

    block_id: number;

    name: string;

    description?: string;
}


// =====================================================
// DEPARTMENT VERIFICATION
// =====================================================

export interface DepartmentVerification {
    id: number;

    notebook_id: number;

    verification_type:
        | 'INTERMEDIA'
        | 'FINAL';

    status:
        | 'APROVADO'
        | 'REPROVADO'
        | 'PENDENTE';

    comments?: string | null;

    created_at?: string;
}


// =====================================================
// CREATE NOTEBOOK
// =====================================================

export interface CreateNotebookData {
    student_id: number;
    advisor_id: number;
    pre_project_id: number;
}


// =====================================================
// CREATE SESSION
// =====================================================

export interface CreateSessionData {
    notebook_id: number;

    session_date: string;

    advisor_notes?: string;

    evaluations?: {
        indicator_id: number;

        status:
            | 'CUMPRIDO'
            | 'CUMPRIDO_PARCIALMENTE'
            | 'NAO_CUMPRIDO';

        observations?: string;
    }[];
}


// =====================================================
// CREATE TASK
// =====================================================

export interface CreateTaskData {
    notebook_id: number;

    session_id?: number;

    title: string;

    description?: string;

    deadline?: string;
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
// CURRENT USER
// =====================================================

export const getCurrentUserId = (): number | null => {

    const userData = getUserFromStorage();

    return userData?.data?.user?.id || null;
};


// =====================================================
// CREATE NOTEBOOK
// =====================================================

export const createNotebook = async (
    data: CreateNotebookData
): Promise<GuidanceNotebook> => {

    const response = await api.post(
        pathUrls.guidanceNotebooks,
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
// GET NOTEBOOK BY ID
// =====================================================

export const getNotebookById = async (
    id: number
): Promise<GuidanceNotebook> => {

    const response = await api.get(
        `${pathUrls.guidanceNotebooks}/${id}`,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data.data;
};


// =====================================================
// GET BLOCKS
// =====================================================

export const getBlocksWithIndicators = async (): Promise<
    GuidanceBlock[]
> => {

    const response = await api.get(
        `${pathUrls.guidanceNotebooks}/blocks`,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data.data;
};


// =====================================================
// CREATE SESSION
// =====================================================

export const createSession = async (
    data: CreateSessionData
) => {

    const response = await api.post(
        `${pathUrls.guidanceNotebooks}/sessions`,
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
// GET SESSION
// =====================================================

export const getSessionById = async (
    sessionId: number
): Promise<GuidanceSession> => {

    const response = await api.get(
        `${pathUrls.guidanceNotebooks}/sessions/${sessionId}`,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data.data;
};


// =====================================================
// CREATE TASK
// =====================================================

export const createTask = async (
    data: CreateTaskData
) => {

    const response = await api.post(
        `${pathUrls.guidanceNotebooks}/tasks`,
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
// UPDATE TASK STATUS
// =====================================================

export const updateTaskStatus = async (
    taskId: number,
    status:
        | 'PENDENTE'
        | 'EM_PROGRESSO'
        | 'ENTREGUE'
        | 'CONCLUIDA'
) => {

    const response = await api.put(
        `${pathUrls.guidanceNotebooks}/tasks/${taskId}/status`,
        {
            status
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
// UPLOAD DECLARATION
// =====================================================

export const uploadDeclaration = async (
    notebookId: number,
    file: File,
    declarationType: 'ADVISOR' | 'STUDENT'
) => {

    const formData = new FormData();

    formData.append(
        'declaration',
        file
    );

    formData.append(
        'declaration_type',
        declarationType
    );

    const response = await api.post(
        `${pathUrls.guidanceNotebooks}/${notebookId}/declarations`,
        formData,
        {
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'multipart/form-data'
            }
        }
    );

    return response.data;
};


// =====================================================
// DEPARTMENT VERIFICATION
// =====================================================

export const verifyByDepartment = async (
    notebookId: number,
    verificationType:
        | 'INTERMEDIA'
        | 'FINAL',
    status:
        | 'APROVADO'
        | 'REPROVADO'
        | 'PENDENTE',
    comments?: string
) => {

    const response = await api.post(
        `${pathUrls.guidanceNotebooks}/${notebookId}/department-verifications`,
        {
            verification_type: verificationType,
            status,
            comments
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
// GET NOTEBOOKS DO ORIENTADOR
// =====================================================

export const getMyNotebooks = async (): Promise<GuidanceNotebook[]> => {

    const response = await api.get(
        pathUrls.guidanceNotebooks,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data.data;
};

