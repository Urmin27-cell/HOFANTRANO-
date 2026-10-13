import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging/sw';

// Load config from a public-accessible way or hardcode if needed for sw
const firebaseConfig = {
    // These should ideally be environment variables
    apiKey: "YOUR_API_KEY",
    projectId: "gen-lang-client-0235676341",
    messagingSenderId: "183924441253",
    appId: "1:183924441253:web:b833e21e5994c9ffe1cd4c"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
