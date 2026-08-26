import api from '../api';
import pathUrls from '../pathApi';
import { getUserFromStorage } from '../auth/authService';

// =====================================================
// TYPES
// =====================================================

export interface PreProject {
    id: number;
    student_id: number;
    title: string;
    thematic_area: string;
    proposed_advisor_id?: number | null;
    proposed_advisor_name?: string | null;
    abstract: string;
    document_url: string;
    version: number;
    status: string;
    final_decision?: string | null;
    created_at?: string;
    updated_at?: string;

    student_name?: string;
    student_email?: string;

    evaluators?: PreProjectEvaluator[];
    status_history?: StatusHistory[];
}

export interface EvaluationSummary {
    total_evaluators: number;
    completed_evaluations: number;
    pending_evaluations: number;
    all_evaluated: boolean;
}

export interface PreProject2 {
    id: number;
    student_id: number;
    title: string;
    thematic_area: string;

    proposed_advisor_id?: number | null;
    proposed_advisor_name?: string | null;

    abstract: string;
    document_url: string;

    version: number;
    status: string;

    final_decision?: string | null;

    created_at?: string;
    updated_at?: string;

    student_name?: string;
    student_email?: string;

    // ==========================================
    // ACOMPANHAMENTO DO ESTUDANTE
    // ==========================================

    submission_date?: string | null;

    decision_date?: string | null;

    decision_comments?: string | null;

    evaluation_summary?: EvaluationSummary;

    evaluators?: PreProjectEvaluator[];

    status_history?: StatusHistory[];
}

export interface PreProjectEvaluator {
    evaluator_assignment_id: number;
    evaluator_id: number;
    evaluator_name: string;
    assigned_at?: string;
    assigned_by_name?: string;

    review_id?: number | null;
    score?: number | null;
    opinion?: string | null;
    observations?: string | null;
    submitted_at?: string | null;
}

export interface StatusHistory {
    id: number;
    pre_project_id: number;
    previous_status?: string | null;
    new_status: string;
    changed_by: number;
    changed_by_name?: string;
    comments?: string | null;
    created_at?: string;
}

export interface PreProjectFilters {
    status?: string;
    student_id?: number;
    advisor_id?: number;
}

export interface AssignEvaluatorsData {
    evaluator_ids: number[];
}

export interface FinalizeDecisionData {
    final_decision: 'APROVADO' | 'REPROVADO' | 'EM_REVISAO';
    comments?: string;
}

// =====================================================
// AUTH HEADERS
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
// GET PRE-PROJECTS
// =====================================================

export const getPreProjects = async (
    filters?: PreProjectFilters
): Promise<PreProject[]> => {

    const params: Record<string, any> = {};

    if (filters?.status) {
        params.status = filters.status;
    }

    if (filters?.student_id) {
        params.student_id = filters.student_id;
    }

    if (filters?.advisor_id) {
        params.advisor_id = filters.advisor_id;
    }

    const response = await api.get(
        pathUrls.preProjects,
        {
            params,
            headers: getAuthHeaders()
        }
    );

    return response.data.data;
};

// =====================================================
// GET PRE-PROJECT BY ID
// =====================================================

export const getPreProjectById = async (
    id: number
): Promise<PreProject> => {

    const response = await api.get(
        `${pathUrls.preProjects}/${id}`,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data.data;
};

// =====================================================
// SUBMIT PRE-PROJECT
// =====================================================

export interface SubmitPreProjectData {
    title: string;
    thematic_area: string;
    proposed_advisor_id?: number | null;
    abstract: string;
    document: File;
}

export const submitPreProject = async (
    data: SubmitPreProjectData
) => {

    const formData = new FormData();

    formData.append('title', data.title);
    formData.append('thematic_area', data.thematic_area);
    formData.append(
        'proposed_advisor_id',
        data.proposed_advisor_id
            ? String(data.proposed_advisor_id)
            : ''
    );
    formData.append('abstract', data.abstract);
    formData.append('document', data.document);

    const response = await api.post(
        pathUrls.preProjects,
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
// ASSIGN EVALUATORS
// =====================================================

export const assignEvaluators = async (
    preProjectId: number,
    evaluatorIds: number[]
) => {

    const response = await api.post(
        `${pathUrls.preProjects}/${preProjectId}/assign-evaluators`,
        {
            evaluator_ids: evaluatorIds
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
// SUBMIT REVIEW
// =====================================================

export interface SubmitReviewData {
    evaluator_assignment_id: number;
    score?: number | null;
    opinion:
        | 'FAVORAVEL'
        | 'FAVORAVEL_COM_RECOMENDACOES'
        | 'DESFAVORAVEL';
    observations?: string | null;
}

export const submitReview = async (
    data: SubmitReviewData
) => {

    const response = await api.post(
        `${pathUrls.preProjects}/reviews`,
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
// FINALIZE DECISION
// =====================================================

export const finalizeDecision = async (
    preProjectId: number,
    data: FinalizeDecisionData
) => {

    const response = await api.put(
        `${pathUrls.preProjects}/${preProjectId}/decision`,
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
// RESUBMIT
// =====================================================

export interface ResubmitPreProjectData {
    title?: string;
    thematic_area?: string;
    proposed_advisor_id?: number | null;
    abstract?: string;
    comments?: string;
    document?: File | null;
}

export const resubmitPreProject = async (
    id: number,
    data: ResubmitPreProjectData
) => {

    const formData = new FormData();

    if (data.title) {
        formData.append('title', data.title);
    }

    if (data.thematic_area) {
        formData.append(
            'thematic_area',
            data.thematic_area
        );
    }

    if (data.proposed_advisor_id) {
        formData.append(
            'proposed_advisor_id',
            String(data.proposed_advisor_id)
        );
    }

    if (data.abstract) {
        formData.append(
            'abstract',
            data.abstract
        );
    }

    if (data.comments) {
        formData.append(
            'comments',
            data.comments
        );
    }

    if (data.document) {
        formData.append(
            'document',
            data.document
        );
    }

    const response = await api.put(
        `${pathUrls.preProjects}/${id}/resubmit`,
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

// export const getMyAssignedPreProjects = async (): Promise<PreProject[]> => {
//     const userData = getUserFromStorage();

//     const userId = userData?.data?.user?.id;

//     if (!userId) {
//         throw new Error(
//             'Utilizador autenticado não encontrado.'
//         );
//     }

//     const projects = await getPreProjects();

//     return projects.filter(project =>
//         project.evaluators?.some(
//             evaluator =>
//                 evaluator.evaluator_id === userId
//         )
//     );
// };


// =====================================================
// GET MY EVALUATIONS
// =====================================================

export interface MyEvaluationFilters {
    status?: string;
}

export const getMyAssignedPreProjects = async (
    filters?: MyEvaluationFilters
): Promise<PreProject[]> => {

    const params: Record<string, any> = {};

    if (filters?.status) {
        params.status = filters.status;
    }

    const response = await api.get(
        `${pathUrls.preProjects}/my-evaluations`,
        {
            params,
            headers: getAuthHeaders()
        }
    );

    return response.data.data;
};

// =====================================================
// GET MY PRE-PROJECT STATUS
// =====================================================

export const getMyPreProject = async (): Promise<PreProject2 | null> => {

    const response = await api.get(
        `${pathUrls.preProjects}/my-status`,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data.data;
};