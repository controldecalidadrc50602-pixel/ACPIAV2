import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../services/supabaseClient';

interface AuthContextType {
    currentUser: User | null;
    login: (user: User) => void;
    logout: () => void;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                // Map Supabase user to App User
                const user: User = {
                    id: session.user.id,
                    name: session.user.user_metadata?.name || session.user.email || 'User',
                    email: session.user.email || '',
                    role: (session.user.user_metadata?.role as UserRole) || UserRole.CLIENT,
                    organizationId: session.user.user_metadata?.organizationId || 'RC506',
                    subscriptionTier: session.user.user_metadata?.subscriptionTier || 'FREE',
                    pin: 'N/A'
                };
                setCurrentUser(user);
            }
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                const user: User = {
                    id: session.user.id,
                    name: session.user.user_metadata?.name || session.user.email || 'User',
                    email: session.user.email || '',
                    role: (session.user.user_metadata?.role as UserRole) || UserRole.CLIENT,
                    organizationId: session.user.user_metadata?.organizationId || 'RC506',
                    subscriptionTier: session.user.user_metadata?.subscriptionTier || 'FREE',
                    pin: 'N/A'
                };
                setCurrentUser(user);
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (user: User) => {
        // This 'login' function was previously just setting state. 
        // With Supabase, login happens via supabase.auth.signInWithPassword in the Login component.
        // So we might need to expose a signOut function and maybe nothing else, 
        // or wrap the signIn functions here.
        // For backwards compatibility with the existing Login component (which connects to 'onLogin' prop),
        // we might need to adjust the Login component too.
        // But for now, let's keep the context providing the source of truth.
        console.warn("Legacy login called - Supabase handles auth state automatically.");
        setCurrentUser(user);
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
    };

    const isAdmin = currentUser?.role === UserRole.ADMIN;

    return (
        <AuthContext.Provider value={{ currentUser, login, logout, isAdmin }}>
            {!loading && children}
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
