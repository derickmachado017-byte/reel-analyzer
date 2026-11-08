const $ = id => document.getElementById(id);
let objectUrl = null;
let shots = [];

function setStatus(message) {
  $("file-status").textContent = message;
}

function resetFrames() {
  shots = [];
  $("frames").innerHTML = "";
  $("download-btn").classList.add("hidden");
}

function prepareVideo(src, { remote = false, fileName = "" } = {}) {
  const video = $("video");
  resetFrames();
  $("frame-controls").classList.add("hidden");
  video.pause();
  video.removeAttribute("src");
  video.removeAttribute("crossorigin");
  video.load();

  if (remote) video.crossOrigin = "anonymous";

  video.addEventListener("loadedmetadata", () => {
    video.classList.remove("hidden");
    $("frame-controls").classList.remove("hidden");
    setStatus(remote
      ? "Vídeo carregado. Você já pode extrair os quadros."
      : fileName + " · " + (video.duration ? Math.round(video.duration) + " s" : "duração indisponível"));
  }, { once: true });

  video.addEventListener("error", () => {
    setStatus(remote
      ? "Não foi possível carregar esse endereço. Confira se ele aponta diretamente para um vídeo e se o servidor permite CORS."
      : "Não foi possível abrir esse arquivo de vídeo.");
  }, { once: true });

  video.src = src;
  video.load();
}

$("direct-form").addEventListener("submit", event => {
  event.preventDefault();
  let url;
  try {
    url = new URL($("direct-url").value.trim());
    if (!["http:", "https:"].includes(url.protocol)) throw new Error();
    if (["instagram.com", "www.instagram.com", "m.instagram.com"].includes(url.hostname)) {
      $("direct-status").textContent = "Esse é um link de página do Instagram, não um link direto de arquivo de vídeo. Esta versão não extrai Reels do Instagram.";
      return;
    }
  } catch {
    $("direct-status").textContent = "Digite um endereço HTTP ou HTTPS válido.";
    return;
  }

  $("direct-status").textContent = "Tentando carregar o arquivo de vídeo…";
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
    objectUrl = null;
  }
  prepareVideo(url.href, { remote: true });
});

$("video-file").addEventListener("change", () => {
  const file = $("video-file").files[0];
  if (!file) return;
  if (!file.type.startsWith("video/")) {
    setStatus("Escolha um arquivo de vídeo.");
    return;
  }
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = URL.createObjectURL(file);
  prepareVideo(objectUrl, { fileName: file.name });
});

function seek(video, time) {
  return new Promise((resolve, reject) => {
    const done = () => { clean(); resolve(); };
    const fail = () => { clean(); reject(new Error("Não foi possível ler este vídeo.")); };
    const clean = () => {
      video.removeEventListener("seeked", done);
      video.removeEventListener("error", fail);
    };
    video.addEventListener("seeked", done, { once: true });
    video.addEventListener("error", fail, { once: true });
    video.currentTime = Math.min(time, Math.max(0, video.duration - 0.05));
  });
}

const stamp = time => Math.floor(time / 60) + ":" + String(Math.floor(time % 60)).padStart(2, "0");

$("extract-btn").addEventListener("click", async () => {
  const video = $("video");
  if (!video.src || !Number.isFinite(video.duration) || !video.videoWidth) {
    setStatus("Aguarde o vídeo carregar completamente.");
    return;
  }

  const count = Number($("frame-count").value);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const scale = Math.min(1, 640 / video.videoWidth);
  canvas.width = Math.round(video.videoWidth * scale);
  canvas.height = Math.round(video.videoHeight * scale);
  resetFrames();
  setStatus("Extraindo quadros…");

  try {
    for (let i = 0; i < count; i++) {
      const time = video.duration * (i + 0.5) / count;
      await seek(video, time);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const data = canvas.toDataURL("image/jpeg", 0.86);
      shots.push({ data, time });
      const card = document.createElement("div");
      card.className = "frame";
      const img = document.createElement("img");
      img.src = data;
      img.alt = "Quadro em " + stamp(time);
      const label = document.createElement("small");
      label.textContent = stamp(time);
      card.append(img, label);
      $("frames").append(card);
    }
    setStatus(shots.length + " quadros extraídos. Baixe o painel para enviar ao ChatGPT.");
    $("download-btn").classList.remove("hidden");
  } catch (error) {
    resetFrames();
    setStatus(error.name === "SecurityError"
      ? "O servidor desse vídeo não autorizou a extração pelo navegador (CORS). Tente outro link ou selecione o arquivo no dispositivo."
      : (error.message || "Não foi possível extrair os quadros."));
  }
});

$("download-btn").addEventListener("click", () => {
  if (!shots.length) return;
  const video = $("video");
  const columns = 2;
  const width = 480;
  const height = Math.round(width * (video.videoHeight / video.videoWidth));
  const gap = 24;
  const rows = Math.ceil(shots.length / columns);
  const canvas = document.createElement("canvas");
  canvas.width = columns * width + (columns + 1) * gap;
  canvas.height = rows * (height + 34) + (rows + 1) * gap;
  const context = canvas.getContext("2d");
  context.fillStyle = "#101521";
  context.fillRect(0, 0, canvas.width, canvas.height);

  let loaded = 0;
  shots.forEach((shot, index) => {
    const img = new Image();
    img.onload = () => {
      const x = gap + (index % columns) * (width + gap);
      const y = gap + Math.floor(index / columns) * (height + 34 + gap);
      context.drawImage(img, x, y, width, height);
      context.fillStyle = "#f4f6fb";
      context.font = "16px system-ui";
      context.fillText(stamp(shot.time), x, y + height + 24);
      loaded++;
      if (loaded === shots.length) {
        const link = document.createElement("a");
        link.download = "reelanalyzer-quadros.jpg";
        link.href = canvas.toDataURL("image/jpeg", 0.9);
        link.click();
      }
    };
    img.src = shot.data;
  });
});
