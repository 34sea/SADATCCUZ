import api from "../api";
import pathUrls from "../pathApi";

export interface LoginData {
  email: string;
  password: string;
}

export const login = async (data: LoginData) => {
  const response = await api.post(pathUrls.login, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.data;
};

export function getUserFromStorage() {
  try {
    const data = localStorage.getItem("user-dashboard-SADA-TCC");
    console.log(`Dados: ${data}`)
    // Valida se o item não existe ou se foi salvo como string "null"/"undefined"
    if (!data || data === "undefined" || data === "null") return null;

    // Se já for um objeto por algum motivo, retorna diretamente
    if (typeof data === "object") return data;

    const parsed = JSON.parse(data);

    if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
      return parsed;
    }

    return null;
  } catch (error) {
    console.error("Erro ao recuperar usuário do localStorage:", error);
    return null;
  }
}


// export function getUserFromStorage() {

//   try {
//     const data = localStorage.getItem("user-dashboard-SADA-TCC");

//     if (!data) return null;
//     const parsed = typeof data === "string" ? JSON.parse(data) : data;

//     if (
//       parsed &&
//       Object.keys(parsed).length > 0 &&
//       parsed !== "null" &&
//       parsed !== "undefined"
//     ) {
//       return parsed;
//     }

//     return null;
//   } catch (error) {
//     console.error("Erro ao recuperar usuário do localStorage:", error);
//     return null;
//   }
// }
