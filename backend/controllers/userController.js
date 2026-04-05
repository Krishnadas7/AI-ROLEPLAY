import { User } from "../models/UserMode.js";
import { identifyUserSchema } from "../validations/index.js";

export const identifyUser = async (req, res, next) => {
  try {
    const parsed = identifyUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    }
    const { name, email } = parsed.data;
    
    let user = await User.findOne({ email });
    const isNew = !user;
    if (!user) {
      user = await User.create({ name, email });
    }
    
    res.status(200).json({ success: true, isNew, data: user });
  } catch (error) {
    next(error);
  }
};
