import crypto from "crypto";
import { Request } from "express";
import multer from "multer";
import multerS3 from "multer-s3";
import { env } from "../config/env";
import s3 from "../config/s3";

const upload = multer({
    storage: multerS3({
        s3: s3,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        bucket: env.AWS_BUCKET_NAME,
        key: (req: Request, file: Express.Multer.File, cb) => {
            const uniqueName = `projects/${req.params.id}/${crypto.randomUUID()}-${file.originalname}`;
            cb(null, uniqueName);
        },
    }),
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
});

export default upload;