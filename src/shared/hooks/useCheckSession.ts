import { auth } from "@/core/auth/auth";

export const checkSession = async () => {
    const session = await auth();
    if (!session) throw new Error('Unauthorized')
    return session
}