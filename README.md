# graceful-critical

A Nodejs package to handle graceful SIGTERM and SIGINT around critical sections code.
The package is designed to define critical sections by entering and exiting sections of code.

When a critical section is entered a unique exit function is returned.
If the process recieves a SIGINT or SIGTERM, the package will wait for all critical sections to exit before calling a final exit callback.
During shutdown, enter function calls will error, handled correctly this error can be used to prevent starting critical sections during shutdown.

## Setup

```javascript
const critical = require('graceful-critical');
```

## Config

```javascript
// Set the timeout milliseonds before process exit is forced.
critical.setExitTimeout(1000); // default 1000 // 0 for no timeout

// Set the number of panic count limit for consecutive ctrl-c calls before exit is forced.
critical.setPanicLimit(5); // default 5

critical.setExitCallback((processExit) => {
  // this will be called after all cirtical sections have exited.
  // it is not nesscary to set this Callback
  processExit(); // calling processExit will finish exiting the process.
})
```

## Usage

```javascript
async function () {
  let exit;
  try {
    exit = critical.enter();

    /////////////////////
    //CRITCAL SECTION////
    /////////////////////

    exit();
  } catch (err) {
    if (err) // if critical.enter() throws an error the process is shuting down
    if (typeof exit === 'function') exit(); // remeber to always exit even if you critcal section throws an error.
  }
}
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

## Exit Timeout

A timeout prevents the application from hanging due to imporper code or zombie critcal sections.
This timeout will exit the process exit code 11.
By default this timer is set to 1 second1 (1000).
Setting the timer to 0 will diable the timer functionality.
This timeout should be configured to properly accomidate for slow critical sections espcially when critical sections could be blocked by long external resouce calls.

## Exit Painc

Another escape metheod is to use repeated SIGTERM/SIGTERM signals.
This can be acomplished from the command line by repeating ctrl-c.
The number of signals required to force an exit is configurable and by default set to 5.

Note: Process and container managers will send different signals when a process fails to exit promptly. 
The timing of which is usually configurable in these managers.

## Exit Callback

Want to do one last thing before your process exits?
setExitCallback allows a user defined function to be called before exiting.

## TODO

[] Exit and panic timeout before exit callabacks.
[] Document various behaviours of process and container managers.
[] Confirm signal selection

## Contributing

Pull requests are welcome.
