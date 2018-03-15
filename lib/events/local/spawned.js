'use strict';

module.exports = function spawned( cluster, event )
{
  let component = ( event.listener ? 'listener' : ( event.worker ? 'worker' : undefined ) );

  if( component )
  {
    // TODO maybe initialize in cluster constructor, we shall see
    if( !cluster[component+'s'] ){ cluster[component+'s'] = { local: new Map(), remote: new Map() }; }

    let components = cluster[component+'s'].local.get( event[component] );

    if( !components )
    {
      cluster[component+'s'].local.set( event[component], components = new Set() );
    }

    components.add( event.process );
  }
}
