// Generates the app icon, adaptive foreground, splash mark and favicon as a
// compass star (white star + orange "north" needle) on the brand teal.
// Run with: node scripts/generate-icons.mjs
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'images');

const TEAL = [13, 148, 136, 255];
const WHITE = [255, 255, 255, 255];
const ORANGE = [249, 115, 22, 255];
const CLEAR = [0, 0, 0, 0];

// --- minimal PNG encoder (RGBA, no filter) ---------------------------------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeData), 0);
  return Buffer.concat([len, typeData, crc]);
}

function encodePNG(size, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y += 1) {
    raw[y * (size * 4 + 1)] = 0; // filter: none
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// --- compass star geometry --------------------------------------------------
function starVertices(c, longR, shortR) {
  const pts = [];
  for (let i = 0; i < 8; i += 1) {
    const angle = ((-90 + i * 45) * Math.PI) / 180;
    const r = i % 2 === 0 ? longR : shortR;
    pts.push([c + r * Math.cos(angle), c + r * Math.sin(angle)]);
  }
  return pts;
}

function inPoly(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i, i += 1) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

// Render with 2x supersampling for smooth edges, then box-downsample.
function drawIcon(size, longR, shortR, background) {
  const ss = 2;
  const big = size * ss;
  const c = big / 2;
  const star = starVertices(c, longR * ss, shortR * ss);
  const northKite = [star[0], star[1], [c, c], star[7]];
  const hi = new Uint8ClampedArray(big * big * 4);

  for (let y = 0; y < big; y += 1) {
    for (let x = 0; x < big; x += 1) {
      let color = background ?? CLEAR;
      if (inPoly(x + 0.5, y + 0.5, star)) {
        color = inPoly(x + 0.5, y + 0.5, northKite) ? ORANGE : WHITE;
      }
      const o = (y * big + x) * 4;
      hi[o] = color[0];
      hi[o + 1] = color[1];
      hi[o + 2] = color[2];
      hi[o + 3] = color[3];
    }
  }

  const out = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let dy = 0; dy < ss; dy += 1) {
        for (let dx = 0; dx < ss; dx += 1) {
          const o = ((y * ss + dy) * big + (x * ss + dx)) * 4;
          r += hi[o];
          g += hi[o + 1];
          b += hi[o + 2];
          a += hi[o + 3];
        }
      }
      const n = ss * ss;
      const o = (y * size + x) * 4;
      out[o] = Math.round(r / n);
      out[o + 1] = Math.round(g / n);
      out[o + 2] = Math.round(b / n);
      out[o + 3] = Math.round(a / n);
    }
  }
  return encodePNG(size, out);
}

const files = [
  ['icon.png', drawIcon(1024, 430, 175, TEAL)],
  ['adaptive-foreground.png', drawIcon(1024, 320, 130, null)],
  ['splash-icon.png', drawIcon(1024, 300, 120, null)],
  ['favicon.png', drawIcon(48, 20, 8, TEAL)],
];

for (const [name, data] of files) {
  writeFileSync(join(OUT, name), data);
  console.log(`wrote assets/images/${name} (${data.length} bytes)`);
}
