'use strict';

module.exports = class Message
{
	constructor( connection, id, data, headers )
	{
		this.connection = connection;
		this.id = id;
		this.data = data;
		this.headers = headers;
	}

	reply( data, headers )
	{
		let id = 12;

		Connection( this.connection ).send({ id, data, headers });
	}
}
