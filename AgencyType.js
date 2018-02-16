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
import RouteType from './RouteType';

var T = Immutable.Record({name: '',
                          visible: true,
                          parser: null,
                          routes: Immutable.Map({})});

function addRoute(agency, route) {
    return agency.setIn(['routes', route.id], route);
}

/**
 * clear all the vehicles out of
 *  the routes
*/
function clearRoutes(agency) {
    const routes = agency.routes.map((route) => {
        return RouteType.clearVehicles(route);
    });
    return agency.set('routes', routes);
}

/**
 * add a vehicle to a route
 */
function addVehicle(agency, route, vehicle) {
    if (agency.routes.has(route.id)) {
        return agency.setIn(['routes', route.id], RouteType.addVehicle(route, vehicle));
    } else {
        console.warn('Trying to add vehicle to a null route');
        return agency;
    }
}

export default {T, addRoute, clearRoutes, addVehicle};
