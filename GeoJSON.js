/* -*- Mode: rjsx -*- */

/*******************************************
 * Copyright (2018)
 *  Marcus Dillavou <line72@line72.net>
 *  http://line72.net
 *
 * Montclair:
 *  https://github.com/line72/montclair
 *  https://montclair.line72.net
 *
 * Licensed Under the GPLv3
 *******************************************/

import update from 'immutability-helper';

class GeoJSON {
    constructor(geojson) {
        this.geojson = geojson;
    }

    toPolyline() {
        return this.parseType(this.geojson, []);
    }

    parseType(geojson, acc) {
        let type = geojson['type'];

        if (type === 'FeatureCollection') {
            let features = geojson['features'].map((f) => {
                return this.parseType(f, []);
            });
            return update(acc, {$push: features});
        } else if (type === 'Feature') {
            let geometry = geojson['geometry'];
            return update(acc, {$push: this.parseType(geometry, [])});
        } else if (type === 'LineString') {
            // swap all the damn coordinates, since they are long,lat
            let coordinates = geojson['coordinates'].map(([lng,lat]) => {
                return [lat, lng];
            });
            return update(acc, {$push: coordinates});
        } else {
            console.log(`GeoJSON::parseType: Unknown type: ${type}`);
            return acc;
        }
    }
}

export default GeoJSON;
