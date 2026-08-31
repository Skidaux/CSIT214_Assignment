import express from "express";
import cors from 'cors';

const app = express();
const PORT = 3000;


app.use(cors());
app.get("/api", (req, res) => {
  res.send("test");
});

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from the backend!" });
});

app.listen(PORT, () => {
  console.log(`Backend Server now running on http://localhost:${PORT}/`);
});
