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
            return toGeoJSON.kml(xml);
        });
    } else if (rt.polyline != null) {
        return new Promise((resolve, reject) => {
            // convert to geojson (and swap coordinates
            //  from lat/lon to lon/lat)
            let geojson = {
                type: "FeatureCollection",
                features: [
                    {
                        type: "Feature",
                        geometry: {
                            type: "MultiLineString",
                            coordinates: rt.polyline.map((l) => {
                                return l.map(([lat, lon]) => {
                                    return [lon, lat];
                                });
                            })
                        }
                    }
                ]
            };
            console.log(`polyline=${JSON.stringify(geojson)}`);
            resolve(geojson);
        });
    } else {
        return new Promise((resolve, reject) => {
            resolve(null);
        });
    }
}

export default {T, clearVehicles, addVehicle, getPath};
