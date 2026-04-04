import { Session } from "../models/SessionModel.js";
import { Message } from "../models/MessageModel.js";
import { Scenario } from "../models/ScenarioModel.js";
import { generateInitialMessage, generateNextMessage } from "../services/aiService.js";

export const startSession = async (req, res) => {
  try {
    // Check if the "Mobile Stolen" scenario exists, if not create it
    let scenario = await Scenario.findOne({ title: "Mobile Stolen" });
    if (!scenario) {
      scenario = await Scenario.create({
        title: "Mobile Stolen",
        description: "Customer calls because their mobile phone was stolen and they need to block the SIM and order a replacement.",
        aiPersona: {
          name: "Rahul Mehta",
          age: 35,
          tone: "distressed, urgent",
        },
      });
    }

    // Create a new session
    const session = await Session.create({
      scenarioId: scenario._id,
      status: "in_progress",
    });

    const aiText = await generateInitialMessage(scenario);

    // We don't save the "Begin the roleplay." prompt as a user message, we just save the AI's first response.
    const messageRecord = await Message.create({
      sessionId: session._id,
      sender: "ai",
      text: aiText,
    });

    res.status(200).json({
      success: true,
      data: {
        session,
        initialMessage: messageRecord,
      },
    });
  } catch (error) {
    console.error("Start Session Error:", error);
    res.status(500).json({ success: false, error: error });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { sessionId, text } = req.body;

    if (!sessionId || !text) {
      return res.status(400).json({ success: false, message: "sessionId and text are required." });
    }

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
    console.error("Send Message Error:", error);
    res.status(500).json({ success: false, message: "Failed to send message." });
  }
};

export const endSession = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ success: false, message: "sessionId is required." });
    }

    const session = await Session.findByIdAndUpdate(
      sessionId,
      { status: "completed", endedAt: new Date() },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found." });
    }

    res.status(200).json({ success: true, data: session });
  } catch (error) {
    console.error("End Session Error:", error);
    res.status(500).json({ success: false, message: "Failed to end session." });
  }
};
