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

import AgencyType from './AgencyType';
import RouteType from './RouteType';
import VehicleType from './VehicleType';

class AvailtecParser {
    constructor(url) {
        this.url = url
    }

    /**
     * Get all the routes for an agency.
     *
     * This returns a new, updated AgencyType object.
     */
    getRoutes(agency) {
        let url = this.url + '/rest/Routes/GetVisibleRoutes';

        return axios.get(url).then((response) => {
            return response.data.reduce((acc, route) => {
                return AgencyType.addRoute(acc, RouteType.T({
                    id: route.RouteId,
                    number: route.RouteId,
                    name: route.LongName,
                    color: route.Color,
                    kml: this.url + '/Resources/Traces/' + route.RouteTraceFilename
                }));
            }, agency);
        }).catch((e) => {
            console.log(`AvailtecParer::getRoutes: Exception when fetching routes: ${JSON.stringify(e)})`);
            return agency;
        });
    }

    /**
     * Get all the vehicles for all routes in an agency (within a bounds).
     *
     * This returns a new, updated AgencyType object.
     */
    getVehicles(agency, bounds) {
        let url = this.url + '/rest/Routes/GetVisibleRoutes';
        const a = AgencyType.clearRoutes(agency);

        return axios.get(url).then((response) => {
            return response.data.reduce((acc, route) => {
                return route.Vehicles.map((vehicle, i) => {
                    return this.parseVehicle(route, vehicle);
                }).filter((v) => {
                    // filter vehicles not within the bounds
                    // !mwd - we expand the search region a little bit
                    //  so that vehicles don't jump in and out of the screen
                    let epsilon = 0.008;
                    let bottomLeft = [bounds["_southWest"]["lat"] - epsilon, bounds["_southWest"]["lng"] - epsilon];
                    let topRight = [bounds["_northEast"]["lat"] + epsilon, bounds["_northEast"]["lng"] + epsilon];

                    if (v.position[0] >= bottomLeft[0] && v.position[0] <= topRight[0] &&
                        v.position[1] >= bottomLeft[1] && v.position[1] <= topRight[1]) {
                        return true;
                    } else {
                        return false;
                    }
                }).reduce((acc2, v) => {
                    const route_type = acc2.routes.get(route.RouteId);

                    return AgencyType.addVehicle(acc2, route_type, v);
                }, acc);
            }, a);
        });
    }
    parseVehicle(route, vehicle) {
        return VehicleType.T({
            id: vehicle.VehicleId,
            position: [vehicle.Latitude, vehicle.Longitude],
            direction: vehicle.DirectionLong,
            heading: vehicle.Heading,
            destination: vehicle.Destination,
            on_board: vehicle.OnBoard,
            deviation: vehicle.Deviation,
            op_status: vehicle.OpStatus,
            color: route.Color,
            route_id: route.RouteId,
        });
    }
}

export default AvailtecParser;
