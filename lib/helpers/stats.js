let tick = process.hrtime();
let cpuUsage = process.cpuUsage();
let tickTimer;

const callbacks = new Set();

let stats =
{
  cpus: require('os').cpus().length,
  cpu: 0,
  ram: 0
}

const Stats = module.exports = class Stats
{
  static watch( callback )
  {
    callbacks.add( callback );

    if( !tickTimer )
    {
      tickTimer = setTimeout( Stats.tick, 1000 );
    }
  }

  static unwatch( callback )
  {
    callbacks.delete( callback );

    if( tickTimer && callbacks.size === 0 )
    {
      clearTimeout( tickTimer );
      tickTimer = null;
    }
  }

  static tick()
  {
    let tickElapsed = process.hrtime(tick)
    let tickCpuUsage = process.cpuUsage(cpuUsage);

    tick = process.hrtime();
    cpuUsage = process.cpuUsage();

    stats.cpu = 100 * (tickCpuUsage.user + tickCpuUsage.system) / ( tickElapsed[0] * 1000000 + tickElapsed[1] / 1000 );
    stats.ram = process.memoryUsage().rss / 1048576;

    for( let callback of callbacks )
    {
      callback( stats );
    }

    tickTimer = setTimeout( Stats.tick, 1000 );
  }
}


//Stats.useCPU();
