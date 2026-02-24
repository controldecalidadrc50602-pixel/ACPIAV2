import React from 'react';
import { Management } from '../components/Management';

/**
 * Braily, nota como ya no recibimos 'lang' ni 'currentUser' aquí.
 * El componente Management adentro usa 'useAuth' y 'useApp' para obtenerlos.
 */
export const ManagementPage: React.FC = () => {
    return (
        <div className="animate-fade-in">
            <Management />
        </div>
    );
};
