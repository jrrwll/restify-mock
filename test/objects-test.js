const {describe, it} = require("mocha");
const {randomClone} = require('../lib/util/objects');

describe('objetcs.js', function() {
    const desc = (obj) => {
        console.log("====================== first ======================");
        console.dir(obj);
        console.log("====================== middle ======================");
        let newObj = randomClone(obj);
        console.dir(newObj);
        console.log("====================== last ======================");
    };
    describe('#deepRandomClone()', function() {
        it('deep random clone', function() {
            [true, 1, "bite me", 65537n, ()=> {}, undefined, {
                a: 1.1,
                b: "awesome",
                c: [0.1, 12, [{data: []}]],
            },[
                {},
                [],
                {d: {}, e: []},
                [[[[[[[]]]]]]],
            ]].forEach(desc);
        });

        it('deep random clone on object', function() {
            let obj = {
                a: 1.1,
                b: "awesome",
                c: [0.1, 12, [{data: []}]],
            };
            let newObj = randomClone(obj);
            console.dir(newObj);
            console.dir(newObj.c);
            console.dir(newObj.c[2]);
            console.dir(newObj.c[2][0])
        });

        it('deep random clone on array', function() {
            let obj = [
                {},
                [],
                {d: {}, e: []},
                [1, ['', [true, [1n, []]]]]
            ];
            let newObj = randomClone(obj);
            console.dir(newObj);
            console.dir(newObj[0]);
            console.dir(newObj[1]);
            console.dir(newObj[2]);
            console.dir(newObj[2].d);
            console.dir(newObj[2].e);
            console.dir(newObj[3]);
            console.dir(newObj[3][1]);
            console.dir(newObj[3][1][1]);
            console.dir(newObj[3][1][1][1]);
        });
    });
});


