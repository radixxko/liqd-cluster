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
  services:
  [
    { name: 'Numbers', script: __dirname + '/services/numbers.js' },
    { name: 'Strings', script: __dirname + '/services/strings.js' }
  ]
});
