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
import Immutable from 'immutable';
import axios from 'axios';
import MapView from 'react-native-maps';

import Configuration from './Configuration';
import Route from './Route';
//import AgencyList from './AgencyList';
import LocalStorage from './LocalStorage';

class RouteContainer extends Component {
    constructor() {
        super();

        let configuration = new Configuration();

        let agencies = configuration.agencies.reduce((acc, a) => {
            return acc.set(a.name, Immutable.Map({name: a.name,
                                                  visible: true,
                                                  parser: a.parser,
                                                  routes: Immutable.Map({})})
                          );
        }, Immutable.Map({}));

        this.interval = null;
        this.storage = new LocalStorage();
        this.bounds = {"_southWest": {"lat": 33.0, "lng": -87.3},
                       "_northEast": {"lat": 34.0, "lng": -86.0}};

        this.state = {
            ready: false,
            agencies: agencies,
            region: {
                latitude: configuration.center[0],
                longitude: configuration.center[1],
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421
            }
        };

    }

    componentDidMount() {
        // setup a timer to fetch the vehicles
        this.interval = setInterval(() => {this.getVehicles();}, 10000);

        this.getRoutes().then((agency_list) => {
            const agencies = agency_list.reduce((acc, agency) => {
                return acc.set(agency.get('name'), agency);
            }, this.state.agencies);

            // update the state
            this.setState({
                ready: true,
                agencies: agencies
            });

            // do an immediate fetch
            this.getVehicles();
        });
    }

    componentWillUnmount() {
        if (this.interval) {
            clearInterval(this.interval);
        }
        this.interval = null;
    }

    getRoutes() {
        let promises = this.state.agencies.toList().map((agency) => {
            agency = agency.set('visible', this.storage.isAgencyVisible(agency));

            return new Promise((resolve, reject) => {
                agency.get('parser').getRoutes().then((routes) => {
                    // the visibility is stored offline in local storage,
                    //  restore it.
                    const r = Object.keys(routes).reduce((acc, key) => {
                        let route = routes[key];

                        route.visible = this.storage.isRouteVisible(agency, route);
                        return acc.set(key, Immutable.fromJS(route));
                    }, Immutable.Map({}));

                    // update the agency without mutating the original
                    const a1 = agency.set('routes', r)

                    resolve(a1);
                }).catch((e) => {
                    reject(e);
                });
            });
        }).toJS();

        return axios.all(promises);
    }

    getVehicles() {
        if (!this.state.ready) {
            return false;
        }

        let promises = this.state.agencies.toList().map((agency) => {
            return new Promise((resolve, reject) => {
                if (!agency.get('visible')) {
                    resolve(agency);
                } else {
                    // update the vehicles in the agency
                    agency.get('parser').getVehicles(this.bounds).then((vehicle_map) => {
                        let routes = Object.keys(vehicle_map).reduce((acc, route_id) => {
                            if (acc.get(route_id) && acc.get(route_id).visible) {

                                let vehicles = vehicle_map[route_id];
                                // sort vehicles based on id
                                vehicles.sort((a, b) => { return a.id <= b.id; });

                                // update the route's vehicles
                                let v = acc.get(route_id).vehicles;

                                const c = Immutable.fromJS(update(acc.toJS(),
                                                                  {[route_id]:
                                                                   {vehicles:
                                                                    {$set: vehicles}}}));
                                return c;
                            } else {
                                return acc;
                            }
                        }, agency.get('routes'));

                        const updated_agency = agency.set('routes', routes);

                        resolve(updated_agency);
                    });
                }
            });
        }).toJS();

        return axios.all(promises).then((results) => {
            const agencies = results.reduce((acc, agency) => {
                return acc.set(agency.get('name'), agency);
            }, this.state.agencies);


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

    onBoundsChanged = (region) => {
        this.bounds = {
            "_southWest": {"lat": region.latitude - region.latitudeDelta,
                           "lng": region.longitude - region.longitudeDelta},
            "_northEast": {"lat": region.latitude + region.latitudeDelta,
                           "lng": region.longitude + region.latitudeDelta}
        };
    }

    render() {
        let routes = this.state.agencies.toList().map((agency) => {
            if (!agency.get('visible')) {
                return [];
            }
            return agency.get('routes').toList().map((route) => {
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
        console.log(`routes=${routes}`);
        // flatten
        //let routes = Array.prototype.concat.apply([], routes_list);

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

        const {region} = this.state;
        return (
            <MapView
                style={styles.map}
                initialRegion={region}
                onRegionChangeComplete={this.onBoundsChanged}
                rotateEnabled={false}
                >
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
