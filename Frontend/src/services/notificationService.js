import { messaging } from "../firebase";
import { getToken, onMessage } from "firebase/messaging";

// VAPID key from Firebase Console > Project Settings > Cloud Messaging
const vapidKey = "BFOoQZCgpeQ9sNVxwQwj5aH7g0JdVWaFRkcq419LbKz2EQIzqq-1VXOPYrMcMUNyAqOhKxLv7RsKWksjDa4B5fQ";

export const requestForToken = async () => {
  try {
    const currentToken = await getToken(messaging, { vapidKey });
    if (currentToken) {
      console.log("Current token for client: ", currentToken);
      return currentToken;
    } else {
      console.log("No registration token available. Request permission to generate one.");
      return null;
    }
  } catch (err) {
    console.log("An error occurred while retrieving token. ", err);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });