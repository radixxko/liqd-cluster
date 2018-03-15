'use strict';

const TimedPromise = require('liqd-timed-promise');

const Cluster = require('../../../lib/cluster');

module.exports = class Numbers extends Cluster.Worker
{
  constructor()
  {
    super();
  }

  add( a, b )
  {
    return new TimedPromise( ( resolve, reject, timeout ) =>
    {
      resolve( a + b );
    });
  }

  subtract( a, b )
  {
    return new Promise( ( resolve, reject, timeout ) =>
    {
      resolve( a - b );
    });
  }

  async multiply( a, b )
  {
    return a * b;
  }

  divide( a, b )
  {
    return a / b;
  }

  destroy()
  {
    super.destroy();
  }
}
