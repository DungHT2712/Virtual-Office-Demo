/**
 * FurnitureTextures.ts
 * Tạo các texture nội thất Pixel Art sắc nét, chuẩn thẩm mỹ cho Virtual Office:
 * 1. Bàn (Table): Mặt bàn gỗ vân đẹp + 4 chân bàn rõ ràng.
 * 2. Máy tính (Computer): 1 màn hình đơn hiện đại, bàn phím, chuột.
 * 3. Bình hoa (Vase): Bình gốm + cành lá + bông hoa nở rực rỡ.
 * 4. Thảm (Rug): Thảm dệt tua rua viền vàng + màu sắc tùy chọn linh hoạt.
 */

export const RUG_COLORS = [
  { name: 'Đỏ Ruby', hex: '#dc2626' },
  { name: 'Xanh Navy', hex: '#2563eb' },
  { name: 'Xanh Rêu', hex: '#059669' },
  { name: 'Vàng Cát', hex: '#d97706' },
  { name: 'Tím Quý Phái', hex: '#7c3aed' },
  { name: 'Xám Hiện Đại', hex: '#475569' },
  { name: 'Hồng San Hô', hex: '#e11d48' },
  { name: 'Đen Sang Trọng', hex: '#18181b' },
]

export const GRASS_COLORS = [
  { name: 'Xanh Tươi', hex: '#16a34a' },
  { name: 'Vàng Lá Thu', hex: '#d97706' },
]

export function isAutumnGrass(colorHexOrType: string = '', tint?: number): boolean {
  const str = (colorHexOrType || '').toLowerCase()
  if (
    str.includes('#d97706') ||
    str.includes('d97706') ||
    str.includes('autumn') ||
    str.includes('vang')
  ) {
    return true
  }
  if (tint === 0xd97706 || tint === 0xca8a04 || tint === 0xb45309) return true
  return false
}

export function adjustColor(hex: string, percent: number): string {
  let clean = (hex || '#2563eb').replace('#', '').trim()
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('')
  }
  let num = parseInt(clean, 16)
  if (isNaN(num)) num = 0x2563eb
  let r = (num >> 16) + Math.round(255 * (percent / 100))
  let g = ((num >> 8) & 0x00ff) + Math.round(255 * (percent / 100))
  let b = (num & 0x0000ff) + Math.round(255 * (percent / 100))
  r = Math.min(255, Math.max(0, r))
  g = Math.min(255, Math.max(0, g))
  b = Math.min(255, Math.max(0, b))
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

export function getFlowerTypeFromItem(
  itemType: string = '',
  itemId: string = ''
): 'dao' | 'mai' | 'lan' {
  if (itemType.includes(':dao')) return 'dao'
  if (itemType.includes(':mai')) return 'mai'
  if (itemType.includes(':lan')) return 'lan'
  const seed = (itemId || itemType || 'vase')
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const types: ('dao' | 'mai' | 'lan')[] = ['dao', 'mai', 'lan']
  return types[seed % 3]
}

export function getRugTextureKey(colorHex: string = '#2563eb'): string {
  const cleanHex = colorHex.replace('#', '').toLowerCase()
  return `rug_${cleanHex}`
}

export function createTableCanvas(direction: number = 0): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const ctx = canvas.getContext('2d')!

  const dir = ((direction % 4) + 4) % 4

  if (dir === 0) {
    // ===== HƯỚNG 0: MẶT TRƯỚC (Down / Front View) =====
    // Đổ bóng sàn dưới chân bàn
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
    ctx.beginPath()
    ctx.ellipse(16, 29, 13, 3, 0, 0, Math.PI * 2)
    ctx.fill()

    // Chân sau
    ctx.fillStyle = '#5c2b09'
    ctx.fillRect(5, 14, 3, 11)
    ctx.fillRect(24, 14, 3, 11)

    // Chân trước
    ctx.fillStyle = '#853e0d'
    ctx.fillRect(3, 16, 4, 13)
    ctx.fillRect(25, 16, 4, 13)

    // Viền sáng chân bàn
    ctx.fillStyle = '#a14d13'
    ctx.fillRect(3, 16, 1, 13)
    ctx.fillRect(25, 16, 1, 13)

    // Đệm đế chân bàn
    ctx.fillStyle = '#334155'
    ctx.fillRect(3, 28, 4, 1)
    ctx.fillRect(25, 28, 4, 1)

    // Thanh xà ngang đỡ mặt bàn
    ctx.fillStyle = '#78350f'
    ctx.fillRect(5, 15, 22, 3)

    // Gờ cạnh trước mặt bàn (3D bevel)
    ctx.fillStyle = '#6b300a'
    ctx.fillRect(1, 13, 30, 4)

    // Mặt bàn gỗ chính
    ctx.fillStyle = '#b45309'
    ctx.fillRect(1, 4, 30, 10)

    // Bề mặt phản quang ấm áp
    ctx.fillStyle = '#d97706'
    ctx.fillRect(2, 5, 28, 8)

    // Cạnh trên phản sáng (Sunlight highlight)
    ctx.fillStyle = '#fde68a'
    ctx.fillRect(1, 4, 30, 1)
    ctx.fillRect(1, 5, 1, 9)

    // Vân gỗ ngang
    ctx.fillStyle = '#92400e'
    ctx.fillRect(4, 7, 10, 1)
    ctx.fillRect(17, 9, 11, 1)
    ctx.fillRect(6, 11, 16, 1)
  } else if (dir === 1) {
    // ===== HƯỚNG 1: MẶT TRÁI (Left View / Desk faces Left) =====
    // Đổ bóng sàn
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
    ctx.beginPath()
    ctx.ellipse(16, 29, 10, 3, 0, 0, Math.PI * 2)
    ctx.fill()

    // Chân sau (bên phải góc nhìn)
    ctx.fillStyle = '#5c2b09'
    ctx.fillRect(20, 15, 4, 13)
    ctx.fillStyle = '#334155'
    ctx.fillRect(20, 27, 4, 1)

    // Chân trước (bên trái góc nhìn)
    ctx.fillStyle = '#853e0d'
    ctx.fillRect(7, 16, 4, 13)
    ctx.fillStyle = '#a14d13'
    ctx.fillRect(7, 16, 1, 13)
    ctx.fillStyle = '#334155'
    ctx.fillRect(7, 28, 4, 1)

    // Thanh xà ngang nối 2 chân bên hông
    ctx.fillStyle = '#78350f'
    ctx.fillRect(9, 18, 13, 3)

    // Cạnh gờ bàn phía trước (hướng sang trái)
    ctx.fillStyle = '#6b300a'
    ctx.fillRect(6, 4, 4, 14)

    // Mặt bàn gỗ nhìn nghiêng
    ctx.fillStyle = '#b45309'
    ctx.fillRect(9, 4, 16, 13)

    // Bề mặt gỗ phản quang
    ctx.fillStyle = '#d97706'
    ctx.fillRect(10, 5, 14, 11)

    // Highlight cạnh viền
    ctx.fillStyle = '#fde68a'
    ctx.fillRect(6, 4, 19, 1)
    ctx.fillRect(6, 4, 1, 14)

    // Vân gỗ dọc
    ctx.fillStyle = '#92400e'
    ctx.fillRect(13, 6, 1, 9)
    ctx.fillRect(18, 7, 1, 8)
  } else if (dir === 2) {
    // ===== HƯỚNG 2: MẶT SAU (Up / Back View) =====
    // Đổ bóng sàn
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
    ctx.beginPath()
    ctx.ellipse(16, 29, 13, 3, 0, 0, Math.PI * 2)
    ctx.fill()

    // Chân trước (nằm phía xa/khuất)
    ctx.fillStyle = '#5c2b09'
    ctx.fillRect(5, 6, 3, 10)
    ctx.fillRect(24, 6, 3, 10)

    // Tấm ván gỗ che sau lưng bàn (Modesty Panel đặc trưng mặt sau bàn)
    ctx.fillStyle = '#78350f'
    ctx.fillRect(3, 13, 26, 10)
    ctx.fillStyle = '#6b300a'
    ctx.fillRect(3, 13, 26, 2)
    ctx.fillStyle = '#5c2b09'
    ctx.fillRect(6, 16, 1, 6)
    ctx.fillRect(16, 16, 1, 6)
    ctx.fillRect(25, 16, 1, 6)

    // Chân sau (gần camera hơn)
    ctx.fillStyle = '#853e0d'
    ctx.fillRect(3, 16, 4, 13)
    ctx.fillRect(25, 16, 4, 13)
    ctx.fillStyle = '#a14d13'
    ctx.fillRect(3, 16, 1, 13)
    ctx.fillRect(25, 16, 1, 13)
    ctx.fillStyle = '#334155'
    ctx.fillRect(3, 28, 4, 1)
    ctx.fillRect(25, 28, 4, 1)

    // Mặt bàn gỗ nhìn từ phía sau
    ctx.fillStyle = '#b45309'
    ctx.fillRect(1, 4, 30, 10)
    ctx.fillStyle = '#d97706'
    ctx.fillRect(2, 5, 28, 8)
    ctx.fillStyle = '#fde68a'
    ctx.fillRect(1, 4, 30, 1)

    // Vân gỗ
    ctx.fillStyle = '#92400e'
    ctx.fillRect(4, 7, 10, 1)
    ctx.fillRect(17, 9, 11, 1)
  } else {
    // ===== HƯỚNG 3: MẶT PHẢI (Right View / Desk faces Right) =====
    // Đổ bóng sàn
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
    ctx.beginPath()
    ctx.ellipse(16, 29, 10, 3, 0, 0, Math.PI * 2)
    ctx.fill()

    // Chân sau (bên trái góc nhìn)
    ctx.fillStyle = '#5c2b09'
    ctx.fillRect(8, 15, 4, 13)
    ctx.fillStyle = '#334155'
    ctx.fillRect(8, 27, 4, 1)

    // Chân trước (bên phải góc nhìn)
    ctx.fillStyle = '#853e0d'
    ctx.fillRect(21, 16, 4, 13)
    ctx.fillStyle = '#a14d13'
    ctx.fillRect(21, 16, 1, 13)
    ctx.fillStyle = '#334155'
    ctx.fillRect(21, 28, 4, 1)

    // Thanh xà ngang nối 2 chân bên hông
    ctx.fillStyle = '#78350f'
    ctx.fillRect(10, 18, 13, 3)

    // Cạnh gờ bàn phía trước (hướng sang phải)
    ctx.fillStyle = '#6b300a'
    ctx.fillRect(22, 4, 4, 14)

    // Mặt bàn gỗ nhìn nghiêng
    ctx.fillStyle = '#b45309'
    ctx.fillRect(7, 4, 16, 13)

    // Bề mặt gỗ phản quang
    ctx.fillStyle = '#d97706'
    ctx.fillRect(8, 5, 14, 11)

    // Highlight cạnh viền
    ctx.fillStyle = '#fde68a'
    ctx.fillRect(7, 4, 19, 1)
    ctx.fillRect(25, 4, 1, 14)

    // Vân gỗ dọc
    ctx.fillStyle = '#92400e'
    ctx.fillRect(12, 6, 1, 9)
    ctx.fillRect(17, 7, 1, 8)
  }

  return canvas
}

export function createComputerCanvas(direction: number = 0): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const ctx = canvas.getContext('2d')!

  const dir = ((direction % 4) + 4) % 4

  if (dir === 0) {
    // ===== HƯỚNG 0: MẶT TRƯỚC (Down / Front View) =====
    // Màn hình hướng về phía người dùng, bàn phím chuột ở trước
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)'
    ctx.fillRect(7, 10, 18, 1)

    // Khung viền 1 màn hình mỏng gọn (y: 3 đến 10, cao 8px)
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(7, 3, 18, 8)
    ctx.fillStyle = '#334155'
    ctx.fillRect(7, 3, 18, 1)

    // Màn hình phát sáng hiển thị code
    ctx.fillStyle = '#0284c7'
    ctx.fillRect(8, 4, 16, 6)
    ctx.fillStyle = '#0369a1'
    ctx.fillRect(8, 4, 16, 1)
    ctx.fillStyle = '#ef4444'
    ctx.fillRect(9, 4, 1, 1)
    ctx.fillStyle = '#eab308'
    ctx.fillRect(10, 4, 1, 1)
    ctx.fillStyle = '#22c55e'
    ctx.fillRect(11, 4, 1, 1)

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(9, 6, 6, 1)
    ctx.fillStyle = '#38bdf8'
    ctx.fillRect(9, 7, 10, 1)
    ctx.fillStyle = '#fef08a'
    ctx.fillRect(11, 8, 8, 1)

    // Vệt phản chiếu ánh sáng kính màn hình
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.beginPath()
    ctx.moveTo(22, 4)
    ctx.lineTo(19, 4)
    ctx.lineTo(14, 9)
    ctx.lineTo(17, 9)
    ctx.closePath()
    ctx.fill()

    // Đệm đáy màn hình tiếp xúc mặt bàn
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(8, 10, 16, 1)

    // Bàn phím & Chuột trên mặt bàn (y: 11-12)
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(10, 11, 10, 2)
    ctx.fillStyle = '#cbd5e1'
    ctx.fillRect(11, 11, 8, 1)
    ctx.fillStyle = '#64748b'
    ctx.fillRect(13, 12, 4, 1)

    ctx.fillStyle = '#e2e8f0'
    ctx.fillRect(22, 11, 2, 2)
    ctx.fillStyle = '#94a3b8'
    ctx.fillRect(22, 11, 2, 1)
  } else if (dir === 1) {
    // ===== HƯỚNG 1: MẶT TRÁI (Left View / Monitor faces Left) =====
    // Màn hình nhìn nghiêng hướng sang trái (người dùng ngồi bên trái nhìn sang)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
    ctx.fillRect(17, 13, 4, 1)

    // Mép màn hình phát sáng quay sang trái
    ctx.fillStyle = '#38bdf8'
    ctx.fillRect(17, 5, 1, 8)
    ctx.fillStyle = '#7dd3fc'
    ctx.fillRect(17, 6, 1, 3)

    // Thân vỏ màn hình nhìn nghiêng
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(18, 4, 2, 10)
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(20, 5, 1, 8)

    // Đệm đế tiếp xúc mặt bàn
    ctx.fillStyle = '#334155'
    ctx.fillRect(17, 13, 4, 1)

    // Bàn phím ở phía trước bên trái (x: 11-14, y: 6-11)
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(12, 6, 3, 7)
    ctx.fillStyle = '#cbd5e1'
    ctx.fillRect(12, 7, 2, 5)

    // Chuột bên cạnh bàn phím (x: 13-14, y: 14)
    ctx.fillStyle = '#e2e8f0'
    ctx.fillRect(13, 14, 2, 2)
  } else if (dir === 2) {
    // ===== HƯỚNG 2: MẶT SAU (Up / Back View) =====
    // Người dùng nhìn thấy mặt lưng vỏ kim loại của màn hình
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
    ctx.fillRect(7, 12, 18, 1)

    // Vỏ lưng màn hình kim loại tối màu
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(7, 4, 18, 8)
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(8, 5, 16, 6)

    // Đường viền phản sáng trên đỉnh
    ctx.fillStyle = '#475569'
    ctx.fillRect(7, 4, 18, 1)

    // Logo công nghệ / Khe tản nhiệt thanh lịch ở lưng máy
    ctx.fillStyle = '#38bdf8'
    ctx.fillRect(15, 7, 2, 2)
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(11, 10, 10, 1)

    // Đệm đế đáy tiếp xúc mặt bàn
    ctx.fillStyle = '#334155'
    ctx.fillRect(8, 12, 16, 1)

    // Bàn phím lấp ló ở phía trước (hướng lên trên)
    ctx.fillStyle = '#334155'
    ctx.fillRect(10, 2, 10, 1)
  } else {
    // ===== HƯỚNG 3: MẶT PHẢI (Right View / Monitor faces Right) =====
    // Màn hình nhìn nghiêng hướng sang phải (người dùng ngồi bên phải nhìn sang)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
    ctx.fillRect(11, 13, 4, 1)

    // Mép màn hình phát sáng quay sang phải
    ctx.fillStyle = '#38bdf8'
    ctx.fillRect(14, 5, 1, 8)
    ctx.fillStyle = '#7dd3fc'
    ctx.fillRect(14, 6, 1, 3)

    // Thân vỏ màn hình nhìn nghiêng
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(12, 4, 2, 10)
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(11, 5, 1, 8)

    // Đệm đế tiếp xúc mặt bàn
    ctx.fillStyle = '#334155'
    ctx.fillRect(11, 13, 4, 1)

    // Bàn phím ở phía trước bên phải (x: 17-19, y: 6-11)
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(17, 6, 3, 7)
    ctx.fillStyle = '#cbd5e1'
    ctx.fillRect(18, 7, 2, 5)

    // Chuột bên cạnh bàn phím (x: 17-18, y: 14)
    ctx.fillStyle = '#e2e8f0'
    ctx.fillRect(17, 14, 2, 2)
  }

  return canvas
}

export function createVaseCanvas(
  direction: number = 0,
  vaseColor: string = '#2563eb',
  flowerType: 'dao' | 'mai' | 'lan' = 'dao'
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const ctx = canvas.getContext('2d')!

  const dir = ((direction % 4) + 4) % 4

  // Bóng dưới đáy bình hoa
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
  ctx.beginPath()
  ctx.ellipse(16, 29, 7, 2, 0, 0, Math.PI * 2)
  ctx.fill()

  // --- BÌNH GỐM CAO CẤP (Đổi màu theo vaseColor, cành & hoa không bị ảnh hưởng) ---
  const vaseDeep = adjustColor(vaseColor, -40)
  const vaseDark = adjustColor(vaseColor, -25)
  const vaseMidDark = adjustColor(vaseColor, -15)
  const vaseMidLight = adjustColor(vaseColor, 15)
  const vaseLight = adjustColor(vaseColor, 35)

  // Đế bình
  ctx.fillStyle = vaseDeep
  ctx.fillRect(12, 27, 8, 2)

  // Thân bình tròn
  ctx.fillStyle = vaseColor
  ctx.beginPath()
  ctx.ellipse(16, 22, 7, 6, 0, 0, Math.PI * 2)
  ctx.fill()

  // Đổ bóng góc cong của bình
  ctx.fillStyle = vaseDark
  ctx.beginPath()
  ctx.arc(16, 22, 7, 0.2 * Math.PI, 0.8 * Math.PI, false)
  ctx.fill()

  // Điểm sáng tráng men gốm chuyển dịch theo góc nhìn
  ctx.fillStyle = vaseLight
  if (dir === 0) {
    ctx.fillRect(12, 19, 2, 4)
  } else if (dir === 1) {
    ctx.fillRect(10, 19, 2, 4)
  } else if (dir === 2) {
    ctx.fillRect(15, 18, 2, 2)
  } else {
    ctx.fillRect(20, 19, 2, 4)
  }

  // Cổ bình
  ctx.fillStyle = vaseMidDark
  ctx.fillRect(13, 15, 6, 3)

  // Miệng bình loe
  ctx.fillStyle = vaseMidLight
  ctx.fillRect(12, 14, 8, 2)

  // --- CÀNH & LÁ CÂY TƯƠI SẮC NÉT (Cành luôn giữ màu xanh tự nhiên) ---
  const stemDark = '#15803d'
  const stemMid = '#16a34a'
  const leafGreen = '#22c55e'
  const leafLight = '#4ade80'
  const calyx = '#14532d'

  // --- BẢNG MÀU 3 LOẠI HOA: HOA ĐÀO, HOA MAI, HOA LAN ---
  const flowerPalettes = {
    dao: {
      // Hoa đào hồng phấn thanh tao
      main: '#fb7185',
      deep: '#e11d48',
      light: '#ffe4e6',
      center: '#facc15',
      secMain: '#f43f5e',
      secDeep: '#be123c',
      secLight: '#fff1f2',
      secCenter: '#fef08a',
    },
    mai: {
      // Hoa mai vàng óng rực rỡ, nhụy đỏ cam
      main: '#facc15',
      deep: '#d97706',
      light: '#fef08a',
      center: '#dc2626',
      secMain: '#eab308',
      secDeep: '#b45309',
      secLight: '#fffbeb',
      secCenter: '#ea580c',
    },
    lan: {
      // Hoa lan tím quý phái, cánh môi trắng tuyết & nhụy vàng
      main: '#c084fc',
      deep: '#9333ea',
      light: '#f5d0fe',
      center: '#fde047',
      secMain: '#a855f7',
      secDeep: '#7e22ce',
      secLight: '#fae8ff',
      secCenter: '#ffffff',
    },
  }

  const fCol = flowerPalettes[flowerType] || flowerPalettes.dao

  if (dir === 0) {
    // ===== HƯỚNG 0: MẶT TRƯỚC (Down / Front View) =====
    // Cành và lá tươi màu xanh
    ctx.fillStyle = stemDark
    ctx.fillRect(15, 10, 2, 5) // cành giữa
    ctx.fillRect(13, 11, 1, 4) // cành trái
    ctx.fillRect(18, 11, 1, 4) // cành phải

    ctx.fillStyle = leafGreen
    ctx.fillRect(9, 13, 4, 3) // lá trái
    ctx.fillRect(19, 13, 4, 3) // lá phải
    ctx.fillStyle = leafLight
    ctx.fillRect(10, 12, 2, 2)
    ctx.fillRect(20, 12, 2, 2)

    // 1. Hoa chính ở đỉnh
    ctx.fillStyle = fCol.main
    ctx.fillRect(14, 5, 4, 5)
    ctx.fillRect(13, 6, 6, 3)
    ctx.fillStyle = fCol.light
    ctx.fillRect(15, 5, 2, 2)
    ctx.fillStyle = fCol.center // nhụy hoa
    ctx.fillRect(15, 7, 2, 1)

    // 2. Hoa bên trái
    ctx.fillStyle = fCol.secMain
    ctx.fillRect(8, 8, 4, 4)
    ctx.fillStyle = fCol.secLight
    ctx.fillRect(9, 9, 2, 2)
    ctx.fillStyle = fCol.secCenter
    ctx.fillRect(9, 9, 1, 1)

    // 3. Hoa bên phải
    ctx.fillStyle = fCol.main
    ctx.fillRect(20, 7, 4, 4)
    ctx.fillStyle = fCol.light
    ctx.fillRect(21, 8, 2, 2)
    ctx.fillStyle = fCol.center
    ctx.fillRect(21, 8, 1, 1)
  } else if (dir === 1) {
    // ===== HƯỚNG 1: MẶT TRÁI (Left View) =====
    ctx.fillStyle = stemDark
    ctx.fillRect(13, 10, 2, 5)
    ctx.fillRect(11, 11, 2, 4)
    ctx.fillRect(17, 12, 1, 3)

    ctx.fillStyle = leafGreen
    ctx.fillRect(7, 12, 5, 3)
    ctx.fillRect(18, 14, 3, 2)
    ctx.fillStyle = leafLight
    ctx.fillRect(8, 11, 2, 2)

    // Hoa nở rực rỡ ở phía trước bên trái
    ctx.fillStyle = fCol.secMain
    ctx.fillRect(6, 7, 6, 5)
    ctx.fillRect(7, 6, 4, 7)
    ctx.fillStyle = fCol.secLight
    ctx.fillRect(8, 8, 2, 2)
    ctx.fillStyle = fCol.secCenter
    ctx.fillRect(8, 8, 1, 1)

    // Hoa nghiêng trái
    ctx.fillStyle = fCol.main
    ctx.fillRect(12, 4, 4, 5)
    ctx.fillStyle = fCol.light
    ctx.fillRect(13, 4, 2, 2)
    ctx.fillStyle = fCol.center
    ctx.fillRect(13, 6, 1, 1)

    // Hoa khuất sau bên phải
    ctx.fillStyle = fCol.deep
    ctx.fillRect(18, 9, 3, 3)
    ctx.fillStyle = fCol.secMain
    ctx.fillRect(18, 9, 2, 2)
  } else if (dir === 2) {
    // ===== HƯỚNG 2: MẶT SAU (Up / Back View) =====
    ctx.fillStyle = stemDark
    ctx.fillRect(15, 10, 2, 5)
    ctx.fillRect(11, 12, 3, 3)
    ctx.fillRect(18, 12, 3, 3)

    ctx.fillStyle = stemMid
    ctx.fillRect(7, 11, 6, 4)
    ctx.fillRect(19, 11, 6, 4)
    ctx.fillStyle = leafGreen
    ctx.fillRect(8, 12, 4, 2)
    ctx.fillRect(20, 12, 4, 2)

    // Đài hoa màu xanh đậm
    ctx.fillStyle = calyx
    ctx.fillRect(9, 10, 3, 2)
    ctx.fillRect(20, 10, 3, 2)
    ctx.fillRect(15, 8, 2, 2)

    // Hoa nhìn từ sau
    ctx.fillStyle = fCol.deep
    ctx.fillRect(13, 5, 6, 4)
    ctx.fillStyle = fCol.main
    ctx.fillRect(14, 6, 4, 3)

    // Cánh hoa lấp ló phía sau
    ctx.fillStyle = fCol.secDeep
    ctx.fillRect(7, 8, 4, 3)
    ctx.fillRect(21, 8, 4, 3)
  } else {
    // ===== HƯỚNG 3: MẶT PHẢI (Right View) =====
    ctx.fillStyle = stemDark
    ctx.fillRect(17, 10, 2, 5)
    ctx.fillRect(19, 11, 2, 4)
    ctx.fillRect(14, 12, 1, 3)

    ctx.fillStyle = leafGreen
    ctx.fillRect(20, 12, 5, 3)
    ctx.fillRect(11, 14, 3, 2)
    ctx.fillStyle = leafLight
    ctx.fillRect(22, 11, 2, 2)

    // Hoa to nở rực rỡ ở phía trước bên phải
    ctx.fillStyle = fCol.main
    ctx.fillRect(20, 7, 6, 5)
    ctx.fillRect(21, 6, 4, 7)
    ctx.fillStyle = fCol.light
    ctx.fillRect(22, 8, 2, 2)
    ctx.fillStyle = fCol.center
    ctx.fillRect(22, 8, 1, 1)

    // Hoa nghiêng phải
    ctx.fillStyle = fCol.secMain
    ctx.fillRect(16, 4, 4, 5)
    ctx.fillStyle = fCol.secLight
    ctx.fillRect(17, 4, 2, 2)
    ctx.fillStyle = fCol.secCenter
    ctx.fillRect(18, 6, 1, 1)

    // Hoa khuất sau bên trái
    ctx.fillStyle = fCol.deep
    ctx.fillRect(11, 9, 3, 3)
    ctx.fillStyle = fCol.main
    ctx.fillRect(12, 9, 2, 2)
  }

  return canvas
}

export function createWhiteboardCanvas(direction: number = 0): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')!

  const dir = ((direction % 4) + 4) % 4

  if (dir === 0) {
    // ===== HƯỚNG 0: MẶT TRƯỚC (Down / Front View) =====
    // Bóng sàn dưới 2 chân
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)'
    ctx.beginPath()
    ctx.ellipse(16, 59, 10, 2.5, 0, 0, Math.PI * 2)
    ctx.ellipse(48, 59, 10, 2.5, 0, 0, Math.PI * 2)
    ctx.fill()

    // Bánh xe lăn (4 bánh)
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(9, 57, 4, 3)
    ctx.fillRect(19, 57, 4, 3)
    ctx.fillRect(41, 57, 4, 3)
    ctx.fillRect(51, 57, 4, 3)

    // Chân đế ngang bằng kim loại
    ctx.fillStyle = '#475569'
    ctx.fillRect(8, 55, 16, 3)
    ctx.fillRect(40, 55, 16, 3)
    ctx.fillStyle = '#64748b'
    ctx.fillRect(8, 55, 16, 1)
    ctx.fillRect(40, 55, 16, 1)

    // 2 Cột trụ đứng đỡ bảng
    ctx.fillStyle = '#334155'
    ctx.fillRect(14, 20, 4, 36)
    ctx.fillRect(46, 20, 4, 36)
    ctx.fillStyle = '#64748b'
    ctx.fillRect(14, 20, 1, 36)
    ctx.fillRect(46, 20, 1, 36)

    // Khung viền nhôm bảng
    ctx.fillStyle = '#94a3b8'
    ctx.fillRect(6, 10, 52, 38)
    ctx.fillStyle = '#64748b'
    ctx.fillRect(6, 10, 52, 1)
    ctx.fillRect(6, 47, 52, 1)
    ctx.fillRect(6, 10, 1, 38)
    ctx.fillRect(57, 10, 1, 38)

    // Bề mặt bảng trắng bóng
    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(8, 12, 48, 34)

    // Vệt sáng phản quang trên kính bảng
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)'
    ctx.beginPath()
    ctx.moveTo(40, 12)
    ctx.lineTo(52, 12)
    ctx.lineTo(34, 46)
    ctx.lineTo(22, 46)
    ctx.closePath()
    ctx.fill()

    // Sơ đồ ý tưởng (Mindmap diagram) trên bảng
    // Hộp 1: Xanh dương
    ctx.fillStyle = '#2563eb'
    ctx.fillRect(12, 16, 10, 6)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(14, 18, 6, 2)

    // Hộp 2: Xanh lá
    ctx.fillStyle = '#16a34a'
    ctx.fillRect(42, 16, 10, 6)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(44, 18, 6, 2)

    // Hộp 3: Cam ở giữa
    ctx.fillStyle = '#ea580c'
    ctx.fillRect(26, 28, 12, 7)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(28, 30, 8, 3)

    // Đường nối sơ đồ
    ctx.strokeStyle = '#0284c7'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(22, 19)
    ctx.lineTo(26, 31)
    ctx.moveTo(42, 19)
    ctx.lineTo(38, 31)
    ctx.stroke()

    // Dòng ghi chú nhỏ
    ctx.fillStyle = '#7c3aed'
    ctx.fillRect(12, 38, 10, 2)
    ctx.fillRect(12, 42, 14, 2)

    // Khay để bút ở đáy bảng
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(18, 47, 28, 3)
    ctx.fillStyle = '#475569'
    ctx.fillRect(18, 47, 28, 1)

    // Bút dạ màu & Miếng lau bảng
    ctx.fillStyle = '#ef4444' // bút đỏ
    ctx.fillRect(22, 46, 6, 1)
    ctx.fillStyle = '#0284c7' // bút xanh
    ctx.fillRect(30, 46, 6, 1)
    ctx.fillStyle = '#0f172a' // lau bảng
    ctx.fillRect(38, 45, 5, 2)
  } else if (dir === 1) {
    // ===== HƯỚNG 1: MẶT TRÁI (Left View) =====
    // Nhìn nghiêng sang trái
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)'
    ctx.beginPath()
    ctx.ellipse(32, 59, 12, 3, 0, 0, Math.PI * 2)
    ctx.fill()

    // Bánh xe bên hông (2 bánh)
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(22, 57, 4, 3)
    ctx.fillRect(38, 57, 4, 3)

    // Chân đế kim loại ngang bên hông
    ctx.fillStyle = '#475569'
    ctx.fillRect(21, 55, 22, 3)
    ctx.fillStyle = '#64748b'
    ctx.fillRect(21, 55, 22, 1)

    // Cột trụ đứng bên hông
    ctx.fillStyle = '#334155'
    ctx.fillRect(30, 20, 4, 36)
    ctx.fillStyle = '#64748b'
    ctx.fillRect(30, 20, 1, 36)

    // Khung bảng nhìn nghiêng góc quay sang trái
    ctx.fillStyle = '#94a3b8'
    ctx.fillRect(25, 10, 14, 38)
    ctx.fillStyle = '#64748b'
    ctx.fillRect(25, 10, 14, 1)
    ctx.fillRect(25, 47, 14, 1)

    // Mặt bảng trắng nhìn nghiêng (hướng trái)
    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(26, 12, 8, 34)

    // Vệt nội dung / sơ đồ nhìn nghiêng
    ctx.fillStyle = '#0284c7'
    ctx.fillRect(27, 18, 3, 4)
    ctx.fillStyle = '#ea580c'
    ctx.fillRect(27, 28, 4, 5)

    // Khay bút nhô ra ở cạnh trước bên trái
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(23, 47, 6, 2)
    ctx.fillStyle = '#ef4444'
    ctx.fillRect(24, 46, 3, 1)
  } else if (dir === 2) {
    // ===== HƯỚNG 2: MẶT SAU (Up / Back View) =====
    // Nhìn từ sau lưng bảng
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)'
    ctx.beginPath()
    ctx.ellipse(16, 59, 10, 2.5, 0, 0, Math.PI * 2)
    ctx.ellipse(48, 59, 10, 2.5, 0, 0, Math.PI * 2)
    ctx.fill()

    // Bánh xe lăn
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(9, 57, 4, 3)
    ctx.fillRect(19, 57, 4, 3)
    ctx.fillRect(41, 57, 4, 3)
    ctx.fillRect(51, 57, 4, 3)

    // Chân đế ngang
    ctx.fillStyle = '#475569'
    ctx.fillRect(8, 55, 16, 3)
    ctx.fillRect(40, 55, 16, 3)

    // Cột trụ đứng sau lưng bảng
    ctx.fillStyle = '#334155'
    ctx.fillRect(14, 20, 4, 36)
    ctx.fillRect(46, 20, 4, 36)

    // Khung nhôm viền ngoài
    ctx.fillStyle = '#64748b'
    ctx.fillRect(6, 10, 52, 38)

    // Tấm ván lưng kim loại từ tính màu xám bạc
    ctx.fillStyle = '#cbd5e1'
    ctx.fillRect(8, 12, 48, 34)

    // Thanh xà kim loại giằng chữ X gia cố chịu lực sau lưng bảng
    ctx.strokeStyle = '#64748b'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(8, 12)
    ctx.lineTo(56, 46)
    ctx.moveTo(56, 12)
    ctx.lineTo(8, 46)
    ctx.stroke()

    // Thanh ngang đỡ giữa lưng
    ctx.fillStyle = '#475569'
    ctx.fillRect(8, 28, 48, 2)

    // Đinh tán ốc vít 4 góc
    ctx.fillStyle = '#334155'
    ctx.fillRect(9, 13, 2, 2)
    ctx.fillRect(53, 13, 2, 2)
    ctx.fillRect(9, 43, 2, 2)
    ctx.fillRect(53, 43, 2, 2)
  } else {
    // ===== HƯỚNG 3: MẶT PHẢI (Right View) =====
    // Nhìn nghiêng sang phải
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)'
    ctx.beginPath()
    ctx.ellipse(32, 59, 12, 3, 0, 0, Math.PI * 2)
    ctx.fill()

    // Bánh xe bên hông (2 bánh)
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(22, 57, 4, 3)
    ctx.fillRect(38, 57, 4, 3)

    // Chân đế kim loại ngang bên hông
    ctx.fillStyle = '#475569'
    ctx.fillRect(21, 55, 22, 3)
    ctx.fillStyle = '#64748b'
    ctx.fillRect(21, 55, 22, 1)

    // Cột trụ đứng bên hông
    ctx.fillStyle = '#334155'
    ctx.fillRect(30, 20, 4, 36)
    ctx.fillStyle = '#64748b'
    ctx.fillRect(30, 20, 1, 36)

    // Khung bảng nhìn nghiêng góc quay sang phải
    ctx.fillStyle = '#94a3b8'
    ctx.fillRect(25, 10, 14, 38)
    ctx.fillStyle = '#64748b'
    ctx.fillRect(25, 10, 14, 1)
    ctx.fillRect(25, 47, 14, 1)

    // Mặt bảng trắng nhìn nghiêng (hướng phải)
    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(30, 12, 8, 34)

    // Vệt nội dung / sơ đồ nhìn nghiêng
    ctx.fillStyle = '#16a34a'
    ctx.fillRect(33, 18, 3, 4)
    ctx.fillStyle = '#ea580c'
    ctx.fillRect(33, 28, 4, 5)

    // Khay bút nhô ra ở cạnh trước bên phải
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(35, 47, 6, 2)
    ctx.fillStyle = '#0284c7'
    ctx.fillRect(36, 46, 3, 1)
  }

  return canvas
}

export function createRugCanvas(colorHex: string = '#2563eb'): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const ctx = canvas.getContext('2d')!

  // Nền màu thảm chính trải kín toàn bộ ô 32x32 không để viền hở
  ctx.fillStyle = colorHex
  ctx.fillRect(0, 0, 32, 32)

  // Họa tiết sợi dệt đan xen liền mạch (Seamless Micro-Woven Textile)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
  for (let y = 0; y < 32; y += 4) {
    for (let x = 0; x < 32; x += 4) {
      ctx.fillRect(x, y, 2, 2)
      ctx.fillRect(x + 2, y + 2, 2, 2)
    }
  }

  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'
  for (let y = 0; y < 32; y += 4) {
    for (let x = 0; x < 32; x += 4) {
      ctx.fillRect(x + 2, y, 2, 2)
      ctx.fillRect(x, y + 2, 2, 2)
    }
  }

  return canvas
}

/**
 * Đăng ký tất cả các texture nội thất vào Phaser TextureManager
 */
export function registerFurnitureTextures(scene: Phaser.Scene) {
  if (!scene || !scene.textures) return

  // 1. Table (4 hướng xoay 2.5D: Mặt trước, Mặt trái, Mặt sau, Mặt phải)
  for (let dir = 0; dir < 4; dir++) {
    const key = `custom_table_${dir}`
    if (!scene.textures.exists(key)) {
      scene.textures.addCanvas(key, createTableCanvas(dir))
    }
  }
  if (!scene.textures.exists('custom_table')) {
    scene.textures.addCanvas('custom_table', createTableCanvas(0))
  }

  // 2. Computer (4 hướng xoay 2.5D đồng bộ theo hướng Bàn: Mặt trước, Mặt trái, Mặt sau, Mặt phải)
  for (let dir = 0; dir < 4; dir++) {
    const key = `custom_computer_${dir}`
    if (!scene.textures.exists(key)) {
      scene.textures.addCanvas(key, createComputerCanvas(dir))
    }
  }
  if (!scene.textures.exists('custom_computer')) {
    scene.textures.addCanvas('custom_computer', createComputerCanvas(0))
  }

  // 3. Flower Vase (3 loại hoa: Đào, Mai, Lan - 4 hướng xoay 2.5D)
  const flowerTypesList: ('dao' | 'mai' | 'lan')[] = ['dao', 'mai', 'lan']
  flowerTypesList.forEach((fType) => {
    for (let dir = 0; dir < 4; dir++) {
      const key = `custom_vase_${fType}_${dir}`
      if (!scene.textures.exists(key)) {
        scene.textures.addCanvas(key, createVaseCanvas(dir, '#2563eb', fType))
      }
    }
  })
  for (let dir = 0; dir < 4; dir++) {
    const key = `custom_vase_${dir}`
    if (!scene.textures.exists(key)) {
      scene.textures.addCanvas(key, createVaseCanvas(dir, '#2563eb', 'dao'))
    }
  }
  if (!scene.textures.exists('custom_vase')) {
    scene.textures.addCanvas('custom_vase', createVaseCanvas(0, '#2563eb', 'dao'))
  }

  // 4. Whiteboard (4 hướng xoay 2.5D: Mặt trước, Mặt trái, Mặt sau, Mặt phải)
  for (let dir = 0; dir < 4; dir++) {
    const key = `custom_whiteboard_${dir}`
    if (!scene.textures.exists(key)) {
      scene.textures.addCanvas(key, createWhiteboardCanvas(dir))
    }
  }
  if (!scene.textures.exists('custom_whiteboard')) {
    scene.textures.addCanvas('custom_whiteboard', createWhiteboardCanvas(0))
  }

  // 5. Rugs cho tất cả màu preset
  RUG_COLORS.forEach((c) => {
    const key = getRugTextureKey(c.hex)
    if (!scene.textures.exists(key)) {
      scene.textures.addCanvas(key, createRugCanvas(c.hex))
    }
  })

  // 6. Cửa nối tầng (Stairs / Door Up & Down)
  if (!scene.textures.exists('floor_door_up')) {
    scene.textures.addCanvas('floor_door_up', createFloorDoorCanvas(true))
  }
  if (!scene.textures.exists('floor_door_down')) {
    scene.textures.addCanvas('floor_door_down', createFloorDoorCanvas(false))
  }

  // 7. Tường (Wall - 4 hướng)
  for (let dir = 0; dir < 4; dir++) {
    const key = `custom_wall_${dir}`
    if (!scene.textures.exists(key)) {
      scene.textures.addCanvas(key, createWallCanvas(dir))
    }
  }
  if (!scene.textures.exists('custom_wall')) {
    scene.textures.addCanvas('custom_wall', createWallCanvas(0))
  }

  // 8. Thảm cỏ (Grass carpet: Xanh tươi & Vàng lá thu)
  if (!scene.textures.exists('custom_grass_green')) {
    scene.textures.addCanvas('custom_grass_green', createGrassCanvas('#16a34a'))
  }
  if (!scene.textures.exists('custom_grass_autumn')) {
    scene.textures.addCanvas('custom_grass_autumn', createGrassCanvas('#d97706'))
  }
  if (!scene.textures.exists('custom_grass')) {
    scene.textures.addCanvas('custom_grass', createGrassCanvas('#16a34a'))
  }

  // 9. Cây lớn (Large Tree - 4 loại quả: Táo, Cam, Chanh, Đào)
  for (let dir = 0; dir < 4; dir++) {
    const key = `custom_tree_large_${dir}`
    if (!scene.textures.exists(key)) {
      scene.textures.addCanvas(key, createLargeTreeCanvas(dir))
    }
  }
  if (!scene.textures.exists('custom_tree_large')) {
    scene.textures.addCanvas('custom_tree_large', createLargeTreeCanvas(0))
  }

  // 10. Cây nhỏ (Small Tree / Potted plant - 4 phong cách)
  for (let dir = 0; dir < 4; dir++) {
    const key = `custom_tree_small_${dir}`
    if (!scene.textures.exists(key)) {
      scene.textures.addCanvas(key, createSmallTreeCanvas(dir))
    }
  }
  if (!scene.textures.exists('custom_tree_small')) {
    scene.textures.addCanvas('custom_tree_small', createSmallTreeCanvas(0))
  }

  // 11. Bụi cỏ / Cây bụi (Bush - 4 loại hoa)
  for (let dir = 0; dir < 4; dir++) {
    const key = `custom_bush_${dir}`
    if (!scene.textures.exists(key)) {
      scene.textures.addCanvas(key, createBushCanvas(dir))
    }
  }
  if (!scene.textures.exists('custom_bush')) {
    scene.textures.addCanvas('custom_bush', createBushCanvas(0))
  }
}

export function createFloorDoorCanvas(isUp: boolean = true): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const ctx = canvas.getContext('2d')!

  // Đổ bóng sàn
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
  ctx.fillRect(2, 2, 28, 28)

  // Khung viền ngoài
  ctx.fillStyle = isUp ? '#0284c7' : '#d97706'
  ctx.fillRect(1, 1, 30, 30)

  // Nền bên trong
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(3, 3, 26, 26)

  // Các bậc thang
  const stepColors = isUp
    ? ['#0369a1', '#0284c7', '#38bdf8', '#7dd3fc']
    : ['#92400e', '#b45309', '#d97706', '#f59e0b']

  for (let i = 0; i < 4; i++) {
    const y = isUp ? 22 - i * 5 : 5 + i * 5
    ctx.fillStyle = stepColors[i]
    ctx.fillRect(5, y, 22, 4)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.fillRect(5, y, 22, 1)
  }

  // Mũi tên chỉ hướng nổi bật
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 11px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(isUp ? '▲' : '▼', 16, 16)

  return canvas
}

/**
 * Đăng ký texture cho màu thảm bất kỳ (Dynamic Color)
 */
export function ensureCustomRugTexture(scene: Phaser.Scene, colorHex: string): string {
  const key = getRugTextureKey(colorHex)
  if (!scene.textures.exists(key)) {
    scene.textures.addCanvas(key, createRugCanvas(colorHex))
  }
  return key
}

/**
 * 7. Tường Ngăn / Vách Ngăn (Wall / Partition Panel)
 * Thay đổi theo 4 cạnh của ô (32x32) để decor linh hoạt:
 * - dir === 0: Sát Cạnh Trên (Top Edge: y=0..10, x=0..32)
 * - dir === 1: Sát Cạnh Bên Phải (Right Edge: x=22..32, y=0..32)
 * - dir === 2: Sát Cạnh Dưới (Bottom Edge: y=22..32, x=0..32)
 * - dir === 3: Sát Cạnh Bên Trái (Left Edge: x=0..10, y=0..32)
 * Thiết kế đồng bộ phong cách văn phòng hiện đại (Modern Slate Partition),
 * nối liền mạch tuyệt đối khi xếp cạnh nhau theo hàng ngang hoặc hàng dọc.
 */
export function createWallCanvas(direction: number = 0): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const ctx = canvas.getContext('2d')!
  const dir = ((direction % 4) + 4) % 4

  if (dir === 0) {
    // ===== HƯỚNG 0: SÁT CẠNH TRÊN (Top Edge) =====
    // Nẹp nhôm sáng đỉnh vách
    ctx.fillStyle = '#cbd5e1'
    ctx.fillRect(0, 0, 32, 1)
    ctx.fillStyle = '#94a3b8'
    ctx.fillRect(0, 1, 32, 2)

    // Thân vách xám ghi hiện đại (y: 3..7)
    ctx.fillStyle = '#475569'
    ctx.fillRect(0, 3, 32, 5)

    // Dải chỉ kim loại tinh tế ở giữa
    ctx.fillStyle = '#334155'
    ctx.fillRect(0, 5, 32, 1)
    ctx.fillStyle = '#64748b'
    ctx.fillRect(0, 6, 32, 1)

    // Chân nẹp vách (y: 8..9)
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(0, 8, 32, 2)

    // Đổ bóng mờ nhẹ xuống sàn (y: 10..11)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
    ctx.fillRect(0, 10, 32, 2)
  } else if (dir === 1) {
    // ===== HƯỚNG 1: SÁT CẠNH BÊN PHẢI (Right Edge) =====
    // Đổ bóng sang sàn bên trái (x: 20..21)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
    ctx.fillRect(20, 0, 2, 32)

    // Chân/gờ nẹp mép trong (x: 22..23)
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(22, 0, 2, 32)

    // Thân vách xám ghi hiện đại (x: 24..28)
    ctx.fillStyle = '#475569'
    ctx.fillRect(24, 0, 5, 32)

    // Dải chỉ kim loại dọc tinh tế
    ctx.fillStyle = '#334155'
    ctx.fillRect(26, 0, 1, 32)
    ctx.fillStyle = '#64748b'
    ctx.fillRect(27, 0, 1, 32)

    // Gờ nẹp và nẹp nhôm sáng mép phải ngoài cùng (x: 29..31)
    ctx.fillStyle = '#94a3b8'
    ctx.fillRect(29, 0, 2, 32)
    ctx.fillStyle = '#cbd5e1'
    ctx.fillRect(31, 0, 1, 32)
  } else if (dir === 2) {
    // ===== HƯỚNG 2: SÁT CẠNH DƯỚI (Bottom Edge) =====
    // Đổ bóng sàn phía trên vách (y: 20..21)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
    ctx.fillRect(0, 20, 32, 2)

    // Nẹp nhôm sáng đỉnh vách (y: 22..24)
    ctx.fillStyle = '#cbd5e1'
    ctx.fillRect(0, 22, 32, 1)
    ctx.fillStyle = '#94a3b8'
    ctx.fillRect(0, 23, 32, 2)

    // Thân vách xám ghi hiện đại (y: 25..29)
    ctx.fillStyle = '#475569'
    ctx.fillRect(0, 25, 32, 5)

    // Dải chỉ kim loại ở giữa
    ctx.fillStyle = '#334155'
    ctx.fillRect(0, 27, 32, 1)
    ctx.fillStyle = '#64748b'
    ctx.fillRect(0, 28, 32, 1)

    // Chân nẹp vách dưới cùng (y: 30..31)
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(0, 30, 32, 2)
  } else {
    // ===== HƯỚNG 3: SÁT CẠNH BÊN TRÁI (Left Edge) =====
    // Nẹp nhôm sáng ngoài cùng mép trái (x: 0..2)
    ctx.fillStyle = '#cbd5e1'
    ctx.fillRect(0, 0, 1, 32)
    ctx.fillStyle = '#94a3b8'
    ctx.fillRect(1, 0, 2, 32)

    // Thân vách xám ghi hiện đại (x: 3..7)
    ctx.fillStyle = '#475569'
    ctx.fillRect(3, 0, 5, 32)

    // Dải chỉ kim loại dọc tinh tế
    ctx.fillStyle = '#334155'
    ctx.fillRect(5, 0, 1, 32)
    ctx.fillStyle = '#64748b'
    ctx.fillRect(6, 0, 1, 32)

    // Chân/gờ nẹp mép trong (x: 8..9)
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(8, 0, 2, 32)

    // Đổ bóng mờ sang sàn bên phải (x: 10..11)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
    ctx.fillRect(10, 0, 2, 32)
  }

  return canvas
}

/**
 * 8. Thảm Cỏ Tự Nhiên & Cỏ Mùa Thu (Grass Carpet: Xanh Tươi & Vàng Lá Thu)
 */
export function createGrassCanvas(colorHexOrType: string = '#16a34a'): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const ctx = canvas.getContext('2d')!

  const autumn = isAutumnGrass(colorHexOrType)

  if (!autumn) {
    // === SẮC THÁI 1: CỎ XANH TƯƠI TỰ NHIÊN ===
    ctx.fillStyle = '#16a34a'
    ctx.fillRect(0, 0, 32, 32)

    // Kết cấu hạt sợi cỏ tự nhiên liền mạch (chu kỳ 4x4)
    ctx.fillStyle = '#15803d'
    for (let y = 0; y < 32; y += 4) {
      for (let x = 0; x < 32; x += 4) {
        ctx.fillRect(x + 1, y, 1, 2)
        ctx.fillRect(x + 3, y + 2, 1, 2)
      }
    }

    ctx.fillStyle = '#22c55e'
    for (let y = 0; y < 32; y += 4) {
      for (let x = 0; x < 32; x += 4) {
        ctx.fillRect(x, y + 1, 1, 1)
        ctx.fillRect(x + 2, y + 3, 1, 1)
      }
    }

    // Cọng cỏ điểm xuyết sáng màu (chu kỳ 8x8)
    ctx.fillStyle = '#4ade80'
    for (let y = 0; y < 32; y += 8) {
      for (let x = 0; x < 32; x += 8) {
        ctx.fillRect(x + 2, y + 3, 1, 2)
        ctx.fillRect(x + 6, y + 5, 1, 2)
      }
    }

    // Đóa hoa cúc dại trắng li ti
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(8, 8, 2, 2)
    ctx.fillRect(24, 24, 2, 2)
    ctx.fillStyle = '#facc15'
    ctx.fillRect(8, 8, 1, 1)
    ctx.fillRect(24, 24, 1, 1)
  } else {
    // === SẮC THÁI 2: CỎ VÀNG LÁ THU (Autumn Yellow Grass) ===
    ctx.fillStyle = '#d97706' // Vàng hổ phách ấm áp
    ctx.fillRect(0, 0, 32, 32)

    // Sợi cỏ úa nâu đồng mùa thu
    ctx.fillStyle = '#b45309'
    for (let y = 0; y < 32; y += 4) {
      for (let x = 0; x < 32; x += 4) {
        ctx.fillRect(x + 1, y, 1, 2)
        ctx.fillRect(x + 3, y + 2, 1, 2)
      }
    }

    // Sợi cỏ vàng rực
    ctx.fillStyle = '#eab308'
    for (let y = 0; y < 32; y += 4) {
      for (let x = 0; x < 32; x += 4) {
        ctx.fillRect(x, y + 1, 1, 1)
        ctx.fillRect(x + 2, y + 3, 1, 1)
      }
    }

    // Cọng cỏ vàng tươi điểm xuyết
    ctx.fillStyle = '#fef08a'
    for (let y = 0; y < 32; y += 8) {
      for (let x = 0; x < 32; x += 8) {
        ctx.fillRect(x + 2, y + 3, 1, 2)
        ctx.fillRect(x + 6, y + 5, 1, 2)
      }
    }

    // Hoa cúc thu vàng & lá phong rực rỡ
    ctx.fillStyle = '#ea580c'
    ctx.fillRect(8, 8, 2, 2)
    ctx.fillRect(24, 24, 2, 2)
    ctx.fillStyle = '#fde047'
    ctx.fillRect(8, 8, 1, 1)
    ctx.fillRect(24, 24, 1, 1)
  }

  return canvas
}

export function ensureVaseTexture(
  scene: Phaser.Scene,
  direction: number = 0,
  vaseColor: string = '#2563eb',
  flowerType: 'dao' | 'mai' | 'lan' = 'dao'
): string {
  const dir = ((direction % 4) + 4) % 4
  const cleanHex = (vaseColor || '#2563eb').replace('#', '').toLowerCase()
  const key = `vase_${flowerType}_${cleanHex}_${dir}`
  if (!scene.textures.exists(key)) {
    scene.textures.addCanvas(key, createVaseCanvas(dir, vaseColor, flowerType))
  }
  return key
}

export function ensureGrassTexture(scene: Phaser.Scene, isAutumn: boolean): string {
  const key = isAutumn ? 'custom_grass_autumn' : 'custom_grass_green'
  if (!scene.textures.exists(key)) {
    scene.textures.addCanvas(key, createGrassCanvas(isAutumn ? '#d97706' : '#16a34a'))
  }
  return key
}

/**
 * 9. Cây Lớn (Large Tree) - 4 hướng xoay tán lá & góc nhìn
 */
export function createLargeTreeCanvas(direction: number = 0): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const ctx = canvas.getContext('2d')!
  const dir = ((direction % 4) + 4) % 4

  // Đổ bóng tròn dưới gốc cây
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)'
  ctx.beginPath()
  ctx.ellipse(16, 29, 12, 3, 0, 0, Math.PI * 2)
  ctx.fill()

  // Rễ cây bám đất
  ctx.fillStyle = '#451a03'
  ctx.fillRect(11, 27, 10, 2)
  ctx.fillRect(9, 28, 4, 2)
  ctx.fillRect(19, 28, 4, 2)

  // Thân cây gỗ to khỏe (thay đổi độ nghiêng nhẹ theo hướng xoay)
  ctx.fillStyle = '#78350f'
  if (dir === 1) {
    ctx.fillRect(12, 16, 6, 12)
    ctx.fillRect(9, 17, 4, 2)
  } else if (dir === 3) {
    ctx.fillRect(14, 16, 6, 12)
    ctx.fillRect(19, 17, 4, 2)
  } else {
    ctx.fillRect(13, 16, 6, 12)
    ctx.fillRect(10, 16, 4, 2)
    ctx.fillRect(18, 16, 4, 2)
  }

  ctx.fillStyle = '#92400e'
  ctx.fillRect(13, 16, 2, 12)
  ctx.fillStyle = '#451a03'
  ctx.fillRect(17, 18, 2, 10)
  ctx.fillRect(14, 22, 1, 3)

  // Tán lá xanh nhiều tầng (thay đổi góc theo hướng xoay)
  const shiftX = dir === 1 ? -1 : dir === 3 ? 1 : 0
  const shiftY = dir === 2 ? -1 : dir === 0 ? 1 : 0

  ctx.fillStyle = '#14532d'
  ctx.beginPath()
  ctx.arc(10 + shiftX, 13 + shiftY, 8, 0, Math.PI * 2)
  ctx.arc(22 + shiftX, 13 + shiftY, 8, 0, Math.PI * 2)
  ctx.arc(16, 8 + shiftY, 8, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#16a34a'
  ctx.beginPath()
  ctx.arc(9 + shiftX, 12 + shiftY, 7, 0, Math.PI * 2)
  ctx.arc(23 + shiftX, 12 + shiftY, 7, 0, Math.PI * 2)
  ctx.arc(16, 7 + shiftY, 7, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#15803d'
  ctx.beginPath()
  ctx.arc(16 + shiftX, 12 + shiftY, 6, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#22c55e'
  ctx.beginPath()
  ctx.arc(15 + shiftX, 6 + shiftY, 5, 0, Math.PI * 2)
  ctx.arc(8 + shiftX, 10 + shiftY, 5, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#4ade80'
  ctx.beginPath()
  ctx.arc(14 + shiftX, 5 + shiftY, 3, 0, Math.PI * 2)
  ctx.arc(7 + shiftX, 9 + shiftY, 3, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#86efac'
  ctx.fillRect(13 + shiftX, 4 + shiftY, 2, 1)
  ctx.fillRect(6 + shiftX, 8 + shiftY, 2, 1)

  // Trái cây chín mọng (đồng bộ kiểu Táo Đỏ trên toàn bộ các hướng, chỉ đổi góc nhìn)
  const fruit = { main: '#ef4444', dark: '#b91c1c', light: '#fca5a5' }
  const fruitPositionsByDir = [
    // 0: Mặt Trước
    [{ x: 7, y: 11 }, { x: 13, y: 7 }, { x: 19, y: 8 }, { x: 23, y: 13 }, { x: 14, y: 14 }, { x: 10, y: 16 }, { x: 20, y: 16 }],
    // 1: Mặt Trái
    [{ x: 6, y: 10 }, { x: 11, y: 6 }, { x: 17, y: 8 }, { x: 21, y: 14 }, { x: 12, y: 13 }, { x: 8, y: 15 }, { x: 16, y: 16 }],
    // 2: Mặt Sau (nhìn từ trên/sau)
    [{ x: 9, y: 9 }, { x: 15, y: 6 }, { x: 21, y: 9 }, { x: 24, y: 12 }, { x: 16, y: 12 }, { x: 11, y: 14 }, { x: 21, y: 15 }],
    // 3: Mặt Phải
    [{ x: 9, y: 12 }, { x: 15, y: 8 }, { x: 21, y: 7 }, { x: 25, y: 11 }, { x: 18, y: 13 }, { x: 14, y: 16 }, { x: 22, y: 15 }],
  ]
  const fruitPositions = fruitPositionsByDir[dir]

  fruitPositions.forEach((pos) => {
    ctx.fillStyle = fruit.dark
    ctx.beginPath()
    ctx.arc(pos.x, pos.y + 0.5, 2, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = fruit.main
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, 2, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = fruit.light
    ctx.fillRect(pos.x - 1, pos.y - 1, 1, 1)

    ctx.fillStyle = '#15803d'
    ctx.fillRect(pos.x, pos.y - 2, 1, 1)
  })

  return canvas
}

/**
 * 10. Cây Nhỏ / Cây Cảnh Trong Chậu (Small Tree) - 4 hướng xoay cành & tán lá
 */
export function createSmallTreeCanvas(direction: number = 0): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const ctx = canvas.getContext('2d')!
  const dir = ((direction % 4) + 4) % 4

  // Đổ bóng sàn
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
  ctx.beginPath()
  ctx.ellipse(16, 29, 9, 3, 0, 0, Math.PI * 2)
  ctx.fill()

  // Chậu cây đất nung gốm sứ cao cấp đồng bộ trên mọi hướng
  ctx.fillStyle = '#9a3412'
  ctx.fillRect(10, 20, 12, 9)
  ctx.fillStyle = '#c2410c'
  ctx.fillRect(11, 20, 10, 9)
  ctx.fillStyle = '#ea580c'
  if (dir === 1) {
    ctx.fillRect(11, 21, 2, 7)
  } else if (dir === 3) {
    ctx.fillRect(18, 21, 2, 7)
  } else {
    ctx.fillRect(13, 21, 3, 7)
  }
  ctx.fillStyle = '#ea580c'
  ctx.fillRect(9, 18, 14, 3)
  ctx.fillStyle = '#fdba74'
  ctx.fillRect(9, 18, 14, 1)

  // Đất trong chậu
  ctx.fillStyle = '#451a03'
  ctx.fillRect(11, 18, 10, 2)

  // Thân cây bonsai uốn lượn đổi hướng theo dir
  ctx.fillStyle = '#78350f'
  if (dir === 1) {
    ctx.fillRect(14, 12, 2, 7)
    ctx.fillRect(12, 11, 3, 3)
  } else if (dir === 3) {
    ctx.fillRect(16, 12, 2, 7)
    ctx.fillRect(17, 11, 3, 3)
  } else if (dir === 2) {
    ctx.fillRect(15, 11, 2, 8)
    ctx.fillRect(14, 9, 4, 3)
  } else {
    ctx.fillRect(15, 12, 2, 7)
    ctx.fillRect(14, 10, 3, 3)
  }

  // Tán lá xanh tròn được cắt tỉa tỉ mỉ đổi góc theo dir
  const leafX = dir === 1 ? 14 : dir === 3 ? 18 : 16
  const leafY = dir === 2 ? 8 : 9

  ctx.fillStyle = '#14532d'
  ctx.beginPath()
  ctx.arc(leafX, leafY, 8, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#16a34a'
  ctx.beginPath()
  ctx.arc(leafX, leafY - 1, 7, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#22c55e'
  ctx.beginPath()
  ctx.arc(leafX - 1, leafY - 2, 5, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#4ade80'
  ctx.beginPath()
  ctx.arc(leafX - 2, leafY - 3, 3, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#86efac'
  ctx.fillRect(leafX - 3, leafY - 4, 2, 1)

  ctx.fillStyle = '#a7f3d0'
  ctx.fillRect(leafX - 6, leafY - 1, 1, 1)
  ctx.fillRect(leafX + 4, leafY - 1, 1, 1)

  return canvas
}

/**
 * 11. Bụi Cỏ / Cây Bụi (Bush) - 4 hướng xoay góc nhìn
 */
export function createBushCanvas(direction: number = 0): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const ctx = canvas.getContext('2d')!
  const dir = ((direction % 4) + 4) % 4

  // Đổ bóng dưới bụi cây
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
  ctx.beginPath()
  ctx.ellipse(16, 27, 13, 4, 0, 0, Math.PI * 2)
  ctx.fill()

  // Khối lá tối màu phía sau (dịch nhẹ theo hướng)
  const shiftX = dir === 1 ? -1 : dir === 3 ? 1 : 0
  const shiftY = dir === 2 ? -1 : 0

  ctx.fillStyle = '#14532d'
  ctx.beginPath()
  ctx.arc(9 + shiftX, 20 + shiftY, 7, 0, Math.PI * 2)
  ctx.arc(23 + shiftX, 20 + shiftY, 7, 0, Math.PI * 2)
  ctx.arc(16, 16 + shiftY, 8, 0, Math.PI * 2)
  ctx.fill()

  // Khối lá chính
  ctx.fillStyle = '#16a34a'
  ctx.beginPath()
  ctx.arc(9 + shiftX, 19 + shiftY, 6, 0, Math.PI * 2)
  ctx.arc(23 + shiftX, 19 + shiftY, 6, 0, Math.PI * 2)
  ctx.arc(16, 15 + shiftY, 7, 0, Math.PI * 2)
  ctx.fill()

  // Điểm sáng mặt trời
  ctx.fillStyle = '#22c55e'
  ctx.beginPath()
  ctx.arc(8 + shiftX, 17 + shiftY, 5, 0, Math.PI * 2)
  ctx.arc(22 + shiftX, 17 + shiftY, 5, 0, Math.PI * 2)
  ctx.arc(16, 13 + shiftY, 5, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#4ade80'
  ctx.beginPath()
  ctx.arc(15 + shiftX, 12 + shiftY, 3, 0, Math.PI * 2)
  ctx.arc(7 + shiftX, 16 + shiftY, 3, 0, Math.PI * 2)
  ctx.arc(21 + shiftX, 16 + shiftY, 3, 0, Math.PI * 2)
  ctx.fill()

  // Hoa nhỏ điểm xuyết trên bụi cây (đồng bộ hoa cúc trắng nhụy vàng trên mọi hướng)
  const flower = { main: '#ffffff', center: '#facc15' }

  const flowerDotsByDir = [
    // 0: Mặt Trước
    [{ x: 9, y: 15 }, { x: 15, y: 11 }, { x: 21, y: 14 }, { x: 12, y: 19 }, { x: 18, y: 18 }, { x: 24, y: 20 }],
    // 1: Mặt Trái
    [{ x: 7, y: 14 }, { x: 13, y: 10 }, { x: 18, y: 13 }, { x: 10, y: 18 }, { x: 15, y: 19 }, { x: 21, y: 17 }],
    // 2: Mặt Sau
    [{ x: 10, y: 13 }, { x: 16, y: 9 }, { x: 22, y: 12 }, { x: 13, y: 16 }, { x: 19, y: 15 }, { x: 25, y: 18 }],
    // 3: Mặt Phải
    [{ x: 11, y: 14 }, { x: 17, y: 10 }, { x: 23, y: 13 }, { x: 14, y: 18 }, { x: 19, y: 17 }, { x: 25, y: 19 }],
  ]
  const flowerDots = flowerDotsByDir[dir]

  flowerDots.forEach((f) => {
    ctx.fillStyle = flower.main
    ctx.beginPath()
    ctx.arc(f.x, f.y, 1.8, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = flower.center
    ctx.fillRect(f.x - 0.5, f.y - 0.5, 1, 1)
  })

  return canvas
}

