import { Session } from "../models/SessionModel.js";
import { Message } from "../models/MessageModel.js";
import { Scenario } from "../models/ScenarioModel.js";
import { Score } from "../models/ScoreModel.js";
import { generateInitialMessage,
         evaluateSession 
  } from "../services/aiService.js";

export const startSession = async (req, res) => {
  try {
    const { userId, scenarioId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: "userId is required" });

    // Based on the scenarioId sent, create/fetch the scenario.
    let titleToSearch = "Mobile Stolen";
    let desc = "Customer calls because their mobile phone was stolen and they need to block the SIM and order a replacement.";
    let cName = "Rahul Mehta";
    let cTone = "distressed, urgent";

    if (scenarioId === "network_issue") {
      titleToSearch = "Network Issue (Angry Customer)";
      desc = "Facing severe call drops and extremely slow internet speeds. She is very frustrated. You must de-escalate the situation and provide a clear resolution timeline.";
      cName = "Priya Nair";
      cTone = "angry, frustrated";
    }

    let scenario = await Scenario.findOne({ title: titleToSearch });
    if (!scenario) {
      scenario = await Scenario.create({
        title: titleToSearch,
        description: desc,
        aiPersona: {
          name: cName,
          age: 35,
          tone: cTone,
        },
      });
    }

    // Create a new session
    const session = await Session.create({
      scenarioId: scenario._id,
      userId: userId,
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

    const messages = await Message.find({ sessionId: session._id }).sort({ timestamp: 1 });
    let scoreDoc = null;

    if (messages.length > 0) {
      try {
        const evaluationRes = await evaluateSession(session.scenarioId, messages);
        console.log("=== AI EVALUATION RAW RESULT ===");
        console.log(JSON.stringify(evaluationRes, null, 2));
        console.log("================================");
        scoreDoc = await Score.create({
          sessionId: session._id,
          overallScore: evaluationRes.overallScore,
          criteria: evaluationRes.criteria,
          feedback: evaluationRes.feedback,
          summary: evaluationRes.summary
        });
      } catch (e) {
        console.error("Evaluation failed", e);
      }
    }

    res.status(200).json({ success: true, data: { session, score: scoreDoc, messages } });
  } catch (error) {
    console.error("End Session Error:", error);
    res.status(500).json({ success: false, message: "Failed to end session." });
  }
};

export const getSessionHistory = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId || userId === 'undefined') return res.status(400).json({ success: false, message: "userId is required" });

    const userSessions = await Session.find({ userId });
    const sessionIds = userSessions.map(s => s._id);

    const scores = await Score.find({ sessionId: { $in: sessionIds } })
      .populate({
        path: "sessionId",
        populate: {
          path: "scenarioId"
        }
      })
      .sort({ createdAt: -1 })
      .limit(20);
    
    const history = scores.map(s => ({
      id: s._id,
      overallScore: s.overallScore,
      createdAt: s.createdAt,
      status: s.sessionId?.status || "completed",
      sessionId: s.sessionId?._id || null,
      scenarioTitle: s.sessionId?.scenarioId?.title || "Unknown Scenario"
    }));

    res.status(200).json({ success: true, data: history });
  } catch (error) {
    console.error("Get Session History Error:", error);
    res.status(500).json({ success: false, message: "Failed to get session history." });
  }
};

export const getSessionDetails = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const score = await Score.findOne({ sessionId });
    const messages = await Message.find({ sessionId }).sort({ timestamp: 1 });
    
    if (!score) {
      return res.status(404).json({ success: false, message: "Score not found" });
    }

    res.status(200).json({ success: true, data: { score, messages } });
  } catch (error) {
    console.error("Get Session Details Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch details" });
  }
};
