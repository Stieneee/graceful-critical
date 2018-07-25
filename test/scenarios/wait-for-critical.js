const critical = require('../../index');

// keep the applcaiton alive
const keepAlive = setTimeout(() => { // eslint-disable-line
  console.log('time to die');
}, 5000000);


let timeout; // eslint-disable-line

critical.enter((err, exit) => {
  if (err) throw new Error('failed to enter');

  console.log('entered critical');

  timeout = setTimeout(() => {
    console.log('exited critical');
    exit();
  }, 500);
});
