(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.mercator = factory());
}(this, (function () {

/**
 * Callback for coordEach
 *
 * @private
 * @callback coordEachCallback
 * @param {[number, number]} currentCoords The current coordinates being processed.
 * @param {number} currentIndex The index of the current element being processed in the
 * array.Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
 */

/**
 * Iterate over coordinates in any GeoJSON object, similar to Array.forEach()
 *
 * @name coordEach
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (currentCoords, currentIndex)
 * @param {boolean} [excludeWrapCoord=false] whether or not to include
 * the final coordinate of LinearRings that wraps the ring in its iteration.
 * @example
 * var features = {
 *   "type": "FeatureCollection",
 *   "features": [
 *     {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [26, 37]
 *       }
 *     },
 *     {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [36, 53]
 *       }
 *     }
 *   ]
 * };
 * turf.coordEach(features, function (currentCoords, currentIndex) {
 *   //=currentCoords
 *   //=currentIndex
 * });
 */
function coordEach(layer, callback, excludeWrapCoord) {
    var i, j, k, g, l, geometry, stopG, coords,
        geometryMaybeCollection,
        wrapShrink = 0,
        currentIndex = 0,
        isGeometryCollection,
        isFeatureCollection = layer.type === 'FeatureCollection',
        isFeature = layer.type === 'Feature',
        stop = isFeatureCollection ? layer.features.length : 1;

  // This logic may look a little weird. The reason why it is that way
  // is because it's trying to be fast. GeoJSON supports multiple kinds
  // of objects at its root: FeatureCollection, Features, Geometries.
  // This function has the responsibility of handling all of them, and that
  // means that some of the `for` loops you see below actually just don't apply
  // to certain inputs. For instance, if you give this just a
  // Point geometry, then both loops are short-circuited and all we do
  // is gradually rename the input until it's called 'geometry'.
  //
  // This also aims to allocate as few resources as possible: just a
  // few numbers and booleans, rather than any temporary arrays as would
  // be required with the normalization approach.
    for (i = 0; i < stop; i++) {

        geometryMaybeCollection = (isFeatureCollection ? layer.features[i].geometry :
        (isFeature ? layer.geometry : layer));
        isGeometryCollection = geometryMaybeCollection.type === 'GeometryCollection';
        stopG = isGeometryCollection ? geometryMaybeCollection.geometries.length : 1;

        for (g = 0; g < stopG; g++) {
            geometry = isGeometryCollection ?
            geometryMaybeCollection.geometries[g] : geometryMaybeCollection;
            coords = geometry.coordinates;

            wrapShrink = (excludeWrapCoord &&
                (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon')) ?
                1 : 0;

            if (geometry.type === 'Point') {
                callback(coords, currentIndex);
                currentIndex++;
            } else if (geometry.type === 'LineString' || geometry.type === 'MultiPoint') {
                for (j = 0; j < coords.length; j++) {
                    callback(coords[j], currentIndex);
                    currentIndex++;
                }
            } else if (geometry.type === 'Polygon' || geometry.type === 'MultiLineString') {
                for (j = 0; j < coords.length; j++)
                    for (k = 0; k < coords[j].length - wrapShrink; k++) {
                        callback(coords[j][k], currentIndex);
                        currentIndex++;
                    }
            } else if (geometry.type === 'MultiPolygon') {
                for (j = 0; j < coords.length; j++)
                    for (k = 0; k < coords[j].length; k++)
                        for (l = 0; l < coords[j][k].length - wrapShrink; l++) {
                            callback(coords[j][k][l], currentIndex);
                            currentIndex++;
                        }
            } else if (geometry.type === 'GeometryCollection') {
                for (j = 0; j < geometry.geometries.length; j++)
                    coordEach(geometry.geometries[j], callback, excludeWrapCoord);
            } else {
                throw new Error('Unknown Geometry Type');
            }
        }
    }
}
var coordEach_1 = coordEach;

/**
 * Callback for coordReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @private
 * @callback coordReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {[number, number]} currentCoords The current coordinate being processed.
 * @param {number} currentIndex The index of the current element being processed in the
 * array.Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
 */

/**
 * Reduce coordinates in any GeoJSON object, similar to Array.reduce()
 *
 * @name coordReduce
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (previousValue, currentCoords, currentIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @param {boolean} [excludeWrapCoord=false] whether or not to include
 * the final coordinate of LinearRings that wraps the ring in its iteration.
 * @returns {*} The value that results from the reduction.
 * @example
 * var features = {
 *   "type": "FeatureCollection",
 *   "features": [
 *     {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [26, 37]
 *       }
 *     },
 *     {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [36, 53]
 *       }
 *     }
 *   ]
 * };
 * turf.coordReduce(features, function (previousValue, currentCoords, currentIndex) {
 *   //=previousValue
 *   //=currentCoords
 *   //=currentIndex
 *   return currentCoords;
 * });
 */
function coordReduce(layer, callback, initialValue, excludeWrapCoord) {
    var previousValue = initialValue;
    coordEach(layer, function (currentCoords, currentIndex) {
        if (currentIndex === 0 && initialValue === undefined) {
            previousValue = currentCoords;
        } else {
            previousValue = callback(previousValue, currentCoords, currentIndex);
        }
    }, excludeWrapCoord);
    return previousValue;
}
var coordReduce_1 = coordReduce;

/**
 * Callback for propEach
 *
 * @private
 * @callback propEachCallback
 * @param {*} currentProperties The current properties being processed.
 * @param {number} currentIndex The index of the current element being processed in the
 * array.Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
 */

/**
 * Iterate over properties in any GeoJSON object, similar to Array.forEach()
 *
 * @name propEach
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (currentProperties, currentIndex)
 * @example
 * var features = {
 *   "type": "FeatureCollection",
 *   "features": [
 *     {
 *       "type": "Feature",
 *       "properties": {"foo": "bar"},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [26, 37]
 *       }
 *     },
 *     {
 *       "type": "Feature",
 *       "properties": {"hello": "world"},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [36, 53]
 *       }
 *     }
 *   ]
 * };
 * turf.propEach(features, function (currentProperties, currentIndex) {
 *   //=currentProperties
 *   //=currentIndex
 * });
 */
function propEach(layer, callback) {
    var i;
    switch (layer.type) {
    case 'FeatureCollection':
        for (i = 0; i < layer.features.length; i++) {
            callback(layer.features[i].properties, i);
        }
        break;
    case 'Feature':
        callback(layer.properties, 0);
        break;
    }
}
var propEach_1 = propEach;


/**
 * Callback for propReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @private
 * @callback propReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {*} currentProperties The current properties being processed.
 * @param {number} currentIndex The index of the current element being processed in the
 * array.Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
 */

/**
 * Reduce properties in any GeoJSON object into a single value,
 * similar to how Array.reduce works. However, in this case we lazily run
 * the reduction, so an array of all properties is unnecessary.
 *
 * @name propReduce
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (previousValue, currentProperties, currentIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {*} The value that results from the reduction.
 * @example
 * var features = {
 *   "type": "FeatureCollection",
 *   "features": [
 *     {
 *       "type": "Feature",
 *       "properties": {"foo": "bar"},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [26, 37]
 *       }
 *     },
 *     {
 *       "type": "Feature",
 *       "properties": {"hello": "world"},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [36, 53]
 *       }
 *     }
 *   ]
 * };
 * turf.propReduce(features, function (previousValue, currentProperties, currentIndex) {
 *   //=previousValue
 *   //=currentProperties
 *   //=currentIndex
 *   return currentProperties
 * });
 */
function propReduce(layer, callback, initialValue) {
    var previousValue = initialValue;
    propEach(layer, function (currentProperties, currentIndex) {
        if (currentIndex === 0 && initialValue === undefined) {
            previousValue = currentProperties;
        } else {
            previousValue = callback(previousValue, currentProperties, currentIndex);
        }
    });
    return previousValue;
}
var propReduce_1 = propReduce;

/**
 * Callback for featureEach
 *
 * @private
 * @callback featureEachCallback
 * @param {Feature<any>} currentFeature The current feature being processed.
 * @param {number} currentIndex The index of the current element being processed in the
 * array.Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
 */

/**
 * Iterate over features in any GeoJSON object, similar to
 * Array.forEach.
 *
 * @name featureEach
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (currentFeature, currentIndex)
 * @example
 * var features = {
 *   "type": "FeatureCollection",
 *   "features": [
 *     {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [26, 37]
 *       }
 *     },
 *     {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [36, 53]
 *       }
 *     }
 *   ]
 * };
 * turf.featureEach(features, function (currentFeature, currentIndex) {
 *   //=currentFeature
 *   //=currentIndex
 * });
 */
function featureEach(layer, callback) {
    if (layer.type === 'Feature') {
        callback(layer, 0);
    } else if (layer.type === 'FeatureCollection') {
        for (var i = 0; i < layer.features.length; i++) {
            callback(layer.features[i], i);
        }
    }
}
var featureEach_1 = featureEach;

/**
 * Callback for featureReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @private
 * @callback featureReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {Feature<any>} currentFeature The current Feature being processed.
 * @param {number} currentIndex The index of the current element being processed in the
 * array.Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
 */

/**
 * Reduce features in any GeoJSON object, similar to Array.reduce().
 *
 * @name featureReduce
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (previousValue, currentFeature, currentIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {*} The value that results from the reduction.
 * @example
 * var features = {
 *   "type": "FeatureCollection",
 *   "features": [
 *     {
 *       "type": "Feature",
 *       "properties": {"foo": "bar"},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [26, 37]
 *       }
 *     },
 *     {
 *       "type": "Feature",
 *       "properties": {"hello": "world"},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [36, 53]
 *       }
 *     }
 *   ]
 * };
 * turf.featureReduce(features, function (previousValue, currentFeature, currentIndex) {
 *   //=previousValue
 *   //=currentFeature
 *   //=currentIndex
 *   return currentFeature
 * });
 */
function featureReduce(layer, callback, initialValue) {
    var previousValue = initialValue;
    featureEach(layer, function (currentFeature, currentIndex) {
        if (currentIndex === 0 && initialValue === undefined) {
            previousValue = currentFeature;
        } else {
            previousValue = callback(previousValue, currentFeature, currentIndex);
        }
    });
    return previousValue;
}
var featureReduce_1 = featureReduce;

/**
 * Get all coordinates from any GeoJSON object.
 *
 * @name coordAll
 * @param {Object} layer any GeoJSON object
 * @returns {Array<Array<number>>} coordinate position array
 * @example
 * var features = {
 *   "type": "FeatureCollection",
 *   "features": [
 *     {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [26, 37]
 *       }
 *     },
 *     {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [36, 53]
 *       }
 *     }
 *   ]
 * };
 * var coords = turf.coordAll(features);
 * //=coords
 */
function coordAll(layer) {
    var coords = [];
    coordEach(layer, function (coord) {
        coords.push(coord);
    });
    return coords;
}
var coordAll_1 = coordAll;

/**
 * Iterate over each geometry in any GeoJSON object, similar to Array.forEach()
 *
 * @name geomEach
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (currentGeometry, currentIndex)
 * @example
 * var features = {
 *   "type": "FeatureCollection",
 *   "features": [
 *     {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [26, 37]
 *       }
 *     },
 *     {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [36, 53]
 *       }
 *     }
 *   ]
 * };
 * turf.geomEach(features, function (currentGeometry, currentIndex) {
 *   //=currentGeometry
 *   //=currentIndex
 * });
 */
function geomEach(layer, callback) {
    var i, j, g, geometry, stopG,
        geometryMaybeCollection,
        isGeometryCollection,
        currentIndex = 0,
        isFeatureCollection = layer.type === 'FeatureCollection',
        isFeature = layer.type === 'Feature',
        stop = isFeatureCollection ? layer.features.length : 1;

  // This logic may look a little weird. The reason why it is that way
  // is because it's trying to be fast. GeoJSON supports multiple kinds
  // of objects at its root: FeatureCollection, Features, Geometries.
  // This function has the responsibility of handling all of them, and that
  // means that some of the `for` loops you see below actually just don't apply
  // to certain inputs. For instance, if you give this just a
  // Point geometry, then both loops are short-circuited and all we do
  // is gradually rename the input until it's called 'geometry'.
  //
  // This also aims to allocate as few resources as possible: just a
  // few numbers and booleans, rather than any temporary arrays as would
  // be required with the normalization approach.
    for (i = 0; i < stop; i++) {

        geometryMaybeCollection = (isFeatureCollection ? layer.features[i].geometry :
        (isFeature ? layer.geometry : layer));
        isGeometryCollection = geometryMaybeCollection.type === 'GeometryCollection';
        stopG = isGeometryCollection ? geometryMaybeCollection.geometries.length : 1;

        for (g = 0; g < stopG; g++) {
            geometry = isGeometryCollection ?
            geometryMaybeCollection.geometries[g] : geometryMaybeCollection;

            if (geometry.type === 'Point' ||
                geometry.type === 'LineString' ||
                geometry.type === 'MultiPoint' ||
                geometry.type === 'Polygon' ||
                geometry.type === 'MultiLineString' ||
                geometry.type === 'MultiPolygon') {
                callback(geometry, currentIndex);
                currentIndex++;
            } else if (geometry.type === 'GeometryCollection') {
                for (j = 0; j < geometry.geometries.length; j++) {
                    callback(geometry.geometries[j], currentIndex);
                    currentIndex++;
                }
            } else {
                throw new Error('Unknown Geometry Type');
            }
        }
    }
}
var geomEach_1 = geomEach;

/**
 * Callback for geomReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @private
 * @callback geomReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {*} currentGeometry The current Feature being processed.
 * @param {number} currentIndex The index of the current element being processed in the
 * array.Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
 */

/**
 * Reduce geometry in any GeoJSON object, similar to Array.reduce().
 *
 * @name geomReduce
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (previousValue, currentGeometry, currentIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {*} The value that results from the reduction.
 * @example
 * var features = {
 *   "type": "FeatureCollection",
 *   "features": [
 *     {
 *       "type": "Feature",
 *       "properties": {"foo": "bar"},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [26, 37]
 *       }
 *     },
 *     {
 *       "type": "Feature",
 *       "properties": {"hello": "world"},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [36, 53]
 *       }
 *     }
 *   ]
 * };
 * turf.geomReduce(features, function (previousValue, currentGeometry, currentIndex) {
 *   //=previousValue
 *   //=currentGeometry
 *   //=currentIndex
 *   return currentGeometry
 * });
 */
function geomReduce(layer, callback, initialValue) {
    var previousValue = initialValue;
    geomEach(layer, function (currentGeometry, currentIndex) {
        if (currentIndex === 0 && initialValue === undefined) {
            previousValue = currentGeometry;
        } else {
            previousValue = callback(previousValue, currentGeometry, currentIndex);
        }
    });
    return previousValue;
}
var geomReduce_1 = geomReduce;

var index$6 = {
	coordEach: coordEach_1,
	coordReduce: coordReduce_1,
	propEach: propEach_1,
	propReduce: propReduce_1,
	featureEach: featureEach_1,
	featureReduce: featureReduce_1,
	coordAll: coordAll_1,
	geomEach: geomEach_1,
	geomReduce: geomReduce_1
};

var each = index$6.coordEach;

/**
 * Takes a set of features, calculates the bbox of all input features, and returns a bounding box.
 *
 * @name bbox
 * @param {(Feature|FeatureCollection)} geojson input features
 * @return {Array<number>} bbox extent in [minX, minY, maxX, maxY] order
 * @example
 * var pt1 = turf.point([114.175329, 22.2524])
 * var pt2 = turf.point([114.170007, 22.267969])
 * var pt3 = turf.point([114.200649, 22.274641])
 * var pt4 = turf.point([114.200649, 22.274641])
 * var pt5 = turf.point([114.186744, 22.265745])
 * var features = turf.featureCollection([pt1, pt2, pt3, pt4, pt5])
 *
 * var bbox = turf.bbox(features);
 *
 * var bboxPolygon = turf.bboxPolygon(bbox);
 *
 * //=bbox
 *
 * //=bboxPolygon
 */
var index$4 = function (geojson) {
    var bbox = [Infinity, Infinity, -Infinity, -Infinity];
    each(geojson, function (coord) {
        if (bbox[0] > coord[0]) bbox[0] = coord[0];
        if (bbox[1] > coord[1]) bbox[1] = coord[1];
        if (bbox[2] < coord[0]) bbox[2] = coord[0];
        if (bbox[3] < coord[1]) bbox[3] = coord[1];
    });
    return bbox;
};

/**
 * Wraps a GeoJSON {@link Geometry} in a GeoJSON {@link Feature}.
 *
 * @name feature
 * @param {Geometry} geometry input geometry
 * @param {Object} properties properties
 * @returns {FeatureCollection} a FeatureCollection of input features
 * @example
 * var geometry = {
 *      "type": "Point",
 *      "coordinates": [
 *        67.5,
 *        32.84267363195431
 *      ]
 *    }
 *
 * var feature = turf.feature(geometry);
 *
 * //=feature
 */
function feature(geometry, properties) {
    if (!geometry) throw new Error('No geometry passed');

    return {
        type: 'Feature',
        properties: properties || {},
        geometry: geometry
    };
}
var feature_1 = feature;

/**
 * Takes coordinates and properties (optional) and returns a new {@link Point} feature.
 *
 * @name point
 * @param {Array<number>} coordinates longitude, latitude position (each in decimal degrees)
 * @param {Object=} properties an Object that is used as the {@link Feature}'s
 * properties
 * @returns {Feature<Point>} a Point feature
 * @example
 * var pt1 = turf.point([-75.343, 39.984]);
 *
 * //=pt1
 */
var point$1 = function (coordinates, properties) {
    if (!coordinates) throw new Error('No coordinates passed');
    if (coordinates.length === undefined) throw new Error('Coordinates must be an array');
    if (coordinates.length < 2) throw new Error('Coordinates must be at least 2 numbers long');
    if (typeof coordinates[0] !== 'number' || typeof coordinates[1] !== 'number') throw new Error('Coordinates must numbers');

    return feature({
        type: 'Point',
        coordinates: coordinates
    }, properties);
};

/**
 * Takes an array of LinearRings and optionally an {@link Object} with properties and returns a {@link Polygon} feature.
 *
 * @name polygon
 * @param {Array<Array<Array<number>>>} coordinates an array of LinearRings
 * @param {Object=} properties a properties object
 * @returns {Feature<Polygon>} a Polygon feature
 * @throws {Error} throw an error if a LinearRing of the polygon has too few positions
 * or if a LinearRing of the Polygon does not have matching Positions at the
 * beginning & end.
 * @example
 * var polygon = turf.polygon([[
 *  [-2.275543, 53.464547],
 *  [-2.275543, 53.489271],
 *  [-2.215118, 53.489271],
 *  [-2.215118, 53.464547],
 *  [-2.275543, 53.464547]
 * ]], { name: 'poly1', population: 400});
 *
 * //=polygon
 */
var polygon = function (coordinates, properties) {
    if (!coordinates) throw new Error('No coordinates passed');

    for (var i = 0; i < coordinates.length; i++) {
        var ring = coordinates[i];
        if (ring.length < 4) {
            throw new Error('Each LinearRing of a Polygon must have 4 or more Positions.');
        }
        for (var j = 0; j < ring[ring.length - 1].length; j++) {
            if (ring[ring.length - 1][j] !== ring[0][j]) {
                throw new Error('First and last Position are not equivalent.');
            }
        }
    }

    return feature({
        type: 'Polygon',
        coordinates: coordinates
    }, properties);
};

/**
 * Creates a {@link LineString} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name lineString
 * @param {Array<Array<number>>} coordinates an array of Positions
 * @param {Object=} properties an Object of key-value pairs to add as properties
 * @returns {Feature<LineString>} a LineString feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var linestring1 = turf.lineString([
 *   [-21.964416, 64.148203],
 *   [-21.956176, 64.141316],
 *   [-21.93901, 64.135924],
 *   [-21.927337, 64.136673]
 * ]);
 * var linestring2 = turf.lineString([
 *   [-21.929054, 64.127985],
 *   [-21.912918, 64.134726],
 *   [-21.916007, 64.141016],
 *   [-21.930084, 64.14446]
 * ], {name: 'line 1', distance: 145});
 *
 * //=linestring1
 *
 * //=linestring2
 */
var lineString = function (coordinates, properties) {
    if (!coordinates) throw new Error('No coordinates passed');

    return feature({
        type: 'LineString',
        coordinates: coordinates
    }, properties);
};

/**
 * Takes one or more {@link Feature|Features} and creates a {@link FeatureCollection}.
 *
 * @name featureCollection
 * @param {Feature[]} features input features
 * @returns {FeatureCollection} a FeatureCollection of input features
 * @example
 * var features = [
 *  turf.point([-75.343, 39.984], {name: 'Location A'}),
 *  turf.point([-75.833, 39.284], {name: 'Location B'}),
 *  turf.point([-75.534, 39.123], {name: 'Location C'})
 * ];
 *
 * var fc = turf.featureCollection(features);
 *
 * //=fc
 */
var featureCollection = function (features) {
    if (!features) throw new Error('No features passed');

    return {
        type: 'FeatureCollection',
        features: features
    };
};

/**
 * Creates a {@link Feature<MultiLineString>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiLineString
 * @param {Array<Array<Array<number>>>} coordinates an array of LineStrings
 * @param {Object=} properties an Object of key-value pairs to add as properties
 * @returns {Feature<MultiLineString>} a MultiLineString feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var multiLine = turf.multiLineString([[[0,0],[10,10]]]);
 *
 * //=multiLine
 *
 */
var multiLineString = function (coordinates, properties) {
    if (!coordinates) throw new Error('No coordinates passed');

    return feature({
        type: 'MultiLineString',
        coordinates: coordinates
    }, properties);
};

/**
 * Creates a {@link Feature<MultiPoint>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiPoint
 * @param {Array<Array<number>>} coordinates an array of Positions
 * @param {Object=} properties an Object of key-value pairs to add as properties
 * @returns {Feature<MultiPoint>} a MultiPoint feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var multiPt = turf.multiPoint([[0,0],[10,10]]);
 *
 * //=multiPt
 *
 */
var multiPoint = function (coordinates, properties) {
    if (!coordinates) throw new Error('No coordinates passed');

    return feature({
        type: 'MultiPoint',
        coordinates: coordinates
    }, properties);
};


/**
 * Creates a {@link Feature<MultiPolygon>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiPolygon
 * @param {Array<Array<Array<Array<number>>>>} coordinates an array of Polygons
 * @param {Object=} properties an Object of key-value pairs to add as properties
 * @returns {Feature<MultiPolygon>} a multipolygon feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var multiPoly = turf.multiPolygon([[[[0,0],[0,10],[10,10],[10,0],[0,0]]]]);
 *
 * //=multiPoly
 *
 */
var multiPolygon = function (coordinates, properties) {
    if (!coordinates) throw new Error('No coordinates passed');

    return feature({
        type: 'MultiPolygon',
        coordinates: coordinates
    }, properties);
};

/**
 * Creates a {@link Feature<GeometryCollection>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name geometryCollection
 * @param {Array<{Geometry}>} geometries an array of GeoJSON Geometries
 * @param {Object=} properties an Object of key-value pairs to add as properties
 * @returns {Feature<GeometryCollection>} a GeoJSON GeometryCollection Feature
 * @example
 * var pt = {
 *     "type": "Point",
 *       "coordinates": [100, 0]
 *     };
 * var line = {
 *     "type": "LineString",
 *     "coordinates": [ [101, 0], [102, 1] ]
 *   };
 * var collection = turf.geometryCollection([pt, line]);
 *
 * //=collection
 */
var geometryCollection = function (geometries, properties) {
    if (!geometries) throw new Error('No geometries passed');

    return feature({
        type: 'GeometryCollection',
        geometries: geometries
    }, properties);
};

var factors = {
    miles: 3960,
    nauticalmiles: 3441.145,
    degrees: 57.2957795,
    radians: 1,
    inches: 250905600,
    yards: 6969600,
    meters: 6373000,
    metres: 6373000,
    kilometers: 6373,
    kilometres: 6373,
    feet: 20908792.65
};

/*
 * Convert a distance measurement from radians to a more friendly unit.
 *
 * @name radiansToDistance
 * @param {number} distance in radians across the sphere
 * @param {string} [units=kilometers] can be degrees, radians, miles, or kilometers
 * inches, yards, metres, meters, kilometres, kilometers.
 * @returns {number} distance
 */
var radiansToDistance = function (radians, units) {
    var factor = factors[units || 'kilometers'];
    if (factor === undefined) throw new Error('Invalid unit');

    return radians * factor;
};

/*
 * Convert a distance measurement from a real-world unit into radians
 *
 * @name distanceToRadians
 * @param {number} distance in real units
 * @param {string} [units=kilometers] can be degrees, radians, miles, or kilometers
 * inches, yards, metres, meters, kilometres, kilometers.
 * @returns {number} radians
 */
var distanceToRadians = function (distance, units) {
    var factor = factors[units || 'kilometers'];
    if (factor === undefined) throw new Error('Invalid unit');

    return distance / factor;
};

/*
 * Convert a distance measurement from a real-world unit into degrees
 *
 * @name distanceToRadians
 * @param {number} distance in real units
 * @param {string} [units=kilometers] can be degrees, radians, miles, or kilometers
 * inches, yards, metres, meters, kilometres, kilometers.
 * @returns {number} degrees
 */
var distanceToDegrees = function (distance, units) {
    var factor = factors[units || 'kilometers'];
    if (factor === undefined) throw new Error('Invalid unit');

    return (distance / factor) * 57.2958;
};

var index$10 = {
	feature: feature_1,
	point: point$1,
	polygon: polygon,
	lineString: lineString,
	featureCollection: featureCollection,
	multiLineString: multiLineString,
	multiPoint: multiPoint,
	multiPolygon: multiPolygon,
	geometryCollection: geometryCollection,
	radiansToDistance: radiansToDistance,
	distanceToRadians: distanceToRadians,
	distanceToDegrees: distanceToDegrees
};

var point = index$10.point;

/**
 * Takes a {@link Feature} or {@link FeatureCollection} and returns the absolute center point of all features.
 *
 * @name center
 * @param {(Feature|FeatureCollection)} layer input features
 * @return {Feature<Point>} a Point feature at the absolute center point of all input features
 * @example
 * var features = {
 *   "type": "FeatureCollection",
 *   "features": [
 *     {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [-97.522259, 35.4691]
 *       }
 *     }, {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [-97.502754, 35.463455]
 *       }
 *     }, {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [-97.508269, 35.463245]
 *       }
 *     }, {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [-97.516809, 35.465779]
 *       }
 *     }, {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [-97.515372, 35.467072]
 *       }
 *     }, {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [-97.509363, 35.463053]
 *       }
 *     }, {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [-97.511123, 35.466601]
 *       }
 *     }, {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [-97.518547, 35.469327]
 *       }
 *     }, {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [-97.519706, 35.469659]
 *       }
 *     }, {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [-97.517839, 35.466998]
 *       }
 *     }, {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [-97.508678, 35.464942]
 *       }
 *     }, {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [-97.514914, 35.463453]
 *       }
 *     }
 *   ]
 * };
 *
 * var centerPt = turf.center(features);
 * centerPt.properties['marker-size'] = 'large';
 * centerPt.properties['marker-color'] = '#000';
 *
 * var resultFeatures = features.features.concat(centerPt);
 * var result = {
 *   "type": "FeatureCollection",
 *   "features": resultFeatures
 * };
 *
 * //=result
 */

var index$8 = function (layer) {
    var ext = index$4(layer);
    var x = (ext[0] + ext[2]) / 2;
    var y = (ext[1] + ext[3]) / 2;
    return point([x, y]);
};

/**
 * Modifies a BBox to fit within the bounds of the International Date Line.
 *
 * @param {BBox|FeatureCollection|Feature<any>} bbox BBox [west, south, east, north] or GeoJSON Feature
 * @returns {BBox} valid BBox extent
 * @example
 * dateline.bbox([190, 100, -200, -120])
 * //= [-170, -80, 160, 60]
 */
function bbox (bbox) {
  // input validation
  if (!bbox) throw new Error('bbox is required')
  if (!Array.isArray(bbox)) bbox = index$4(bbox);
  if (bbox.length !== 4) throw new Error('bbox must have 4 numbers')

  var west = bbox[0];
  var south = bbox[1];
  var east = bbox[2];
  var north = bbox[3];

  // Support bbox that overlaps the entire world
  if (west < -180 && east > 180) {
    west = -180;
    east = 180;
  }
  if (east < -180 && west > 180) {
    west = -180;
    east = 180;
  }
  if (south < -90 && north > 90) {
    south = -90;
    north = 90;
  }
  if (north < -90 && south > 90) {
    south = -90;
    north = 90;
  }
  if (north > 90) north = 90;
  if (south < -90) south = -90;

  // Beyond 360 longitude degrees
  if (Math.abs(bbox[0] - bbox[2]) > 360) {
    west = -180;
    east = 180;
  }
  // Beyond 180 latitude degrees
  if (Math.abs(bbox[1] - bbox[3]) > 180) {
    south = -90;
    north = 90;
  }
  // Convert Lat & Lng within dateline
  west = longitude$1(west);
  south = latitude$1(south);
  east = longitude$1(east);
  north = latitude$1(north);

  return [west, south, east, north]
}

/**
 * Modifies a Center to fit within the bounds of the International Date Line.
 *
 * @param {[number, number]|BBox|FeatureCollection|Feature<any>} center Center [lng, lat], BBox [west, south, east, south] or GeoJSON Feature
 * @returns {[number, number]} valid center coordinate
 * @example
 * dateline.center([190, 100])
 * //= [-170, -80]
 */
function center (center) {
  var coords;
  if (!center) throw new Error('center is required')

  // Support BBox [west, south, east, north]
  if (Array.isArray(center)) {
    if (center.length === 4) {
      var bbox = center;
      var west = bbox[0];
      var south = bbox[1];
      var east = bbox[2];
      var north = bbox[3];
      coords = [(west + east) / 2, (south + north) / 2];

    // Support Center [lng, lat]
    } else coords = [center[0], center[1]];

  // Support any GeoJSON
  } else coords = index$8(center).geometry.coordinates;

  if (coords.length !== 2) throw new Error('center must have 2 numbers')
  var lng = longitude$1(coords[0]);
  var lat = latitude$1(coords[1]);

  return [lng, lat]
}

/**
 * Modifies a Latitude to fit within +/-90 degrees.
 *
 * @param {number} lat latitude to modify
 * @returns {number} modified latitude
 * @example
 * dateline.latitude(100)
 * //= -80
 */
function latitude$1 (lat) {
  if (lat === undefined || lat === null) throw new Error('lat is required')

  // Latitudes cannot extends beyond +/-90 degrees
  if (lat > 90 || lat < -90) {
    lat = lat % 180;
    if (lat > 90) lat = -180 + lat;
    if (lat < -90) lat = 180 + lat;
    if (lat === -0) lat = 0;
  }
  return lat
}

/**
 * Modifies a Longitude to fit within +/-180 degrees.
 *
 * @param {number} lng longitude to modify
 * @returns {number} modified longitude
 * @example
 * dateline.longitude(190)
 * //= -170
 */
function longitude$1 (lng) {
  if (lng === undefined || lng === undefined) throw new Error('lng is required')

  // lngitudes cannot extends beyond +/-90 degrees
  if (lng > 180 || lng < -180) {
    lng = lng % 360;
    if (lng > 180) lng = -360 + lng;
    if (lng < -180) lng = 360 + lng;
    if (lng === -0) lng = 0;
  }
  return lng
}

var index$2 = {
  bbox: bbox,
  longitude: longitude$1,
  latitude: latitude$1,
  center: center
};

var latitude = index$2.latitude;
var longitude = index$2.longitude;

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
 * @param {boolean} [validate=true] validates LatLng coordinates
 * @returns {Meters} Meters coordinates
 * @example
 * var meters = mercator.lngLatToMeters([126, 37])
 * //=[ 14026255.8, 4439106.7 ]
 */
function lngLatToMeters (lnglat, validate) {
  lnglat = validateLngLat(lnglat, validate);
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
 * @param {boolean} [validate=true] validates LatLng coordinates
 * @returns {Tile} TMS Tile
 * @example
 * var tile = mercator.lngLatToTile([126, 37], 13)
 * //=[ 6963, 5003, 13 ]
 */
function lngLatToTile (lnglat, zoom, validate) {
  lnglat = validateLngLat(lnglat, validate);
  var meters = lngLatToMeters(lnglat);
  var pixels = metersToPixels(meters, zoom);
  return pixelsToTile(pixels)
}

/**
 * Converts LngLat coordinates to Google (XYZ) Tile.
 *
 * @param {LngLat} lnglat Longitude (Meridians) & Latitude (Parallels) in decimal degrees
 * @param {number} zoom Zoom level
 * @param {boolean} [validate=true] validates LatLng coordinates
 * @returns {Google} Google (XYZ) Tile
 * @example
 * var google = mercator.lngLatToGoogle([126, 37], 13)
 * //=[ 6963, 3188, 13 ]
 */
function lngLatToGoogle (lnglat, zoom, validate) {
  lnglat = validateLngLat(lnglat, validate);

  if (zoom === 0) {
    return [0, 0, 0]
  }
  var tile = lngLatToTile(lnglat, zoom);
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
 * @param {boolean} [validate=true] validates Pixels coordinates
 * @returns {Tile} TMS Tile
 * @example
 * var tile = mercator.pixelsToTile([1782579, 1280877, 13])
 * //=[ 6963, 5003, 13 ]
 */
function pixelsToTile (pixels, tileSize, validate) {
  tileSize = tileSize || 256;
  var px = pixels[0];
  var py = pixels[1];
  var zoom = pixels[2];
  if (zoom === 0) {
    return [0, 0, 0]
  }
  validateZoom(zoom, validate);
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
 * @param {boolean} [validate=true] validates Tile
 * @returns {BBox} bbox extent in [minX, minY, maxX, maxY] order
 * @example
 * var bbox = mercator.tileToBBoxMeters([6963, 5003, 13])
 * //=[ 14025277.4, 4437016.6, 14030169.4, 4441908.5 ]
 */
function tileToBBoxMeters (tile, tileSize, validate) {
  validateTile(tile, validate);

  tileSize = tileSize || 256;
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
 * @param {boolean} [validate=true] validates Tile
 * @returns {BBox} bbox extent in [minX, minY, maxX, maxY] order
 * @example
 * var bbox = mercator.tileToBBox([6963, 5003, 13])
 * //=[ 125.991, 36.985, 126.035, 37.020 ]
 */
function tileToBBox (tile, validate) {
  validateTile(tile, validate);

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
 * @param {boolean} [validate=true] validates Tile
 * @returns {Google} Google (XYZ) Tile
 * @example
 * var google = mercator.tileToGoogle([6963, 5003, 13])
 * //=[ 6963, 3188, 13 ]
 */
function tileToGoogle (tile, validate) {
  validateTile(tile, validate);

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
 * @param {boolean} [validate=true] validates Tile
 * @returns {string} Microsoft's Quadkey schema
 * @example
 * var quadkey = mercator.tileToQuadkey([6963, 5003, 13])
 * //='1321102330211'
 */
function tileToQuadkey (tile, validate) {
  validateTile(tile, validate);

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
 * @param {boolean} [validate=true] validates Tile
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
function validateTile (tile, validate) {
  var tx = tile[0];
  var ty = tile[1];
  var zoom = tile[2];
  if (validate === false) return tile
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
 * @param {boolean} [validate=true] validates Zoom level
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
  if (zoom === false) return zoom
  if (zoom === undefined || zoom === null) { throw new Error('<zoom> is required') }
  if (zoom < 0) { throw new Error('<zoom> cannot be less than 0') }
  if (zoom > 30) { throw new Error('<zoom> cannot be greater than 30') }
  return zoom
}

/**
 * Validates LngLat coordinates
 *
 * @param {LngLat} lnglat Longitude (Meridians) & Latitude (Parallels) in decimal degrees
 * @param {boolean} [validate=true] validates LatLng coordinates
 * @throws {Error} Will throw an error if LngLat is not valid.
 * @returns {LngLat} LngLat coordinates
 * @example
 * mercator.validateLngLat([-115, 44])
 * //= [ -115, 44 ]
 * mercator.validateLngLat([-225, 44])
 * //= Error: LngLat [lng] must be within -180 to 180 degrees
 */
function validateLngLat (lnglat, validate) {
  if (validate === false) return lnglat

  var lng = longitude(lnglat[0]);
  var lat = latitude(lnglat[1]);

  // Global Mercator does not support latitudes within 85 to 90 degrees
  if (lat > 85) lat = 85;
  if (lat < -85) lat = -85;
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

var index = {
  hash: hash,
  bboxToCenter: bboxToCenter,
  lngLatToMeters: lngLatToMeters,
  metersToLngLat: metersToLngLat,
  metersToPixels: metersToPixels,
  lngLatToTile: lngLatToTile,
  lngLatToGoogle: lngLatToGoogle,
  metersToTile: metersToTile,
  pixelsToMeters: pixelsToMeters,
  pixelsToTile: pixelsToTile,
  tileToBBoxMeters: tileToBBoxMeters,
  tileToBBox: tileToBBox,
  googleToBBoxMeters: googleToBBoxMeters,
  googleToBBox: googleToBBox,
  tileToGoogle: tileToGoogle,
  googleToTile: googleToTile,
  googleToQuadkey: googleToQuadkey,
  tileToQuadkey: tileToQuadkey,
  quadkeyToTile: quadkeyToTile,
  quadkeyToGoogle: quadkeyToGoogle,
  bboxToMeters: bboxToMeters,
  validateTile: validateTile,
  validateZoom: validateZoom,
  validateLngLat: validateLngLat,
  resolution: resolution,
  range: range,
  maxBBox: maxBBox
};

return index;

})));
