const yesBtn = document.getElementById("yesBtn");
const noBtn  = document.getElementById("noBtn");
const card   = document.querySelector(".card");
const msg    = document.getElementById("message");
const confettiLayer = document.getElementById("confetti");

const cuteYesLines = [
  "YAY!! 💖 I knew you’d say yes 😌✨",
  "Best. Valentine. Ever. 💞",
  "Okay now… date planning mode: ON 🥰",
  "You just made my whole week 💘"
];

function rand(min, max){ return Math.floor(Math.random() * (max - min + 1)) + min; }

function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

function getCardBounds(){
  const r = card.getBoundingClientRect();
  return { left:r.left, top:r.top, right:r.right, bottom:r.bottom, width:r.width, height:r.height };
}

function placeNoButton(x, y){
  const bounds = getCardBounds();
  const btnRect = noBtn.getBoundingClientRect();

  // Keep inside the card area nicely
  const padding = 14;
  const minX = bounds.left + padding;
  const maxX = bounds.right - btnRect.width - padding;
  const minY = bounds.top + 90; // avoid overlapping title
  const maxY = bounds.bottom - btnRect.height - padding;

  const nx = clamp(x, minX, maxX);
  const ny = clamp(y, minY, maxY);

  // Convert to card-relative coordinates
  const cx = nx - bounds.left;
  const cy = ny - bounds.top;

  noBtn.style.left = `${cx}px`;
  noBtn.style.top  = `${cy}px`;
}

function teleportNoButton(awayFromX, awayFromY){
  const bounds = getCardBounds();

  // Choose a new point biased away from cursor/touch
  const tries = 12;
  let best = null;

  for(let i=0;i<tries;i++){
    const x = bounds.left + rand(20, Math.floor(bounds.width - 80));
    const y = bounds.top  + rand(110, Math.floor(bounds.height - 40));
    const dx = x - awayFromX;
    const dy = y - awayFromY;
    const d2 = dx*dx + dy*dy;

    if(!best || d2 > best.d2){
      best = { x, y, d2 };
    }
  }

  placeNoButton(best.x, best.y);
  tinyHeart(best.x, best.y, "😈");
}

function tinySparkle(x,y){
  const s = document.createElement("div");
  s.className = "sparkle";
  s.style.left = `${x}px`;
  s.style.top  = `${y}px`;
  document.body.appendChild(s);
  setTimeout(()=>s.remove(), 650);
}

function tinyHeart(x,y,emoji="💗"){
  const h = document.createElement("div");
  h.className = "heart";
  h.textContent = emoji;
  h.style.left = `${x}px`;
  h.style.top  = `${y}px`;
  h.style.fontSize = `${rand(16,24)}px`;
  document.body.appendChild(h);
  setTimeout(()=>h.remove(), 1500);
}

function confettiBurst(){
  const pieces = 140;
  const w = window.innerWidth;
  const h = window.innerHeight;

  for(let i=0;i<pieces;i++){
    const p = document.createElement("div");
    p.style.position = "absolute";
    p.style.left = `${rand(0, w)}px`;
    p.style.top  = `-20px`;
    p.style.width = `${rand(6, 12)}px`;
    p.style.height= `${rand(10, 18)}px`;
    p.style.borderRadius = `${rand(2, 6)}px`;
    p.style.background = `hsl(${rand(320, 360)}, ${rand(70, 95)}%, ${rand(55, 70)}%)`;
    p.style.opacity = `${Math.random() * 0.35 + 0.65}`;
    p.style.transform = `rotate(${rand(0, 360)}deg)`;

    const duration = rand(900, 1500);
    const drift = rand(-120, 120);
    const endY = h + 40;

    p.animate([
      { transform: `translate(0,0) rotate(0deg)`, offset: 0 },
      { transform: `translate(${drift}px, ${endY}px) rotate(${rand(180, 720)}deg)`, offset: 1 }
    ], { duration, easing: "cubic-bezier(.15,.8,.25,1)", fill: "forwards" });

    confettiLayer.appendChild(p);
    setTimeout(()=>p.remove(), duration + 50);
  }
}

function setYesMode(){
  msg.textContent = cuteYesLines[rand(0, cuteYesLines.length - 1)];
  confettiBurst();

  // Make the YES button extra cute afterwards
  yesBtn.textContent = "YESS!!! 🥰💘";
  yesBtn.style.transform = "scale(1.06)";

  // Calmly retire the No button
  noBtn.style.opacity = "0.15";
  noBtn.style.filter = "grayscale(1)";
  noBtn.style.pointerEvents = "none";
}

yesBtn.addEventListener("click", () => {
  setYesMode();
});

// --- Make NO uncatchable (desktop + mobile) ---
function dodge(event){
  const point = getPoint(event);
  teleportNoButton(point.x, point.y);
  tinySparkle(point.x, point.y);
}

function getPoint(e){
  if(e.touches && e.touches[0]){
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  return { x: e.clientX, y: e.clientY };
}

// Desktop: before hover or click
noBtn.addEventListener("mouseenter", dodge);
noBtn.addEventListener("mousemove", (e) => {
  // If user gets too close, move
  const r = noBtn.getBoundingClientRect();
  const { x, y } = getPoint(e);
  const cx = r.left + r.width/2;
  const cy = r.top + r.height/2;
  const d = Math.hypot(x - cx, y - cy);
  if(d < 70) dodge(e);
});
noBtn.addEventListener("mousedown", dodge);

// Mobile: on approach / touch
noBtn.addEventListener("touchstart", dodge, { passive: true });
noBtn.addEventListener("touchmove", dodge, { passive: true });

// Little ambient cursor sparkles (optional, cute)
window.addEventListener("mousemove", (e) => {
  if(Math.random() < 0.07) tinySparkle(e.clientX, e.clientY);
  if(Math.random() < 0.03) tinyHeart(e.clientX, e.clientY, "💗");
});

// Initial placement (responsive)
window.addEventListener("load", () => {
  const bounds = getCardBounds();
  placeNoButton(bounds.left + 260, bounds.top + 240);
});
window.addEventListener("resize", () => {
  const bounds = getCardBounds();
  placeNoButton(bounds.left + 260, bounds.top + 240);
});
