import React, { useState, useEffect } from 'react';
import { ProjectScorecard } from '../components/ProjectScorecard';
import { useApp } from '../context/AppContext';
import { useParams, useNavigate } from 'react-router-dom';
import { getRubric } from '../services/storageService';
import { RubricItem } from '../types';

export const ProjectScorecardPage: React.FC = () => {
    const { audits, lang } = useApp();
    const { projectName } = useParams<{ projectName: string }>();
    const navigate = useNavigate();

    // 1. Creamos el estado para la rúbrica
    const [rubric, setRubric] = useState<RubricItem[]>([]);

    // 2. Efecto para cargar los datos
    useEffect(() => {
        const loadData = async () => {
            const data = await getRubric();
            setRubric(data);
        };
        loadData();
    }, []);

    const decodedProjectName = projectName ? decodeURIComponent(projectName) : null;

    if (!decodedProjectName) return <div>Project not found</div>;

    return (
        <ProjectScorecard
            projectName={decodedProjectName}
            audits={audits}
            rubric={rubric} // 3. Pasamos la data resuelta
            lang={lang}
            onBack={() => navigate('/app/crm')}
        />
    );
};
