'use strict';

module.exports = function stats( cluster, event )
{
  if( !cluster.processes ){ cluster.processes = { local: new Map(), remote: new Map() }; }

  let process_data = cluster.processes.get( event.process );

  process_data.stats = event.stats;
  process_data.stats.time = process.hrtime();
}
