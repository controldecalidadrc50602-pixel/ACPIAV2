import React from 'react';
import { Copilot } from '../../components/Copilot';
import { useApp } from '../../context/AppContext';

export const CopilotWrapper: React.FC = () => {
    const { audits, lang } = useApp();
    return <Copilot audits={audits} lang={lang} />;
};
