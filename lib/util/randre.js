'use strict';

const {randi, randi2, choose, choose72, LOWER_CASE_LETTERS, UPPER_CASE_LETTERS, NUMBERS} = require('./random');

/**
 * generate a random string based on regexp
 * @param pattern string,
 * [a-cD-Z0-37-9]{2,64}
 */
const letterRanges = [
    LOWER_CASE_LETTERS,
    UPPER_CASE_LETTERS,
    NUMBERS,
];

const a = /^\[(.+?)]{([0-9]+)(,([0-9]+))}$/;

function rands(pattern){
    if (/^(.+?)\|(.+?)$/.test(pattern)) {
        let left = RegExp.$1;
        let right = RegExp.$2;
        // 0 or 1
        if (randi2(0, 2) === 0){
            return rands(left);
        } else {
            return rands(right);
        }
    }

    if (/^(.*?)\[(.+?)]{([0-9]+)(,[0-9]+)?}(.*?)$/.test(pattern)){
        let prefix = RegExp.$1;
        let match = RegExp.$2;
        let r1 = RegExp.$3;
        let r2 = RegExp.$4;
        let suffix = RegExp.$5;

        // deal with match
        let charset = [];
        let len = match.length;
        move: for (let i=0; i<len; i++){

            if (i < len -2 && match[i+1] === '-'){
                let start = match[i];
                let end = match[i + 2];

                let lrl = letterRanges.length;
                for (let k=0; k<lrl; k++){
                    let range = letterRanges[k];
                    let ind1 = range.indexOf(start);
                    if (ind1 !== -1){
                        let ind2 = range.indexOf(end);
                        if (ind2 !== -1){
                            charset.push(range.slice(ind1, ind2 + 1));
                            // done with 'i, i+1, i+2', so I will move to i+3
                            i = i+2;
                            continue move;


                        }
                    }
                }
                charset.push(start, "-");
                i = i+2;
                continue;
            }
            charset.push(match[i]);
        }

        let size = Number(r1);
        if (r2){
            r2 = Number(r2.slice(1));
            size = randi2(size, r2+1);
        }
        return rands(prefix) + choose(size, charset.join('')) + rands(suffix);
    }

    if (/^(.*?){([0-9]+)(,[0-9]+)?}(.*?)$/.test(pattern)){
        let prefix = RegExp.$1;
        let r1 = RegExp.$2;
        let r2 = RegExp.$3;
        let suffix = RegExp.$4;
        let size = Number(r1);
        if (r2){
            r2 = Number(r2.slice(1));
            size = randi2(size, r2+1);
        }
        return rands(prefix) + choose72(size) + rands(suffix);
    }

    return pattern;
}

module.exports = {
    rands,
};
