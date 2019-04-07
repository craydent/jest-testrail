'use strict';
const $real = require('craydent');
const $c = jest.genMockFromModule('craydent');
for (let prop in $real) {
  $c[prop] = $real[prop];
}
let dt = new Date();
$c.now = () => dt;

module.exports = $c;