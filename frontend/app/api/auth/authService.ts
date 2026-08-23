import api from "../api";

export interface LoginData {
  username: string;
  password: string;
}

export const login = async (data: LoginData) => {
  const response = await api.post("/auth/jwt/login", data, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return response.data;
};


export function getUserFromStorage() {

  try {
    const data = localStorage.getItem("user-dashboard-SADA-TCC");

    if (!data) return null;
    const parsed = typeof data === "string" ? JSON.parse(data) : data;

    if (
      parsed &&
      Object.keys(parsed).length > 0 &&
      parsed !== "null" &&
      parsed !== "undefined"
    ) {
      return parsed;
    }

    return null;
  } catch (error) {
    console.error("Erro ao recuperar usuário do localStorage:", error);
    return null;
  }
}
