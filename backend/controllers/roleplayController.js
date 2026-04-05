import { Message } from "../models/MessageModel.js";
import { generateNextMessage } from "../services/aiService.js";
import { Session } from "../models/SessionModel.js";
import { sendMessageSchema } from "../validations/index.js";
export const sendMessage = async (req, res, next) => {
  try {
    const parsed = sendMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    }
    const { sessionId, text } = parsed.data;

    // Find the session and scenario
    const session = await Session.findById(sessionId).populate("scenarioId");
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found." });
    }

    const scenario = session.scenarioId;

    // Save user's message
    const userMessage = await Message.create({
      sessionId: session._id,
      sender: "user",
      text: text,
    });

    // Fetch all previous conversation context for this session
    const messages = await Message.find({ sessionId: session._id }).sort({ timestamp: 1 });

    const formatMessagesForClaude = (msgs) => {
      const formatted = [];
      
      if (msgs.length > 0 && msgs[0].sender === "ai") {
         formatted.push({ role: "user", content: "Begin the roleplay." });
      }

      for (const m of msgs) {
        formatted.push({
          role: m.sender === "ai" ? "assistant" : "user",
          content: m.text,
        });
      }
      return formatted;
    };

    const claudeMessages = formatMessagesForClaude(messages);

    const aiText = await generateNextMessage(scenario, claudeMessages);

    // Save AI's response
    const aiMessage = await Message.create({
      sessionId: session._id,
      sender: "ai",
      text: aiText,
    });

    res.status(200).json({
      success: true,
      data: {
        userMessage,
        aiMessage,
      },
    });
  } catch (error) {
    next(error);
  }
};

