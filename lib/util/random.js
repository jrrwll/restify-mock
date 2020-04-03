'use strict';

const UPPER_CASE_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER_CASE_LETTERS = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const NUMBERS_HEX = "0123456789abcdef";

// return [start, end -1]
function randi2(start, end) {
    return Math.floor(Math.random() * (end - start)) + start;
}

// return [0, n -1]
function randi(n) {
    return Math.floor(Math.random() * n);
}

function choose10(size) {
    return choose(size, NUMBERS)
}

function choose26(size) {
    return choose(size, LOWER_CASE_LETTERS)
}

function choose36(size) {
    return choose(size, 'abcdefghijklmnopqrstuvwxyz0123456789')
}

function choose52(size) {
    return choose(size, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
}

function choose62(size) {
    return choose(size, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')
}

function choose72(size) {
    return choose(size, 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')
}

function choose(size, letters) {
    let chars = [];
    for (let i=0; i<size; i++){
        let length = letters.length;
        let index = Math.floor(Math.random() * length);
        index %= length;
        chars.push(letters[index]);
    }
    return chars.join('');
}

///--- Exports

module.exports = {
    randi: randi,
    randi2: randi2,
    choose: choose,
    choose10: choose10,
    choose26: choose26,
    choose36: choose36,
    choose52: choose52,
    choose62: choose62,
    choose72: choose72,
    LOWER_CASE_LETTERS,
    UPPER_CASE_LETTERS,
    NUMBERS,
    NUMBERS_HEX
};
