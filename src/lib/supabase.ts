import { createClient } from '@supabase/supabase-js';
import { 
  UserProfile, Property, Tenant, Lease, RentInvoice, 
  Payment, Receipt, AuditLog, AppNotification, AppSettings 
} from '../types';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://your-project.supabase.co');

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Initial Demo Data for HOFANTRANO
const DEMO_OWNER_ID = 'user-tompo-trano-1';

const INITIAL_SETTINGS: AppSettings = {
  id: 'set-1',
  ownerId: DEMO_OWNER_ID,
  landlandName: 'Ramanantsoa Jean',
  landlordName: 'Ramanantsoa Jean',
  agencyName: 'Immobilier Analamanga',
  address: 'Lot IVG 12 Bis Analakely, Antananarivo 101',
  phone: '+261 34 12 345 67',
  email: 'contact@hofantrano.mg',
  currency: 'Ar',
  timezone: 'Indian/Antananarivo',
  invoicePrefix: 'FAC-2026-',
  receiptPrefix: 'REC-2026-',
  defaultDueDay: 5,
  reminderDaysBefore: 3,
  bankDetails: 'BNI Madagascar - RIB: 00005 00001 12345678901 23',
  mobileMoneyDetails: 'MVola / Orange Money / Airtel Money: 034 12 345 67 (Jean Ramanantsoa)'
};

const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    ownerId: DEMO_OWNER_ID,
    code: 'TRN-001',
    name: 'Trano F 2 Analamanga',
    address: 'Lot IVG 15 Analakely',
    zone: 'Analakely',
    type: 'Appartement',
    rooms: 3,
    monthlyRent: 450000,
    caution: 900000,
    status: 'MISY_MPANOFA',
    createdAt: '2025-01-15',
    notes: 'Misy rano sy jiro mandeha, arovan-tsivana ny fidirana.'
  },
  {
    id: 'prop-2',
    ownerId: DEMO_OWNER_ID,
    code: 'TRN-002',
    name: 'Villa Ivandry Prestige',
    address: 'Lot II M 45 Ivandry',
    zone: 'Ivandry',
    type: 'Villa',
    rooms: 5,
    monthlyRent: 1800000,
    caution: 3600000,
    status: 'MISY_MPANOFA',
    createdAt: '2025-03-10',
    notes: 'Trano lehibe misy bozaka sy garazy fiara roa.'
  },
  {
    id: 'prop-3',
    ownerId: DEMO_OWNER_ID,
    code: 'TRN-003',
    name: 'Studio Ankorondrano',
    address: 'Lot III B Ankorondrano',
    zone: 'Ankorondrano',
    type: 'Studio',
    rooms: 1,
    monthlyRent: 300000,
    caution: 600000,
    status: 'MALALAKA',
    createdAt: '2025-06-01',
    notes: 'Studio maoderina akaiky toeram-piasana.'
  },
  {
    id: 'prop-4',
    ownerId: DEMO_OWNER_ID,
    code: 'TRN-004',
    name: 'Trano Fivarotana Tsaralalana',
    address: 'Avenue Tsaralalana',
    zone: 'Tsaralalana',
    type: 'Trano Fivarotana',
    rooms: 2,
    monthlyRent: 1200000,
    caution: 2400000,
    status: 'MISY_MPANOFA',
    createdAt: '2025-08-20',
    notes: 'Toerana be olona mandeha tsara ho an\'ny fivarotana.'
  }
];

const INITIAL_TENANTS: Tenant[] = [
  {
    id: 'ten-1',
    ownerId: DEMO_OWNER_ID,
    propertyId: 'prop-1',
    fullName: 'Rakotondraibe Hery',
    phone: '+261 33 22 111 22',
    email: 'hery.rakoto@gmail.com',
    address: 'Analakely, Antananarivo',
    cin: '101 234 567 890',
    startDate: '2025-02-01',
    monthlyRent: 450000,
    dueDay: 5,
    caution: 900000,
    status: 'MIVANTAKA',
    createdAt: '2025-01-28'
  },
  {
    id: 'ten-2',
    ownerId: DEMO_OWNER_ID,
    propertyId: 'prop-2',
    fullName: 'Rasoarimanana Lala',
    phone: '+261 32 44 555 66',
    email: 'lala.rasoa@yahoo.fr',
    address: 'Ivandry, Antananarivo',
    cin: '102 987 654 321',
    startDate: '2025-04-01',
    monthlyRent: 1800000,
    dueDay: 1,
    caution: 3600000,
    status: 'MIVANTAKA',
    createdAt: '2025-03-25'
  },
  {
    id: 'ten-3',
    ownerId: DEMO_OWNER_ID,
    propertyId: 'prop-4',
    fullName: 'Andrianaivo Fidy',
    phone: '+261 34 77 888 99',
    email: 'fidy.andry@gmail.com',
    address: 'Tsaralalana, Antananarivo',
    cin: '103 456 789 012',
    startDate: '2025-09-01',
    monthlyRent: 1200000,
    dueDay: 10,
    caution: 2400000,
    status: 'MIVANTAKA',
    createdAt: '2025-08-25'
  }
];

const INITIAL_LEASES: Lease[] = [
  {
    id: 'lease-1',
    ownerId: DEMO_OWNER_ID,
    tenantId: 'ten-1',
    propertyId: 'prop-1',
    leaseNumber: 'CIF-2025-001',
    startDate: '2025-02-01',
    endDate: '2027-01-31',
    monthlyRent: 450000,
    dueDay: 5,
    caution: 900000,
    additionalTerms: 'Tsy azo atao ny mampiranty biby fiompy lehibe ao amin\'ny trano.',
    status: 'MIANTSOA',
    createdAt: '2025-01-28'
  },
  {
    id: 'lease-2',
    ownerId: DEMO_OWNER_ID,
    tenantId: 'ten-2',
    propertyId: 'prop-2',
    leaseNumber: 'CIF-2025-002',
    startDate: '2025-04-01',
    endDate: '2026-03-31',
    monthlyRent: 1800000,
    dueDay: 1,
    caution: 3600000,
    additionalTerms: 'Fandoavana isam-bolana alohan\'ny faha-1 amin\'ny volana.',
    status: 'MIANTSOA',
    createdAt: '2025-03-25'
  },
  {
    id: 'lease-3',
    ownerId: DEMO_OWNER_ID,
    tenantId: 'ten-3',
    propertyId: 'prop-4',
    leaseNumber: 'CIF-2025-003',
    startDate: '2025-09-01',
    endDate: '2026-08-31',
    monthlyRent: 1200000,
    dueDay: 10,
    caution: 2400000,
    additionalTerms: 'Trano fivarotana natao ho an\'ny birao na fivarotana entana madinika.',
    status: 'MIANTSOA',
    createdAt: '2025-08-25'
  }
];

const INITIAL_INVOICES: RentInvoice[] = [
  {
    id: 'inv-1',
    ownerId: DEMO_OWNER_ID,
    tenantId: 'ten-1',
    propertyId: 'prop-1',
    invoiceNumber: 'FAC-2026-10-001',
    month: '2026-10',
    issueDate: '2026-10-01',
    dueDate: '2026-10-05',
    totalAmount: 450000,
    paidAmount: 450000,
    remainingAmount: 0,
    status: 'VOALOA_TANTERAKA',
    createdAt: '2026-10-01'
  },
  {
    id: 'inv-2',
    ownerId: DEMO_OWNER_ID,
    tenantId: 'ten-2',
    propertyId: 'prop-2',
    invoiceNumber: 'FAC-2026-10-002',
    month: '2026-10',
    issueDate: '2026-10-01',
    dueDate: '2026-10-01',
    totalAmount: 1800000,
    paidAmount: 1000000,
    remainingAmount: 800000,
    status: 'VOALOA_AMPALAHANY',
    createdAt: '2026-10-01'
  },
  {
    id: 'inv-3',
    ownerId: DEMO_OWNER_ID,
    tenantId: 'ten-3',
    propertyId: 'prop-4',
    invoiceNumber: 'FAC-2026-10-003',
    month: '2026-10',
    issueDate: '2026-10-01',
    dueDate: '2026-10-10',
    totalAmount: 1200000,
    paidAmount: 0,
    remainingAmount: 1200000,
    status: 'TARA_FANDOAVANA', // Overdue or pending
    createdAt: '2026-10-01'
  }
];

const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay-1',
    ownerId: DEMO_OWNER_ID,
    tenantId: 'ten-1',
    propertyId: 'prop-1',
    invoiceId: 'inv-1',
    amount: 450000,
    paymentDate: '2026-10-03',
    paymentMethod: 'MOBILE_MONEY',
    reference: 'MV-9823412',
    notes: 'Fandoavana feno volana Oktobra 2026',
    recordedBy: 'Ramanantsoa Jean',
    createdAt: '2026-10-03'
  },
  {
    id: 'pay-2',
    ownerId: DEMO_OWNER_ID,
    tenantId: 'ten-2',
    propertyId: 'prop-2',
    invoiceId: 'inv-2',
    amount: 1000000,
    paymentDate: '2026-10-02',
    paymentMethod: 'BANKY',
    reference: 'BNI-TR-4451',
    notes: 'Fandoavana ampahany volana Oktobra 2026',
    recordedBy: 'Ramanantsoa Jean',
    createdAt: '2026-10-02'
  }
];

const INITIAL_RECEIPTS: Receipt[] = [
  {
    id: 'rec-1',
    ownerId: DEMO_OWNER_ID,
    paymentId: 'pay-1',
    receiptNumber: 'REC-2026-10-001',
    issueDate: '2026-10-03',
    amountPaid: 450000,
    amountInWords: '450 000 Ariary',
    paymentMethod: 'MOBILE_MONEY',
    reference: 'MV-9823412',
    remainingBalance: 0,
    notes: 'Reçu ho an\'ny hofan-trano Oktobra 2026',
    createdAt: '2026-10-03'
  },
  {
    id: 'rec-2',
    ownerId: DEMO_OWNER_ID,
    paymentId: 'pay-2',
    receiptNumber: 'REC-2026-10-002',
    issueDate: '2026-10-02',
    amountPaid: 1000000,
    amountInWords: '1 000 000 Ariary',
    paymentMethod: 'BANKY',
    reference: 'BNI-TR-4451',
    remainingBalance: 800000,
    notes: 'Reçu ampahany ho an\'ny hofan-trano Oktobra 2026',
    createdAt: '2026-10-02'
  }
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    ownerId: DEMO_OWNER_ID,
    userId: 'user-1',
    userName: 'Ramanantsoa Jean',
    action: 'FAMORONANA_FACTURE',
    entityType: 'RentInvoice',
    entityId: 'inv-1',
    details: 'Namaritra facture ho an\'ny trano TRN-001 volana Oktobra 2026',
    createdAt: '2026-10-01 08:00:00'
  },
  {
    id: 'log-2',
    ownerId: DEMO_OWNER_ID,
    userId: 'user-1',
    userName: 'Ramanantsoa Jean',
    action: 'FANDRAKITRA_FANDOAVANA',
    entityType: 'Payment',
    entityId: 'pay-1',
    details: 'Nandraitra fandoavana 450 000 Ar avy tamin\'i Rakotondraibe Hery',
    createdAt: '2026-10-03 14:30:00'
  }
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    ownerId: DEMO_OWNER_ID,
    userId: 'user-1',
    title: 'Fandefasana Hetsika',
    message: 'Nandoa ny hofan-trano i Rakotondraibe Hery (450 000 Ar)',
    type: 'SUCCESS',
    read: false,
    createdAt: '2026-10-03 14:30:00'
  },
  {
    id: 'notif-2',
    ownerId: DEMO_OWNER_ID,
    userId: 'user-1',
    title: 'Fampahatsiahivana Trosa',
    message: 'Mbola misy vola 800 000 Ar tsy voaloan\'i Rasoarimanana Lala',
    type: 'WARNING',
    read: false,
    createdAt: '2026-10-10 09:00:00'
  }
];

// LocalStorage Persistence helper
function getStoredData<T>(key: string, initial: T): T {
  try {
    const item = localStorage.getItem(`hofantrano_${key}`);
    return item ? JSON.parse(item) : initial;
  } catch {
    return initial;
  }
}

function setStoredData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`hofantrano_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving to localStorage', e);
  }
}

// Current logged in user state simulation
export const getCurrentUser = (): UserProfile => {
  return getStoredData<UserProfile>('current_user', {
    id: DEMO_OWNER_ID,
    email: 'contact@hofantrano.mg',
    fullName: 'Ramanantsoa Jean',
    role: 'TOMPO_TRANO',
    phone: '+261 34 12 345 67',
    createdAt: '2025-01-01'
  });
};

export const setCurrentUser = (user: UserProfile) => {
  setStoredData('current_user', user);
};

// Data service helpers with LocalStorage + optional Supabase sync
export const db = {
  getSettings: (): AppSettings => getStoredData('settings', INITIAL_SETTINGS),
  saveSettings: (settings: AppSettings) => setStoredData('settings', settings),

  getProperties: (): Property[] => getStoredData('properties', INITIAL_PROPERTIES),
  saveProperties: (props: Property[]) => setStoredData('properties', props),

  getTenants: (): Tenant[] => getStoredData('tenants', INITIAL_TENANTS),
  saveTenants: (tenants: Tenant[]) => setStoredData('tenants', tenants),

  getLeases: (): Lease[] => getStoredData('leases', INITIAL_LEASES),
  saveLeases: (leases: Lease[]) => setStoredData('leases', leases),

  getInvoices: (): RentInvoice[] => getStoredData('invoices', INITIAL_INVOICES),
  saveInvoices: (invoices: RentInvoice[]) => setStoredData('invoices', invoices),

  getPayments: (): Payment[] => getStoredData('payments', INITIAL_PAYMENTS),
  savePayments: (payments: Payment[]) => setStoredData('payments', payments),

  getReceipts: (): Receipt[] => getStoredData('receipts', INITIAL_RECEIPTS),
  saveReceipts: (receipts: Receipt[]) => setStoredData('receipts', receipts),

  getAuditLogs: (): AuditLog[] => getStoredData('audit_logs', INITIAL_AUDIT_LOGS),
  saveAuditLogs: (logs: AuditLog[]) => setStoredData('audit_logs', logs),

  getNotifications: (): AppNotification[] => getStoredData('notifications', INITIAL_NOTIFICATIONS),
  saveNotifications: (notifs: AppNotification[]) => setStoredData('notifications', notifs),

  // Reset demo data
  resetDemoData: () => {
    localStorage.setItem('hofantrano_settings', JSON.stringify(INITIAL_SETTINGS));
    localStorage.setItem('hofantrano_properties', JSON.stringify(INITIAL_PROPERTIES));
    localStorage.setItem('hofantrano_tenants', JSON.stringify(INITIAL_TENANTS));
    localStorage.setItem('hofantrano_leases', JSON.stringify(INITIAL_LEASES));
    localStorage.setItem('hofantrano_invoices', JSON.stringify(INITIAL_INVOICES));
    localStorage.setItem('hofantrano_payments', JSON.stringify(INITIAL_PAYMENTS));
    localStorage.setItem('hofantrano_receipts', JSON.stringify(INITIAL_RECEIPTS));
    localStorage.setItem('hofantrano_audit_logs', JSON.stringify(INITIAL_AUDIT_LOGS));
    localStorage.setItem('hofantrano_notifications', JSON.stringify(INITIAL_NOTIFICATIONS));
  }
};
