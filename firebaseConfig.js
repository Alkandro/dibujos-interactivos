import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyD0B8A-BZxchHlbQzH-C8URrUqgRstIuQo",
  authDomain: "dibujos-interactivos.firebaseapp.com",
  databaseURL: "https://dibujos-interactivos-default-rtdb.firebaseio.com",
  projectId: "dibujos-interactivos",
  storageBucket: "dibujos-interactivos.firebasestorage.app",
  messagingSenderId: "638125695980",
  appId: "1:638125695980:web:43820e72734c869887d6c9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);