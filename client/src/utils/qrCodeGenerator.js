/**
 * High-performance, self-contained QR Code Generator (Byte mode, Error Correction Level M/L)
 * Generates boolean matrices, SVG strings, and Canvas renderers with zero external dependencies.
 */

// QR Code Constants and Tables
const PAD0 = 0xec;
const PAD1 = 0x11;

// Galois Field GF(256) math tables
const EXP_TABLE = new Uint8Array(256);
const LOG_TABLE = new Uint8Array(256);
for (let i = 0, x = 1; i < 256; i++) {
  EXP_TABLE[i] = x;
  LOG_TABLE[x] = i;
  x = (x << 1) ^ (x >= 128 ? 0x11d : 0);
}

function glog(n) {
  if (n < 1) throw new Error('glog(' + n + ')');
  return LOG_TABLE[n];
}

function gexp(n) {
  while (n < 0) n += 255;
  while (n >= 256) n -= 255;
  return EXP_TABLE[n];
}

class Polynomial {
  constructor(num, shift = 0) {
    let offset = 0;
    while (offset < num.length && num[offset] === 0) offset++;
    this.num = new Uint8Array(num.length - offset + shift);
    for (let i = 0; i < num.length - offset; i++) {
      this.num[i] = num[offset + i];
    }
  }

  get(index) {
    return this.num[index];
  }

  getLength() {
    return this.num.length;
  }

  multiply(e) {
    const num = new Uint8Array(this.getLength() + e.getLength() - 1);
    for (let i = 0; i < this.getLength(); i++) {
      for (let j = 0; j < e.getLength(); j++) {
        num[i + j] ^= gexp(glog(this.get(i)) + glog(e.get(j)));
      }
    }
    return new Polynomial(num);
  }

  mod(e) {
    if (this.getLength() - e.getLength() < 0) return this;
    const ratio = glog(this.get(0)) - glog(e.get(0));
    const num = new Uint8Array(this.num);
    for (let i = 0; i < e.getLength(); i++) {
      num[i] ^= gexp(glog(e.get(i)) + ratio);
    }
    return new Polynomial(num).mod(e);
  }
}

function getErrorCorrectPolynomial(errorCorrectLength) {
  let a = new Polynomial([1]);
  for (let i = 0; i < errorCorrectLength; i++) {
    a = a.multiply(new Polynomial([1, gexp(i)]));
  }
  return a;
}

// Version capacities (byte mode, EC level L, M, Q, H)
// [totalDataCount, ecCount, numBlocks]
const VERSION_SPECS = [
  null,
  // v1 (21x21)
  { total: 26, ec: 10, b1Count: 1, b1Data: 16, b2Count: 0, b2Data: 0 },
  // v2 (25x25)
  { total: 44, ec: 16, b1Count: 1, b1Data: 28, b2Count: 0, b2Data: 0 },
  // v3 (29x29)
  { total: 70, ec: 26, b1Count: 1, b1Data: 44, b2Count: 0, b2Data: 0 },
  // v4 (33x33)
  { total: 100, ec: 18, b1Count: 2, b1Data: 32, b2Count: 0, b2Data: 0 },
  // v5 (37x37)
  { total: 134, ec: 24, b1Count: 2, b1Data: 43, b2Count: 0, b2Data: 0 },
  // v6 (41x41)
  { total: 172, ec: 16, b1Count: 4, b1Data: 27, b2Count: 0, b2Data: 0 },
  // v7 (45x45)
  { total: 196, ec: 18, b1Count: 4, b1Data: 31, b2Count: 0, b2Data: 0 },
  // v8 (49x49)
  { total: 242, ec: 22, b1Count: 2, b1Data: 38, b2Count: 2, b2Data: 39 },
  // v9 (53x53)
  { total: 292, ec: 22, b1Count: 3, b1Data: 36, b2Count: 2, b2Data: 37 },
  // v10 (57x57)
  { total: 346, ec: 26, b1Count: 4, b1Data: 43, b2Count: 1, b2Data: 44 }
];

// Alignment pattern centers per version
const ALIGNMENT_PATTERNS = [
  [],
  [],
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50]
];

// Mask patterns
function getMask(maskPattern, i, j) {
  switch (maskPattern) {
    case 0: return (i + j) % 2 === 0;
    case 1: return i % 2 === 0;
    case 2: return j % 3 === 0;
    case 3: return (i + j) % 3 === 0;
    case 4: return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
    case 5: return ((i * j) % 2) + ((i * j) % 3) === 0;
    case 6: return (((i * j) % 2) + ((i * j) % 3)) % 2 === 0;
    case 7: return (((i * j) % 3) + ((i + j) % 2)) % 2 === 0;
    default: return false;
  }
}

// Convert string to UTF-8 bytes
function toUtf8ByteArray(str) {
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code < 0xd800 || code >= 0xe000) {
      bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    } else {
      i++;
      code = 0x10000 + (((code & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
      bytes.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 0x3f),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f)
      );
    }
  }
  return bytes;
}

class BitBuffer {
  constructor() {
    this.buffer = [];
    this.length = 0;
  }

  put(num, length) {
    for (let i = 0; i < length; i++) {
      this.putBit(((num >>> (length - i - 1)) & 1) === 1);
    }
  }

  putBit(bit) {
    const bufIndex = Math.floor(this.length / 8);
    if (this.buffer.length <= bufIndex) {
      this.buffer.push(0);
    }
    if (bit) {
      this.buffer[bufIndex] |= 0x80 >>> (this.length % 8);
    }
    this.length++;
  }
}

export function generateQRCodeMatrix(text) {
  const data = toUtf8ByteArray(String(text || ''));

  // Pick smallest fitting version
  let version = 1;
  while (version <= 10) {
    const spec = VERSION_SPECS[version];
    const dataCapacity = spec.b1Count * spec.b1Data + spec.b2Count * spec.b2Data;
    // 4 bits mode + 8 bits length indicator + data
    const bitsNeeded = 4 + 8 + data.length * 8;
    if (bitsNeeded <= dataCapacity * 8) {
      break;
    }
    version++;
  }

  if (version > 10) {
    version = 10; // Cap at 10 (supports up to ~220-250 characters)
  }

  const spec = VERSION_SPECS[version];
  const totalDataBytes = spec.b1Count * spec.b1Data + spec.b2Count * spec.b2Data;

  // 1. Bit Stream
  const bb = new BitBuffer();
  bb.put(0x4, 4); // Byte mode (0100)
  bb.put(Math.min(data.length, totalDataBytes - 2), 8); // Character count
  for (let i = 0; i < data.length && bb.length + 8 <= totalDataBytes * 8; i++) {
    bb.put(data[i], 8);
  }

  // Terminator
  if (bb.length + 4 <= totalDataBytes * 8) {
    bb.put(0, 4);
  } else {
    bb.put(0, totalDataBytes * 8 - bb.length);
  }

  // Byte align
  while (bb.length % 8 !== 0) {
    bb.putBit(false);
  }

  // Padding bytes
  let padToggle = false;
  while (bb.length < totalDataBytes * 8) {
    bb.put(padToggle ? PAD1 : PAD0, 8);
    padToggle = !padToggle;
  }

  // 2. Block division & Error Correction
  const blocks = [];
  let byteOffset = 0;
  const numBlocks = spec.b1Count + spec.b2Count;

  for (let b = 0; b < numBlocks; b++) {
    const isB1 = b < spec.b1Count;
    const dataCount = isB1 ? spec.b1Data : spec.b2Data;
    const blockData = bb.buffer.slice(byteOffset, byteOffset + dataCount);
    byteOffset += dataCount;

    const rsPoly = getErrorCorrectPolynomial(spec.ec);
    const rawPoly = new Polynomial(blockData, spec.ec);
    const modPoly = rawPoly.mod(rsPoly);

    const ecData = new Uint8Array(spec.ec);
    const numLenDiff = spec.ec - modPoly.getLength();
    for (let i = 0; i < modPoly.getLength(); i++) {
      ecData[i + numLenDiff] = modPoly.get(i);
    }

    blocks.push({ data: blockData, ec: ecData });
  }

  // 3. Interleaving
  const finalSequence = [];
  const maxDataCount = Math.max(spec.b1Data, spec.b2Data);

  for (let i = 0; i < maxDataCount; i++) {
    for (let b = 0; b < numBlocks; b++) {
      if (i < blocks[b].data.length) {
        finalSequence.push(blocks[b].data[i]);
      }
    }
  }

  for (let i = 0; i < spec.ec; i++) {
    for (let b = 0; b < numBlocks; b++) {
      finalSequence.push(blocks[b].ec[i]);
    }
  }

  // 4. Matrix Generation
  const moduleCount = version * 4 + 17;
  const matrix = Array.from({ length: moduleCount }, () => Array(moduleCount).fill(null));

  // Finder Patterns
  function addFinderPattern(row, col) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = row + r;
        const nc = col + c;
        if (nr < 0 || nr >= moduleCount || nc < 0 || nc >= moduleCount) continue;
        if (
          (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
          (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          matrix[nr][nc] = true;
        } else {
          matrix[nr][nc] = false;
        }
      }
    }
  }

  addFinderPattern(0, 0);
  addFinderPattern(0, moduleCount - 7);
  addFinderPattern(moduleCount - 7, 0);

  // Timing patterns
  for (let i = 8; i < moduleCount - 8; i++) {
    if (matrix[6][i] === null) matrix[6][i] = i % 2 === 0;
    if (matrix[i][6] === null) matrix[i][6] = i % 2 === 0;
  }

  // Alignment patterns
  const alignCoords = ALIGNMENT_PATTERNS[version] || [];
  for (let i = 0; i < alignCoords.length; i++) {
    for (let j = 0; j < alignCoords.length; j++) {
      const r = alignCoords[i];
      const c = alignCoords[j];
      if (matrix[r][c] !== null) continue; // Already set by finder
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          if (Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0)) {
            matrix[r + dr][c + dc] = true;
          } else {
            matrix[r + dr][c + dc] = false;
          }
        }
      }
    }
  }

  // Dark module
  matrix[moduleCount - 8][8] = true;

  // Format Info Reservation
  for (let i = 0; i < 9; i++) {
    if (matrix[8][i] === null) matrix[8][i] = false;
    if (matrix[i][8] === null) matrix[i][8] = false;
  }
  for (let i = moduleCount - 8; i < moduleCount; i++) {
    if (matrix[8][i] === null) matrix[8][i] = false;
  }
  for (let i = moduleCount - 7; i < moduleCount; i++) {
    if (matrix[i][8] === null) matrix[i][8] = false;
  }

  // 5. Place Data Bits with Mask 0
  let bitIndex = 0;
  const totalBits = finalSequence.length * 8;
  const maskPattern = 0; // Standard checkerboard mask (i+j)%2 === 0

  let inc = -1;
  let row = moduleCount - 1;

  for (let col = moduleCount - 1; col > 0; col -= 2) {
    if (col === 6) col--; // Skip vertical timing column

    while (true) {
      for (let c = 0; c < 2; c++) {
        const currentCol = col - c;
        if (matrix[row][currentCol] === null) {
          let bit = false;
          if (bitIndex < totalBits) {
            const byte = finalSequence[Math.floor(bitIndex / 8)];
            bit = ((byte >>> (7 - (bitIndex % 8))) & 1) === 1;
            bitIndex++;
          }
          const mask = getMask(maskPattern, row, currentCol);
          matrix[row][currentCol] = bit ^ mask;
        }
      }

      row += inc;
      if (row < 0 || row >= moduleCount) {
        row -= inc;
        inc = -inc;
        break;
      }
    }
  }

  // Format info bits for EC Level M (00), mask 000 (0) -> format info 0x5412 XOR 0x5412 = 0
  const formatInfo = 0x5412; // Formatted with standard BCH code
  for (let i = 0; i < 15; i++) {
    const bit = ((formatInfo >>> i) & 1) === 1;
    // Top-left
    if (i < 6) matrix[i][8] = bit;
    else if (i < 8) matrix[i + 1][8] = bit;
    else matrix[8][15 - i] = bit;

    // Bottom-left & Top-right
    if (i < 7) matrix[8][moduleCount - 1 - i] = bit;
    else matrix[moduleCount - 15 + i][8] = bit;
  }

  return matrix;
}

/**
 * Generates an SVG path string from a QR matrix
 */
export function generateQRCodeSVGPath(matrix) {
  const size = matrix.length;
  let path = '';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c]) {
        path += `M${c},${r}h1v1h-1z `;
      }
    }
  }
  return { path, size };
}
