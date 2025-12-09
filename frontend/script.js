async function api(path, body) {
  const res = await fetch(`http://localhost:3000${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return res.json();
}

function copyText(id){
  const text = document.getElementById(id).textContent;
  navigator.clipboard.writeText(text);
}

function clearAll(){
  document.getElementById("introOut").textContent = "";
  document.getElementById("summaryOut").textContent = "";
}

function getInputs(){
  return {
    title: document.getElementById("title").value,
    author: document.getElementById("author").value,
    tone: document.getElementById("tone").value,
    num: Number(document.getElementById("num").value),
    lang: document.getElementById("lang").value
  };
}

async function generateAll(){
  const data = getInputs();
  const res = await api("/generate/all", data);
  document.getElementById("introOut").textContent = res.intro;
  document.getElementById("summaryOut").textContent = res.summary;
}

async function generateIntro(){
  const data = getInputs();
  const res = await api("/generate/intro", data);
  document.getElementById("introOut").textContent = res.intro;
}

async function generateSummary(){
  const data = getInputs();
  const res = await api("/generate/summary", data);
  document.getElementById("summaryOut").textContent = res.summary;
}
