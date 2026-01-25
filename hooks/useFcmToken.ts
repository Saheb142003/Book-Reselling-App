"use client";

import { useEffect, useState } from "react";
import { getMessaging, getToken } from "firebase/messaging";
import { app } from "@/lib/firebase";

const useFcmToken = () => {
  const [token, setToken] = useState("");
  const [notificationPermissionStatus, setNotificationPermissionStatus] =
    useState("");

  useEffect(() => {
    const retrieveToken = async () => {
      try {
        if (typeof window !== "undefined" && "serviceWorker" in navigator) {
          const messaging = getMessaging(app);

          // Request permission
          const permission = await Notification.requestPermission();
          setNotificationPermissionStatus(permission);

          if (permission === "granted") {
            const currentToken = await getToken(messaging, {
              vapidKey: "YOUR_VAPID_KEY_HERE", // Optional if not using VAPID, but recommended
            });
            if (currentToken) {
              setToken(currentToken);
              // Token retrieved
            } else {
              // No registration token available
            }
          }
        }
      } catch (error) {
        console.log("An error occurred while retrieving token:", error);
      }
    };

    retrieveToken();
  }, []);

  return { token, notificationPermissionStatus };
};

export default useFcmToken;
