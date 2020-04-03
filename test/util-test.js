const {describe, it} = require("mocha");
const {randi} = require('../lib/util/random');
const {rands} = require('../lib/util/randre');

const {unBackslash} = require('../lib/util/strings');

describe('@util', function () {
    describe('#random.js', function () {
        describe('#randi()', function () {
            it('random integer', function () {
                for (let i = 0; i < 16; i++) {
                    console.log(randi(Number.MAX_SAFE_INTEGER));
                }
            });
        });
    });

    describe('strings.js', function () {
        it('#unBackslash', function () {
            let str = '\\y\\M\\d \\h\\m\\s \\S \\ \\\\\\';
            console.log('str is (%s)', str);
            console.log('newStr is (%s)', unBackslash(str));
        });
    });

    describe('date-format.js', function () {
        it('#format', function () {
            require('../lib/util/date-format');
            console.log(new Date().format('yyyy-MM-dd hh:mm:ss SSS'));
        });
    });

    describe('randre.js', function () {
        it('#rands', function () {
            for (let i = 0; i < 50; i++) {
                console.log('[4\t', rands('--[a-cx-yJ-L1-38-9]{6,18}++'));
            }
            for (let i = 0; i < 50; i++) {
                console.log('[5\t', rands('{4,8}[0-9]{2,3}'));
            }
            console.log('[1]\t', rands('yyyy-MM-dd hh:mm:ss SSS'));
            for (let i = 0; i < 10; i++) {
                console.log('[2]\t', rands('yyyy-MM-dd|hh:mm:ss SSS'));
            }
            for (let i = 0; i < 10; i++) {
                console.log('[3]\t', rands('[yyyy-MM-dd]{2} [hh:mm:ss SSS]{2,4}'));
            }
            console.log('[4]\t(%s)', rands(''));
        });

        it('#rands format', function () {
            [
                "[0-9]{4}-[0-9]{2}-[0-9]{2}",
                "{6,36}",
            ].forEach((p, i) => {
                for (let i = 0; i < 10; i++) {
                    console.log(`[${i}]\t(${rands(p)})`);
                }
            });
        });

    });
});

