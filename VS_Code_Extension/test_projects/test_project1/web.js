const { exec } = require('child_process');

function runCommand(input) {
    exec("ls " + input, (err, stdout) => {
        console.log(stdout);
    });
}