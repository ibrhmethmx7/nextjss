import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";
import fs from "fs";

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

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const roomId = "mpe32v";

async function fetchChat() {
    console.log(`Fetching chat history for room: ${roomId}...`);
    const chatRef = ref(database, `rooms/${roomId}/messages`);
    try {
        const snapshot = await get(chatRef);
        if (snapshot.exists()) {
            const data = snapshot.val();
            const messages = Object.values(data).sort((a, b) => a.time - b.time);

            let fileContent = "--- CHAT HISTORY ---\n\n";
            messages.forEach(msg => {
                const date = new Date(msg.time).toLocaleTimeString();
                fileContent += `[${date}] ${msg.user}: ${msg.text}\n`;
            });
            fileContent += "\n--- END OF CHAT ---\n";

            fs.writeFileSync("chat_history_full.txt", fileContent);
            console.log("Chat history saved to chat_history_full.txt");
        } else {
            console.log("No messages found.");
        }
    } catch (error) {
        console.error("Error fetching chat:", error);
    } finally {
        process.exit();
    }
}

fetchChat();
