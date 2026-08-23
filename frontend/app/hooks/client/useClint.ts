import { getClients } from "@/app/api/client/clientService";
import { useCallback, useEffect, useState } from "react";

export const useClint = () => {
  const [client, setClint] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   setLoading(true);
  //   getClint()
  //     .then((res) => setClint(res.data.data))
  //     .catch((err) => setError(err.response?.data?.message || "Erro ao carregar role"))
  //     .finally(() => setLoading(false));
  // }, []);

  const fetchClint = useCallback(() => {
        setLoading(true);
        return getClients()
          .then((res) => setClint(res))
          .catch((err) =>
            setError(err.response?.data?.message || "Erro ao carregar users")
          )
          .finally(() => setLoading(false));
      }, []);
    
      useEffect(() => {
        fetchClint();
      }, [fetchClint]);

  return { client, loading, error, refetchClint: fetchClint };
};
