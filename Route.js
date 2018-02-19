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
            geojson: null,
            selected: false
        };

        // fetch the kml
        RouteType.getPath(this.props.route).then((geojson) => {
            this.setState({
                geojson: geojson
            });
        });
    }

    render() {
        let style = {
            lineColor: `#${this.props.color}`,
            lineWidth: this.state.selected ? 7 : 1
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

        if (this.state.geojson != null) {
            let path = (
                <MapboxGL.ShapeSource
                    id={this.props.id + "_shape"}
                    key={this.props.id}
                    shape={this.state.geojson}>
                    <MapboxGL.LineLayer
                        id={this.props.id + "_stroke"}
                        style={style} />
                </MapboxGL.ShapeSource>
            );

            return [
                path,
                buses
            ];
        } else {
            return buses;
        }
    }
}

export default Route;
