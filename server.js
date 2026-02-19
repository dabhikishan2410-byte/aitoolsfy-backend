app.post("/pdf-to-word", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    const formData = new FormData();
    formData.append(
      "File",
      new Blob([req.file.buffer]),
      req.file.originalname
    );

    const response = await fetch(
      `https://v2.convertapi.com/convert/pdf/to/docx?Secret=${API_KEY}`,
      { method: "POST", body: formData }
    );

    const result = await response.json();
    console.log("FULL ConvertAPI response:", JSON.stringify(result));

    // 🔥 SAFELY extract file URL
    if (!result.Files || result.Files.length === 0) {
      return res.status(500).send("No files returned from ConvertAPI");
    }

    const fileObj = result.Files[0];

    if (!fileObj.Url) {
      return res.status(500).send("No URL in ConvertAPI response");
    }

    const fileRes = await fetch(fileObj.Url);
    const buffer = await fileRes.arrayBuffer();

    res.set({
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": "attachment; filename=converted.docx"
    });

    return res.send(Buffer.from(buffer));

  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).send("Server error");
  }
});
