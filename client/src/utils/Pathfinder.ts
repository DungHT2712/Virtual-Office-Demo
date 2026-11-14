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
        if (!sprite.body || !sprite.body.enable || !sprite.visible) continue

        const body = sprite.body
        // Ngưỡng lề (margin) 6px để tránh việc bounding box cọ mép làm chặn nhầm các lối đi hẹp lân cận
        const margin = 6
        const startTileX = Math.max(0, Math.floor((body.x + margin) / this.tileWidth))
        const endTileX = Math.min(
          this.width - 1,
          Math.floor((body.x + body.width - margin) / this.tileWidth)
        )
        const startTileY = Math.max(0, Math.floor((body.y + margin) / this.tileHeight))
        const endTileY = Math.min(
          this.height - 1,
          Math.floor((body.y + body.height - margin) / this.tileHeight)
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
   * Nếu người dùng click trúng ô có vật cản, tìm ô trống gần nhất bằng BFS (ưu tiên ô sát điểm click chuột)
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
    let bestDistToTarget = Infinity
    let currentDepth = 0

    while (queue.length > 0 && currentDepth < 15) {
      const levelSize = queue.length
      for (let i = 0; i < levelSize; i++) {
        const curr = queue.shift()!
        if (this.isWalkable(curr.x, curr.y)) {
          const dist = Math.hypot(curr.x - target.x, curr.y - target.y)
          if (dist < bestDistToTarget) {
            bestDistToTarget = dist
            bestCandidate = curr
          }
        }

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
   * Kiểm tra tầm nhìn thẳng giữa 2 ô tile xem có thông suốt không (Bresenham)
   */
  public hasLineOfSight(x0: number, y0: number, x1: number, y1: number): boolean {
    const dx = Math.abs(x1 - x0)
    const dy = Math.abs(y1 - y0)
    const sx = x0 < x1 ? 1 : -1
    const sy = y0 < y1 ? 1 : -1
    let err = dx - dy

    let currX = x0
    let currY = y0

    while (currX !== x1 || currY !== y1) {
      if (!this.isWalkable(currX, currY)) return false
      const e2 = 2 * err
      if (e2 > -dy) {
        err -= dy
        currX += sx
      }
      if (e2 < dx) {
        err += dx
        currY += sy
      }
    }
    return this.isWalkable(x1, y1)
  }

  /**
   * Làm mịn đường đi bằng cách rút ngắn các waypoint thẳng hàng không có vật cản
   */
  private smoothPath(nodes: GridPoint[]): GridPoint[] {
    if (nodes.length <= 2) return nodes
    const smoothed: GridPoint[] = [nodes[0]]
    let currIdx = 0

    while (currIdx < nodes.length - 1) {
      let farthest = currIdx + 1
      for (let next = nodes.length - 1; next > currIdx + 1; next--) {
        const p0 = this.worldToTile(nodes[currIdx].x, nodes[currIdx].y)
        const p1 = this.worldToTile(nodes[next].x, nodes[next].y)
        if (this.hasLineOfSight(p0.x, p0.y, p1.x, p1.y)) {
          farthest = next
          break
        }
      }
      smoothed.push(nodes[farthest])
      currIdx = farthest
    }
    return smoothed
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

    // 8 hướng di chuyển
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
        return this.smoothPath(path)
      }

      closedSet.add(cKey)

      for (const dir of neighbors) {
        const nx = current.x + dir.dx
        const ny = current.y + dir.dy
        const nKey = `${nx},${ny}`

        if (!this.isWalkable(nx, ny) || closedSet.has(nKey)) continue

        let stepCost = dir.cost
        // Chống cắt góc nhọn khi cả 2 ô kề cạnh đều bị chặn bởi vật cản
        if (dir.dx !== 0 && dir.dy !== 0) {
          const blockA = !this.isWalkable(current.x + dir.dx, current.y)
          const blockB = !this.isWalkable(current.x, current.y + dir.dy)
          if (blockA && blockB) {
            // Cắt góc giữa 2 bức tường kẹp nhau -> Cấm tuyệt đối
            continue
          } else if (blockA || blockB) {
            // 1 bên có tường: Tăng nhẹ chi phí để ưu tiên đi thẳng, nhưng vẫn cho phép đi qua khe hẹp
            stepCost = 2.2
          }
        }

        const tentativeG = current.g + stepCost
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
