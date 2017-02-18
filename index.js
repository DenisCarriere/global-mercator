const originShift = 2 * Math.PI * 6378137 / 2.0
function initialResolution (tileSize = 256) { return 2 * Math.PI * 6378137 / tileSize }

/**
 * Hash tile for unique id key
 *
 * @param {Tile} tile [x, y, z]
 * @returns {number} hash
 * @example
 * const id = hash([312, 480, 4])
 * //=5728
 */
export function hash (tile) {
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
export function bboxToCenter (bbox) {
  const [west, south, east, north] = bbox
  let lng = (west - east) / 2 + east
  let lat = (south - north) / 2 + north
  lng = Number(lng.toFixed(6))
  lat = Number(lat.toFixed(6))
  return [lng, lat]
}

/**
 * Converts LngLat coordinates to Meters coordinates.
 *
 * @param {LngLat} lnglat Longitude (Meridians) & Latitude (Parallels) in decimal degrees
 * @returns {Meters} Meters coordinates
 * @example
 * const meters = lngLatToMeters([126, 37])
 * //=[ 14026255.8, 4439106.7 ]
 */
export function lngLatToMeters (lnglat) {
  const [lng, lat] = validateLngLat(lnglat)
  let x = lng * originShift / 180.0
  let y = Math.log(Math.tan((90 + lat) * Math.PI / 360.0)) / (Math.PI / 180.0)
  y = y * originShift / 180.0
  x = Number(x.toFixed(1))
  y = Number(y.toFixed(1))
  return [x, y]
}

/**
 * Converts Meters coordinates to LngLat coordinates.
 *
 * @param {Meters} meters Meters in Mercator [x, y]
 * @returns {LngLat} LngLat coordinates
 * @example
 * const lnglat = metersToLngLat([14026255, 4439106])
 * //=[ 126, 37 ]
 */
export function metersToLngLat (meters) {
  const [x, y] = meters
  let lng = (x / originShift) * 180.0
  let lat = (y / originShift) * 180.0
  lat = 180 / Math.PI * (2 * Math.atan(Math.exp(lat * Math.PI / 180.0)) - Math.PI / 2.0)
  lng = Number(lng.toFixed(6))
  lat = Number(lat.toFixed(6))
  return [lng, lat]
}

/**
 * Converts Meters coordinates to Pixels coordinates.
 *
 * @param {Meters} meters Meters in Mercator [x, y]
 * @param {number} zoom Zoom level
 * @param {number} [tileSize=256] Tile size
 * @returns {Pixels} Pixels coordinates
 * @example
 * const pixels = metersToPixels([14026255, 4439106], 13)
 * //=[ 1782579.1, 1280877.3, 13 ]
 */
export function metersToPixels (meters, zoom, tileSize) {
  const [x, y] = meters
  const res = resolution(zoom, tileSize)
  const px = (x + originShift) / res
  const py = (y + originShift) / res
  return [px, py, zoom]
}

/**
 * Converts LngLat coordinates to TMS Tile.
 *
 * @param {LngLat} lnglat Longitude (Meridians) & Latitude (Parallels) in decimal degrees
 * @param {number} zoom Zoom level
 * @returns {Tile} TMS Tile
 * @example
 * const tile = lngLatToTile([126, 37], 13)
 * //=[ 6963, 5003, 13 ]
 */
export function lngLatToTile (lnglat, zoom) {
  const meters = lngLatToMeters(validateLngLat(lnglat))
  const pixels = metersToPixels(meters, zoom)
  return pixelsToTile(pixels)
}

/**
 * Converts LngLat coordinates to Google (XYZ) Tile.
 *
 * @param {LngLat} lnglat Longitude (Meridians) & Latitude (Parallels) in decimal degrees
 * @param {number} zoom Zoom level
 * @returns {Google} Google (XYZ) Tile
 * @example
 * const google = lngLatToGoogle([126, 37], 13)
 * //=[ 6963, 3188, 13 ]
 */
export function lngLatToGoogle (lnglat, zoom) {
  if (zoom === 0) {
    return [0, 0, 0]
  }
  const tile = lngLatToTile(validateLngLat(lnglat), zoom)
  return tileToGoogle(tile)
}

/**
 * Converts Meters coordinates to TMS Tile.
 *
 * @param {Meters} meters Meters in Mercator [x, y]
 * @param {number} zoom Zoom level
 * @returns {Tile} TMS Tile
 * @example
 * const tile = metersToTile([14026255, 4439106], 13)
 * //=[ 6963, 5003, 13 ]
 */
export function metersToTile (meters, zoom) {
  if (zoom === 0) {
    return [0, 0, 0]
  }
  const pixels = metersToPixels(meters, zoom)
  return pixelsToTile(pixels)
}

/**
 * Converts Pixels coordinates to Meters coordinates.
 *
 * @param {Pixels} pixels Pixels [x, y, zoom]
 * @param {number} [tileSize=256] Tile size
 * @returns {Meters} Meters coordinates
 * @example
 * const meters = pixelsToMeters([1782579, 1280877, 13])
 * //=[ 14026252.0, 4439099.5 ]
 */
export function pixelsToMeters (pixels, tileSize) {
  const [px, py, zoom] = validatePixels(pixels)
  const res = resolution(zoom, tileSize)
  let mx = px * res - originShift
  let my = py * res - originShift
  mx = Number(mx.toFixed(1))
  my = Number(my.toFixed(1))
  return [mx, my]
}

/**
 * Converts Pixels coordinates to TMS Tile.
 *
 * @param {Pixels} pixels Pixels [x, y, zoom]
 * @param {number} [tileSize=256] Tile size
 * @returns {Tile} TMS Tile
 * @example
 * const tile = pixelsToTile([1782579, 1280877, 13])
 * //=[ 6963, 5003, 13 ]
 */
export function pixelsToTile (pixels, tileSize = 256) {
  const [px, py, zoom] = validatePixels(pixels)
  if (zoom === 0) {
    return [0, 0, 0]
  }
  let tx = Math.ceil(px / tileSize) - 1
  let ty = Math.ceil(py / tileSize) - 1
  if (tx < 0) {
    tx = 0
  }
  if (ty < 0) {
    ty = 0
  }
  return [tx, ty, zoom]
}

/**
 * Converts TMS Tile to bbox in Meters coordinates.
 *
 * @param {Tile} tile Tile [x, y, zoom]
 * @param {number} x TMS Tile X
 * @param {number} y TMS Tile Y
 * @param {number} zoom Zoom level
 * @param {number} [tileSize=256] Tile size
 * @returns {BBox} bbox extent in [minX, minY, maxX, maxY] order
 * @example
 * const bbox = tileToBBoxMeters([6963, 5003, 13])
 * //=[ 14025277.4, 4437016.6, 14030169.4, 4441908.5 ]
 */
export function tileToBBoxMeters (tile, tileSize = 256) {
  const [tx, ty, zoom] = validateTile(tile)
  let min = pixelsToMeters([tx * tileSize, ty * tileSize, zoom])
  let max = pixelsToMeters([(tx + 1) * tileSize, (ty + 1) * tileSize, zoom])
  return [min[0], min[1], max[0], max[1]]
}

/**
 * Converts TMS Tile to bbox in LngLat coordinates.
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
export function tileToBBox (tile) {
  const [tx, ty, zoom] = validateTile(tile)
  if (zoom === 0) {
    return [-180, -85.051129, 180, 85.051129]
  }
  const [mx1, my1, mx2, my2] = tileToBBoxMeters([tx, ty, zoom])
  const min = metersToLngLat([mx1, my1, zoom])
  const max = metersToLngLat([mx2, my2, zoom])
  return [min[0], min[1], max[0], max[1]]
}

/**
 * Converts Google (XYZ) Tile to bbox in Meters coordinates.
 *
 * @param {Google} google Google [x, y, zoom]
 * @returns {BBox} bbox extent in [minX, minY, maxX, maxY] order
 * @example
 * const bbox = googleToBBoxMeters([6963, 3188, 13])
 * //=[ 14025277.4, 4437016.6, 14030169.4, 4441908.5 ]
 */
export function googleToBBoxMeters (google) {
  const Tile = googleToTile(google)
  return tileToBBoxMeters(Tile)
}

/**
 * Converts Google (XYZ) Tile to bbox in LngLat coordinates.
 *
 * @param {Google} google Google [x, y, zoom]
 * @returns {BBox} bbox extent in [minX, minY, maxX, maxY] order
 * @example
 * const bbox = googleToBBox([6963, 3188, 13])
 * //=[ 125.991, 36.985, 126.035, 37.020 ]
 */
export function googleToBBox (google) {
  const Tile = googleToTile(google)
  return tileToBBox(Tile)
}

/**
 * Converts TMS Tile to Google (XYZ) Tile.
 *
 * @param {Tile} tile Tile [x, y, zoom]
 * @returns {Google} Google (XYZ) Tile
 * @example
 * const google = tileToGoogle([6963, 5003, 13])
 * //=[ 6963, 3188, 13 ]
 */
export function tileToGoogle (tile) {
  const [tx, ty, zoom] = validateTile(tile)
  if (zoom === 0) {
    return [0, 0, 0]
  }
  const x = tx
  const y = (Math.pow(2, zoom) - 1) - ty
  return [x, y, zoom]
}

/**
 * Converts Google (XYZ) Tile to TMS Tile.
 *
 * @param {Google} google Google [x, y, zoom]
 * @returns {Tile} TMS Tile
 * @example
 * const tile = googleToTile([6963, 3188, 13])
 * //=[ 6963, 5003, 13 ]
 */
export function googleToTile (google) {
  const [x, y, zoom] = google
  const tx = x
  const ty = Math.pow(2, zoom) - y - 1
  return [tx, ty, zoom]
}

/**
 * Converts Google (XYZ) Tile to Quadkey.
 *
 * @param {Google} google Google [x, y, zoom]
 * @returns {string} Microsoft's Quadkey schema
 * @example
 * const quadkey = googleToQuadkey([6963, 3188, 13])
 * //='1321102330211'
 */
export function googleToQuadkey (google) {
  const Tile = googleToTile(google)
  return tileToQuadkey(Tile)
}

/**
 * Converts TMS Tile to QuadKey.
 *
 * @param {Tile} tile Tile [x, y, zoom]
 * @returns {string} Microsoft's Quadkey schema
 * @example
 * const quadkey = tileToQuadkey([6963, 5003, 13])
 * //='1321102330211'
 */
export function tileToQuadkey (tile) {
  let [tx, ty, zoom] = validateTile(tile)
  // Zoom 0 does not exist for Quadkey
  if (zoom === 0) {
    return ''
  }
  let quadkey = ''
  ty = (Math.pow(2, zoom) - 1) - ty
  range(zoom, 0, -1).map(i => {
    let digit = 0
    let mask = 1 << (i - 1)
    if ((tx & mask) !== 0) {
      digit += 1
    }
    if ((ty & mask) !== 0) {
      digit += 2
    }
    quadkey = quadkey.concat(digit)
  })
  return quadkey
}

/**
 * Converts Quadkey to TMS Tile.
 *
 * @param {string} quadkey Microsoft's Quadkey schema
 * @returns {Tile} TMS Tile
 * @example
 * const tile = quadkeyToTile('1321102330211')
 * //=[ 6963, 5003, 13 ]
 */
export function quadkeyToTile (quadkey) {
  const Google = quadkeyToGoogle(quadkey)
  return googleToTile(Google)
}

/**
 * Converts Quadkey to Google (XYZ) Tile.
 *
 * @param {string} quadkey Microsoft's Quadkey schema
 * @returns {Google} Google (XYZ) Tile
 * @example
 * const google = quadkeyToGoogle('1321102330211')
 * //=[ 6963, 3188, 13 ]
 */
export function quadkeyToGoogle (quadkey) {
  let x = 0
  let y = 0
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
 * Converts BBox from LngLat coordinates to Meters coordinates
 *
 * @param {BBox} bbox extent in [minX, minY, maxX, maxY] order
 * @returns {BBox} bbox extent in [minX, minY, maxX, maxY] order
 * @example
 * const meters = bboxToMeters([ 125, 35, 127, 37 ])
 * //=[ 13914936.3, 4163881.1, 14137575.3, 4439106.7 ]
 */
export function bboxToMeters (bbox) {
  const min = lngLatToMeters([bbox[0], bbox[1]])
  const max = lngLatToMeters([bbox[2], bbox[3]])
  return [min[0], min[1], max[0], max[1]]
}

/**
 * Validates TMS Tile.
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
export function validateTile (tile) {
  const [tx, ty, zoom] = tile
  validateZoom(zoom)
  if (tx === undefined || tx === null) { throw new Error('<x> is required') }
  if (ty === undefined || ty === null) { throw new Error('<y> is required') }
  if (tx < 0) { throw new Error('<x> must not be less than 0') }
  if (ty < 0) { throw new Error('<y> must not be less than 0') }
  const maxCount = Math.pow(2, zoom)
  if (tx >= maxCount || ty >= maxCount) { throw new Error('Illegal parameters for tile') }
  return tile
}

/**
 * Validates Zoom level
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
export function validateZoom (zoom) {
  if (zoom === undefined || zoom === null) { throw new Error('<zoom> is required') }
  if (zoom < 0) { throw new Error('<zoom> cannot be less than 0') }
  if (zoom > 30) { throw new Error('<zoom> cannot be greater than 30') }
  return zoom
}

/**
 * Validates LngLat coordinates
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
export function validateLngLat (lnglat) {
  const [lng, lat] = lnglat
  if (lat === undefined || lat === null) { throw new Error('<lat> is required') }
  if (lng === undefined || lng === null) { throw new Error('<lng> is required') }
  if (lat < -90 || lat > 90) { throw new Error('LngLat <lat> must be within -90 to 90 degrees') }
  if (lng < -180 || lng > 180) { throw new Error('LngLat <lng> must be within -180 to 180 degrees') }
  return [lng, lat]
}

/**
 * Validates Pixels coordinates
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
export function validatePixels (pixels) {
  // TODO
  return pixels
}

/**
 * Retrieve resolution based on zoom level
 *
 * @private
 * @param {number} zoom zoom level
 * @param {number} [tileSize=256] Tile size
 * @returns {number} resolution
 * @example
 * const res = resolution(13)
 * //=19.109257071294063
 */
export function resolution (zoom, tileSize) {
  return initialResolution(tileSize) / Math.pow(2, zoom)
}

/**
 * Generate an integer Array containing an arithmetic progression.
 *
 * @private
 * @param {number} [start=0] Start
 * @param {number} stop Stop
 * @param {number} [step=1] Step
 * @returns {number[]} range
 * @example
 * range(3)
 * //=[ 0, 1, 2 ]
 * range(3, 6)
 * //=[ 3, 4, 5 ]
 * range(6, 3, -1)
 * //=[ 6, 5, 4 ]
 */
export function range (start, stop, step) {
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
