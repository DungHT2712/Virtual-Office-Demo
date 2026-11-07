import Phaser from 'phaser'

export interface GridPoint {
  x: number
  y: number
}

interface AStarNode {
  x: number
  y: number
  g: number
  h: number
  f: number
  parent: AStarNode | null
}

export class Pathfinder {
  private grid: boolean[][] = []
  private width = 0
  private height = 0
  private tileWidth = 32
  private tileHeight = 32

  constructor(
    map: Phaser.Tilemaps.Tilemap,
    groundLayer: Phaser.Tilemaps.TilemapLayer,
    obstacleGroups: Phaser.Physics.Arcade.StaticGroup[]
  ) {
    this.width = map.width
    this.height = map.height
    this.tileWidth = map.tileWidth
    this.tileHeight = map.tileHeight
    this.buildCollisionGrid(groundLayer, obstacleGroups)
  }

  /**
   * Quét toàn bộ Tilemap và các StaticGroup vật cản để đánh dấu ô đi được (true) hoặc bị chặn (false)
   */
  private buildCollisionGrid(
    groundLayer: Phaser.Tilemaps.TilemapLayer,
    obstacleGroups: Phaser.Physics.Arcade.StaticGroup[]
  ) {
    this.grid = Array.from({ length: this.height }, () =>
      Array.from({ length: this.width }, () => true)
    )

    // 1. Kiểm tra thuộc tính collides trên Ground Layer
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tile = groundLayer.getTileAt(x, y)
        if (tile && (tile.properties?.collides || tile.collides)) {
          this.grid[y][x] = false
        }
      }
    }

    // 2. Kiểm tra bounding box của tất cả các vật cản tĩnh (Tường, Bàn, Tủ, Máy bán nước...)
    for (const group of obstacleGroups) {
      if (!group) continue
      const children = group.getChildren()
      for (const child of children) {
        const sprite = child as Phaser.Types.Physics.Arcade.SpriteWithStaticBody
        if (!sprite.body) continue

        const body = sprite.body
        const startTileX = Math.max(0, Math.floor((body.x + 2) / this.tileWidth))
        const endTileX = Math.min(
          this.width - 1,
          Math.floor((body.x + body.width - 2) / this.tileWidth)
        )
        const startTileY = Math.max(0, Math.floor((body.y + 2) / this.tileHeight))
        const endTileY = Math.min(
          this.height - 1,
          Math.floor((body.y + body.height - 2) / this.tileHeight)
        )

        for (let ty = startTileY; ty <= endTileY; ty++) {
          for (let tx = startTileX; tx <= endTileX; tx++) {
            this.grid[ty][tx] = false
          }
        }
      }
    }
  }

  public worldToTile(worldX: number, worldY: number): GridPoint {
    return {
      x: Phaser.Math.Clamp(Math.floor(worldX / this.tileWidth), 0, this.width - 1),
      y: Phaser.Math.Clamp(Math.floor(worldY / this.tileHeight), 0, this.height - 1),
    }
  }

  public tileToWorldCenter(tileX: number, tileY: number): GridPoint {
    return {
      x: tileX * this.tileWidth + this.tileWidth / 2,
      y: tileY * this.tileHeight + this.tileHeight / 2,
    }
  }

  public isWalkable(tx: number, ty: number): boolean {
    if (tx < 0 || tx >= this.width || ty < 0 || ty >= this.height) return false
    return this.grid[ty][tx]
  }

  /**
   * Nếu người dùng click trúng ô có vật cản, tìm ô trống gần nhất bằng BFS
   */
  public findNearestWalkableTile(target: GridPoint, origin: GridPoint): GridPoint | null {
    if (this.isWalkable(target.x, target.y)) return target

    const visited = new Set<string>()
    const queue: GridPoint[] = [target]
    visited.add(`${target.x},${target.y}`)

    const dirs = [
      { dx: 0, dy: -1 },
      { dx: 1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: -1, dy: -1 },
      { dx: 1, dy: -1 },
      { dx: -1, dy: 1 },
      { dx: 1, dy: 1 },
    ]

    let bestCandidate: GridPoint | null = null
    let bestDistToOrigin = Infinity
    let foundRadius = -1
    let currentDepth = 0

    while (queue.length > 0 && currentDepth < 15) {
      const levelSize = queue.length
      for (let i = 0; i < levelSize; i++) {
        const curr = queue.shift()!
        if (this.isWalkable(curr.x, curr.y)) {
          const dist = Math.hypot(curr.x - origin.x, curr.y - origin.y)
          if (dist < bestDistToOrigin) {
            bestDistToOrigin = dist
            bestCandidate = curr
            foundRadius = currentDepth
          }
        }

        if (foundRadius !== -1) continue

        for (const d of dirs) {
          const nx = curr.x + d.dx
          const ny = curr.y + d.dy
          const key = `${nx},${ny}`
          if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height && !visited.has(key)) {
            visited.add(key)
            queue.push({ x: nx, y: ny })
          }
        }
      }
      if (bestCandidate) return bestCandidate
      currentDepth++
    }

    return null
  }

  /**
   * Tìm đường đi ngắn nhất từ tọa độ thực (startWorld) tới điểm click chuột (targetWorld) bằng A*
   */
  public findPath(startWorldX: number, startWorldY: number, targetWorldX: number, targetWorldY: number): GridPoint[] {
    const startTile = this.worldToTile(startWorldX, startWorldY)
    const rawTargetTile = this.worldToTile(targetWorldX, targetWorldY)

    // Đảm bảo điểm xuất phát và điểm đích đều hợp lệ
    const validStart = this.findNearestWalkableTile(startTile, startTile) || startTile
    const validTarget = this.findNearestWalkableTile(rawTargetTile, validStart)
    if (!validTarget) return []

    if (validStart.x === validTarget.x && validStart.y === validTarget.y) {
      const dist = Math.hypot(targetWorldX - startWorldX, targetWorldY - startWorldY)
      if (dist > 8 && this.isWalkable(rawTargetTile.x, rawTargetTile.y)) {
        return [{ x: targetWorldX, y: targetWorldY }]
      }
      return []
    }

    const openList: AStarNode[] = []
    const closedSet = new Set<string>()

    const startNode: AStarNode = {
      x: validStart.x,
      y: validStart.y,
      g: 0,
      h: Math.hypot(validTarget.x - validStart.x, validTarget.y - validStart.y),
      f: 0,
      parent: null,
    }
    startNode.f = startNode.g + startNode.h
    openList.push(startNode)

    // 8 hướng di chuyển (kèm kiểm tra chống cắt góc xuyên tường)
    const neighbors = [
      { dx: 0, dy: -1, cost: 1 },
      { dx: 1, dy: 0, cost: 1 },
      { dx: 0, dy: 1, cost: 1 },
      { dx: -1, dy: 0, cost: 1 },
      { dx: -1, dy: -1, cost: Math.SQRT2 },
      { dx: 1, dy: -1, cost: Math.SQRT2 },
      { dx: -1, dy: 1, cost: Math.SQRT2 },
      { dx: 1, dy: 1, cost: Math.SQRT2 },
    ]

    while (openList.length > 0) {
      openList.sort((a, b) => a.f - b.f)
      const current = openList.shift()!
      const cKey = `${current.x},${current.y}`

      if (current.x === validTarget.x && current.y === validTarget.y) {
        const path: GridPoint[] = []
        let curr: AStarNode | null = current
        while (curr && (curr.x !== validStart.x || curr.y !== validStart.y)) {
          path.unshift(this.tileToWorldCenter(curr.x, curr.y))
          curr = curr.parent
        }
        if (path.length > 0 && this.isWalkable(rawTargetTile.x, rawTargetTile.y)) {
          path[path.length - 1] = { x: targetWorldX, y: targetWorldY }
        }
        return path
      }

      closedSet.add(cKey)

      for (const dir of neighbors) {
        const nx = current.x + dir.dx
        const ny = current.y + dir.dy
        const nKey = `${nx},${ny}`

        if (!this.isWalkable(nx, ny) || closedSet.has(nKey)) continue

        // Chống cắt góc chéo khi 1 trong 2 ô kề cạnh bị chặn bởi vật cản
        if (dir.dx !== 0 && dir.dy !== 0) {
          if (!this.isWalkable(current.x + dir.dx, current.y) || !this.isWalkable(current.x, current.y + dir.dy)) {
            continue
          }
        }

        const tentativeG = current.g + dir.cost
        const existingNode = openList.find((n) => n.x === nx && n.y === ny)

        if (!existingNode) {
          const h = Math.hypot(validTarget.x - nx, validTarget.y - ny)
          openList.push({
            x: nx,
            y: ny,
            g: tentativeG,
            h,
            f: tentativeG + h,
            parent: current,
          })
        } else if (tentativeG < existingNode.g) {
          existingNode.g = tentativeG
          existingNode.f = tentativeG + existingNode.h
          existingNode.parent = current
        }
      }
    }

    return []
  }
}
