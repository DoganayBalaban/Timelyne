import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { BCRYPT_ROUNDS } from "../config/constants";
import { env } from "../config/env";
import { AppError } from "../utils/appError";
import { prisma } from "../utils/prisma";

export class AuthService {
    static async registerUser(data:{email:string,password:string,firstName:string,lastName:string}){
        const existingUser = await prisma.user.findUnique({
            where:{
                email:data.email
            }
        })
        if(existingUser){
            throw new AppError("User already exists",400)
        }
        const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
        const hashedPassword = await bcrypt.hash(data.password, salt);
        return await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          password_hash: hashedPassword,
          first_name: data.firstName,
          last_name: data.lastName,
        },
      });

      const { accessToken, refreshToken } = this.generateTokens(user.id);
      await this.saveRefreshToken(tx, user.id, refreshToken);

      return { user, accessToken, refreshToken };
    });
    }
    static async loginUser(data:{email:string,password:string}){
        const user = await prisma.user.findFirst({
            where:{
                email:data.email,
                deleted_at:null
            }
        })
        if (!user || !(await bcrypt.compare(data.password, user.password_hash))) {
      throw new AppError("Invalid credentials", 401);
    }
        const { accessToken, refreshToken } = this.generateTokens(user.id);
        await prisma.$transaction(async(tx)=>{
            await tx.refreshToken.updateMany({
                where:{
                    user_id:user.id,
                    revoked_at:null
                },
                data:{
                    revoked_at:new Date()
                }
            }),
            await tx.refreshToken.create({
                data:{
                    user_id:user.id,
                    token:refreshToken,
                    expires_at:new Date(Date.now() + 7*24*60*60*1000)
                }
            })
        })
        return {user,accessToken,refreshToken}
    }
    static generateTokens(userId: string) {
    const accessToken = jwt.sign({ userId }, env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ userId }, env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
    return { accessToken, refreshToken };
    }
    static async saveRefreshToken(tx: any, userId: string, token: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await tx.refreshToken.create({
      data: { user_id: userId, token, expires_at: expiresAt },
    });
    }
    static async logoutUser(refreshToken: string) {
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
    static async refreshToken(token: string) {
    if (!token) {
      throw new AppError("Refresh token missing", 401);
    }

    const savedToken = await prisma.refreshToken.findUnique({
      where: {
        token,
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
      throw new AppError("Invalid or expired refresh token", 403);
    }

    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as {
      userId: string;
    };

    // Extra security: token userId must match DB user_id
    if (payload.userId !== savedToken.user_id) {
      throw new AppError("Invalid refresh token", 403);
    }

    const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(payload.userId);

    // Refresh Token Rotation: revoke old token and create new one in transaction
    await prisma.$transaction(async (tx) => {
      await tx.refreshToken.update({
        where: {
          id: savedToken.id,
        },
        data: {
          revoked_at: new Date(),
        },
      });

      const newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + 7);

      await tx.refreshToken.create({
        data: {
          user_id: payload.userId,
          token: newRefreshToken,
          expires_at: newExpiresAt,
        },
      });
    });

    return { accessToken, refreshToken: newRefreshToken, userId: payload.userId };
  }

  static async forgotPassword(email: string, frontendUrl: string) {
    const user = await prisma.user.findUnique({
      where: {
        email,
        deleted_at: null
      }
    });

    // Always return success to prevent user enumeration
    if (!user) {
      return { emailSent: false };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        password_reset_token: hashedToken,
        password_reset_expires: new Date(Date.now() + 15 * 60 * 1000)
      }
    });

    const resetURL = `${frontendUrl}/reset-password/${resetToken}`;
    
    return { emailSent: true, resetURL, userEmail: user.email };
  }
}