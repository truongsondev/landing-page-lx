import multer from "multer";

const storage = multer.memoryStorage();
const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận ảnh JPEG, PNG hoặc WEBP"));
    }
  },
});
