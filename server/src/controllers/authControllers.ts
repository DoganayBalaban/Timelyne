import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { prisma } from "../utils/prisma";

export const register = async (req: Request, res: Response) => {
  try {
    //TODO: Validate request body
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    //TODO: Send verification email
    const user = await prisma.user.create({
      data: {
        email,
        password_hash: hashedPassword,
        first_name: firstName,
        last_name: lastName,
      },
    });
    const accessToken = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(201).json({
      message: "User created successfully",
      user,
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    console.error("❌ User registration error:", error.message);
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
