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

export const upload = multer({ storage: storage });

/**
 * @swagger
 * tags:
 *   - name: Files
 *     description: The Files uploading API
 */

/**
 * @swagger
 * /file:
 *   post:
 *     summary: Upload a file (image) to the server
 *     tags: [Files]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   example: "/public/16123456789.jpg"
 *       400:
 *         description: No file uploaded
 */
router.post('/', upload.single('file'), (req, res) => {
    if (req.file) {
        res.status(200).send({ url: "/" + req.file.path });
    } else {
        res.status(400).send("No file uploaded");
    }
});

export default router;