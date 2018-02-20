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
import { Animated, View, Text, Image, StyleSheet } from 'react-native';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import renderIf from 'render-if';

class Bus extends Component {
    render() {
        // url of our icon
        let url = `https://realtimebjcta.availtec.com/InfoPoint/IconFactory.ashx?library=busIcons\\mobile&colortype=hex&color=${this.props.color}&bearing=${this.props.heading}`;

        // create a unique icon based on the id and heading
        //let icon_id = `bus-${this.props.id}-${this.props.heading}`;
        let icon_id=`bus-${this.props.id}`;
        let features = {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    id: icon_id,
                    properties: {
                        icon: icon_id
                    },
                    geometry: {
                        type: 'Point',
                        coordinates: [this.props.position[1],
                                      this.props.position[0]]
                    }
                }
            ]
        };

        return (
            <MapboxGL.ShapeSource
                key={icon_id}
                id={icon_id}
                shape={features}
                images={{[icon_id]: {uri: url}}}
                >
                <MapboxGL.SymbolLayer
                    id={icon_id}
                    style={mapStyles.icon} />
            </MapboxGL.ShapeSource>
        );

        // return (
        //     <MapboxGL.PointAnnotation
        //         key={this.props.id}
        //         id={`${this.props.id}`}
        //         title={this.props.route_name}
        //         coordinate={coordinate}
        //         onSelected={this.props.onOpen}
        //         onDeselected={this.props.onClose}
        //         >
        //         <MapboxGL.Callout title={this.props.route_name} style={styles.callout}>
        //             <View style={styles.content}>
        //                 <View style={styles.row}>
        //                     <Text style={styles.header}>Route:</Text>
        //                     <Text style={styles.data}>{this.props.route_name}</Text>
        //                 </View>
        //                 {
        //                     renderIf(this.props.destination !== '')(
        //                         <View style={styles.row}>
        //                             <Text style={styles.header}>Destination:</Text>
        //                             <Text style={styles.data}>{this.props.destination}</Text>
        //                         </View>
        //                     )
        //                 }
        //                 {
        //                     renderIf(this.props.on_board !== '')(
        //                         <View style={styles.row}>
        //                             <Text style={styles.header}>Riders:</Text>
        //                             <Text style={styles.data}>{this.props.on_board}</Text>
        //                         </View>
        //                     )
        //                 }
        //                 {
        //                     renderIf(this.props.status !== '')(
        //                         <View style={styles.row}>
        //                             <Text style={styles.header}>status:</Text>
        //                             <Text style={styles.data}>{this.props.status} ({this.props.deviation}) minutes</Text>
        //                         </View>
        //                     )
        //                 }
        //             </View>
        //             <View style={styles.tip} />
        //         </MapboxGL.Callout>

        //     </MapboxGL.PointAnnotation>
        // );
    }
}

const styles = StyleSheet.create({
    callout: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 250,
        zIndex: 9999999,
    },
    tip: {
        zIndex: 1000,
        marginTop: -2,
        elevation: 0,
        backgroundColor: 'transparent',
        borderTopWidth: 16,
        borderRightWidth: 8,
        borderBottomWidth: 0,
        borderLeftWidth: 8,
        borderTopColor: 'white',
        borderRightColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: 'transparent',
    },
    content: {
        width: 250,
        position: 'relative',
        padding: 8,
        flex: 1,
        borderRadius: 3,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.2)',
        backgroundColor: 'white',
    },
    row: {
        flexDirection: 'row',
        flex: 1,
        borderWidth: 0,
        padding: 2,
        justifyContent: 'space-around'
    },
    header: {
        flex: 1,
        borderWidth: 0,
        alignItems: 'center',
        justifyContent: 'center'
    },
    data: {
        flex: 2,
        borderWidth: 0,
        alignItems: 'center',
        justifyContent: 'center'
    }
});
const mapStyles = MapboxGL.StyleSheet.create({
    icon: {
        iconImage: '{icon}',
        iconSize: 1,
        iconOffset: [0, -25]
    }
});


export default Bus;
