'use strict';

const TimedPromise = require('liqd-timed-promise');

const Components =
{
  worker: require('./components/worker'),
  listener: require('./components/listener'),
  connection: require('./components/connection'),
};

process.on( 'message', async( msg ) =>
{
  if( msg.spawn )
  {
    let clazz = require( msg.spawn.script );

    if( !Components[msg.spawn.type].has( clazz.name ) )
    {
      new clazz( msg.spawn.options );
    }
  }
  else if( msg.call )
  {
    let result = Components.worker.get( msg.call.worker, true )[msg.call.method](...msg.call.args);

    if( result instanceof Promise )
    {
      if( result.constructor.name === 'TimedPromise' && typeof result.timeout === 'function' )
      {
        result = await result.timeout( 3500, { ok: false, error: 'timeout' }).catch( e => e );
      }
      else
      {
        result = await result.catch( e => e );
      }
    }

    console.log(result);
  }
  else
  {
    console.log( 'Process message', msg );
  }
});

require('./helpers/stats').watch( stats => process.send({ stats }) );
