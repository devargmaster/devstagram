import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCc4Z5XWUj56704bwMNDFALe46_Xs4fEIQ",
  authDomain: "cwm-2024-1-n.firebaseapp.com",
  projectId: "cwm-2024-1-n",
  storageBucket: "cwm-2024-1-n.appspot.com",
  messagingSenderId: "997932762737",
  appId: "1:997932762737:web:1277e5a938ca31d8803dd0"
};


export const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app);

export const storage = getStorage(app);
