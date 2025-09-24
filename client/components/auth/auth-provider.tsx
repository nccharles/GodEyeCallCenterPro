'use client';

import React, { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import { jwtDecode } from "jwt-decode";
import { CredentialResponse } from "@react-oauth/google";

// Types
export interface User {
    id: string;
    email: string;
    name: string;
    picture: string;
    tenantId: string;
    teamId: string;
    role: 'admin' | 'agent' | 'supervisor';
    isAvailable: boolean;
    onCall: boolean;
}

export interface Team {
    id: string;
    name: string;
    tenantId: string;
}

export interface Tenant {
    id: string;
    name: string;
    type: 'hospital' | 'bank';
    teams: Team[];
}

interface GoogleJWTPayload {
    iss: string;
    azp: string;
    aud: string;
    sub: string;
    email: string;
    email_verified: boolean;
    nbf: number;
    name: string;
    picture: string;
    given_name: string;
    family_name: string;
    iat: number;
    exp: number;
    jti: string;
}

// Auth State
interface AuthState {
    user: User | null;
    tenant: Tenant | null;
    team: Team | null;
    loading: boolean;
    error: string | null;
}

type AuthAction =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'LOGIN_SUCCESS'; payload: { user: User; tenant: Tenant; team: Team } }
    | { type: 'LOGOUT' }
    | { type: 'UPDATE_STATUS'; payload: { isAvailable: boolean; onCall: boolean } }
    | { type: 'SET_ERROR'; payload: string | null };

// Context
interface AuthContextType extends AuthState {
    login: (credentialResponse: CredentialResponse) => Promise<void>;
    logout: () => void;
    updateStatus: (isAvailable: boolean, onCall: boolean) => Promise<void>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Constants
const STORAGE_KEY = 'auth_user';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// API Response Types
interface APIUser {
    id: string;
    email: string;
    tenantId: string;
    teamId: string;
    role: 'admin' | 'agent' | 'supervisor';
    isAvailable: boolean;
    onCall: boolean;
}

interface APITenant {
    id: string;
    name: string;
    type: 'hospital' | 'bank';
    teams: Team[];
}

// Fallback data for development/testing
const FALLBACK_TENANTS: Tenant[] = [
    {
        id: '1',
        name: 'Metro Hospital',
        type: 'hospital',
        teams: [
            { id: '1', name: 'Emergency', tenantId: '1' },
            { id: '2', name: 'Pharmacy', tenantId: '1' },
            { id: '3', name: 'Billing', tenantId: '1' }
        ]
    },
    {
        id: '2',
        name: 'First National Bank',
        type: 'bank',
        teams: [
            { id: '4', name: 'Account Services', tenantId: '2' },
            { id: '5', name: 'Loan Department', tenantId: '2' },
            { id: '6', name: 'Fraud Department', tenantId: '2' }
        ]
    }
];

const FALLBACK_USERS: User[] = [
    {
        id: '1',
        email: 'nccharles1@gmail.com',
        name: 'Charles NC',
        picture: 'https://lh3.googleusercontent.com/a/ACg8ocIaJou3YMQS4Qu6xMQR5ZB5d9EChpd7D5D9-cHyescOq0iJ-wU=s96-c',
        tenantId: '1',
        teamId: '1',
        role: 'agent',
        isAvailable: true,
        onCall: false
    },
    {
        id: '2',
        email: 'john@hospital.com',
        name: 'John Smith',
        picture: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?w=100&h=100&fit=crop',
        tenantId: '1',
        teamId: '2',
        role: 'supervisor',
        isAvailable: true,
        onCall: false
    }
];

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload, error: null };

        case 'LOGIN_SUCCESS':
            return {
                ...state,
                user: action.payload.user,
                tenant: action.payload.tenant,
                team: action.payload.team,
                loading: false,
                error: null
            };

        case 'LOGOUT':
            return {
                user: null,
                tenant: null,
                team: null,
                loading: false,
                error: null
            };

        case 'UPDATE_STATUS':
            if (!state.user) return state;
            return {
                ...state,
                user: {
                    ...state.user,
                    isAvailable: action.payload.isAvailable,
                    onCall: action.payload.onCall
                }
            };

        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false };

        default:
            return state;
    }
}

// Initial state
const initialState: AuthState = {
    user: null,
    tenant: null,
    team: null,
    loading: true,
    error: null
};

// Utilities
class AuthStorage {
    static save(user: User): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        } catch (error) {
            console.error('Failed to save user to localStorage:', error);
        }
    }

    static load(): User | null {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.error('Failed to load user from localStorage:', error);
            return null;
        }
    }

    static remove(): void {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error('Failed to remove user from localStorage:', error);
        }
    }
}

class AuthService {
    private static useFallback = process.env.NODE_ENV === 'development';

    static async authenticateUser(googlePayload: GoogleJWTPayload): Promise<{ user: User; tenant: Tenant; team: Team }> {
        if (this.useFallback) {
            return this.handleFallbackAuth(googlePayload);
        }

        try {
            // Real API authentication
            const response = await fetch(`${API_BASE_URL}/auth/google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    googleId: googlePayload.sub,
                    email: googlePayload.email,
                    name: googlePayload.name,
                    picture: googlePayload.picture,
                    givenName: googlePayload.given_name,
                    familyName: googlePayload.family_name
                })
            });

            if (!response.ok) {
                throw new Error(`Authentication failed: ${response.statusText}`);
            }

            const data = await response.json();
            return this.processAuthResponse(data, googlePayload);

        } catch (error) {
            console.warn('API authentication failed, falling back to mock data:', error);
            return this.handleFallbackAuth(googlePayload);
        }
    }

    private static async handleFallbackAuth(googlePayload: GoogleJWTPayload): Promise<{ user: User; tenant: Tenant; team: Team }> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Try to find existing user or create new one with Google data
        let user = FALLBACK_USERS.find(u => u.email === googlePayload.email);

        if (!user) {
            // Create new user with Google data merged into default structure
            user = {
                id: googlePayload.sub,
                email: googlePayload.email,
                name: googlePayload.name,
                picture: googlePayload.picture,
                tenantId: '1', // Default tenant
                teamId: '1',   // Default team
                role: 'agent', // Default role
                isAvailable: true,
                onCall: false
            };
        } else {
            // Update existing user with fresh Google data
            user = {
                ...user,
                name: googlePayload.name,
                picture: googlePayload.picture
            };
        }

        const tenant = this.findTenantById(user.tenantId);
        if (!tenant) {
            throw new Error('Invalid tenant configuration');
        }

        const team = this.findTeamById(tenant, user.teamId);
        if (!team) {
            throw new Error('Invalid team configuration');
        }

        return { user, tenant, team };
    }

    private static processAuthResponse(apiData: any, googlePayload: GoogleJWTPayload): { user: User; tenant: Tenant; team: Team } {
        // Merge API user data with Google profile data
        const user: User = {
            id: apiData.user.id,
            email: googlePayload.email,
            name: googlePayload.name,
            picture: googlePayload.picture,
            tenantId: apiData.user.tenantId,
            teamId: apiData.user.teamId,
            role: apiData.user.role,
            isAvailable: apiData.user.isAvailable,
            onCall: apiData.user.onCall
        };

        const tenant: Tenant = {
            id: apiData.tenant.id,
            name: apiData.tenant.name,
            type: apiData.tenant.type,
            teams: apiData.tenant.teams
        };

        const team = tenant.teams.find(t => t.id === user.teamId);
        if (!team) {
            throw new Error('User team not found in tenant');
        }

        return { user, tenant, team };
    }

    static async updateUserStatus(userId: string, isAvailable: boolean, onCall: boolean): Promise<void> {
        if (this.useFallback) {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isAvailable, onCall })
            });

            if (!response.ok) {
                throw new Error('Failed to update user status');
            }
        } catch (error) {
            console.error('Failed to update user status:', error);
            // Don't throw here - allow local state to update even if API fails
        }
    }

    static findTenantById(tenantId: string): Tenant | undefined {
        return FALLBACK_TENANTS.find(tenant => tenant.id === tenantId);
    }

    static findTeamById(tenant: Tenant, teamId: string): Team | undefined {
        return tenant.teams.find(team => team.id === teamId);
    }

    static decodeGoogleJWT(credential: string): GoogleJWTPayload {
        return jwtDecode<GoogleJWTPayload>(credential);
    }

    static validateGoogleToken(payload: GoogleJWTPayload): boolean {
        // Check if token is expired
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp < now) {
            return false;
        }

        // Check if email is verified
        if (!payload.email_verified) {
            return false;
        }

        // Add any other validation logic here
        return true;
    }
}

// Provider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Initialize auth state
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const savedUser = AuthStorage.load();

                if (savedUser) {
                    const tenant = AuthService.findTenantById(savedUser.tenantId);
                    const team = tenant ? AuthService.findTeamById(tenant, savedUser.teamId) : undefined;

                    if (tenant && team) {
                        dispatch({
                            type: 'LOGIN_SUCCESS',
                            payload: { user: savedUser, tenant, team }
                        });
                    } else {
                        // Invalid saved data, clear it
                        AuthStorage.remove();
                        dispatch({ type: 'SET_LOADING', payload: false });
                    }
                } else {
                    dispatch({ type: 'SET_LOADING', payload: false });
                }
            } catch (error) {
                console.error('Failed to initialize auth:', error);
                dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize authentication' });
            }
        };

        initializeAuth();
    }, []);

    // Login function
    const login = useCallback(async (credentialResponse: CredentialResponse) => {
        if (!credentialResponse.credential) {
            dispatch({ type: 'SET_ERROR', payload: 'No credential received' });
            return;
        }

        try {
            dispatch({ type: 'SET_LOADING', payload: true });

            const googlePayload = AuthService.decodeGoogleJWT(credentialResponse.credential);
            console.log("Google JWT Payload:", googlePayload);

            // Validate the Google token
            if (!AuthService.validateGoogleToken(googlePayload)) {
                dispatch({ type: 'SET_ERROR', payload: 'Invalid or expired Google token' });
                return;
            }

            // Authenticate user (API call or fallback)
            const { user, tenant, team } = await AuthService.authenticateUser(googlePayload);

            AuthStorage.save(user);

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: { user, tenant, team }
            });

        } catch (error) {
            console.error('Login failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
            dispatch({ type: 'SET_ERROR', payload: errorMessage });
        }
    }, []);

    // Logout function
    const logout = useCallback(() => {
        AuthStorage.remove();
        dispatch({ type: 'LOGOUT' });
    }, []);

    // Update status function
    const updateStatus = useCallback(async (isAvailable: boolean, onCall: boolean) => {
        if (!state.user) return;

        try {
            // Update API
            await AuthService.updateUserStatus(state.user.id, isAvailable, onCall);

            // Update local state
            dispatch({ type: 'UPDATE_STATUS', payload: { isAvailable, onCall } });

            // Update localStorage
            const updatedUser = { ...state.user, isAvailable, onCall };
            AuthStorage.save(updatedUser);

        } catch (error) {
            console.error('Failed to update status:', error);
            // Still update local state even if API fails
            dispatch({ type: 'UPDATE_STATUS', payload: { isAvailable, onCall } });
            const updatedUser = { ...state.user, isAvailable, onCall };
            AuthStorage.save(updatedUser);
        }
    }, [state.user]);

    // Clear error function
    const clearError = useCallback(() => {
        dispatch({ type: 'SET_ERROR', payload: null });
    }, []);

    const contextValue: AuthContextType = {
        ...state,
        login,
        logout,
        updateStatus,
        clearError
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
