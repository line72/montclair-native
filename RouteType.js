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

import Immutable from 'immutable';
import axios from 'axios';
import { DOMParser } from 'xmldom';
import toGeoJSON from 'togeojson';
import GeoJSON from './GeoJSON';

var T = Immutable.Record({id: 0,
                          number: 0,
                          name: '',
                          color: 'ffffff',
                          selected: false,
                          visible: true,
                          kml: null,
                          polyline: null,
                          vehicles: Immutable.Map({})});

function clearVehicles(rt) {
    return rt.set('vehicles', Immutable.Map({}));
}

function addVehicle(rt, vehicle) {
    return rt.setIn(['vehicles', vehicle.id], vehicle);
}

async function getPath(rt) {
    if (rt.kml != null) {
        return axios.get(rt.kml).then((response) => {
            let xml = new DOMParser().parseFromString(response.data, 'text/xml');
            let geo = toGeoJSON.kml(xml);

            // convert to a polyline
            let geojson = new GeoJSON(geo);
            let polyline = geojson.toPolyline();

            return polyline;
        });
    } else if (rt.polyline != null) {
        return new Promise((resolve, reject) => {
            resolve(rt.polyline);
        });
    } else {
        return new Promise((resolve, reject) => {
            resolve(null);
        });
    }
}

export default {T, clearVehicles, addVehicle, getPath};
