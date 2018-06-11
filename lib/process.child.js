'use strict';

// TODO:  1) sending buffers

const UniqueID = require('liqd-unique-id');
const TimedPromise = require('liqd-timed-promise');
const Components =
{
	service: require('./components/service'),
	listener: require('./components/listener'),
	connection: require('./components/connection'),
};

const Calls = new Map();
const CallID = new UniqueID({ unique_interval: 15 * 60 });
const MessageID = new UniqueID({ unique_interval: 15 * 60 });

const Process = module.exports = class Process
{
	static trigger( event )
	{
		process.send( event );
	}

	static call( call )
	{
		return new TimedPromise( ( resolve, reject, remaining_ms ) =>
		{
			//console.log( 'IPC Timeout', remaining_ms, call );

			Calls.set( call.id = CallID.get(), resolve );

			//console.log( 'CallID: ' + call.id );

			call.timeout = remaining_ms;

			process.send( call );
		});
		//process.send();
	}
}

process.on( 'message', async( msg ) =>
{
	if( msg.initialize )
	{
		if( msg.initialize.globals )
		{
			for( let variable in msg.initialize.globals )
			{
				global[variable] = msg.initialize.globals[variable];
			}
		}
	}
	else if( msg.spawn )
	{
		let clazz = require( msg.spawn.script );

		if( !Components[msg.spawn.type].has( clazz.name ) )
		{
			new clazz( msg.spawn.options );
		}
	}
	else if( msg.call )
	{
		let result = await Components.service.get( msg.call.service )[msg.call.method](...msg.call.args);

		process.send({ id: msg.id, result });

		//console.log('Result', result);
	}
	else if( msg.result )
	{
		let resolve = Calls.get( msg.id );

		if( resolve )
		{
			Calls.delete( msg.id );
			resolve( msg.result );
		}
	}
	else
	{
		console.log( 'Process message', msg );
	}
});

//require('./helpers/stats').watch( stats => process.send({ stats }) );
//require('./helpers/stats').watch( stats => console.log( stats ) );
