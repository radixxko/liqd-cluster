'use strict';

const http = require('http');
const querystring = require('querystring');

function request( host, path, parameters )
{
  return new Promise( ( resolve, reject ) =>
  {
    http.get({ hostname: host.split(':')[0], port: host.split(':')[1] || 80, path: path + '?' + querystring.stringify( parameters ) }, res =>
    {
      let data = '';

      res.on( 'data', chunk => data += chunk.toString() );
      res.on( 'end', () => { resolve( JSON.parse( data ) ); } );
    });
  });
}

function sleep( ms ){ return new Promise( resolve => setTimeout( resolve, ms ) ); }

( async() =>
{
  await sleep( 3000 );

  let responses = new Map();

  for( let i = 0; i < 50; ++i )
  {
      let response = await request( 'localhost:'+process.argv[2], '/numbers/add', { a: 5, b: 6 });

      if( !responses.get( response.pid ) )
      {
        responses.set( response.pid, 0 );
      }

      responses.set( response.pid, responses.get( response.pid ) + 1 );

      //await sleep( 10 );
  }

  console.log( responses );

})();
