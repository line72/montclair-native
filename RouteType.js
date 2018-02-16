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

import axios from 'axios';
import { DOMParser } from 'xmldom';
import toGeoJSON from 'togeojson';
import GeoJSON from './GeoJSON';

class RouteType {
    constructor({id, number, name, color, kml, polyline}) {
        this.id = id;
        this.number = number;
        this.name = name;
        this.color = color;
        this.selected = false;
        this.kml = kml;
        this.polyline = polyline;
        this.visible = true;

        this.vehicles = [];
    }

    async getPath() {
        if (this.kml != null) {
            return axios.get(this.kml).then((response) => {
                let xml = new DOMParser().parseFromString(response.data, 'text/xml');
                let geo = toGeoJSON.kml(xml);

                // convert to a polyline
                let geojson = new GeoJSON(geo);
                let polyline = geojson.toPolyline();

                return polyline;
            });
        } else if (this.polyline != null) {
            return new Promise((resolve, reject) => {
                resolve(this.polyline);
            });
        } else {
            return new Promise((resolve, reject) => {
                resolve(null);
            });
        }
    }
}

export default RouteType;
