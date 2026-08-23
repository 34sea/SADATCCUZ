import api from "../api";



export interface CreateRoleData {
  name: string;
  guard_name: string;
  permission_ids: number[]
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


export const getClients = async () => {
  const response = await api.get(`/api/read/list_users/`);
  return response.data;
};

// export const createRole = async (data: CreateRoleData) => {
//   const response = await api.post(`${path.role}`, data);
//   return response.data;
// };


// export const updateRole = async (id: number, data: UpdateRoleData) => {
//   const response = await api.put(`${path.role}/${id}`, data);
//   return response.data;
// };

// export const deleteRole = async (id: number) => {
//   const response = await api.delete(`${path.role}/${id}`);
//   return response.data;
// };