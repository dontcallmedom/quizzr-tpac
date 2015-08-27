Script to generate data for [Quizzr](https://github.com/dontcallmedom/quizzr) for the participants to TPAC.

Before running, create a file `key.json` that contains your W3C API Key quoted as a string, and a file `hashes.json` that contains the array of hashes corresponding to the users registered to TPAC.

Run as `npm load.js` after having `npm install`ed the dependencies.

This will generate a `persons.json` file that can serve as input to Quizzr.
