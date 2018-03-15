'use strict';

module.exports = function connected( cluster, event )
{
  // TODO maybe initialize in cluster constructor, we shall see
  if( !cluster.connections ){ cluster.connections = { local: new Map(), remote: new Map() }; }

  let connections = cluster.connections.local.get( event.connection.type );

  if( !connections )
  {
    cluster.connections.local.set( event.connection.type, connections = new Map() );
  }

  connections.set( event.connection.id, event.process );
}
