type NailState = {
  id: number;
  length: number;
  target: number;
  baseColor: string;
  trimmed: boolean;
  painted: boolean;
  decorated: boolean;
  scented: boolean;
  polishColor: string;
  stickerEmoji: string;
  scentEmoji: string;
  element?: HTMLDivElement;
  tip?: HTMLDivElement;
  polish?: HTMLDivElement;
  decal?: HTMLDivElement;
  sparkle?: HTMLDivElement;
  scent?: HTMLDivElement;
};

type GameMode = "clip" | "paint" | "sticker" | "scent";

const stickerOptions = ["😀", "😍", "🌟", "🦄", "🍓"] as const;
type StickerOption = (typeof stickerOptions)[number];
const scentOptions = ["🌸", "🍓", "🍋", "🥥", "🍯"] as const;
type ScentOption = (typeof scentOptions)[number];

const rounds = [
  {
    name: "Zajickova packa",
    colors: ["#ff7aa2", "#ff9b71", "#ffd166", "#7bd389", "#7ec8ff"],
    sticker: "🐰",
    bg: "linear-gradient(180deg, #fff2d9 0%, #ffd7ef 100%)",
  },
  {
    name: "Morska vila",
    colors: ["#6dd3ff", "#78f0d3", "#b4f8c8", "#8dbdff", "#f5b7ff"],
    sticker: "🧜",
    bg: "linear-gradient(180deg, #d8f7ff 0%, #b6d7ff 100%)",
  },
  {
    name: "Duhova party",
    colors: ["#ff6b6b", "#ffb347", "#ffe66d", "#4ecdc4", "#6c8cff"],
    sticker: "🌈",
    bg: "linear-gradient(180deg, #fff8c5 0%, #ffc3e6 100%)",
  },
] as const;

const state = {
  roundIndex: 0,
  score: 0,
  cuts: 0,
  mode: "clip" as GameMode,
  selectedPolish: "#ff5fa2",
  selectedSticker: stickerOptions[0] as StickerOption,
  selectedScent: scentOptions[0] as ScentOption,
  pointerDown: false,
  clipperX: 0,
  clipperY: 0,
  activeNailId: -1,
  nails: [] as NailState[],
};

const app = document.createElement("main");
const style = document.createElement("style");
const playArea = document.createElement("section");
const hand = document.createElement("div");
const clipper = document.createElement("div");
const palette = document.createElement("div");
const messageCard = document.createElement("div");
const messageTitle = document.createElement("h2");
const messageText = document.createElement("p");
const nextButton = document.createElement("button");

style.textContent = `
  :root {
    --sky: #ffe7f2;
    --ink: #5a325c;
    --card: rgba(255, 255, 255, 0.84);
    --shadow: 0 20px 50px rgba(163, 97, 137, 0.22);
  }

  * {
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
  }

  body {
    margin: 0;
    min-height: 100vh;
    min-height: 100dvh;
    font-family: "Trebuchet MS", "Comic Sans MS", sans-serif;
    color: var(--ink);
    background:
      radial-gradient(circle at top, rgba(255, 255, 255, 0.9), transparent 35%),
      linear-gradient(180deg, #ffbfd7 0%, #ffe9b6 100%);
    overflow: hidden;
  }

  main {
    min-height: 100vh;
    min-height: 100dvh;
    display: grid;
    grid-template-rows: auto auto minmax(0, 1fr);
    padding: 18px;
    gap: 14px;
  }

  .topbar {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
  }

  .pill {
    background: var(--card);
    border: 3px solid rgba(255, 255, 255, 0.75);
    border-radius: 999px;
    box-shadow: var(--shadow);
    padding: 12px 18px;
    font-size: clamp(20px, 2.8vw, 30px);
    font-weight: 700;
  }

  .helper {
    background: var(--card);
    border-radius: 24px;
    padding: 12px 16px;
    box-shadow: var(--shadow);
    font-size: clamp(18px, 2.4vw, 26px);
    line-height: 1.3;
  }

  .play-area {
    position: relative;
    min-height: 0;
    overflow: hidden;
    border-radius: 34px;
    box-shadow: inset 0 0 0 4px rgba(255, 255, 255, 0.65), var(--shadow);
    touch-action: none;
  }

  .play-area::before,
  .play-area::after {
    content: "";
    position: absolute;
    border-radius: 999px;
    opacity: 0.28;
    pointer-events: none;
  }

  .play-area::before {
    width: 220px;
    height: 220px;
    left: -40px;
    top: 18px;
    background: #fff49a;
  }

  .play-area::after {
    width: 180px;
    height: 180px;
    right: 16px;
    bottom: 18px;
    background: #ffc0e0;
  }

  .table {
    position: absolute;
    inset: auto 0 0 0;
    height: 32%;
    background:
      repeating-linear-gradient(
        90deg,
        rgba(255, 255, 255, 0.08) 0 18px,
        rgba(255, 255, 255, 0.18) 18px 36px
      ),
      linear-gradient(180deg, #ff9f68 0%, #ff7f50 100%);
  }

  .hand {
    position: absolute;
    left: 50%;
    bottom: 8%;
    transform: translateX(-50%);
    width: min(720px, 88%);
    height: min(420px, 62vh);
  }

  .finger {
    position: absolute;
    bottom: 0;
    width: 14%;
    background: linear-gradient(180deg, #ffd9ba 0%, #ffc2a2 100%);
    border-radius: 999px 999px 28px 28px;
    box-shadow: inset 0 -8px 0 rgba(232, 165, 125, 0.28);
  }

  .finger::after {
    content: "";
    position: absolute;
    left: 18%;
    right: 18%;
    bottom: 22px;
    height: 6px;
    border-radius: 999px;
    background: rgba(229, 164, 118, 0.55);
  }

  .nail {
    position: absolute;
    left: 17%;
    width: 66%;
    top: 10px;
    border-radius: 22px 22px 14px 14px;
    box-shadow: inset 0 4px 0 rgba(255, 255, 255, 0.45);
    transform-origin: center top;
    transition: height 0.12s ease-out, transform 0.16s ease-out;
    overflow: hidden;
  }

  .nail.trimmed {
    transform: scale(1.02);
    box-shadow:
      inset 0 4px 0 rgba(255, 255, 255, 0.55),
      0 0 0 4px rgba(255, 255, 255, 0.28);
  }

  .nail.painted {
    box-shadow:
      inset 0 4px 0 rgba(255, 255, 255, 0.55),
      0 0 0 4px rgba(255, 255, 255, 0.28),
      0 12px 22px rgba(255, 95, 143, 0.18);
  }

  .nail-polish {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    opacity: 0;
    transition: opacity 0.16s ease-out, background 0.16s ease-out;
    box-shadow: inset 0 10px 12px rgba(255, 255, 255, 0.18);
  }

  .nail-decal {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%) scale(0.6);
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    font-size: 22px;
    line-height: 1;
    opacity: 0;
    transition: opacity 0.16s ease-out, transform 0.16s ease-out;
    filter: drop-shadow(0 4px 4px rgba(90, 50, 92, 0.18));
    pointer-events: none;
  }

  .nail-decal.show {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }

  .nail-scent {
    position: absolute;
    left: 50%;
    top: -12px;
    transform: translateX(-50%) translateY(10px) scale(0.7);
    font-size: 26px;
    line-height: 1;
    opacity: 0;
    transition: opacity 0.18s ease-out, transform 0.18s ease-out;
    pointer-events: none;
    filter: drop-shadow(0 6px 10px rgba(90, 50, 92, 0.18));
  }

  .nail-scent.show {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }

  .nail-tip {
    position: absolute;
    left: 8%;
    right: 8%;
    bottom: 6px;
    height: 16px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.9);
  }

  .sparkle {
    position: absolute;
    left: 50%;
    top: -18px;
    transform: translateX(-50%) scale(0);
    font-size: 28px;
    transition: transform 0.18s ease-out;
  }

  .sparkle.show {
    transform: translateX(-50%) scale(1);
  }

  .clipper {
    position: absolute;
    width: 92px;
    height: 92px;
    pointer-events: none;
    transform: translate(-50%, -50%) rotate(-10deg);
    filter: drop-shadow(0 10px 16px rgba(81, 61, 79, 0.22));
  }

  .clipper::before,
  .clipper::after {
    content: "";
    position: absolute;
    background: linear-gradient(180deg, #b4e2ff 0%, #6aa9d8 100%);
    border-radius: 24px;
  }

  .clipper::before {
    inset: 22px 18px 42px;
    transform: skewX(-8deg);
  }

  .clipper::after {
    inset: 48px 22px 12px;
    border-radius: 18px;
    background: linear-gradient(180deg, #ffd36d 0%, #ffad33 100%);
  }

  .clipper span {
    position: absolute;
    right: 8px;
    top: 10px;
    font-size: 40px;
  }

  .clipper.paint-mode::before {
    inset: 14px 34px 22px;
    border-radius: 20px;
    background: linear-gradient(180deg, #ffd7f1 0%, #ff93c9 100%);
    transform: none;
  }

  .clipper.paint-mode::after {
    inset: 54px 20px 8px;
    border-radius: 18px 18px 24px 24px;
    background: linear-gradient(180deg, #8f5f4f 0%, #5f3d34 100%);
  }

  .clipper.paint-mode span {
    right: 18px;
    top: 8px;
    font-size: 28px;
  }

  .clipper.sticker-mode::before {
    inset: 18px 20px 20px;
    border-radius: 22px;
    background: linear-gradient(180deg, #fff4a8 0%, #ffc965 100%);
    transform: rotate(8deg);
  }

  .clipper.sticker-mode::after {
    inset: 44px 40px 16px 12px;
    border-radius: 14px;
    background: linear-gradient(180deg, #ff93c9 0%, #ff5f8f 100%);
  }

  .clipper.sticker-mode span {
    right: 12px;
    top: 12px;
    font-size: 28px;
  }

  .clipper.scent-mode::before {
    inset: 14px 26px 26px;
    border-radius: 20px 20px 26px 26px;
    background: linear-gradient(180deg, #dff6a8 0%, #8bd17c 100%);
    transform: none;
  }

  .clipper.scent-mode::after {
    inset: 54px 28px 8px;
    border-radius: 16px;
    background: linear-gradient(180deg, #ffd2a6 0%, #ff9c6b 100%);
  }

  .clipper.scent-mode span {
    right: 14px;
    top: 10px;
    font-size: 28px;
  }

  .palette {
    position: absolute;
    left: 18px;
    bottom: 18px;
    display: none;
    flex-wrap: wrap;
    gap: 10px;
    padding: 12px;
    max-width: min(320px, calc(100% - 36px));
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.86);
    box-shadow: var(--shadow);
  }

  .palette.show {
    display: flex;
  }

  .swatch {
    width: 38px;
    height: 38px;
    border: 3px solid rgba(255, 255, 255, 0.95);
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 8px 18px rgba(90, 50, 92, 0.14);
  }

  .swatch.active {
    transform: scale(1.12);
    box-shadow:
      0 0 0 4px rgba(255, 255, 255, 0.9),
      0 10px 20px rgba(90, 50, 92, 0.22);
  }

  .message-card {
    position: absolute;
    inset: 50% auto auto 50%;
    transform: translate(-50%, -50%);
    width: min(540px, calc(100% - 32px));
    background: rgba(255, 255, 255, 0.93);
    border-radius: 28px;
    box-shadow: var(--shadow);
    padding: 24px;
    text-align: center;
    display: none;
  }

  .message-card.show {
    display: block;
  }

  .message-card h2 {
    margin: 0 0 10px;
    font-size: clamp(28px, 4.2vw, 44px);
  }

  .message-card p {
    margin: 0 0 18px;
    font-size: clamp(20px, 2.8vw, 28px);
    line-height: 1.3;
  }

  .message-card button {
    border: 0;
    border-radius: 999px;
    background: linear-gradient(180deg, #ff87b5 0%, #ff5f8f 100%);
    color: white;
    padding: 14px 24px;
    font: inherit;
    font-size: 24px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 10px 24px rgba(255, 95, 143, 0.28);
  }

  @media (max-width: 720px) {
    main {
      padding: 10px;
      gap: 10px;
    }

    .pill {
      font-size: clamp(15px, 4.2vw, 20px);
      padding: 10px 14px;
    }

    .helper {
      font-size: clamp(14px, 3.8vw, 18px);
      padding: 10px 12px;
      border-radius: 18px;
    }

    .play-area {
      min-height: 58dvh;
    }

    .hand {
      bottom: 10%;
      width: min(640px, 94%);
      height: min(380px, 52dvh);
    }

    .finger {
      width: 16%;
      bottom: 0;
    }

    .clipper {
      width: 74px;
      height: 74px;
    }

    .palette {
      left: 50%;
      bottom: 12px;
      transform: translateX(-50%);
      justify-content: center;
      width: min(280px, calc(100% - 24px));
      padding: 10px;
      gap: 8px;
      border-radius: 18px;
    }

    .swatch {
      width: 34px;
      height: 34px;
    }

    .message-card {
      width: min(92vw, 420px);
      padding: 18px;
      border-radius: 22px;
    }

    .message-card p {
      font-size: clamp(17px, 4.8vw, 22px);
    }

    .message-card button {
      font-size: 20px;
      padding: 12px 20px;
    }
  }

  @media (max-width: 420px) {
    .topbar {
      gap: 8px;
    }

    .pill {
      width: 100%;
      text-align: center;
    }

    .play-area {
      min-height: 60dvh;
      border-radius: 24px;
    }

    .hand {
      bottom: 12%;
      width: min(540px, 96%);
      height: min(340px, 48dvh);
    }

    .finger {
      width: 17%;
      bottom: 0;
    }
  }
`;

document.head.append(style);
document.body.append(app);

app.innerHTML = `
  <div class="topbar">
    <div class="pill" data-role="round"></div>
    <div class="pill" data-role="score"></div>
  </div>
  <div class="helper" data-role="helper"></div>
`;

const roundTitle = app.querySelector('[data-role="round"]') as HTMLDivElement;
const scoreLabel = app.querySelector('[data-role="score"]') as HTMLDivElement;
const helperText = app.querySelector('[data-role="helper"]') as HTMLDivElement;

playArea.className = "play-area";
playArea.innerHTML = `<div class="table"></div>`;

hand.className = "hand";
hand.innerHTML = "";

clipper.className = "clipper";
clipper.innerHTML = "<span>✂️</span>";

palette.className = "palette";

messageCard.className = "message-card";
messageTitle.textContent = "Parada!";
messageText.textContent = "";
nextButton.type = "button";
nextButton.textContent = "Dalsi rucka";
messageCard.append(messageTitle, messageText, nextButton);

playArea.append(hand, clipper, palette, messageCard);
app.append(playArea);

function setupRound(): void {
  const config = rounds[state.roundIndex];
  state.nails = [];
  state.activeNailId = -1;
  state.mode = "clip";
  state.selectedPolish = config.colors[0];
  state.selectedSticker = stickerOptions[0];
  state.selectedScent = scentOptions[0];
  hand.querySelectorAll(".finger").forEach((finger) => finger.remove());
  playArea.style.background = config.bg;

  const fingerOffsets = [8, 25, 42, 59, 76];
  const fingerHeights = [52, 64, 72, 67, 56];

  fingerOffsets.forEach((left, index) => {
    const nail: NailState = {
      id: index,
      length: 112,
      target: 56,
      baseColor: config.colors[index],
      trimmed: false,
      painted: false,
      decorated: false,
      scented: false,
      polishColor: config.colors[index],
      stickerEmoji: stickerOptions[index % stickerOptions.length],
      scentEmoji: scentOptions[index % scentOptions.length],
    };

    const finger = document.createElement("div");
    finger.className = "finger";
    finger.style.left = `${left}%`;
    finger.style.height = `${fingerHeights[index]}%`;

    const nailEl = document.createElement("div");
    nailEl.className = "nail";
    nailEl.style.background = `linear-gradient(180deg, ${nail.baseColor} 0%, ${lighten(nail.baseColor)} 100%)`;
    nailEl.dataset.id = String(index);

    const polish = document.createElement("div");
    polish.className = "nail-polish";

    const decal = document.createElement("div");
    decal.className = "nail-decal";

    const scent = document.createElement("div");
    scent.className = "nail-scent";

    const tip = document.createElement("div");
    tip.className = "nail-tip";

    const sparkle = document.createElement("div");
    sparkle.className = "sparkle";
    sparkle.textContent = config.sticker;

    nailEl.append(polish, decal, scent, tip, sparkle);
    finger.append(nailEl);
    hand.append(finger);

    nail.element = nailEl;
    nail.polish = polish;
    nail.decal = decal;
    nail.scent = scent;
    nail.tip = tip;
    nail.sparkle = sparkle;
    state.nails.push(nail);
  });

  renderPalette();
  updateHud();
  renderNails();
  helperText.textContent = "Posouvej kliprem po nehtech a podrz prst. Zkrat vsechny nehtiky na bilou carku.";
  syncToolMode();
}

function lighten(hex: string): string {
  const [r, g, b] = hex
    .replace("#", "")
    .match(/.{1,2}/g)!
    .map((part) => parseInt(part, 16));

  const mixed = [r, g, b].map((value) => Math.min(255, Math.round(value * 0.72 + 70)));
  return `rgb(${mixed[0]}, ${mixed[1]}, ${mixed[2]})`;
}

function updateHud(): void {
  roundTitle.textContent = `${rounds[state.roundIndex].sticker} ${rounds[state.roundIndex].name}`;
  const modeLabel =
    state.mode === "clip"
      ? "Strihani"
      : state.mode === "paint"
        ? "Lakovani"
        : state.mode === "sticker"
          ? "Smajliky"
          : "Vune";
  scoreLabel.textContent = `Hvezdicky: ${state.score} • ${modeLabel}`;
}

function renderNails(): void {
  state.nails.forEach((nail) => {
    if (!nail.element || !nail.tip || !nail.sparkle || !nail.polish || !nail.decal || !nail.scent) {
      return;
    }

    nail.element.style.height = `${nail.length}px`;
    nail.tip.style.opacity = nail.length <= nail.target + 8 ? "1" : "0.75";
    nail.polish.style.opacity = nail.painted ? "0.95" : "0";
    nail.polish.style.background = `linear-gradient(180deg, ${nail.polishColor} 0%, ${lighten(nail.polishColor)} 100%)`;
    nail.decal.textContent = nail.stickerEmoji;
    nail.decal.classList.toggle("show", nail.decorated);
    nail.scent.textContent = nail.scentEmoji;
    nail.scent.classList.toggle("show", nail.scented);
    nail.element.classList.toggle("trimmed", nail.trimmed);
    nail.element.classList.toggle("painted", nail.painted);
    nail.sparkle.classList.toggle(
      "show",
      state.mode === "clip"
        ? nail.trimmed
        : state.mode === "paint"
          ? nail.painted
          : state.mode === "sticker"
            ? nail.decorated
            : nail.scented,
    );
  });
}

function renderPalette(): void {
  palette.innerHTML = "";

  if (state.mode === "scent") {
    scentOptions.forEach((emoji) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "swatch";
      button.textContent = emoji;
      button.style.fontSize = "22px";
      button.style.display = "grid";
      button.style.placeItems = "center";
      button.style.background = "linear-gradient(180deg, #ffffff 0%, #eefad8 100%)";
      button.classList.toggle("active", emoji === state.selectedScent);
      button.addEventListener("click", () => {
        state.selectedScent = emoji;
        renderPalette();
      });
      palette.append(button);
    });
    return;
  }

  if (state.mode === "sticker") {
    stickerOptions.forEach((emoji) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "swatch";
      button.textContent = emoji;
      button.style.fontSize = "22px";
      button.style.display = "grid";
      button.style.placeItems = "center";
      button.style.background = "linear-gradient(180deg, #ffffff 0%, #ffe8f2 100%)";
      button.classList.toggle("active", emoji === state.selectedSticker);
      button.addEventListener("click", () => {
        state.selectedSticker = emoji;
        renderPalette();
      });
      palette.append(button);
    });
    return;
  }

  const colors = rounds[state.roundIndex].colors;
  colors.forEach((color) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "swatch";
    button.style.background = `linear-gradient(180deg, ${color} 0%, ${lighten(color)} 100%)`;
    button.classList.toggle("active", color === state.selectedPolish);
    button.addEventListener("click", () => {
      state.selectedPolish = color;
      renderPalette();
    });
    palette.append(button);
  });
}

function syncToolMode(): void {
  clipper.classList.toggle("paint-mode", state.mode === "paint");
  clipper.classList.toggle("sticker-mode", state.mode === "sticker");
  clipper.classList.toggle("scent-mode", state.mode === "scent");
  clipper.querySelector("span")!.textContent =
    state.mode === "paint" ? "🖌️" : state.mode === "sticker" ? "😊" : state.mode === "scent" ? "✨" : "✂️";
  palette.classList.toggle("show", state.mode !== "clip");
  renderPalette();
  updateHud();
}

function showMessage(title: string, text: string, buttonText: string): void {
  messageTitle.textContent = title;
  messageText.textContent = text;
  nextButton.textContent = buttonText;
  messageCard.classList.add("show");
}

function hideMessage(): void {
  messageCard.classList.remove("show");
}

function cutAtPointer(): void {
  if (!state.pointerDown || state.mode !== "clip") {
    return;
  }

  const playRect = playArea.getBoundingClientRect();
  const handRect = hand.getBoundingClientRect();
  const clipperTipX = playRect.left + state.clipperX + 38;
  const clipperTipY = playRect.top + state.clipperY - 6;

  let trimmed = false;
  let targetNail: NailState | undefined;
  let bestDistance = Number.POSITIVE_INFINITY;

  state.nails.forEach((nail) => {
    if (!nail.element || nail.trimmed) {
      return;
    }

    const rect = nail.element.getBoundingClientRect();
    const hitX = clipperTipX >= rect.left - 16 && clipperTipX <= rect.right + 16;
    const tipTop = rect.bottom - 28;
    const hitY = clipperTipY >= tipTop - 16 && clipperTipY <= rect.bottom + 18;
    const insideHand = clipperTipY >= handRect.top - 30 && clipperTipY <= handRect.bottom;

    if (!hitX || !hitY || !insideHand) {
      return;
    }

    const nailCenterX = rect.left + rect.width * 0.5;
    const nailTipY = rect.bottom - 14;
    const distance = Math.hypot(clipperTipX - nailCenterX, clipperTipY - nailTipY);

    if (distance < bestDistance) {
      bestDistance = distance;
      targetNail = nail;
    }
  });

  if (targetNail) {
    targetNail.length = Math.max(targetNail.target, targetNail.length - 5);
    state.cuts += 1;
    trimmed = true;

    if (targetNail.length <= targetNail.target) {
      targetNail.trimmed = true;
      state.score += 3;
      helperText.textContent = "Krasne! Pokracuj na dalsi nehtik.";
      updateHud();
    }
  }

  if (trimmed) {
    renderNails();
    checkRoundDone();
  }
}

function paintAtPointer(): void {
  if (!state.pointerDown || state.mode !== "paint") {
    return;
  }

  const playRect = playArea.getBoundingClientRect();
  const brushTipX = playRect.left + state.clipperX;
  const brushTipY = playRect.top + state.clipperY - 12;
  let paintedAny = false;
  let targetNail: NailState | undefined;
  let bestDistance = Number.POSITIVE_INFINITY;

  state.nails.forEach((nail) => {
    if (!nail.element || !nail.trimmed) {
      return;
    }

    const rect = nail.element.getBoundingClientRect();
    const hitX = brushTipX >= rect.left - 10 && brushTipX <= rect.right + 10;
    const hitY = brushTipY >= rect.top - 12 && brushTipY <= rect.bottom + 12;

    if (!hitX || !hitY) {
      return;
    }

    const nailCenterX = rect.left + rect.width * 0.5;
    const nailCenterY = rect.top + rect.height * 0.5;
    const distance = Math.hypot(brushTipX - nailCenterX, brushTipY - nailCenterY);

    if (distance < bestDistance) {
      bestDistance = distance;
      targetNail = nail;
    }
  });

  if (targetNail && (!targetNail.painted || targetNail.polishColor !== state.selectedPolish)) {
    const firstPaint = !targetNail.painted;
    targetNail.painted = true;
    targetNail.polishColor = state.selectedPolish;
    paintedAny = true;

    if (firstPaint) {
      state.score += 2;
    }
  }

  if (paintedAny) {
    helperText.textContent = "Nadhera! Dolakuj i zbytek nehtiku.";
    renderNails();
    checkRoundDone();
  }
}

function decorateAtPointer(): void {
  if (!state.pointerDown || state.mode !== "sticker") {
    return;
  }

  const playRect = playArea.getBoundingClientRect();
  const stickerTipX = playRect.left + state.clipperX;
  const stickerTipY = playRect.top + state.clipperY;
  let decoratedAny = false;
  let targetNail: NailState | undefined;
  let bestDistance = Number.POSITIVE_INFINITY;

  state.nails.forEach((nail) => {
    if (!nail.element || !nail.trimmed || !nail.painted) {
      return;
    }

    const rect = nail.element.getBoundingClientRect();
    const hitX = stickerTipX >= rect.left - 10 && stickerTipX <= rect.right + 10;
    const hitY = stickerTipY >= rect.top - 10 && stickerTipY <= rect.bottom + 10;

    if (!hitX || !hitY) {
      return;
    }

    const nailCenterX = rect.left + rect.width * 0.5;
    const nailCenterY = rect.top + rect.height * 0.5;
    const distance = Math.hypot(stickerTipX - nailCenterX, stickerTipY - nailCenterY);

    if (distance < bestDistance) {
      bestDistance = distance;
      targetNail = nail;
    }
  });

  if (targetNail && (!targetNail.decorated || targetNail.stickerEmoji !== state.selectedSticker)) {
    const firstDecorate = !targetNail.decorated;
    targetNail.decorated = true;
    targetNail.stickerEmoji = state.selectedSticker;
    decoratedAny = true;

    if (firstDecorate) {
      state.score += 2;
    }
  }

  if (decoratedAny) {
    helperText.textContent = "Super! Ozdob smajlikem i ostatni nehtiky.";
    renderNails();
    checkRoundDone();
  }
}

function scentAtPointer(): void {
  if (!state.pointerDown || state.mode !== "scent") {
    return;
  }

  const playRect = playArea.getBoundingClientRect();
  const scentTipX = playRect.left + state.clipperX;
  const scentTipY = playRect.top + state.clipperY - 8;
  let scentedAny = false;
  let targetNail: NailState | undefined;
  let bestDistance = Number.POSITIVE_INFINITY;

  state.nails.forEach((nail) => {
    if (!nail.element || !nail.trimmed || !nail.painted || !nail.decorated) {
      return;
    }

    const rect = nail.element.getBoundingClientRect();
    const hitX = scentTipX >= rect.left - 12 && scentTipX <= rect.right + 12;
    const hitY = scentTipY >= rect.top - 24 && scentTipY <= rect.bottom + 10;

    if (!hitX || !hitY) {
      return;
    }

    const nailCenterX = rect.left + rect.width * 0.5;
    const nailCenterY = rect.top + rect.height * 0.3;
    const distance = Math.hypot(scentTipX - nailCenterX, scentTipY - nailCenterY);

    if (distance < bestDistance) {
      bestDistance = distance;
      targetNail = nail;
    }
  });

  if (targetNail && (!targetNail.scented || targetNail.scentEmoji !== state.selectedScent)) {
    const firstScent = !targetNail.scented;
    targetNail.scented = true;
    targetNail.scentEmoji = state.selectedScent;
    scentedAny = true;

    if (firstScent) {
      state.score += 2;
    }
  }

  if (scentedAny) {
    helperText.textContent = "Mnam! Navon i zbytek nehtiku.";
    renderNails();
    checkRoundDone();
  }
}

function checkRoundDone(): void {
  if (state.mode === "clip" && state.nails.every((nail) => nail.trimmed)) {
    state.mode = "paint";
    helperText.textContent = "Ted vezmi stetec, vyber barvu a nalakuj vsechny nehtiky.";
    syncToolMode();
    renderNails();
    return;
  }

  if (state.mode === "paint" && state.nails.every((nail) => nail.trimmed && nail.painted)) {
    state.mode = "sticker";
    helperText.textContent = "Ted vyber smajlika a dej ho na kazdy nehtik.";
    syncToolMode();
    renderNails();
    return;
  }

  if (state.mode === "sticker" && state.nails.every((nail) => nail.trimmed && nail.painted && nail.decorated)) {
    state.mode = "scent";
    helperText.textContent = "Ted vyber vuni a navon vsechny nehtiky.";
    syncToolMode();
    renderNails();
    return;
  }

  if (!state.nails.every((nail) => nail.trimmed && nail.painted && nail.decorated && nail.scented)) {
    return;
  }

  if (state.roundIndex < rounds.length - 1) {
    showMessage("Hotovo!", "Vsechny nehtiky jsou ostrihane, nalakovane, ozdobene i nadherne navonene. Muze prijit dalsi rucicka.", "Dalsi rucka");
    return;
  }

  showMessage("Ty jo!", `Zvladla jsi vsechny ruce a nasbirala ${state.score} hvezdicek!`, "Hrat znovu");
}

function updateClipperPosition(clientX: number, clientY: number): void {
  const rect = playArea.getBoundingClientRect();
  const clipperRadius = clipper.getBoundingClientRect().width * 0.5 || 40;
  state.clipperX = Math.max(clipperRadius, Math.min(rect.width - clipperRadius, clientX - rect.left));
  state.clipperY = Math.max(clipperRadius, Math.min(rect.height - clipperRadius, clientY - rect.top));
  clipper.style.left = `${state.clipperX}px`;
  clipper.style.top = `${state.clipperY}px`;
  cutAtPointer();
  paintAtPointer();
  decorateAtPointer();
  scentAtPointer();
}

playArea.addEventListener("pointerdown", (event) => {
  if (messageCard.classList.contains("show")) {
    return;
  }

  state.pointerDown = true;
  updateClipperPosition(event.clientX, event.clientY);
});

playArea.addEventListener("pointermove", (event) => {
  updateClipperPosition(event.clientX, event.clientY);
});

window.addEventListener("pointerup", () => {
  state.pointerDown = false;
});

playArea.addEventListener("pointerleave", () => {
  state.pointerDown = false;
});

nextButton.addEventListener("click", () => {
  hideMessage();

  if (state.roundIndex < rounds.length - 1 && state.nails.every((nail) => nail.trimmed && nail.painted && nail.decorated && nail.scented)) {
    state.roundIndex += 1;
  } else if (state.roundIndex === rounds.length - 1 && state.nails.every((nail) => nail.trimmed && nail.painted && nail.decorated && nail.scented)) {
    state.roundIndex = 0;
    state.score = 0;
    state.cuts = 0;
  }

  setupRound();
});

window.addEventListener("resize", () => {
  const clipperRadius = clipper.getBoundingClientRect().width * 0.5 || 40;
  const nextX = Math.max(clipperRadius, Math.min(state.clipperX, playArea.clientWidth - clipperRadius));
  const nextY = Math.max(clipperRadius, Math.min(state.clipperY, playArea.clientHeight - clipperRadius));
  state.clipperX = nextX;
  state.clipperY = nextY;
  clipper.style.left = `${nextX}px`;
  clipper.style.top = `${nextY}px`;
});

setupRound();
updateClipperPosition(window.innerWidth * 0.5, window.innerHeight * 0.58);
