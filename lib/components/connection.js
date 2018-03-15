'use strict';

const IPC = require( '../helpers/ipc' );

const Connections = new Map();

module.exports = class Connection
{
  constructor( type, id )
  {
    IPC.trigger({ event: 'connected', connection: { type, id } });

    let connections = Connections.get( type );

    if( !connections )
    {
      Connections.set( connections = new Map() );
    }

    connections.set( id, this );
  }

  destroy()
  {
    IPC.trigger({ event: 'disconnected', connection: { type, id } });
  }
}
