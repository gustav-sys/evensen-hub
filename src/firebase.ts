import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD82ppbgCIsJJa2tJq6ndFeSpDOdi2o5yw",
  authDomain: "evensen-hub.firebaseapp.com",
  projectId: "evensen-hub",
  storageBucket: "evensen-hub.firebasestorage.app",
  messagingSenderId: "652912505878",
  appId: "1:652912505878:web:5f2f97cac85e6e68b53137"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
