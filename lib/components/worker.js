'use strict';

const IPC = require( '../helpers/ipc' );

const Workers =
{
  local: new Map(),
  remote: new Map()
}

module.exports = class Worker
{
  constructor()
  {
    IPC.trigger({ event: 'spawned', worker: this.constructor.name });

    if( Workers.local.has( this.constructor.name ) )
    {
      console.warn( 'Multiple "' + this.constructor.name + '" workers instanciated' );
    }

    Workers.local.set( this.constructor.name, this );
  }

  destroy()
  {
    IPC.trigger({ event: 'destroyed', worker: this.constructor.name });

    if( Workers.local.get( this.constructor.name ) === this )
    {
      Workers.local.remove( this.constructor.name );
    }
  }

  static has( name )
  {
    return Boolean( Workers.local.get( name ) );
  }

  static get( name, temporary_force_local = false )
  {
    // TODO check CPU usage first then decide
    let worker = Workers.local.get( name ) || Workers.remote.get( name );

    if( !temporary_force_local && Math.random() < 10.5 )
    {
      console.log( 'Remote Worker' );

      worker = Workers.remote.get( name );
    }

    //worker = null;

    if( !worker )
    {
      Workers.remote.set( name, worker = new Proxy({},
      {
        get: ( remote_worker, method ) =>
        {
          if( !remote_worker[method] )
          {
            remote_worker[method] = ( ...args ) =>
            {
              return IPC.call({ call: { worker: name, method, args } });
            }
          }

          return remote_worker[method];
        }
      }));
    }

    return worker;
  }

  /*static async call( worker, method, args )
  {
    console.log( '"' + worker + '"."' + method + '"', args );

    const instance = Workers.get( this.constructor.name );

    if( instance )
    {
      if( typeof instance[method] === 'function' )
      {
          return instance[method]( args );
      }
      else
      {
        console.error( '"' + worker + '" has no method "' + method + '"' );
      }
    }
    else
    {
      console.warn( '"' + worker + '" worker not instanciated' );
    }
  }*/
}
