'use strict';

module.exports = function connected( cluster, event )
{
  // TODO maybe initialize in cluster constructor, we shall see
  if( !cluster.connections ){ cluster.connections = { local: new Map(), remote: new Map() }; }

  cluster.connections.local.set( event.connection.id, event.process );
}
