import { useAuth } from "@clerk/nextjs";
import { type KyInstance } from "ky";
import { useCallback } from "react";

const useAuthKy = (ky: KyInstance) => {
  const auth = useAuth();

  const getKy = useCallback(async () => {
    const token = await auth.getToken();
    return ky.extend({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }, [auth, ky]);

  return getKy;
};

export default useAuthKy;
