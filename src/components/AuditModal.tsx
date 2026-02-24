import React, { useEffect, useState } from 'react';
import { Audit, Language, RubricItem, AuditStatus } from '../types';
import { X, FileDown, Trash2, Edit, CheckCircle, XCircle } from 'lucide-react';
import { Button } from './ui/Button';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { translations } from '../utils/translations';
import { getAppSettings, getRubric, downloadCSV, saveAudit } from '../services/storageService';
import { toast } from 'react-hot-toast';

interface AuditModalProps {
  audit: Audit | null;
  onClose: () => void;
  onDelete?: (id: string) => void; 
  onEdit?: (audit: Audit) => void;
  onDataChange?: () => void;
  lang: Language;
}

export const AuditModal: React.FC<AuditModalProps> = ({ audit, onClose, onDelete, onEdit, onDataChange, lang }) => {
  const t = translations[lang] || translations['es'];
  const [rubric, setRubric] = useState<RubricItem[]>([]);

  // CARGA ASÍNCRONA DE RÚBRICA
  useEffect(() => {
    const loadRubric = async () => {
        const data = await getRubric();
        setRubric(data);
    };
    loadRubric();
  }, []);

  if (!audit) return null;

  const getRubricLabel = (id: string) => {
      const item = rubric.find(r => r.id === id);
      if (!item) return id;
      return t[item.id] || item.label;
  };

  const handleDelete = () => {
    if (onDelete && audit) {
        onDelete(audit.id);
        onClose();
    }
  };
  
  const handleEdit = () => {
      if(onEdit && audit) {
          onEdit(audit);
          onClose();
      }
  };

  // ACTUALIZACIÓN ASÍNCRONA DE ESTADO
  const updateStatus = async (status: AuditStatus) => {
      if (!audit) return;
      const updatedAudit = { ...audit, status };
      const success = await saveAudit(updatedAudit);
      
      if (success) {
          toast.success(t.statusChanged || "Estado actualizado");
          if (onDataChange) onDataChange();
          onClose();
      } else {
          toast.error("Error al actualizar estado");
      }
  };

  // GENERACIÓN DE PDF CORREGIDA (Async)
  const handleExportPDF = async () => {
    try {
        const doc = new jsPDF('p', 'pt', 'a4'); 
        const settings = await getAppSettings(); // Esperamos a los settings
        
        const pageWidth = doc.internal.pageSize.getWidth();
        const marginLeft = 40;
        const marginRight = 40;
        const primaryColor: [number, number, number] = [15, 23, 42]; 
        
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageWidth, 90, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.text(settings.companyName || "ACPIA", marginLeft, 55);

        doc.setFontSize(14);
        doc.text("REPORTE DE CALIDAD", pageWidth - marginRight, 55, { align: 'right' });

        let y = 140;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(16);
        doc.text(audit.agentName, marginLeft, y);
        
        const scoreColor = (audit.qualityScore || 0) >= 80 ? [34, 197, 94] : [239, 68, 68];
        doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2] as number);
        doc.setFontSize(32);
        doc.text(`${audit.qualityScore || 0}%`, pageWidth - marginRight, y + 15, { align: 'right' });

        y += 60;
        const tableRows: any[][] = [];
        if (audit.customData) {
            Object.entries(audit.customData).forEach(([key, val]) => {
                tableRows.push([getRubricLabel(key), val ? 'CUMPLE' : 'NO CUMPLE']);
            });
        }

        autoTable(doc, {
            startY: y,
            head: [['Indicador', 'Resultado']],
            body: tableRows,
            theme: 'striped',
            margin: { left: marginLeft, right: marginRight },
        });

        doc.save(`ACPIA_${audit.readableId}.pdf`);
        toast.success("PDF generado.");
    } catch (err) {
        console.error(err);
        toast.error("Error al generar PDF.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
        {/* Header con diseño premium */}
        <div className="flex justify-between items-center p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{audit.agentName}</h3>
                    {audit.readableId && <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] rounded-xl font-black">#{audit.readableId}</span>}
                </div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{audit.project} • {audit.date}</p>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-2xl text-slate-400 transition-colors">
                <X className="w-6 h-6" />
            </button>
        </div>
        
        <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
             {/* KPI BOXES */}
             <div className="grid grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                <div className="text-center">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">CSAT</span>
                    <span className="text-2xl font-black dark:text-white italic">{audit.csat}/5</span>
                </div>
                <div className="text-center border-x border-slate-200 dark:border-slate-700">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Calidad</span>
                    <span className={`text-2xl font-black italic ${(audit.qualityScore || 0) >= 80 ? 'text-emerald-500' : 'text-orange-500'}`}>{audit.qualityScore || 0}%</span>
                </div>
                <div className="text-center">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Estado</span>
                    <span className="text-[9px] font-black uppercase text-indigo-500 tracking-tighter">{t[audit.status || 'PENDING_REVIEW']}</span>
                </div>
             </div>

            {/* LISTA DE INDICADORES */}
            <div className="space-y-2">
                 {audit.customData && Object.entries(audit.customData).map(([key, val]) => (
                     <div key={key} className="flex justify-between items-center p-4 bg-white dark:bg-slate-900 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 transition-colors">
                         <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">{getRubricLabel(key)}</span>
                         <span className={`px-3 py-1 rounded-full text-[9px] font-black ${val ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                            {val ? 'CUMPLE' : 'FALLA'}
                         </span>
                     </div>
                 ))}
            </div>

            {/* BOTONES DE GOBERNANZA */}
            <div className="flex gap-4">
                <button 
                    onClick={() => updateStatus(AuditStatus.APPROVED)}
                    className={`flex-1 flex items-center justify-center gap-3 h-16 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest transition-all ${audit.status === AuditStatus.APPROVED ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-emerald-500 hover:text-white'}`}
                >
                    <CheckCircle className="w-5 h-5" /> Aprobar
                </button>
                <button 
                    onClick={() => updateStatus(AuditStatus.REJECTED)}
                    className={`flex-1 flex items-center justify-center gap-3 h-16 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest transition-all ${audit.status === AuditStatus.REJECTED ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-red-500 hover:text-white'}`}
                >
                    <XCircle className="w-5 h-5" /> Rechazar
                </button>
            </div>
        </div>

        {/* FOOTER ACCIONES */}
        <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between gap-4">
             <div className="flex gap-2">
                 {onDelete && <Button variant="danger" onClick={handleDelete} icon={<Trash2 className="w-4 h-4" />}>Borrar</Button>}
                 {onEdit && <Button variant="primary" onClick={handleEdit} icon={<Edit className="w-4 h-4" />}>Editar</Button>}
             </div>
             <div className="flex gap-3">
                <Button variant="secondary" onClick={onClose}>Cerrar</Button>
                <Button onClick={handleExportPDF} icon={<FileDown className="w-4 h-4" />}>PDF</Button>
             </div>
        </div>
      </div>
    </div>
  );
};
