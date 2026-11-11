import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// Configuración de Ragnarok (Auth Principal)
const ragnarokConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_RAGNAROK_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_RAGNAROK_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_RAGNAROK_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_RAGNAROK_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_RAGNAROK_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_RAGNAROK_APP_ID
};

// Configuración de Valhalla Service
const serviceConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_SERVICE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_SERVICE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_SERVICE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_SERVICE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_SERVICE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_SERVICE_APP_ID
};

// Configuración de Valhalla Express
const expressConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_EXPRESS_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_EXPRESS_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_EXPRESS_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_EXPRESS_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_EXPRESS_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_EXPRESS_APP_ID
};

// Configuración de Valhalla Store
const storeConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_STORE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_STORE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_STORE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_STORE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_STORE_APP_ID
};

// Inicialización de Apps de Firebase
const appRagnarok = initializeApp(ragnarokConfig, "appRagnarok");
const appService = initializeApp(serviceConfig, "appService");
const appExpress = initializeApp(expressConfig, "appExpress");
const appStore = initializeApp(storeConfig, "appStore");

// Instancia de Autenticación ligada a Ragnarok (Restringida estrictamente al jefe)
export const auth = getAuth(appRagnarok);
const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Validación estricta de seguridad por correo del jefe
    if (user.email !== 'gfabian395@gmail.com') {
      await signOut(auth);
      throw new Error("Acceso denegado. Este panel es exclusivo del administrador maestro.");
    }
    return user;
  } catch (error) {
    console.error("Error en autenticación:", error.message);
    throw error;
  }
};

export const logoutAdmin = () => signOut(auth);

// Instancias de Firestore para los 3 proyectos
export const dbService = getFirestore(appService);
export const dbExpress = getFirestore(appExpress);
export const dbStore = getFirestore(appStore);

// Función auxiliar para formatear fechas de alta y calcular vencimientos (30 días)
const parseDates = (rawDate) => {
  let createdStr = "Reciente";
  let dueStr = "A coordinar";

  try {
    let dateObj = null;
    if (rawDate) {
      if (rawDate.toDate) {
        dateObj = rawDate.toDate();
      } else {
        dateObj = new Date(rawDate);
      }
    }

    if (dateObj && !isNaN(dateObj.getTime())) {
      createdStr = dateObj.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      
      // Calcular fecha de pago (30 días después del alta)
      const dueDate = new Date(dateObj);
      dueDate.setDate(dueDate.getDate() + 30);
      dueStr = dueDate.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
  } catch (e) {
    console.error("Error parseando fecha:", e);
  }

  return { createdStr, dueStr };
};

export const fetchAllTenants = async () => {
  let allTenants = [];

  // 1. Service
  try {
    const serviceSnap = await getDocs(collection(dbService, "comercios"));
    serviceSnap.forEach((docSnap) => {
      const data = docSnap.data();
      const isActive = data.status !== undefined ? Boolean(data.status) : false;
      const { createdStr, dueStr } = parseDates(data.createdAt);

      allTenants.push({
        id: docSnap.id,
        project: "service",
        name: data.name || "Sin nombre",
        type: "Service",
        owner: data.ownerName || "Desconocido",
        phone: data.phone || "",
        email: data.ownerEmail || "",
        precioUnico: 80000, // Plan Único Valhalla Service (Alta inicial)
        mantenimientoMensual: 40000, // Cuota mensual
        isActive,
        createdAt: createdStr,
        dueDate: dueStr,
      });
    });
  } catch (error) {
    console.error("Error Service:", error.message);
  }

  // 2. Express
  try {
    const expressSnap = await getDocs(collection(dbExpress, "comercios"));
    expressSnap.forEach((docSnap) => {
      const data = docSnap.data();
      const isActive = data.activo !== undefined ? Boolean(data.activo) : false;
      const { createdStr, dueStr } = parseDates(data.createdAt);

      allTenants.push({
        id: docSnap.id,
        project: "express",
        name: data.name || "Sin nombre",
        type: "Express",
        owner: data.ownerName || "Desconocido",
        phone: data.phone || "",
        email: data.ownerEmail || "",
        precioUnico: 100000, // Valhalla Express Pro (Alta inicial)
        mantenimientoMensual: 50000, // Cuota mensual
        isActive,
        createdAt: createdStr,
        dueDate: dueStr,
      });
    });
  } catch (error) {
    console.error("Error Express:", error.message);
  }

  // 3. Store (Mapeo corregido con campos reales: nombreComercio, whatsapp, etc.)
  try {
    const storeSnap = await getDocs(collection(dbStore, "comercios"));
    storeSnap.forEach((docSnap) => {
      const data = docSnap.data();
      const isActive = data.activo !== undefined ? Boolean(data.activo) : false;
      const { createdStr, dueStr } = parseDates(data.createdAt);

      allTenants.push({
        id: docSnap.id,
        project: "store",
        name: data.nombreComercio || data.name || "Sin nombre",
        type: "Store",
        owner: data.ownerName || data.ownerEmail || "Desconocido",
        phone: data.whatsapp || data.phone || "",
        email: data.ownerEmail || "",
        precioUnico: 100000, // Valhalla Store Pro (Alta inicial)
        mantenimientoMensual: 50000, // Cuota mensual
        isActive,
        createdAt: createdStr,
        dueDate: dueStr,
      });
    });
  } catch (error) {
    console.error("Error Store:", error.message);
  }

  return allTenants;
};

export const toggleTenantStatus = async (projectId, docId, currentStatus) => {
  try {
    let targetDb;
    let fieldName = "activo";

    if (projectId === "service") {
      targetDb = dbService;
      fieldName = "status";
    } else if (projectId === "express") {
      targetDb = dbExpress;
    } else {
      targetDb = dbStore;
    }

    const docRef = doc(targetDb, "comercios", docId);
    await updateDoc(docRef, { [fieldName]: !currentStatus });
    return true;
  } catch (error) {
    console.error("Error al cambiar estado:", error);
    return false;
  }
};