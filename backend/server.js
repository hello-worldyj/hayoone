import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

// __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⭐ frontend 정적 파일 제공
app.use(express.static(path.join(__dirname, "../frontend")));

// 기본 페이지 제공
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// GOOGLE BOOK API
app.post("/api/book", async (req, res) => {
  const { title, author } = req.body;

  try {
    const q = encodeURIComponent(`${title} ${author}`);
    const url = `https://www.googleapis.com/books/v1/volumes?q=${q}&key=${process.env.GOOGLE_KEY}&maxResults=1`;

    const apiRes = await fetch(url);
    const data = await apiRes.json();

    const info = data.items?.[0]?.volumeInfo;

    return res.json({
      description: info?.description || ""
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// SUMMARY API
app.post("/api/summary", async (req, res) => {
  const { title, author, description, tone, lang, num } = req.body;

  const prompt = `
언어: ${lang}
톤: ${tone}
문장 수: 최대 ${num}
책 설명 기반 서머리 작성
제목: ${title}
저자: ${author}
설명: ${description}
`;

  try {
    const apiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await apiRes.json();
    const output = data.choices?.[0]?.message?.content ?? "";

    res.json({ summary: output });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ⭐ Render에서 필수
const port = process.env.PORT || 10000;
app.listen(port, () => console.log("Server running on port", port));
