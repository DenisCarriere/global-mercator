import * as mercator from './index'

const ZOOM = 13
const TILE: mercator.Tile = [2389, 5245, 13]
const GOOGLE: mercator.Google = [2389, 2946, 13]
const QUADKEY = '0302321010121'
const QUADKEY_BAD = '030486861'
const LNGLAT: mercator.LngLat = [-75.00005722045897, 44.99988840247]
const METERS: mercator.Meters = [-8348968.179247875, 5621503.917462073]
const PIXELS: mercator.Pixels = [611669, 1342753, 13]
const BBOX_METERS: mercator.BBox = [-8350592.466098936, 5620873.311978721, -8345700.496288682, 5625765.281788976]
const BBOX: mercator.BBox = [-75.01464843750001, 44.99588261816546, -74.97070312499999, 45.02695045318546]

function toBeCloseToArray(array1: Array<number>, array2: Array<number>) {
  array1.map((value, index) => {
    expect(value).toBeCloseTo(array2[index], 2)
  })
}

test('lngLatToMeters', () => {
  toBeCloseToArray(mercator.lngLatToMeters(LNGLAT), METERS)
})

test('metersToLngLat', () => {
  expect(mercator.metersToLngLat(METERS)).toEqual(LNGLAT)
})

test('metersToPixels', () => {
  toBeCloseToArray(mercator.metersToPixels(METERS, ZOOM), PIXELS)
})

test('pixelsToTile', () => {
  expect(mercator.pixelsToTile(PIXELS)).toEqual(TILE)
  expect(mercator.pixelsToTile([0, 0, 0])).toEqual([0, 0, 0])
})

test('metersToTile', () => {
  expect(mercator.metersToTile(METERS, ZOOM)).toEqual(TILE)
  expect(mercator.metersToTile(METERS, 0)).toEqual([0, 0, 0])
})

test('pixelsToMeters', () => {
  toBeCloseToArray(mercator.pixelsToMeters(PIXELS), METERS)
})

test('tileToBbox', () => {
  toBeCloseToArray(mercator.tileToBBox(TILE), BBOX)
  toBeCloseToArray(mercator.tileToBBox([0, 0, 0]), [-180, -85.05112877980659, 180, 85.05112877980659])
})

test('tileToBBoxMeters', () => {
  toBeCloseToArray(mercator.tileToBBoxMeters(TILE), BBOX_METERS)
})

test('tileToGoogle', () => {
  expect(mercator.tileToGoogle(TILE)).toEqual(GOOGLE)
  expect(mercator.tileToGoogle([0, 0, 0])).toEqual([0, 0, 0])
})

test('tileToQuadkey', () => {
  expect(mercator.tileToQuadkey(TILE)).toEqual(QUADKEY)
  expect(mercator.tileToQuadkey([0, 0, 0])).toEqual('')
})

test('quadKeyToGoogle', () => {
  expect(mercator.quadkeyToGoogle(QUADKEY)).toEqual(GOOGLE)
})

test('quadKeyToTile', () => {
  expect(mercator.quadkeyToTile(QUADKEY)).toEqual(TILE)
})

test('Throws Error quadkeyToTile', () => {
  expect(() => mercator.quadkeyToTile(QUADKEY_BAD)).toThrow()
})

test('googleToBbox', () => {
  toBeCloseToArray(mercator.googleToBBox(GOOGLE), BBOX)
})

test('googleToBBoxMeters', () => {
  toBeCloseToArray(mercator.googleToBBoxMeters(GOOGLE), BBOX_METERS)
})

test('lngLatToGoogle', () => {
  expect(mercator.lngLatToGoogle(LNGLAT, ZOOM)).toEqual(GOOGLE)
  expect(mercator.lngLatToGoogle(LNGLAT, 0)).toEqual([0, 0, 0])
})

test('googleToQuadKey', () => {
  expect(mercator.googleToQuadkey(GOOGLE)).toEqual(QUADKEY)
})

test('Throws Error Bad LngLat', () => {
  expect(() => mercator.validateLngLat([-120, 220])).toThrow()
  expect(() => mercator.validateLngLat([120, 220])).toThrow()
  expect(() => mercator.validateLngLat([-220, 45])).toThrow()
  expect(() => mercator.validateLngLat([220, 45])).toThrow()
})

test('bboxToMeters', () => {
  toBeCloseToArray(mercator.bboxToMeters(BBOX), BBOX_METERS)
})

test('googleToTile', () => {
  expect(mercator.googleToTile(GOOGLE)).toEqual(TILE)
})

test('lngLatToTile', () => {
  expect(mercator.lngLatToTile(LNGLAT, ZOOM)).toEqual(TILE)
  expect(mercator.lngLatToTile(LNGLAT, 0)).toEqual([0, 0, 0])
})

test('validateMeters', () => {
  // t.throws(() => mercator.validateMeters([200000, 999150000]), 'Meters [y] cannot be greater than 20037508.342789244')
  // t.throws(() => mercator.validateMeters([200000, -999150000]), 'Meters [y] cannot be less than -20037508.342789244')
  // t.throws(() => mercator.validateMeters([999200000, 150000]), 'Meters [x] cannot be greater than 20037508.342789244')
  // t.throws(() => mercator.validateMeters([-999200000, -150000]), 'Meters [x] cannot be less than -20037508.342789244')
  expect(mercator.validateMeters(METERS)).toEqual(METERS)
})

test('validateZoom', () => {
  expect(() => mercator.validateZoom(-2)).toThrow()
  expect(() => mercator.validateZoom(35)).toThrow()
})

test('validateTile', () => {
  expect(() => mercator.validateTile([-10, 30, 5])).toThrow()
  expect(() => mercator.validateTile([30, -10, 5])).toThrow()
  expect(() => mercator.validateTile([25, 60, 3])).toThrow()
  expect(mercator.validateTile(TILE)).toEqual(TILE)
})

test('validateLngLat', () => {
  expect(mercator.validateLngLat(LNGLAT)).toEqual(LNGLAT)
})

  test('validatePixels', () => {
  expect(mercator.validatePixels(PIXELS)).toEqual(PIXELS)
})

test('resolution', () => {
  expect(mercator.resolution(ZOOM)).toBe(19.109257071294063)
})

test('range', () => {
  expect(mercator.range(3)).toEqual([0, 1, 2])
  expect(mercator.range(0, 3)).toEqual([0, 1, 2])
  expect(mercator.range(3, 0, -1)).toEqual([3, 2, 1])
})

test('grid', () => {
  const iterable = mercator.grid([-180.0, -90.0, 180, 90], 3, 21)
  expect(iterable.next().value).toEqual([0, 0, 3])
})

test('gridBulk', () => {
  const iterable = mercator.gridBulk([-180.0, -90.0, 180, 90], 3, 5, 5)
  while (true) {
    const { value, done } = iterable.next()
    if (done) { break }
    expect(typeof value).toBe(typeof [])
  }
})

test('gridCount', () => {
  expect(mercator.gridCount([-180.0, -90.0, 180, 90], 3, 21)).toBe(37773648480704)
})

test('gridLevels', () => {
  expect(mercator.gridLevels([-180.0, -90.0, 180, 90], 3, 21).length).toBe(19)
})