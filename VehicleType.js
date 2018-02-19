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

import Immutable from 'immutable';

var T = Immutable.Record({id: 0,
                          position: [0,0],
                          direction: '',
                          heading: 0,
                          destination: '',
                          on_board: 0,
                          deviation: 0,
                          op_status: '',
                          color: '',
                          route_id: null});

export default {T};
