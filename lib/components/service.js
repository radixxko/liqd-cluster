'use strict';

let Process;// = require( '../process.child' );
const TimedPromise = require('liqd-timed-promise');

const Services =
{
	proxy: new Map(),
	local: new Map()
}

module.exports = class Service
{
	constructor()
	{
		if( !Process )
		{
			Process = require( '../process.child' );
		}

		Process.trigger({ event: 'spawned', service: this.constructor.name });

		if( Services.local.has( this.constructor.name ) )
		{
			console.warn( 'Multiple "' + this.constructor.name + '" services instanciated' );
		}

		Services.local.set( this.constructor.name, this );
	}

	destroy()
	{
		Process.trigger({ event: 'destroyed', service: this.constructor.name });

		if( Services.local.get( this.constructor.name ) === this )
		{
			Services.local.remove( this.constructor.name );
		}
	}

	static has( name )
	{
		return Boolean( Services.local.get( name ) );
	}

	static get( name )
	{
		let service_proxy = Services.proxy.get( name );

		if( !service_proxy )
		{
			Services.proxy.set( name, service_proxy = new Proxy( new Object(),
			{
				get: ( service_proxy, method ) =>
				{
					if( !service_proxy[method] )
					{
						service_proxy[method] = ( ...args ) =>
						{
							// TODO check CPU usage first then decide
							let local_service = Services.local.get( name );

							if( local_service && Math.random() < 10.1 )
							{
								//console.log( 'Using Local Service' );

								return new TimedPromise( async( resolve, reject, remaining_ms ) =>
								{
									try
									{
										let result = local_service[method]( ...args );

										if( result instanceof Promise )
										{
											if( result.constructor.name === 'TimedPromise' && typeof result.timeout === 'function' )
											{
												result = await result.timeout( remaining_ms );
											}
											else
											{
												result = await result;
											}
										}

										resolve( result )
									}
									catch( error )
									{
										reject( error );
									}
								});
							}
							else
							{
								//console.log( 'Calling Remote service' );

								return Process.call({ call: { service: name, method, args }});
							}
						}
					}

					return service_proxy[method];
				}
			}));
		}

		return service_proxy;
	}
}
