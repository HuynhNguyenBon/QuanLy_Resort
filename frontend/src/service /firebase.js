import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAnsR1NJ4jUAVsuRVI1LTsiNIzBNXAzigg",
  authDomain: "bbhh-chat.firebaseapp.com",
  databaseURL: "https://bbhh-chat-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bbhh-chat",
  storageBucket: "bbhh-chat.firebasestorage.app",
  messagingSenderId: "99148281007",
  appId: "1:99148281007:web:b10e148d92319463be905a",
  measurementId: "G-JRB5GZBGHW"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
