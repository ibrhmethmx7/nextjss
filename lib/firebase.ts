// Firebase Configuration
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyBRHLugsDzG0Zotrf-9V0LebV427dgOP0s",
    authDomain: "nema-4aa8c.firebaseapp.com",
    databaseURL: "https://nema-4aa8c-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "nema-4aa8c",
    storageBucket: "nema-4aa8c.firebasestorage.app",
    messagingSenderId: "93584838790",
    appId: "1:93584838790:web:2bf526fbbe18d4a3c84107",
    measurementId: "G-MLP99KT4M7"
};

// YouTube API Key
export const YOUTUBE_API_KEY = "AIzaSyDKlF_i_-8mGkExJPN4p6wdOwMR41xCTxs";

import { getStorage } from "firebase/storage";

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const storage = getStorage(app);
export default app;
