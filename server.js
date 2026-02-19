import express from "express";
import fetch from "node-fetch";
import multer from "multer";
import FormData from "form-data";

const app = express();
const upload = multer();

const API_KEY = process.env.API_KEY;

app.post("/pdf-to-word", upload.single("file"), async (req, res) => {
  const form = new FormData();
  form.append("File", req.file.buffer, req.file.originalname);

  const response = await fetch(
    "https://v2.convertapi.com/convert/pdf/to/docx?Secret=" + API_KEY,
    { method: "POST", body: form }
  );

  const result = await response.json();
  const fileUrl = result.Files[0].Url;

  const fileRes = await fetch(fileUrl);
  const buffer = await fileRes.arrayBuffer();

  res.set({
    "Content-Type":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "Content-Disposition": "attachment; filename=converted.docx"
  });

  res.send(Buffer.from(buffer));
});

app.listen(3000);
