app.post("/pdf-to-word", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    const form = new FormData();
    form.append("File", req.file.buffer, {
      filename: req.file.originalname,
      contentType: "application/pdf"
    });

    const response = await fetch(
      `https://v2.convertapi.com/convert/pdf/to/docx?Secret=${API_KEY}`,
      {
        method: "POST",
        body: form,
        headers: form.getHeaders()
      }
    );

    const result = await response.json();
    console.log("ConvertAPI FULL response:", result);

    if (!result.Files || result.Files.length === 0) {
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
    console.error("SERVER ERROR:", err);
    res.status(500).send("Server error");
  }
});
