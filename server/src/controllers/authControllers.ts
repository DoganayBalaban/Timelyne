import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { prisma } from "../utils/prisma";
import { setTokenCookies } from "../utils/setTokenCookies";
import { loginUserSchema, registerUserSchema } from "../validators/userSchema";

export const register = async (req: Request, res: Response) => {
  try {
    const parseResult = registerUserSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: parseResult.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const { email, password, firstName, lastName } = parseResult.data;

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user without password_hash in response
    const user = await prisma.user.create({
      data: {
        email,
        password_hash: hashedPassword,
        first_name: firstName,
        last_name: lastName,
      },
    });

    // Generate tokens with separate secrets
    const accessToken = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const refreshToken = jwt.sign({ userId: user.id }, env.JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });

    // Calculate expiration date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Save refresh token to database
    await prisma.refreshToken.create({
      data: {
        user_id: user.id,
        token: refreshToken,
        expires_at: expiresAt,
      },
    });

    setTokenCookies(res, accessToken, refreshToken);

    res.status(201).json({
      message: "User created successfully",
    });
  } catch (error: any) {
    console.error("❌ User registration error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const login = async (req: Request, res: Response) => {
  try {
    const parseResult = loginUserSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: parseResult.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const { email, password } = parseResult.data;

    // Find user with password_hash for comparison
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      // Use same error message to prevent user enumeration
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    // Generate tokens with separate secrets
    const accessToken = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const refreshToken = jwt.sign({ userId: user.id }, env.JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });

    // Calculate expiration date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Revoke all existing refresh tokens for this user (optional: for better security)
    await prisma.refreshToken.updateMany({
      where: {
        user_id: user.id,
        revoked_at: null,
      },
      data: {
        revoked_at: new Date(),
      },
    });

    // Save new refresh token to database
    await prisma.refreshToken.create({
      data: {
        user_id: user.id,
        token: refreshToken,
        expires_at: expiresAt,
      },
    });

    // Set httpOnly cookies
    setTokenCookies(res, accessToken, refreshToken);

    res.status(200).json({
      message: "User login successfully",
    });
  } catch (error: any) {
    console.error("❌ User login error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: {
          token: refreshToken,
        },
      });
    }
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    res.json({ message: "Logged out successfully" });
  } catch (error) {}
};
export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token missing" });
    }
    const savedToken = await prisma.refreshToken.findUnique({
      where: {
        token: refreshToken,
      },
      include: {
        user: true,
      },
    });
    if (
      !savedToken ||
      savedToken.expires_at < new Date() ||
      savedToken.revoked_at
    ) {
      return res
        .status(403)
        .json({ message: "Invalid or expired refresh token" });
    }
    const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as {
      userId: string;
    };

    // Ek güvenlik: token içindeki userId ile DB'deki user_id eşleşmeli
    if (payload.userId !== savedToken.user_id) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = jwt.sign(
      { userId: payload.userId },
      env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Yeni access token'ı cookie'ye yaz
    setTokenCookies(res, newAccessToken, refreshToken);

    return res.status(200).json({ message: "Token refreshed successfully" });
  } catch (error: any) {
    console.error("❌ Token refresh error:", error.message);
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};
export const forgotPassword = () => {};
export const resetPassword = () => {};
export const me = () => {};
export const updateMe = () => {};
