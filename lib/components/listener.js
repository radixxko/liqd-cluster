'use strict';

const IPC = require( '../helpers/ipc' );

const Listeners = new Map();

module.exports = class Listener
{
  constructor()
  {
    IPC.trigger({ event: 'spawned', listener: this.constructor.name });

    if( Listeners.has( this.constructor.name ) )
    {
      console.warn( 'Multiple "' + this.constructor.name + '" listeners instanciated' );
    }

    Listeners.set( this.constructor.name, this );
  }

  destroy()
  {
    IPC.trigger({ event: 'destroyed', listener: this.constructor.name });

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
