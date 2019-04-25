"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var $c = require("craydent");
var reporter_1 = require("../src/reporter");
var RED = "\x1b[31m%s\x1b[0m";
jest.mock('fs');
jest.mock('hooks');
var fs = require('fs');
var hooks = require('hooks');
describe('JestReporter', function () {
    var config = { rootDir: "." };
    var defaultTestResults = {
        suites: [],
        name: "",
        environment: "",
        framework: "",
        date: $c.format($c.now(), "Y-m-d"),
        runtime: 0,
        config: config,
        options: { hooks: {} },
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        time: 0.0,
        errors: 0
    };
    test('new instance without options', function () {
        var reporter = new reporter_1.default(config);
        expect(reporter.testResults).toEqual(defaultTestResults);
    });
    test('new instance with options', function () {
        var options = { config: 1, hooks: '' };
        var reporter = new reporter_1.default(config, options);
        expect(reporter.testResults).toEqual(__assign({}, defaultTestResults, { options: {
                config: 1,
                hooks: {}
            } }));
    });
    describe('onTestResult', function () {
        test('with meta data', function () {
            var reporter = new reporter_1.default(config);
            var testResult = {
                leaks: false,
                numFailingTests: 0,
                numPassingTests: 1,
                numPendingTests: 0,
                numTodoTests: 0,
                openHandles: [],
                perfStats: null,
                skipped: false,
                snapshot: null,
                testFilePath: null,
                testResults: [
                    {
                        ancestorTitles: ['ancestor'],
                        failureMessages: [],
                        fullName: '{storyIds:["sid1"],automationIds:["aid1"]} test 1',
                        location: null,
                        numPassingAsserts: 1,
                        status: 'passed',
                        title: 'title',
                        duration: 1
                    },
                    {
                        ancestorTitles: ['ancestor'],
                        failureMessages: [],
                        fullName: '{storyIds:[],automationIds:["aid1"]} test 2',
                        location: null,
                        numPassingAsserts: 1,
                        status: 'passed',
                        title: 'title 2',
                        duration: 1
                    },
                    {
                        ancestorTitles: ['ancestor'],
                        failureMessages: [],
                        fullName: '{storyIds:["sid1"],automationIds:[]} test 3',
                        location: null,
                        numPassingAsserts: 1,
                        status: 'passed',
                        title: 'title 3',
                        duration: 1
                    },
                    {
                        ancestorTitles: ['ancestor'],
                        failureMessages: [],
                        fullName: '{storyIds:["sid1"],automationIds:["aid1"]} test 4',
                        location: null,
                        numPassingAsserts: 1,
                        status: 'passed',
                        title: 'title 4',
                        duration: 1
                    },
                    {
                        ancestorTitles: ['ancestor'],
                        failureMessages: [],
                        fullName: '{automationIds:["aid1"],storyIds:null} test 5',
                        location: null,
                        numPassingAsserts: 1,
                        status: 'passed',
                        title: 'title 5',
                        duration: 1
                    },
                    {
                        ancestorTitles: ['ancestor'],
                        failureMessages: [],
                        fullName: '{storyIds:["sid1"],automationIds:null} test 6',
                        location: null,
                        numPassingAsserts: 1,
                        status: 'passed',
                        title: 'title 6',
                        duration: 1
                    }
                ]
            };
            reporter.onTestResult(null, testResult, null);
            var expected = __assign({}, defaultTestResults, { time: 6, suites: [
                    {
                        total: 6,
                        passed: 6,
                        failed: 0,
                        pending: 0,
                        skipped: 0,
                        name: 'ancestor',
                        time: 6,
                        tests: [{
                                name: 'title',
                                time: 2,
                                result: 'passed',
                                tags: {},
                                type: 'UnitTest',
                                storyId: 'sid1',
                                automationId: 'aid1'
                            }, {
                                name: 'title 2',
                                time: 2,
                                result: 'passed',
                                tags: {},
                                type: 'UnitTest',
                                storyId: '',
                                automationId: 'aid1'
                            }, {
                                name: 'title 3',
                                time: 2,
                                result: 'passed',
                                tags: {},
                                type: 'UnitTest',
                                storyId: 'sid1',
                                automationId: ''
                            }]
                    }
                ] });
            expect(reporter.testResults).toEqual(expected);
        });
        test('with no meta data', function () {
            var reporter = new reporter_1.default(config);
            var testResult = {
                leaks: false,
                numFailingTests: 0,
                numPassingTests: 1,
                numPendingTests: 0,
                numTodoTests: 0,
                openHandles: [],
                perfStats: null,
                skipped: false,
                snapshot: null,
                testFilePath: null,
                testResults: [
                    {
                        ancestorTitles: ['ancestor'],
                        failureMessages: [],
                        fullName: 'test 1',
                        location: null,
                        numPassingAsserts: 1,
                        status: 'passed',
                        title: 'title',
                        duration: 1
                    }
                ]
            };
            reporter.onTestResult(null, testResult, null);
            var expected = __assign({}, defaultTestResults, { time: 1, suites: [] });
            expect(reporter.testResults).toEqual(expected);
        });
        test('with hook', function () {
            var reporter = new reporter_1.default(config, { hooks: 'hooks' });
            hooks.onTestResult = jest.fn().mockImplementationOnce(function () { });
            var testResult = {
                leaks: false,
                numFailingTests: 0,
                numPassingTests: 1,
                numPendingTests: 0,
                numTodoTests: 0,
                openHandles: [],
                perfStats: null,
                skipped: false,
                snapshot: null,
                testFilePath: null,
                testResults: [
                    {
                        ancestorTitles: ['ancestor'],
                        failureMessages: [],
                        fullName: 'test 1',
                        location: null,
                        numPassingAsserts: 1,
                        status: 'passed',
                        title: 'title',
                        duration: 1
                    }
                ]
            };
            reporter.onTestResult(null, testResult, null);
            var groups = [{
                    tests: [],
                    total: 1,
                    passed: 1,
                    failed: 0,
                    pending: 0,
                    skipped: 0,
                    name: '',
                    time: 1
                }];
            expect(hooks.onTestResult).toHaveBeenCalledWith(groups, reporter.testResults);
        });
        test('with hook throwing error', function () {
            var reporter = new reporter_1.default(config, { hooks: 'hooks' });
            var error = new Error();
            hooks.onTestResult = jest.fn().mockImplementationOnce(function () { throw error; });
            var spy = jest.spyOn(global.console, 'log');
            var testResult = {
                leaks: false,
                numFailingTests: 0,
                numPassingTests: 1,
                numPendingTests: 0,
                numTodoTests: 0,
                openHandles: [],
                perfStats: null,
                skipped: false,
                snapshot: null,
                testFilePath: null,
                testResults: [
                    {
                        ancestorTitles: ['ancestor'],
                        failureMessages: [],
                        fullName: 'test 1',
                        location: null,
                        numPassingAsserts: 1,
                        status: 'passed',
                        title: 'title',
                        duration: 1
                    }
                ]
            };
            reporter.onTestResult(null, testResult, null);
            expect(spy).toHaveBeenCalledWith(RED, error);
        });
    });
    describe('onRunComplete', function () {
        beforeEach(function () {
            fs._mkdirSync(false);
        });
        test('with outputFile', function () {
            var reporter = new reporter_1.default(config, { outputFile: 'abc' });
            reporter._writeToJSON = jest.fn().mockImplementationOnce(function () { });
            reporter.onRunComplete(null, { startTime: $c.now().getTime() });
            expect(reporter.testResults.runtime).toBe(0);
            expect(reporter._writeToJSON)
                .toHaveBeenCalledWith('abc');
        });
        test('with template', function () {
            var path = "./results.json";
            var reporter = new reporter_1.default(config, { template: 'abc' });
            reporter._writeToFile = jest.fn().mockImplementationOnce(function () { });
            reporter.onRunComplete(null, { startTime: $c.now().getTime() });
            expect(reporter.testResults.runtime).toBe(0);
            expect(reporter._writeToFile)
                .toHaveBeenCalledWith('abc', path);
        });
        test('with fs error EEXIST', function () {
            var path = "./results.json";
            var reporter = new reporter_1.default(config);
            reporter._writeToJSON = jest.fn().mockImplementationOnce(function () { });
            fs._mkdirSync(true, { code: "EEXIST" });
            reporter.onRunComplete(null, { startTime: $c.now().getTime() });
            expect(reporter.testResults.runtime).toBe(0);
            expect(reporter._writeToJSON)
                .toHaveBeenCalledWith(path);
        });
        test('with fs error other than EEXIST', function () {
            var path = "./results.json";
            var reporter = new reporter_1.default(config);
            reporter._writeToJSON = jest.fn().mockImplementationOnce(function () { });
            fs._mkdirSync(true, { code: "ENOENT" });
            expect(function () { reporter.onRunComplete(null, { startTime: $c.now().getTime() }); }).toThrow();
            expect(reporter._writeToJSON)
                .not.toHaveBeenCalledWith(path);
        });
        test('with template', function () {
            var path = "./results.json";
            var reporter = new reporter_1.default(config, { template: 'abc' });
            reporter._writeToFile = jest.fn().mockImplementationOnce(function () { });
            reporter.onRunComplete(null, { startTime: $c.now().getTime() });
            expect(reporter.testResults.runtime).toBe(0);
            expect(reporter._writeToFile)
                .toHaveBeenCalledWith('abc', path);
        });
        test('with hook', function () {
            var reporter = new reporter_1.default(config, { hooks: 'hooks' });
            reporter._writeToFile = jest.fn().mockImplementationOnce(function () { });
            reporter._writeToJSON = jest.fn().mockImplementationOnce(function () { });
            hooks.onRunComplete = jest.fn().mockImplementationOnce(function () { });
            reporter.onRunComplete(null, { startTime: $c.now().getTime() });
            expect(reporter.testResults.runtime).toBe(0);
            expect(hooks.onRunComplete).toHaveBeenCalled();
            expect(reporter._writeToFile)
                .not.toHaveBeenCalled();
            expect(reporter._writeToJSON)
                .not.toHaveBeenCalled();
        });
        test('with hook throwing error', function () {
            var reporter = new reporter_1.default(config, { hooks: 'hooks' });
            var error = new Error();
            var spy = jest.spyOn(global.console, 'log');
            reporter._writeToFile = jest.fn().mockImplementationOnce(function () { });
            reporter._writeToJSON = jest.fn().mockImplementationOnce(function () { });
            hooks.onRunComplete = jest.fn().mockImplementationOnce(function () { throw error; });
            reporter.onRunComplete(null, { startTime: $c.now().getTime() });
            expect(spy).toHaveBeenCalledWith(RED, error);
            expect(reporter.testResults.runtime).toBe(0);
            expect(hooks.onRunComplete).toHaveBeenCalled();
            expect(reporter._writeToFile)
                .not.toHaveBeenCalled();
            expect(reporter._writeToJSON)
                .not.toHaveBeenCalled();
        });
    });
    describe('class methods', function () {
        var reporter;
        beforeEach(function () {
            reporter = new reporter_1.default(config);
        });
        test('_addSuitesToResults', function () {
            var suiteGroup = {
                tests: [{
                        name: 'title',
                        time: 1,
                        result: 'passed',
                        tags: {},
                        type: 'UnitTest',
                        storyId: 'sid1',
                        automationId: 'aid1'
                    }],
                total: 1,
                passed: 1,
                failed: 0,
                pending: 0,
                skipped: 0,
                name: 'suiteName',
                time: 1
            };
            reporter._addSuitesToResults({
                'suiteName': suiteGroup
            });
            expect(reporter.testResults.suites).toEqual([suiteGroup]);
        });
        test('_addSuitesToResults', function () {
            var suiteGroup = {
                tests: [],
                total: 1,
                passed: 1,
                failed: 0,
                pending: 0,
                skipped: 0,
                name: 'suiteName',
                time: 1
            };
            reporter._addSuitesToResults({
                'suiteName': suiteGroup
            });
            expect(reporter.testResults.suites).not.toEqual([suiteGroup]);
        });
        test('_getSuiteGroupAndTests', function () {
            var recieved = reporter._getSuiteGroupAndTests({ numPassingAsserts: 0, title: '', ancestorTitles: [], failureMessages: [], fullName: '', location: null, duration: 1, status: 'passed' }, null);
            var expected = {
                name: "",
                tests: [],
                total: 1,
                passed: 1,
                failed: 0,
                pending: 0,
                skipped: 0,
                time: 1
            };
            expect(recieved).toEqual({ tests: [], suiteGroup: expected });
        });
        test('_getSuiteGroupAndTests with suite group', function () {
            var suiteGroup = {
                name: "name",
                tests: [],
                total: 0,
                passed: 0,
                failed: 0,
                pending: 0,
                skipped: 0,
                time: 0
            };
            var recieved = reporter._getSuiteGroupAndTests({ numPassingAsserts: 0, title: '', ancestorTitles: [], failureMessages: [], fullName: '', location: null, duration: 1, status: 'passed' }, suiteGroup);
            var expected = {
                name: "name",
                tests: [],
                total: 1,
                passed: 1,
                failed: 0,
                pending: 0,
                skipped: 0,
                time: 1
            };
            expect(recieved).toEqual({ tests: [], suiteGroup: expected });
        });
        describe('_getTest', function () {
            test('without sid and aid', function () {
                var recieved = reporter._getTest([{ name: "name", tags: {}, time: 1, type: 'UnitTest', result: 'passed', storyId: '', automationId: '' }], { name: "name 1", tags: {}, time: 1, type: 'UnitTest', storyId: '', automationId: '', result: 'passed' });
                expect(recieved).toEqual({ name: "name 1", tags: {}, time: 1, type: 'UnitTest', storyId: '', automationId: '', result: 'passed' });
            });
            describe('with aid', function () {
                test('with matching test - test failed', function () {
                    var tests = [{ name: "name", tags: {}, time: 1, type: 'UnitTest', result: 'passed', storyId: '', automationId: 'aid' }];
                    var recieved = reporter._getTest(tests, { name: "name", tags: {}, time: 1, type: 'UnitTest', result: 'failed', storyId: '', automationId: '' }, null, 'aid');
                    expect(recieved).toEqual(undefined);
                    expect(tests).toEqual([{ name: "name", tags: {}, time: 2, type: 'UnitTest', storyId: '', automationId: 'aid', result: 'failed' }]);
                });
                test('with matching test - test failed and tests item passed', function () {
                    var tests = [{ name: "name", tags: {}, time: 1, type: 'UnitTest', storyId: '', automationId: 'aid', result: "passed" }];
                    var recieved = reporter._getTest(tests, { name: "name", tags: {}, time: 1, type: 'UnitTest', result: 'failed', storyId: '', automationId: '' }, null, 'aid');
                    expect(recieved).toEqual(undefined);
                    expect(tests).toEqual([{ name: "name", tags: {}, time: 2, type: 'UnitTest', storyId: '', automationId: 'aid', result: 'failed' }]);
                });
                test('with matching test - test passed and tests item passed', function () {
                    var tests = [{ name: "name", tags: {}, time: 1, type: 'UnitTest', storyId: '', automationId: 'aid', result: "passed" }];
                    var recieved = reporter._getTest(tests, { name: "name", tags: {}, time: 1, type: 'UnitTest', result: 'passed', storyId: '', automationId: '' }, null, 'aid');
                    expect(recieved).toEqual(undefined);
                    expect(tests).toEqual([{ name: "name", tags: {}, time: 2, type: 'UnitTest', storyId: '', automationId: 'aid', result: 'passed' }]);
                });
                test('with matching test - test passed and tests item failed', function () {
                    var tests = [{ name: "name", tags: {}, time: 1, type: 'UnitTest', storyId: '', automationId: 'aid', result: "failed" }];
                    var recieved = reporter._getTest(tests, { name: "name", tags: {}, time: 1, type: 'UnitTest', result: 'passed', storyId: '', automationId: '' }, null, 'aid');
                    expect(recieved).toEqual(undefined);
                    expect(tests).toEqual([{ name: "name", tags: {}, time: 2, type: 'UnitTest', storyId: '', automationId: 'aid', result: 'failed' }]);
                });
                test('without matching test', function () {
                    var tests = [{ name: "name", tags: {}, time: 1, type: 'UnitTest', storyId: '', automationId: 'aid1', result: "failed" }];
                    var recieved = reporter._getTest(tests, { name: "name", tags: {}, time: 1, type: 'UnitTest', result: 'passed', storyId: '', automationId: '' }, null, 'aid');
                    expect(recieved).toEqual({ name: "name", tags: {}, time: 1, type: 'UnitTest', result: 'passed', storyId: '', automationId: 'aid' });
                });
            });
            describe('with sid', function () {
                test('with matching test - test failed', function () {
                    var tests = [{ name: "name", tags: {}, time: 1, type: 'UnitTest', result: "passed", storyId: 'sid', automationId: '' }];
                    var recieved = reporter._getTest(tests, { name: "name", tags: {}, time: 1, type: 'UnitTest', result: 'failed', storyId: '', automationId: '' }, 'sid', null);
                    expect(recieved).toEqual(undefined);
                    expect(tests).toEqual([{ name: "name", tags: {}, time: 2, type: 'UnitTest', storyId: 'sid', automationId: '', result: 'failed' }]);
                });
                test('with matching test - test failed and tests item passed', function () {
                    var tests = [{ name: "name", tags: {}, time: 1, type: 'UnitTest', storyId: 'sid', automationId: '', result: "passed" }];
                    var recieved = reporter._getTest(tests, { name: "name", tags: {}, time: 1, type: 'UnitTest', result: 'failed', storyId: '', automationId: '' }, 'sid', null);
                    expect(recieved).toEqual(undefined);
                    expect(tests).toEqual([{ name: "name", tags: {}, time: 2, type: 'UnitTest', storyId: 'sid', automationId: '', result: 'failed' }]);
                });
                test('with matching test - test passed and tests item passed', function () {
                    var tests = [{ name: "name", tags: {}, time: 1, type: 'UnitTest', storyId: 'sid', automationId: '', result: "passed" }];
                    var recieved = reporter._getTest(tests, { name: "name", tags: {}, time: 1, type: 'UnitTest', result: 'passed', storyId: '', automationId: '' }, 'sid', null);
                    expect(recieved).toEqual(undefined);
                    expect(tests).toEqual([{ name: "name", tags: {}, time: 2, type: 'UnitTest', storyId: 'sid', automationId: '', result: 'passed' }]);
                });
                test('with matching test - test passed and tests item failed', function () {
                    var tests = [{ name: "name", tags: {}, time: 1, type: 'UnitTest', storyId: 'sid', automationId: '', result: "failed" }];
                    var recieved = reporter._getTest(tests, { name: "name", tags: {}, time: 1, type: 'UnitTest', result: 'passed', storyId: '', automationId: '' }, 'sid', null);
                    expect(recieved).toEqual(undefined);
                    expect(tests).toEqual([{ name: "name", tags: {}, time: 2, type: 'UnitTest', storyId: 'sid', automationId: '', result: 'failed' }]);
                });
                test('without matching test', function () {
                    var tests = [{ name: "name", tags: {}, time: 1, type: 'UnitTest', storyId: 'sid1', automationId: '', result: "failed" }];
                    var recieved = reporter._getTest(tests, { name: "name", tags: {}, time: 1, type: 'UnitTest', result: 'passed', storyId: '', automationId: '' }, 'sid', null);
                    expect(recieved).toEqual({ name: "name", tags: {}, time: 1, type: 'UnitTest', result: 'passed', storyId: 'sid', automationId: '' });
                });
            });
            test('_getTest with matching both sid and aid', function () {
                var tests = [{ name: "name", tags: {}, time: 1, type: 'UnitTest', storyId: 'sid', automationId: 'aid', result: "passed" }];
                var recieved = reporter._getTest(tests, { name: "name", tags: {}, time: 1, type: 'UnitTest', result: 'passed', storyId: '', automationId: '' }, 'sid', 'aid');
                expect(recieved).toEqual(undefined);
                expect(tests).toEqual([{ name: "name", tags: {}, time: 2, type: 'UnitTest', storyId: 'sid', automationId: 'aid', result: 'passed' }]);
            });
            test('_getTest without matching both sid and aid', function () {
                var tests = [{ name: "name", tags: {}, time: 1, type: 'UnitTest', storyId: 'sid', automationId: 'aid', result: "passed" }];
                var recieved = reporter._getTest(tests, { name: "name", tags: {}, time: 1, type: 'UnitTest', result: 'passed', storyId: '', automationId: '' }, 'sid1', 'aid1');
                expect(recieved).toEqual({ name: "name", tags: {}, time: 1, type: 'UnitTest', storyId: 'sid1', automationId: 'aid1', result: 'passed' });
            });
        });
        test('_writeToFile', function () {
            fs._readFileSync('the template content');
            reporter._writeToFile('template', 'path');
            expect(fs.writeFileSync).toBeCalledWith('path', 'the template content');
        });
        test('_writeToJSON', function () {
            var data = JSON.stringify(reporter.testResults, null, 2);
            reporter._writeToJSON('path');
            expect(fs.writeFileSync).toBeCalledWith('path', data);
        });
    });
});
//# sourceMappingURL=reporter.test.js.map