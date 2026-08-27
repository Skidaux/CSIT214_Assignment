import express from "express";

const app = express();
const PORT = 3000;

app.get("/api", (req, res) => {
  res.send("test");
});

app.listen(PORT, () => {
  console.log(`Backend Server now running on http://localhost:${PORT}/`);
});
