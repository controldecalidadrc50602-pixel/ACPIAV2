import React from 'react';
import { ProjectScorecard } from '../components/ProjectScorecard';
import { useApp } from '../context/AppContext';
import { useParams, useNavigate } from 'react-router-dom';
import { getRubric } from '../services/storageService';

export const ProjectScorecardPage: React.FC = () => {
    const { audits, lang } = useApp();
    const { projectName } = useParams<{ projectName: string }>();
    const navigate = useNavigate();

    const decodedProjectName = projectName ? decodeURIComponent(projectName) : null;

    if (!decodedProjectName) return <div>Project not found</div>;

    return (
        <ProjectScorecard
            projectName={decodedProjectName}
            audits={audits}
            rubric={getRubric()}
            lang={lang}
            onBack={() => navigate('/app/crm')}
        />
    );
};
