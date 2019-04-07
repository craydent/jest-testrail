"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var $c = require('craydent');
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
    var regex = /(\[(StoryID|AutomationID)\(['"][\s\S]*?['"]\)\][\s\S]*?)+?(test|describe)[\s\S]*?\(['"][\s\S]*?['"],[\s\S]*?\)/g;
    var match = $c.tryEval(options.match);
    if ($c.isRegExp(match)) {
        regex = match;
    }
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
    if (options.tags) {
        for (var i = 0, len = options.tags.length; i < len; i++) {
            var tag = options.tags[i];
            if (!/^[_a-zA-Z$][_a-zA-Z0-9$]+$/.test(tag)) {
                continue;
            }
            eval("\n            tags." + tag + " = [];\n            var " + tag + " = function () {\n                for (let i = 0, len = arguments.length; i < len; i++) {\n                    tags." + tag + ".push(arguments[i]);\n                }\n            };");
            reset += "tags." + tag + " = [];";
        }
    }
    for (var i = 0, len = matches.length; i < len; i++) {
        var match = matches[i];
        var attributes = match.match(/(\[[\s\S]*?\])/g);
        for (var j = 0, jlen = attributes.length; j < jlen; j++) {
            try {
                eval(attributes[j]);
            }
            catch (e) { }
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
    var message = match.replace(/[\s\S]*?((test)|(describe))[\s\S]*?\('([\s\S]*?)'[\s\S]*/, '$4');
    var rawStoryIds = $c.parseRaw(storyIds);
    var rawAutomationIds = $c.parseRaw(automationIds);
    var rawTags = $c.parseRaw(tags);
    var replacer = "{storyIds:" + rawStoryIds + ",automationIds:" + rawAutomationIds + ",tags:" + rawTags + "} - " + message;
    var final = match.replace(message, replacer);
    return src.replace(match, final);
}
exports.alterSource = alterSource;
//# sourceMappingURL=transform.js.map