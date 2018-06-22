const critical = require('../../index');

let timeout; // eslint-disable-line

critical.enter((err, exit) => {
  if (err) throw new Error('failed to enter');

  console.log('entered critical');

  timeout = setTimeout(() => {
    console.log('exited critical');
    exit();
  }, 500);
});


process.on('SIGINT', () => {
  critical.enter((err) => {
    if (err) console.log('error thrown');
  });
});
