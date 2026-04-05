import type { AxiosResponse } from "axios";
import apiClient from "../axios/apiClient";
import { 
  validateIdentifyUser, 
  validateStartSession, 
  validateSendMessage, 
  validateRequiredId 
} from "../utils/validation";

interface Error {
  response?: {
    data?: {
      message: string,
    }
  }
}

export const identifyUser = async (name: string, email: string) => {
  const error = validateIdentifyUser(name, email);
  if (error) return error;

  try {
    const response: AxiosResponse = await apiClient.post("/user/identify", { name, email });
    return response.data;
  } catch (error) {
    console.log(error);
    return (error as Error).response?.data;
  }
};

export const startSession = async (userId: string, scenarioId: string) => {
  const error = validateStartSession(userId, scenarioId);
  if (error) return error;

  try {
    const response: AxiosResponse = await apiClient.post("/session/start", { userId, scenarioId });
    return response.data;
  } catch (error) {
    console.log(error);
    return (error as Error).response?.data;
  }
};

export const sendMessage = async (sessionId: string, text: string) => {
  const error = validateSendMessage(sessionId, text);
  if (error) return error;

  try {
    const response: AxiosResponse = await apiClient.post("/message", { sessionId, text });
    return response.data;
  } catch (error) {
    console.log(error);
    return (error as Error).response?.data;
  }
};

export const endSession = async (sessionId: string) => {
  const error = validateRequiredId(sessionId, "Session ID");
  if (error) return error;

  try {
    const response: AxiosResponse = await apiClient.post("/session/end", { sessionId });
    return response.data;
  } catch (error) {
    console.log(error);
    return (error as Error).response?.data;
  }
};

export const getSessionHistory = async (userId: string) => {
  const error = validateRequiredId(userId, "User ID");
  if (error) return error;

  try {
    const response: AxiosResponse = await apiClient.get(`/session/history?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.log(error);
    return (error as Error).response?.data;
  }
};

export const getSessionDetails = async (sessionId: string) => {
  const error = validateRequiredId(sessionId, "Session ID");
  if (error) return error;

  try {
    const response: AxiosResponse = await apiClient.get(`/session/${sessionId}/details`);
    return response.data;
  } catch (error) {
    console.log(error);
    return (error as Error).response?.data;
  }
};
