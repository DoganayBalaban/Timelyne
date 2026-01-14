import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AuthRequest } from "../middlewares/authMiddleware";
import { sendEmail } from "../utils/email";
import logger from "../utils/logger";
import { prisma } from "../utils/prisma";
import { setTokenCookies } from "../utils/setTokenCookies";
import { loginUserSchema, registerUserSchema } from "../validators/userSchema";
const BCRYPT_ROUNDS = 12;


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

    const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { user, accessToken, refreshToken } = await prisma.$transaction(
      async (tx) => {
        // Create user without password_hash in response
        const user = await tx.user.create({
          data: {
            email,
            password_hash: hashedPassword,
            first_name: firstName,
            last_name: lastName,
          },
        });

        // Generate tokens with separate secrets
        const accessToken = jwt.sign(
          { userId: user.id },
          env.JWT_ACCESS_SECRET,
          {
            expiresIn: "15m",
          }
        );

        const refreshToken = jwt.sign(
          { userId: user.id },
          env.JWT_REFRESH_SECRET,
          {
            expiresIn: "7d",
          }
        );

        // Calculate expiration date (7 days from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        // Save refresh token to database
        await tx.refreshToken.create({
          data: {
            user_id: user.id,
            token: refreshToken,
            expires_at: expiresAt,
          },
        });

        return { user, accessToken, refreshToken };
      }
    );

    setTokenCookies(res, accessToken, refreshToken);

    logger.info("User registered successfully", {
      userId: user.id,
      email: user.email,
      ip: req.ip,
    });

    res.status(201).json({
      message: "User created successfully",
    });
  } catch (error: any) {
    logger.error("User registration error", {
      error: error.message,
      stack: error.stack,
      email: req.body?.email,
      ip: req.ip,
    });
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
    const user = await prisma.user.findFirst({
      where: {
        email,
        deleted_at: null, // Soft delete kontrolü
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
    const accessToken = jwt.sign({ userId: user.id }, env.JWT_ACCESS_SECRET, {
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

    logger.info("User logged in successfully", {
      userId: user.id,
      email: user.email,
      ip: req.ip,
    });

    res.status(200).json({
      message: "User login successfully",
    });
  } catch (error: any) {
    logger.error("User login error", {
      error: error.message,
      stack: error.stack,
      email: req.body?.email,
      ip: req.ip,
    });
    res.status(500).json({ message: "Internal server error" });
  }
};
export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      // Revoke refresh token instead of deleting (better for audit)
      await prisma.refreshToken.updateMany({
        where: {
          token: refreshToken,
          revoked_at: null,
        },
        data: {
          revoked_at: new Date(),
        },
      });
    }

    const isProduction = env.NODE_ENV === "production";

    // Clear both cookies
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
    });

    logger.info("User logged out successfully", {
      ip: req.ip,
      hadRefreshToken: !!refreshToken,
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error: any) {
    logger.error("Logout error", {
      error: error.message,
      stack: error.stack,
      ip: req.ip,
    });
    res.status(500).json({ message: "Internal server error" });
  }
};
export const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  try {
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
      env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    // Refresh Token Rotation: Her refresh'te yeni refresh token üret
    const newRefreshToken = jwt.sign(
      { userId: payload.userId },
      env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // Eski refresh token'ı revoke et
    await prisma.refreshToken.update({
      where: {
        id: savedToken.id,
      },
      data: {
        revoked_at: new Date(),
      },
    });

    // Yeni refresh token'ı kaydet
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        user_id: payload.userId,
        token: newRefreshToken,
        expires_at: newExpiresAt,
      },
    });

    // Yeni token'ları cookie'ye yaz
    setTokenCookies(res, newAccessToken, newRefreshToken);

    logger.info("Token refreshed successfully", {
      userId: payload.userId,
      ip: req.ip,
    });

    return res.status(200).json({ message: "Token refreshed successfully" });
  } catch (error: any) {
    logger.error("Token refresh error", {
      error: error.message,
      stack: error.stack,
      ip: req.ip,
      hasRefreshToken: !!refreshToken,
    });
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};
export const forgotPassword = async (req:Request,res:Response) => {
  try {
    const {email} = req.body;
    const user = await prisma.user.findUnique({
      where:{
        email,
        deleted_at:null
      }
    })
    if (!user) {
      return res.status(200).json({
  message: "If an account exists, a reset email has been sent"
})

    }
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    await prisma.user.update({
      where:{
        id:user.id
      },
      data:{
        password_reset_token:hashedToken,
        password_reset_expires:new Date(Date.now() + 15 * 60 * 1000)
      }
    })
    const resetURL = `${env.FRONTEND_URL}/reset-password/${resetToken}`;
    const emailHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
      <h2>Şifre Sıfırlama Talebi</h2>
      <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
      <a href="${resetURL}" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Şifremi Sıfırla</a>
      <p>Eğer bu talebi siz yapmadıysanız, bu e-postayı dikkate almayın.</p>
      <p>Bu bağlantı 15 dakika içinde geçerliliğini yitirecektir.</p>
    </div>
  `;
    await sendEmail({
      to: user.email,
      subject: "Şifre Sıfırlama Talebi",
      html: emailHtml,
    });
  

    return res.status(200).json({ message: "Password reset email sent" });
  } catch (error:any) {
    logger.error("Password reset error", {
      error: error.message,
      stack: error.stack,
      ip: req.ip,
    });
    return res.status(500).json({ message: "Internal server error" });
    
  }
};
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || typeof token !== "string") {
      return res.status(400).json({ message: "Invalid or missing token" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await prisma.user.findUnique({
      where: {
        password_reset_token: hashedToken,
        password_reset_expires: {
          gte: new Date(),
        },
      },
    });
    if (!user) {
      // Don't throw AppError here if we aren't handling it in catch, or handle it manually
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password_hash: hashedPassword,
        password_reset_token: null,
        password_reset_expires: null,
      },
    });
    await prisma.refreshToken.updateMany({
      where: { user_id: user.id, revoked_at: null },
      data: { revoked_at: new Date() },
    });
    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error: any) {
    logger.error("Reset password error", {
      error: error.message,
      stack: error.stack,
      ip: req.ip,
    });
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const me = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
        deleted_at: null, // Soft delete kontrolü
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        avatar_url: true,
        timezone: true,
        currency: true,
        hourly_rate: true,
        plan: true,
        plan_expires_at: true,
        email_verified: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      logger.warn("User not found in me endpoint", {
        userId: req.user.id,
        ip: req.ip,
      });
      return res.status(404).json({ message: "User not found" });
    }

    logger.debug("User profile retrieved", {
      userId: user.id,
      ip: req.ip,
    });

    res.status(200).json({ user });
  } catch (error: any) {
    logger.error("Get user error", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      ip: req.ip,
    });
    res.status(500).json({ message: "Internal server error" });
  }
};
export const updateMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // TODO: UpdateMe için Zod schema oluştur
    const {
      first_name,
      last_name,
      timezone,
      currency,
      hourly_rate,
      avatar_url,
    } = req.body;

    const user = await prisma.user.update({
      where: {
        id: req.user.id,
        deleted_at: null, // Soft delete kontrolü
      },
      data: {
        ...(first_name !== undefined && { first_name }),
        ...(last_name !== undefined && { last_name }),
        ...(timezone !== undefined && { timezone }),
        ...(currency !== undefined && { currency }),
        ...(hourly_rate !== undefined && { hourly_rate }),
        ...(avatar_url !== undefined && { avatar_url }),
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        avatar_url: true,
        timezone: true,
        currency: true,
        hourly_rate: true,
        plan: true,
        plan_expires_at: true,
        email_verified: true,
        updated_at: true,
      },
    });

    logger.info("User updated successfully", {
      userId: user.id,
      updatedFields: Object.keys(req.body),
      ip: req.ip,
    });

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error: any) {
    logger.error("Update user error", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      ip: req.ip,
    });
    res.status(500).json({ message: "Internal server error" });
  }
};
