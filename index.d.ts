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
export declare type GridLevel = [number[], number[], number];

/**
 * Functions
 */
export declare function hash(tile: Tile): number;
export declare function bboxToCenter(bbox: BBox): LngLat;
export declare function lngLatToMeters(lnglat: LngLat): Meters;
export declare function metersToLngLat(meters: Meters): LngLat;
export declare function metersToPixels(meters: Meters, zoom: number): Pixels;
export declare function lngLatToTile(lnglat: LngLat, zoom: number): Tile;
export declare function lngLatToGoogle(lnglat: LngLat, zoom: number): Google;
export declare function metersToTile(meters: Meters, zoom: number): Tile;
export declare function pixelsToMeters(pixels: Pixels): Meters;
export declare function pixelsToTile(pixels: Pixels): Tile;
export declare function tileToBBoxMeters(tile: Tile): BBox;
export declare function tileToBBox(tile: Tile): BBox;
export declare function googleToBBoxMeters(google: Google): BBox;
export declare function googleToBBox(google: Google): BBox;
export declare function tileToGoogle(tile: Tile): Google;
export declare function googleToTile(google: Google): Tile;
export declare function googleToQuadkey(google: Google): string;
export declare function tileToQuadkey(tile: Tile): string;
export declare function quadkeyToTile(quadkey: string): Tile;
export declare function quadkeyToGoogle(quadkey: string): Google;
export declare function bboxToMeters(bbox: BBox): BBox;
export declare function grid(bbox: BBox, minZoom: number, maxZoom: number): Iterator<Tile>;
export declare function gridBulk(bbox: BBox, minZoom: number, maxZoom: number, size: number): Iterator<Tile[]>;
export declare function gridLevels(bbox: BBox, minZoom: number, maxZoom: number): GridLevel[];
export declare function gridCount(bbox: BBox, minZoom: number, maxZoom: number): number;
export declare function validateTile(tile: Tile): Tile;
export declare function validateZoom(zoom: number): number;
export declare function validateLngLat(lnglat: LngLat): LngLat;
export declare function validatePixels(pixels: Pixels): Pixels;
export declare function resolution(zoom: number): number;
export declare function range(start: number, stop?: number, step?: number): number[];
