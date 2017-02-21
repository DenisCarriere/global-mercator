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
