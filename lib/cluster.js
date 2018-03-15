'use strict';

const clusters = new WeakMap();

function spawn( parameters = null )
{
  let master_argv = process.argv;

  process.argv = [ process.argv[0], __dirname + '/process' ];
  const child_process = require('cluster').fork();
  process.argv = master_argv;

  return child_process;
}

function randomItem( container )
{
  let index = Math.floor( Math.random() * container.size );
  let iterator = container[Symbol.iterator]();

  while( --index >= 0 ){ iterator.next(); };

  return iterator.next().value;
}

const Cluster = module.exports = class Cluster
{
  static get Worker()
  {
    return require('./components/worker');
  }

  static get Listener()
  {
    return require('./components/listener');
  }

  static get Connection()
  {
    return require('./components/connection');
  }

  constructor( options )
  {
    let cluster;

    //cluster.transport = new (require('./transports/' + ( options.transport || 'websocket' ) ))( cluster, options.nodes, options.me );

    clusters.set( this, cluster =
    {
        options,
        transport: null,
        processes: { local: new Map(), remote: new Map() },
        events:
        {
          local:
          {
            connected:  require('./events/local/connected'),
            spawned:    require('./events/local/spawned'),
            stats:      require('./events/local/stats'),
          },
          remote:
          {
            spawned:    require('./events/remote/spawned'),
          }
        },
        route: ( component, name ) =>
        {
          // TODO check utilization and pick process to perform action


        }
    });

    for( let i = 0; i < 2 /*require('os').cpus().length*/; ++i )
    {
      const child_process = spawn();

      cluster.processes.local.set( child_process, new Object() );

      child_process.on( 'exit', code =>
      {
        cluster.processes.local.delete( child_process );

        // TODO error handling - possible autorespawn
      });

      child_process.on( 'message', message =>
      {
        if( typeof message === 'object' )
        {
          if( message.event )
          {
            if( cluster.events.local[ message.event ] )
            {
              message.process = child_process;

              cluster.events.local[ message.event ]( cluster, message );
            }
          }
          else if( message.call )
          {
            console.log( 'Calling', message );

            let workers = cluster['workers'].local.get(message.call.worker);
            let worker = randomItem(cluster['workers'].local.get(message.call.worker));

            worker.send({ timeout: message.timeout, call: message.call });
          }
        }
      });

      for( let listener of options.listeners )
      {
        child_process.send({ spawn: Object.assign({}, listener, { type: 'listener' }) });
      }

      for( let worker of options.workers )
      {
        child_process.send({ spawn: Object.assign({}, worker, { type: 'worker' }) });
      }
    }

    /*

    require('./helpers/stats').watch( ( stats ) =>
    {
      let total_stats = { cpus: stats.cpus, cpu: stats.cpu, ram: stats.ram, processes: 1 };

      for( let child_process_data of this.processes.values() )
      {
        if( child_process_data.stats )
        {
          total_stats.cpu += child_process_data.stats.cpu;
          total_stats.ram += child_process_data.stats.ram;
          ++total_stats.processes;
        }
      }

      //console.log( process.pid, total_stats )
    });*/
  }

  status()
  {
    const cluster = clusters.get( this );

    console.log('Workers', cluster.workers);
    console.log('Listeners', cluster.listeners);
    console.log('Connections', cluster.connections);
  }
}
