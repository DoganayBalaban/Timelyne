import api from "./client";

export interface SubscriptionStatus {
  plan: string;
  plan_expires_at: string | null;
  stripe_subscription_status: string | null;
  stripe_subscription_id: string | null;
}

export const subscriptionsApi = {
  getStatus: async (): Promise<{ success: boolean; data: SubscriptionStatus }> => {
    const response = await api.get("/subscriptions/status");
    return response.data;
  },

  createCheckout: async (
    priceId: string,
  ): Promise<{ success: boolean; url: string }> => {
    const response = await api.post("/subscriptions/checkout", { priceId });
    return response.data;
  },

  openPortal: async (): Promise<{ success: boolean; url: string }> => {
    const response = await api.post("/subscriptions/portal");
    return response.data;
  },
};

export default subscriptionsApi;
