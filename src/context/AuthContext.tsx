import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, UserRole, SubscriptionTier } from '../types';
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

    const enrichUser = (supabaseUser: any): User => {
        const email = supabaseUser.email || '';
        const isRC506 = email.toLowerCase().endsWith('@rc506.com');
        
        return {
            id: supabaseUser.id,
            name: supabaseUser.user_metadata?.name || email.split('@')[0],
            email: email,
            role: isRC506 ? UserRole.ADMIN : (supabaseUser.user_metadata?.role as UserRole || UserRole.CLIENT),
            organizationId: isRC506 ? 'RC506_PILOT' : (supabaseUser.user_metadata?.organizationId || 'GLOBAL'),
            organization_id: isRC506 ? 'rc506_pilot' : (supabaseUser.user_metadata?.organization_id || 'global'),
            subscriptionTier: isRC506 ? SubscriptionTier.ENTERPRISE : (supabaseUser.user_metadata?.subscriptionTier as SubscriptionTier || SubscriptionTier.PRO),
            pin: '2026'
        };
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setCurrentUser(enrichUser(session.user));
            }
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setCurrentUser(enrichUser(session.user));
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = (user: User) => setCurrentUser(user);
    
    const logout = async () => {
        await supabase.auth.signOut(); 
        setCurrentUser(null);
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
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
