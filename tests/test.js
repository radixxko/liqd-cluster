'use strict';

function run( script, ...parameters )
{
  return new Promise( resolve =>
  {
    let child_process = require('child_process').execFile( 'node', [script].concat(parameters), (error, stdout, stderr) =>
    {
      if( stderr ){ console.error( stderr ); }
    });

    child_process.stdout.on('data', function(data){ console.log( data.toString().trim()); });
    child_process.stderr.on('data', function(data){ console.error( data.toString().trim()); });
    child_process.on('close', resolve);
  });
}

const app_1 = async() =>
{
  let ports = [ 53127, 53128 ];
  let servers = [], clients = [];

  let clientID = 0;

  for( let port of ports )
  {
    servers.push( run( __dirname + '/app_1/app.js', ports.join(','), port ) );

    for( let i = 0; i < 2; ++i )
    {
      clients.push( run( __dirname + '/app_1/wsclient.js', ++clientID, port + 100 ) );
    }

    break;
  }

  await Promise.all( servers );
  await Promise.all( clients );
}

app_1();

setTimeout( process.exit, 10000 );
