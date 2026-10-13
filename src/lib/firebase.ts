import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { 
  AdminSettings, PaymentAccount, Property, Tenant, 
  PaymentSubmission, Receipt, AppNotification 
} from '../types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const INITIAL_ADMIN: AdminSettings = {
  id: 'admin-1',
  adminName: 'Tompon-trano',
  pinCode: '1234',
  currency: 'Ar'
};

const INITIAL_ACCOUNTS: PaymentAccount[] = [
  { id: 'acc-1', accountNumber: '034 12 345 67', accountName: 'Jean Ramanantsoa', bankOrProvider: 'MVola' },
  { id: 'acc-2', accountNumber: '033 98 765 43', accountName: 'Jean Ramanantsoa', bankOrProvider: 'Orange Money' },
  { id: 'acc-3', accountNumber: '00005 00001 123456789', accountName: 'Jean Ramanantsoa', bankOrProvider: 'BNI Madagascar' }
];

function getStoredData<T>(key: string, initial: T): T {
  try {
    const item = localStorage.getItem(`hofantrano_v3_${key}`);
    return item ? JSON.parse(item) : initial;
  } catch {
    return initial;
  }
}

function setStoredData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`hofantrano_v3_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving to localStorage', e);
  }
}

export interface AuthSession {
  isAuthenticated: boolean;
  role: 'TOMPO_TRANO' | 'MPANOFA';
  userId: string;
  fullName: string;
  tenantId?: string;
}

export const getCurrentSession = (): AuthSession => {
  return getStoredData<AuthSession>('auth_session', {
    isAuthenticated: false,
    role: 'TOMPO_TRANO',
    userId: 'admin-1',
    fullName: 'Tompon-trano'
  });
};

export const setCurrentSession = (session: AuthSession) => {
  setStoredData('auth_session', session);
};

export const dbStore = {
  getAdmin: (): AdminSettings => getStoredData('admin', INITIAL_ADMIN),
  saveAdmin: (admin: AdminSettings) => setStoredData('admin', admin),
  saveAdminPin: (pin: string) => {
    const admin = getStoredData('admin', INITIAL_ADMIN);
    admin.pinCode = pin;
    setStoredData('admin', admin);
  },

  getAccounts: (): PaymentAccount[] => getStoredData('accounts', INITIAL_ACCOUNTS),
  saveAccounts: (accounts: PaymentAccount[]) => setStoredData('accounts', accounts),

  getProperties: (): Property[] => getStoredData('properties', []),
  saveProperties: (props: Property[]) => setStoredData('properties', props),

  getTenants: (): Tenant[] => getStoredData('tenants', []),
  saveTenants: (tenants: Tenant[]) => setStoredData('tenants', tenants),

  getSubmissions: (): PaymentSubmission[] => getStoredData('submissions', []),
  saveSubmissions: (subs: PaymentSubmission[]) => setStoredData('submissions', subs),

  getReceipts: (): Receipt[] => getStoredData('receipts', []),
  saveReceipts: (receipts: Receipt[]) => setStoredData('receipts', receipts),

  getNotifications: (): AppNotification[] => getStoredData('notifications', []),
  saveNotifications: (notifs: AppNotification[]) => setStoredData('notifications', notifs),

  resetAll: () => {
    localStorage.clear();
  }
};
