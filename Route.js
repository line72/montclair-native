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
import { View } from 'react-native';
import MapboxGL from '@mapbox/react-native-mapbox-gl';

import Bus from './Bus';

import RouteType from './RouteType';

class Route extends Component {
    constructor(props) {
        super(props);

        this.state = {
            polyline: null,
            selected: false
        };

        // fetch the kml
        RouteType.getPath(this.props.route).then((polyline) => {
            this.setState({
                polyline: polyline
            });
        });
    }

    render() {
        let style = {
            strokeColor: `#${this.props.color}`,
            strokeWidth: this.state.selected ? 7 : 1
        };

        let buses = this.props.vehicles.toList().map((vehicle) => {
            let onOpen = () => {
                this.setState({
                    selected: true
                });
            }
            let onClose = () => {
                this.setState({
                    selected: false
                });
            }

            let route_name = `${this.props.number} - ${this.props.name}`;

            return (
                <Bus key={vehicle.id}
                     id={vehicle.id}
                     position={vehicle.position}
                     heading={vehicle.heading}
                     route_id={vehicle.route_id}
                     route_name={route_name}
                     on_board={vehicle.on_board}
                     destination={vehicle.destination}
                     status={vehicle.op_status}
                     deviation={vehicle.deviation}
                     color={this.props.color}
                     onOpen={onOpen}
                     onClose={onClose}
                     />
            );

        });

        if (this.state.polyline != null) {
            let polylines = this.state.polyline.map((p, i) => {
                let coordinates = p.map(([lat, lng]) => {
                    return {latitude: lat, longitude: lng};
                });
                // return (
                //     <Polyline
                //         key={this.props.id + "_" + i}
                //         coordinates={coordinates}
                //         strokeColor={style.strokeColor}
                //         strokeWidth={style.strokeWidth} />
                // );
            });

            return [
                polylines,
                buses
            ];
        } else {
            return buses;
        }
    }
}

export default Route;
