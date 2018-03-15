'use strict';

// TODO:  1) sending buffers

const TimedPromise = require('liqd-timed-promise');

const Requests = new Map();

let id = ( Math.round((new Date()).getTime()/1000) % 219902325 * 10000 + Math.floor( Math.random() * 10000 ) ) * 2048;

module.exports = class IPC
{
  constructor(  )
  {

  }

  static trigger( event )
  {
    process.send( event );
  }

  static call( call )
  {
    return new TimedPromise( ( resolve, reject, timeout ) =>
    {
      console.log( 'Timeout', timeout );

      Requests.set( call.id = ++id, resolve );

      call.timeout = timeout;

      process.send( call );
    });
    //process.send();
  }
}
