'use strict';

const fs = jest.genMockFromModule('fs');

let mkthrow = false;
let mkthrowError = {};
function _mkdirSync(throwit, err) {
  mkthrow = throwit;
  mkthrowError = err || mkthrowError;
}
let readContent = "";
function _readFileSync(content) {
  readContent = content;
}

function mkdirSync(dir, options) {
  if (mkthrow) {
    throw mkthrowError;
  }
}
function readFileSync(path, options) { return readContent; }

fs._mkdirSync = _mkdirSync;
fs._readFileSync = _readFileSync;
fs.mkdirSync = mkdirSync;
fs.readFileSync = readFileSync;


module.exports = fs;