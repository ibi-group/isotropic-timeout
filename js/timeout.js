import Error from 'isotropic-error';

import later from 'isotropic-later';

export default (milliseconds, callbackFunction, lateCallbackFunction) => {
    const handle = later(milliseconds, () => {
        callbackFunction(Error({
            details: milliseconds,
            message: `Timeout after ${milliseconds} milliseconds`,
            name: 'TimeoutError'
        }));
    });

    return function (...args) {
        if (!handle.completed) {
            handle.cancel();
            return Reflect.apply(callbackFunction, this, args);
        }

        if (lateCallbackFunction) {
            return Reflect.apply(lateCallbackFunction, this, args);
        }
    };
};
