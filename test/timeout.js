import {
    describe,
    it
} from 'mocha';

import Error from 'isotropic-error';

import {
    expect
} from 'chai';

import {
    setTimeout
} from 'timers';

import timeout from '../js/timeout.js';

describe('timeout', function () {
    this.timeout(144);

    it('should be a function', () => {
        expect(timeout).to.be.a('function');
    });

    it('should return a callback function with a limited time to be called', callbackFunction => {
        let called = 0;

        const limitedTimeCallbackFunction = timeout(34, () => {
            called += 1;
        });

        expect(limitedTimeCallbackFunction).to.be.a('function');

        setTimeout(() => {
            expect(called).to.equal(0);
        }, 21);

        setTimeout(() => {
            expect(called).to.equal(1);
            limitedTimeCallbackFunction();
            expect(called).to.equal(1);
            callbackFunction();
        }, 55);
    });

    it('should pass an error if the callback is not called in time', callbackFunction => {
        timeout(55, error => {
            expect(error).to.be.an.instanceOf(Error);
            expect(error).to.have.property('details', 55);
            expect(error).to.have.property('message', 'Timeout after 55 milliseconds');
            expect(error).to.have.property('name', 'TimeoutError');
            callbackFunction();
        });
    });

    it('should allow the callbackFunction to be called within time with context and arguments', callbackFunction => {
        let called = 0;

        const contextObject = {},
            limitedTimeCallbackFunction = timeout(55, function (...args) {
                called += 1;

                expect(args).to.deep.equal([
                    'a',
                    'b',
                    'c'
                ]);
                expect(this).to.equal(contextObject);
            });

        setTimeout(() => {
            Reflect.apply(limitedTimeCallbackFunction, contextObject, [
                'a',
                'b',
                'c'
            ]);
        }, 34);

        setTimeout(() => {
            expect(called).to.equal(1);
            callbackFunction();
        }, 89);
    });

    it('should call the lateCallbackFunction when called after the timeout', callbackFunction => {
        let called = 0,
            lateCalled = 0;

        const contextObject = {},
            timeLimitedCallbackFunction = timeout(34, error => {
                called += 1;
                expect(error).to.be.an.instanceOf(Error);
                expect(error).to.have.property('details', 34);
                expect(error).to.have.property('message', 'Timeout after 34 milliseconds');
                expect(error).to.have.property('name', 'TimeoutError');
            }, function (...args) {
                lateCalled += 1;

                expect(args).to.deep.equal([
                    'a',
                    'b',
                    'c'
                ]);
                expect(this).to.equal(contextObject);
            });

        setTimeout(() => {
            expect(called).to.equal(0);
            expect(lateCalled).to.equal(0);
        }, 21);

        setTimeout(() => {
            expect(called).to.equal(1);
            expect(lateCalled).to.equal(0);
            Reflect.apply(timeLimitedCallbackFunction, contextObject, [
                'a',
                'b',
                'c'
            ]);
            expect(lateCalled).to.equal(1);
            callbackFunction();
        }, 55);
    });
});
