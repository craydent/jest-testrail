import { SuiteGroup } from "./Suite";
import { GlobalConfig } from "@jest/types/build/Config";

export interface TestResult {
    suites: SuiteGroup[];
    name: string;
    environment: string;
    framework: string;
    date: string;
    runtime: number;
    config: GlobalConfig;
    options: Options;
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    time: number;
    errors: number;
}
export interface Options {
    hooks?: {
        onTestResult: (suiteGroups: SuiteGroup[], testResult: TestResult) => void;
        onRunComplete: (testResult: TestResult) => void;
    };
    match?: string;
    tags?: string[];
    template?: string;
    outputFile?: string;
}