let exitTimeout = 1000; // Setable by user
let exitPanicLimit = 5; // Setable by user

let numLocks = 0;
let exitCB;
let exitCalled = false;
let exitCallCount = 0;


function exitTimeoutReached() {
  console.error('Exit timeout reached. Forcing exit');
  process.exit(10);
}

function finishExit() {
  console.log('All critical sections complete.');
  if (typeof exitCB === 'function') {
    console.log('Calling exit callback.');
    exitCB(() => {
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

function sigHandle() {
  if (exitCalled) { // Handle multiple exit requests
    if (exitCallCount === 1) console.log('Already exiting. Continue to press crtl-c to force exit.');
    exitCallCount += 1;
    if (exitCallCount >= exitPanicLimit) {
      console.log('Panic limited reached. Exiting');
    } else {
      console.log('Panic count ', exitCallCount, ' of ', exitPanicLimit);
    }
    return;
  }

  // First exit call
  console.log('Attempting graceful shutdown.');
  setTimeout(exitTimeoutReached, exitTimeout);
  exitCalled = true;
  exitCallCount += 1;
  if (numLocks > 0) {
    console.log('Waiting on critcal section locks...');
  } else {
    finishExit();
  }
}

class EXIT {
  constructor() {
    this.called = false;
  }

  exit() {
    if (!this.called) {
      this.called = true;
      if (numLocks === 0) finishExit();
    }
  }
}

process.on('SIGTERM', sigHandle);

process.on('SIGINT', sigHandle);

module.exports.setExitTimeout = async function setExitTimeout(timeMS) {
  exitTimeout = timeMS;
};

module.exports.setPanicLimit = async function setExitPanicLimit(count) {
  exitPanicLimit = count;
};

module.exports.setExitCallback = async function setExitCallback(cb) {
  exitCB = cb;
};

module.exports.enter = async function enter(cb) {
  const lockExit = new EXIT().exit;
  numLocks += 1;

  if (exitCalled) {
    if (typeof cb === 'function') {
      cb(new Error('process is attempting to exit'));
    }
    throw new Error('process is attempting to exit');
  }

  if (typeof cb === 'function') {
    cb(null, lockExit);
  }
  return lockExit;
};
