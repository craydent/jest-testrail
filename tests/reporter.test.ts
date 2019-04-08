import * as $c from "craydent";
import JestReporter from "../src/reporter";
import { GlobalConfig } from "@jest/types/build/Config";
import { TestResult } from "@jest/test-result";
import { TestResult as Result } from "../models/TestResult";
import { Test as RTest } from "../models/Suite";

const RED = "\x1b[31m%s\x1b[0m";
jest.mock('fs');
jest.mock('hooks');
const fs = require('fs');
const hooks = require('hooks');

describe('JestReporter', () => {
    let config = { rootDir: "." } as GlobalConfig;
    let defaultTestResults: Result = {
        suites: [],
        name: "",
        environment: "",
        framework: "",
        date: $c.format($c.now(), "Y-m-d"),
        runtime: 0,
        config,
        options: { hooks: {} as any },
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        time: 0.0,
        errors: 0
    };
    test('new instance without options', () => {
        let reporter = new JestReporter(config);
        expect(reporter.testResults).toEqual(defaultTestResults);
    });
    test('new instance with options', () => {
        let options: any = { config: 1, hooks: '' };
        let reporter = new JestReporter(config, options);
        expect(reporter.testResults).toEqual({
            ...defaultTestResults,
            options: {
                config: 1,
                hooks: {}
            }
        });
    });
    describe('onTestResult', () => {
        test('with meta data', () => {
            let reporter = new JestReporter(config);
            let testResult: TestResult = {
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
            let expected: Result = {
                ...defaultTestResults,
                time: 6,
                suites: [
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
                ]
            }
            expect(reporter.testResults).toEqual(expected);
        });
        test('with no meta data', () => {
            let reporter = new JestReporter(config);
            let testResult: TestResult = {
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
            let expected = {
                ...defaultTestResults,
                time: 1,
                suites: []
            }
            expect(reporter.testResults).toEqual(expected);
        });
        test('with hook', () => {
            let reporter = new JestReporter(config, { hooks: 'hooks' as any });
            hooks.onTestResult = jest.fn().mockImplementationOnce(() => { });

            let testResult: TestResult = {
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
            let groups = [{
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
        test('with hook throwing error', () => {
            let reporter = new JestReporter(config, { hooks: 'hooks' as any });
            let error = new Error();
            hooks.onTestResult = jest.fn().mockImplementationOnce(() => { throw error });
            const spy = jest.spyOn(global.console, 'log')
            let testResult: TestResult = {
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
    describe('onRunComplete', () => {
        beforeEach(() => {
            fs._mkdirSync(false);
        });
        test('with outputFile', () => {
            let reporter = new JestReporter(config, { outputFile: 'abc' });
            reporter._writeToJSON = jest.fn().mockImplementationOnce(() => { });
            reporter.onRunComplete(null, { startTime: $c.now().getTime() });
            expect(reporter.testResults.runtime).toBe(0);
            expect(reporter._writeToJSON)
                .toHaveBeenCalledWith('abc');

        });
        test('with template', () => {
            const path = "./results.json";
            let reporter = new JestReporter(config, { template: 'abc' });
            reporter._writeToFile = jest.fn().mockImplementationOnce(() => { });
            reporter.onRunComplete(null, { startTime: $c.now().getTime() });
            expect(reporter.testResults.runtime).toBe(0);
            expect(reporter._writeToFile)
                .toHaveBeenCalledWith('abc', path);

        });
        test('with fs error EEXIST', () => {
            const path = "./results.json";
            let reporter = new JestReporter(config);
            reporter._writeToJSON = jest.fn().mockImplementationOnce(() => { });
            fs._mkdirSync(true, { code: "EEXIST" });
            reporter.onRunComplete(null, { startTime: $c.now().getTime() });
            expect(reporter.testResults.runtime).toBe(0);
            expect(reporter._writeToJSON)
                .toHaveBeenCalledWith(path);

        });
        test('with fs error other than EEXIST', () => {
            const path = "./results.json";
            let reporter = new JestReporter(config);
            reporter._writeToJSON = jest.fn().mockImplementationOnce(() => { });
            fs._mkdirSync(true, { code: "ENOENT" });

            expect(() => { reporter.onRunComplete(null, { startTime: $c.now().getTime() }) }).toThrow();
            expect(reporter._writeToJSON)
                .not.toHaveBeenCalledWith(path);

        });
        test('with template', () => {
            const path = "./results.json";
            let reporter = new JestReporter(config, { template: 'abc' });
            reporter._writeToFile = jest.fn().mockImplementationOnce(() => { });
            reporter.onRunComplete(null, { startTime: $c.now().getTime() });
            expect(reporter.testResults.runtime).toBe(0);
            expect(reporter._writeToFile)
                .toHaveBeenCalledWith('abc', path);

        });
        test('with hook', () => {
            let reporter = new JestReporter(config, { hooks: 'hooks' as any });
            reporter._writeToFile = jest.fn().mockImplementationOnce(() => { });
            reporter._writeToJSON = jest.fn().mockImplementationOnce(() => { });
            hooks.onRunComplete = jest.fn().mockImplementationOnce(() => { });
            reporter.onRunComplete(null, { startTime: $c.now().getTime() });
            expect(reporter.testResults.runtime).toBe(0);
            expect(hooks.onRunComplete).toHaveBeenCalled();
            expect(reporter._writeToFile)
                .not.toHaveBeenCalled();
            expect(reporter._writeToJSON)
                .not.toHaveBeenCalled();

        });
        test('with hook throwing error', () => {
            let reporter = new JestReporter(config, { hooks: 'hooks' as any });
            let error = new Error();
            const spy = jest.spyOn(global.console, 'log')
            reporter._writeToFile = jest.fn().mockImplementationOnce(() => { });
            reporter._writeToJSON = jest.fn().mockImplementationOnce(() => { });
            hooks.onRunComplete = jest.fn().mockImplementationOnce(() => { throw error; });
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
    describe('class methods', () => {
        let reporter: JestReporter;
        beforeEach(() => {
            reporter = new JestReporter(config);
        });
        test('_addSuitesToResults', () => {
            let suiteGroup = {
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
            })
            expect(reporter.testResults.suites).toEqual([suiteGroup]);
        });
        test('_addSuitesToResults', () => {
            let suiteGroup = {
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
            })
            expect(reporter.testResults.suites).not.toEqual([suiteGroup]);
        });
        test('_getSuiteGroupAndTests', () => {
            let recieved = reporter._getSuiteGroupAndTests({ numPassingAsserts: 0, title: '', ancestorTitles: [], failureMessages: [], fullName: '', location: null, duration: 1, status: 'passed' }, null);
            let expected = {
                name: "",
                tests: [],
                total: 1,
                passed: 1,
                failed: 0,
                pending: 0,
                skipped: 0,
                time: 1
            }
            expect(recieved).toEqual({ tests: [], suiteGroup: expected });

        });
        test('_getSuiteGroupAndTests with suite group', () => {
            let suiteGroup = {
                name: "name",
                tests: [],
                total: 0,
                passed: 0,
                failed: 0,
                pending: 0,
                skipped: 0,
                time: 0
            }
            let recieved = reporter._getSuiteGroupAndTests({ numPassingAsserts: 0, title: '', ancestorTitles: [], failureMessages: [], fullName: '', location: null, duration: 1, status: 'passed' }, suiteGroup);
            let expected = {
                name: "name",
                tests: [],
                total: 1,
                passed: 1,
                failed: 0,
                pending: 0,
                skipped: 0,
                time: 1
            }
            expect(recieved).toEqual({ tests: [], suiteGroup: expected });

        });

        describe('_getTest', () => {
            test('without sid and aid', () => {
                let recieved = reporter._getTest([{ name: "name", tags: {}, time: 1, type: 'UnitTest', result: 'passed', storyId: '', automationId: '' }], { name: "name 1", tags: {}, time: 1, type: 'UnitTest', storyId: '', automationId: '', result: 'passed' })
                expect(recieved).toEqual({ name: "name 1", tags: {}, time: 1, type: 'UnitTest', storyId: '', automationId: '', result: 'passed' })
            });
            describe('with aid', () => {
                test('with matching test - test failed', () => {
                    let tests: RTest[] = [{ name: "name", tags: {}, time: 1, type: 'UnitTest', result: 'passed', storyId: '', automationId: 'aid' }];
                    let recieved = reporter._getTest(tests, { name: "name", tags: {}, time: 1, type: 'UnitTest', result: 'failed', storyId: '', automationId: '' }, null, 'aid')
                    expect(recieved).toEqual(undefined);
                    expect(tests).toEqual([{ name: "name", tags: {}, time: 2, type: 'UnitTest', storyId: '', automationId: 'aid', result: 'failed' }])
                });
                test('with matching test - test failed and tests item passed', () => {
                    let tests: RTest[] = [{ name: "name", tags: {}, time: 1, type: 'UnitTest', storyId: '', automationId: 'aid', result: "passed" }];
                    let recieved = reporter._getTest(tests, { name: "name", tags: {}, time: 1, type: 'UnitTest', result: 'failed', storyId: '', automationId: '' }, null, 'aid')
                    expect(recieved).toEqual(undefined);
                    expect(tests).toEqual([{ name: "name", tags: {}, time: 2, type: 'UnitTest', storyId: '', automationId: 'aid', result: 'failed' }])
                });
                test('with matching test - test passed and tests item passed', () => {
                    let tests: RTest[] = [{ name: "name", tags: {}, time: 1, type: 'UnitTest', storyId: '', automationId: 'aid', result: "passed" }];
                    let recieved = reporter._getTest(tests, { name: "name", tags: {}, time: 1, type: 'UnitTest', result: 'passed', storyId: '', automationId: '' }, null, 'aid')
                    expect(recieved).toEqual(undefined);
                    expect(tests).toEqual([{ name: "name", tags: {}, time: 2, type: 'UnitTest', storyId: '', automationId: 'aid', result: 'passed' }])
                });
                test('with matching test - test passed and tests item failed', () => {
                    let tests: RTest[] = [{ name: "name", tags: {}, time: 1, type: 'UnitTest', storyId: '', automationId: 'aid', result: "failed" }];
                    let recieved = reporter._getTest(tests, { name: "name", tags: {}, time: 1, type: 'UnitTest', result: 'passed', storyId: '', automationId: '' }, null, 'aid')
                    expect(recieved).toEqual(undefined);
                    expect(tests).toEqual([{ name: "name", tags: {}, time: 2, type: 'UnitTest', storyId: '', automationId: 'aid', result: 'failed' }])
                });
                test('without matching test', () => {
                    let tests: RTest[] = [{ name: "name", tags: {}, time: 1, type: 'UnitTest', storyId: '', automationId: 'aid1', result: "failed" }];
                    let recieved = reporter._getTest(tests, { name: "name", tags: {}, time: 1, type: 'UnitTest', result: 'passed', storyId: '', automationId: '' }, null, 'aid')
                    expect(recieved).toEqual({ name: "name", tags: {}, time: 1, type: 'UnitTest', result: 'passed', storyId: '', automationId: 'aid' })
                });
            });
            describe('with sid', () => {
                test('with matching test - test failed', () => {
                    let tests: RTest[] = [{ name: "name", tags: {}, time: 1, type: 'UnitTest', result: "passed", storyId: 'sid', automationId: '' }];
                    let recieved = reporter._getTest(tests, { name: "name", tags: {}, time: 1, type: 'UnitTest', result: 'failed', storyId: '', automationId: '' }, 'sid', null)
                    expect(recieved).toEqual(undefined);
                    expect(tests).toEqual([{ name: "name", tags: {}, time: 2, type: 'UnitTest', storyId: 'sid', automationId: '', result: 'failed' }])
                });
                test('with matching test - test failed and tests item passed', () => {
                    let tests: RTest[] = [{ name: "name", tags: {}, time: 1, type: 'UnitTest', storyId: 'sid', automationId: '', result: "passed" }];
                    let recieved = reporter._getTest(tests, { name: "name", tags: {}, time: 1, type: 'UnitTest', result: 'failed', storyId: '', automationId: '' }, 'sid', null)
                    expect(recieved).toEqual(undefined);
                    expect(tests).toEqual([{ name: "name", tags: {}, time: 2, type: 'UnitTest', storyId: 'sid', automationId: '', result: 'failed' }])
                });
                test('with matching test - test passed and tests item passed', () => {
                    let tests: RTest[] = [{ name: "name", tags: {}, time: 1, type: 'UnitTest', storyId: 'sid', automationId: '', result: "passed" }];
                    let recieved = reporter._getTest(tests, { name: "name", tags: {}, time: 1, type: 'UnitTest', result: 'passed', storyId: '', automationId: '' }, 'sid', null)
                    expect(recieved).toEqual(undefined);
                    expect(tests).toEqual([{ name: "name", tags: {}, time: 2, type: 'UnitTest', storyId: 'sid', automationId: '', result: 'passed' }])
                });
                test('with matching test - test passed and tests item failed', () => {
                    let tests: RTest[] = [{ name: "name", tags: {}, time: 1, type: 'UnitTest', storyId: 'sid', automationId: '', result: "failed" }];
                    let recieved = reporter._getTest(tests, { name: "name", tags: {}, time: 1, type: 'UnitTest', result: 'passed', storyId: '', automationId: '' }, 'sid', null)
                    expect(recieved).toEqual(undefined);
                    expect(tests).toEqual([{ name: "name", tags: {}, time: 2, type: 'UnitTest', storyId: 'sid', automationId: '', result: 'failed' }])
                });
                test('without matching test', () => {
                    let tests: RTest[] = [{ name: "name", tags: {}, time: 1, type: 'UnitTest', storyId: 'sid1', automationId: '', result: "failed" }];
                    let recieved = reporter._getTest(tests, { name: "name", tags: {}, time: 1, type: 'UnitTest', result: 'passed', storyId: '', automationId: '' }, 'sid', null)
                    expect(recieved).toEqual({ name: "name", tags: {}, time: 1, type: 'UnitTest', result: 'passed', storyId: 'sid', automationId: '' })
                });
            });
            test('_getTest with matching both sid and aid', () => {
                let tests: RTest[] = [{ name: "name", tags: {}, time: 1, type: 'UnitTest', storyId: 'sid', automationId: 'aid', result: "passed" }];
                let recieved = reporter._getTest(tests, { name: "name", tags: {}, time: 1, type: 'UnitTest', result: 'passed', storyId: '', automationId: '' }, 'sid', 'aid')
                expect(recieved).toEqual(undefined);
                expect(tests).toEqual([{ name: "name", tags: {}, time: 2, type: 'UnitTest', storyId: 'sid', automationId: 'aid', result: 'passed' }])
            });
            test('_getTest without matching both sid and aid', () => {
                let tests: RTest[] = [{ name: "name", tags: {}, time: 1, type: 'UnitTest', storyId: 'sid', automationId: 'aid', result: "passed" }];
                let recieved = reporter._getTest(tests, { name: "name", tags: {}, time: 1, type: 'UnitTest', result: 'passed', storyId: '', automationId: '' }, 'sid1', 'aid1')
                expect(recieved).toEqual({ name: "name", tags: {}, time: 1, type: 'UnitTest', storyId: 'sid1', automationId: 'aid1', result: 'passed' })
            });
        })

        test('_writeToFile', () => {
            fs._readFileSync('the template content');
            reporter._writeToFile('template', 'path');
            expect(fs.writeFileSync).toBeCalledWith('path', 'the template content');
        });
        test('_writeToJSON', () => {
            const data = JSON.stringify(reporter.testResults, null, 2);
            reporter._writeToJSON('path');
            expect(fs.writeFileSync).toBeCalledWith('path', data);
        });
    })
});