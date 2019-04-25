"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var $c = require('craydent');
var RED = "\x1b[31m%s\x1b[0m";
var GREEN = "\x1b[32m%s\x1b[0m";
var YELLOW = "\x1b[33m%s\x1b[0m";
var defaultRegex = /(\[(StoryID|AutomationID)\(['`"][\s\S]*?['`"]\)\][\s\S]*?)+?(test|it|describe)[\s\S]*?\(['`"][\s\S]*?['`"],[\s\S]*?\)/g;
var messageRegex = /[\s\S]*?((test)|(it)|(describe))[\s\S]*?\(['`"]([\s\S]*?)['`"][\s\S]*/;
function process(src, filename, config) {
    var options = {};
    var pkg = $c.include(config.rootDir + "/package.json");
    if (pkg) {
        var reporters = $c.get(pkg, 'jest.reporters') || [];
        for (var i = 0, len = reporters.length; i < len; i++) {
            if (reporters[i][0] == 'jest-testrail/reporter') {
                options = reporters[i][1];
                break;
            }
        }
    }
    var match = $c.tryEval(options.match);
    var regex = $c.isRegExp(match) ? match : defaultRegex;
    var matches = src.match(regex) || [];
    return processMatches(src, matches, options);
}
exports.process = process;
;
function processMatches(src, matches, options) {
    var storyIds = [];
    var automationIds = [];
    var StoryID = function () {
        for (var i = 0, len = arguments.length; i < len; i++) {
            storyIds.push(arguments[i]);
        }
    };
    var AutomationID = function () {
        for (var i = 0, len = arguments.length; i < len; i++) {
            automationIds.push(arguments[i]);
        }
    };
    var reset = "";
    var tags = {};
    var tagMethodStr = "";
    var tagMethods = {};
    if (options.tags) {
        for (var i = 0, len = options.tags.length; i < len; i++) {
            var tag = options.tags[i];
            if (!/^[_a-zA-Z$][_a-zA-Z0-9$]+$/.test(tag)) {
                continue;
            }
            tagMethodStr += "\n            tags." + tag + " = [];\n            tagMethod." + tag + " = function () {\n                for (let i = 0, len = arguments.length; i < len; i++) {\n                    tags." + tag + ".push(arguments[i]);\n                }\n            };";
            reset += "tags." + tag + " = [];";
        }
    }
    tagMethodStr && eval(tagMethodStr);
    for (var i = 0, len = matches.length; i < len; i++) {
        var match = matches[i];
        var attributes = match.match(/(\[[\s\S]*?\])/g);
        for (var j = 0, jlen = attributes.length; j < jlen; j++) {
            try {
                eval(attributes[j]);
            }
            catch (e) {
                try {
                    var attr = attributes[j];
                    for (var i_1 = 0, len_1 = options.tags.length; i_1 < len_1; i_1++) {
                        var tag = options.tags[i_1];
                        attr = attr.replace(new RegExp(tag + "\\s*?\\(", 'g'), "tagMethods." + tag + "(");
                    }
                    eval(attr);
                }
                catch (e) {
                    console.log(YELLOW, e);
                }
            }
        }
        src = alterSource({ src: src, match: match, storyIds: storyIds, automationIds: automationIds, tags: tags });
        storyIds = [];
        automationIds = [];
        if (reset) {
            eval(reset);
        }
    }
    return src;
}
exports.processMatches = processMatches;
function alterSource(params) {
    var src = params.src, match = params.match, storyIds = params.storyIds, automationIds = params.automationIds, tags = params.tags;
    var message = match.replace(messageRegex, '$5');
    var rawStoryIds = $c.parseRaw(storyIds);
    var rawAutomationIds = $c.parseRaw(automationIds);
    var rawTags = $c.parseRaw(tags);
    var replacer = "{storyIds:" + rawStoryIds + ",automationIds:" + rawAutomationIds + ",tags:" + rawTags + "} - " + message;
    var final = match.replace(message, replacer);
    return src.replace(match, final);
}
exports.alterSource = alterSource;
//# sourceMappingURL=transform.js.map