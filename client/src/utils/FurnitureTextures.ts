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

export function createVaseCanvas(direction: number = 0): HTMLCanvasElement {
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

  // --- BÌNH GỐM XANH SANG TRỌNG ---
  // Đế bình
  ctx.fillStyle = '#1e3a8a'
  ctx.fillRect(12, 27, 8, 2)

  // Thân bình tròn
  ctx.fillStyle = '#2563eb'
  ctx.beginPath()
  ctx.ellipse(16, 22, 7, 6, 0, 0, Math.PI * 2)
  ctx.fill()

  // Đổ bóng góc cong của bình
  ctx.fillStyle = '#1d4ed8'
  ctx.beginPath()
  ctx.arc(16, 22, 7, 0.2 * Math.PI, 0.8 * Math.PI, false)
  ctx.fill()

  // Điểm sáng tráng men gốm chuyển dịch theo góc nhìn
  ctx.fillStyle = '#93c5fd'
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
  ctx.fillStyle = '#1e40af'
  ctx.fillRect(13, 15, 6, 3)

  // Miệng bình loe
  ctx.fillStyle = '#3b82f6'
  ctx.fillRect(12, 14, 8, 2)

  if (dir === 0) {
    // ===== HƯỚNG 0: MẶT TRƯỚC (Down / Front View) =====
    // Cành và lá tươi
    ctx.fillStyle = '#15803d'
    ctx.fillRect(15, 10, 2, 5) // cành giữa
    ctx.fillRect(13, 11, 1, 4) // cành trái
    ctx.fillRect(18, 11, 1, 4) // cành phải

    ctx.fillStyle = '#22c55e'
    ctx.fillRect(9, 13, 4, 3) // lá trái
    ctx.fillRect(19, 13, 4, 3) // lá phải
    ctx.fillStyle = '#4ade80'
    ctx.fillRect(10, 12, 2, 2)
    ctx.fillRect(20, 12, 2, 2)

    // 1. Hoa đỏ ở đỉnh
    ctx.fillStyle = '#ef4444'
    ctx.fillRect(14, 5, 4, 5)
    ctx.fillRect(13, 6, 6, 3)
    ctx.fillStyle = '#f87171'
    ctx.fillRect(15, 5, 2, 2)
    ctx.fillStyle = '#fef08a' // nhụy vàng
    ctx.fillRect(15, 7, 2, 1)

    // 2. Hoa hồng bên trái
    ctx.fillStyle = '#ec4899'
    ctx.fillRect(8, 8, 4, 4)
    ctx.fillStyle = '#f472b6'
    ctx.fillRect(9, 9, 2, 2)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(9, 9, 1, 1)

    // 3. Hoa vàng bên phải
    ctx.fillStyle = '#f59e0b'
    ctx.fillRect(20, 7, 4, 4)
    ctx.fillStyle = '#fbbf24'
    ctx.fillRect(21, 8, 2, 2)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(21, 8, 1, 1)
  } else if (dir === 1) {
    // ===== HƯỚNG 1: MẶT TRÁI (Left View) =====
    ctx.fillStyle = '#15803d'
    ctx.fillRect(13, 10, 2, 5)
    ctx.fillRect(11, 11, 2, 4)
    ctx.fillRect(17, 12, 1, 3)

    ctx.fillStyle = '#22c55e'
    ctx.fillRect(7, 12, 5, 3)
    ctx.fillRect(18, 14, 3, 2)
    ctx.fillStyle = '#4ade80'
    ctx.fillRect(8, 11, 2, 2)

    // Hoa hồng nở rực rỡ ở phía trước bên trái
    ctx.fillStyle = '#ec4899'
    ctx.fillRect(6, 7, 6, 5)
    ctx.fillRect(7, 6, 4, 7)
    ctx.fillStyle = '#f472b6'
    ctx.fillRect(8, 8, 2, 2)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(8, 8, 1, 1)

    // Hoa đỏ nghiêng trái
    ctx.fillStyle = '#ef4444'
    ctx.fillRect(12, 4, 4, 5)
    ctx.fillStyle = '#f87171'
    ctx.fillRect(13, 4, 2, 2)
    ctx.fillStyle = '#fef08a'
    ctx.fillRect(13, 6, 1, 1)

    // Hoa vàng khuất sau bên phải
    ctx.fillStyle = '#d97706'
    ctx.fillRect(18, 9, 3, 3)
    ctx.fillStyle = '#f59e0b'
    ctx.fillRect(18, 9, 2, 2)
  } else if (dir === 2) {
    // ===== HƯỚNG 2: MẶT SAU (Up / Back View) =====
    // Nhìn từ sau lưng: Tán lá xanh xòe rộng, cuống hoa đài hoa
    ctx.fillStyle = '#15803d'
    ctx.fillRect(15, 10, 2, 5)
    ctx.fillRect(11, 12, 3, 3)
    ctx.fillRect(18, 12, 3, 3)

    ctx.fillStyle = '#16a34a'
    ctx.fillRect(7, 11, 6, 4)
    ctx.fillRect(19, 11, 6, 4)
    ctx.fillStyle = '#22c55e'
    ctx.fillRect(8, 12, 4, 2)
    ctx.fillRect(20, 12, 4, 2)

    // Đài hoa màu xanh đậm
    ctx.fillStyle = '#14532d'
    ctx.fillRect(9, 10, 3, 2)
    ctx.fillRect(20, 10, 3, 2)
    ctx.fillRect(15, 8, 2, 2)

    // Hoa đỏ nhìn từ sau
    ctx.fillStyle = '#b91c1c'
    ctx.fillRect(13, 5, 6, 4)
    ctx.fillStyle = '#ef4444'
    ctx.fillRect(14, 6, 4, 3)

    // Cánh hoa hồng & vàng lấp ló phía sau
    ctx.fillStyle = '#be185d'
    ctx.fillRect(7, 8, 4, 3)
    ctx.fillStyle = '#b45309'
    ctx.fillRect(21, 8, 4, 3)
  } else {
    // ===== HƯỚNG 3: MẶT PHẢI (Right View) =====
    ctx.fillStyle = '#15803d'
    ctx.fillRect(17, 10, 2, 5)
    ctx.fillRect(19, 11, 2, 4)
    ctx.fillRect(14, 12, 1, 3)

    ctx.fillStyle = '#22c55e'
    ctx.fillRect(20, 12, 5, 3)
    ctx.fillRect(11, 14, 3, 2)
    ctx.fillStyle = '#4ade80'
    ctx.fillRect(22, 11, 2, 2)

    // Hoa vàng to nở rực rỡ ở phía trước bên phải
    ctx.fillStyle = '#f59e0b'
    ctx.fillRect(20, 7, 6, 5)
    ctx.fillRect(21, 6, 4, 7)
    ctx.fillStyle = '#fbbf24'
    ctx.fillRect(22, 8, 2, 2)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(22, 8, 1, 1)

    // Hoa đỏ nghiêng phải
    ctx.fillStyle = '#ef4444'
    ctx.fillRect(16, 4, 4, 5)
    ctx.fillStyle = '#f87171'
    ctx.fillRect(17, 4, 2, 2)
    ctx.fillStyle = '#fef08a'
    ctx.fillRect(18, 6, 1, 1)

    // Hoa hồng khuất sau bên trái
    ctx.fillStyle = '#be185d'
    ctx.fillRect(11, 9, 3, 3)
    ctx.fillStyle = '#ec4899'
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

  // Bóng đổ viền thảm
  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
  ctx.fillRect(0, 0, 32, 32)

  // Tua rua viền thảm (Fringe tassels) ở hai đầu trên và dưới
  ctx.fillStyle = '#fef3c7'
  for (let x = 2; x < 30; x += 2) {
    ctx.fillRect(x, 1, 1, 2)
    ctx.fillRect(x, 29, 1, 2)
  }

  // Khung dệt viền vàng kim
  ctx.fillStyle = '#d97706'
  ctx.fillRect(2, 2, 28, 28)

  // Vùng màu chính của thảm do người dùng chọn
  ctx.fillStyle = colorHex
  ctx.fillRect(4, 4, 24, 24)

  // Đường hoa văn chìm bên trong
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
  ctx.lineWidth = 1
  ctx.strokeRect(6.5, 6.5, 19, 19)

  // Họa tiết hoa văn hình thoi ở giữa
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'
  ctx.beginPath()
  ctx.moveTo(16, 10)
  ctx.lineTo(21, 16)
  ctx.lineTo(16, 22)
  ctx.lineTo(11, 16)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
  ctx.beginPath()
  ctx.arc(16, 16, 2.5, 0, Math.PI * 2)
  ctx.fill()

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

  // 3. Flower Vase (4 hướng xoay 2.5D: Mặt trước, Mặt trái, Mặt sau, Mặt phải)
  for (let dir = 0; dir < 4; dir++) {
    const key = `custom_vase_${dir}`
    if (!scene.textures.exists(key)) {
      scene.textures.addCanvas(key, createVaseCanvas(dir))
    }
  }
  if (!scene.textures.exists('custom_vase')) {
    scene.textures.addCanvas('custom_vase', createVaseCanvas(0))
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
