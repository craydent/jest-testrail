export interface SuiteGroup {
    total: number;
    passed: number;
    failed: number;
    pending: number;
    skipped: number;
    time: number;
    name: string;
    tests: Test[];
}
export interface Test {
    name: string;
    time: number;
    result: string;
    storyId: string;
    automationId: string;
    tags: object;
    type: 'UnitTest';
}