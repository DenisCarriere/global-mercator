import test from 'tape'
import tilebelt from '@mapbox/tilebelt'
import * as mercator from './'

const ZOOM = 13
const TILE = [2389, 5245, 13]
const GOOGLE = [2389, 2946, 13]
const QUADKEY = '0302321010121'
const QUADKEY_BAD = '030486861'
const LNGLAT = [-75.000057, 44.999888]
const METERS = [-8348968.179248, 5621503.917462]
const PIXELS = [611669, 1342753, 13]
const BBOX_METERS = [-8350592.466099, 5620873.311979, -8345700.496289, 5625765.281789]
const BBOX = [-75.014648, 44.995883, -74.970703, 45.026950]

/**
 * Round number to precision
 *
 * @param {number} num Number
 * @param {number} [precision=0] Precision
 * @returns {number} rounded number
 * @example
 * round(120.4321)
 * //=120
 *
 * round(120.4321, 2)
 * //=120.43
 */
function round (num, precision) {
  if (num === undefined || num === null || isNaN(num)) throw new Error('num is required')
  if (precision && !(precision >= 0)) throw new Error('precision must be a positive number')
  var multiplier = Math.pow(10, precision || 0)
  return Math.round(num * multiplier) / multiplier
}

/**
 * Test approximate number in array
 *
 * @param {number[]} array1
 * @param {number[]} array2
 * @returns {Boolean} true/false
 */
function toBeCloseToArray (array1, array2, precision) {
  precision = (precision !== undefined) ? precision : 2
  var ret = true
  array1.forEach((value, index) => {
    const num1 = round(value, precision)
    const num2 = round(array2[index], precision)
    if (num1 !== num2) ret = false
  })
  return ret
}

/**
 * custom matchers
 */
test('custom matchers', t => {
  t.true(toBeCloseToArray([1, 2, 3], [1, 2, 3]), 'toBeCloseToArray, exact')
  t.true(toBeCloseToArray([1, 2, 3], [1, 2.001, 2.999]), 'toBeCloseToArray, approx')
  t.false(toBeCloseToArray([1, 2, 3], [1, 2000, 3000]), 'toBeCloseToArray, total out')
  t.end()
})

/**
 * BBox
 */
test('bbox', t => {
  t.deepEqual(mercator.bboxToCenter([90, -45, 85, -50]), [87.5, -47.5], 'bboxToCenter')
  t.true(toBeCloseToArray(mercator.bboxToMeters(BBOX), BBOX_METERS, 0), 'bboxToMeters')
  t.end()
})

/**
 * Utils
 */
test('utils', t => {
  t.equal(mercator.hash([312, 480, 4]), 5728, 'hash')
  t.equal(mercator.resolution(13), 19.109257071294063, 'resolution')
  t.deepEqual(mercator.range(3), [0, 1, 2], 'range(3)')
  t.deepEqual(mercator.range(0, 3), [0, 1, 2], 'range(0, 3)')
  t.deepEqual(mercator.range(3, 0, -1), [3, 2, 1], 'range(3, 0, -1)')
  t.end()
})

/**
 * LngLat
 */
test('lnglat', t => {
  t.true(toBeCloseToArray(mercator.lngLatToMeters(LNGLAT), METERS, 0), 'lngLatToMeters')
  t.deepEqual(mercator.lngLatToGoogle(LNGLAT, ZOOM), GOOGLE, 'lngLatToGoogle1')
  t.deepEqual(mercator.lngLatToGoogle(LNGLAT, 0), [0, 0, 0], 'lngLatToGoogle2')
  t.deepEqual(mercator.lngLatToTile(LNGLAT, ZOOM), TILE, 'lngLatToTile1')
  t.deepEqual(mercator.lngLatToTile(LNGLAT, 0), [0, 0, 0], 'lngLatToTile2')
  t.end()
})

/**
 * Meters
 */
test('meters', t => {
  t.deepEqual(mercator.metersToLngLat(METERS), LNGLAT, 'metersToLngLat')
  t.true(toBeCloseToArray(mercator.metersToPixels(METERS, ZOOM), PIXELS), 'metersToPixels')
  t.deepEqual(mercator.metersToTile(METERS, ZOOM), TILE, 'metersToTile1')
  t.deepEqual(mercator.metersToTile(METERS, 0), [0, 0, 0], 'metersToTile2')
  t.end()
})

/**
 * Pixels
 */
test('pixels', t => {
  t.deepEqual(mercator.pixelsToTile(PIXELS), TILE, 'pixelsToTile1')
  t.deepEqual(mercator.pixelsToTile([0, 0, 0]), [0, 0, 0], 'pixelsToTile1')
  t.true(toBeCloseToArray(mercator.pixelsToMeters(PIXELS), METERS, 0), 'pixelsToMeters')
  t.end()
})

/**
 * Tile
 */
test('tile', t => {
  t.true(toBeCloseToArray(mercator.tileToBBox(TILE), BBOX), 'tileToBbox')
  t.true(toBeCloseToArray(mercator.tileToBBox([0, 0, 0]), [-180, -85.05112877980659, 180, 85.05112877980659]), 'tileToBbox')
  t.true(toBeCloseToArray(mercator.tileToBBoxMeters(TILE), BBOX_METERS, 0), 'tileToBBoxMeters')
  t.deepEqual(mercator.tileToGoogle(TILE), GOOGLE, 'tileToGoogle')
  t.deepEqual(mercator.tileToGoogle([0, 0, 0]), [0, 0, 0], 'tileToGoogle')
  t.deepEqual(mercator.tileToQuadkey(TILE), '0302321010121', 'tileToQuadkey')
  t.deepEqual(tilebelt.tileToQuadkey(mercator.tileToGoogle(TILE)), '0302321010121', 'tileToQuadkey -- tilebelt')
  t.deepEqual(mercator.tileToQuadkey([0, 0, 0]), '', 'tileToQuadkey -- null')
  t.end()
})

/**
 * Quadkey
 */
test('quadkey', t => {
  t.deepEqual(mercator.quadkeyToGoogle(QUADKEY), GOOGLE, 'quadkeyToGoogle')
  t.deepEqual(mercator.quadkeyToTile(QUADKEY), TILE, 'quadKeyToTile')
  t.throws(() => mercator.quadkeyToTile(QUADKEY_BAD), 'Throws Error quadkeyToTile')
  t.end()
})

/**
 * Google
 */
test('google', t => {
  t.true(toBeCloseToArray(mercator.googleToBBox(GOOGLE), BBOX), 'googleToBbox')
  t.true(toBeCloseToArray(mercator.googleToBBoxMeters(GOOGLE), BBOX_METERS, 0), 'googleToBBoxMeters')
  t.deepEqual(mercator.googleToQuadkey(GOOGLE), '0302321010121', 'googleToQuadKey')
  t.deepEqual(tilebelt.tileToQuadkey(GOOGLE), '0302321010121', 'googleToQuadKey -- tilebelt')
  t.deepEqual(mercator.googleToTile(GOOGLE), TILE, 'googleToTile')
  t.end()
})

// /**
//  * Validate
//  */
// test('validate -- Throws Error Bad LngLat', t => {
//   t.equal(mercator.validateLngLat([0, -110])[1], 70)
//   t.equal(mercator.validateLngLat([0, 110])[1], -70)
//   t.equal(mercator.validateLngLat([90, 80])[0], 90)
//   t.equal(mercator.validateLngLat([180, 80])[0], 180)
//   t.equal(mercator.validateLngLat([270, 80])[0], -90)
//   t.equal(mercator.validateLngLat([360, 80])[0], 0)
//   t.equal(mercator.validateLngLat([450, 80])[0], 90)
//   t.equal(mercator.validateLngLat([540, 80])[0], 180)
//   t.equal(mercator.validateLngLat([630, 80])[0], -90)
//   t.equal(mercator.validateLngLat([720, 80])[0], 0)
//   t.equal(mercator.validateLngLat([-90, 80])[0], -90)
//   t.equal(mercator.validateLngLat([-180, 80])[0], -180)
//   t.equal(mercator.validateLngLat([-270, 80])[0], 90)
//   t.equal(mercator.validateLngLat([-360, 80])[0], 0)
//   t.equal(mercator.validateLngLat([-450, 80])[0], -90)
//   t.equal(mercator.validateLngLat([-540, 80])[0], -180)
//   t.equal(mercator.validateLngLat([-630, 80])[0], 90)
//   t.equal(mercator.validateLngLat([-720, 80])[0], 0)
//   t.end()
// })

// test('validate -- validateZoom', t => {
//   t.throws(() => mercator.validateZoom(-2))
//   t.throws(() => mercator.validateZoom(35))
//   t.end()
// })

// test('validate -- validateTile', t => {
//   t.deepEqual(mercator.validateTile(TILE), TILE, 'no changes')
//   t.deepEqual(mercator.validateTile([-1, 0, 2]), [3, 0, 2], 'tile x wraps around')
//   t.deepEqual(mercator.validateTile([4, 0, 2]), [0, 0, 2], 'tile x wraps around')
//   t.end()
// })

// test('validate -- validateLngLat', t => {
//   t.deepEqual(mercator.validateLngLat(LNGLAT), LNGLAT)
//   t.end()
// })

// test('validate -- validTile', t => {
//   // Missing value
//   t.false(mercator.validTile([undefined, 30, 5]))
//   t.false(mercator.validTile([30, null, 5]))
//   t.false(mercator.validTile([25, 60, null]))

//   // Valid Tiles
//   t.true(mercator.validTile([-10, 30, 5]))
//   t.true(mercator.validTile([30, -10, 5]))
//   t.true(mercator.validTile([25, 60, 3]))
//   t.true(mercator.validTile([2, 1, 3]))
//   t.end()
// })

// test('maxBBox', t => {
//   t.throws(() => mercator.maxBBox(null), 'null')
//   t.throws(() => mercator.maxBBox(undefined), 'undefined')
//   t.deepEqual(mercator.maxBBox([-20, -30, 20, 30]), [-20, -30, 20, 30], 'single')
//   t.deepEqual(mercator.maxBBox([[-20, -30, 20, 30], [-110, -30, 120, 80]]), [-110, -30, 120, 80], 'multiple')
//   t.end()
// })

// test('pointToTile', t => {
//   var tile = mercator.pointToTile([0, 0], 10)
//   t.equal(tile.length, 3)
//   t.equal(tile[2], 10)
//   t.end()
// })

// test('pointToTileFraction', t => {
//   const tile = mercator.pointToTileFraction([-95.93965530395508, 41.26000108568697], 9)
//   t.ok(tile, 'convert point to tile fraction')
//   t.equal(tile[0], 119.552490234375)
//   t.equal(tile[1], 191.47119140625)
//   t.equal(tile[2], 9)
//   t.end()
// })

// test('pointToTile', t => {
//   var tile = mercator.pointToTile([-77.03239381313323, 38.91326516559442], 10)
//   t.equal(tile.length, 3)
//   t.equal(tile[0], 292)
//   t.equal(tile[1], 391)
//   t.equal(tile[2], 10)
//   t.equal(mercator.tileToQuadkey(tile), '2102322100', 'pointToTile')
//   t.deepEqual(mercator.pointToTile([180, 85], 0), [0, 0, 0], 'zoom 0 only has 1 available tile')
//   t.deepEqual(mercator.pointToTile([180, 85], 1), [0, 0, 1])
//   t.end()
// })

// test('pointToTile -- cross meridian', t => {
//   // X axis
//   t.deepEqual(mercator.pointToTile([-180, 85], 2), [0, 0, 2], '[-180, 85] zoom 2')
//   t.deepEqual(mercator.pointToTile([180, 85], 2), [0, 0, 2], '[+180, 85] zoom 2')
//   t.deepEqual(mercator.pointToTile([-185, 85], 2), [3, 0, 2], '[-185, 85] zoom 2')
//   t.deepEqual(mercator.pointToTile([185, 85], 2), [0, 0, 2], '[+185, 85] zoom 2')
//   t.end()
// })
