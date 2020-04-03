
function stringify(objectOrString) {
    if (typeof objectOrString === 'object'){
        return  JSON.stringify(objectOrString);
    } else {
        return `${objectOrString}`;
    }
}

function omitString(str, length, prefix, suffix) {
    if (!str) return "";
    let len = str.length;

    if (!length) length = 1024;
    if (!prefix) prefix = "";
    if (!suffix) suffix = `...remaining ${len} characters'`;
    if (len > length) {
        return `${prefix}${str.slice(0, length)}${suffix}`
    }
    return str;
}

function queryStringToObject(queryString, alsoStatement=false) {
    if (!queryString){
        if (alsoStatement){
            return {
                query: {},
                statement: "",
            }
        } else return {};
    }

    let query = {};
    let statement = "";
    let len = queryString.length;
    let i = queryString.indexOf('#');
    if (i !== -1){
        if (alsoStatement && i !== len - 1){
            statement = queryString.slice(i+1);
        }
        queryString = queryString.slice(0, i);
    }
    queryString.split('&').forEach((value, index) => {
        let i = value.indexOf('=');
        if (i !== -1 && i !== value.length - 1){
            query[value.slice(0, i)] = value.slice(i+1);
        }
    });

    if (alsoStatement){
        return {
            query: query,
            statement: statement,
        }
    } else return query;
}

// translate (\y\M\d \h\m\s \S \ \\) to (yMd hms S  \)
function unBackslash(str, backslash='\\') {
    if (!str) return "";
    let newStr = [];
    let strLength = str.length;
    for (let i=0; i<strLength; i++){
        if (str[i] === '\\'){
            if (i === strLength -1) {
                console.warn('Found unmatched backslash in the end of your string');
                newStr.push(str[i]);
                break;
            }
            else {
                newStr.push(str[++i]);
                continue;
            }
        }
        newStr.push(str[i]);
    }
    return newStr.join('');
}

///--- Exports

module.exports = {
    stringify,
    omitString,
    queryStringToObject,
    unBackslash,
};
