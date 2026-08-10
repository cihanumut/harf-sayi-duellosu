// PWA ikonlarını harici araç olmadan üretir: hedef (🎯) temalı PNG'ler.
// Kullanım: node scripts/gen-icons.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const OUT = new URL('../client/public/', import.meta.url);
mkdirSync(OUT, { recursive: true });

// --- Basit RGBA tuval ---
function canvas(size) {
  return { size, data: new Uint8Array(size * size * 4) };
}
function px(c, x, y, [r, g, b, a = 255]) {
  if (x < 0 || y < 0 || x >= c.size || y >= c.size) return;
  const i = (y * c.size + x) * 4;
  // alpha blend
  const sa = a / 255, da = 1 - sa;
  c.data[i]     = Math.round(r * sa + c.data[i] * da);
  c.data[i + 1] = Math.round(g * sa + c.data[i + 1] * da);
  c.data[i + 2] = Math.round(b * sa + c.data[i + 2] * da);
  c.data[i + 3] = Math.max(c.data[i + 3], a);
}
function fillRoundRect(c, color, radius) {
  const s = c.size, r = radius;
  for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
    // yuvarlak köşe maskesi
    let inside = true;
    const cx = x < r ? r : x > s - 1 - r ? s - 1 - r : x;
    const cy = y < r ? r : y > s - 1 - r ? s - 1 - r : y;
    if (cx !== x && cy !== y) {
      const d = Math.hypot(x - cx, y - cy);
      inside = d <= r;
    }
    if (inside) px(c, x, y, color);
  }
}
function fillCircle(c, ccx, ccy, rad, color) {
  const s = c.size;
  for (let y = Math.floor(ccy - rad); y <= Math.ceil(ccy + rad); y++)
    for (let x = Math.floor(ccx - rad); x <= Math.ceil(ccx + rad); x++) {
      const d = Math.hypot(x + 0.5 - ccx, y + 0.5 - ccy);
      if (d <= rad) {
        // kenar yumuşatma
        const a = d > rad - 1 ? Math.round(255 * (rad - d)) : 255;
        px(c, x, y, [color[0], color[1], color[2], Math.max(0, Math.min(255, a)) * (color[3] ?? 255) / 255 | 0]);
      }
    }
}

// --- PNG kodlayıcı ---
function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xEDB88320 & -(c & 1));
  }
  return ~c >>> 0;
}
function chunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}
function encodePNG(c) {
  const s = c.size;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(s, 0); ihdr.writeUInt32BE(s, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit, RGBA
  // filtre baytı ekle (her satır başına 0)
  const raw = Buffer.alloc(s * (s * 4 + 1));
  for (let y = 0; y < s; y++) {
    raw[y * (s * 4 + 1)] = 0;
    c.data.subarray(y * s * 4, (y + 1) * s * 4)
      .forEach((v, i) => { raw[y * (s * 4 + 1) + 1 + i] = v; });
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

// --- Hedef ikonu çiz ---
function drawIcon(size, { padding = false } = {}) {
  const c = canvas(size);
  const bg = [15, 23, 42, 255];      // koyu lacivert
  fillRoundRect(c, bg, Math.round(size * (padding ? 0 : 0.22)));
  const cx = size / 2, cy = size / 2;
  // maskeli ikonlarda kenar boşluğu bırak
  const R = size * (padding ? 0.30 : 0.38);
  const rings = [
    [239, 68, 68],   // kırmızı
    [255, 255, 255], // beyaz
    [239, 68, 68],
    [255, 255, 255],
  ];
  rings.forEach((col, i) => fillCircle(c, cx, cy, R * (1 - i * 0.24), [...col, 255]));
  fillCircle(c, cx, cy, R * 0.12, [15, 23, 42, 255]); // merkez nokta
  return c;
}

const targets = [
  ['pwa-192.png', 192, {}],
  ['pwa-512.png', 512, {}],
  ['maskable-512.png', 512, { padding: true }],
  ['apple-touch-icon.png', 180, {}],
];
for (const [name, size, opt] of targets) {
  const png = encodePNG(drawIcon(size, opt));
  writeFileSync(new URL(name, OUT), png);
  console.log(`✓ ${name} (${size}x${size}, ${png.length} bayt)`);
}
console.log('PWA ikonları client/public/ içine üretildi.');

// --- Capacitor kaynak görselleri (client/resources/) ---
// @capacitor/assets bu görsellerden tüm Android launcher ikon ve splash'lerini üretir.
const RES = new URL('../client/resources/', import.meta.url);
mkdirSync(RES, { recursive: true });

// icon.png: 1024x1024 tam ikon
writeFileSync(new URL('icon.png', RES), encodePNG(drawIcon(1024, {})));
// icon-foreground / icon-background: adaptif ikon (ön plan şeffaf zeminde hedef, arka plan düz renk)
const fg = canvas(1024);                       // şeffaf zemin + merkezde hedef
(() => {
  const cx = 512, cy = 512, R = 1024 * 0.30;   // maskeli alan için küçük tut
  const rings = [[239,68,68],[255,255,255],[239,68,68],[255,255,255]];
  rings.forEach((c, i) => fillCircle(fg, cx, cy, R * (1 - i * 0.24), [...c, 255]));
  fillCircle(fg, cx, cy, R * 0.12, [15,23,42,255]);
})();
writeFileSync(new URL('icon-foreground.png', RES), encodePNG(fg));
const bg = canvas(1024); fillRoundRect(bg, [15,23,42,255], 0);
writeFileSync(new URL('icon-background.png', RES), encodePNG(bg));

// splash.png: 2732x2732 koyu zemin + ortada hedef
function drawSplash() {
  const s = 2732, c = canvas(s);
  fillRoundRect(c, [15,23,42,255], 0);
  const cx = s/2, cy = s/2, R = s * 0.14;
  const rings = [[239,68,68],[255,255,255],[239,68,68],[255,255,255]];
  rings.forEach((col, i) => fillCircle(c, cx, cy, R * (1 - i * 0.24), [...col, 255]));
  fillCircle(c, cx, cy, R * 0.12, [15,23,42,255]);
  return c;
}
const splash = encodePNG(drawSplash());
writeFileSync(new URL('splash.png', RES), splash);
writeFileSync(new URL('splash-dark.png', RES), splash);
console.log('Capacitor kaynak görselleri client/resources/ içine üretildi.');
