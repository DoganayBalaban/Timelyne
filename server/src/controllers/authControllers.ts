import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Request, Response } from "express";
import { BCRYPT_ROUNDS } from "../config/constants";
import { env } from "../config/env";
import { AuthRequest } from "../middlewares/authMiddleware";
import { AuthService } from "../services/authService";
import { catchAsync } from "../utils/catchAsync";
import { sendEmail } from "../utils/email";
import logger from "../utils/logger";
import { prisma } from "../utils/prisma";
import { setTokenCookies } from "../utils/setTokenCookies";
import { loginUserSchema, registerUserSchema, updateMeSchema } from "../validators/userSchema";

export const register = catchAsync(async (req: Request, res: Response) => {
  const validatedData = registerUserSchema.parse(req.body);

  const { user, accessToken, refreshToken } = await AuthService.registerUser(validatedData);

  setTokenCookies(res, accessToken, refreshToken);
  
  res.status(201).json({
    status: "success",
    message: "User created successfully",
    user: { id: user.id, email: user.email }
  });
});
export const login = catchAsync(async (req: Request, res: Response) => {
  const validatedData = loginUserSchema.parse(req.body);

  const { user, accessToken, refreshToken } = await AuthService.loginUser(validatedData);

  setTokenCookies(res, accessToken, refreshToken);

  res.status(200).json({
    status: "success",
    message: "User logged in successfully",
    user: { id: user.id, email: user.email }
  });
});
export const logout = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  
  if (refreshToken) {
    await AuthService.logoutUser(refreshToken);
  }

  const isProd = env.NODE_ENV === "production";
  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: (isProd ? "strict" : "lax") as any,
  };

  res.clearCookie("refreshToken", cookieOptions);
  res.clearCookie("accessToken", cookieOptions);

  res.status(200).json({ status: "success", message: "Logged out successfully" });
});
export const refresh = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  const { accessToken, refreshToken: newRefreshToken } = await AuthService.refreshToken(refreshToken);

  setTokenCookies(res, accessToken, newRefreshToken);

  res.status(200).json({
    status: "success",
    message: "Token refreshed successfully"
  });
});
export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;

  const result = await AuthService.forgotPassword(email, env.FRONTEND_URL);

  if (result.emailSent) {
    const emailHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
      <h2>Şifre Sıfırlama Talebi</h2>
      <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
      <a href="${result.resetURL!}" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Şifremi Sıfırla</a>
      <p>Eğer bu talebi siz yapmadıysanız, bu e-postayı dikkate almayın.</p>
      <p>Bu bağlantı 15 dakika içinde geçerliliğini yitirecektir.</p>
    </div>
  `;
    
    await sendEmail({
      to: result.userEmail!,
      subject: "Şifre Sıfırlama Talebi",
      html: emailHtml,
    });
  }

  // Always return same response to prevent user enumeration
  res.status(200).json({
    status: "success",
    message: "If an account exists, a reset email has been sent"
  });
});
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
     const parseResult = updateMeSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: parseResult.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
    }
 
    const {
      first_name,
      last_name,
      timezone,
      currency,
      hourly_rate,
      avatar_url,
    } = parseResult.data;

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
