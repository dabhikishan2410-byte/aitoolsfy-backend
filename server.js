import express from "express";
import multer from "multer";
import FormData from "form-data";
import cors from "cors";

const app = express();
const upload = multer();

app.use(cors());

const API_KEY = process.env.API_KEY;

app.get("/", (req, res) => {
  res.send("AIToolsFY Backend Running 🚀");
});

app.post("/pdf-to-word", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    const form = new FormData();
    form.append("File", req.file.buffer, req.file.originalname);

    const response = await fetch(
      "https://v2.convertapi.com/convert/pdf/to/docx?Secret=" + API_KEY,
      { method: "POST", body: form }
    );

    const result = await response.json();

    if (!result.Files || !result.Files[0].Url) {
      return res.status(500).send("Conversion failed");
    }

    const fileUrl = result.Files[0].Url;

    const fileRes = await fetch(fileUrl);
    const buffer = await fileRes.arrayBuffer();

    res.set({
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": "attachment; filename=converted.docx"
    });

    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
