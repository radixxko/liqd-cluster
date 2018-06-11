'use strict';

let Process;

const Connections = new Map();

module.exports = class Connection
{
	constructor( id )
	{
		this.id = id;

		if( !Process )
		{
			Process = require( '../process.child' );
		}

		Process.trigger({ event: 'connected', connection: { id } });

		Connections.set( id, this );
	}

	join( channels )
	{
		//TODO joins channels
	}

	leave( channels )
	{
		//TODO leaves channels
	}

	destroy()
	{
		if( Connections.get( this.id ) === this )
		{
			connections.delete( this.id );

			Process.trigger({ event: 'disconnected', connection: { id: this.id } });
		}
	}

	static get( id )
	{
		// return
	}

	static any( channel )
	{
		// gets any connection in channel
	}

	static all( channel )
	{
		// gets all connections in channel
	}

// send :message reliable (true/false)
}
