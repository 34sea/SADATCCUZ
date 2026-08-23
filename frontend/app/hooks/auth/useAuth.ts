import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, LoginData } from "@/app/api/auth/authService";

export const useAuth = () => {
    console.log('Call')

    const navigation = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);

    const authenticate = async (data: LoginData) => {
        setLoading(true);
        setError(null);
        try {
            console.log("aqui")
            const result = await login(data);
            console.log(result.user)

            setToken(result.access_token);

            localStorage.setItem("token-dashboard-SADA-TCC", result);

            localStorage.setItem(
                "user-dashboard-SADA-TCC",
                JSON.stringify(result)
            );
            // console.log("IR")
            navigation.push('/dash')


            return result;
        } catch (err: any) {
            console.log("Erro")
            console.log(err)
            setError(err.response?.data?.message || "Erro ao autenticar");
        } finally {
            setLoading(false);
        }
    };

    return { authenticate, loading, error, token };
};
