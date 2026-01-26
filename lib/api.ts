import { NotificationType } from "@/types";
import api from "./config/axios";

export const addNotification = async (notification: NotificationType) => {
  try {
    const res = await api.post("/api/notification", notification);
    if (res.status === 201) {
      return res;
    }
  } catch (err: any) {
    console.error(err);
  }
};

export const updateNotification = async (notificationId: string) => {
  try {
    const res = await api.put(`/api/notification/${notificationId}`, {
      status: "read",
    });
    if (res.status === 201) {
      return res;
    }
  } catch (err: any) {
    console.error(err);
  }
};
