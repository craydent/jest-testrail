'use strict';

const mod = {};

mod.onRunComplete = () => { if (shouldThrow) { throw '' } }
module.exports = mod;