'use strict';

const WebSocket = require('../../node_modules/ws');
const Cluster = require('../../../lib/cluster');

class WSClient extends Cluster.Connection
{
  constructor( ws, id )
  {
    super( 'client' + id );

    this.ws = ws;

    this.ws.on( 'message', async(msg) =>
    {
      msg = JSON.parse(msg);

      //let start = process.hrtime();

      let result = await Cluster.Service.get(msg.service)[msg.method](...msg.data)
        .timeout( 15000, { ok: false, error: 'timeout' })
        .catch( e => e );

      //let end = process.hrtime( start );

      //console.log('Final Result', result);
      //console.log('Elapsed', end[0] * 1e3 + end[1] / 1e6, 'ms');
      this.send({ requestID: msg.requestID, result });
    });
  }

  send( msg )
  {
    this.ws.send( JSON.stringify(msg) );
  }
}

module.exports = class Server extends Cluster.Listener
{
  constructor( options )
  {
    super();

    const wss = new WebSocket.Server({ port: options.port });

    wss.on('connection', function connection(ws)
    {
      ws.once('message', (msg) =>
      {
        try
        {
          msg = JSON.parse(msg);

          if( msg.action === 'connect' )
          {
            return new WSClient( ws, msg.id );
          }
        }
        catch(e){ console.error(e); }

        ws.terminate();
      });
    });
  }
}
