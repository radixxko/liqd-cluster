'use strict';

const Cluster = require('../../../lib/cluster');

module.exports = class Strings extends Cluster.Service
{
  constructor()
  {
    super();
  }

  concat( a, b )
  {
    return a + b;
  }

  join( a, b )
  {
    return [ a, b ].join(',');
  }
}
