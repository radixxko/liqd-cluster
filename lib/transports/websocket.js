'use strict';

const Transport = require( './abstract.js' );
const Websocket = require( 'ws' );

class Node
{
  constructor(  )
  {

  }
}

module.exports = class WebsocketTransport extends Transport
{
  constructor( cluster, nodes, me )
  {
    super();

    this.server = new Websocket.Server({ port: me });

    this.server.on( 'connection', ( client, req ) =>
    {
      let node = parseInt( req.url.substr(1) );

      console.log( node, 'connected' );

      client.on( 'message', message =>
      {
        console.log( message );
      });
    });

    for( let node of nodes )
    {
      if( node !== me )
      {
        let client = new Websocket('ws://localhost:'+node+'/'+me);

        client.on('open', () =>
        {

        });

        client.on('error', ( err ) =>
        {
          console.log('Error', err);
        });
      }
    }

    console.log( '### WebsocketTransport', nodes, me );
  }

  trigger( event )
  {

  }

  send( node, message )
  {
    console.log( 'Send ', node, message );
  }
}
