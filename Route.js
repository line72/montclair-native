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
import { Marker } from 'react-native-maps';
//import { GeoJSON } from 'react-leaflet';
import Bus from './Bus';


class Route extends Component {
    constructor(props) {
        super(props);

        this.state = {
            geojson: null,
            selected: false
        };

        // fetch the kml
        this.props.route.getPath().then((geojson) => {
            this.setState({
                geojson: geojson
            });
        });
    }

    render() {
        console.log(`Route.render`);
        
        let style = () => {
            let w = this.state.selected ? 7 : 1;

            return {
                color: `#${this.props.color}`,
                weight: w
            };
        };

        console.log(`vehicles=${JSON.stringify(this.props.vehicles)}`);
        let buses = this.props.vehicles.map((vehicle, index) => {
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

            console.log(`bus=${vehicle.id} ${route_name}`);
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

        // if (this.state.geojson != null) {
        //     return (
        //         <div>
        //             <GeoJSON
        //                 data={this.state.geojson}
        //                 style={style} />
        //             {buses}
        //         </div>
        //     );
        // } else {
        //     return (<div>{buses}</div>);
        // }
        for (let k in buses) {
            let b = buses[k];
            console.log(`buses=${b}`);
        }

        console.log(`isArray: ${Array.isArray(buses)}`);
        
        if (buses.length == 0) {
            return (<Marker coordinate={{latitude: 33.5, longitude: -86.0}}/>);
        } else {
            return buses[0];
        }
    }
}

export default Route;
