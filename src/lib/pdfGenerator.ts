import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Receipt, Tenant, Property, PaymentAccount } from '../types';
import { formatAr, formatDate } from './formatters';

export function generateReceiptPDF(receipt: Receipt, tenant: Tenant, property: Property, account?: PaymentAccount) {
  const doc = new jsPDF();

  // Header background
  doc.setFillColor(16, 122, 98); // Emerald green primary
  doc.rect(0, 0, 210, 42, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('REÇU DE PAIEMENT / REÇU HOFANTRANO', 14, 25);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Laharana: ${receipt.receiptNumber}`, 196, 20, { align: 'right' });
  doc.text(`Daty: ${formatDate(receipt.issueDate)}`, 196, 28, { align: 'right' });

  // Landlord / Agency Info
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Tompon-trano (Gestion HOFANTRANO)', 14, 55);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Antananarivo, Madagasikara', 14, 61);

  // Tenant Box
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(120, 50, 76, 32, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Mpanofa (Locataire):', 125, 57);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(tenant.fullName, 125, 64);
  doc.text(`Trano: ${property.name} (${property.code})`, 125, 70);
  doc.text(`Finday: ${tenant.phone}`, 125, 76);

  // Table details with Volana nefaina
  const tableData = [
    ['Volana nefaina (Mois réglé)', receipt.rentMonth || 'Hofan-trano'],
    ['Vola naloa (Montant payé)', formatAr(receipt.amountPaid)],
    ['Fomba fandoavana / Kaonty', account ? `${account.bankOrProvider} (${account.accountNumber})` : receipt.accountName],
    ['Référence / Réf', receipt.reference || '-'],
    ['Fanamarihana', 'Voaray sy nankatoavin\'ny Tompon-trano tsara ny vola hofantrano']
  ];

  autoTable(doc, {
    startY: 92,
    head: [['Famaritana (Détails)', 'Sandany (Valeur)']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [16, 122, 98], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 6 }
  });

  const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 20 : 140;

  // Landlord Signature Image if present
  if (receipt.landlordSignature) {
    try {
      doc.addImage(receipt.landlordSignature, 'PNG', 30, finalY, 50, 25);
    } catch {
      // ignore if image format issue
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Sonian\'ny Tompon-trano', 55, finalY + 32, { align: 'center' });

  doc.setDrawColor(150, 150, 150);
  doc.line(25, finalY + 28, 85, finalY + 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Ity reçu ity dia manamarina fa voaray sy nankatoavina ny fandoavam-bola.', 14, 275);
  doc.text(`HOFANTRANO - Antananarivo, Madagasikara (${new Date().toLocaleDateString()})`, 14, 280);

  doc.save(`Reçu_${receipt.receiptNumber}.pdf`);
}
