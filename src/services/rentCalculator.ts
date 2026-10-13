import { RentInvoice, Payment, Receipt, Tenant, AppNotification } from '../types';
import { dbStore } from '../lib/firebase';

/**
 * Automatically check and generate invoices every 30 days based on tenant entry date (startDate)
 */
export function checkAndGenerate30DayInvoices() {
  const tenants = dbStore.getTenants().filter(t => t.status === 'MIVANTAKA');
  const invoices = dbStore.getInvoices();
  const settings = dbStore.getSettings();
  const notifications = dbStore.getNotifications();

  const today = new Date();
  let updatedInvoices = [...invoices];
  let newNotifs = [...notifications];
  let addedCount = 0;

  tenants.forEach(tenant => {
    const entryDate = new Date(tenant.startDate);
    if (isNaN(entryDate.getTime())) return;

    const diffTime = today.getTime() - entryDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const currentCycleIndex = Math.max(1, Math.floor(diffDays / 30) + 1);

    for (let cycle = 1; cycle <= currentCycleIndex; cycle++) {
      const cycleDueDateObj = new Date(entryDate.getTime() + (cycle * 30 * 24 * 60 * 60 * 1000));
      const cycleDueDate = cycleDueDateObj.toISOString().split('T')[0];
      const cycleIssueDate = new Date(entryDate.getTime() + ((cycle - 1) * 30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
      const monthLabel = `Cycle ${cycle} (${cycleIssueDate})`;

      const exists = updatedInvoices.some(i => i.tenantId === tenant.id && i.cycleIndex === cycle);
      if (!exists && cycleDueDateObj <= today) {
        const invNumber = `${settings.invoicePrefix}C${cycle}-${tenant.id.slice(-4)}`;
        
        updatedInvoices.push({
          id: `inv-c${cycle}-${tenant.id}-${Date.now()}`,
          ownerId: tenant.ownerId,
          tenantId: tenant.id,
          propertyId: tenant.propertyId,
          invoiceNumber: invNumber,
          cycleIndex: cycle,
          month: monthLabel,
          issueDate: cycleIssueDate,
          dueDate: cycleDueDate,
          totalAmount: tenant.monthlyRent,
          paidAmount: 0,
          remainingAmount: tenant.monthlyRent,
          status: 'MIANDRY',
          notes: `Hofan-trano faha-30 andro (Cycle ${cycle})`,
          createdAt: new Date().toISOString()
        });

        newNotifs.unshift({
          id: `notif-30d-${Date.now()}-${cycle}`,
          ownerId: tenant.ownerId,
          userId: tenant.id,
          title: `Fampahatsiahivana Hofan-trano (Cycle ${cycle})`,
          message: `Tonga ny fotoana fandoavana ny hofan-trano (Cycle ${cycle}) mitentina ${tenant.monthlyRent.toLocaleString('fr-FR')} Ar. Daty farany: ${cycleDueDate}`,
          type: 'WARNING',
          read: false,
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
        });

        addedCount++;
      }
    }
  });

  if (addedCount > 0) {
    dbStore.saveInvoices(updatedInvoices);
    dbStore.saveNotifications(newNotifs);
  }

  recalculateInvoicesAndDebts();
}

export function generateMonthlyRentInvoices(month: string) {
  checkAndGenerate30DayInvoices();
  return dbStore.getInvoices().length;
}

export function recalculateInvoicesAndDebts() {
  const invoices = dbStore.getInvoices();
  const payments = dbStore.getPayments();
  const today = new Date().toISOString().split('T')[0];

  let updated = false;

  const updatedInvoices = invoices.map(inv => {
    const invPayments = payments.filter(p => p.invoiceId === inv.id);
    const paidAmount = invPayments.reduce((sum, p) => sum + p.amount, 0);
    const remainingAmount = Math.max(0, inv.totalAmount - paidAmount);

    let status = inv.status;
    if (paidAmount >= inv.totalAmount) {
      status = 'VOALOA_TANTERAKA';
    } else if (paidAmount > 0) {
      status = 'VOALOA_AMPALAHANY';
    } else {
      if (inv.dueDate < today) {
        status = 'TARA_FANDOAVANA';
      } else {
        status = 'MIANDRY';
      }
    }

    if (status !== inv.status || paidAmount !== inv.paidAmount || remainingAmount !== inv.remainingAmount) {
      updated = true;
      return {
        ...inv,
        paidAmount,
        remainingAmount,
        status
      };
    }
    return inv;
  });

  if (updated) {
    dbStore.saveInvoices(updatedInvoices);
  }
}

export function recordPayment(paymentData: Omit<Payment, 'id' | 'createdAt'>): { payment: Payment; receipt: Receipt } {
  const payments = dbStore.getPayments();
  const receipts = dbStore.getReceipts();
  const invoices = dbStore.getInvoices();
  const tenants = dbStore.getTenants();
  const settings = dbStore.getSettings();

  const newPayment: Payment = {
    ...paymentData,
    id: `pay-${Date.now()}`,
    createdAt: new Date().toISOString()
  };

  payments.push(newPayment);
  dbStore.savePayments(payments);

  const inv = invoices.find(i => i.id === paymentData.invoiceId);
  const remainingBalance = inv ? Math.max(0, inv.remainingAmount - paymentData.amount) : 0;

  const receiptCount = receipts.length + 1;
  const receiptNumber = `${settings.receiptPrefix}${String(receiptCount).padStart(3, '0')}`;

  const tenant = tenants.find(t => t.id === paymentData.tenantId);
  const amountInWords = `${paymentData.amount.toLocaleString('fr-FR')} Ariary`;

  const newReceipt: Receipt = {
    id: `rec-${Date.now()}`,
    ownerId: paymentData.ownerId,
    paymentId: newPayment.id,
    receiptNumber,
    issueDate: paymentData.paymentDate,
    amountPaid: paymentData.amount,
    amountInWords,
    paymentMethod: paymentData.paymentMethod,
    reference: paymentData.reference,
    remainingBalance,
    notes: paymentData.notes || `Fandoavana hofan-trano`,
    createdAt: new Date().toISOString()
  };

  receipts.push(newReceipt);
  dbStore.saveReceipts(receipts);

  const logs = dbStore.getAuditLogs();
  logs.unshift({
    id: `log-${Date.now()}`,
    ownerId: paymentData.ownerId,
    userId: paymentData.recordedBy,
    userName: paymentData.recordedBy,
    action: 'FANDRAKITRA_FANDOAVANA',
    entityType: 'Payment',
    entityId: newPayment.id,
    details: `Nandray fandoavana mitentina ${paymentData.amount.toLocaleString('fr-FR')} Ar avy amin\'i ${tenant?.fullName || 'Mpanofa'}`,
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
  });
  dbStore.saveAuditLogs(logs);

  const notifs = dbStore.getNotifications();
  notifs.unshift({
    id: `notif-${Date.now()}`,
    ownerId: paymentData.ownerId,
    userId: paymentData.ownerId,
    title: 'Fandoavam-bola Vaovao',
    message: `Voaray ny vola ${paymentData.amount.toLocaleString('fr-FR')} Ar avy amin\'i ${tenant?.fullName || 'Mpanofa'}`,
    type: 'SUCCESS',
    read: false,
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
  });
  dbStore.saveNotifications(notifs);

  recalculateInvoicesAndDebts();

  return { payment: newPayment, receipt: newReceipt };
}
