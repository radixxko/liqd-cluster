'use strict';

function sleep( ms ){ return new Promise( resolve => setTimeout( resolve, ms ) ); }

function generateMessage()
{
  if( Math.random() < 0.5 )
  {
    return { worker: 'Numbers', method: ['add', 'subtract', 'multiply', 'divide'][Math.floor(Math.random()*4)], data: [ Math.random() * Number.MAX_SAFE_INTEGER, Math.random() * Number.MAX_SAFE_INTEGER ] };
  }
  else
  {
    return { worker: 'Strings', method: ['concat', 'join'][Math.floor(Math.random()*2)], data: [ 'a', 'b' ] };
  }
}

function testReply( msg, result )
{
  if( msg.worker === 'Numbers' )
  {
    switch ( msg.method )
    {
      case 'add':       return ( result === msg.data[0] + msg.data[1] );
      case 'subtract':  return ( result === msg.data[0] - msg.data[1] );
      case 'multiply':  return ( result === msg.data[0] * msg.data[1] );
      case 'divide':    return ( result === msg.data[0] / msg.data[1] );
      default: return false;
    }
  }
  else if( msg.worker === 'Strings' )
  {
    switch ( msg.method )
    {
      case 'concat':    return ( result === msg.data[0] + msg.data[1] );
      case 'join':      return ( result === [ msg.data[0], msg.data[1] ].join(',') );
      default: return false;
    }
  }
}

( async() =>
{
  await sleep(1000);

  const WebSocket = require('../node_modules/ws');
  const ws = new WebSocket('ws://localhost:'+process.argv[3]);

  const send = msg => ws.send( JSON.stringify(msg) );

  ws.on( 'open', async() =>
  {
    let requestID = 0, requests = new Map();

    const request = ( msg ) =>
    {
      return new Promise( ( resolve, reject ) =>
      {
        requests.set( msg.requestID = process.pid + ':' + ++requestID, resolve );

        send( msg );

        setTimeout( () =>
        {
          if( requests.has( msg.requestID ) )
          {
            requests.delete( msg.requestID );

            reject( 'timeout' );
          }
        }, 30000);
      });
    }

    ws.on( 'message', async( msg ) =>
    {
      msg = JSON.parse( msg );

      if( msg.requestID.indexOf( process.pid + ':' ) === 0 )
      {
        if( requests.has( msg.requestID ) )
        {
          requests.get( msg.requestID )( msg );
          requests.delete( msg.requestID );
        }
        else
        {
          console.log('Dajaka glupocina');
        }
      }
      else
      {
        console.log('Dispatch');
      }
    });

    send({ action: 'connect', id: process.argv[2] });

    await sleep(500 + Math.ceil(Math.random()*10));

    let zupaStart = process.hrtime();

    //for( let i = 0; i < 5000; ++i )
    {
        //let start = process.hrtime();
        let requestMsg = generateMessage();

        let result = await request( requestMsg ).catch(e => e);
        let status = testReply( requestMsg, result.result );

        if( !status )
        {
          console.log('Problem', requestMsg, result.result);
        }
        //else{ console.log('parada', result.result); }

        //let elapsed = process.hrtime(start);

        //console.log( ( elapsed[0] * 1e3 + elapsed[1] / 1e6 ), 'ms' );
    }

    let zupaElapsed = process.hrtime(zupaStart);

    console.log( ( zupaElapsed[0] * 1e3 + zupaElapsed[1] / 1e6 ), 'ms in total', ( zupaElapsed[0] * 1e3 + zupaElapsed[1] / 1e6 ) / 5000 );

    //ws.send('something');
  });
})();
