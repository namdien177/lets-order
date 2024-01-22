import { useAuth } from "@clerk/nextjs";
import { type KyInstance } from "ky";
import { useCallback, useMemo } from "react";

const useAuthKy = (ky: KyInstance) => {
    const auth = useAuth();
    
    const getKy = useCallback(async () => {
        const token = await auth.getToken();
        return ky.extend({
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
    }, [auth, ky]);

    return getKy
}

export default useAuthKy;
