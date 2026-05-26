// 1) EmailJS beállítás
// Regisztráció: https://www.emailjs.com/
// Cseréld ki ezeket a saját adataidra.
const EMAILJS_PUBLIC_KEY = "IDE_JON_A_PUBLIC_KEY";
const EMAILJS_SERVICE_ID = "IDE_JON_A_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "IDE_JON_A_TEMPLATE_ID";

if (EMAILJS_PUBLIC_KEY !== "IDE_JON_A_PUBLIC_KEY") {
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
}

let selfieDataUrl = "";
let stream = null;

const waitingListEl = document.getElementById("waitingList");
const form = document.getElementById("applicationForm");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const selfiePreview = document.getElementById("selfiePreview");
const resultSelfie = document.getElementById("resultSelfie");
const startCameraBtn = document.getElementById("startCamera");
const takeSelfieBtn = document.getElementById("takeSelfie");
const retakeSelfieBtn = document.getElementById("retakeSelfie");
const selfieStatus = document.getElementById("selfieStatus");
const formCard = document.getElementById("formCard");
const resultCard = document.getElementById("resultCard");

setInterval(() => {
  if (Math.random() > 0.55) waitingListEl.textContent = Number(waitingListEl.textContent) + 1;
}, 4500);

startCameraBtn.addEventListener("click", async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
    video.srcObject = stream;
    video.style.display = "block";
    takeSelfieBtn.disabled = false;
    startCameraBtn.disabled = true;
  } catch (error) {
    alert("Nem sikerült elindítani a kamerát. Ellenőrizd a böngésző engedélyeit.");
  }
});

takeSelfieBtn.addEventListener("click", () => {
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  const ctx = canvas.getContext("2d");
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  selfieDataUrl = canvas.toDataURL("image/jpeg", 0.82);
  selfiePreview.src = selfieDataUrl;
  selfiePreview.style.display = "block";
  video.style.display = "none";
  selfieStatus.textContent = "kész";
  selfieStatus.style.background = "rgba(16,185,129,.18)";
  selfieStatus.style.color = "#a7f3d0";
  takeSelfieBtn.disabled = true;
  retakeSelfieBtn.disabled = false;
  stopCamera();
});

retakeSelfieBtn.addEventListener("click", () => {
  selfieDataUrl = "";
  selfiePreview.src = "";
  selfiePreview.style.display = "none";
  selfieStatus.textContent = "kötelező";
  selfieStatus.style.background = "rgba(244,63,94,.17)";
  selfieStatus.style.color = "#fecdd3";
  retakeSelfieBtn.disabled = true;
  startCameraBtn.disabled = false;
});

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    stream = null;
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!selfieDataUrl) {
    alert("Előbb lőj egy élő szelfit.");
    return;
  }

  const data = getFormData();
  const score = calculateScore(data, true);
  const verdict = getVerdict(score);

  showResult(score, verdict);

  const emailConfigured = EMAILJS_PUBLIC_KEY !== "IDE_JON_A_PUBLIC_KEY";
  if (!emailConfigured) {
    alert("Demo mód: a pontozás működik, de az emailküldéshez még be kell állítani az EmailJS kulcsokat a script.js elején.");
    return;
  }

  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      applicant_name: data.name,
      age: data.ageLabel,
      height: data.heightLabel,
      city: data.city,
      profession: data.professionLabel,
      personality: data.personalityLabel,
      hobbies: data.hobbies || "-",
      traits: data.traits || "-",
      score,
      verdict,
      selfie_image: selfieDataUrl
    });
  } catch (error) {
    console.error(error);
    alert("A jelentkezés kiértékelődött, de az email küldése nem sikerült. Ellenőrizd az EmailJS beállításokat.");
  }
});

document.getElementById("newApplication").addEventListener("click", () => {
  window.location.reload();
});

function getFormData() {
  const age = document.getElementById("age").value;
  const height = document.getElementById("height").value;
  const profession = document.getElementById("profession").value;
  const personality = document.getElementById("personality").value;

  return {
    name: document.getElementById("name").value.trim(),
    age,
    ageLabel: selectedText("age"),
    height,
    heightLabel: selectedText("height"),
    city: document.getElementById("city").value,
    profession,
    professionLabel: selectedText("profession"),
    personality,
    personalityLabel: selectedText("personality"),
    hobbies: document.getElementById("hobbies").value.trim(),
    traits: document.getElementById("traits").value.trim()
  };
}

function selectedText(id) {
  const el = document.getElementById(id);
  return el.options[el.selectedIndex].text;
}

function calculateScore(data, hasSelfie) {
  let score = 20;
  const hobbies = data.hobbies.toLowerCase();
  const traits = data.traits.toLowerCase();
  const totalText = `${hobbies} ${traits}`;

  if (data.name.length >= 2) score += 4;
  if (data.age === "28") score += 24;
  else if (data.age === "27" || data.age === "39") score += 10;
  else score -= 10;

  if (data.height === "185") score += 22;
  else if (data.height === "180") score += 10;

  if (data.city.toLowerCase() === "budapest") score += 16;

  if (data.profession === "mernoki_informatikus") score += 22;
  else if (data.profession === "vallalkozo" || data.profession === "orvos") score += 14;
  else if (data.profession === "penzugy") score += 10;
  else score += 3;

  if (data.personality === "outgoing") score += 20;
  else if (data.personality === "balanced") score += 8;
  else score -= 5;

  if (hobbies.split(/[,. ]+/).filter(Boolean).length >= 3) score += 6;
  if (traits.length > 40) score += 10;
  if (totalText.includes("intelligens") || totalText.includes("vicces") || totalText.includes("ambiciózus") || totalText.includes("ambiciozus")) score += 5;
  if (hasSelfie) score += 12;

  return Math.max(1, Math.min(100, score));
}

function getVerdict(score) {
  if (score >= 90) return "Veszélyesen erős jelentkezés. Kiara algoritmusa enyhe pánikba esett.";
  if (score >= 75) return "Erős kezdés. A paraméterek alapján van remény.";
  if (score >= 55) return "Közepesen ígéretes. Egy jobb bemutatkozás még sokat dobhat rajta.";
  if (score >= 35) return "Nem reménytelen, de a waiting listán egyelőre hátul állsz.";
  return "Az algoritmus szerint ez most inkább karakterépítő élmény volt.";
}

function showResult(score, verdict) {
  formCard.classList.add("hidden");
  resultCard.classList.remove("hidden");
  document.getElementById("scoreResult").textContent = score;
  document.getElementById("scoreBar").style.width = `${score}%`;
  document.getElementById("verdict").textContent = verdict;
  resultSelfie.src = selfieDataUrl;
  resultSelfie.style.display = "block";
  waitingListEl.textContent = Number(waitingListEl.textContent) + 1;
}
