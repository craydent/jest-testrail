let $c = require('craydent');
module.exports = {
    process(src, filename, config, options) {
        let matches =
            src.match(
                /(\[(StoryID|AutomationID)\(['"][\s\S]*?['"]\)\][\s\S]*?)+?(test|describe)[\s\S]*?\(['"][\s\S]*?['"],[\s\S]*?\)/g
            ) || [];

        return processMatches(src, matches);
    }
};
function processMatches(src, matches) {
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
    for (let i = 0, len = matches.length; i < len; i++) {
        const match = matches[i];
        const attributes = match.match(/(\[[\s\S]*?\])/g);
        for (let j = 0, jlen = attributes.length; j < jlen; j++) {
            eval(attributes[j]);
        }

        src = alterSource({ src, match, storyIds, automationIds });
        storyIds = [];
        automationIds = [];
    }
    return src;
}
function alterSource(params) {
    const { src, match, storyIds, automationIds } = params;
    const message = match.replace(
        /[\s\S]*?((test)|(describe))[\s\S]*?\('([\s\S]*?)'[\s\S]*/,
        '$4'
    );
    const rawStoryIds = $c.parseRaw(storyIds);
    const rawAutomationIds = $c.parseRaw(automationIds);
    const replacer = `{storyIds:${rawStoryIds},automationIds:${rawAutomationIds}} - ${message}`;
    const final = match.replace(message, replacer);
    return src.replace(match, final);
}
