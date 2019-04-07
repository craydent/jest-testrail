"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var transform_1 = require("../src/transform");
var regex = /(\[(StoryID|AutomationID)\(['"][\s\S]*?['"]\)\][\s\S]*?)+?(test|describe)[\s\S]*?\(['"][\s\S]*?['"],[\s\S]*?\)/g;
var src = "\n[StoryID('sid')]\n[AutomationID('aid')]\n[CustomTag('ct')]\ndescribe('the describe', () => {\n    test('test 1', () => {});\n    [StoryID('sid1')]\n    [AutomationID('aid1')]\n    test('test 2', () => {});\n});";
var matches = [
    "[StoryID('sid')]\n[AutomationID('aid')]\n[CustomTag('ct')]\ndescribe('the describe', ()",
    "[StoryID('sid1')]\n    [AutomationID('aid1')]\n    test('test 2', ()"
];
describe('JestTransformer', function () {
    var storyIds = ['sid'], automationIds = ['aid'];
    describe('alterSource', function () {
        var match = matches[0];
        test('without tags', function () {
            var expected = "\n[StoryID('sid')]\n[AutomationID('aid')]\n[CustomTag('ct')]\ndescribe('{storyIds:[\"sid\"],automationIds:[\"aid\"],tags:{}} - the describe', () => {\n    test('test 1', () => {});\n    [StoryID('sid1')]\n    [AutomationID('aid1')]\n    test('test 2', () => {});\n});";
            expect(transform_1.alterSource({ src: src, match: match, storyIds: storyIds, automationIds: automationIds, tags: {} })).toEqual(expected);
        });
        test('with tags', function () {
            var tags = { CustomTag: ['ct', 'ct2'], CustomTag2: ['c2', 'c22'] };
            var expected = "\n[StoryID('sid')]\n[AutomationID('aid')]\n[CustomTag('ct')]\ndescribe('{storyIds:[\"sid\"],automationIds:[\"aid\"],tags:{\"CustomTag\": [\"ct\",\"ct2\"],\"CustomTag2\": [\"c2\",\"c22\"]}} - the describe', () => {\n    test('test 1', () => {});\n    [StoryID('sid1')]\n    [AutomationID('aid1')]\n    test('test 2', () => {});\n});";
            expect(transform_1.alterSource({ src: src, match: match, storyIds: storyIds, automationIds: automationIds, tags: tags })).toEqual(expected);
        });
    });
    describe('processMatches', function () {
        test('without tags', function () {
            var expected = "\n[StoryID('sid')]\n[AutomationID('aid')]\n[CustomTag('ct')]\ndescribe('{storyIds:[\"sid\"],automationIds:[\"aid\"],tags:{}} - the describe', () => {\n    test('test 1', () => {});\n    [StoryID('sid1')]\n    [AutomationID('aid1')]\n    test('{storyIds:[\"sid1\"],automationIds:[\"aid1\"],tags:{}} - test 2', () => {});\n});";
            expect(transform_1.processMatches(src, matches, {})).toBe(expected);
        });
        test('with tags not matching', function () {
            var expected = "\n[StoryID('sid')]\n[AutomationID('aid')]\n[CustomTag('ct')]\ndescribe('{storyIds:[\"sid\"],automationIds:[\"aid\"],tags:{\"CustomTag\": [],\"CustomTag2\": []}} - the describe', () => {\n    test('test 1', () => {});\n    [StoryID('sid1')]\n    [AutomationID('aid1')]\n    test('{storyIds:[\"sid1\"],automationIds:[\"aid1\"],tags:{\"CustomTag\": [],\"CustomTag2\": []}} - test 2', () => {});\n});";
            expect(transform_1.processMatches(src, matches, { tags: ["CustomTag", "CustomTag2", "8989"] })).toBe(expected);
        });
        test('with tags matching', function () {
            var ctMatch = [
                "[StoryID('sid')]\n[AutomationID('aid')]\n[CustomTag('ct')]\ndescribe('the describe', ()",
                "[StoryID('sid1')]\n    [AutomationID('aid1')]\n    test('test 2', ()"
            ];
            var expected = "\n[StoryID('sid')]\n[AutomationID('aid')]\n[CustomTag('ct')]\ndescribe('{storyIds:[\"sid\"],automationIds:[\"aid\"],tags:{\"CustomTag\": [],\"CustomTag2\": []}} - the describe', () => {\n    test('test 1', () => {});\n    [StoryID('sid1')]\n    [AutomationID('aid1')]\n    test('{storyIds:[\"sid1\"],automationIds:[\"aid1\"],tags:{\"CustomTag\": [],\"CustomTag2\": []}} - test 2', () => {});\n});";
            expect(transform_1.processMatches(src, matches, { tags: ["CustomTag", "CustomTag2", "8989"] })).toBe(expected);
        });
    });
    describe('process', function () {
        jest.mock('../package.json');
        var pkg = require('../package.json');
        beforeEach(function () {
            delete pkg.jest;
        });
        test('with no matching', function () {
            var noMatchingSrc = "\ndescribe('the describe', () => {\n    test('test 1', () => {});\n    test('test 2', () => {});\n});";
            expect(transform_1.process(noMatchingSrc, 'filename', { rootDir: '.' })).toBe(noMatchingSrc);
        });
        test('with no package', function () {
            var expected = "\n[StoryID('sid')]\n[AutomationID('aid')]\n[CustomTag('ct')]\ndescribe('{storyIds:[\"sid\"],automationIds:[\"aid\"],tags:{}} - the describe', () => {\n    test('test 1', () => {});\n    [StoryID('sid1')]\n    [AutomationID('aid1')]\n    test('{storyIds:[\"sid1\"],automationIds:[\"aid1\"],tags:{}} - test 2', () => {});\n});";
            expect(transform_1.process(src, 'filename', { rootDir: '.' })).toBe(expected);
        });
        test('with package no config', function () {
            var expected = "\n[StoryID('sid')]\n[AutomationID('aid')]\n[CustomTag('ct')]\ndescribe('{storyIds:[\"sid\"],automationIds:[\"aid\"],tags:{}} - the describe', () => {\n    test('test 1', () => {});\n    [StoryID('sid1')]\n    [AutomationID('aid1')]\n    test('{storyIds:[\"sid1\"],automationIds:[\"aid1\"],tags:{}} - test 2', () => {});\n});";
            expect(transform_1.process(src, 'filename', { rootDir: '..' })).toBe(expected);
        });
        test('with package and config', function () {
            pkg.jest = {
                reporters: [['random-reporter'], ['jest-testrail/reporter', { match: "/(\\[(StoryID|AutomationID)\\(['\"][\\s\\S]*?['\"]\\)\\][\\s\\S]*?)+?(test|describe)[\\s\\S]*?\\(['\"][\\s\\S]*?['\"],[\\s\\S]*?\\)/g" }]]
            };
            var expected = "\n[StoryID('sid')]\n[AutomationID('aid')]\n[CustomTag('ct')]\ndescribe('{storyIds:[\"sid\"],automationIds:[\"aid\"],tags:{}} - the describe', () => {\n    test('test 1', () => {});\n    [StoryID('sid1')]\n    [AutomationID('aid1')]\n    test('{storyIds:[\"sid1\"],automationIds:[\"aid1\"],tags:{}} - test 2', () => {});\n});";
            expect(transform_1.process(src, 'filename', { rootDir: '..' })).toBe(expected);
        });
    });
});
//# sourceMappingURL=transform.test.js.map