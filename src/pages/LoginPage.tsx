import React from 'react';
import { Login } from '../components/Login';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const { lang, setLang } = useApp();

    return <Login onLogin={login} lang={lang} setLang={setLang} />;
};
