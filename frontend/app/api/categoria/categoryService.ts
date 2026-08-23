import api from "../api";



export interface CreateCategoryData {
  id: string;
  nome: string;
  icon_category: string;
}

export interface UpdateRoleData {
  name: string;
  permission_ids: number[]
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
  pivot: {
    permission_id: number;
    role_id: number;
  };
}


export const getCategory = async () => {
  const response = await api.get(`/api/read/list_categoria/`);
  return response.data;
};

export const createCategory = async (data: CreateCategoryData) => {
  const response = await api.post(`/api/register/categoria/`, data);
  return response.data;
};


// export const updateRole = async (id: number, data: UpdateRoleData) => {
//   const response = await api.put(`${path.role}/${id}`, data);
//   return response.data;
// };

// export const deleteRole = async (id: number) => {
//   const response = await api.delete(`${path.role}/${id}`);
//   return response.data;
// };