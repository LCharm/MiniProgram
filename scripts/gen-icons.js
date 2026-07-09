// Generate 81x81 PNG tabBar icons using built-in zlib only (no deps)
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const SIZE = 81;
const OUT = path.resolve(__dirname, '..', 'assets', 'tabbar');

function crc32(buf) {
  let c;
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    table[n] = c;
  }
  c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const lenB = Buffer.allocUnsafe(4); lenB.writeUInt32BE(data.length);
  const hdr = Buffer.concat([lenB, Buffer.from(type), data]);
  const crcB = Buffer.allocUnsafe(4); crcB.writeUInt32BE(crc32(hdr.slice(4)));
  return Buffer.concat([hdr, crcB]);
}

function buildPNG(pixels) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(SIZE, 0);
  ihdr.writeUInt32BE(SIZE, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  const raw = Buffer.allocUnsafe(SIZE * (1 + SIZE * 4));
  for (let y = 0; y < SIZE; y++) {
    raw[y * (1 + SIZE * 4)] = 0; // filter: None
    pixels.copy(raw, y * (1 + SIZE * 4) + 1, y * SIZE * 4, (y + 1) * SIZE * 4);
  }
  const idatData = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idatData), chunk('IEND', Buffer.alloc(0))]);
}

function blank() { return Buffer.alloc(SIZE * SIZE * 4, 0); }

function hexToRGBA(hex) {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16), 255];
}

function fillCircle(buf, cx, cy, r, rgba) {
  const minY = Math.max(0, Math.ceil(cy - r));
  const maxY = Math.min(SIZE, Math.floor(cy + r + 1));
  for (let y = minY; y < maxY; y++) {
    for (let x = Math.max(0, Math.ceil(cx - r)); x < Math.min(SIZE, Math.floor(cx + r + 1)); x++) {
      if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) {
        const o = (y * SIZE + x) * 4;
        buf[o] = rgba[0]; buf[o + 1] = rgba[1]; buf[o + 2] = rgba[2]; buf[o + 3] = rgba[3];
      }
    }
  }
}

function fillRect(buf, x, y, w, h, rgba) {
  const x0 = Math.max(0, Math.round(x)), y0 = Math.max(0, Math.round(y));
  const x1 = Math.min(SIZE, Math.round(x + w)), y1 = Math.min(SIZE, Math.round(y + h));
  for (let py = y0; py < y1; py++) {
    for (let px = x0; px < x1; px++) {
      const o = (py * SIZE + px) * 4;
      buf[o] = rgba[0]; buf[o + 1] = rgba[1]; buf[o + 2] = rgba[2]; buf[o + 3] = rgba[3];
    }
  }
}

function fillTri(buf, x1, y1, x2, y2, x3, y3, rgba) {
  const minX = Math.max(0, Math.floor(Math.min(x1, x2, x3)));
  const maxX = Math.min(SIZE - 1, Math.ceil(Math.max(x1, x2, x3)));
  const minY = Math.max(0, Math.floor(Math.min(y1, y2, y3)));
  const maxY = Math.min(SIZE - 1, Math.ceil(Math.max(y1, y2, y3)));
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const d1 = (x - x2) * (y1 - y2) - (x1 - x2) * (y - y2);
      const d2 = (x - x3) * (y2 - y3) - (x2 - x3) * (y - y3);
      const d3 = (x - x1) * (y3 - y1) - (x3 - x1) * (y - y1);
      const neg = (d1 < 0) || (d2 < 0) || (d3 < 0);
      const pos = (d1 > 0) || (d2 > 0) || (d3 > 0);
      if (!(neg && pos)) {
        const o = (y * SIZE + x) * 4;
        buf[o] = rgba[0]; buf[o + 1] = rgba[1]; buf[o + 2] = rgba[2]; buf[o + 3] = rgba[3];
      }
    }
  }
}

const CX = SIZE / 2, CY = SIZE / 2, R = SIZE * 0.34;

function drawHouse(rgba) {
  const buf = blank();
  const top = CY - R * 1.0, baseY = CY - R * 0.1;
  const hw = R * 1.05;
  fillTri(buf, CX - hw, baseY, CX, top, CX + hw, baseY, rgba);
  fillRect(buf, CX - R * 1.1, baseY, R * 2.2, R * 1.05, rgba);
  return buf;
}

function drawHeart(rgba) {
  const buf = blank();
  const rr = R * 0.48;
  fillCircle(buf, CX - rr * 0.85, CY - rr * 0.35, rr, rgba);
  fillCircle(buf, CX + rr * 0.85, CY - rr * 0.35, rr, rgba);
  fillTri(buf, CX - rr * 1.7, CY - rr * 0.2, CX, CY + rr * 1.25, CX + rr * 1.7, CY - rr * 0.2, rgba);
  return buf;
}

function drawCup(rgba) {
  const buf = blank();
  const cw = R * 0.95, ch = R * 1.1;
  fillRect(buf, CX - cw / 2, CY - R * 0.15, cw, ch, rgba);
  fillCircle(buf, CX + cw / 2 + R * 0.4, CY + R * 0.2, R * 0.35, rgba);
  return buf;
}

function drawLeaf(rgba) {
  const buf = blank();
  fillCircle(buf, CX, CY, R, rgba);
  return buf;
}

const icons = [
  { name: 'home',   normal: '#7a7a7a', active: '#e8a838', draw: drawHouse },
  { name: 'health', normal: '#7a7a7a', active: '#4ecdc4', draw: drawHeart },
  { name: 'tea',    normal: '#7a7a7a', active: '#a855f7', draw: drawCup   },
  { name: 'huatuo', normal: '#7a7a7a', active: '#ff6b9d', draw: drawLeaf  },
];

for (const icon of icons) {
  for (const state of ['normal', 'active']) {
    const hex = state === 'normal' ? icon.normal : icon.active;
    const rgba = hexToRGBA(hex);
    const pixels = icon.draw(rgba);
    const png = buildPNG(pixels);
    const fname = state === 'normal' ? `${icon.name}.png` : `${icon.name}-active.png`;
    fs.writeFileSync(path.join(OUT, fname), png);
    console.log(`${fname}  ${png.length} bytes`);
  }
}
console.log('Done — 8 icons generated.');
