'use strict';

const Process = require('./process.master.js');

let clusters = new Map();

const Cluster = module.exports = class Cluster
{
	static get Service()
	{
		return require('./components/service');
	}

	static get Listener()
	{
		return require('./components/listener');
	}

	static get Connection()
	{
		return require('./components/connection');
	}

	static get Promise()
	{
		return require('liqd-timed-promise');
	}

	static UniqueID( options = {} )
	{
		return new (require('liqd-unique-id'))( options );
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
			const child_process = new Process( cluster );

			cluster.processes.local.set( child_process, new Object() );

			for( let listener of options.listeners )
			{
				child_process.spawn( Object.assign(new Object(), listener, { type: 'listener' }) );
			}

			for( let service of options.services )
			{
				child_process.spawn( Object.assign(new Object(), service, { type: 'service' }) );
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

		console.log('Services', cluster.services);
		console.log('Listeners', cluster.listeners);
		console.log('Connections', cluster.connections);
	}

	on( event, callback )
	{
		// events: exit
	}

	exit()
	{
		console.log('### EXIT ###');
	}
}
