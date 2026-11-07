import Phaser from 'phaser'
import { IAvatarCustomization, OutfitType } from '../../../types/IOfficeState'

interface RGB {
  r: number
  g: number
  b: number
}

function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '')
  const num = parseInt(clean.length === 3 ? clean.replace(/(.)/g, '$1$1') : clean, 16)
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }
  return [h * 360, s, l]
}

/**
 * Tạo khóa texture duy nhất cho tổ hợp nhân vật + cấu hình màu/trang phục
 */
export function getCustomAvatarKey(baseTexture: string, config: IAvatarCustomization): string {
  const cleanSkin = config.skinColor.replace('#', '')
  const cleanHair = config.hairColor.replace('#', '')
  const cleanOutfit = config.outfitColor.replace('#', '')
  return `${baseTexture}_${cleanSkin}_${cleanHair}_${config.outfitType}_${cleanOutfit}`
}

/**
 * Phân loại vùng pixel trong mỗi frame của nhân vật:
 * - Đầu & Tóc: y từ 0..23 (trong hệ quy chiếu 48px chuẩn)
 * - Thân & Trang phục: y từ 24..44
 */
function recolorPixel(
  r: number,
  g: number,
  b: number,
  localY: number,
  skinRgb: RGB,
  hairRgb: RGB,
  outfitRgb: RGB,
  outfitType: OutfitType
): RGB {
  const [h, s, l] = rgbToHsl(r, g, b)

  // Giữ nguyên viền đen mắt/miệng trên khuôn mặt (localY <= 24)
  if (l < 0.08 && localY <= 24) {
    return { r, g, b }
  }

  // Giữ viền nét cực tối viền ngoài sprite
  if (l < 0.04) {
    return { r, g, b }
  }

  // Kiểm tra tông màu da gốc (warm peach/tan: Hue 10..45, Saturation > 0.22, Lightness > 0.42)
  const isSkinTone = h >= 10 && h <= 45 && s >= 0.22 && l >= 0.42 && r > g && g > b

  if (localY <= 24) {
    if (isSkinTone) {
      const shade = Math.min(1.25, Math.max(0.65, l / 0.72))
      return {
        r: Math.min(255, Math.round(skinRgb.r * shade)),
        g: Math.min(255, Math.round(skinRgb.g * shade)),
        b: Math.min(255, Math.round(skinRgb.b * shade)),
      }
    } else {
      // Mở rộng toàn bộ vùng tóc để không bị sót phần lõi bên trong
      const shade = Math.min(1.35, Math.max(0.40, l / 0.50))
      return {
        r: Math.min(255, Math.round(hairRgb.r * shade)),
        g: Math.min(255, Math.round(hairRgb.g * shade)),
        b: Math.min(255, Math.round(hairRgb.b * shade)),
      }
    }
  } else {
    // Vùng bàn tay / cổ / chân nếu lộ da
    if (isSkinTone && localY < 38) {
      const shade = Math.min(1.2, Math.max(0.65, l / 0.72))
      return {
        r: Math.min(255, Math.round(skinRgb.r * shade)),
        g: Math.min(255, Math.round(skinRgb.g * shade)),
        b: Math.min(255, Math.round(skinRgb.b * shade)),
      }
    }

    // Vùng giày (dưới cùng frame: y >= 43)
    if (localY >= 43) {
      return { r, g, b }
    }

    // Xử lý kiểu trang phục (casual / suit / dress)
    const shade = Math.min(1.25, Math.max(0.45, l / 0.5))

    if (outfitType === 'suit') {
      // Đồ vest: quần và áo khoác đồng màu đậm lịch lãm
      return {
        r: Math.min(255, Math.round(outfitRgb.r * shade * 0.9)),
        g: Math.min(255, Math.round(outfitRgb.g * shade * 0.9)),
        b: Math.min(255, Math.round(outfitRgb.b * shade * 0.9)),
      }
    }

    if (outfitType === 'dress') {
      // Váy liền thân: đồng bộ màu phần thân trên và phần chân váy (y từ 24..41), phần ống chân (y 40..42) mang tông da
      if (localY >= 40 && localY <= 42) {
        return {
          r: Math.min(255, Math.round(skinRgb.r * 0.92)),
          g: Math.min(255, Math.round(skinRgb.g * 0.92)),
          b: Math.min(255, Math.round(skinRgb.b * 0.92)),
        }
      }
      return {
        r: Math.min(255, Math.round(outfitRgb.r * shade)),
        g: Math.min(255, Math.round(outfitRgb.g * shade)),
        b: Math.min(255, Math.round(outfitRgb.b * shade)),
      }
    }

    // Casual (Quần áo bình thường): đổi màu áo (localY 25..36), quần (localY 37..42) phối màu denim hài hòa
    if (localY <= 36) {
      return {
        r: Math.min(255, Math.round(outfitRgb.r * shade)),
        g: Math.min(255, Math.round(outfitRgb.g * shade)),
        b: Math.min(255, Math.round(outfitRgb.b * shade)),
      }
    } else if (localY <= 42) {
      const pantShade = Math.min(1.1, Math.max(0.4, l / 0.45))
      return {
        r: Math.min(255, Math.round((outfitRgb.r * 0.45 + 30) * pantShade)),
        g: Math.min(255, Math.round((outfitRgb.g * 0.45 + 35) * pantShade)),
        b: Math.min(255, Math.round((outfitRgb.b * 0.45 + 50) * pantShade)),
      }
    }
    return { r, g, b }
  }
}

/**
 * Vẽ thêm chi tiết đặc trưng của Đồ Vest (sơ mi + cà vạt) hoặc Váy liền thân (tà váy chữ A) trên từng frame
 */
function applyOutfitOverlayToFrame(
  ctx: CanvasRenderingContext2D,
  frameX: number,
  frameY: number,
  frameW: number,
  frameH: number,
  imgData: ImageData,
  outfitType: OutfitType,
  outfitRgb: RGB
) {
  if (outfitType === 'casual') return

  const data = imgData.data
  const canvasW = imgData.width
  const scale = frameH / 48
  const centerX = frameX + Math.floor(frameW / 2)

  if (outfitType === 'suit') {
    // Vẽ cổ áo sơ mi trắng và cà vạt đỏ/xanh ở vùng ngực (localY 26..33)
    const startY = Math.round(26 * scale)
    const endY = Math.round(33 * scale)
    const tieStartY = Math.round(28 * scale)
    const tieEndY = Math.round(32 * scale)
    const shirtEndY = Math.round(30 * scale)

    for (let ly = startY; ly <= endY; ly++) {
      const py = frameY + ly
      for (let dx = -Math.round(2 * scale); dx <= Math.round(2 * scale); dx++) {
        const px = centerX + dx
        const idx = (py * canvasW + px) * 4
        if (data[idx + 3] > 60) {
          if (Math.abs(dx) <= Math.max(0, Math.floor(0.6 * scale)) && ly >= tieStartY && ly <= tieEndY) {
            // Cà vạt điểm nhấn đỏ tươi nổi bật
            data[idx] = 220
            data[idx + 1] = 38
            data[idx + 2] = 38
            data[idx + 3] = 255
          } else if (Math.abs(dx) <= Math.max(1, Math.round(1 * scale)) && ly <= shirtEndY) {
            // Áo sơ mi trắng tinh tế bên trong vest
            data[idx] = 248
            data[idx + 1] = 250
            data[idx + 2] = 252
            data[idx + 3] = 255
          }
        }
      }
    }
  } else if (outfitType === 'dress') {
    // Mở rộng phần tà váy liền thân liền mạch ở vùng hông/chân trên (localY 34..39)
    const startY = Math.round(34 * scale)
    const endY = Math.round(39 * scale)
    for (let ly = startY; ly <= endY; ly++) {
      const py = frameY + ly
      let minX = frameW
      let maxX = 0
      for (let lx = 0; lx < frameW; lx++) {
        const idx = (py * canvasW + (frameX + lx)) * 4
        if (data[idx + 3] > 128) {
          if (lx < minX) minX = lx
          if (lx > maxX) maxX = lx
        }
      }
      if (minX <= maxX) {
        // Lấp đầy khoảng giữa hai ống quần và mở rộng nhẹ tạo dáng váy liền thân
        const skirtStart = Math.max(0, minX - Math.max(1, Math.round(1 * scale)))
        const skirtEnd = Math.min(frameW - 1, maxX + Math.max(1, Math.round(1 * scale)))
        for (let lx = skirtStart; lx <= skirtEnd; lx++) {
          const idx = (py * canvasW + (frameX + lx)) * 4
          const isEdge = lx === skirtStart || lx === skirtEnd || ly === endY
          const factor = isEdge ? 0.82 : 1.0
          data[idx] = Math.round(outfitRgb.r * factor)
          data[idx + 1] = Math.round(outfitRgb.g * factor)
          data[idx + 2] = Math.round(outfitRgb.b * factor)
          data[idx + 3] = 255
        }
      }
    }
  }
}

/**
 * Khởi tạo Atlas & Animation động trong Phaser cho nhân vật tùy chỉnh
 */
export function ensureCustomAvatarTexture(
  scene: Phaser.Scene,
  baseTextureKey: string,
  config: IAvatarCustomization
): string {
  const customKey = getCustomAvatarKey(baseTextureKey, config)
  if (scene.textures.exists(customKey)) {
    return customKey
  }

  const baseTex = scene.textures.get(baseTextureKey)
  if (!baseTex || baseTex.key === '__MISSING') {
    return baseTextureKey
  }

  const sourceImage = baseTex.getSourceImage() as HTMLImageElement | HTMLCanvasElement
  const canvas = document.createElement('canvas')
  canvas.width = sourceImage.width
  canvas.height = sourceImage.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(sourceImage, 0, 0)

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imgData.data

  const skinRgb = hexToRgb(config.skinColor)
  const hairRgb = hexToRgb(config.hairColor)
  const outfitRgb = hexToRgb(config.outfitColor)

  const frameNames = baseTex.getFrameNames(false)
  for (const frameName of frameNames) {
    if (frameName === '__BASE') continue
    const frame = baseTex.get(frameName)
    const fx = frame.cutX
    const fy = frame.cutY
    const fw = frame.cutWidth
    const fh = frame.cutHeight

    for (let ly = 0; ly < fh; ly++) {
      const localNormY = (ly / fh) * 48
      for (let lx = 0; lx < fw; lx++) {
        const px = fx + lx
        const py = fy + ly
        const idx = (py * canvas.width + px) * 4
        if (data[idx + 3] > 20) {
          const newColor = recolorPixel(
            data[idx],
            data[idx + 1],
            data[idx + 2],
            localNormY,
            skinRgb,
            hairRgb,
            outfitRgb,
            config.outfitType
          )
          data[idx] = newColor.r
          data[idx + 1] = newColor.g
          data[idx + 2] = newColor.b
        }
      }
    }

    applyOutfitOverlayToFrame(ctx, fx, fy, fw, fh, imgData, config.outfitType, outfitRgb)
  }

  ctx.putImageData(imgData, 0, 0)

  // Sao chép cấu trúc frame từ base texture sang custom texture
  const canvasTex = scene.textures.addCanvas(customKey, canvas)
  if (canvasTex) {
    for (const frameName of frameNames) {
      if (frameName === '__BASE') continue
      const f = baseTex.get(frameName)
      canvasTex.add(frameName, 0, f.cutX, f.cutY, f.cutWidth, f.cutHeight)
      const num = parseInt(frameName, 10)
      if (!isNaN(num)) {
        canvasTex.add(num, 0, f.cutX, f.cutY, f.cutWidth, f.cutHeight)
      }
    }
  }

  // Đăng ký bộ animation tương ứng với customKey
  registerCharacterAnimsForKey(scene.anims, baseTextureKey, customKey)

  return customKey
}

/**
 * Nhân bản các animation chuẩn (idle, run, sit) của nhân vật gốc sang khóa customKey
 */
function registerCharacterAnimsForKey(
  anims: Phaser.Animations.AnimationManager,
  baseKey: string,
  customKey: string
) {
  const directions = ['right', 'up', 'left', 'down']
  const states = ['idle', 'run', 'sit']

  for (const state of states) {
    for (const dir of directions) {
      const sourceAnimKey = `${baseKey}_${state}_${dir}`
      const targetAnimKey = `${customKey}_${state}_${dir}`
      if (anims.exists(targetAnimKey)) continue

      const sourceAnim = anims.get(sourceAnimKey)
      if (!sourceAnim) continue

      const frames = sourceAnim.frames.map((af) => ({
        key: customKey,
        frame: af.textureFrame,
      }))

      anims.create({
        key: targetAnimKey,
        frames,
        frameRate: sourceAnim.frameRate,
        repeat: sourceAnim.repeat,
      })
    }
  }
}

/**
 * Render ảnh xem trước nhân vật (Preview) lên thẻ Canvas trong giao diện chọn nhân vật
 */
export function renderAvatarPreviewCanvas(
  canvas: HTMLCanvasElement,
  sourceImg: HTMLImageElement,
  config: IAvatarCustomization
) {
  const w = sourceImg.naturalWidth || sourceImg.width
  const h = sourceImg.naturalHeight || sourceImg.height
  if (!w || !h) return

  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = w
  tempCanvas.height = h
  const tCtx = tempCanvas.getContext('2d')!
  tCtx.drawImage(sourceImg, 0, 0)

  const imgData = tCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height)
  const data = imgData.data
  const skinRgb = hexToRgb(config.skinColor)
  const hairRgb = hexToRgb(config.hairColor)
  const outfitRgb = hexToRgb(config.outfitColor)

  for (let y = 0; y < tempCanvas.height; y++) {
    const localNormY = (y / tempCanvas.height) * 48
    for (let x = 0; x < tempCanvas.width; x++) {
      const idx = (y * tempCanvas.width + x) * 4
      if (data[idx + 3] > 20) {
        const c = recolorPixel(
          data[idx],
          data[idx + 1],
          data[idx + 2],
          localNormY,
          skinRgb,
          hairRgb,
          outfitRgb,
          config.outfitType
        )
        data[idx] = c.r
        data[idx + 1] = c.g
        data[idx + 2] = c.b
      }
    }
  }

  applyOutfitOverlayToFrame(
    tCtx,
    0,
    0,
    tempCanvas.width,
    tempCanvas.height,
    imgData,
    config.outfitType,
    outfitRgb
  )
  tCtx.putImageData(imgData, 0, 0)

  canvas.width = tempCanvas.width
  canvas.height = tempCanvas.height
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = false
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height)
}
