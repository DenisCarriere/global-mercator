/**
 * Types
 */
export declare type LngLat = [number, number];
export declare type Meters = [number, number];
export declare type Pixels = [number, number, number];
export declare type BBox = [number, number, number, number];
export declare type Google = [number, number, number];
export declare type Tile = [number, number, number];
export declare type Quadkey = string;

/**
 * Methods
 */
export declare function hash(tile: Tile): number;
export declare function bboxToCenter(bbox: BBox): LngLat;
export declare function lngLatToMeters(lnglat: LngLat, validate?: boolean): Meters;
export declare function metersToLngLat(meters: Meters): LngLat;
export declare function metersToPixels(meters: Meters, zoom: number): Pixels;
export declare function lngLatToTile(lnglat: LngLat, zoom: number, validate?: boolean): Tile;
export declare function lngLatToGoogle(lnglat: LngLat, zoom: number, validate?: boolean): Google;
export declare function metersToTile(meters: Meters, zoom: number): Tile;
export declare function pixelsToMeters(pixels: Pixels, validate?: boolean): Meters;
export declare function pixelsToTile(pixels: Pixels, validate?: boolean): Tile;
export declare function tileToBBoxMeters(tile: Tile, validate?: boolean): BBox;
export declare function tileToBBox(tile: Tile, validate?: boolean): BBox;
export declare function googleToBBoxMeters(google: Google): BBox;
export declare function googleToBBox(google: Google): BBox;
export declare function tileToGoogle(tile: Tile, validate?: boolean): Google;
export declare function googleToTile(google: Google): Tile;
export declare function googleToQuadkey(google: Google): string;
export declare function tileToQuadkey(tile: Tile, validate?: boolean): string;
export declare function quadkeyToTile(quadkey: string): Tile;
export declare function quadkeyToGoogle(quadkey: string): Google;
export declare function bboxToMeters(bbox: BBox): BBox;
export declare function validateTile(tile: Tile, validate?: boolean): Tile;
export declare function validateZoom(zoom: number, validate?: boolean): number;
export declare function validateLngLat(lnglat: LngLat, validate?: boolean): LngLat;
export declare function resolution(zoom: number): number;
export declare function range(start: number, stop?: number, step?: number): number[];
export declare function maxBBox(array: BBox|BBox[]): BBox
export declare function validTile(tile: Tile): boolean;
export declare function longitude(lng: number): number;
export declare function latitude(lat: number): number;
export declare function pointToTileFraction(lnglat: LngLat, zoom: number, validate?: boolean): Tile;
export declare function pointToTile(lnglat: LngLat, zoom: number, validate?: boolean): Tile;
export declare function wrapTile(tile: Tile): Tile;