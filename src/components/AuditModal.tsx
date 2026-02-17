
import React, { useEffect, useState } from 'react';
import { Audit, AuditType, VoiceAudit, ChatAudit, Language, RubricItem, AuditStatus } from '../types';
import { X, FileDown, Trash2, Tag, Hash, ChevronDown, FileText, Edit, CheckCircle, XCircle, Clock } from 'lucide-react';
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
  const t = translations[lang];
  const [rubric, setRubric] = useState<RubricItem[]>([]);
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    setRubric(getRubric());
  }, []);

  if (!audit) return null;

  const getRubricLabel = (id: string) => {
      const item = rubric.find(r => r.id === id);
      if (!item) return id;
      return t[item.id] || item.label;
  };

  const formatDuration = (minutes: number) => {
      if(!minutes) return "0m";
      const m = Math.floor(minutes);
      const s = Math.round((minutes - m) * 60);
      return `${m}m ${s}s`;
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

  const updateStatus = (status: AuditStatus) => {
      if (!audit) return;
      const updatedAudit = { ...audit, status };
      saveAudit(updatedAudit);
      toast.success(t.statusChanged);
      if (onDataChange) onDataChange();
      onClose();
  };

  const handleExportCSV = () => {
      downloadCSV([audit]);
      setShowExportMenu(false);
  }

  const handleExportJSON = () => {
      const blob = new Blob([JSON.stringify(audit, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ACPIA_${audit.readableId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setShowExportMenu(false);
  }

  const handleExportPDF = () => {
    try {
        const doc = new jsPDF('p', 'pt', 'a4'); 
        const settings = getAppSettings();
        const pageWidth = doc.internal.pageSize.getWidth();
        const marginLeft = 40;
        const marginRight = 40;
        const contentWidth = pageWidth - marginLeft - marginRight;
        const primaryColor: [number, number, number] = [15, 23, 42]; 
        const accentColor: [number, number, number] = [79, 70, 229]; 
        
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
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Ticket #${audit.readableId} | Proyecto: ${audit.project}`, marginLeft, y + 20);

        const scoreColor = audit.qualityScore >= 80 ? [34, 197, 94] : [239, 68, 68];
        doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2] as number);
        doc.setFontSize(32);
        doc.text(`${audit.qualityScore}%`, pageWidth - marginRight, y + 15, { align: 'right' });

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
        setShowExportMenu(false);
    } catch (err) {
        console.error(err);
        toast.error("Error al generar PDF.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{audit.agentName}</h3>
                    {audit.readableId && <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-500 text-xs rounded font-mono font-bold">#{audit.readableId}</span>}
                </div>
                <p className="text-slate-500 text-sm">{audit.project} • {audit.date}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-400">
                <X className="w-6 h-6" />
            </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
             <div className="mb-6 flex items-center gap-4 bg-slate-100 dark:bg-slate-800/50 p-4 rounded-lg">
                <div className="flex flex-col">
                    <span className="text-slate-500 text-xs uppercase">CSAT</span>
                    <span className="text-2xl font-bold dark:text-white">{audit.csat}/5</span>
                </div>
                <div className="h-8 w-px bg-slate-300 dark:bg-slate-700"></div>
                <div className="flex flex-col">
                    <span className="text-slate-500 text-xs uppercase">Score</span>
                    <span className={`text-2xl font-bold ${audit.qualityScore >= 80 ? 'text-green-500' : 'text-yellow-500'}`}>{audit.qualityScore || 0}%</span>
                </div>
                <div className="h-8 w-px bg-slate-300 dark:bg-slate-700"></div>
                <div className="flex flex-col">
                    <span className="text-slate-500 text-xs uppercase">Estado</span>
                    <span className="text-xs font-black uppercase text-indigo-500">{t[audit.status || 'PENDING_REVIEW']}</span>
                </div>
             </div>

            <div className="grid grid-cols-1 gap-2 mb-8">
                 {audit.customData && Object.entries(audit.customData).map(([key, val]) => (
                     <div key={key} className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 py-2 text-slate-700 dark:text-slate-300">
                         <span className="text-sm">{getRubricLabel(key)}</span>
                         <span className={`px-2 py-1 rounded text-[10px] font-black ${val ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{val ? 'SÍ' : 'NO'}</span>
                     </div>
                 ))}
            </div>

            <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 text-center">Gobernanza de Calidad</h4>
                <div className="flex gap-3">
                    <button 
                        onClick={() => updateStatus(AuditStatus.APPROVED)}
                        className={`flex-1 flex items-center justify-center gap-2 h-14 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${audit.status === AuditStatus.APPROVED ? 'bg-green-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-green-600 hover:text-white'}`}
                    >
                        <CheckCircle className="w-5 h-5" /> {t.approve}
                    </button>
                    <button 
                        onClick={() => updateStatus(AuditStatus.REJECTED)}
                        className={`flex-1 flex items-center justify-center gap-2 h-14 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${audit.status === AuditStatus.REJECTED ? 'bg-red-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-red-600 hover:text-white'}`}
                    >
                        <XCircle className="w-5 h-5" /> {t.reject}
                    </button>
                </div>
            </div>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex justify-between gap-3">
             <div className="flex gap-2">
                 {onDelete && <Button variant="danger" onClick={handleDelete} icon={<Trash2 className="w-4 h-4" />}>{t.delete}</Button>}
                 {onEdit && <Button variant="primary" onClick={handleEdit} icon={<Edit className="w-4 h-4" />}>Editar</Button>}
             </div>
             <div className="flex gap-3 relative">
                <Button variant="secondary" onClick={onClose}>{t.close}</Button>
                <Button onClick={handleExportPDF} icon={<FileDown className="w-4 h-4" />}>PDF</Button>
             </div>
        </div>
      </div>
    </div>
  );
};
