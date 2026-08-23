import { getServices } from "@/app/api/services/productsService";
import { useCallback, useEffect, useState } from "react";

export const useService = () => {
  const [service, setService] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   setLoading(true);
  //   getService()
  //     .then((res) => setService(res.data.data))
  //     .catch((err) => setError(err.response?.data?.message || "Erro ao carregar role"))
  //     .finally(() => setLoading(false));
  // }, []);

  const fetchService = useCallback(() => {
        setLoading(true);
        return getServices()
          .then((res) => setService(res))
          .catch((err) =>
            setError(err.response?.data?.message || "Erro ao carregar users")
          )
          .finally(() => setLoading(false));
      }, []);
    
      useEffect(() => {
        fetchService();
      }, [fetchService]);

  return { service, loading, error, refetchService: fetchService };
};
