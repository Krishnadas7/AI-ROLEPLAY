export const validateIdentifyUser = (name: string, email: string) => {
  if (!name?.trim()) return { success: false, message: "Name is required" };
  if (!email?.trim()) return { success: false, message: "Email is required" };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return { success: false, message: "Invalid email format" };
  return null;
};

export const validateStartSession = (userId: string, scenarioId: string) => {
  if (!userId?.trim()) return { success: false, message: "User ID is required" };
  if (!scenarioId?.trim()) return { success: false, message: "Scenario ID is required" };
  return null;
};

export const validateSendMessage = (sessionId: string, text: string) => {
  if (!sessionId?.trim()) return { success: false, message: "Session ID is required" };
  if (!text?.trim()) return { success: false, message: "Message text is required" };
  return null;
};

export const validateRequiredId = (id: string, idName: string) => {
  if (!id?.trim()) return { success: false, message: `${idName} is required` };
  return null;
};
