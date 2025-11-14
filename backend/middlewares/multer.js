import multer from "multer";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./public";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir); // ✅ create folder if not exists
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // avoid overwriting
  },
});

export const upload = multer({ storage });
