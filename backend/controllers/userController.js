import { User } from "../models/UserMode.js";

export const identifyUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: "Name and email are required" });
    }
    
    let user = await User.findOne({ email });
    const isNew = !user;
    if (!user) {
      user = await User.create({ name, email });
    }
    
    res.status(200).json({ success: true, isNew, data: user });
  } catch (error) {
    console.error("Identify User Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
