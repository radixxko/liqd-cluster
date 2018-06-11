'use strict';

let Process;

const Listeners = new Map();

module.exports = class Listener
{
	constructor()
	{
		if( !Process )
		{
			Process = require( '../process.child' );
		}

		Process.trigger({ event: 'spawned', listener: this.constructor.name });

		if( Listeners.has( this.constructor.name ) )
		{
			console.warn( 'Multiple "' + this.constructor.name + '" listeners instanciated' );
		}

		Listeners.set( this.constructor.name, this );
	}

	destroy()
	{
		Process.trigger({ event: 'destroyed', listener: this.constructor.name });

		if( Listeners.get( this.constructor.name ) === this )
		{
			Listeners.remove( this.constructor.name );
		}
	}

	static has( name )
	{
		return Boolean( Listeners.get( name ) );
	}

	static get( name )
	{
		let listener = Listeners.get( name );

		return listener;
	}
}
