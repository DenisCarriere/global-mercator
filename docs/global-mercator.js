(function (exports) {
var originShift = 2 * Math.PI * 6378137 / 2.0;
function initialResolution (tileSize) {
  tileSize = tileSize || 256;
  return 2 * Math.PI * 6378137 / tileSize
}

/**
 * Hash tile for unique id key
 *
 * @param {Tile} tile [x, y, z]
 * @returns {number} hash
 * @example
 * var id = mercator.hash([312, 480, 4])
 * //=5728
 */
function hash (tile) {
  var x = tile[0];
  var y = tile[1];
  var z = tile[2];
  return (1 << z) * ((1 << z) + x) + y
}

/**
 * Converts BBox to Center
 *
 * @param {BBox} bbox - [west, south, east, north] coordinates
 * @return {LngLat} center
 * @example
 * var center = mercator.bboxToCenter([90, -45, 85, -50])
 * //= [ 87.5, -47.5 ]
 */
function bboxToCenter (bbox) {
  var west = bbox[0];
  var south = bbox[1];
  var east = bbox[2];
  var north = bbox[3];
  var lng = (west - east) / 2 + east;
  var lat = (south - north) / 2 + north;
  lng = Number(lng.toFixed(6));
  lat = Number(lat.toFixed(6));
  return [lng, lat]
}

/**
 * Converts LngLat coordinates to Meters coordinates.
 *
 * @param {LngLat} lnglat Longitude (Meridians) & Latitude (Parallels) in decimal degrees
 * @returns {Meters} Meters coordinates
 * @example
 * var meters = mercator.lngLatToMeters([126, 37])
 * //=[ 14026255.8, 4439106.7 ]
 */
function lngLatToMeters (lnglat) {
  validateLngLat(lnglat);
  var lng = lnglat[0];
  var lat = lnglat[1];
  var x = lng * originShift / 180.0;
  var y = Math.log(Math.tan((90 + lat) * Math.PI / 360.0)) / (Math.PI / 180.0);
  y = y * originShift / 180.0;
  x = Number(x.toFixed(1));
  y = Number(y.toFixed(1));
  return [x, y]
}

/**
 * Converts Meters coordinates to LngLat coordinates.
 *
 * @param {Meters} meters Meters in Mercator [x, y]
 * @returns {LngLat} LngLat coordinates
 * @example
 * var lnglat = mercator.metersToLngLat([14026255, 4439106])
 * //=[ 126, 37 ]
 */
function metersToLngLat (meters) {
  var x = meters[0];
  var y = meters[1];
  var lng = (x / originShift) * 180.0;
  var lat = (y / originShift) * 180.0;
  lat = 180 / Math.PI * (2 * Math.atan(Math.exp(lat * Math.PI / 180.0)) - Math.PI / 2.0);
  lng = Number(lng.toFixed(6));
  lat = Number(lat.toFixed(6));
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
 * var pixels = mercator.metersToPixels([14026255, 4439106], 13)
 * //=[ 1782579.1, 1280877.3, 13 ]
 */
function metersToPixels (meters, zoom, tileSize) {
  var x = meters[0];
  var y = meters[1];
  var res = resolution(zoom, tileSize);
  var px = (x + originShift) / res;
  var py = (y + originShift) / res;
  return [px, py, zoom]
}

/**
 * Converts LngLat coordinates to TMS Tile.
 *
 * @param {LngLat} lnglat Longitude (Meridians) & Latitude (Parallels) in decimal degrees
 * @param {number} zoom Zoom level
 * @returns {Tile} TMS Tile
 * @example
 * var tile = mercator.lngLatToTile([126, 37], 13)
 * //=[ 6963, 5003, 13 ]
 */
function lngLatToTile (lnglat, zoom) {
  var meters = lngLatToMeters(validateLngLat(lnglat));
  var pixels = metersToPixels(meters, zoom);
  return pixelsToTile(pixels)
}

/**
 * Converts LngLat coordinates to Google (XYZ) Tile.
 *
 * @param {LngLat} lnglat Longitude (Meridians) & Latitude (Parallels) in decimal degrees
 * @param {number} zoom Zoom level
 * @returns {Google} Google (XYZ) Tile
 * @example
 * var google = mercator.lngLatToGoogle([126, 37], 13)
 * //=[ 6963, 3188, 13 ]
 */
function lngLatToGoogle (lnglat, zoom) {
  if (zoom === 0) {
    return [0, 0, 0]
  }
  var tile = lngLatToTile(validateLngLat(lnglat), zoom);
  return tileToGoogle(tile)
}

/**
 * Converts Meters coordinates to TMS Tile.
 *
 * @param {Meters} meters Meters in Mercator [x, y]
 * @param {number} zoom Zoom level
 * @returns {Tile} TMS Tile
 * @example
 * var tile = mercator.metersToTile([14026255, 4439106], 13)
 * //=[ 6963, 5003, 13 ]
 */
function metersToTile (meters, zoom) {
  if (zoom === 0) {
    return [0, 0, 0]
  }
  var pixels = metersToPixels(meters, zoom);
  return pixelsToTile(pixels)
}

/**
 * Converts Pixels coordinates to Meters coordinates.
 *
 * @param {Pixels} pixels Pixels [x, y, zoom]
 * @param {number} [tileSize=256] Tile size
 * @returns {Meters} Meters coordinates
 * @example
 * var meters = mercator.pixelsToMeters([1782579, 1280877, 13])
 * //=[ 14026252.0, 4439099.5 ]
 */
function pixelsToMeters (pixels, tileSize) {
  validatePixels(pixels);
  var px = pixels[0];
  var py = pixels[1];
  var zoom = pixels[2];
  var res = resolution(zoom, tileSize);
  var mx = px * res - originShift;
  var my = py * res - originShift;
  mx = Number(mx.toFixed(1));
  my = Number(my.toFixed(1));
  return [mx, my]
}

/**
 * Converts Pixels coordinates to TMS Tile.
 *
 * @param {Pixels} pixels Pixels [x, y, zoom]
 * @param {number} [tileSize=256] Tile size
 * @returns {Tile} TMS Tile
 * @example
 * var tile = mercator.pixelsToTile([1782579, 1280877, 13])
 * //=[ 6963, 5003, 13 ]
 */
function pixelsToTile (pixels, tileSize) {
  tileSize = tileSize || 256;
  validatePixels(pixels);
  var px = pixels[0];
  var py = pixels[1];
  var zoom = pixels[2];
  if (zoom === 0) {
    return [0, 0, 0]
  }
  var tx = Math.ceil(px / tileSize) - 1;
  var ty = Math.ceil(py / tileSize) - 1;
  if (tx < 0) {
    tx = 0;
  }
  if (ty < 0) {
    ty = 0;
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
 * var bbox = mercator.tileToBBoxMeters([6963, 5003, 13])
 * //=[ 14025277.4, 4437016.6, 14030169.4, 4441908.5 ]
 */
function tileToBBoxMeters (tile, tileSize) {
  tileSize = tileSize || 256;
  validateTile(tile);
  var tx = tile[0];
  var ty = tile[1];
  var zoom = tile[2];
  var min = pixelsToMeters([tx * tileSize, ty * tileSize, zoom]);
  var max = pixelsToMeters([(tx + 1) * tileSize, (ty + 1) * tileSize, zoom]);
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
 * var bbox = mercator.tileToBBox([6963, 5003, 13])
 * //=[ 125.991, 36.985, 126.035, 37.020 ]
 */
function tileToBBox (tile) {
  validateTile(tile);
  var tx = tile[0];
  var ty = tile[1];
  var zoom = tile[2];
  if (zoom === 0) {
    return [-180, -85.051129, 180, 85.051129]
  }
  var bbox = tileToBBoxMeters([tx, ty, zoom]);
  var mx1 = bbox[0];
  var my1 = bbox[1];
  var mx2 = bbox[2];
  var my2 = bbox[3];
  var min = metersToLngLat([mx1, my1, zoom]);
  var max = metersToLngLat([mx2, my2, zoom]);
  return [min[0], min[1], max[0], max[1]]
}

/**
 * Converts Google (XYZ) Tile to bbox in Meters coordinates.
 *
 * @param {Google} google Google [x, y, zoom]
 * @returns {BBox} bbox extent in [minX, minY, maxX, maxY] order
 * @example
 * var bbox = mercator.googleToBBoxMeters([6963, 3188, 13])
 * //=[ 14025277.4, 4437016.6, 14030169.4, 4441908.5 ]
 */
function googleToBBoxMeters (google) {
  var Tile = googleToTile(google);
  return tileToBBoxMeters(Tile)
}

/**
 * Converts Google (XYZ) Tile to bbox in LngLat coordinates.
 *
 * @param {Google} google Google [x, y, zoom]
 * @returns {BBox} bbox extent in [minX, minY, maxX, maxY] order
 * @example
 * var bbox = mercator.googleToBBox([6963, 3188, 13])
 * //=[ 125.991, 36.985, 126.035, 37.020 ]
 */
function googleToBBox (google) {
  var Tile = googleToTile(google);
  return tileToBBox(Tile)
}

/**
 * Converts TMS Tile to Google (XYZ) Tile.
 *
 * @param {Tile} tile Tile [x, y, zoom]
 * @returns {Google} Google (XYZ) Tile
 * @example
 * var google = mercator.tileToGoogle([6963, 5003, 13])
 * //=[ 6963, 3188, 13 ]
 */
function tileToGoogle (tile) {
  validateTile(tile);
  var tx = tile[0];
  var ty = tile[1];
  var zoom = tile[2];
  if (zoom === 0) {
    return [0, 0, 0]
  }
  var x = tx;
  var y = (Math.pow(2, zoom) - 1) - ty;
  return [x, y, zoom]
}

/**
 * Converts Google (XYZ) Tile to TMS Tile.
 *
 * @param {Google} google Google [x, y, zoom]
 * @returns {Tile} TMS Tile
 * @example
 * var tile = mercator.googleToTile([6963, 3188, 13])
 * //=[ 6963, 5003, 13 ]
 */
function googleToTile (google) {
  var x = google[0];
  var y = google[1];
  var zoom = google[2];
  var tx = x;
  var ty = Math.pow(2, zoom) - y - 1;
  return [tx, ty, zoom]
}

/**
 * Converts Google (XYZ) Tile to Quadkey.
 *
 * @param {Google} google Google [x, y, zoom]
 * @returns {string} Microsoft's Quadkey schema
 * @example
 * var quadkey = mercator.googleToQuadkey([6963, 3188, 13])
 * //='1321102330211'
 */
function googleToQuadkey (google) {
  var Tile = googleToTile(google);
  return tileToQuadkey(Tile)
}

/**
 * Converts TMS Tile to QuadKey.
 *
 * @param {Tile} tile Tile [x, y, zoom]
 * @returns {string} Microsoft's Quadkey schema
 * @example
 * var quadkey = mercator.tileToQuadkey([6963, 5003, 13])
 * //='1321102330211'
 */
function tileToQuadkey (tile) {
  validateTile(tile);
  var tx = tile[0];
  var ty = tile[1];
  var zoom = tile[2];
  // Zoom 0 does not exist for Quadkey
  if (zoom === 0) {
    return ''
  }
  var quadkey = '';
  ty = (Math.pow(2, zoom) - 1) - ty;
  range(zoom, 0, -1).map(function (i) {
    var digit = 0;
    var mask = 1 << (i - 1);
    if ((tx & mask) !== 0) {
      digit += 1;
    }
    if ((ty & mask) !== 0) {
      digit += 2;
    }
    quadkey = quadkey.concat(digit);
  });
  return quadkey
}

/**
 * Converts Quadkey to TMS Tile.
 *
 * @param {string} quadkey Microsoft's Quadkey schema
 * @returns {Tile} TMS Tile
 * @example
 * var tile = mercator.quadkeyToTile('1321102330211')
 * //=[ 6963, 5003, 13 ]
 */
function quadkeyToTile (quadkey) {
  var Google = quadkeyToGoogle(quadkey);
  return googleToTile(Google)
}

/**
 * Converts Quadkey to Google (XYZ) Tile.
 *
 * @param {string} quadkey Microsoft's Quadkey schema
 * @returns {Google} Google (XYZ) Tile
 * @example
 * var google = mercator.quadkeyToGoogle('1321102330211')
 * //=[ 6963, 3188, 13 ]
 */
function quadkeyToGoogle (quadkey) {
  var x = 0;
  var y = 0;
  var zoom = quadkey.length;
  range(zoom, 0, -1).map(function (i) {
    var mask = 1 << (i - 1);
    switch (parseInt(quadkey[zoom - i], 0)) {
      case 0:
        break
      case 1:
        x += mask;
        break
      case 2:
        y += mask;
        break
      case 3:
        x += mask;
        y += mask;
        break
      default:
        throw new Error('Invalid Quadkey digit sequence')
    }
  });
  return [x, y, zoom]
}

/**
 * Converts BBox from LngLat coordinates to Meters coordinates
 *
 * @param {BBox} bbox extent in [minX, minY, maxX, maxY] order
 * @returns {BBox} bbox extent in [minX, minY, maxX, maxY] order
 * @example
 * var meters = mercator.bboxToMeters([ 125, 35, 127, 37 ])
 * //=[ 13914936.3, 4163881.1, 14137575.3, 4439106.7 ]
 */
function bboxToMeters (bbox) {
  var min = lngLatToMeters([bbox[0], bbox[1]]);
  var max = lngLatToMeters([bbox[2], bbox[3]]);
  return [min[0], min[1], max[0], max[1]]
}

/**
 * Validates TMS Tile.
 *
 * @param {Tile} tile Tile [x, y, zoom]
 * @throws {Error} Will throw an error if TMS Tile is not valid.
 * @returns {Tile} TMS Tile
 * @example
 * mercator.validateTile([60, 80, 12])
 * //=[60, 80, 12]
 * mercator.validateTile([60, -43, 5])
 * //= Error: Tile <y> must not be less than 0
 * mercator.validateTile([25, 60, 3])
 * //= Error: Illegal parameters for tile
 */
function validateTile (tile) {
  var tx = tile[0];
  var ty = tile[1];
  var zoom = tile[2];
  validateZoom(zoom);
  if (tx === undefined || tx === null) { throw new Error('<x> is required') }
  if (ty === undefined || ty === null) { throw new Error('<y> is required') }
  if (tx < 0) { throw new Error('<x> must not be less than 0') }
  if (ty < 0) { throw new Error('<y> must not be less than 0') }
  var maxCount = Math.pow(2, zoom);
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
 * mercator.validateZoom(32)
 * //= Error: <zoom> cannot be greater than 30
 */
function validateZoom (zoom) {
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
 * mercator.validateLngLat([-115, 44])
 * //= [ -115, 44 ]
 * mercator.validateLngLat([-225, 44])
 * //= Error: LngLat [lng] must be within -180 to 180 degrees
 */
function validateLngLat (lnglat) {
  var lng = lnglat[0];
  var lat = lnglat[1];
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
 * mercator.validatePixels([-115, 44])
 */
function validatePixels (pixels) {
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
 * var res = mercator.resolution(13)
 * //=19.109257071294063
 */
function resolution (zoom, tileSize) {
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
 * mercator.range(3)
 * //=[ 0, 1, 2 ]
 * mercator.range(3, 6)
 * //=[ 3, 4, 5 ]
 * mercator.range(6, 3, -1)
 * //=[ 6, 5, 4 ]
 */
function range (start, stop, step) {
  if (stop == null) {
    stop = start || 0;
    start = 0;
  }
  if (!step) {
    step = stop < start ? -1 : 1;
  }
  var length = Math.max(Math.ceil((stop - start) / step), 0);
  var range = Array(length);
  for (var idx = 0; idx < length; idx++, start += step) {
    range[idx] = start;
  }
  return range
}

/**
 * Maximum extent of BBox
 *
 * @param {BBox|BBox[]} array BBox [west, south, east, north]
 * @returns {BBox} Maximum BBox
 * @example
 * var bbox = mercator.maxBBox([[-20, -30, 20, 30], [-110, -30, 120, 80]])
 * //=[-110, -30, 120, 80]
 */
function maxBBox (array) {
  // Single BBox
  if (array && array[0] && array.length === 4 && array[0][0] === undefined) {
    return array
  }

  // Multiple BBox
  if (array && array[0] && array[0][0] !== undefined) {
    var west = array[0][0];
    var south = array[0][1];
    var east = array[0][2];
    var north = array[0][3];

    array.map(function (bbox) {
      if (bbox[0] < west) { west = bbox[0]; }
      if (bbox[1] < south) { south = bbox[1]; }
      if (bbox[2] > east) { east = bbox[2]; }
      if (bbox[3] > north) { north = bbox[3]; }
    });
    return [west, south, east, north]
  }
}

exports.hash = hash;
exports.bboxToCenter = bboxToCenter;
exports.lngLatToMeters = lngLatToMeters;
exports.metersToLngLat = metersToLngLat;
exports.metersToPixels = metersToPixels;
exports.lngLatToTile = lngLatToTile;
exports.lngLatToGoogle = lngLatToGoogle;
exports.metersToTile = metersToTile;
exports.pixelsToMeters = pixelsToMeters;
exports.pixelsToTile = pixelsToTile;
exports.tileToBBoxMeters = tileToBBoxMeters;
exports.tileToBBox = tileToBBox;
exports.googleToBBoxMeters = googleToBBoxMeters;
exports.googleToBBox = googleToBBox;
exports.tileToGoogle = tileToGoogle;
exports.googleToTile = googleToTile;
exports.googleToQuadkey = googleToQuadkey;
exports.tileToQuadkey = tileToQuadkey;
exports.quadkeyToTile = quadkeyToTile;
exports.quadkeyToGoogle = quadkeyToGoogle;
exports.bboxToMeters = bboxToMeters;
exports.validateTile = validateTile;
exports.validateZoom = validateZoom;
exports.validateLngLat = validateLngLat;
exports.validatePixels = validatePixels;
exports.resolution = resolution;
exports.range = range;
exports.maxBBox = maxBBox;

}((this.mercator = this.mercator || {})));
