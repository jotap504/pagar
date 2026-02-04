import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCAfzN7NXx26soR4UFW8TU5cNg1aiS42dk",
    authDomain: "pagar-webonline.firebaseapp.com",
    projectId: "pagar-webonline",
    storageBucket: "pagar-webonline.firebasestorage.app",
    messagingSenderId: "590288587780",
    appId: "1:590288587780:web:75856ccf8f7116b2d63951",
    measurementId: "G-M9K5XYJ7KH"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, "pagar-webonline");
export default app;

