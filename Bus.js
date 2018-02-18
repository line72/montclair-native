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
import { View, Text, Image, StyleSheet } from 'react-native';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import renderIf from 'render-if';

class Bus extends Component {
    constructor(props) {
        super(props);

        // !mwd - This is a bit of a hack
        //  Our Image takes a while to fetch
        //   and the map doesn't automatically
        //   render the updated image upon finishing.
        //  So, we have a key in our state, and after
        //   we have fetched the updated icon, we set
        //   the key to a random value, causing a
        //   state change.
        this.state = {
            key: 0
        };
    }

    render() {
        // url of our icon
        const url = `https://realtimebjcta.availtec.com/InfoPoint/IconFactory.ashx?library=busIcons\\mobile&colortype=hex&color=${this.props.color}&bearing=${this.props.heading}`;
        //const url = `https://realtimebjcta.availtec.com/InfoPoint/IconFactory.ashx?library=busIcons\\mobile&colortype=hex&color=${this.props.color}&bearing=0`;

        // create an image from the url.
        // Note that it may take a moment to download, so
        //  the initial image may be wrong.
        // Once this finishes loading, we will set a random
        //  value in our state to force a re-render.
        //let icon = <Image source={{uri: url}} style={{width: 39, height: 50}} onLoad={(e) => {this.setState({key: Math.random()})} }></Image>;
        let icon = <Image source={{uri: url}} style={{width: 39, height: 50}}></Image>;

        // let coordinate = {latitude: this.props.position[0],
        //                   longitude: this.props.position[1]};
        let coordinate = [this.props.position[1], this.props.position[0]];

        console.log(`Bus.render ${JSON.stringify(coordinate)}`);
        return (
            <MapboxGL.PointAnnotation
                key={this.props.id}
                id={this.props.id}
                title={this.props.route_name}
                coordinate={coordinate}
                >
                {icon}
                <MapboxGL.Callout title={this.props.route_name} />
            </MapboxGL.PointAnnotation>
        );
        // return (
        //     <Marker coordinate={coordinate}
        //             onPress={this.props.onOpen}
        //             onCalloutPress={this.props.onClose}
        //         >
        //         <View renderKey={this.state.key}>
        //             <Callout style={styles.callout}>
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
        //             </Callout>
        //         </View>
        //     </Marker>
        // );
    }
}

const styles = StyleSheet.create({
    callout: {
        width: 250
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

export default Bus;
