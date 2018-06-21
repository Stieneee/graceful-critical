# graceful-critical
Nodejs package to handle graceful SIGTERM and SIGINT around critical sections code.
The package is designed to define critical sections which will be entered and exited.
Multiple critical sections can be tracked with each having their own exit function call.

## Setup

```javascript
const critcal = require('graceful-critical');
```

## Config

```javascript
// Set the timeout milliseonds before process exit is forced.
crtical.setExitTimeout(1000);

// Set the number of panic count limit for consecutive ctrl-c calls before exit is forced/
crtical.setPanicLimit(5);

critcal.setExitCallback((processExit) => {
  // this will be called after all cirtical sections have exited.
  // it is not nesscary to set this Callback
  processExit(); // calling processExit will finish exiting the process.
})
```

## Usage - Callback

```javascript
crtical.enter((err, exit) => {
  if (err) // process is attempting to exit do not enter you critical section

  /////////////////////
  //CRITCAL SECTION////
  /////////////////////

  exit(); // pass this down your call back dolphin if you have one...
})
```

## Usage - Promise

```javascript
async function () {
  let exit
  try {
    exit = await crtical.enter();

    /////////////////////
    //CRITCAL SECTION////
    /////////////////////

  } catch (err) {
    if (err) // if crtical.enter() throws an error the process is shuting down
    if (typeof exit === 'function') exit(); // remeber to always exit even if you critcal section throws and error.
  }
}
```
