import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(express.json());

const GOOGLE_KEY = process.env.GOOGLE_KEY;
const OPENAI_KEY = process.env.OPENAI_KEY;

async function fetchBookInfo(title, author){
  try{
    const q = encodeURIComponent(`${title} ${author}`);
    const url = `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1&key=${GOOGLE_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.items?.length) return "";
    return data.items[0].volumeInfo.description || "";
  }catch{
    return "";
  }
}

async function askGPT(prompt){
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization":`Bearer ${OPENAI_KEY}`
    },
    body: JSON.stringify({
      model:"gpt-4o-mini",
      messages:[{ role:"user", content: prompt }]
    })
  });

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

/* -------------------------
      API ROUTES
--------------------------*/

app.post("/generate/intro", async (req, res) => {
  const { title, author, tone, lang } = req.body;
  const desc = await fetchBookInfo(title, author);

  const prompt = lang === "ko"
    ? `책 소개를 1~2문장으로 만들어줘. 말투: ${tone}\n\n제목: ${title}\n저자: ${author}\n설명:\n${desc}`
    : `Write a 1–2 sentence introduction. Tone: ${tone}\n\nTitle: ${title}\nAuthor: ${author}\nDescription:\n${desc}`;

  res.json({ intro: await askGPT(prompt) });
});

app.post("/generate/summary", async (req, res) => {
  const { title, author, tone, lang, num } = req.body;
  const desc = await fetchBookInfo(title, author);

  const prompt = lang === "ko"
    ? `아래 내용을 ${num}문장으로 요약해줘. 말투: ${tone}\n\n${desc}`
    : `Summarize the following in ${num} sentences. Tone: ${tone}\n\n${desc}`;

  res.json({ summary: await askGPT(prompt) });
});

app.post("/generate/all", async (req, res) => {
  const { title, author, tone, lang, num } = req.body;
  const desc = await fetchBookInfo(title, author);

  const introPrompt = lang === "ko"
    ? `책 소개를 1~2문장으로 만들어줘. 말투: ${tone}\n\n제목: ${title}\n저자: ${author}\n설명:\n${desc}`
    : `Create a 1–2 sentence intro. Tone: ${tone}\n\n${desc}`;

  const summaryPrompt = lang === "ko"
    ? `아래 내용을 최대 ${num}문장으로 요약해줘. 말투: ${tone}\n\n${desc}`
    : `Summarize in ${num} sentences. Tone: ${tone}\n\n${desc}`;

  const intro = await askGPT(introPrompt);
  const summary = await askGPT(summaryPrompt);

  res.json({ intro, summary });
});

app.listen(3000, () => console.log("Server running on port 3000"));
