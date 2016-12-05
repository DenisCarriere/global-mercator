# [Global Mercator](https://www.npmjs.com/package/global-mercator)

[![Build Status](https://travis-ci.org/DenisCarriere/global-mercator.svg?branch=master)](https://travis-ci.org/DenisCarriere/global-mercator)
[![CircleCI](https://circleci.com/gh/DenisCarriere/global-mercator.svg?style=svg)](https://circleci.com/gh/DenisCarriere/global-mercator)
[![Coverage Status](https://coveralls.io/repos/github/DenisCarriere/global-mercator/badge.svg?branch=master)](https://coveralls.io/github/DenisCarriere/global-mercator?branch=master)
[![npm version](https://badge.fury.io/js/global-mercator.svg)](https://badge.fury.io/js/global-mercator)
[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/DenisCarriere/global-mercator/master/LICENSE)

A set of tools geospatial tools to help with TMS, Google (XYZ) Tiles.

> This library is insipered by GDAL2Tiles, Google Summer of Code 2007 & 2008

Another great simplistic tile library is [`tilebelt`](https://github.com/mapbox/tilebelt).

## Install

```bash
$ npm install --save global-mercator
```

## Quickstart

```javascript
import * as mercator from 'global-mercator'

const tile = [10, 15, 8] // x, y, zoom

mercator.tileToBBox(tile)
// [ -165.937, -82.853, -164.531, -82.676 ]
```

## Features

| Function                                                  | Description |
|-----------------------------------------------------------|:------------|
| [lngLatToMeters(LngLat)](#lnglattometers)                 | Converts LngLat coordinates to Meters coordinates.
| [metersToLngLat(Meters)](#meterstolnglat)                 | Converts Meters coordinates to LngLat coordinates.
| [metersToPixels(Meters, zoom)](#meterstopixels)           | Converts Meters coordinates to Pixels coordinates.
| [lngLatToTile(LngLat, zoom)](#lnglattotile)               | Converts LngLat coordinates to TMS Tile.
| [lngLatToGoogle(LngLat, zoom)](#lnglattogoogle)           | Converts LngLat coordinates to Google (XYZ) Tile.
| [metersToTile(Meters, zoom)](#meterstotile)               | Converts Meters coordinates to TMS Tile.
| [pixelsToMeters(Pixels)](#pixelstometers)                 | Converts Pixels coordinates to Meters coordinates.
| [pixelsToTile(Pixels)](#pixelstotile)                     | Converts Pixels coordinates to TMS Tile.
| [tileToBBoxMeters(tile)](#tiletobboxmeters)               | Converts TMS Tile to bbox in Meters coordinates.
| [tileToBBox(tile)](#tiletobbox)                           | Converts TMS Tile to bbox in LngLat coordinates.
| [googleToBBoxMeters(google)](#googletobboxmeters)         | Converts Google (XYZ) Tile to bbox in Meters coordinates.
| [googleToBBox(google)](#googletobbox)                     | Converts Google (XYZ) Tile to bbox in LngLat coordinates.
| [tileToGoogle(tile)](#tiletogoogle)                       | Converts TMS Tile to Google (XYZ) Tile.
| [googleToTile(google)](#googletotile)                     | Converts Google (XYZ) Tile to TMS Tile.
| [googleToQuadkey(google)](#googletoquadkey)               | Converts Google (XYZ) Tile to Quadkey.
| [tileToQuadkey(tile)](#tiletoquadkey)                     | Converts TMS Tile to QuadKey.
| [quadkeyToTile(quadkey)](#quadkeytotile)                  | Converts Quadkey to TMS Tile.
| [quadkeyToGoogle(quadkey)](#quadkeytogoogle)              | Converts Quadkey to Google (XYZ) Tile.
| [bboxToMeters(bbox)](#bboxtometers)                       | Converts BBox from LngLat coordinates to Meters coordinates
| [grid(BBox, minZoom, maxZoom)](#grid)                     | Creates an Iterator of Tiles from a given BBox
| [gridBulk(BBox, minZoom, maxZoom, size)](#gridbulk)       | Creates a bulk Iterator of Tiles from a given BBox
| [gridLevels(BBox, minZoom, maxZoom)](#gridlevels)         | Creates a grid level pattern of arrays
| [gridCount(BBox, minZoom, maxZoom)](#gridcount)           | Counts the total amount of tiles from a given BBox
