import { createCategory, CreateCategoryData } from "@/app/api/categoria/categoryService";
import { useState } from "react";

export const useCreateCategory = () => {
  const [loadingCategory, setloadingRole] = useState(false);
  const [errorCategory, seterrorRole] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const addCategory = async (data: CreateCategoryData) => {
    setloadingRole(true);
    seterrorRole(null);
    setSuccess(false);

    try {
      await createCategory(data);
      setSuccess(true);
    } catch (err: any) {
      seterrorRole(err.response?.data?.errors || "Erro ao criar categoria");
    } finally {
      setloadingRole(false);
    }
  };

  return { addCategory, loadingCategory, errorCategory, success };

  // return true
};
