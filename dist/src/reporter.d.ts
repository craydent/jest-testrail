import { TestResult as Result, Options } from "../models/TestResult";
import { Test as RTest, SuiteGroup } from "../models/Suite";
import { BaseReporter } from "@jest/reporters";
import { AggregatedResult, TestResult, AssertionResult } from '@jest/test-result';
import { Test } from "@jest/reporters/build/types";
import { GlobalConfig } from "@jest/types/build/Config";
export default class JestReporter extends BaseReporter {
    testResults: Result;
    constructor(globalConfig: GlobalConfig, options?: Options);
    onTestResult(test: Test, testResult: TestResult, aggregatedResult: AggregatedResult): void;
    onRunComplete(contexts: any, results: any): void;
    _addSuitesToResults(suiteGroups: any): void;
    _getSuiteGroupAndTests(result: AssertionResult, suiteGroup: SuiteGroup): {
        suiteGroup: SuiteGroup;
        tests: RTest[];
    };
    _getTest(tests: RTest[], test: RTest, storyId?: string, automationId?: string): {
        storyId: string;
        automationId: string;
        name: string;
        time: number;
        result: string;
        tags: object;
        type: "UnitTest";
    };
    _writeToFile(templatePath: string, path: string): void;
    _writeToJSON(path: string): void;
}
