var originShift = 2 * Math.PI * 6378137 / 2.0
var d2r = Math.PI / 180

export function initialResolution (tileSize) {
  tileSize = tileSize || 256
  return 2 * Math.PI * 6378137 / tileSize
}

/**
 * Hash tile for unique id key
 *
 * @param {Tile} tile [x, y, z]
 * @returns {number} hash
 * @example
 * var id = globalMercator.hash([312, 480, 4])
 * //=5728
 */
export function hash (tile) {
  var x = tile[0]
  var y = tile[1]
  var z = tile[2]
  return (1 << z) * ((1 << z) + x) + y
}

/**
 * Get the tile for a point at a specified zoom level
 * https://github.com/mapbox/tilebelt
 *
 * @param {[number, number]} lnglat [Longitude, Latitude]
 * @param {number} zoom Zoom level
 * @param {boolean} [validate=true] validates LatLng coordinates
 * @returns {Google} Google (XYZ) Tile
 * @example
 * var tile = globalMercator.pointToTile([1, 1], 12)
 * //= [ 2059, 2036, 12 ]
 */
export function pointToTile (lnglat, zoom, validate) {
  var tile = pointToTileFraction(lnglat, zoom, validate)
  tile[0] = Math.floor(tile[0])
  tile[1] = Math.floor(tile[1])
  return tile
}

/**
 * Get the precise fractional tile location for a point at a zoom level
 * https://github.com/mapbox/tilebelt
 *
 * @name pointToTileFraction
 * @param {[number, number]} lnglat [Longitude, Latitude]
 * @param {number} zoom Zoom level
 * @param {boolean} [validate=true] validates LatLng coordinates
 * @returns {Google} Google (XYZ) Tile
 * @example
 * var tile = globalMercator.pointToTileFraction([1, 1], 12)
 * //= [ 2059.3777777777777, 2036.6216445333432, 12 ]
 */
export function pointToTileFraction (lnglat, zoom, validate) {
  // lnglat = validateLngLat(lnglat, validate)
  var z = zoom
  var lon = longitude(lnglat[0])
  var lat = latitude(lnglat[1])
  var sin = Math.sin(lat * d2r)
  var z2 = Math.pow(2, z)
  var x = z2 * (lon / 360 + 0.5)
  var y = z2 * (0.5 - 0.25 * Math.log((1 + sin) / (1 - sin)) / Math.PI)
  return validateTile([x, y, z], validate)
}

/**
 * Converts BBox to Center
 *
 * @param {BBox} bbox - [west, south, east, north] coordinates
 * @return {LngLat} center
 * @example
 * var center = globalMercator.bboxToCenter([90, -45, 85, -50])
 * //= [ 87.5, -47.5 ]
 */
export function bboxToCenter (bbox) {
  var west = bbox[0]
  var south = bbox[1]
  var east = bbox[2]
  var north = bbox[3]
  var lng = (west - east) / 2 + east
  var lat = (south - north) / 2 + north
  lng = Number(lng.toFixed(6))
  lat = Number(lat.toFixed(6))
  return [lng, lat]
}

/**
 * Converts LngLat coordinates to Meters coordinates.
 *
 * @param {[number, number]} lnglat [Longitude, Latitude]
 * @param {boolean} [validate=true] validates LatLng coordinates
 * @returns {Meters} Meters coordinates
 * @example
 * var meters = globalMercator.lngLatToMeters([126, 37])
 * //=[ 14026255.8, 4439106.7 ]
 */
export function lngLatToMeters (lnglat, validate) {
  lnglat = validateLngLat(lnglat, validate)
  var lng = lnglat[0]
  var lat = lnglat[1]
  var x = lng * originShift / 180.0
  var y = Math.log(Math.tan((90 + lat) * Math.PI / 360.0)) / (Math.PI / 180.0)
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
 * var lnglat = globalMercator.metersToLngLat([14026255, 4439106])
 * //=[ 126, 37 ]
 */
export function metersToLngLat (meters) {
  var x = meters[0]
  var y = meters[1]
  var lng = (x / originShift) * 180.0
  var lat = (y / originShift) * 180.0
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
 * var pixels = globalMercator.metersToPixels([14026255, 4439106], 13)
 * //=[ 1782579.1, 1280877.3, 13 ]
 */
export function metersToPixels (meters, zoom, tileSize) {
  var x = meters[0]
  var y = meters[1]
  var res = resolution(zoom, tileSize)
  var px = (x + originShift) / res
  var py = (y + originShift) / res
  return [px, py, zoom]
}

/**
 * Converts LngLat coordinates to TMS Tile.
 *
 * @param {[number, number]} lnglat [Longitude, Latitude]
 * @param {number} zoom Zoom level
 * @param {boolean} [validate=true] validates LatLng coordinates
 * @returns {Tile} TMS Tile
 * @example
 * var tile = globalMercator.lngLatToTile([126, 37], 13)
 * //=[ 6963, 5003, 13 ]
 */
export function lngLatToTile (lnglat, zoom, validate) {
  lnglat = validateLngLat(lnglat, validate)
  var meters = lngLatToMeters(lnglat)
  var pixels = metersToPixels(meters, zoom)
  return pixelsToTile(pixels)
}

/**
 * Converts LngLat coordinates to Google (XYZ) Tile.
 *
 * @param {[number, number]} lnglat [Longitude, Latitude]
 * @param {number} zoom Zoom level
 * @param {boolean} [validate=true] validates LatLng coordinates
 * @returns {Google} Google (XYZ) Tile
 * @example
 * var google = globalMercator.lngLatToGoogle([126, 37], 13)
 * //=[ 6963, 3188, 13 ]
 */
export function lngLatToGoogle (lnglat, zoom, validate) {
  lnglat = validateLngLat(lnglat, validate)

  if (zoom === 0) {
    return [0, 0, 0]
  }
  var tile = lngLatToTile(lnglat, zoom)
  return tileToGoogle(tile)
}

/**
 * Converts Meters coordinates to TMS Tile.
 *
 * @param {Meters} meters Meters in Mercator [x, y]
 * @param {number} zoom Zoom level
 * @returns {Tile} TMS Tile
 * @example
 * var tile = globalMercator.metersToTile([14026255, 4439106], 13)
 * //=[ 6963, 5003, 13 ]
 */
export function metersToTile (meters, zoom) {
  if (zoom === 0) {
    return [0, 0, 0]
  }
  var pixels = metersToPixels(meters, zoom)
  return pixelsToTile(pixels)
}

/**
 * Converts Pixels coordinates to Meters coordinates.
 *
 * @param {Pixels} pixels Pixels [x, y, zoom]
 * @param {number} [tileSize=256] Tile size
 * @returns {Meters} Meters coordinates
 * @example
 * var meters = globalMercator.pixelsToMeters([1782579, 1280877, 13])
 * //=[ 14026252.0, 4439099.5 ]
 */
export function pixelsToMeters (pixels, tileSize) {
  var px = pixels[0]
  var py = pixels[1]
  var zoom = pixels[2]
  var res = resolution(zoom, tileSize)
  var mx = px * res - originShift
  var my = py * res - originShift
  mx = Number(mx.toFixed(1))
  my = Number(my.toFixed(1))
  return [mx, my]
}

/**
 * Converts Pixels coordinates to TMS Tile.
 *
 * @param {Pixels} pixels Pixels [x, y, zoom]
 * @param {number} [tileSize=256] Tile size
 * @param {boolean} [validate=true] validates Pixels coordinates
 * @returns {Tile} TMS Tile
 * @example
 * var tile = globalMercator.pixelsToTile([1782579, 1280877, 13])
 * //=[ 6963, 5003, 13 ]
 */
export function pixelsToTile (pixels, tileSize, validate) {
  tileSize = tileSize || 256
  var px = pixels[0]
  var py = pixels[1]
  var zoom = pixels[2]
  if (zoom === 0) return [0, 0, 0]

  validateZoom(zoom, validate)
  var tx = Math.ceil(px / tileSize) - 1
  var ty = Math.ceil(py / tileSize) - 1
  if (tx < 0) tx = 0
  if (ty < 0) ty = 0
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
 * @param {boolean} [validate=true] validates Tile
 * @returns {BBox} bbox extent in [minX, minY, maxX, maxY] order
 * @example
 * var bbox = globalMercator.tileToBBoxMeters([6963, 5003, 13])
 * //=[ 14025277.4, 4437016.6, 14030169.4, 4441908.5 ]
 */
export function tileToBBoxMeters (tile, tileSize, validate) {
  validateTile(tile, validate)

  tileSize = tileSize || 256
  var tx = tile[0]
  var ty = tile[1]
  var zoom = tile[2]
  var min = pixelsToMeters([tx * tileSize, ty * tileSize, zoom])
  var max = pixelsToMeters([(tx + 1) * tileSize, (ty + 1) * tileSize, zoom])
  return [min[0], min[1], max[0], max[1]]
}

/**
 * Converts TMS Tile to bbox in LngLat coordinates.
 *
 * @param {Tile} tile Tile [x, y, zoom]
 * @param {number} x TMS Tile X
 * @param {number} y TMS Tile Y
 * @param {number} zoom Zoom level
 * @param {boolean} [validate=true] validates Tile
 * @returns {BBox} bbox extent in [minX, minY, maxX, maxY] order
 * @example
 * var bbox = globalMercator.tileToBBox([6963, 5003, 13])
 * //=[ 125.991, 36.985, 126.035, 37.020 ]
 */
export function tileToBBox (tile, validate) {
  validateTile(tile, validate)

  var tx = tile[0]
  var ty = tile[1]
  var zoom = tile[2]
  if (zoom === 0) {
    return [-180, -85.051129, 180, 85.051129]
  }
  var bbox = tileToBBoxMeters([tx, ty, zoom])
  var mx1 = bbox[0]
  var my1 = bbox[1]
  var mx2 = bbox[2]
  var my2 = bbox[3]
  var min = metersToLngLat([mx1, my1, zoom])
  var max = metersToLngLat([mx2, my2, zoom])
  return [min[0], min[1], max[0], max[1]]
}

/**
 * Converts Google (XYZ) Tile to bbox in Meters coordinates.
 *
 * @param {Google} google Google [x, y, zoom]
 * @returns {BBox} bbox extent in [minX, minY, maxX, maxY] order
 * @example
 * var bbox = globalMercator.googleToBBoxMeters([6963, 3188, 13])
 * //=[ 14025277.4, 4437016.6, 14030169.4, 4441908.5 ]
 */
export function googleToBBoxMeters (google) {
  var Tile = googleToTile(google)
  return tileToBBoxMeters(Tile)
}

/**
 * Converts Google (XYZ) Tile to bbox in LngLat coordinates.
 *
 * @param {Google} google Google [x, y, zoom]
 * @returns {BBox} bbox extent in [minX, minY, maxX, maxY] order
 * @example
 * var bbox = globalMercator.googleToBBox([6963, 3188, 13])
 * //=[ 125.991, 36.985, 126.035, 37.020 ]
 */
export function googleToBBox (google) {
  var Tile = googleToTile(google)
  return tileToBBox(Tile)
}

/**
 * Converts TMS Tile to Google (XYZ) Tile.
 *
 * @param {Tile} tile Tile [x, y, zoom]
 * @param {boolean} [validate=true] validates Tile
 * @returns {Google} Google (XYZ) Tile
 * @example
 * var google = globalMercator.tileToGoogle([6963, 5003, 13])
 * //=[ 6963, 3188, 13 ]
 */
export function tileToGoogle (tile, validate) {
  validateTile(tile, validate)

  var tx = tile[0]
  var ty = tile[1]
  var zoom = tile[2]
  if (zoom === 0) {
    return [0, 0, 0]
  }
  var x = tx
  var y = (Math.pow(2, zoom) - 1) - ty
  return [x, y, zoom]
}

/**
 * Converts Google (XYZ) Tile to TMS Tile.
 *
 * @param {Google} google Google [x, y, zoom]
 * @returns {Tile} TMS Tile
 * @example
 * var tile = globalMercator.googleToTile([6963, 3188, 13])
 * //=[ 6963, 5003, 13 ]
 */
export function googleToTile (google) {
  var x = google[0]
  var y = google[1]
  var zoom = google[2]
  var tx = x
  var ty = Math.pow(2, zoom) - y - 1
  return [tx, ty, zoom]
}

/**
 * Converts Google (XYZ) Tile to Quadkey.
 *
 * @param {Google} google Google [x, y, zoom]
 * @returns {string} Microsoft's Quadkey schema
 * @example
 * var quadkey = globalMercator.googleToQuadkey([6963, 3188, 13])
 * //='1321102330211'
 */
export function googleToQuadkey (google) {
  var Tile = googleToTile(google)
  return tileToQuadkey(Tile)
}

/**
 * Converts TMS Tile to QuadKey.
 *
 * @param {Tile} tile Tile [x, y, zoom]
 * @param {boolean} [validate=true] validates Tile
 * @returns {string} Microsoft's Quadkey schema
 * @example
 * var quadkey = globalMercator.tileToQuadkey([6963, 5003, 13])
 * //='1321102330211'
 */
export function tileToQuadkey (tile, validate) {
  validateTile(tile, validate)

  var tx = tile[0]
  var ty = tile[1]
  var zoom = tile[2]
  // Zoom 0 does not exist for Quadkey
  if (zoom === 0) {
    return ''
  }
  var quadkey = ''
  ty = (Math.pow(2, zoom) - 1) - ty
  range(zoom, 0, -1).map(function (i) {
    var digit = 0
    var mask = 1 << (i - 1)
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
 * var tile = globalMercator.quadkeyToTile('1321102330211')
 * //=[ 6963, 5003, 13 ]
 */
export function quadkeyToTile (quadkey) {
  var Google = quadkeyToGoogle(quadkey)
  return googleToTile(Google)
}

/**
 * Converts Quadkey to Google (XYZ) Tile.
 *
 * @param {string} quadkey Microsoft's Quadkey schema
 * @returns {Google} Google (XYZ) Tile
 * @example
 * var google = globalMercator.quadkeyToGoogle('1321102330211')
 * //=[ 6963, 3188, 13 ]
 */
export function quadkeyToGoogle (quadkey) {
  var x = 0
  var y = 0
  var zoom = quadkey.length
  range(zoom, 0, -1).map(function (i) {
    var mask = 1 << (i - 1)
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
 * var meters = globalMercator.bboxToMeters([ 125, 35, 127, 37 ])
 * //=[ 13914936.3, 4163881.1, 14137575.3, 4439106.7 ]
 */
export function bboxToMeters (bbox) {
  var min = lngLatToMeters([bbox[0], bbox[1]])
  var max = lngLatToMeters([bbox[2], bbox[3]])
  return [min[0], min[1], max[0], max[1]]
}

/**
 * Validates TMS Tile.
 *
 * @param {Tile} tile Tile [x, y, zoom]
 * @param {boolean} [validate=true] validates Tile
 * @throws {Error} Will throw an error if TMS Tile is not valid.
 * @returns {Tile} TMS Tile
 * @example
 * globalMercator.validateTile([60, 80, 12])
 * //=[60, 80, 12]
 * globalMercator.validateTile([60, -43, 5])
 * //= Error: Tile <y> must not be less than 0
 * globalMercator.validateTile([25, 60, 3])
 * //= Error: Illegal parameters for tile
 */
export function validateTile (tile, validate) {
  var tx = tile[0]
  var ty = tile[1]
  var zoom = tile[2]
  if (validate === false) return tile
  if (zoom === undefined || zoom === null) throw new Error('<zoom> is required')
  if (tx === undefined || tx === null) throw new Error('<x> is required')
  if (ty === undefined || ty === null) throw new Error('<y> is required')

  // Adjust values of tiles to fit within tile scheme
  zoom = validateZoom(zoom)
  tile = wrapTile(tile)

  // // Check to see if tile is valid based on the zoom level
  // // Currently impossible to hit since WrapTile handles this error
  // // will keep this test commented out in case it doesnt handle it
  // var maxCount = Math.pow(2, zoom)
  // if (tile[0] >= maxCount || tile[1] >= maxCount) throw new Error('Illegal parameters for tile')
  return tile
}

/**
 * Wrap Tile -- Handles tiles which crosses the 180th meridian or 90th parallel
 *
 * @param {[number, number, number]} tile Tile
 * @param {number} zoom Zoom Level
 * @returns {[number, number, number]} Wrapped Tile
 * @example
 * globalMercator.wrapTile([0, 3, 2])
 * //= [0, 3, 2] -- Valid Tile X
 * globalMercator.wrapTile([4, 2, 2])
 * //= [0, 2, 2] -- Tile 4 does not exist, wrap around to TileX=0
 */
export function wrapTile (tile) {
  var tx = tile[0]
  var ty = tile[1]
  var zoom = tile[2]

  // Maximum tile allowed
  // zoom 0 => 1
  // zoom 1 => 2
  // zoom 2 => 4
  // zoom 3 => 8
  var maxTile = Math.pow(2, zoom)

  // Handle Tile X
  tx = tx % maxTile
  if (tx < 0) tx = tx + maxTile

  return [tx, ty, zoom]
}

/**
 * Validates Zoom level
 *
 * @param {number} zoom Zoom level
 * @param {boolean} [validate=true] validates Zoom level
 * @throws {Error} Will throw an error if zoom is not valid.
 * @returns {number} zoom Zoom level
 * @example
 * globalMercator.validateZoom(12)
 * //=12
 * globalMercator.validateZoom(-4)
 * //= Error: <zoom> cannot be less than 0
 * globalMercator.validateZoom(32)
 * //= Error: <zoom> cannot be greater than 30
 */
export function validateZoom (zoom) {
  if (zoom === false) return zoom
  if (zoom === undefined || zoom === null) { throw new Error('<zoom> is required') }
  if (zoom < 0) { throw new Error('<zoom> cannot be less than 0') }
  if (zoom > 30) { throw new Error('<zoom> cannot be greater than 30') }
  return zoom
}

/**
 * Validates LngLat coordinates
 *
 * @param {[number, number]} lnglat [Longitude, Latitude]
 * @param {boolean} [validate=true] validates LatLng coordinates
 * @throws {Error} Will throw an error if LngLat is not valid.
 * @returns {LngLat} LngLat coordinates
 * @example
 * globalMercator.validateLngLat([-115, 44])
 * //= [ -115, 44 ]
 * globalMercator.validateLngLat([-225, 44])
 * //= Error: LngLat [lng] must be within -180 to 180 degrees
 */
export function validateLngLat (lnglat, validate) {
  if (validate === false) return lnglat

  var lng = longitude(lnglat[0])
  var lat = latitude(lnglat[1])

  // Global Mercator does not support latitudes within 85 to 90 degrees
  if (lat > 85) lat = 85
  if (lat < -85) lat = -85
  return [lng, lat]
}

/**
 * Retrieve resolution based on zoom level
 *
 * @private
 * @param {number} zoom zoom level
 * @param {number} [tileSize=256] Tile size
 * @returns {number} resolution
 * @example
 * var res = globalMercator.resolution(13)
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
 * globalMercator.range(3)
 * //=[ 0, 1, 2 ]
 * globalMercator.range(3, 6)
 * //=[ 3, 4, 5 ]
 * globalMercator.range(6, 3, -1)
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
  var length = Math.max(Math.ceil((stop - start) / step), 0)
  var range = Array(length)
  for (var idx = 0; idx < length; idx++, start += step) {
    range[idx] = start
  }
  return range
}

/**
 * Maximum extent of BBox
 *
 * @param {BBox|BBox[]} array BBox [west, south, east, north]
 * @returns {BBox} Maximum BBox
 * @example
 * var bbox = globalMercator.maxBBox([[-20, -30, 20, 30], [-110, -30, 120, 80]])
 * //=[-110, -30, 120, 80]
 */
export function maxBBox (array) {
  if (!array) throw new Error('array is required')

  // Single BBox
  if (array && array[0] && array.length === 4 && array[0][0] === undefined) {
    return array
  }

  // Multiple BBox
  if (array && array[0] && array[0][0] !== undefined) {
    var west = array[0][0]
    var south = array[0][1]
    var east = array[0][2]
    var north = array[0][3]

    array.map(function (bbox) {
      if (bbox[0] < west) { west = bbox[0] }
      if (bbox[1] < south) { south = bbox[1] }
      if (bbox[2] > east) { east = bbox[2] }
      if (bbox[3] > north) { north = bbox[3] }
    })
    return [west, south, east, north]
  }
}

/**
 * Valid TMS Tile
 *
 * @param {Tile} tile Tile [x, y, zoom]
 * @returns {boolean} valid tile true/false
 * @example
 * globalMercator.validTile([60, 80, 12])
 * //= true
 * globalMercator.validTile([60, -43, 5])
 * //= false
 * globalMercator.validTile([25, 60, 3])
 * //= false
 */
export function validTile (tile) {
  try {
    validateTile(tile)
    return true
  } catch (e) {
    return false
  }
}

/**
 * Modifies a Latitude to fit within +/-90 degrees.
 *
 * @param {number} lat latitude to modify
 * @returns {number} modified latitude
 * @example
 * globalMercator.latitude(100)
 * //= -80
 */
export function latitude (lat) {
  if (lat === undefined || lat === null) throw new Error('lat is required')

  // Latitudes cannot extends beyond +/-90 degrees
  if (lat > 90 || lat < -90) {
    lat = lat % 180
    if (lat > 90) lat = -180 + lat
    if (lat < -90) lat = 180 + lat
    if (lat === 0) lat = 0
  }
  return lat
}

/**
 * Modifies a Longitude to fit within +/-180 degrees.
 *
 * @param {number} lng longitude to modify
 * @returns {number} modified longitude
 * @example
 * globalMercator.longitude(190)
 * //= -170
 */
export function longitude (lng) {
  if (lng === undefined || lng === null) throw new Error('lng is required')

  // lngitudes cannot extends beyond +/-90 degrees
  if (lng > 180 || lng < -180) {
    lng = lng % 360
    if (lng > 180) lng = -360 + lng
    if (lng < -180) lng = 360 + lng
    if (lng === 0) lng = 0
  }
  return lng
}
