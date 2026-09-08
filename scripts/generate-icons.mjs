// Erzeugt die PWA-Icons als echte PNG-Dateien, ganz ohne externe
// Bildbibliotheken (nur Node-Bordmittel: zlib fuer die PNG-Kompression).
// Motiv: stilisierte Zug-Front (Kabine + zwei Fenster + zwei Raeder)
// auf farbigem, abgerundetem Quadrat.
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '..', 'public', 'icons')
mkdirSync(outDir, { recursive: true })

const BG = [29, 78, 216] // #1d4ed8
const FG = [255, 255, 255]

function roundedRectSd(px, py, x0, y0, x1, y1, r) {
  const cx = Math.min(Math.max(px, x0 + r), x1 - r)
  const cy = Math.min(Math.max(py, y0 + r), y1 - r)
  const dx = px - cx
  const dy = py - cy
  return Math.sqrt(dx * dx + dy * dy) - r
}

function inCircle(px, py, cx, cy, r) {
  const dx = px - cx
  const dy = py - cy
  return dx * dx + dy * dy <= r * r
}

/**
 * @param {number} size Kantenlaenge in Pixeln
 * @param {boolean} maskable Falls true: Hintergrund fuellt das ganze Bild
 *   (kein abgerundetes Quadrat, kein Transparenzrand) fuer Android-Masken.
 */
function renderIcon(size, maskable) {
  const data = Buffer.alloc(size * size * 4)
  const bgRadius = maskable ? 0 : size * 0.18
  const bx0 = 0
  const by0 = 0
  const bx1 = size
  const by1 = size

  // Zugkabine mittig, etwas kleiner bei maskable-Icons (Safe-Zone).
  const scale = maskable ? 0.42 : 0.5
  const cabW = size * scale
  const cabH = cabW * 0.62
  const cabX0 = (size - cabW) / 2
  const cabY0 = size * (maskable ? 0.34 : 0.28)
  const cabX1 = cabX0 + cabW
  const cabY1 = cabY0 + cabH
  const cabR = cabH * 0.35

  const wheelR = cabW * 0.1
  const wheelY = cabY1
  const wheelX1 = cabX0 + cabW * 0.28
  const wheelX2 = cabX0 + cabW * 0.72

  const winW = cabW * 0.22
  const winH = cabH * 0.32
  const winY0 = cabY0 + cabH * 0.18
  const winY1 = winY0 + winH
  const winX1a = cabX0 + cabW * 0.18
  const winX1b = winX1a + winW
  const winX2a = cabX0 + cabW * 0.6
  const winX2b = winX2a + winW
  const winR = winH * 0.25

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const px = x + 0.5
      const py = y + 0.5
      const idx = (y * size + x) * 4

      let r = 0
      let g = 0
      let b = 0
      let a = 0

      const bgSd = maskable ? -1 : roundedRectSd(px, py, bx0, by0, bx1, by1, bgRadius)
      if (bgSd <= 0) {
        ;[r, g, b] = BG
        a = 255
      }

      if (a === 255) {
        const inWheel = inCircle(px, py, wheelX1, wheelY, wheelR) || inCircle(px, py, wheelX2, wheelY, wheelR)
        const cabSd = roundedRectSd(px, py, cabX0, cabY0, cabX1, cabY1, cabR)
        const inCab = cabSd <= 0
        const inWindow =
          roundedRectSd(px, py, winX1a, winY0, winX1b, winY1, winR) <= 0 ||
          roundedRectSd(px, py, winX2a, winY0, winX2b, winY1, winR) <= 0

        if (inWheel || (inCab && !inWindow)) {
          ;[r, g, b] = FG
        } else if (inCab && inWindow) {
          ;[r, g, b] = BG
        }
      }

      data[idx] = r
      data[idx + 1] = g
      data[idx + 2] = b
      data[idx + 3] = a
    }
  }
  return data
}

const crcTable = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[n] = c >>> 0
  }
  return table
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  }
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, payload) {
  const typeBuf = Buffer.from(type, 'ascii')
  const lenBuf = Buffer.alloc(4)
  lenBuf.writeUInt32BE(payload.length, 0)
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, payload])), 0)
  return Buffer.concat([lenBuf, typeBuf, payload, crcBuf])
}

function encodePng(size, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type: RGBA
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  const raw = Buffer.alloc(size * (size * 4 + 1))
  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * 4 + 1)
    raw[rowStart] = 0 // Filter: None
    rgba.copy(raw, rowStart + 1, y * size * 4, (y + 1) * size * 4)
  }
  const idat = deflateSync(raw, { level: 9 })

  return Buffer.concat([signature, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))])
}

function writeIcon(name, size, maskable) {
  const rgba = renderIcon(size, maskable)
  const png = encodePng(size, rgba)
  const outPath = path.join(outDir, name)
  writeFileSync(outPath, png)
  console.log(`geschrieben: ${path.relative(process.cwd(), outPath)} (${size}x${size})`)
}

writeIcon('icon-192.png', 192, false)
writeIcon('icon-512.png', 512, false)
writeIcon('icon-maskable-512.png', 512, true)
writeIcon('apple-touch-icon.png', 180, false)
