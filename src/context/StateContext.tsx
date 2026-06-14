/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Machine, SensorReading, Alert, WorkOrder, Prediction, UserRole, Language, User } from '../types';
import { generateSeedData } from '../services/seedData';
import { calculateMachineHealth } from '../services/predictiveEngine';
import { auth, isFirebaseConfigured, googleProvider, db } from '../lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  doc, 
  query, 
  onSnapshot, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface StateContextType {
  language: Language;
  theme: 'light' | 'dark';
  userRole: UserRole;
  currentUser: User | null;
  machines: Machine[];
  sensorReadings: SensorReading[];
  predictions: Prediction[];
  alerts: Alert[];
  workOrders: WorkOrder[];
  
  // App setters & preferences
  setLanguage: (lang: Language) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setUserRole: (role: UserRole) => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  
  // Asset operations
  addMachine: (m: Omit<Machine, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMachine: (id: string, m: Partial<Machine>) => void;
  deleteMachine: (id: string) => void;
  
  // Custom reading intake (Simulation)
  addSensorReading: (r: Omit<SensorReading, 'timestamp'>) => void;
  
  // Operational operations
  resolveAlert: (alertId: string) => void;
  addWorkOrder: (wo: Omit<WorkOrder, 'id' | 'createdAt'>) => void;
  updateWorkOrderStatus: (woId: string, status: any) => void;
  assignWorkOrder: (woId: string, userName: string) => void;
  resetAllData: () => void;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

export function StateProvider({ children }: { children: React.ReactNode }) {
  // 1. Language preference
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('fp_language');
    return (saved === 'en' || saved === 'fa') ? saved : 'en';
  });

  // 2. Theme Preference
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('fp_theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  // 3. User & Role Preference
  const [userRole, setUserRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem('fp_user_role');
    return (saved === 'Admin' || saved === 'Technician') ? saved : 'Admin';
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // 4. Industrial Data States
  const [machines, setMachines] = useState<Machine[]>([]);
  const [sensorReadings, setSensorReadings] = useState<SensorReading[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);

  // Automatic database seeding helper to easily populate empty Firestore
  const seedFirestoreDatabase = async (targetUser: User) => {
    if (!isFirebaseConfigured || !db) return;
    try {
      console.log("Seeding Firestore with enterprise schema metrics...");
      const seed = generateSeedData();
      
      // Write profile user config
      await setDoc(doc(db, 'users', targetUser.uid), {
        uid: targetUser.uid,
        email: targetUser.email,
        displayName: targetUser.displayName,
        role: targetUser.role,
        photoURL: targetUser.photoURL || ''
      });

      for (const m of seed.machines) {
        await setDoc(doc(db, 'machines', m.id), m);
      }
      for (const r of seed.sensorReadings) {
        const id = `read-${Math.random().toString(36).substr(2, 9)}`;
        await setDoc(doc(db, 'sensorReadings', id), r);
      }
      for (const p of seed.predictions) {
        const id = `pred-${Math.random().toString(36).substr(2, 9)}`;
        await setDoc(doc(db, 'predictions', id), p);
      }
      for (const a of seed.alerts) {
        await setDoc(doc(db, 'alerts', a.id), a);
      }
      for (const w of seed.workOrders) {
        await setDoc(doc(db, 'workOrders', w.id), w);
      }
      console.log("Firestore seeding operation completed successfully.");
    } catch (err) {
      console.error("Critical: Could not seed Firestore databases:", err);
    }
  };

  // Sync and Real-Time Listener Hook
  useEffect(() => {
    if (!isFirebaseConfigured || !db || !currentUser) {
      // Local Storage Offline Fallback mode
      const storedMachines = localStorage.getItem('fp_machines');
      const storedReadings = localStorage.getItem('fp_readings');
      const storedPredictions = localStorage.getItem('fp_predictions');
      const storedAlerts = localStorage.getItem('fp_alerts');
      const storedWorkorders = localStorage.getItem('fp_workorders');

      if (storedMachines && storedReadings && storedPredictions && storedAlerts && storedWorkorders) {
        setMachines(JSON.parse(storedMachines));
        setSensorReadings(JSON.parse(storedReadings));
        setPredictions(JSON.parse(storedPredictions));
        setAlerts(JSON.parse(storedAlerts));
        setWorkOrders(JSON.parse(storedWorkorders));
      } else {
        const seed = generateSeedData();
        setMachines(seed.machines);
        setSensorReadings(seed.sensorReadings);
        setPredictions(seed.predictions);
        setAlerts(seed.alerts);
        setWorkOrders(seed.workOrders);
        
        localStorage.setItem('fp_machines', JSON.stringify(seed.machines));
        localStorage.setItem('fp_readings', JSON.stringify(seed.sensorReadings));
        localStorage.setItem('fp_predictions', JSON.stringify(seed.predictions));
        localStorage.setItem('fp_alerts', JSON.stringify(seed.alerts));
        localStorage.setItem('fp_workorders', JSON.stringify(seed.workOrders));
      }
      return;
    }

    // Google-connected Real-time Firestore subscriptions
    const unsubMachines = onSnapshot(collection(db, 'machines'), (snapshot) => {
      const list: Machine[] = [];
      snapshot.forEach(docSnap => list.push(docSnap.data() as Machine));
      
      if (snapshot.empty && userRole === 'Admin') {
        // Automatically provision mock data for direct preview evaluation
        seedFirestoreDatabase(currentUser);
      } else {
        setMachines(list);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'machines');
    });

    const unsubReadings = onSnapshot(collection(db, 'sensorReadings'), (snapshot) => {
      const list: SensorReading[] = [];
      snapshot.forEach(docSnap => list.push(docSnap.data() as SensorReading));
      setSensorReadings(list.sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'sensorReadings');
    });

    const unsubPredictions = onSnapshot(collection(db, 'predictions'), (snapshot) => {
      const list: Prediction[] = [];
      snapshot.forEach(docSnap => list.push(docSnap.data() as Prediction));
      setPredictions(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'predictions');
    });

    const unsubAlerts = onSnapshot(collection(db, 'alerts'), (snapshot) => {
      const list: Alert[] = [];
      snapshot.forEach(docSnap => list.push(docSnap.data() as Alert));
      setAlerts(list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'alerts');
    });

    const unsubWorkOrders = onSnapshot(collection(db, 'workOrders'), (snapshot) => {
      const list: WorkOrder[] = [];
      snapshot.forEach(docSnap => list.push(docSnap.data() as WorkOrder));
      setWorkOrders(list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'workOrders');
    });

    return () => {
      unsubMachines();
      unsubReadings();
      unsubPredictions();
      unsubAlerts();
      unsubWorkOrders();
    };
  }, [currentUser, userRole]);

  // Update HTML layouts to support Persian dynamic RTL alignment!
  useEffect(() => {
    const ltrOrRtl = language === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.dir = ltrOrRtl;
    document.documentElement.lang = language;
    if (language === 'fa') {
      document.documentElement.classList.add('font-sans');
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('fp_language', lang);
  };

  const setTheme = (t: 'light' | 'dark') => {
    setThemeState(t);
    localStorage.setItem('fp_theme', t);
  };

  const setUserRole = async (role: UserRole) => {
    setUserRoleState(role);
    localStorage.setItem('fp_user_role', role);
    if (currentUser) {
      const updatedUser = { ...currentUser, role };
      setCurrentUser(updatedUser);
      if (isFirebaseConfigured && db) {
        try {
          await setDoc(doc(db, 'users', currentUser.uid), {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            role,
            photoURL: currentUser.photoURL || ''
          }, { merge: true });
        } catch (e) {
          console.error("Credentials error sync:", e);
        }
      }
    }
  };

  // Google Authentication Setup if configured
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const userObj: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            role: userRole
          };
          setCurrentUser(userObj);

          try {
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              role: userRole,
              photoURL: firebaseUser.photoURL || ''
            }, { merge: true });
          } catch (e) {
            console.error("UserProfile registration snapshot failed:", e);
          }
        } else {
          setCurrentUser(null);
        }
      });
      return unsubscribe;
    } else {
      // Local session dummy auth (To keep dashboard accessible and immediately productive)
      const cachedSession = localStorage.getItem('fp_demo_user');
      if (cachedSession) {
        setCurrentUser(JSON.parse(cachedSession));
      } else {
        const dummyUser: User = {
          uid: 'demo-user-123',
          email: 'admin@factorypulse.com',
          displayName: 'Administrator (SaaS Executive)',
          photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
          role: userRole
        };
        setCurrentUser(dummyUser);
        localStorage.setItem('fp_demo_user', JSON.stringify(dummyUser));
      }
    }
  }, [userRole]);

  const loginWithGoogle = async () => {
    if (isFirebaseConfigured && auth && googleProvider) {
      try {
        const res = await signInWithPopup(auth, googleProvider);
        const firebaseUser = res.user;
        const userObj: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: userRole
        };
        setCurrentUser(userObj);

        try {
          await setDoc(doc(db, 'users', firebaseUser.uid), {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            role: userRole,
            photoURL: firebaseUser.photoURL || ''
          }, { merge: true });
        } catch (errProfile) {
          console.error(errProfile);
        }
      } catch (err) {
        console.error("Authentication popup aborted.", err);
      }
    } else {
      const dummyUser: User = {
        uid: 'demo-user-123',
        email: userRole === 'Admin' ? 'admin@factorypulse.com' : 'tech1@factorypulse.com',
        displayName: userRole === 'Admin' ? 'Reza Technical Safety Director' : 'Ahmad Mechanical Lead',
        photoURL: null,
        role: userRole
      };
      setCurrentUser(dummyUser);
      localStorage.setItem('fp_demo_user', JSON.stringify(dummyUser));
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    setCurrentUser(null);
    localStorage.removeItem('fp_demo_user');
  };

  // REST DATA HELPER
  const resetAllData = async () => {
    if (isFirebaseConfigured && db && currentUser) {
      try {
        const cols = ['machines', 'sensorReadings', 'predictions', 'alerts', 'workOrders'];
        for (const colName of cols) {
          const snapshot = await getDocs(collection(db, colName));
          for (const docSnap of snapshot.docs) {
            await deleteDoc(docSnap.ref);
          }
        }
        await seedFirestoreDatabase(currentUser);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'resetAllData');
      }
    } else {
      const seed = generateSeedData();
      setMachines(seed.machines);
      setSensorReadings(seed.sensorReadings);
      setPredictions(seed.predictions);
      setAlerts(seed.alerts);
      setWorkOrders(seed.workOrders);
      
      localStorage.setItem('fp_machines', JSON.stringify(seed.machines));
      localStorage.setItem('fp_readings', JSON.stringify(seed.sensorReadings));
      localStorage.setItem('fp_predictions', JSON.stringify(seed.predictions));
      localStorage.setItem('fp_alerts', JSON.stringify(seed.alerts));
      localStorage.setItem('fp_workorders', JSON.stringify(seed.workOrders));
    }
  };

  const persistState = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // ASSETS OPERATIONS (CRUD)
  const addMachine = async (newM: Omit<Machine, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `mach-${Math.random().toString(36).substr(2, 9)}`;
    const fullMachine: Machine = {
      ...newM,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isFirebaseConfigured && db && currentUser) {
      try {
        await setDoc(doc(db, 'machines', id), fullMachine);

        // Seed Nominal reading
        const initReading: SensorReading = {
          machineId: id,
          temperature: 42,
          vibration: 1.1,
          pressure: 2.8,
          rotationalSpeed: 1450,
          torque: 95,
          toolWear: 12,
          humidity: 50,
          powerConsumption: 12,
          timestamp: new Date().toISOString()
        };
        const rId = `read-${Math.random().toString(36).substr(2, 9)}`;
        await setDoc(doc(db, 'sensorReadings', rId), initReading);

        const initPred = calculateMachineHealth(initReading);
        const pId = `pred-${Math.random().toString(36).substr(2, 9)}`;
        await setDoc(doc(db, 'predictions', pId), initPred);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `machines/${id}`);
      }
    } else {
      const updated = [fullMachine, ...machines];
      setMachines(updated);
      persistState('fp_machines', updated);

      const initReading: SensorReading = {
        machineId: id,
        temperature: 42,
        vibration: 1.1,
        pressure: 2.8,
        rotationalSpeed: 1450,
        torque: 95,
        toolWear: 12,
        humidity: 50,
        powerConsumption: 12,
        timestamp: new Date().toISOString()
      };
      
      const initPred = calculateMachineHealth(initReading);
      const updatedReadings = [initReading, ...sensorReadings];
      const updatedPreds = [initPred, ...predictions];

      setSensorReadings(updatedReadings);
      setPredictions(updatedPreds);
      persistState('fp_readings', updatedReadings);
      persistState('fp_predictions', updatedPreds);
    }
  };

  const updateMachine = async (id: string, updatedFields: Partial<Machine>) => {
    if (isFirebaseConfigured && db && currentUser) {
      try {
        const cleanedFields = { ...updatedFields, updatedAt: new Date().toISOString() };
        await updateDoc(doc(db, 'machines', id), cleanedFields);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `machines/${id}`);
      }
    } else {
      const updated = machines.map(m => {
        if (m.id === id) {
          return {
            ...m,
            ...updatedFields,
            updatedAt: new Date().toISOString()
          };
        }
        return m;
      });
      setMachines(updated);
      persistState('fp_machines', updated);
    }
  };

  const deleteMachine = async (id: string) => {
    if (isFirebaseConfigured && db && currentUser) {
      try {
        await deleteDoc(doc(db, 'machines', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `machines/${id}`);
      }
    } else {
      const updatedMachines = machines.filter(m => m.id !== id);
      const updatedReadings = sensorReadings.filter(r => r.machineId !== id);
      const updatedPreds = predictions.filter(p => p.machineId !== id);
      const updatedAlerts = alerts.filter(a => a.machineId !== id);
      const updatedWorkorders = workOrders.filter(w => w.machineId !== id);

      setMachines(updatedMachines);
      setSensorReadings(updatedReadings);
      setPredictions(updatedPreds);
      setAlerts(updatedAlerts);
      setWorkOrders(updatedWorkorders);

      persistState('fp_machines', updatedMachines);
      persistState('fp_readings', updatedReadings);
      persistState('fp_predictions', updatedPreds);
      persistState('fp_alerts', updatedAlerts);
      persistState('fp_workorders', updatedWorkorders);
    }
  };

  // LIVE SENSOR SIMULATION INTAKE
  const addSensorReading = async (r: Omit<SensorReading, 'timestamp'>) => {
    const completeReading: SensorReading = {
      ...r,
      timestamp: new Date().toISOString()
    };
    const pred = calculateMachineHealth(completeReading);

    if (isFirebaseConfigured && db && currentUser) {
      try {
        const rId = `read-${Math.random().toString(36).substr(2, 9)}`;
        await setDoc(doc(db, 'sensorReadings', rId), completeReading);

        // Retrieve existing predictions for this machine and overwrite or add
        const pSnapshot = await getDocs(collection(db, 'predictions'));
        let pIdToUpdate = `pred-${Math.random().toString(36).substr(2, 9)}`;
        pSnapshot.forEach(docSnap => {
          if ((docSnap.data() as Prediction).machineId === r.machineId) {
            pIdToUpdate = docSnap.id;
          }
        });
        await setDoc(doc(db, 'predictions', pIdToUpdate), pred);

        // Update machines
        let nextStatus = 'Healthy';
        if (pred.riskLevel === 'Critical') nextStatus = 'Critical';
        else if (pred.riskLevel === 'High' || pred.riskLevel === 'Medium') nextStatus = 'Warning';
        await updateDoc(doc(db, 'machines', r.machineId), { status: nextStatus, updatedAt: new Date().toISOString() });

        if (pred.riskLevel !== 'Low') {
          let severity: 'Info' | 'Warning' | 'High' | 'Critical' = 'Warning';
          if (pred.riskLevel === 'Critical') severity = 'Critical';
          else if (pred.riskLevel === 'High') severity = 'High';

          const mach = machines.find(m => m.id === r.machineId);
          const mName = mach ? mach.name : 'Unknown Asset';
          const mType = mach ? mach.type : 'Machinery';

          const aId = `alt-${Math.random().toString(36).substr(2, 9)}`;
          const newAlert: Alert = {
            id: aId,
            machineId: r.machineId,
            machineName: mName,
            title: `${mType} - Out of Bounds Telemetry`,
            message: `${pred.riskLevel} failure risk! Health Index: ${pred.healthScore}%, Failure Risk: ${pred.failureProbability}%. Action: ${pred.recommendedAction}`,
            severity,
            status: 'Active',
            createdAt: new Date().toISOString()
          };
          await setDoc(doc(db, 'alerts', aId), newAlert);

          if (severity === 'Critical') {
            const hasOpenCriticalWO = workOrders.some(w => w.machineId === r.machineId && w.priority === 'Urgent' && w.status !== 'Done' && w.status !== 'Cancelled');
            if (!hasOpenCriticalWO) {
              await addWorkOrder({
                title: `Emergency Repair: ${mName}`,
                description: `Auto-generated safety intervention. Component telemetry values violated core tolerances. Operational Recommendation: ${pred.recommendedAction}`,
                machineId: r.machineId,
                machineName: mName,
                assignedTo: "tech1@factorypulse.com",
                priority: "Urgent",
                status: "In Progress",
                dueDate: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
              });
            }
          }
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'sensorReadings');
      }
    } else {
      const copyReadings = [completeReading, ...sensorReadings];
      setSensorReadings(copyReadings);
      persistState('fp_readings', copyReadings);

      const cleanPreds = predictions.filter(p => p.machineId !== r.machineId);
      const updatedPreds = [pred, ...cleanPreds];
      setPredictions(updatedPreds);
      persistState('fp_predictions', updatedPreds);

      const mach = machines.find(m => m.id === r.machineId);
      if (mach) {
        let nextStatus = mach.status;
        if (pred.riskLevel === 'Critical') nextStatus = 'Critical';
        else if (pred.riskLevel === 'High' || pred.riskLevel === 'Medium') nextStatus = 'Warning';
        else nextStatus = 'Healthy';

        updateMachine(r.machineId, { status: nextStatus });
      }

      if (pred.riskLevel !== 'Low') {
        let severity: 'Info' | 'Warning' | 'High' | 'Critical' = 'Warning';
        if (pred.riskLevel === 'Critical') severity = 'Critical';
        else if (pred.riskLevel === 'High') severity = 'High';

        const mName = mach ? mach.name : 'Unknown Asset';
        const mType = mach ? mach.type : 'Machinery';

        const newAlert: Alert = {
          id: `alt-${Math.random().toString(36).substr(2, 9)}`,
          machineId: r.machineId,
          machineName: mName,
          title: `${mType} - Out of Bounds Telemetry`,
          message: `${pred.riskLevel} failure risk! Health Index: ${pred.healthScore}%, Failure Risk: ${pred.failureProbability}%. Action: ${pred.recommendedAction}`,
          severity,
          status: 'Active',
          createdAt: new Date().toISOString()
        };

        const copyAlerts = [newAlert, ...alerts];
        setAlerts(copyAlerts);
        persistState('fp_alerts', copyAlerts);

        if (severity === 'Critical') {
          const hasOpenCriticalWO = workOrders.some(w => w.machineId === r.machineId && w.priority === 'Urgent' && w.status !== 'Done' && w.status !== 'Cancelled');
          if (!hasOpenCriticalWO) {
            addWorkOrder({
              title: `Emergency Repair: ${mName}`,
              description: `Auto-generated safety intervention. Component telemetry values violated core tolerances. Operational Recommendation: ${pred.recommendedAction}`,
              machineId: r.machineId,
              machineName: mName,
              assignedTo: "tech1@factorypulse.com",
              priority: "Urgent",
              status: "In Progress",
              dueDate: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
            });
          }
        }
      }
    }
  };

  // ALERTS CENTER ACTIONS
  const resolveAlert = async (alertId: string) => {
    if (isFirebaseConfigured && db && currentUser) {
      try {
        await updateDoc(doc(db, 'alerts', alertId), { status: 'Resolved' });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `alerts/${alertId}`);
      }
    } else {
      const updated = alerts.map(a => {
        if (a.id === alertId) {
          return { ...a, status: 'Resolved' as const };
        }
        return a;
      });
      setAlerts(updated);
      persistState('fp_alerts', updated);
    }
  };

  // WORK ORDERS INTERACTIVE ENGINE
  const addWorkOrder = async (wo: Omit<WorkOrder, 'id' | 'createdAt'>) => {
    const id = `wo-${Math.random().toString(36).substr(2, 9)}`;
    const fullWo: WorkOrder = {
      ...wo,
      id,
      createdAt: new Date().toISOString()
    };

    if (isFirebaseConfigured && db && currentUser) {
      try {
        await setDoc(doc(db, 'workOrders', id), fullWo);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `workOrders/${id}`);
      }
    } else {
      const updated = [fullWo, ...workOrders];
      setWorkOrders(updated);
      persistState('fp_workorders', updated);
    }
  };

  const updateWorkOrderStatus = async (woId: string, status: any) => {
    if (isFirebaseConfigured && db && currentUser) {
      try {
        const completedAt = status === 'Done' ? new Date().toISOString() : '';
        const updateData: any = { status };
        if (completedAt) updateData.completedAt = completedAt;
        await updateDoc(doc(db, 'workOrders', woId), updateData);

        if (status === 'Done') {
          const w = workOrders.find(o => o.id === woId);
          if (w) {
            await addSensorReading({
              machineId: w.machineId,
              temperature: 42,
              vibration: 1.0,
              pressure: 3.0,
              rotationalSpeed: 1450,
              torque: 90,
              toolWear: 5,
              humidity: 50,
              powerConsumption: 12
            });
          }
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `workOrders/${woId}`);
      }
    } else {
      const updated = workOrders.map(w => {
        if (w.id === woId) {
          const completedAt = status === 'Done' ? new Date().toISOString() : undefined;
          
          if (status === 'Done') {
            setTimeout(() => {
              addSensorReading({
                machineId: w.machineId,
                temperature: 42,
                vibration: 1.0,
                pressure: 3.0,
                rotationalSpeed: 1450,
                torque: 90,
                toolWear: 5,
                humidity: 50,
                powerConsumption: 12
              });
            }, 200);
          }

          return { ...w, status, completedAt };
        }
        return w;
      });
      setWorkOrders(updated);
      persistState('fp_workorders', updated);
    }
  };

  const assignWorkOrder = async (woId: string, assignedTo: string) => {
    if (isFirebaseConfigured && db && currentUser) {
      try {
        await updateDoc(doc(db, 'workOrders', woId), { assignedTo, status: 'In Progress' });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `workOrders/${woId}`);
      }
    } else {
      const updated = workOrders.map(w => {
        if (w.id === woId) {
          return { ...w, assignedTo, status: 'In Progress' as const };
        }
        return w;
      });
      setWorkOrders(updated);
      persistState('fp_workorders', updated);
    }
  };

  return (
    <StateContext.Provider value={{
      language,
      theme,
      userRole,
      currentUser,
      machines,
      sensorReadings,
      predictions,
      alerts,
      workOrders,
      setLanguage,
      setTheme,
      setUserRole,
      loginWithGoogle,
      logout,
      addMachine,
      updateMachine,
      deleteMachine,
      addSensorReading,
      resolveAlert,
      addWorkOrder,
      updateWorkOrderStatus,
      assignWorkOrder,
      resetAllData
    }}>
      {children}
    </StateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used inside a StateProvider');
  }
  return context;
}
