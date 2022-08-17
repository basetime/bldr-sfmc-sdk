
const capitalizeFirstLetter = (string: string) =>{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const capitalizeKeys = (obj: any) => {
    let objectOut = obj;

    var key, upKey;
    for (key in objectOut) {
        if (Object.prototype.hasOwnProperty.call(objectOut, key)) {
            upKey = capitalizeFirstLetter(key);
            if (upKey !== key) {
                objectOut[upKey] = objectOut[key];
                delete objectOut[key];
            }
            // recurse
            if (typeof objectOut[upKey] === 'object') {
                capitalizeKeys(objectOut[upKey]);
            }
        }
    }

    return objectOut;
};

export {
    capitalizeKeys
}
