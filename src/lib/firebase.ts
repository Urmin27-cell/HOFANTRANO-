import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getMessaging, getToken } from 'firebase/messaging';
import firebaseConfig from '../../firebase-applet-config.json';
import { 
  AdminSettings, PaymentAccount, Property, Tenant, 
  PaymentSubmission, Receipt, AppNotification 
} from '../types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const messaging = getMessaging(app);

enableIndexedDbPersistence(db).catch(console.warn);

// Function to request permission and get FCM token
export async function requestNotificationPermission(userId: string) {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { 
        vapidKey: 'BCY15_y12DL2yNd7PUsyyF2tRc1KLaL_2-bCIYo7PtikbubYW407Zal4DA6WnREpBPCide_hgrvW0NvZ04KoAlY'
      });
      console.log('FCM Token:', token);
      // Store token in Firestore for this user
      // await setDoc(doc(db, 'fcm_tokens', userId), { token });
      return token;
    }
  } catch (error) {
    console.error('Error getting permission', error);
  }
  return null;
}

const INITIAL_ADMIN: AdminSettings = {
  id: 'admin-1',
  adminName: 'Tompon-trano',
  pinCode: '1234',
  currency: 'Ar'
};

const INITIAL_ACCOUNTS: PaymentAccount[] = [
  { id: 'acc-1', accountNumber: '0323911654', accountName: 'RAVELOMANANTSOA URMIN', bankOrProvider: 'MVola/Orange Money' }
];

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
  saveAdminPin: (pin: string) => {
    const admin = getStoredData('admin_profile', { ...INITIAL_ADMIN, isRegistered: false });
    admin.pinCode = pin;
    setStoredData('admin_profile', admin);
  },

  getAccounts: (): PaymentAccount[] => getStoredData('accounts', [INITIAL_ACCOUNTS[0]]),
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

  resetAll: () => localStorage.clear()
};
