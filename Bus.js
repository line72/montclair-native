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
import { Marker, LatLng, Callout } from 'react-native-maps';
import renderIf from 'render-if';

//import { Marker, Popup } from 'react-leaflet';
//import L from 'leaflet';

//import './Bus.css';

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

        // create an image from the url.
        // Note that it may take a moment to download, so
        //  the initial image may be wrong.
        // Once this finishes loading, we will set a random
        //  value in our state to force a re-render.
        let icon = <Image source={{uri: url}} style={{width: 39, height: 50}} onLoad={(e) => {this.setState({key: Math.random()})} }></Image>;

        let coordinate = {latitude: this.props.position[0],
                          longitude: this.props.position[1]};
        
        return (
            <Marker coordinate={coordinate}>
                <View renderKey={this.state.key}>
                    {icon}
                    <Callout style={styles.callout}>
                        <View style={styles.row}>
                            <Text style={styles.header}>Route:</Text>
                            <Text style={styles.data}>{this.props.route_name}</Text>
                        </View>
                        {
                            renderIf(this.props.destination !== '')(
                                <View style={styles.row}>
                                    <Text style={styles.header}>Destination:</Text>
                                    <Text style={styles.data}>{this.props.destination}</Text>
                                </View>
                            )
                        }
                        {
                            renderIf(this.props.on_board !== '')(
                                <View style={styles.row}>
                                    <Text style={styles.header}>Riders:</Text>
                                    <Text style={styles.data}>{this.props.on_board}</Text>
                                </View>
                            )
                        }
                        {
                            renderIf(this.props.status !== '')(
                                <View style={styles.row}>
                                    <Text style={styles.header}>status:</Text>
                                    <Text style={styles.data}>{this.props.status} ({this.props.deviation}) minutes</Text>
                                </View>
                            )
                        }
                    </Callout>
                </View>
            </Marker>
        );
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
