const { spawn } = require('child_process');

describe('Test Scenarios', () => {
  describe('shutdown during critical section', () => {
    it('SIGINT should wait for critcal section, exit code 0', (done) => {
      const p = spawn('node', ['./test/scenarios/wait-for-critical.js'], {
        stdio: 'pipe',
      });
      let pass = false;
      p.stdout.on('data', (data) => {
        if (data.includes('entered critical')) {
          p.kill('SIGINT');
        }

        if (data.includes('exited critical')) {
          pass = true;
        }
      });

      p.on('exit', (code) => {
        if (code === 0 && pass) {
          done();
        } else {
          throw new Error(`test failed ${code} ${pass}`);
        }
      });
    });
    it('SIGTERM should wait for critical section, exit code 0', (done) => {
      const p = spawn('node', ['./test/scenarios/wait-for-critical.js'], {
        stdio: 'pipe',
      });
      let pass = false;
      p.stdout.on('data', (data) => {
        if (data.includes('entered critical')) {
          p.kill('SIGTERM');
        }

        if (data.includes('exited critical')) {
          pass = true;
        }
      });

      p.on('exit', (code) => {
        if (code === 0 && pass) {
          done();
        } else {
          throw new Error(`test failed ${code} ${pass}`);
        }
      });
    });
    it('SIGKILL should terminate immediate (contrast to above test), exit code null', (done) => {
      const p = spawn('node', ['./test/scenarios/wait-for-critical.js'], {
        stdio: 'pipe',
      });
      let failed = false;
      p.stdout.on('data', (data) => {
        if (data.includes('entered critical')) {
          p.kill('SIGKILL');
        }

        if (data.includes('exited critical')) {
          failed = true;
        }
      });

      p.on('exit', (code) => {
        if (code === null && !failed) {
          done();
        } else {
          throw new Error(`test failed ${code} ${failed}`);
        }
      });
    });
  });

  describe('attempt to enter critical during shutdown', () => {
    it('should throw and error in the critical section exit code 0', (done) => {
      const p = spawn('node', ['./test/scenarios/attempt-shutdown-enter.js'], {
        stdio: 'pipe',
      });
      let pass = false;
      p.stdout.on('data', (data) => {
        if (data.includes('entered critical')) {
          p.kill('SIGINT');
        }

        if (data.includes('error thrown')) {
          pass = true;
        }
      });

      p.on('exit', (code) => {
        if (code === 0 && pass) {
          done();
        } else {
          throw new Error(`test failed ${code} ${pass}`);
        }
      });
    });
  });

  describe('multiple signals panic', () => {
    it('should force exit before critical section finishes exit code 11', (done) => {
      const p = spawn('node', ['./test/scenarios/wait-for-critical.js'], {
        stdio: 'pipe',
      });
      let failed = false;
      p.stdout.on('data', (data) => {
        if (data.includes('entered critical')) {
          p.kill('SIGTERM');
        }

        if (data.includes('Panic') || data.includes('Waiting')) {
          p.kill('SIGTERM'); // process dose not appear to be consume kill signals fast enough. a failure of this test may be speed related.
        }

        if (data.includes('exited critical')) {
          failed = true;
        }
      });

      p.on('exit', (code) => {
        if (code === 11 && !failed) {
          done();
        } else {
          throw new Error(`test failed ${code} ${failed}`);
        }
      });
    });
  });

  describe('critical section timeout', () => {
    it('should force exit when timeout expires exit code 10', (done) => {
      const p = spawn('node', ['./test/scenarios/timeout-expiry.js'], {
        stdio: 'pipe',
      });
      let failed = false;
      p.stdout.on('data', (data) => {
        if (data.includes('entered critical')) {
          p.kill('SIGTERM');
        }

        if (data.includes('exited critical')) {
          failed = true;
        }
      });

      p.on('exit', (code) => {
        if (code === 10 && !failed) {
          done();
        } else {
          throw new Error(`test failed ${code} ${failed}`);
        }
      });
    });
  });
});
