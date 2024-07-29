import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    userRole: string | null;
    login: (token: string, userId: string, role: string) => void;
    logout: () => void;
}

interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        if (token) {
            setIsAuthenticated(true);
            setUserRole(role);
        }
    }, []);

    const login = (token: string, userId: string, role: string) => {
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        localStorage.setItem('role', role);
        setIsAuthenticated(true);
        setUserRole(role);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('role');
        setIsAuthenticated(false);
        setUserRole(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, userRole, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
