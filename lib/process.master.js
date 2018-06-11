'use strict';

const UniqueID = require('liqd-unique-id');
const TimedPromise = require('liqd-timed-promise');

const Calls = new Map();

function randomItem( container )
{
	let index = Math.floor( Math.random() * container.size );
	let iterator = container[Symbol.iterator]();

	while( --index >= 0 ){ iterator.next(); };

	return iterator.next().value;
}

module.exports = class Process
{
	constructor( cluster )
	{
		let master_argv = process.argv;

		process.argv = [ process.argv[0], __dirname + '/process.child' ];
		this.process = require('cluster').fork();
		process.argv = master_argv;

		this.process.send({ initialize: { globals: cluster.options.globals } });

		this.process.on( 'exit', code =>
		{
			cluster.processes.local.delete( child_process );

			// TODO error handling - possible autorespawn
		});

		this.process.on( 'message', message =>
		{
			if( typeof message === 'object' )
			{
				if( message.event )
				{
					if( cluster.events.local[ message.event ] )
					{
						message.process = this.process;

						cluster.events.local[ message.event ]( cluster, message );
					}
				}
				else if( message.call )
				{
					Calls.set( message.id, this.process );

					let services = cluster.services.local.get(message.call.service);
					let service = randomItem(cluster.services.local.get(message.call.service));

					service.send({ id: message.id, timeout: message.timeout, call: message.call });
				}
				else if( message.result )
				{
					let caller = Calls.get( message.id );

					if( caller )
					{
						Calls.delete( message.id );
						caller.send({ id: message.id, result: message.result });
					}
				}
			}
		});
	}

	spawn( component )
	{
		this.process.send({ spawn: component });
	}
}
