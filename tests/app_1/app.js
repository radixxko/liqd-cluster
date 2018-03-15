'use strict';

const Cluster = require('../../lib/cluster.js');

const app = new Cluster(
{
  nodes: process.argv[2].split(',').map( p => parseInt(p) ),
  me: parseInt(process.argv[3]),
  listeners:
  [
    { script: __dirname + '/listeners/wsserver.js', options: { port: parseInt(process.argv[3]) + 100 } }
  ],
  workers:
  [
    { name: 'Numbers', script: __dirname + '/workers/numbers.js' },
    { name: 'Strings', script: __dirname + '/workers/strings.js' }
  ]
});
