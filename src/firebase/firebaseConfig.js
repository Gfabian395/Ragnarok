import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";

// 1. Configuración de Valhalla Service
const serviceConfig = {
  apiKey: "AIzaSyAU5f7NM_CvxM_UU7CRIAfIdxT4gCOpEJE",
  authDomain: "valhalla-service-c8523.firebaseapp.com",
  projectId: "valhalla-service-c8523",
  storageBucket: "valhalla-service-c8523.firebasestorage.app",
  messagingSenderId: "955141773947",
  appId: "1:955141773947:web:8173ed455b539434caa0de"
};

// 2. Configuración de Valhalla Express
const expressConfig = {
  apiKey: "AIzaSyAwwUvJeU2se9Iv51W4zlrEvTiI97zzh7E",
  authDomain: "valhalla-3f8d9.firebaseapp.com",
  projectId: "valhalla-3f8d9",
  storageBucket: "valhalla-3f8d9.firebasestorage.app",
  messagingSenderId: "250806874015",
  appId: "1:250806874015:web:d4c4efd9fb1516e3b817aa"
};

// 3. Configuración de Valhalla Store
const storeConfig = {
  apiKey: "AIzaSyDpPrbA0EIYesjtjA-_lglN5CURR-w5FJA",
  authDomain: "valhalla-store-ff5f0.firebaseapp.com",
  projectId: "valhalla-store-ff5f0",
  storageBucket: "valhalla-store-ff5f0.firebasestorage.app",
  messagingSenderId: "165476949219",
  appId: "1:165476949219:web:ad67e6c13df7840091b9d6"
};

const appService = initializeApp(serviceConfig, "appService");
const appExpress = initializeApp(expressConfig, "appExpress");
const appStore = initializeApp(storeConfig, "appStore");

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
      const isActive = data.status !== undefined ? Boolean(data.status) : true;
      const { createdStr, dueStr } = parseDates(data.createdAt);

      allTenants.push({
        id: docSnap.id,
        project: "service",
        name: data.name || "Sin nombre",
        type: "Service",
        owner: data.ownerName || "Desconocido",
        phone: data.phone || "",
        email: data.ownerEmail || "",
        price: data.planPrice || 20000,
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
      const isActive = data.activo !== undefined ? Boolean(data.activo) : true;
      const { createdStr, dueStr } = parseDates(data.createdAt);

      allTenants.push({
        id: docSnap.id,
        project: "express",
        name: data.name || "Sin nombre",
        type: "Express",
        owner: data.ownerName || "Desconocido",
        phone: data.phone || "",
        email: data.ownerEmail || "",
        price: 15000,
        isActive,
        createdAt: createdStr,
        dueDate: dueStr,
      });
    });
  } catch (error) {
    console.error("Error Express:", error.message);
  }

  // 3. Store
  try {
    const storeSnap = await getDocs(collection(dbStore, "comercios"));
    storeSnap.forEach((docSnap) => {
      const data = docSnap.data();
      const isActive = data.activo !== undefined ? Boolean(data.activo) : true;
      const { createdStr, dueStr } = parseDates(data.createdAt);

      allTenants.push({
        id: docSnap.id,
        project: "store",
        name: data.nombreComercio || data.name || "Sin nombre",
        type: "Store",
        owner: data.ownerName || "Desconocido",
        phone: data.whatsapp || data.phone || "",
        email: data.ownerEmail || "",
        price: 20000,
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