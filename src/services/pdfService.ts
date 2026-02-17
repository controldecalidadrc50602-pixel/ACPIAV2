
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Audit, SecurityReport } from '../types';

export const generateAuditPDF = (audit: Audit, securityReport?: SecurityReport | null) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // --- Header ---
    doc.setFillColor(79, 70, 229); // Indigo 600
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text("ACPIA REPORT", 20, 25);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const dateStr = new Date().toLocaleDateString();
    doc.text(`Generated: ${dateStr}`, pageWidth - 20, 25, { align: 'right' });

    // --- Audit Details ---
    let y = 55;

    doc.setTextColor(0, 0, 0); // Black
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text("Resumen Ejecutivo", 20, y);
    y += 10;

    // Executive Data Table
    autoTable(doc, {
        startY: y,
        head: [['ID', 'Agente', 'Proyecto', 'Score', 'CSAT', 'Sentimiento']],
        body: [[
            audit.readableId || audit.id,
            audit.agentName,
            audit.project,
            (audit.qualityScore || 0) + '%',
            (audit.csat || 0) + '/5',
            audit.sentiment || 'NEUTRAL'
        ]],
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 10, cellPadding: 3 }
    });

    // @ts-ignore
    y = doc.lastAutoTable.finalY + 20;

    // --- AI Notes ---
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text("Evaluación de IA", 20, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const notes = audit.aiNotes || "No hay notas disponibles.";
    const splitNotes = doc.splitTextToSize(notes, pageWidth - 40);
    doc.text(splitNotes, 20, y);

    y += (splitNotes.length * 5) + 20;

    // --- Security Report ---
    if (securityReport) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(220, 38, 38); // Red 600
        doc.text("Reporte de Seguridad (ISO 42001)", 20, y);
        y += 10;

        const secData = [
            ['Estado', securityReport.isBlocked ? 'BLOCKED' : 'PASSED'],
            ['Compliance Flags', securityReport.flags.join(', ') || 'None'],
            ['Detalles', securityReport.details]
        ];

        autoTable(doc, {
            startY: y,
            head: [['Métrica', 'Resultado']],
            body: secData,
            theme: 'grid',
            headStyles: { fillColor: [220, 38, 38] },
            styles: { fontSize: 10 }
        });
    }

    // --- Footer ---
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Power by ACPIA - ISO 9001 Compliant Audit System`, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
    }

    doc.save(`ACPIA_Audit_${audit.readableId || 'Report'}.pdf`);
};
