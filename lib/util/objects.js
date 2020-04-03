'use strict';

const {randi, randi2, choose36} = require("./random");
const {rands} = require("./randre");

function shallowClone(obj) {
    switch (typeof obj) {
        case "undefined":
        case "function":
        case "symbol":
        case "boolean":
        case "number":
        case "bigint":
        case "string":
            return obj;
        case "object":
            if (obj instanceof Array) {
                let length = obj.length;
                if (length === 0) {
                    return [];
                }
                let newObj = [];
                for (let i = 0; i < length; i++) {
                    newObj.push(shallowClone(obj[i]));
                }
                return newObj;
            }

            let newObj = {};
            Object.keys(obj).forEach((key) => {
                newObj[key] = obj[key];
            });
            return newObj;
    }
}

function deepClone(obj) {
    switch (typeof obj) {
        case "undefined":
        case "function":
        case "symbol":
        case "boolean":
        case "number":
        case "bigint":
        case "string":
            return obj;
        case "object":
            if (obj instanceof Array) {
                let length = obj.length;
                if (length === 0) {
                    return [];
                }
                let newObj = [];
                for (let i = 0; i < length; i++) {
                    newObj.push(deepClone(obj[i]));
                }
                return newObj;
            }

            let newObj = {};
            Object.keys(obj).forEach((key) => {
                newObj[key] = deepClone(obj[key]);
            });
            return newObj;
        default:
            throw Error("A unexpected error occurred, typeof didn't go through all the possible values: " + typeof obj);
    }
}

function randomClone(obj) {
    switch (typeof obj) {
        case "undefined":
            return undefined;
        case "function":
        case "symbol":
            return obj;
        case "boolean":
            return randi(2) === 1;
        case "number":
            return randi(Number.MAX_SAFE_INTEGER);
        case "bigint":
            return BigInt(randi(Number.MAX_SAFE_INTEGER));
        case "string":
            return rands(obj);
        case "object":
            if (obj instanceof Array) {
                let length = obj.length;
                if (length === 0) {
                    return [];
                }
                let newObj = [];
                for (let i = 0; i < length; i++) {
                    newObj.push(randomClone(obj[i]));
                }
                return newObj;
            }

            let newObj = {};
            Object.keys(obj).forEach((key) => {
                newObj[key] = randomClone(obj[key]);
            });
            return newObj;
    }
}

function shallowCompare(thisObj, otherObj, valueCompare = (v1, v2, key) => v1 === v2) {
    if (typeof thisObj !== 'object' || typeof otherObj !== "object") {
        throw new Error(`Only accept object, got (${typeof thisObj}, ${typeof otherObj})`);
    }
    let keys = Object.keys(thisObj);
    let otherObjectMissKeys = [];
    let otherObjectUnequalKeys = [];
    keys.forEach((key) => {
        if (!otherObj.hasOwnProperty(key)) {
            otherObjectMissKeys.push(key);
            return;
        }
        let thisValue = thisObj[key];
        let otherValue = otherObj[key];
        if (!valueCompare(thisValue, otherValue, key)) {
            otherObjectUnequalKeys.push(key);
        }
    });

    let matched = otherObjectMissKeys.length === 0 && otherObjectUnequalKeys.length === 0;
    return {
        matched: matched,
        otherObjectMissKeys: otherObjectMissKeys,
        otherObjectUnequalKeys: otherObjectUnequalKeys,
    };
}

function deepCompare(obj1, obj2, valueCompare = (v1, v2) => v1 === v2) {
    if (typeof obj1 !== typeof obj2) return false;
    switch (typeof obj1) {
        case "undefined":
        case "function":
        case "symbol":
        case "boolean":
        case "number":
        case "bigint":
        case "string":
            return valueCompare(obj1, obj2);
        case "object":
            if (obj1 instanceof Array) {
                if (!obj2 instanceof Array) return false;

                let thisLength = obj1.length;
                let otherLength = obj2.length;
                if (thisLength !== otherLength) return false;
                if (thisLength === 0) return true;

                for (let i = 0; i < thisLength; i++) {
                    let equal = deepCompare(obj1[i], obj2[i], valueCompare);
                    if (!equal) return false;
                }
                return true;
            } else if (obj2 instanceof Array) return false;

            let keys1 = Object.keys(obj1);
            let keys2 = Object.keys(obj2);
            // obj1 <= obj2
            for (let index in keys1){
                let key = keys1[index];
                if (keys2.indexOf(key) === -1) return false;
                let equal = valueCompare(obj1[key], obj2[key]);
                if (!equal) return false;
            }
            // obj1 >= obj2
            for (let index in keys2){
                let key = keys2[index];
                if (keys1.indexOf(key) === -1) return false;
            }
            return true;
    }
}

function testAll(test) {
    let length = arguments.length;
    if (length < 3) return true;
    let flag = test(arguments[1]);
    for (let i=2; i<length; i++){
        if (test(arguments[i]) === false){
            return false;
        }
    }
    return true;
}

function isEmptyOrFalse(obj) {
    switch (typeof obj) {
        case "undefined":
            return true;
        case "function":
        case "symbol":
            return false;
        case "boolean":
            return !obj;
        case "number":
            return  obj === 0;
        case "bigint":
            return  obj === 0n;
        case "string":
            return obj.length === 0;
        case "object":
            if (obj instanceof Array) {
                return obj.length === 0;
            }
            return Object.keys(obj).length === 0;
    }
}

function pruneEmpty(obj) {
    const current = deepClone(obj);
    Object.keys(current).forEach((key, index) => {
        const value = current[key];
        if (value === undefined || value === null || Number.isNaN(value)) {
            delete current[key];
        }
        if (typeof value === 'string' && value.length === 0) {
            delete current[key];
        }
        if (typeof value === 'object') {
            if (Object.keys(pruneEmpty(value)).length === 0) {
                delete current[key];
            }
            if(value instanceof Array){
                current[key] = value.filter(it => it !== undefined);
            }
        }
    });
}

///--- Exports

module.exports = {
    shallowClone,
    deepClone,
    randomClone,
    shallowCompare,
    deepCompare,
    isEmptyOrFalse,
    testAll,
    pruneEmpty,
};
