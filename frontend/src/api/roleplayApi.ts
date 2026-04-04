import apiClient from "../axios/apiClient";

export const startSession = async () => {
  const response = await apiClient.post("/session/start");
  return response.data;
};

export const sendMessage = async (sessionId: string, text: string) => {
  const response = await apiClient.post("/message", { sessionId, text });
  return response.data;
};

export const endSession = async (sessionId: string) => {
  const response = await apiClient.post("/session/end", { sessionId });
  return response.data;
};
