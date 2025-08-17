const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const youtubedl = require("youtube-dl-exec"); // youtube-dl

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure songs folder exists
const songsDir = path.join(__dirname, "songs");
if (!fs.existsSync(songsDir)) {
  fs.mkdirSync(songsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use("/songs", express.static(songsDir));
app.use(express.static(path.join(__dirname, "public")));

// List MP4 files
app.get("/videos", (req, res) => {
  fs.readdir(songsDir, (err, files) => {
    if (err) return res.status(500).json({ error: "Error reading folder" });
    const mp4Files = files.filter((f) => f.endsWith(".mp4"));
    res.json(mp4Files);
  });
});

// Download \
// app.post("/download", async (req, res) => {
//   const url = req.body;
//   if (!url) return res.status(400).send("URL required");

//   try {
//     // Use youtube-dl to stream video directly
//     const videoProcess = youtubedl.raw(url, {
//       format: "mp4",
//       stdout: true,
//       noCheckCertificate: true,
//       noWarnings: true,
//     });

//     videoProcess.stdout.pipe(res);

//     videoProcess.on("error", (err) => {
//       console.error("Stream error:", err);
//       res.status(500).send("Failed to stream video");
//     });
//   } catch (err) {
//     console.error("Download/Stream error:", err);
//     res.status(500).send("Failed to process video");
//   }
// });
app.post("/download", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL required" });

  try {
    const info = await youtubedl(url, { dumpSingleJson: true, noWarnings: true, noCheckCertificate: true });
    const title = info.title.replace(/[^\w\s]/gi, ""); // sanitize
    const filePath = path.join(songsDir, `${title}.mp4`);

    await youtubedl(url, { output: filePath, format: "mp4" });
    res.json({ message: "Video downloaded", filename: `${title}.mp4` });
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ error: "Download failed" });
  }
});



// // Delete video
// app.post("/delete", (req, res) => {
//   const { filename } = req.body;
//   if (!filename) return res.status(400).json({ error: "Filename required" });

//   const filePath = path.join(songsDir, filename);
//   fs.access(filePath, fs.constants.F_OK, (err) => {
//     if (err) return res.status(404).json({ error: "File not found" });

//     fs.unlink(filePath, (err) => {
//       if (err) return res.status(500).json({ error: "Could not delete file" });
//       res.json({ message: `${filename} deleted successfully` });
//     });
//   });
// });

// Catch-all for frontend
// app.get("*", (req, res) => {
//   res.sendFile(path.resolve(__dirname, "public", "index.html"));
// });

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});