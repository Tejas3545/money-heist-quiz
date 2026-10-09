// Generates simple placeholder logos (PNG, no dependencies). Replace the files with the real logos.
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';

function crc32(buf) {
  let c, crc = ~0;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return ~crc >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(size, ring, fill, bar) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  const c = size / 2;
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const d = Math.hypot(x - c, y - c);
      let px = [0, 0, 0, 0];
      if (d < c - 2) px = d > c - 16 ? ring : fill;
      if (d < c - 40 && Math.abs(x - y) < 14) px = bar; // diagonal slash
      raw.set(px, y * (size * 4 + 1) + 1 + x * 4);
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

mkdirSync('public/brand', { recursive: true });
writeFileSync('public/brand/adsc-logo.png', png(256, [201, 162, 39, 255], [21, 21, 22, 255], [200, 16, 46, 255]));
writeFileSync('public/brand/atmiya-logo.png', png(256, [232, 225, 208, 255], [21, 21, 22, 255], [201, 162, 39, 255]));
console.log('Wrote public/brand/adsc-logo.png and atmiya-logo.png (placeholders).');
