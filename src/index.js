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
];

const state = {
  roundIndex: 0,
  score: 0,
  cuts: 0,
  pointerDown: false,
  clipperX: 0,
  clipperY: 0,
  nails: [],
};

const app = document.createElement("main");
const style = document.createElement("style");
const playArea = document.createElement("section");
const hand = document.createElement("div");
const clipper = document.createElement("div");
const messageCard = document.createElement("div");
const messageTitle = document.createElement("h2");
const messageText = document.createElement("p");
const nextButton = document.createElement("button");

style.textContent = `
  :root {
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
    font-family: "Trebuchet MS", "Comic Sans MS", sans-serif;
    color: var(--ink);
    background:
      radial-gradient(circle at top, rgba(255, 255, 255, 0.9), transparent 35%),
      linear-gradient(180deg, #ffbfd7 0%, #ffe9b6 100%);
    overflow: hidden;
  }

  main {
    min-height: 100vh;
    display: grid;
    grid-template-rows: auto auto 1fr;
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
    width: min(840px, 94%);
    height: min(470px, 68vh);
  }

  .palm {
    position: absolute;
    inset: auto 15% 0 15%;
    height: 55%;
    background: linear-gradient(180deg, #ffd8b8 0%, #ffc4a2 100%);
    border-radius: 44% 44% 20% 20%;
    box-shadow: inset 0 -12px 0 rgba(232, 165, 125, 0.25);
  }

  .finger {
    position: absolute;
    bottom: 40%;
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
  }

  .nail.done {
    transform: scale(1.02);
    box-shadow:
      inset 0 4px 0 rgba(255, 255, 255, 0.55),
      0 0 0 4px rgba(255, 255, 255, 0.28);
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
      padding: 12px;
    }

    .hand {
      bottom: 12%;
      width: 100%;
      height: 60vh;
    }

    .finger {
      width: 16%;
    }

    .clipper {
      width: 74px;
      height: 74px;
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

const roundTitle = app.querySelector('[data-role="round"]');
const scoreLabel = app.querySelector('[data-role="score"]');
const helperText = app.querySelector('[data-role="helper"]');

playArea.className = "play-area";
playArea.innerHTML = `<div class="table"></div>`;

hand.className = "hand";
hand.innerHTML = `<div class="palm"></div>`;

clipper.className = "clipper";
clipper.innerHTML = "<span>✂️</span>";

messageCard.className = "message-card";
messageTitle.textContent = "Parada!";
messageText.textContent = "";
nextButton.type = "button";
nextButton.textContent = "Dalsi rucka";
messageCard.append(messageTitle, messageText, nextButton);

playArea.append(hand, clipper, messageCard);
app.append(playArea);

function lighten(hex) {
  const channels = hex
    .replace("#", "")
    .match(/.{1,2}/g)
    .map((part) => parseInt(part, 16));

  const mixed = channels.map((value) => Math.min(255, Math.round(value * 0.72 + 70)));
  return `rgb(${mixed[0]}, ${mixed[1]}, ${mixed[2]})`;
}

function updateHud() {
  roundTitle.textContent = `${rounds[state.roundIndex].sticker} ${rounds[state.roundIndex].name}`;
  scoreLabel.textContent = `Hvezdicky: ${state.score}`;
}

function renderNails() {
  state.nails.forEach((nail) => {
    nail.element.style.height = `${nail.length}px`;
    nail.tip.style.opacity = nail.length <= nail.target + 8 ? "1" : "0.75";
    nail.element.classList.toggle("done", nail.done);
    nail.sparkle.classList.toggle("show", nail.done);
  });
}

function showMessage(title, text, buttonText) {
  messageTitle.textContent = title;
  messageText.textContent = text;
  nextButton.textContent = buttonText;
  messageCard.classList.add("show");
}

function hideMessage() {
  messageCard.classList.remove("show");
}

function checkRoundDone() {
  if (!state.nails.every((nail) => nail.done)) {
    return;
  }

  if (state.roundIndex < rounds.length - 1) {
    showMessage("Hotovo!", "Vsechny nehtiky jsou ostrihane. Muze prijit dalsi rucicka.", "Dalsi rucka");
    return;
  }

  showMessage("Ty jo!", `Zvladla jsi vsechny ruce a nasbirala ${state.score} hvezdicek!`, "Hrat znovu");
}

function cutAtPointer() {
  if (!state.pointerDown) {
    return;
  }

  const playRect = playArea.getBoundingClientRect();
  const handRect = hand.getBoundingClientRect();
  const clipperTipX = playRect.left + state.clipperX + 38;
  const clipperTipY = playRect.top + state.clipperY - 6;
  let trimmed = false;

  state.nails.forEach((nail) => {
    if (nail.done) {
      return;
    }

    const rect = nail.element.getBoundingClientRect();
    const hitX = clipperTipX >= rect.left - 16 && clipperTipX <= rect.right + 16;
    const tipTop = rect.bottom - 28;
    const hitY = clipperTipY >= tipTop - 16 && clipperTipY <= rect.bottom + 18;
    const insideHand = clipperTipY >= handRect.top - 30 && clipperTipY <= handRect.bottom;

    if (hitX && hitY && insideHand) {
      nail.length = Math.max(nail.target, nail.length - 5);
      state.cuts += 1;
      trimmed = true;

      if (nail.length <= nail.target) {
        nail.done = true;
        state.score += 3;
        helperText.textContent = "Krasne! Pokracuj na dalsi nehtik.";
        updateHud();
      }
    }
  });

  if (trimmed) {
    renderNails();
    checkRoundDone();
  }
}

function updateClipperPosition(clientX, clientY) {
  const rect = playArea.getBoundingClientRect();
  state.clipperX = Math.max(40, Math.min(rect.width - 40, clientX - rect.left));
  state.clipperY = Math.max(40, Math.min(rect.height - 40, clientY - rect.top));
  clipper.style.left = `${state.clipperX}px`;
  clipper.style.top = `${state.clipperY}px`;
  cutAtPointer();
}

function setupRound() {
  const config = rounds[state.roundIndex];
  state.nails = [];
  hand.querySelectorAll(".finger").forEach((finger) => finger.remove());
  playArea.style.background = config.bg;

  const fingerOffsets = [8, 25, 42, 59, 76];
  const fingerHeights = [52, 64, 72, 67, 56];

  fingerOffsets.forEach((left, index) => {
    const nail = {
      id: index,
      length: 112,
      target: 56,
      color: config.colors[index],
      done: false,
    };

    const finger = document.createElement("div");
    finger.className = "finger";
    finger.style.left = `${left}%`;
    finger.style.height = `${fingerHeights[index]}%`;

    const nailEl = document.createElement("div");
    nailEl.className = "nail";
    nailEl.style.background = `linear-gradient(180deg, ${nail.color} 0%, ${lighten(nail.color)} 100%)`;

    const tip = document.createElement("div");
    tip.className = "nail-tip";

    const sparkle = document.createElement("div");
    sparkle.className = "sparkle";
    sparkle.textContent = config.sticker;

    nailEl.append(tip, sparkle);
    finger.append(nailEl);
    hand.append(finger);

    nail.element = nailEl;
    nail.tip = tip;
    nail.sparkle = sparkle;
    state.nails.push(nail);
  });

  updateHud();
  renderNails();
  helperText.textContent = "Posouvej kliprem po nehtech a podrz prst. Zkrat vsechny nehtiky na bilou carku.";
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

  if (state.roundIndex < rounds.length - 1 && state.nails.every((nail) => nail.done)) {
    state.roundIndex += 1;
  } else if (state.roundIndex === rounds.length - 1 && state.nails.every((nail) => nail.done)) {
    state.roundIndex = 0;
    state.score = 0;
    state.cuts = 0;
  }

  setupRound();
});

window.addEventListener("resize", () => {
  clipper.style.left = `${Math.min(state.clipperX, playArea.clientWidth - 40)}px`;
  clipper.style.top = `${Math.min(state.clipperY, playArea.clientHeight - 40)}px`;
});

setupRound();
updateClipperPosition(window.innerWidth * 0.5, window.innerHeight * 0.58);
