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

  // Giữ nguyên viền đen mắt/miệng trên khuôn mặt (localY <= 25)
  if (l < 0.08 && localY <= 25) {
    return { r, g, b }
  }

  // Giữ viền nét cực tối viền ngoài sprite
  if (l < 0.04) {
    return { r, g, b }
  }

  // Tông màu da gốc: Chỉ xuất hiện từ hàng 14 trở xuống, có độ sáng cao (L >= 0.60)
  // (Tránh nhầm lẫn với tóc vàng/nâu của Ash và Lucy có L từ 0.40 đến 0.58)
  const isSkinTone =
    localY >= 14 && h >= 10 && h <= 45 && s >= 0.22 && l >= 0.60 && r > g && g > b

  // Vùng tóc kéo dài xuống hàng 28 (đặc biệt tóc dài của Lucy, Nancy và góc nhìn từ sau lưng)
  const isHairBelow =
    localY <= 28 &&
    ((h >= 15 && h <= 35 && s >= 0.22 && l < 0.60 && r > g && g > b) || // Tóc nâu/vàng của Ash & Lucy
      (h >= 10 && h <= 20 && s >= 0.20 && l < 0.50 && r > g && g > b) || // Tóc nâu đỏ của Nancy
      (h >= 55 && h <= 95 && l < 0.55) || // Tóc rêu/xanh của Adam
      (h >= 220 && h <= 250 && s < 0.20 && l >= 0.25 && l <= 0.45)) // Viền/bóng tóc xanh tối

  if (localY <= 25 || isHairBelow) {
    if (isSkinTone) {
      const shade = Math.min(1.25, Math.max(0.65, l / 0.72))
      return {
        r: Math.min(255, Math.round(skinRgb.r * shade)),
        g: Math.min(255, Math.round(skinRgb.g * shade)),
        b: Math.min(255, Math.round(skinRgb.b * shade)),
      }
    } else {
      // Sửa lỗi đổi màu tóc: Đổi màu TOÀN BỘ BỘ TÓC (cả lõi tóc, bóng đổ và highlight)
      // Ánh xạ mốc midtone tóc gốc (~0.36) làm mốc 1.0 để hiển thị chuẩn 100% màu tóc người dùng chọn
      const hairNorm = (l - 0.20) / 0.26
      const hairShade = Math.min(1.25, Math.max(0.75, 0.75 + hairNorm * 0.45))
      return {
        r: Math.min(255, Math.round(hairRgb.r * hairShade)),
        g: Math.min(255, Math.round(hairRgb.g * hairShade)),
        b: Math.min(255, Math.round(hairRgb.b * hairShade)),
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

    // Xử lý kiểu trang phục: Casual (bình thường) hoặc Worker (đồ vest)
    const shade = Math.min(1.25, Math.max(0.45, l / 0.5))

    if (outfitType === 'worker' || outfitType === 'suit') {
      // ĐỒ VEST CÔNG SỞ (WORKER SUIT): Thiết kế phẳng phiu, lịch lãm, tự nhiên chuẩn pixel art
      if (localY <= 35) {
        // Áo vest blazer:
        // Ở vùng ngực trước (localY 25..28), các pixel sáng là cổ áo sơ mi trắng ngà tinh tế
        const isShirtArea = localY >= 25 && localY <= 28 && l >= 0.52 && s < 0.40
        if (isShirtArea) {
          const shirtShade = Math.min(1.1, Math.max(0.75, l / 0.6))
          return {
            r: Math.min(255, Math.round(238 * shirtShade)),
            g: Math.min(255, Math.round(242 * shirtShade)),
            b: Math.min(255, Math.round(250 * shirtShade)),
          }
        }

        // Toàn bộ thân áo vest: Vải âu cao cấp đồng màu theo outfitRgb
        const vestShade = Math.min(1.15, Math.max(0.48, l / 0.52))
        return {
          r: Math.min(255, Math.round(outfitRgb.r * vestShade * 0.95)),
          g: Math.min(255, Math.round(outfitRgb.g * vestShade * 0.95)),
          b: Math.min(255, Math.round(outfitRgb.b * vestShade * 0.95)),
        }
      } else if (localY === 36) {
        // Thắt lưng da công sở (Leather belt) thanh lịch
        const beltShade = Math.min(1.2, Math.max(0.6, l / 0.45))
        return {
          r: Math.min(255, Math.round(32 * beltShade)),
          g: Math.min(255, Math.round(34 * beltShade)),
          b: Math.min(255, Math.round(42 * beltShade)),
        }
      } else if (localY <= 42) {
        // Quần âu / Quần tây công sở đồng bộ comple (Dress Trousers)
        const pantShade = Math.min(1.1, Math.max(0.45, l / 0.48))
        return {
          r: Math.min(255, Math.round(outfitRgb.r * pantShade * 0.82)),
          g: Math.min(255, Math.round(outfitRgb.g * pantShade * 0.82)),
          b: Math.min(255, Math.round(outfitRgb.b * pantShade * 0.82)),
        }
      }
      return { r, g, b }
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
 * Xử lý thêm chi tiết trang phục nếu cần (hiện tại Worker & Casual đã được tô màu chuẩn tỉ lệ trong recolorPixel)
 */
function applyOutfitOverlayToFrame(
  _ctx: CanvasRenderingContext2D,
  _frameX: number,
  _frameY: number,
  _frameW: number,
  _frameH: number,
  _imgData: ImageData,
  _outfitType: OutfitType,
  _outfitRgb: RGB
) {
  // Không vẽ đè tọa độ tĩnh để bảo vệ độ tự nhiên và xoay 4 hướng của nhân vật
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
