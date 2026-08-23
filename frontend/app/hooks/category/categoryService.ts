import { getCategory } from "@/app/api/categoria/categoryService";
import { useCallback, useEffect, useState } from "react";

export const useCategory = () => {
  const [Category, setCategory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   setLoading(true);
  //   getCategory()
  //     .then((res) => setCategory(res.data.data))
  //     .catch((err) => setError(err.response?.data?.message || "Erro ao carregar role"))
  //     .finally(() => setLoading(false));
  // }, []);

  const fetchCategory = useCallback(() => {
        setLoading(true);
        return getCategory()
          .then((res) => setCategory(res))
          .catch((err) =>
            setError(err.response?.data?.message || "Erro ao carregar users")
          )
          .finally(() => setLoading(false));
      }, []);
    
      useEffect(() => {
        fetchCategory();
      }, [fetchCategory]);

  return { Category, loading, error, refetchCategory: fetchCategory };
};
