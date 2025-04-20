import { useEffect } from "react";
import { messaging } from "@/firebase";
import { getToken } from "firebase/messaging";
import { toast } from "sonner";

const FCMTokenManager = () => {
  useEffect(() => {
    const requestPermissionAndGetToken = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const token = await getToken(messaging, {
            vapidKey: "BFOoQZCgpeQ9sNVxwQwj5aH7g0JdVWaFRkcq419LbKz2EQIzqq-1VXOPYrMcMUNyAqOhKxLv7RsKWksjDa4B5fQ", // 🔐 Replace with your VAPID key from Firebase Console
          });

          if (token) {
            console.log("📲 FCM Token:", token);
            // Optional: Save to Firestore for backend targeting
          } else {
            console.warn("No FCM registration token available.");
          }
        } else {
          toast.warning("Notification permissions denied");
        }
      } catch (err) {
        console.error("Error getting FCM token", err);
      }
    };

    requestPermissionAndGetToken();
  }, []);

  return null;
};

export default FCMTokenManager;
