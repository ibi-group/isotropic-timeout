# isotropic-timeout

[![npm version](https://img.shields.io/npm/v/isotropic-timeout.svg)](https://www.npmjs.com/package/isotropic-timeout)
[![License](https://img.shields.io/npm/l/isotropic-timeout.svg)](https://github.com/ibi-group/isotropic-timeout/blob/main/LICENSE)
![](https://img.shields.io/badge/tests-passing-brightgreen.svg)
![](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)

A utility that limits the amount of time a callback function will wait to be called or a promise will wait to be resolved/rejected.

## Why Use This?

- **Prevent Indefinite Waiting**: Set maximum wait times for asynchronous operations
- **Dual API Support**: Works with both callbacks and promises
- **Error Handling**: Provides standardized timeout errors
- **Late Response Handling**: Option to handle responses that arrive after timeout
- **Simplified Syntax**: Clean, concise API for common timeout patterns
- **Zero Dependencies**: Lightweight implementation with minimal external requirements

## Installation

```bash
npm install isotropic-timeout
```

## Usage

### With Callback Functions

```javascript
import _timeout from 'isotropic-timeout';

{
    // Create a time-limited callback function
    const timeLimitedCallback = _timeout(
        5000, // Timeout in milliseconds
        (error, result) => { // Main callback
            if (error) {
                console.error('Operation failed or timed out:', error);

                return;
            }

            console.log('Operation succeeded:', result);
        },
        (error, result) => { // Optional late callback (called if response arrives after timeout)
            console.log('Late response received:', error || result);
        }
    );

    // Pass the time-limited callback to an async operation
    someAsyncOperation(timeLimitedCallback);
}
```

### With Promises

```javascript
import _timeout from 'isotropic-timeout';

// Wrap a promise with a timeout
const _fetchWithTimeout = async url {
    try {
        const response = await timeout(
            5000, // Timeout in milliseconds
            fetch(url), // Promise to wrap
            (error, result) => { // Optional late callback
                console.log('Late response:', error || result);
            }
        );

        return response.json();
    } catch (error) {
        if (error.name === 'TimeoutError') {
            console.error('Request timed out');
        } else {
            console.error('Request failed:', error);
        }

        throw error;
    }
};
```

## API

### timeout(milliseconds, callbackFunctionOrPromise, lateCallbackFunction)

A function that applies a timeout to a callback function or promise.

#### Parameters

- `milliseconds` (Number): The timeout duration in milliseconds
- `callbackFunctionOrPromise` (Function|Promise):
  - If a function: The callback to be wrapped with timeout functionality
  - If a promise: The promise to be wrapped with timeout functionality
- `lateCallbackFunction` (Function, optional): Function to be called if the original operation completes after timeout

#### Returns

- If `callbackFunctionOrPromise` is a function: Returns a wrapped function that will either call the original callback or trigger a timeout error
- If `callbackFunctionOrPromise` is a promise: Returns a new promise that will either resolve/reject with the original promise or reject with a timeout error

## Examples

### Working with Node.js Callbacks

```javascript
import _fs from 'node:fs';
import _timeout from 'isotropic-timeout';

// Create a file read operation with a 2-second timeout
_fs.readFile(filepath, 'utf8', _timeout(2000, (error, data) => {
    if (error) {
        if (error.name === 'TimeoutError') {
            console.error('File read timed out');
        } else {
            console.error('File read error:', error);
        }

        return;
    }

    console.log('File contents:', data);
}));
```

### HTTP Request with Timeout

```javascript
import _https from 'node:https';
import _timeout from 'isotropic-timeout';

const _httpsGet = url => new Promise((resolve, reject) => {
    _https.get(url, response => {
        const chunks = [];

        response.on('data', chunk => {
            chunks.push(chunk);
        });

        response.on('end', () => {
            resolve(chunks.join(''));
        });
    }).on('error', reject);
});

// Add a 3-second timeout to the HTTP request
_timeout(3000, _httpsGet('https://api.example.com/data')).then(data => {
    data = JSON.parse(data);

    console.log('Data received:', data);
}).catch(error => {
    if (error.name === 'TimeoutError') {
        console.error('Request timed out after 3 seconds');
    } else {
        console.error('Request failed:', error);
    }
});
```

### Database Query with Timeout

```javascript
import _createConnection from 'some-db-library';
import _timeout from 'isotropic-timeout';

const _queryWithTimeout = (db, query, params, timeout = 5000) => {
    return _timeout(
        timeout,
        db.query(query, params),
        (error, results) => {
            // Log late responses for debugging
            if (error) {
                console.log(`Query failed after timeout: ${query}`, error);
            } else {
                console.log(`Query succeeded after timeout: ${query} (${results.length} results)`);
            }
        }
    );
};

{
    const db = _createConnection({ /* connection options */ });

    try {
        const userData = await _queryWithTimeout(db, 'SELECT * FROM users WHERE id = ?', [
            userId
        ]);
    } catch (error) {
        if (error.name === 'TimeoutError') {
            console.error('Database query timed out - server might be overloaded');
        }

        throw error;
    }
}
```

## Error Handling

When a timeout occurs, the utility generates a standardized `TimeoutError` (an instance of `isotropic-error`) with:

- `details`: Object containing the timeout duration
- `message`: 'Timeout after X milliseconds'
- `name`: 'TimeoutError'

This makes error handling and identification consistent across your application.

## Contributing

Please refer to [CONTRIBUTING.md](https://github.com/ibi-group/isotropic-timeout/blob/main/CONTRIBUTING.md) for contribution guidelines.

## Issues

If you encounter any issues, please file them at https://github.com/ibi-group/isotropic-timeout/issues
