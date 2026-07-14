import { BadRequestException } from "@nestjs/common";
import { diskStorage } from "multer";

const allowedFileTypes = ['image/jpeg', 'image/png', 'image/jpg'];
const maxFileSize = 1024 * 1024 * 1; // 1MB

export const multerConfig = {
    storage: diskStorage({
        destination: './static/uploads',
        filename: (req, file, cb) => {
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
            const extension = file.originalname.split('.').pop();
            cb(null, uniqueSuffix + '.' + extension);
        }
    }),
    fileFilter: (req, file, cb) => {
        if (allowedFileTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new BadRequestException('File type not supported'), false);
        }
    },
    limits: {
        fileSize: maxFileSize
    }
}