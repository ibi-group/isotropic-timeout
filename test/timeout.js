import _chai from 'isotropic-dev-dependencies/lib/chai.js';
import _Error from 'isotropic-error';
import _later from 'isotropic-later';
import _mocha from 'isotropic-dev-dependencies/lib/mocha.js';
import _timeout from '../js/timeout.js';

_mocha.describe('timeout', () => {
    _mocha.it('should be a function', () => {
        _chai.expect(_timeout).to.be.a('function');
    });
});

_mocha.describe('timeout when given a callback function', function () {
    this.timeout(144);

    _mocha.it('should return a callback function with a limited time to be called', callbackFunction => {
        let called = 0;

        const limitedTimeCallbackFunction = _timeout(34, () => {
            called += 1;
        });

        _chai.expect(limitedTimeCallbackFunction).to.be.a('function');

        _later(21, () => {
            _chai.expect(called).to.equal(0);
        });

        _later(55, () => {
            _chai.expect(called).to.equal(1);
            limitedTimeCallbackFunction();
            _chai.expect(called).to.equal(1);
            callbackFunction();
        });
    });

    _mocha.it('should pass an error if the callback is not called in time', callbackFunction => {
        _timeout(55, error => {
            _chai.expect(error).to.be.an.instanceOf(_Error);
            _chai.expect(error).to.have.property('details').that.is.an('object').that.has.property('milliseconds', 55);
            _chai.expect(error).to.have.property('message', 'Timeout after 55 milliseconds');
            _chai.expect(error).to.have.property('name', 'TimeoutError');
            callbackFunction();
        });
    });

    _mocha.it('should allow the callbackFunction to be called within time with context and arguments', callbackFunction => {
        let called = 0;

        const contextObject = {},
            limitedTimeCallbackFunction = _timeout(55, function (...args) {
                called += 1;

                _chai.expect(args).to.deep.equal([
                    'a',
                    'b',
                    'c'
                ]);
                _chai.expect(this).to.equal(contextObject);
            });

        _later(34, () => {
            Reflect.apply(limitedTimeCallbackFunction, contextObject, [
                'a',
                'b',
                'c'
            ]);
        });

        _later(89, () => {
            _chai.expect(called).to.equal(1);
            callbackFunction();
        });
    });

    _mocha.it('should call the lateCallbackFunction when called after the timeout', callbackFunction => {
        let called = 0,
            lateCalled = 0;

        const contextObject = {},
            timeLimitedCallbackFunction = _timeout(34, error => {
                called += 1;
                _chai.expect(error).to.be.an.instanceOf(_Error);
                _chai.expect(error).to.have.property('details').that.is.an('object').that.has.property('milliseconds', 34);
                _chai.expect(error).to.have.property('message', 'Timeout after 34 milliseconds');
                _chai.expect(error).to.have.property('name', 'TimeoutError');
            }, function (...args) {
                lateCalled += 1;

                _chai.expect(args).to.deep.equal([
                    'a',
                    'b',
                    'c'
                ]);
                _chai.expect(this).to.equal(contextObject);
            });

        _later(21, () => {
            _chai.expect(called).to.equal(0);
            _chai.expect(lateCalled).to.equal(0);
        });

        _later(55, () => {
            _chai.expect(called).to.equal(1);
            _chai.expect(lateCalled).to.equal(0);
            Reflect.apply(timeLimitedCallbackFunction, contextObject, [
                'a',
                'b',
                'c'
            ]);
            _chai.expect(lateCalled).to.equal(1);
            callbackFunction();
        });
    });
});

_mocha.describe('timeout when given a promise', function () {
    this.timeout(144);

    _mocha.it('should return a promise with a limited time to be resolved', callbackFunction => {
        let called = 0;

        const limitedTimePromise = _timeout(34, new Promise(resolve => {
            _later(55, () => {
                _chai.expect(called).to.equal(1);
                resolve();
                _chai.expect(called).to.equal(1);
                callbackFunction();
            });
        }))
            .then(() => {
                called += 1;
            }, () => {
                called += 1;
            });

        _chai.expect(limitedTimePromise).to.be.a('promise');

        _later(21, () => {
            _chai.expect(called).to.equal(0);
        });
    });

    _mocha.it('should return a promise with a limited time to be rejected', callbackFunction => {
        let called = 0;

        const limitedTimePromise = _timeout(34, new Promise((resolve, reject) => {
            _later(55, () => {
                _chai.expect(called).to.equal(1);
                reject(new _Error());
                _chai.expect(called).to.equal(1);
                callbackFunction();
            });
        }))
            .then(() => {
                called += 1;
            }, () => {
                called += 1;
            });

        _chai.expect(limitedTimePromise).to.be.a('promise');

        _later(21, () => {
            _chai.expect(called).to.equal(0);
        });
    });

    _mocha.it('should reject if the promise is not resolved in time', callbackFunction => {
        _timeout(55, new Promise(() => {
            // Do nothing
        }))
            .catch(error => {
                _chai.expect(error).to.be.an.instanceOf(_Error);
                _chai.expect(error).to.have.property('details').that.is.an('object').that.has.property('milliseconds', 55);
                _chai.expect(error).to.have.property('message', 'Timeout after 55 milliseconds');
                _chai.expect(error).to.have.property('name', 'TimeoutError');
                callbackFunction();
            });
    });

    _mocha.it('should allow the promise to resolve to a value within time', callbackFunction => {
        let called = 0,
            resolvedValue;

        const valueObject = {},

            limitedTimePromise = _timeout(55, new Promise(resolve => {
                _later(34, () => {
                    resolve(valueObject);
                });
            }))
                .then(value => {
                    called += 1;
                    resolvedValue = value;
                }, () => {
                    called += 1;
                });

        _chai.expect(limitedTimePromise).to.be.a('promise');

        _later(21, () => {
            _chai.expect(called).to.equal(0);
        });

        _later(89, () => {
            _chai.expect(called).to.equal(1);
            _chai.expect(resolvedValue).to.equal(valueObject);
            callbackFunction();
        });
    });

    _mocha.it('should allow the promise to reject within time', callbackFunction => {
        let called = 0,
            rejectedError;

        const errorObject = new _Error(),
            limitedTimePromise = _timeout(55, new Promise((resolve, reject) => {
                _later(34, () => {
                    reject(errorObject);
                });
            }))
                .then(() => {
                    called += 1;
                }, error => {
                    called += 1;
                    rejectedError = error;
                });

        _chai.expect(limitedTimePromise).to.be.a('promise');

        _later(21, () => {
            _chai.expect(called).to.equal(0);
        });

        _later(89, () => {
            _chai.expect(called).to.equal(1);
            _chai.expect(rejectedError).to.equal(errorObject);
            callbackFunction();
        });
    });

    _mocha.it('should call the lateCallbackFunction when resolved after the timeout', callbackFunction => {
        let called = 0,
            lateCalled = 0,
            resolvedValue;

        const valueObject = {},

            limitedTimePromise = _timeout(34, new Promise(resolve => {
                _later(89, () => {
                    resolve(valueObject);
                    _later.soon(() => {
                        _chai.expect(lateCalled).to.equal(1);
                        callbackFunction();
                    });
                });
            }), (error, value) => {
                lateCalled += 1;

                _chai.expect(error).to.be.null;
                _chai.expect(value).to.equal(valueObject);
            })
                .then(value => {
                    called += 1;
                    resolvedValue = value;
                }, error => {
                    called += 1;
                    _chai.expect(error).to.be.an.instanceOf(_Error);
                    _chai.expect(error).to.have.property('details').that.is.an('object').that.has.property('milliseconds', 34);
                    _chai.expect(error).to.have.property('message', 'Timeout after 34 milliseconds');
                    _chai.expect(error).to.have.property('name', 'TimeoutError');
                });

        _chai.expect(limitedTimePromise).to.be.a('promise');

        _later(21, () => {
            _chai.expect(called).to.equal(0);
            _chai.expect(lateCalled).to.equal(0);
        });

        _later(55, () => {
            _chai.expect(called).to.equal(1);
            _chai.expect(lateCalled).to.equal(0);
            _chai.expect(resolvedValue).to.be.undefined;
        });
    });

    _mocha.it('should call the lateCallbackFunction when rejected after the timeout', callbackFunction => {
        let called = 0,
            lateCalled = 0,
            resolvedValue;

        const errorObject = new _Error(),
            limitedTimePromise = _timeout(34, new Promise((resolve, reject) => {
                _later(89, () => {
                    reject(errorObject);
                    _later.soon(() => {
                        _chai.expect(lateCalled).to.equal(1);
                        callbackFunction();
                    });
                });
            }), error => {
                lateCalled += 1;

                _chai.expect(error).to.equal(errorObject);
            })
                .then(value => {
                    called += 1;
                    resolvedValue = value;
                }, error => {
                    called += 1;
                    _chai.expect(error).to.be.an.instanceOf(_Error);
                    _chai.expect(error).to.have.property('details').that.is.an('object').that.has.property('milliseconds', 34);
                    _chai.expect(error).to.have.property('message', 'Timeout after 34 milliseconds');
                    _chai.expect(error).to.have.property('name', 'TimeoutError');
                });

        _chai.expect(limitedTimePromise).to.be.a('promise');

        _later(21, () => {
            _chai.expect(called).to.equal(0);
            _chai.expect(lateCalled).to.equal(0);
        });

        _later(55, () => {
            _chai.expect(called).to.equal(1);
            _chai.expect(lateCalled).to.equal(0);
            _chai.expect(resolvedValue).to.be.undefined;
        });
    });
});
