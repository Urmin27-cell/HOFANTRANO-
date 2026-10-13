import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { 
  AdminSettings, PaymentAccount, Property, Tenant, 
  PaymentSubmission, Receipt, AppNotification, Subscription 
} from '../types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

enableIndexedDbPersistence(db).catch(console.warn);

const INITIAL_ADMIN: AdminSettings = {
  id: 'admin-1',
  adminName: 'Tompon-trano',
  pinCode: '1234',
  currency: 'Ar'
};

const DEFAULT_PLATFORM_ACCOUNT: PaymentAccount = { 
  id: 'plat-1', 
  accountNumber: '0323911654', 
  accountName: 'RAVELOMANANTSOA URMIN', 
  bankOrProvider: 'MVola/Orange Money' 
};

function getStoredData<T>(key: string, initial: T): T {
  try {
    const item = localStorage.getItem(`hofantrano_v5_${key}`);
    return item ? JSON.parse(item) : initial;
  } catch {
    return initial;
  }
}

function setStoredData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`hofantrano_v5_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving to localStorage', e);
  }
}

export interface AuthSession {
  isAuthenticated: boolean;
  role: 'TOMPO_TRANO' | 'MPANOFA' | 'ADMIN_PLATFORME';
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
  getAdmin: (): AdminSettings & { phone?: string; email?: string; isRegistered?: boolean } => 
    getStoredData('admin_profile', { ...INITIAL_ADMIN, isRegistered: false }),
  saveAdmin: (admin: AdminSettings & { phone?: string; email?: string; isRegistered?: boolean }) => 
    setStoredData('admin_profile', admin),

  getPlatformAccount: (): PaymentAccount => getStoredData('platform_account', DEFAULT_PLATFORM_ACCOUNT),
  savePlatformAccount: (acc: PaymentAccount) => setStoredData('platform_account', acc),

  // Collections now scoped or separate
  getProperties: (): Property[] => getStoredData('properties', []),
  saveProperties: (props: Property[]) => setStoredData('properties', props),

  getTenants: (): Tenant[] => getStoredData('tenants', []),
  saveTenants: (tenants: Tenant[]) => setStoredData('tenants', tenants),

  getSubmissions: (): PaymentSubmission[] => getStoredData('submissions', []),
  saveSubmissions: (subs: PaymentSubmission[]) => setStoredData('submissions', subs),

  getSubscriptions: (): Subscription[] => getStoredData('subscriptions', []),
  saveSubscriptions: (subs: Subscription[]) => setStoredData('subscriptions', subs),

  getNotifications: (): AppNotification[] => getStoredData('notifications', []),
  saveNotifications: (notifs: AppNotification[]) => setStoredData('notifications', notifs),

  resetAll: () => localStorage.clear()
};
