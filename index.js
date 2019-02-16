let exitTimeout = 1000; // Setable by user
let exitPanicLimit = 5; // Setable by user

let numLocks = 0;
let exitCB;
let exitCalled = false;
let exitCallCount = 0;


function exitTimeoutReached() {
  console.error('Exit timeout reached. Forcing exit.');
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
      process.exit(11);
    } else {
      console.log('Panic count ', exitCallCount, ' of ', exitPanicLimit);
    }
    return;
  }

  // First exit call
  console.log('Attempting graceful shutdown.');
  if (exitTimeout > 0) setTimeout(exitTimeoutReached, exitTimeout);
  exitCalled = true;
  exitCallCount += 1;
  if (numLocks > 0) {
    console.log('Waiting on critcal sections...');
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
      numLocks -= 1;
      if (numLocks === 0 && exitCalled) finishExit();
    }
  }
}

process.on('SIGTERM', sigHandle);

process.on('SIGINT', sigHandle);

module.exports.setExitTimeout = function setExitTimeout(timeMS) {
  exitTimeout = timeMS;
};

module.exports.setPanicLimit = function setExitPanicLimit(count) {
  exitPanicLimit = count;
};

module.exports.setExitCallback = function setExitCallback(cb) {
  exitCB = cb;
};

module.exports.enter = function enter(cb) {
  const exitHandler = new EXIT();
  const lockExit = () => {
    exitHandler.exit();
  };

  if (exitCalled) {
    if (typeof cb === 'function') {
      return cb(new Error('process is attempting to exit'));
    }
    throw new Error('process is attempting to exit');
  }

  numLocks += 1;

  if (typeof cb === 'function') {
    return cb(null, lockExit);
  }
  return lockExit;
};
