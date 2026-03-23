const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// === COLOR PALETTE (dusk/dark editor theme) ===
const BG = '#16162a';
const COLORS = {
  keyword:  '#c678dd',  // muted purple
  string:   '#56b6c2',  // cyan
  number:   '#d19a66',  // orange
  func:     '#e06c75',  // pink/rose
  comment:  '#7ec699',  // green
  operator: '#abb2bf',  // light gray
  type:     '#e5c07b',  // warm yellow
};

// === CODE FRAGMENTS ===
const fragments = [
  { text: 'const', color: COLORS.keyword },
  { text: 'let', color: COLORS.keyword },
  { text: 'function', color: COLORS.keyword },
  { text: 'return', color: COLORS.keyword },
  { text: 'import', color: COLORS.keyword },
  { text: 'export', color: COLORS.keyword },
  { text: 'async', color: COLORS.keyword },
  { text: 'await', color: COLORS.keyword },
  { text: 'if', color: COLORS.keyword },
  { text: 'else', color: COLORS.keyword },
  { text: 'from', color: COLORS.keyword },
  { text: 'class', color: COLORS.keyword },
  { text: 'new', color: COLORS.keyword },
  { text: 'throw', color: COLORS.keyword },
  { text: 'try', color: COLORS.keyword },
  { text: 'catch', color: COLORS.keyword },
  { text: 'for', color: COLORS.keyword },
  { text: 'while', color: COLORS.keyword },
  { text: 'default', color: COLORS.keyword },
  { text: 'switch', color: COLORS.keyword },
  { text: 'render()', color: COLORS.func },
  { text: 'parse()', color: COLORS.func },
  { text: 'build()', color: COLORS.func },
  { text: 'init()', color: COLORS.func },
  { text: 'deploy()', color: COLORS.func },
  { text: 'compile()', color: COLORS.func },
  { text: 'transform()', color: COLORS.func },
  { text: 'resolve()', color: COLORS.func },
  { text: 'create()', color: COLORS.func },
  { text: 'fetch()', color: COLORS.func },
  { text: 'emit()', color: COLORS.func },
  { text: 'handle()', color: COLORS.func },
  { text: 'process()', color: COLORS.func },
  { text: 'validate()', color: COLORS.func },
  { text: 'execute()', color: COLORS.func },
  { text: 'connect()', color: COLORS.func },
  { text: '"hello"', color: COLORS.string },
  { text: "'world'", color: COLORS.string },
  { text: '`${v}`', color: COLORS.string },
  { text: '"api/v1"', color: COLORS.string },
  { text: '"utf-8"', color: COLORS.string },
  { text: "'click'", color: COLORS.string },
  { text: '"index"', color: COLORS.string },
  { text: '"data"', color: COLORS.string },
  { text: '42', color: COLORS.number },
  { text: '0xFF', color: COLORS.number },
  { text: '3.14', color: COLORS.number },
  { text: '1024', color: COLORS.number },
  { text: '256', color: COLORS.number },
  { text: '0', color: COLORS.number },
  { text: '100', color: COLORS.number },
  { text: 'null', color: COLORS.number },
  { text: 'true', color: COLORS.number },
  { text: 'false', color: COLORS.number },
  { text: '// init', color: COLORS.comment },
  { text: '// TODO', color: COLORS.comment },
  { text: '// fix', color: COLORS.comment },
  { text: '/* api */', color: COLORS.comment },
  { text: '// ok', color: COLORS.comment },
  { text: '// done', color: COLORS.comment },
  { text: '// hack', color: COLORS.comment },
  { text: '// cfg', color: COLORS.comment },
  { text: '=>', color: COLORS.operator },
  { text: '===', color: COLORS.operator },
  { text: '{ }', color: COLORS.operator },
  { text: '( )', color: COLORS.operator },
  { text: '[ ]', color: COLORS.operator },
  { text: '...', color: COLORS.operator },
  { text: '&&', color: COLORS.operator },
  { text: '||', color: COLORS.operator },
  { text: '??', color: COLORS.operator },
  { text: '::', color: COLORS.operator },
  { text: '->', color: COLORS.operator },
  { text: '!=', color: COLORS.operator },
  { text: '+=', color: COLORS.operator },
  { text: '?.', color: COLORS.operator },
  { text: 'Promise', color: COLORS.type },
  { text: 'Array', color: COLORS.type },
  { text: 'Object', color: COLORS.type },
  { text: 'Map', color: COLORS.type },
  { text: 'Set', color: COLORS.type },
  { text: 'Buffer', color: COLORS.type },
  { text: 'Stream', color: COLORS.type },
  { text: 'Error', color: COLORS.type },
  { text: 'Node', color: COLORS.type },
  { text: 'Event', color: COLORS.type },
  { text: 'x = 0', color: COLORS.operator },
  { text: 'i++', color: COLORS.operator },
  { text: 'fn(x)', color: COLORS.func },
  { text: 'a.b', color: COLORS.operator },
  { text: '.map', color: COLORS.func },
  { text: '.then', color: COLORS.func },
  { text: '.catch', color: COLORS.func },
  { text: 'req', color: COLORS.operator },
  { text: 'res', color: COLORS.operator },
  { text: 'ctx', color: COLORS.operator },
  { text: 'err', color: COLORS.func },
  { text: 'cb', color: COLORS.func },
  { text: 'key', color: COLORS.operator },
  { text: 'val', color: COLORS.operator },
  { text: 'src', color: COLORS.operator },
  { text: 'dst', color: COLORS.operator },
];

// Deterministic PRNG
function mulberry32(seed) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function renderCodeSpiral(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;
  const rand = mulberry32(98765);

  // Fill background
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, size, size);

  // Spiral parameters
  const a = size * 0.018;
  const b = 0.12;
  const maxRadius = size * 0.47;
  const coreRadius = size * 0.075; // fragments start outside the core glow

  const arms = [
    { offset: 0, opacityScale: 1.0, sizeScale: 1.0, fragOffset: 0 },
    { offset: Math.PI * 2 / 3, opacityScale: 0.8, sizeScale: 0.9, fragOffset: 33 },
    { offset: Math.PI * 4 / 3, opacityScale: 0.65, sizeScale: 0.82, fragOffset: 67 },
  ];

  const placedFragments = [];

  for (const arm of arms) {
    let theta = 0.5;
    let fi = arm.fragOffset;

    while (true) {
      const r = a * Math.exp(b * theta);
      if (r > maxRadius) break;

      // Skip fragments inside the core glow
      if (r < coreRadius) {
        theta += 0.4;
        continue;
      }

      const angle = theta + arm.offset;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);

      // Tangent angle
      const tangentAngle = angle + Math.atan(1 / b);

      const frag = fragments[fi % fragments.length];
      fi++;

      const normalizedR = (r - coreRadius) / (maxRadius - coreRadius);

      // Font size: consistent but slightly smaller at edges
      const baseFontSize = size * 0.022;
      const fontSize = Math.max(
        size * 0.013,
        baseFontSize * (1 - normalizedR * 0.35) * arm.sizeScale
      );

      // Opacity curve: peak around 20-40% radius, fade both directions
      let opacity;
      if (normalizedR < 0.15) {
        opacity = 0.5 + normalizedR * 3.3; // ramp up from core
      } else if (normalizedR < 0.45) {
        opacity = 1.0; // brightest band
      } else {
        opacity = Math.max(0.12, 1.0 - (normalizedR - 0.45) * 1.5);
      }
      opacity *= arm.opacityScale;

      // Small perpendicular jitter
      const perpAngle = tangentAngle + Math.PI / 2;
      const perpOffset = (rand() - 0.5) * fontSize * 0.5;
      const fx = x + Math.cos(perpAngle) * perpOffset;
      const fy = y + Math.sin(perpAngle) * perpOffset;

      placedFragments.push({
        text: frag.text,
        color: frag.color,
        x: fx, y: fy,
        angle: tangentAngle,
        fontSize,
        opacity,
        r,
      });

      // Adaptive spacing: tighter near center, wider at edges
      // Also accounts for text length to prevent overlaps
      const textLen = frag.text.length;
      const arcSpacing = (fontSize * textLen * 0.6) / r; // angular space the text occupies
      const innerBoost = normalizedR < 0.25 ? 0.12 : 0; // extra gap near core
      const minStep = 0.20;
      theta += Math.max(minStep, arcSpacing + 0.10 + innerBoost + rand() * 0.06);
    }
  }

  // Sort outer-first for painter's algorithm
  placedFragments.sort((a, b) => b.r - a.r);

  // === RENDER FRAGMENTS ===
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';

  for (const frag of placedFragments) {
    ctx.save();
    ctx.translate(frag.x, frag.y);
    ctx.rotate(frag.angle);

    const fontPx = Math.round(frag.fontSize);
    ctx.font = `500 ${fontPx}px "Courier New", "Courier", monospace`;
    ctx.globalAlpha = frag.opacity;
    ctx.fillStyle = frag.color;

    // Subtle glow on brighter fragments
    if (frag.opacity > 0.6) {
      ctx.shadowColor = frag.color;
      ctx.shadowBlur = frag.fontSize * 0.5;
    } else {
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    }

    ctx.fillText(frag.text, 0, 0);
    ctx.restore();
  }

  // === CORE GLOW (layered radial gradients) ===
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';

  // Large soft ambient glow
  {
    const r = size * 0.18;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, 'rgba(180, 160, 255, 0.25)');
    g.addColorStop(0.35, 'rgba(140, 110, 220, 0.12)');
    g.addColorStop(0.7, 'rgba(80, 60, 160, 0.04)');
    g.addColorStop(1, 'rgba(40, 30, 80, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }

  // Mid glow
  {
    const r = size * 0.09;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, 'rgba(210, 195, 255, 0.55)');
    g.addColorStop(0.3, 'rgba(180, 155, 240, 0.25)');
    g.addColorStop(0.7, 'rgba(140, 110, 210, 0.08)');
    g.addColorStop(1, 'rgba(100, 80, 180, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }

  // Inner bright core
  {
    const r = size * 0.04;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, 'rgba(255, 250, 255, 0.85)');
    g.addColorStop(0.25, 'rgba(240, 225, 255, 0.6)');
    g.addColorStop(0.55, 'rgba(200, 175, 245, 0.25)');
    g.addColorStop(1, 'rgba(160, 130, 220, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }

  // Hot center point
  {
    const r = size * 0.015;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    g.addColorStop(0.4, 'rgba(255, 245, 255, 0.5)');
    g.addColorStop(1, 'rgba(230, 210, 255, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }

  return canvas;
}

// === OUTPUT ===
const outDir = __dirname;

const sizes = [
  { name: 'avatar-512.png', size: 512 },
  { name: 'avatar-256.png', size: 256 },
  { name: 'avatar-128.png', size: 128 },
];

for (const { name, size } of sizes) {
  console.log(`Rendering ${name} (${size}x${size})...`);
  const canvas = renderCodeSpiral(size);
  const buf = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(outDir, name), buf);
  console.log(`  -> ${buf.length} bytes`);
}

// Profile: render at larger size and crop center for tighter framing
console.log('Rendering avatar-profile-512.png...');
{
  const fullSize = 620;
  const canvas = renderCodeSpiral(fullSize);
  const cropCanvas = createCanvas(512, 512);
  const cropCtx = cropCanvas.getContext('2d');
  const offset = (fullSize - 512) / 2;
  cropCtx.drawImage(canvas, offset, offset, 512, 512, 0, 0, 512, 512);
  const buf = cropCanvas.toBuffer('image/png');
  fs.writeFileSync(path.join(outDir, 'avatar-profile-512.png'), buf);
  console.log(`  -> ${buf.length} bytes`);
}

console.log('Done!');
