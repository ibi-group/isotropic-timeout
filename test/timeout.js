import _chai from 'chai';
import _Error from 'isotropic-error';
import _mocha from 'mocha';
import _timeout from '../js/timeout.js';
import _timers from 'timers';

_mocha.describe('timeout', function () {
    this.timeout(144);

    _mocha.it('should be a function', () => {
        _chai.expect(_timeout).to.be.a('function');
    });

    _mocha.it('should return a callback function with a limited time to be called', callbackFunction => {
        let called = 0;

        const limitedTimeCallbackFunction = _timeout(34, () => {
            called += 1;
        });

        _chai.expect(limitedTimeCallbackFunction).to.be.a('function');

        _timers.setTimeout(() => {
            _chai.expect(called).to.equal(0);
        }, 21);

        _timers.setTimeout(() => {
            _chai.expect(called).to.equal(1);
            limitedTimeCallbackFunction();
            _chai.expect(called).to.equal(1);
            callbackFunction();
        }, 55);
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

        _timers.setTimeout(() => {
            Reflect.apply(limitedTimeCallbackFunction, contextObject, [
                'a',
                'b',
                'c'
            ]);
        }, 34);

        _timers.setTimeout(() => {
            _chai.expect(called).to.equal(1);
            callbackFunction();
        }, 89);
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

        _timers.setTimeout(() => {
            _chai.expect(called).to.equal(0);
            _chai.expect(lateCalled).to.equal(0);
        }, 21);

        _timers.setTimeout(() => {
            _chai.expect(called).to.equal(1);
            _chai.expect(lateCalled).to.equal(0);
            Reflect.apply(timeLimitedCallbackFunction, contextObject, [
                'a',
                'b',
                'c'
            ]);
            _chai.expect(lateCalled).to.equal(1);
            callbackFunction();
        }, 55);
    });
});
