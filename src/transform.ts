import { Options } from "../models/TestResult";
import { GlobalConfig } from "@jest/types/build/Config";

const $c = require('craydent');
const defaultRegex = /(\[(StoryID|AutomationID)\(['`"][\s\S]*?['`"]\)\][\s\S]*?)+?(test|it|describe)[\s\S]*?\(['`"][\s\S]*?['`"],[\s\S]*?\)/g;
const messageRegex = /[\s\S]*?((test)|(it)|(describe))[\s\S]*?\(['`"]([\s\S]*?)['`"][\s\S]*/;
interface AlterSourceArg {
    src: string;
    match: string;
    storyIds: string[];
    automationIds: string[];
    tags: Object;
}

export function process(src: string, filename: string, config: GlobalConfig) {
    let options: Options = {};
    let pkg = $c.include(`${config.rootDir}/package.json`);
    if (pkg) {
        let reporters = $c.get(pkg, 'jest.reporters') || [];
        for (let i = 0, len = reporters.length; i < len; i++) {
            if (reporters[i][0] == 'jest-testrail/reporter') {
                options = reporters[i][1];
                break;
            }
        }
    }
    const match = $c.tryEval(options.match);
    const regex = $c.isRegExp(match) ? match : defaultRegex;
    let matches = src.match(regex) || [];
    return processMatches(src, matches, options);
};
export function processMatches(src: string, matches: string[], options: Options) {
    let storyIds = [];
    let automationIds = [];
    const StoryID = function () {
        for (let i = 0, len = arguments.length; i < len; i++) {
            storyIds.push(arguments[i]);
        }
    };
    const AutomationID = function () {
        for (let i = 0, len = arguments.length; i < len; i++) {
            automationIds.push(arguments[i]);
        }
    };

    // custom tags
    let reset = "";
    let tags = {};
    let tagMethodStr = "";
    let tagMethods = {};
    if (options.tags) {
        for (let i = 0, len = options.tags.length; i < len; i++) {
            let tag = options.tags[i];
            if (!/^[_a-zA-Z$][_a-zA-Z0-9$]+$/.test(tag)) {
                continue;
            }
            tagMethodStr += `
            tags.${tag} = [];
            tagMethods.${tag} = function () {
                for (let i = 0, len = arguments.length; i < len; i++) {
                    tags.${tag}.push(arguments[i]);
                }
            };`;
            reset += `tags.${tag} = [];`
        }
    }
    tagMethodStr && eval(tagMethodStr);

    for (let i = 0, len = matches.length; i < len; i++) {
        const match = matches[i];
        const attributes = match.match(/(\[[\s\S]*?\])/g);
        for (let j = 0, jlen = attributes.length; j < jlen; j++) {
            try { eval(attributes[j]); } catch (e) {
                if (options.tags) {
                    try {
                        var attr = attributes[j];
                        for (let i = 0, len = options.tags.length; i < len; i++) {
                            let tag = options.tags[i];
                            attr = attr.replace(new RegExp(`${tag}\\s*?\\(`, 'g'), `tagMethods.${tag}\(`);
                        }
                        eval(attr);
                    } catch (e) { }
                }
            }
        }

        src = alterSource({ src, match, storyIds, automationIds, tags });
        storyIds = [];
        automationIds = [];
        if (reset) {
            eval(reset);
        }
    }
    return src;
}
export function alterSource(params: AlterSourceArg) {
    const { src, match, storyIds, automationIds, tags } = params;
    const message = match.replace(messageRegex, '$5');
    const rawStoryIds = $c.parseRaw(storyIds);
    const rawAutomationIds = $c.parseRaw(automationIds);
    const rawTags = $c.parseRaw(tags);
    const replacer = `{storyIds:${rawStoryIds},automationIds:${rawAutomationIds},tags:${rawTags}} - ${message}`;
    const final = match.replace(message, replacer);
    return src.replace(match, final);
}

