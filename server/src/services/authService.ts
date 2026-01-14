import bcrypt from "bcryptjs";
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
}
