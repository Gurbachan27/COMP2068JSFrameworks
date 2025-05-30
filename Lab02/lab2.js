// lab2.js

const prompt = require('prompt');

prompt.start();

prompt.get(['userSelection'], function(err, result) {
    console.log('User selected:', result.userSelection);
});