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
import polyUtil from 'polyline-encoded';

import AgencyType from './AgencyType';
import RouteType from './RouteType';
import VehicleType from './VehicleType';

class TranslocParser {
    constructor(key, agency_id) {
        this.url = 'https://transloc-api-1-2.p.mashape.com/';
        this.key = key;
        this.agency_id = agency_id;

        this.requestor = axios.create({
            baseURL: this.url,
            headers: {'X-Mashape-Key': this.key}
        });
    }

    /**
     * Get all the routes for an agency.
     *
     * This returns a new, updated AgencyType object.
     */
    getRoutes(agency) {
        // first get the segments so we can build our route paths
        let url = `/segments.json?agencies=${this.agency_id}`;
        return this.requestor.get(url).then((response) => {
            let segments = response.data.data;

            let url = `/routes.json?agencies=${this.agency_id}`;

            return this.requestor.get(url).then((response) => {
                let route_data = response.data.data[this.agency_id]

                // parse it
                return route_data.reduce((acc, route) => {
                    // build out the segments
                    // !mwd - TODO
                    let polyline = route.segments.map((segment) => {
                        let lat_lng = polyUtil.decode(segments[segment[0]]);
                        if (segment[1] === "backward") {
                            return lat_lng.reverse();
                        } else {
                            return lat_lng;
                        }
                    });

                    return AgencyType.addRoute(acc, RouteType.T({
                        id: route.route_id,
                        number: route.short_name,
                        name: route.long_name,
                        color: route.color,
                        polyline: polyline
                    }));
                }, agency);
            });
        });
    }

    /**
     * Get all the vehicles for all routes in an agency (within a bounds).
     *
     * This returns a new, updated AgencyType object.
     */
    getVehicles(agency, bounds) {
        let url = `/vehicles.json?agencies=${this.agency_id}`;

        if (bounds != null) {
            // filter vehicles not within the bounds
            // !mwd - we expand the search region a little bit
            //  so that vehicles don't jump in and out of the screen
            let epsilon = 0.008;
            let bottomLeft = [bounds["_southWest"]["lat"] - epsilon, bounds["_southWest"]["lng"] - epsilon];
            let topRight = [bounds["_northEast"]["lat"] + epsilon, bounds["_northEast"]["lng"] + epsilon];

            url=`${url}&geo_area=${bottomLeft[0]},${bottomLeft[1]}|${topRight[0]},${topRight[1]}`;
        }

        return this.requestor.get(url).then((response) => {
            // clear out all the vehicles
            const a = AgencyType.clearRoutes(agency);
            let vehicle_data = response.data.data[this.agency_id] || []

            return vehicle_data.reduce((acc, vehicle) => {
                let v = VehicleType.T({
                    id: vehicle.vehicle_id,
                    position: [vehicle.location.lat, vehicle.location.lng],
                    heading: vehicle.heading,
                    destination: '',
                    on_board: vehicle.passenger_load || '',
                    route_id: vehicle.route_id
                });

                const route = acc.routes.get(vehicle.route_id);
                return AgencyType.addVehicle(acc, route, v);
            }, a);
        });
    }
}

export default TranslocParser;
