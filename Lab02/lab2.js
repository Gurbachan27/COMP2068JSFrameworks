// lab2.js
const prompt = require('prompt');

prompt.start();

prompt.get(['userSelection'], function(err, result) {
    const userSelection = result.userSelection.toUpperCase();

    const random = Math.random();
    let computerSelection = '';

    if (random <= 0.34) {
        computerSelection = 'PAPER';
    } else if (random <= 0.67) {
        computerSelection = 'SCISSORS';
    } else {
        computerSelection = 'ROCK';
    }

    console.log('User selected:', userSelection);
    console.log('Computer selected:', computerSelection);

    if (userSelection === computerSelection) {
        console.log("It's a tie!");
    } else if (
        (userSelection === 'ROCK' && computerSelection === 'SCISSORS') ||
        (userSelection === 'PAPER' && computerSelection === 'ROCK') ||
        (userSelection === 'SCISSORS' && computerSelection === 'PAPER')
    ) {
        console.log('User Wins!');
    } else {
        console.log('Computer Wins!');
    }
});