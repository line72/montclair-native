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
import { Marker, Polyline } from 'react-native-maps';

import Bus from './Bus';

class Route extends Component {
    constructor(props) {
        super(props);

        this.state = {
            polyline: null,
        };

        // fetch the kml
        this.props.route.getPath().then((polyline) => {
            this.setState({
                polyline: polyline
            });
        });
    }

    render() {
        let style = {
            strokeColor: `#${this.props.color}`,
            strokeWidth: 7
        };

        let buses = this.props.vehicles.map((vehicle, index) => {
            let onOpen = () => {
                if (this.props.onPress) {
                    this.props.onPress(this);
                }
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
                     />
            );

        });

        if (this.state.polyline != null && this.props.selected) {
            let polylines = this.state.polyline.map((p, i) => {
                let coordinates = p.map(([lat, lng]) => {
                    return {latitude: lat, longitude: lng};
                });
                return (
                    <Polyline
                        key={this.props.id + "_" + i}
                        coordinates={coordinates}
                        strokeColor={style.strokeColor}
                        strokeWidth={style.strokeWidth} />
                );
            });

            return (
                <View>
                    {polylines}
                    {buses}
                </View>
            );
        } else {
            return (<View>{buses}</View>);
        }
    }
}

export default Route;
