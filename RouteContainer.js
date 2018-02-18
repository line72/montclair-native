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
import { Platform, StyleSheet } from 'react-native';

import update from 'immutability-helper';
import Immutable from 'immutable';
import axios from 'axios';
import MapboxGL from '@mapbox/react-native-mapbox-gl';

import Configuration from './Configuration';
import Route from './Route';
//import AgencyList from './AgencyList';
import LocalStorage from './LocalStorage';

import AgencyType from './AgencyType';

const IS_ANDROID = Platform.OS === 'android';

class RouteContainer extends Component {
    constructor() {
        super();

        let configuration = new Configuration();
        MapboxGL.setAccessToken(configuration.mapbox_key);

        let agencies = configuration.agencies.reduce((acc, a) => {
            return acc.set(a.name, AgencyType.T({name: a.name,
                                                 visible: true,
                                                 parser: a.parser})
                          );
        }, Immutable.Map({}));

        this.interval = null;
        this.storage = new LocalStorage();
        this.bounds = {"_southWest": {"lat": 33.0, "lng": -87.3},
                       "_northEast": {"lat": 34.0, "lng": -86.0}};

        this.state = {
            isFetchingAndroidPermission: IS_ANDROID,
            isAndroidPermissionGranted: false,
            ready: false,
            agencies: agencies,
            region: [configuration.center[1], configuration.center[0]]
        };
    }

    async componentWillMount() {
        if (IS_ANDROID) {
            const isGranted = await MapboxGL.requestAndroidLocationPermissions();
            this.setState({
                isAndroidPermissionGranted: isGranted,
                isFetchingAndroidPermission: false,
            });
        }
    }

    componentDidMount() {
        // setup a timer to fetch the vehicles
        this.interval = setInterval(() => {this.getVehicles();}, 10000);

        this.getRoutes().then((agencies) => {
            const updated_agencies = agencies.reduce((acc, agency) => {
                return acc.set(agency.name, agency);
            }, this.state.agencies);

            console.log(`gotRoutes: ${updated_agencies}`);

            // update the state
            this.setState({
                ready: true,
                agencies: updated_agencies
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
        let promises = this.state.agencies.map((agency) => {
            agency = agency.set('visible', this.storage.isAgencyVisible(agency));

            return new Promise((resolve, reject) => {
                agency.get('parser').getRoutes(agency).then((a) => {
                    // the visibility is stored offline in local storage,
                    //  restore it.
                    const routes = a.routes.map((route) => {
                        return route.set('visible', this.storage.isRouteVisible(agency, route));
                    });

                    // update the agency without mutating the original
                    const a1 = a.set('routes', routes);

                    resolve(a1);
                }).catch((e) => {
                    reject(e);
                });
            });
        }).toList().toJS();

        return axios.all(promises);
    }

    getVehicles() {
        // wait until we have routes.
        if (!this.state.ready) {
            return false;
        }

        let promises = this.state.agencies.map((agency) => {
            return new Promise((resolve, reject) => {
                if (!agency.get('visible')) {
                    resolve(agency);
                } else {
                    // update the vehicles in the agency
                    agency.get('parser').getVehicles(agency, null).then((updated_agency) => {
                        resolve(updated_agency);
                    });
                }
            });
        }).toList().toJS();

        return axios.all(promises).then((agencies) => {
            const updated_agencies = agencies.reduce((acc, agency) => {
                return acc.set(agency.name, agency);
            }, this.state.agencies);

            console.log(`gotVehicles: ${updated_agencies}`);

            this.setState({
                agencies: updated_agencies
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
        console.log(`region changed: ${JSON.stringify(region)}`);
        const p = region.properties;
        this.bounds = {
            "_southWest": {"lat": p.visibleBounds[1][1],
                           "lng": p.visibleBounds[1][0]},
            "_northEast": {"lat": p.visibleBounds[0][1],
                           "lng": p.visibleBounds[0][0]}
        };
    }

    render() {
        if (IS_ANDROID && !this.state.isAndroidPermissionGranted) {
            if (this.state.isFetchingAndroidPermission) {
                return null;
            }
            return (
                <View style={sheet.matchParent}>
                    <Text style={styles.noPermissionsText}>
                        You need to accept location permissions in order to use this example applications
                    </Text>
                </View>
            );
        }

        let routes = this.state.agencies.toList().flatMap((agency) => {
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
            <MapboxGL.MapView
                style={styles.map}
                centerCoordinate={region}
                zoomLevel={12}
                onRegionDidChange={this.onBoundsChanged}
                rotateEnabled={false}
                pitchEnabled={false}
                >
                {routes}
            </MapboxGL.MapView>
        );
    }
}

const styles = StyleSheet.create({
    map: {
        flex: 1
    }
});

export default RouteContainer;
