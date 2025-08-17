const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const ytdl = require("ytdl-core"); // for downloading YouTube videos

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json()); // to parse JSON body

// Serve static files (HTML, JS, CSS)
app.use("/songs", express.static(path.join(__dirname, "songs")));

// Endpoint to list video files
app.get("/videos", (req, res) => {
  const videoDir = path.join(__dirname, "songs");
  fs.readdir(videoDir, (err, files) => {
    if (err) return res.status(500).send("Error reading folder");
    const mp4Files = files.filter(f => f.endsWith(".mp4"));
    res.json(mp4Files);
  });
});

const youtubedl = require('youtube-dl-exec');

app.post("/download", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL required" });

  try {
    // Get video info first
    const info = await youtubedl(url, {
      dumpSingleJson: true,
      noWarnings: true,
      noCheckCertificate: true,
    });

    const title = info.title.replace(/[^\w\s]/gi, ""); // sanitize filename
    const filePath = path.join(__dirname, "songs", `${title}.mp4`);

    // Download the video
    await youtubedl(url, {
      output: filePath,
      format: "mp4",
    });

    res.json({ message: "Video downloaded", filename: `${title}.mp4` });
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ error: "Download failed" });
  }
});

app.post("/delete", (req, res) => {
  const { filename } = req.body;
  if (!filename) return res.status(400).json({ error: "Filename required" });

  const filePath = path.join(__dirname, "songs", filename);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) return res.status(404).json({ error: "File not found" });

    fs.unlink(filePath, (err) => {
      if (err) return res.status(500).json({ error: "Could not delete file" });
      res.json({ message: `${filename} deleted successfully` });
    });
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});