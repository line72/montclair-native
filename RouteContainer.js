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

import React, { Component } from 'react';
import {StyleSheet} from 'react-native';

import update from 'immutability-helper';
import axios from 'axios';
import MapView from 'react-native-maps';

import Configuration from './Configuration';
import Route from './Route';
//import BaseMap from './BaseMap';
//import AgencyList from './AgencyList';
import LocalStorage from './LocalStorage';

class RouteContainer extends Component {
    constructor() {
        super();

        let configuration = new Configuration();

        let agencies = configuration.agencies.map((a) => {
            return {name: a.name,
                    visible: true,
                    parser: a.parser,
                    routes: {}};
        });

        this.storage = new LocalStorage();
        this.bounds = {"_southWest": {"lat": 33.0, "lng": -87.3},
                       "_northEast": {"lat": 34.0, "lng": -86.0}};

        this.state = {
            agencies: agencies
        };


        this.getRoutes().then((results) => {
            console.log(`Got routes ${JSON.stringify(results)}`);
            // setup a timer to fetch the vehicles
            this.getVehicles();
            setInterval(() => {this.getVehicles();}, 10000);
        });
    }

    getRoutes() {
        return axios.all(this.state.agencies.map((a, index) => {
            a.visible = this.storage.isAgencyVisible(a);

            return a.parser.getRoutes().then((routes) => {
                // the visibility is stored offline in local storage,
                //  restore it.
                const r = Object.keys(routes).reduce((acc, key) => {
                    let route = routes[key];

                    route.visible = this.storage.isRouteVisible(a, route);
                    acc[key] = route;

                    return acc;
                }, {});

                // update the agency without mutating the original
                const agencies = update(this.state.agencies, {[index]: {routes: {$set: r}}});

                this.setState({
                    agencies: agencies
                });

                return routes;
            });
        }));
    }

    getVehicles() {
        return axios.all(this.state.agencies.map((a, index) => {
            // if an Agency isn't visible, don't update it
            if (!a.visible) {
                return {name: a.name,
                        routes: a.routes};
            }

            // update our agency
            return a.parser.getVehicles(this.bounds).then((vehicle_map) => {
                console.log(`got vehicles: ${JSON.stringify(vehicle_map)}`);
                let routes = Object.keys(vehicle_map).reduce((acc, route_id) => {
                    if (a.routes[route_id] && a.routes[route_id].visible) {
                        let vehicles = vehicle_map[route_id];
                        // sort vehicles based on id
                        vehicles.sort((a, b) => { return a.id <= b.id; });

                        // create a new map with the update
                        //  we like immutability.
                        const updated_routes = update(acc,
                                                      {[route_id]:
                                                       {vehicles:
                                                        {$set: vehicles}}});

                        return updated_routes;
                    } else {
                        // don't update the state
                        return acc;
                    }
                }, this.state.agencies[index].routes);

                return {name: a.name,
                        routes: routes};
            });
        })).then((results) => {
            let agencies = results.map((r) => {
                let i = this.state.agencies.findIndex((e) => {return e.name === r.name});

                return update(this.state.agencies, {[i]: {routes: {$set: r.routes}}})[i];
            });

            this.setState({
               agencies: agencies
            });
        });
    }

    toggleAgency(agency) {
        let i = this.state.agencies.findIndex((e) => {return e.name === agency.name});
        const agencies = update(this.state.agencies, {[i]: {visible: {$set: !agency.visible}}});

        this.setState({
            agencies: agencies
        });

        // !mwd - we pass agencies, not this.agencies
        //  since our state update hasn't happened yet!
        this.storage.updateVisibility(agencies);
    }

    toggleRoute(agency, route) {
        let i = this.state.agencies.findIndex((e) => {return e.name === agency.name});
        const agencies = update(this.state.agencies, {[i]: {routes: {[route.id]: {visible: {$set: !route.visible}}}}});
        this.setState({
            agencies: agencies
        });

        // !mwd - we pass agencies, not this.agencies
        //  since our state update hasn't happened yet!
        this.storage.updateVisibility(agencies);
    }

    onBoundsChanged = (bounds) => {
        this.bounds = bounds;
    }

    render() {
        let routes_list = this.state.agencies.map((agency) => {
            if (!agency.visible) {
                return [];
            }
            return Object.keys(agency.routes).map((key) => {
                let route = agency.routes[key];

                if (!route.visible) {
                    return (null);
                }

                return (
                    <Route key={route.id}
                           route={route}
                           id={route.id}
                           number={route.number}
                           name={route.name}
                           selected={route.selected}
                           color={route.color}
                           vehicles={route.vehicles}
                           />
                );
            });
        });
        // flatten
        let routes = Array.prototype.concat.apply([], routes_list);

    //     return ([
    //             <AgencyList key="agency-list" agencies={this.state.agencies} onAgencyClick={(agency) => this.toggleAgency(agency) } onRouteClick={(agency, route) => this.toggleRoute(agency, route) } />,
    //         <div key="main" className="w3-main RouteContainer-main">
    //             {/* Push content down on small screens */}
    //             <div className="w3-hide-large RouteContainer-header-margin">
    //             </div>

    //             <div className="w3-hide-medium w3-hide-small RouteContainer-header">
    //                 <h1 className="RouteContainer-h1">Birmingham Transit</h1>
    //             </div>

    //             <div className="">
    //                 <BaseMap onBoundsChanged={this.onBoundsChanged}>{routes}</BaseMap>
    //             </div>
    //         </div>
    //         ]
    //     );
    // }

        return (
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: 33.5084801,
                    longitude: -86.8006611,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}>
                {routes}
            </MapView>
        );
    }
}

const styles = StyleSheet.create({
    map: {
        flex: 1
    }
});

export default RouteContainer;