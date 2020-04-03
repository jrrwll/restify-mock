const assert = require('assert');
const {describe, it} = require("mocha");

describe('Object', function () {
    describe('#keys()', function () {
        it('foreach keys of a object', function () {
            let obj1 = {
                a: 1, b: 2, c: "", d: [],
                e: {f: Date(), g: console},
                h: () => {
                    console.dir(process)
                }
            };
            Object.keys(obj1).forEach((key, index) => {
                console.log(`${index} ${key}`);
            });
        });
    });
});

describe('Array', function () {
    describe('#indexOf()', function () {
        it('should return -1 when the value is not present', function () {
            assert.equal([1, 2, 3].indexOf(4), -1);
        });
    });

    describe('#keys()', function () {
        it('set', function () {
            let array1 = [4, 5, 5, 6, 1, 2, 3, 1, 3, 8];
            let array2 = [1, 2, 3, 4, 5, 6];
            console.log(array1);
            console.log(array2);
            console.log(array1.values());
            console.log(array1.entries());
            console.log(array1.keys());
            for (let index in array1) {
                console.log(index, array1[index], array2.indexOf(array1[index]));
            }
        });
    });
});


