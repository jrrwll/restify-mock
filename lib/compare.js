'use strict';

let {shallowCompare} = require('./util/objects');

function valueTypeCompare(v1, v2, key) {
    let type1 = typeof v1;
    if (!type1 in ['string', 'number', 'boolean']) {
        throw new Error(`Field ${key} in ${path} has invalid type ${type1}, only support string/number/boolean`);
    }

    v2 = `${v2}`;
    if (type1 === 'number') {
        return !Number.isNaN(Number(v2));
    } else if (type1 === 'boolean') {
        return ['0', '1','false', 'true'].indexOf(v2.toLowerCase()) !== -1;
    } else {
        let index = v1.indexOf(';');
        if (index === -1 || v1.length === 0) {
            return true;
        } else {
            if (/[0-9]/.test(v1[0])) {
                return !Number.isNaN(Number(v2));
            } else {
                return true;
            }
        }
    }
}

function compare(obj, reqObj, typename) {
    if (obj && !reqObj) {
        reqObj = {}
    }
    let message;
    let {matched, otherObjectMissKeys, otherObjectUnequalKeys} =
        shallowCompare(obj, reqObj, valueTypeCompare);
    if (!matched) {
        if (otherObjectMissKeys.length > 0) {
            message = `Please offer the miss ${typename} ${otherObjectMissKeys}`;
            if (otherObjectUnequalKeys.length > 0) {
                message = `${message} and modify the incompatible type ${typename} ${otherObjectUnequalKeys}`;
            }
        } else {
            message = `Please modify the incompatible type ${typename} ${otherObjectUnequalKeys}`;
        }
    }

    return {
        matched: matched,
        message: message,
    }
}

module.exports = {
    compare: compare,
};
