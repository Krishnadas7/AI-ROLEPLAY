import apiClient from "../axios/apiClient";

export const identifyUser = async (name: string, email: string) => {
  
  const response = await apiClient.post("/user/identify", { name, email });
  return response.data;
};

export const startSession = async (userId: string, scenarioId: string) => {
  const response = await apiClient.post("/session/start", { userId, scenarioId });
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

export const getSessionHistory = async (userId: string) => {
  const response = await apiClient.get(`/session/history?userId=${userId}`);
  return response.data;
};

export const getSessionDetails = async (sessionId: string) => {
  const response = await apiClient.get(`/session/${sessionId}/details`);
  return response.data;
};
