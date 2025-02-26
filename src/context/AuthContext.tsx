'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AuthContextType, LoginCredentials } from '@/types/auth';
import Cookies from 'js-cookie';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        // Sayfa yüklendiğinde cookie'den token'ı al
        const savedToken = Cookies.get('token');
        if (savedToken) {
            setToken(savedToken);
        }
    }, []);

    const login = async (credentials: LoginCredentials) => {
        try {
            const response = await fetch('http://localhost:88/auth/authenticate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                throw new Error('Giriş başarısız');
            }

            const data = await response.json();
            // Token'ı hem state'e hem cookie'ye kaydet
            Cookies.set('token', data.token, { expires: 7 }); // 7 günlük cookie
            setToken(data.token);
        } catch (error) {
            console.error('Giriş hatası:', error);
            throw error;
        }
    };

    const logout = () => {
        // Token'ı hem state'den hem cookie'den sil
        Cookies.remove('token');
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{
            token,
            login,
            logout,
            isAuthenticated: !!token,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
} 