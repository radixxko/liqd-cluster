'use strict';

const Cluster = require('../../../lib/cluster');

module.exports = class Numbers extends Cluster.Service
{
  constructor()
  {
    super();
  }

  add( a, b )
  {
    return new Cluster.Promise( ( resolve, reject, remaining_ms ) =>
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
