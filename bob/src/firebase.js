// // src/firebase.js
// import { initializeApp, getApps } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";

// const firebaseConfig = {
//     apiKey: "AIzaSyBNjmufzqNobIOE34LtTYav35t2g9y99u8",
//     authDomain: "bob-bde-ensc.firebaseapp.com",
//     projectId: "bob-bde-ensc",
//     storageBucket: "bob-bde-ensc.appspot.com",  // Corrigé ici
//     messagingSenderId: "771117445168",
//     appId: "1:771117445168:web:ab99062f9c3eb351f87df5",
//     measurementId: "G-9V5LSZW3C3"
// };

// // Initialize Firebase only if it hasn't been initialized already
// const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// // Initialisation de l'authentification
// const auth = getAuth(app);

// // Initialisation de l'analytics uniquement si on est dans un environnement navigateur
// const analytics = (typeof window !== 'undefined') ? getAnalytics(app) : null;

// export { auth, analytics };

// // Helper function to check if Firebase is initialized
// export const isFirebaseInitialized = () => {
//     return getApps().length > 0;
// };
