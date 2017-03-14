const Benchmark = require('benchmark')
const mercator = require('.')

const ZOOM = 13
const TILE = [2389, 5245, 13]
const GOOGLE = [2389, 2946, 13]
const QUADKEY = '0302321010121'
const LNGLAT = [-75.000057, 44.999888]
const METERS = [-8348968.179248, 5621503.917462]
const PIXELS = [611669, 1342753, 13]
const BBOX = [-75.014648, 44.995883, -74.970703, 45.026950]

/**
 * bboxToCenter x 965,664 ops/sec ±1.91% (88 runs sampled)
 * bboxToMeters x 422,599 ops/sec ±1.01% (91 runs sampled)
 * hash x 43,542,539 ops/sec ±1.10% (90 runs sampled)
 * lngLatToMeters x 827,780 ops/sec ±1.01% (92 runs sampled)
 * lngLatToGoogle x 717,760 ops/sec ±0.81% (89 runs sampled)
 * lngLatToTile x 760,254 ops/sec ±0.87% (90 runs sampled)
 * metersToLngLat x 888,073 ops/sec ±1.00% (91 runs sampled)
 * metersToPixels x 24,727,823 ops/sec ±0.99% (88 runs sampled)
 * metersToTile x 14,025,048 ops/sec ±1.15% (88 runs sampled)
 * pixelsToTile x 17,233,422 ops/sec ±0.81% (89 runs sampled)
 * tileToBBox x 222,543 ops/sec ±0.88% (88 runs sampled)
 * tileToBBoxMeters x 459,586 ops/sec ±0.98% (90 runs sampled)
 * tileToGoogle x 18,522,013 ops/sec ±1.12% (90 runs sampled)
 * tileToQuadkey x 135,456 ops/sec ±1.01% (88 runs sampled)
 * quadkeyToGoogle x 146,996 ops/sec ±0.91% (89 runs sampled)
 * googleToBBox x 224,943 ops/sec ±0.88% (91 runs sampled)
 * range x 2,906,181 ops/sec ±1.04% (89 runs sampled)
 */

const suite = new Benchmark.Suite('global-mercator')
suite
  .add('bboxToCenter', () => mercator.bboxToCenter([90, -45, 85, -50]))
  .add('bboxToMeters', () => mercator.bboxToMeters(BBOX))
  .add('hash', () => mercator.hash([312, 480, 4]))
  .add('lngLatToMeters', () => mercator.lngLatToMeters(LNGLAT))
  .add('lngLatToGoogle', () => mercator.lngLatToGoogle(LNGLAT, ZOOM))
  .add('lngLatToTile', () => mercator.lngLatToTile(LNGLAT, ZOOM))
  .add('metersToLngLat', () => mercator.metersToLngLat(METERS))
  .add('metersToPixels', () => mercator.metersToPixels(METERS, ZOOM))
  .add('metersToTile', () => mercator.metersToTile(METERS, ZOOM))
  .add('pixelsToTile', () => mercator.pixelsToTile(PIXELS))
  .add('tileToBBox', () => mercator.tileToBBox(TILE))
  .add('tileToBBoxMeters', () => mercator.tileToBBoxMeters(TILE))
  .add('tileToGoogle', () => mercator.tileToGoogle(TILE))
  .add('tileToQuadkey', () => mercator.tileToQuadkey(TILE))
  .add('quadkeyToGoogle', () => mercator.quadkeyToGoogle(QUADKEY))
  .add('googleToBBox', () => mercator.googleToBBox(GOOGLE))
  .add('range', () => mercator.range(0, 100))
  .on('cycle', (event) => { console.log(String(event.target)) })
  .on('complete', () => {})
  .run()
