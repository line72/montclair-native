import 'react-native';
import React from 'react';
import Immutable from 'immutable';

import RouteType from '../RouteType';
import VehicleType from '../VehicleType';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

it('is immutable', () => {
    let r = RouteType.T();
    let vehicles = r.vehicles.set({0: VehicleType.T({id: 0})});

    expect(r.vehicles.size).toEqual(0);
    expect(vehicles.size).toEqual(1);
});

it('can add a vehicle', () => {
    let r1 = RouteType.T({id: 4, color: 'ff00ff'});
    let r2 = RouteType.addVehicle(r1, VehicleType.T());

    expect(r1.vehicles.size).toEqual(0);
    expect(r2.vehicles.size).toEqual(1);
    expect(r1.id).toEqual(r2.id);
    expect(r1.color).toEqual(r2.color);
});
