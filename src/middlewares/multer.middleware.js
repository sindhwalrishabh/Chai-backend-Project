import multer  from "multer";
import { mkdir } from "node:fs";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { extname } from "node:path";

const tempDirectory = fileURLToPath(new URL("../../public/temp", import.meta.url));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    mkdir(tempDirectory, { recursive: true }, (error) => {
      if (error) return cb(error);
      cb(null, tempDirectory);
    });
  },
  filename: function (req, file, cb) {
      cb(null, `${randomUUID()}${extname(file.originalname)}`)
    }
})


export const upload = multer({ storage,}) 
