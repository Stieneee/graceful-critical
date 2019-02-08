# graceful-critical
A Nodejs package to handle graceful SIGTERM and SIGINT around critical sections code.
The package is designed to define critical sections by entering and exiting sections of code.

When a critical section is entered a unique exit function is returned.
If the process recieves a SIGINT or SIGTERM, the package will wait for all critical sections to exit before calling a final exit callback.
During shutdown enter function calls will error, handled correctly this can be used to prevent starting critical sections during shutdown.

## Setup

```javascript
const critical = require('graceful-critical');
```

## Config

```javascript
// Set the timeout milliseonds before process exit is forced.
critical.setExitTimeout(1000); // default 5

// Set the number of panic count limit for consecutive ctrl-c calls before exit is forced.
critical.setPanicLimit(5); // default 5

critical.setExitCallback((processExit) => {
  // this will be called after all cirtical sections have exited.
  // it is not nesscary to set this Callback
  processExit(); // calling processExit will finish exiting the process.
})
```

## Usage - Callback

```javascript
critical.enter((err, exit) => {
  if (err) // process is attempting to exit do not enter you critical section

  /////////////////////
  //CRITCAL SECTION////
  /////////////////////

  exit(); // pass this down your callback chain.
};
```

## Usage - Promise

```javascript
async function () {
  let exit;
  try {
    exit = await critical.enter();

    /////////////////////
    //CRITCAL SECTION////
    /////////////////////

    exit();
  } catch (err) {
    if (err) // if critical.enter() throws an error the process is shuting down
    if (typeof exit === 'function') exit(); // remeber to always exit even if you critcal section throws and error.
  }
}
```

## Contributing
Pull requests are welcome.
