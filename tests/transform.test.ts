import * as $c from "craydent";
import { processMatches, alterSource, process } from '../src/transform'
import { GlobalConfig } from "@jest/types/build/Config";

const src = `
[StoryID('sid')]
[AutomationID('aid')]
[CustomTag('ct')]
describe('the describe', () => {
    test('test 1', () => {});
    [StoryID('sid1')]
    [AutomationID('aid1')]
    test('test 2', () => {});
    [StoryID('sid2')]
    [AutomationID('aid2')]
    it('test 3', () => {});
});`
const srcWithTickQuote = `
[StoryID('sid')]
[AutomationID('aid')]
[CustomTag('ct')]
describe(\`the describe\`, () => {
    test('test 1', () => {});
    [StoryID('sid1')]
    [AutomationID('aid1')]
    test(\`test 2\`, () => {});
});`

const matches = [
    "[StoryID('sid')]\n[AutomationID('aid')]\n[CustomTag('ct')]\ndescribe('the describe', ()",
    "[StoryID('sid1')]\n    [AutomationID('aid1')]\n    test('test 2', ()",
    "[StoryID('sid2')]\n    [AutomationID('aid2')]\n    it('test 3', ()"
];
describe('JestTransformer', () => {
    const storyIds = ['sid'],
        automationIds = ['aid'];
    describe('alterSource', () => {
        const match = matches[0];

        test('without tags', () => {
            const expected = `
[StoryID('sid')]
[AutomationID('aid')]
[CustomTag('ct')]
describe('{storyIds:["sid"],automationIds:["aid"],tags:{}} - the describe', () => {
    test('test 1', () => {});
    [StoryID('sid1')]
    [AutomationID('aid1')]
    test('test 2', () => {});
    [StoryID('sid2')]
    [AutomationID('aid2')]
    it('test 3', () => {});
});`;
            expect(alterSource({ src, match, storyIds, automationIds, tags: {} })).toEqual(expected);
        });
        test('with it method', () => {
            const expected = `
[StoryID('sid')]
[AutomationID('aid')]
[CustomTag('ct')]
describe('the describe', () => {
    test('test 1', () => {});
    [StoryID('sid1')]
    [AutomationID('aid1')]
    test('test 2', () => {});
    [StoryID('sid2')]
    [AutomationID('aid2')]
    it('{storyIds:["sid2"],automationIds:["aid2"],tags:{}} - test 3', () => {});
});`;
            expect(alterSource({ src, match: matches[2], storyIds: ['sid2'], automationIds: ['aid2'], tags: {} })).toEqual(expected);
        });
        test('with tags', () => {
            const tags = { CustomTag: ['ct', 'ct2'], CustomTag2: ['c2', 'c22'] };
            const expected = `
[StoryID('sid')]
[AutomationID('aid')]
[CustomTag('ct')]
describe('{storyIds:["sid"],automationIds:["aid"],tags:{"CustomTag": ["ct","ct2"],"CustomTag2": ["c2","c22"]}} - the describe', () => {
    test('test 1', () => {});
    [StoryID('sid1')]
    [AutomationID('aid1')]
    test('test 2', () => {});
    [StoryID('sid2')]
    [AutomationID('aid2')]
    it('test 3', () => {});
});`
            expect(alterSource({ src, match, storyIds, automationIds, tags })).toEqual(expected);
        });
    });
    describe('processMatches', () => {
        test('without tags', () => {
            const expected = `
[StoryID('sid')]
[AutomationID('aid')]
[CustomTag('ct')]
describe('{storyIds:["sid"],automationIds:["aid"],tags:{}} - the describe', () => {
    test('test 1', () => {});
    [StoryID('sid1')]
    [AutomationID('aid1')]
    test('{storyIds:["sid1"],automationIds:["aid1"],tags:{}} - test 2', () => {});
    [StoryID('sid2')]
    [AutomationID('aid2')]
    it('{storyIds:["sid2"],automationIds:["aid2"],tags:{}} - test 3', () => {});
});`;
            expect(processMatches(src, matches, {})).toBe(expected);
        });
        test('with tags not matching', () => {
            const expected = `
[StoryID('sid')]
[AutomationID('aid')]
[CustomTag('ct')]
describe('{storyIds:["sid"],automationIds:["aid"],tags:{"CustomTag1": [],"CustomTag2": []}} - the describe', () => {
    test('test 1', () => {});
    [StoryID('sid1')]
    [AutomationID('aid1')]
    test('{storyIds:["sid1"],automationIds:["aid1"],tags:{"CustomTag1": [],"CustomTag2": []}} - test 2', () => {});
    [StoryID('sid2')]
    [AutomationID('aid2')]
    it('{storyIds:["sid2"],automationIds:["aid2"],tags:{"CustomTag1": [],"CustomTag2": []}} - test 3', () => {});
});`
            expect(processMatches(src, matches, { tags: ["CustomTag1", "CustomTag2", "8989"] })).toBe(expected);
        });
        test('with tags matching', () => {
            const ctMatch = [
                "[StoryID('sid')]\n[AutomationID('aid')]\n[CustomTag('ct')]\ndescribe('the describe', ()",
                "[StoryID('sid1')]\n    [AutomationID('aid1')]\n    test('test 2', ()",
                "[StoryID('sid2')]\n    [AutomationID('aid2')]\n    it('test 3', ()"
            ];
            const expected = `
[StoryID('sid')]
[AutomationID('aid')]
[CustomTag('ct')]
describe('{storyIds:["sid"],automationIds:["aid"],tags:{"CustomTag": ["ct"],"CustomTag2": []}} - the describe', () => {
    test('test 1', () => {});
    [StoryID('sid1')]
    [AutomationID('aid1')]
    test('{storyIds:["sid1"],automationIds:["aid1"],tags:{"CustomTag": [],"CustomTag2": []}} - test 2', () => {});
    [StoryID('sid2')]
    [AutomationID('aid2')]
    it('{storyIds:["sid2"],automationIds:["aid2"],tags:{"CustomTag": [],"CustomTag2": []}} - test 3', () => {});
});`
            expect(processMatches(src, ctMatch, { tags: ["CustomTag", "CustomTag2", "8989"] })).toBe(expected);
        });
    });
    describe('process', () => {
        jest.mock('../package.json');
        const pkg = require('../package.json');
        beforeEach(() => {
            delete pkg.jest;
        });

        test('with no matching', () => {
            const noMatchingSrc = `
describe('the describe', () => {
    test('test 1', () => {});
    test('test 2', () => {});
});`
            expect(process(noMatchingSrc, 'filename', { rootDir: '.' } as GlobalConfig)).toBe(noMatchingSrc);

        });
        test('with no package', () => {
            const expected = `
[StoryID('sid')]
[AutomationID('aid')]
[CustomTag('ct')]
describe('{storyIds:["sid"],automationIds:["aid"],tags:{}} - the describe', () => {
    test('test 1', () => {});
    [StoryID('sid1')]
    [AutomationID('aid1')]
    test('{storyIds:["sid1"],automationIds:["aid1"],tags:{}} - test 2', () => {});
    [StoryID('sid2')]
    [AutomationID('aid2')]
    it('{storyIds:["sid2"],automationIds:["aid2"],tags:{}} - test 3', () => {});
});`
            expect(process(src, 'filename', { rootDir: '.' } as GlobalConfig)).toBe(expected);

        });
        test('with package no config', () => {
            const expected = `
[StoryID('sid')]
[AutomationID('aid')]
[CustomTag('ct')]
describe('{storyIds:["sid"],automationIds:["aid"],tags:{}} - the describe', () => {
    test('test 1', () => {});
    [StoryID('sid1')]
    [AutomationID('aid1')]
    test('{storyIds:["sid1"],automationIds:["aid1"],tags:{}} - test 2', () => {});
    [StoryID('sid2')]
    [AutomationID('aid2')]
    it('{storyIds:["sid2"],automationIds:["aid2"],tags:{}} - test 3', () => {});
});`
            expect(process(src, 'filename', { rootDir: '..' } as GlobalConfig)).toBe(expected);

        });
        test('with `` in the description/tests', () => {
            const expected = `
[StoryID('sid')]
[AutomationID('aid')]
[CustomTag('ct')]
describe(\`{storyIds:["sid"],automationIds:["aid"],tags:{}} - the describe\`, () => {
    test('test 1', () => {});
    [StoryID('sid1')]
    [AutomationID('aid1')]
    test(\`{storyIds:["sid1"],automationIds:["aid1"],tags:{}} - test 2\`, () => {});
});`
            expect(process(srcWithTickQuote, 'filename', { rootDir: '..' } as GlobalConfig)).toBe(expected);

        });
        test('with package and config', () => {
            pkg.jest = {
                reporters: [['random-reporter'], ['jest-testrail/reporter', { match: `/(\\[(StoryID|AutomationID)\\(['\`"][\\s\\S]*?['\`"]\\)\\][\\s\\S]*?)+?(test|it|describe)[\\s\\S]*?\\(['\`"][\\s\\S]*?['\`"],[\\s\\S]*?\\)/g` }]]
            };
            const expected = `
[StoryID('sid')]
[AutomationID('aid')]
[CustomTag('ct')]
describe('{storyIds:["sid"],automationIds:["aid"],tags:{}} - the describe', () => {
    test('test 1', () => {});
    [StoryID('sid1')]
    [AutomationID('aid1')]
    test('{storyIds:["sid1"],automationIds:["aid1"],tags:{}} - test 2', () => {});
    [StoryID('sid2')]
    [AutomationID('aid2')]
    it('{storyIds:["sid2"],automationIds:["aid2"],tags:{}} - test 3', () => {});
});`
            expect(process(src, 'filename', { rootDir: '..' } as GlobalConfig)).toBe(expected);

        });
    })
});