export const tileSize = 256
export const initialResolution = 2 * Math.PI * 6378137 / tileSize
export const originShift = 2 * Math.PI * 6378137 / 2.0

/**
 * LngLat [lng, lat]
 */
export type LngLat = [number, number]
/**
 * Meters [x, y]
 */
export type Meters = [number, number]
/**
 * Pixels [x, y, zoom]
 */
export type Pixels = [number, number, number]
/**
 * BBox extent in [minX, minY, maxX, maxY] order
 */
export type BBox = [number, number, number, number]
/**
 * Google [x, y, zoom]
 */
export type Google = [number, number, number]
/**
 * Tile [x, y, zoom]
 */
export type Tile = [number, number, number]
/**
 * Microsoft's Quadkey schema
 */
export type Quadkey = string
/**
 * GridLevel [tile_rows, tile_columns, zoom]
 */
export type GridLevel = [number[], number[], number]

/**
 * Hash for Map ID
 *
 * @param {Tile} tile [x, y, z]
 * @returns {number} hash
 * @example
 * const id = hash([312, 480, 4])
 * //=5728
 */
export function hash(tile: Tile): number {
  const [x, y, z] = tile
  return (1 << z) * ((1 << z) + x) + y
}

/**
 * Converts BBox to Center
 *
 * @param {BBox} bbox - [west, south, east, north] coordinates
 * @return {LngLat} center
 * @example
 * const center = bboxToCenter([90, -45, 85, -50])
 * //= [ 87.5, -47.5 ]
 */
export function bboxToCenter(bbox: BBox): LngLat {
  const [west, south, east, north] = bbox
  const lng = (west - east) / 2 + east
  const lat = (south - north) / 2 + north
  return [lng, lat]
}

/**
 * Converts {@link LngLat} coordinates to {@link Meters} coordinates.
 *
 * @param {LngLat} lnglat Longitude (Meridians) & Latitude (Parallels) in decimal degrees
 * @returns {Meters} Meters coordinates
 * @example
 * const meters = lngLatToMeters([126, 37])
 * //=[ 14026255.8, 4439106.7 ]
 */
export function lngLatToMeters(lnglat: LngLat): Meters {
  const [lng, lat] = validateLngLat(lnglat)
  let x: number = lng * originShift / 180.0
  let y: number = Math.log(Math.tan((90 + lat) * Math.PI / 360.0 )) / (Math.PI / 180.0)
  y = y * originShift / 180.0
  return [x, y]
}

/**
 * Converts {@link Meters} coordinates to {@link LngLat} coordinates.
 *
 * @param {Meters} meters Meters in Mercator [x, y]
 * @returns {LngLat} LngLat coordinates
 * @example
 * const lnglat = metersToLngLat([14026255, 4439106])
 * //=[ 126, 37 ]
 */
export function metersToLngLat(meters: Meters): LngLat {
  const [x, y] = validateMeters(meters)
  let lng = (x / originShift) * 180.0
  let lat = (y / originShift) * 180.0
  lat = 180 / Math.PI * (2 * Math.atan( Math.exp( lat * Math.PI / 180.0)) - Math.PI / 2.0)

  return [lng, lat]
}

/**
 * Converts {@link Meters} coordinates to {@link Pixels} coordinates.
 *
 * @param {Meters} meters Meters in Mercator [x, y]
 * @param {number} zoom Zoom level
 * @returns {Pixels} Pixels coordinates
 * @example
 * const pixels = metersToPixels([14026255, 4439106], 13)
 * //=[ 1782579.1, 1280877.3, 13 ]
 */
export function metersToPixels(meters: Meters, zoom: number): Pixels {
  const [x, y] = validateMeters(meters)
  const res = resolution(zoom)
  const px = (x + originShift) / res
  const py = (y + originShift) / res

  return [px, py, zoom]
}

/**
 * Converts {@link LngLat} coordinates to TMS {@link Tile}.
 *
 * @param {LngLat} lnglat Longitude (Meridians) & Latitude (Parallels) in decimal degrees
 * @param {number} zoom Zoom level
 * @returns {Tile} TMS Tile
 * @example
 * const tile = lngLatToTile([126, 37], 13)
 * //=[ 6963, 5003, 13 ]
 */
export function lngLatToTile(lnglat: LngLat, zoom: number): Tile {
  const meters = lngLatToMeters(validateLngLat(lnglat))
  const pixels = metersToPixels(meters, zoom)
  return pixelsToTile(pixels)
}

/**
 * Converts {@link LngLat} coordinates to {@link Google} (XYZ) Tile.
 *
 * @param {LngLat} lnglat Longitude (Meridians) & Latitude (Parallels) in decimal degrees
 * @param {number} zoom Zoom level
 * @returns {Google} Google (XYZ) Tile
 * @example
 * const google = lngLatToGoogle([126, 37], 13)
 * //=[ 6963, 3188, 13 ]
 */
export function lngLatToGoogle(lnglat: LngLat, zoom: number): Google {
  if (zoom === 0) { return [0, 0, 0] }
  const tile = lngLatToTile(validateLngLat(lnglat), zoom)
  return tileToGoogle(tile)
}

/**
 * Converts {@link Meters} coordinates to TMS {@link Tile}.
 *
 * @param {Meters} meters Meters in Mercator [x, y]
 * @param {number} zoom Zoom level
 * @returns {Tile} TMS Tile
 * @example
 * const tile = metersToTile([14026255, 4439106], 13)
 * //=[ 6963, 5003, 13 ]
 */
export function metersToTile(meters: Meters, zoom: number): Tile {
  if (zoom === 0) { return [0, 0, 0] }
  const pixels = metersToPixels(validateMeters(meters), zoom)
  return pixelsToTile(pixels)
}

/**
 * Converts {@link Pixels} coordinates to {@link Meters} coordinates.
 *
 * @param {Pixels} pixels Pixels [x, y, zoom]
 * @returns {Meters} Meters coordinates
 * @example
 * const meters = pixelsToMeters([1782579, 1280877, 13])
 * //=[ 14026252.0, 4439099.5 ]
 */
export function pixelsToMeters(pixels: Pixels): Meters {
  const [px, py, zoom] = validatePixels(pixels)
  const res = resolution(zoom)
  const mx = px * res - originShift
  const my = py * res - originShift

  return [mx, my]
}

/**
 * Converts {@link Pixels} coordinates to TMS {@link Tile}.
 *
 * @param {Pixels} pixels Pixels [x, y, zoom]
 * @returns {Tile} TMS Tile
 * @example
 * const tile = pixelsToTile([1782579, 1280877, 13])
 * //=[ 6963, 5003, 13 ]
 */
export function pixelsToTile(pixels: Pixels): Tile {
  const [px, py, zoom] = validatePixels(pixels)
  if (zoom === 0) { return [0, 0, 0] }
  let tx = Math.ceil(px / tileSize) - 1
  let ty = Math.ceil(py / tileSize) - 1
  if (tx < 0) { tx = 0 }
  if (ty < 0) { ty = 0 }
  return [tx, ty, zoom]
}

/**
 * Converts TMS {@link Tile} to {@link bbox} in {@link Meters} coordinates.
 *
 * @param {Tile} tile Tile [x, y, zoom]
 * @param {number} x TMS Tile X
 * @param {number} y TMS Tile Y
 * @param {number} zoom Zoom level
 * @returns {BBox} bbox extent in [minX, minY, maxX, maxY] order
 * @example
 * const bbox = tileToBBoxMeters([6963, 5003, 13])
 * //=[ 14025277.4, 4437016.6, 14030169.4, 4441908.5 ]
 */
export function tileToBBoxMeters(tile: Tile): BBox {
  const [tx, ty, zoom] = validateTile(tile)
  let min = pixelsToMeters([tx * tileSize, ty * tileSize, zoom])
  let max = pixelsToMeters([(tx + 1) * tileSize, (ty + 1) * tileSize, zoom])

  return [min[0], min[1], max[0], max[1]]
}

/**
 * Converts TMS {@link Tile} to {@link bbox} in {@link LngLat} coordinates.
 *
 * @param {Tile} tile Tile [x, y, zoom]
 * @param {number} x TMS Tile X
 * @param {number} y TMS Tile Y
 * @param {number} zoom Zoom level
 * @returns {BBox} bbox extent in [minX, minY, maxX, maxY] order
 * @example
 * const bbox = tileToBBox([6963, 5003, 13])
 * //=[ 125.991, 36.985, 126.035, 37.020 ]
 */
export function tileToBBox(tile: Tile): BBox {
  const [tx, ty, zoom] = validateTile(tile)
  if (zoom === 0) { return [ -180, -85.05112877980659, 180, 85.05112877980659 ] }

  const [mx1, my1, mx2, my2] = tileToBBoxMeters([tx, ty, zoom])
  const min = metersToLngLat([mx1, my1, zoom])
  const max = metersToLngLat([mx2, my2, zoom])

  return [min[0], min[1], max[0], max[1]]
}

/**
 * Converts {@link Google} (XYZ) Tile to {@link bbox} in {@link Meters} coordinates.
 *
 * @param {Google} google Google [x, y, zoom]
 * @returns {BBox} bbox extent in [minX, minY, maxX, maxY] order
 * @example
 * const bbox = googleToBBoxMeters([6963, 3188, 13])
 * //=[ 14025277.4, 4437016.6, 14030169.4, 4441908.5 ]
 */
export function googleToBBoxMeters(google: Google): BBox {
  const Tile = googleToTile(google)
  return tileToBBoxMeters(Tile)
}

/**
 * Converts {@link Google} (XYZ) Tile to {@link bbox} in {@link LngLat} coordinates.
 *
 * @param {Google} google Google [x, y, zoom]
 * @returns {BBox} bbox extent in [minX, minY, maxX, maxY] order
 * @example
 * const bbox = googleToBBox([6963, 3188, 13])
 * //=[ 125.991, 36.985, 126.035, 37.020 ]
 */
export function googleToBBox(google: Google): BBox {
  const Tile = googleToTile(google)
  return tileToBBox(Tile)
}

/**
 * Converts TMS {@link Tile} to {@link Google} (XYZ) Tile.
 *
 * @param {Tile} tile Tile [x, y, zoom]
 * @returns {Google} Google (XYZ) Tile
 * @example
 * const google = tileToGoogle([6963, 5003, 13])
 * //=[ 6963, 3188, 13 ]
 */
export function tileToGoogle(tile: Tile): Google {
  const [tx, ty, zoom] = validateTile(tile)
  if (zoom === 0) { return [0, 0, 0] }

  const x = tx
  const y = (Math.pow(2, zoom) - 1) - ty

  return [x, y, zoom]
}

/**
 * Converts {@link Google} (XYZ) Tile to TMS {@link Tile}.
 *
 * @param {Google} google Google [x, y, zoom]
 * @returns {Tile} TMS Tile
 * @example
 * const tile = googleToTile([6963, 3188, 13])
 * //=[ 6963, 5003, 13 ]
 */
export function googleToTile(google: Google): Tile {
  const [x, y, zoom] = google
  const tx = x
  const ty = Math.pow(2, zoom) - y - 1

  return [tx, ty, zoom]
}

/**
 * Converts {@link Google} (XYZ) Tile to {@link Quadkey}.
 *
 * @param {Google} google Google [x, y, zoom]
 * @returns {string} Microsoft's Quadkey schema
 * @example
 * const quadkey = googleToQuadkey([6963, 3188, 13])
 * //='1321102330211'
 */
export function googleToQuadkey(google: Google): string {
  const Tile = googleToTile(google)
  return tileToQuadkey(Tile)
}

/**
 * Converts TMS {@link Tile} to {@link QuadKey}.
 *
 * @param {Tile} tile Tile [x, y, zoom]
 * @returns {string} Microsoft's Quadkey schema
 * @example
 * const quadkey = tileToQuadkey([6963, 5003, 13])
 * //='1321102330211'
 */
export function tileToQuadkey(tile: Tile): string {
  let [tx, ty, zoom] = validateTile(tile)
  // Zoom 0 does not exist for Quadkey
  if (zoom === 0) { return '' }

  let quadkey = ''

  ty = (Math.pow(2, zoom) - 1) - ty
  range(zoom, 0, -1).map(i => {
    let digit: any = 0
    let mask = 1 << (i - 1)
    if ((tx & mask) !== 0) { digit += 1 }
    if ((ty & mask) !== 0) { digit += 2 }
    quadkey = quadkey.concat(digit)
  })

  return quadkey
}

/**
 * Converts {@link Quadkey} to TMS {@link Tile}.
 *
 * @param {string} quadkey Microsoft's Quadkey schema
 * @returns {Tile} TMS Tile
 * @example
 * const tile = quadkeyToTile('1321102330211')
 * //=[ 6963, 5003, 13 ]
 */
export function quadkeyToTile(quadkey: string): Tile {
  const Google = quadkeyToGoogle(quadkey)
  return googleToTile(Google)
}

/**
 * Converts {@link Quadkey} to {@link Google} (XYZ) Tile.
 *
 * @param {string} quadkey Microsoft's Quadkey schema
 * @returns {Google} Google (XYZ) Tile
 * @example
 * const google = quadkeyToGoogle('1321102330211')
 * //=[ 6963, 3188, 13 ]
 */
export function quadkeyToGoogle(quadkey: string): Google {
  let x: number = 0
  let y: number = 0
  const zoom = quadkey.length

  range(zoom, 0, -1).map(i => {
    let mask = 1 << (i - 1)

    switch (parseInt(quadkey[zoom - i], 0)) {
    case 0:
      break
    case 1:
      x += mask
      break
    case 2:
      y += mask
      break
    case 3:
      x += mask
      y += mask
      break
    default:
      throw new Error('Invalid Quadkey digit sequence')
    }
  })
  return [x, y, zoom]
}

/**
 * Converts {@link BBox} from {@link LngLat} coordinates to {@link Meters} coordinates
 *
 * @param {BBox} bbox extent in [minX, minY, maxX, maxY] order
 * @returns {BBox} bbox extent in [minX, minY, maxX, maxY] order
 * @example
 * const meters = bboxToMeters([ 125, 35, 127, 37 ])
 * //=[ 13914936.3, 4163881.1, 14137575.3, 4439106.7 ]
 */
export function bboxToMeters(bbox: BBox): BBox {
  const min = lngLatToMeters([bbox[0], bbox[1]])
  const max = lngLatToMeters([bbox[2], bbox[3]])
  return [min[0], min[1], max[0], max[1]]
}

/**
 * Creates an Iterator of Tiles from a given BBox
 *
 * @param {BBox} bbox extent in [minX, minY, maxX, maxY] order
 * @param {number} minZoom Minimum Zoom
 * @param {number} maxZoom Maximum Zoom
 * @returns {Iterator<Tile>} Iterable Tiles from BBox
 * @example
 * const iterable = grid([-180.0, -90.0, 180, 90], 3, 8)
 * const {value, done} = iterable.next()
 * //=value
 * //=done
 */
export function * grid(bbox: BBox, minZoom: number, maxZoom: number): Iterator<Tile> {
  for (const [tile_columns, tile_rows, zoom] of gridLevels(bbox, minZoom, maxZoom)) {
    for (const tile_row of tile_rows) {
      for (const tile_column of tile_columns) {
        yield [tile_column, tile_row, zoom]
      }
    }
  }
}

/**
 * Creates a bulk Iterator of Tiles from a given BBox
 *
 * @param {BBox} bbox extent in [minX, minY, maxX, maxY] order
 * @param {number} minZoom Minimum Zoom
 * @param {number} maxZoom Maximum Zoom
 * @param {number} size Maximum size for bulk Tiles
 * @returns {Iterator<Tile[]>} Bulk iterable Tiles from BBox
 * @example
 * const grid = gridBulk([-180.0, -90.0, 180, 90], 3, 8, 5000)
 * const {value, done} = grid.next()
 * //=value
 * //=done
 */
export function * gridBulk(bbox: BBox, minZoom: number, maxZoom: number, size: number): Iterator<Tile[]> {
  const iterable = grid(bbox, minZoom, maxZoom)
  let container: Tile[] = []
  let i = 0
  while (true) {
    i ++
    const { value, done } = iterable.next()
    if (value) { container.push(value) }
    if (i % size === 0) {
      yield container
      container = []
    }
    if (done) {
      yield container
      break
    }
  }
}

/**
 * Creates a grid level pattern of arrays
 *
 * @param {BBox} bbox extent in [minX, minY, maxX, maxY] order
 * @param {number} minZoom Minimum Zoom
 * @param {number} maxZoom Maximum Zoom
 * @returns {GridLevel[]} Grid Level
 * @example
 * const levels = gridLevels([-180.0, -90.0, 180, 90], 3, 8)
 * //=levels
 */
export function gridLevels(bbox: BBox, minZoom: number, maxZoom: number): GridLevel[] {
  const levels: GridLevel[] = []
  for (let zoom of range(minZoom, maxZoom + 1)) {
    let [x1, y1, x2, y2] = bbox
    let t1 = lngLatToTile([x1, y1], zoom)
    let t2 = lngLatToTile([x2, y2], zoom)
    let minty = Math.min(t1[1], t2[1])
    let maxty = Math.max(t1[1], t2[1])
    let mintx = Math.min(t1[0], t2[0])
    let maxtx = Math.max(t1[0], t2[0])
    const tile_rows: number[] = range(minty, maxty + 1)
    const tile_columns: number[] = range(mintx, maxtx + 1)
    levels.push([tile_columns, tile_rows, zoom])
  }
  return levels
}

/**
 * Counts the total amount of tiles from a given BBox
 *
 * @param {BBox} bbox extent in [minX, minY, maxX, maxY] order
 * @param {number} minZoom Minimum Zoom
 * @param {number} maxZoom Maximum Zoom
 * @returns {number} Total tiles from BBox
 * @example
 * const count = gridCount([-180.0, -90.0, 180, 90], 3, 8)
 * //=563136
 */
export function gridCount(bbox: BBox, minZoom: number, maxZoom: number): number {
  let count = 0
  for (const [tile_columns, tile_rows] of gridLevels(bbox, minZoom, maxZoom)) {
    count += tile_rows.length * tile_columns.length
  }
  return count
}

/**
 * Validates TMS {@link Tile}.
 *
 * @param {Tile} tile Tile [x, y, zoom]
 * @throws {Error} Will throw an error if TMS Tile is not valid.
 * @returns {Tile} TMS Tile
 * @example
 * validateTile([60, 80, 12])
 * //=[60, 80, 12]
 * validateTile([60, -43, 5])
 * //= Error: Tile <y> must not be less than 0
 * validateTile([25, 60, 3])
 * //= Error: Illegal parameters for tile
 */
export function validateTile(tile: Tile): Tile {
  const [tx, ty, zoom] = tile
  validateZoom(zoom)
  if (tx < 0) {
    const message = '<x> must not be less than 0'
    throw new Error(message)
  } else if (ty < 0) {
    const message = '<y> must not be less than 0'
    throw new Error(message)
  }
  const maxCount = Math.pow(2, zoom)
  if (tx >= maxCount || ty >= maxCount) {
    throw new Error('Illegal parameters for tile')
  }
  return tile
}

/**
 * Validates {@link Zoom} level.
 *
 * @param {number} zoom Zoom level
 * @throws {Error} Will throw an error if zoom is not valid.
 * @returns {number} zoom Zoom level
 * @example
 * mercator.validateZoom(12)
 * //=12
 * mercator.validateZoom(-4)
 * //= Error: <zoom> cannot be less than 0
 * validateZoom(32)
 * //= Error: <zoom> cannot be greater than 30
 */
export function validateZoom(zoom: number) {
  if (zoom < 0) {
    const message = '<zoom> cannot be less than 0'
    throw new Error(message)
  } else if (zoom > 30) {
    const message = '<zoom> cannot be greater than 30'
    throw new Error(message)
  }
  return zoom
}

/**
 * Validates {@link Meters} coordinates.
 *
 * @param {Meters} meters Meters in Mercator [x, y]
 * @throws {Error} Will throw an error if Meters is not valid.
 * @returns {number[]} Meters coordinates
 * @example
 * validateMeters([-115, 44])
 * //= [ -115, 44 ]
 * validateMeters([-230, 999000000])
 * //= Error: Meters [y] cannot be greater than 20037508.342789244
 */
export function validateMeters(meters: Meters): Meters {
  const [mx, my] = meters
  // const max = 20037508.342789244
  // const min = -20037508.342789244
  // if (my > max) {
  //   const message = `Meters [y] cannot be greater than ${ max }`
  //   throw new Error(message)
  // }
  // if (my < min) {
  //   const message = `Meters [y] cannot be less than ${ min }`
  //   throw new Error(message)
  // }
  // if (mx > max) {
  //   const message = `Meters [x] cannot be greater than ${ max }`
  //   throw new Error(message)
  // }
  // if (mx < min) {
  //   const message = `Meters [x] cannot be less than ${ min }`
  //   throw new Error(message)
  // }
  return [mx, my]
}

/**
 * Validates {@link LngLat} coordinates.
 *
 * @param {LngLat} lnglat Longitude (Meridians) & Latitude (Parallels) in decimal degrees
 * @throws {Error} Will throw an error if LngLat is not valid.
 * @returns {LngLat} LngLat coordinates
 * @example
 * validateLngLat([-115, 44])
 * //= [ -115, 44 ]
 * validateLngLat([-225, 44])
 * //= Error: LngLat [lng] must be within -180 to 180 degrees
 */
export function validateLngLat(lnglat: LngLat): LngLat {
  const [lng, lat] = lnglat
  if (lat < -90 || lat > 90) {
    const message = 'LngLat [lat] must be within -90 to 90 degrees'
    throw new Error(message)
  } else if (lng < -180 || lng > 180) {
    const message = 'LngLat [lng] must be within -180 to 180 degrees'
    throw new Error(message)
  }
  return [lng, lat]
}

/**
 * Validates {@link Pixels} coordinates.
 *
 * @param {Pixels} pixels Pixels [x, y, zoom]
 * @param {number} x Pixels X
 * @param {number} y Pixels Y
 * @param {number} [zoom] Zoom level
 * @throws {Error} Will throw an error if Pixels is not valid.
 * @returns {Pixels} Pixels coordinates
 * @example
 * validatePixels([-115, 44])
 */
export function validatePixels(pixels: Pixels): Pixels {
  // TODO
  return pixels
}

/**
 * Retrieve resolution based on zoom level
 *
 * @private
 * @param {number} zoom zoom level
 * @returns {number} resolution
 * @example
 * const res = resolution(13)
 * //=19.109257071294063
 */
export function resolution(zoom: number): number {
  return initialResolution / Math.pow(2, zoom)
}

/**
 * Generate an integer Array containing an arithmetic progression.
 *
 * @private
 * @param {number} [start=0] Start
 * @param {number} stop Stop
 * @param {number} [step=1] Step
 * @returns {Array<number>} range
 * @example
 * range(3)
 * //=[ 0, 1, 2 ]
 * range(3, 6)
 * //=[ 3, 4, 5 ]
 * range(6, 3, -1)
 * //=[ 6, 5, 4 ]
 */
export function range(start: number, stop?: number, step?: number) {
  if (stop == null) {
    stop = start || 0
    start = 0
  }
  if (!step) {
    step = stop < start ? -1 : 1
  }

  const length = Math.max(Math.ceil((stop - start) / step), 0)
  const range = Array(length)

  for (let idx = 0; idx < length; idx++, start += step) {
    range[idx] = start
  }
  return range
}
