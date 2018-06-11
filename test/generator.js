'use strict';

let start = (new Date()).getTime();
let iterator = null;

function reset(  )
{
  iterator = null;

  console.log('reset');
}

function generate()
{
  if( iterator == null )
  {
    iterator = process.hrtime();
  }

  console.log( iterator );

  setImmediate( reset );
}

setTimeout( generate, 1000 );
setTimeout( generate, 2000 );
