import express from "express";
const router = express.Router();
import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/'); // Save files in the public folder
    },
    filename: function (req, file, cb) {
        // Unique filename to prevent overwriting
        cb(null, Date.now() + ".jpg"); 
    }
});

const upload = multer({ storage: storage });

router.post('/', upload.single('file'), (req, res) => {
    if (req.file) {
        res.status(200).send({ url: "/" + req.file.path });
    } else {
        res.status(400).send("No file uploaded");
    }
});

export default router;