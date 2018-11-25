import _Error from 'isotropic-error';
import _later from 'isotropic-later';

export default (milliseconds, callbackFunctionOrPromise, lateCallbackFunction) => {
    if (typeof callbackFunctionOrPromise === 'function') {
        const handle = _later(milliseconds, () => {
            callbackFunctionOrPromise(_Error({
                details: {
                    milliseconds
                },
                message: `Timeout after ${milliseconds} milliseconds`,
                name: 'TimeoutError'
            }));
        });

        return function (...args) {
            if (!handle.completed) {
                handle.cancel();
                return Reflect.apply(callbackFunctionOrPromise, this, args);
            }

            if (lateCallbackFunction) {
                return Reflect.apply(lateCallbackFunction, this, args);
            }
        };
    }

    return new Promise((resolve, reject) => {
        const handle = _later(milliseconds, () => {
            reject(_Error({
                details: {
                    milliseconds
                },
                message: `Timeout after ${milliseconds} milliseconds`,
                name: 'TimeoutError'
            }));
        });

        callbackFunctionOrPromise.then(value => {
            if (!handle.completed) {
                handle.cancel();
                resolve(value);
            } else if (lateCallbackFunction) {
                lateCallbackFunction(null, value);
            }
        }, error => {
            if (!handle.completed) {
                handle.cancel();
                reject(error);
            } else if (lateCallbackFunction) {
                lateCallbackFunction(error);
            }
        });
    });
};
