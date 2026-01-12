import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await prisma.user.create({
      data: {
        email,
        password_hash: hashedPassword,
        first_name: firstName,
        last_name: lastName,
      },
    });
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
export const login = () => {};
export const logout = () => {};
export const refresh = () => {};
export const forgotPassword = () => {};
export const resetPassword = () => {};
export const me = () => {};
export const updateMe = () => {};
