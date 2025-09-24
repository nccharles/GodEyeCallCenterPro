import { createContext, useCallback, useState, ReactNode } from "react";
import { baseUrl, postRequest } from "@/utils/service";
import { jwtDecode } from "jwt-decode";

// ----------------------
// Types
// ----------------------
interface User {
    id: string;
    email: string;
    picture?: string;
    first_name?: string;
    last_name?: string;
    token?: string; // in case backend returns one
    [key: string]: any; // allow extension if backend sends more
}

interface AuthContextType {
    user: User | null;
    userGoogleLogin: (credentialResponse: { credential: string }) => void;
    logoutUser: () => void;
}

interface AuthProviderProps {
    children: ReactNode;
}

// ----------------------
// Context
// ----------------------
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ----------------------
// Provider
// ----------------------
export const AuthContextProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? (JSON.parse(storedUser) as User) : null;
    });

    const loginUser = useCallback(async (userInfo: any) => {
        try {
            const payload: User = {
                id: userInfo?.sub,
                email: userInfo?.email,
                picture: userInfo?.picture,
                first_name: userInfo?.given_name,
                last_name: userInfo?.family_name,
            };

            const response = await postRequest(`${baseUrl}/users/login`, JSON.stringify(payload));

            if ((response as any)?.error) {
                console.error("Login error:", (response as any).error);
                return;
            }

            localStorage.setItem("user", JSON.stringify(response));
            setUser(response as User);
            console.log("Logged in successfully");
        } catch (error) {
            console.error("Login failed:", error);
        }
    }, []);

    const userGoogleLogin = useCallback(
        (credentialResponse: { credential: string }) => {
            if (credentialResponse?.credential) {
                const decodedUser = jwtDecode<any>(credentialResponse.credential);
                loginUser(decodedUser);
            } else {
                console.error("Invalid Google credential response");
            }
        },
        [loginUser]
    );

    const logoutUser = useCallback(() => {
        console.log("Logging out...");
        localStorage.removeItem("user");
        sessionStorage.clear();
        setUser(null);
        window.location.reload();
    }, []);

    return (
        <AuthContext.Provider value={{ user, userGoogleLogin, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
};
