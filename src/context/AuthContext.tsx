import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import type { ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { authService } from "../services/auth.service";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;

    signup: (email: string, password: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;

    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface Props {
    children: ReactNode;
}

export function AuthProvider({ children }: Props) {
    const [user, setUser] = useState<User | null>(null);

    const [session, setSession] = useState<Session | null>(null);

    const [loading, setLoading] = useState(true);

    const refreshUser = async () => {
        try {

            const currentSession = await authService.getSession();

            setSession(currentSession);
            setUser(currentSession?.user ?? null);
        } catch (error) {
            console.error(error);

            setUser(null);

            setSession(null);
        }
    };

    useEffect(() => {
        let mounted = true;

        const initialize = async () => {
            try {
                const currentSession = await authService.getSession();

                if (!mounted) return;

                setSession(currentSession);
                setUser(currentSession?.user ?? null);

            } catch (err) {
                console.error(err);
                setSession(null);
                setUser(null);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        initialize();

        const {
            data: { subscription },
        } = authService.onAuthStateChange(async (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => {
            mounted = false;

            subscription.unsubscribe();
        };
    }, []);

    const signup = async (email: string, password: string) => {
        setLoading(true);

        try {
            await authService.signup(email, password);

            await refreshUser();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        setLoading(true);

        try {
            await authService.login(email, password);

            await refreshUser();
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);

        try {
            await authService.logout();

            setUser(null);

            setSession(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                loading,
                signup,
                login,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}