"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var $c = require("craydent");
var reporters_1 = require("@jest/reporters");
var RED = "\x1b[31m%s\x1b[0m";
var GREEN = "\x1b[32m%s\x1b[0m";
var YELLOW = "\x1b[33m%s\x1b[0m";
var JestReporter = (function (_super) {
    __extends(JestReporter, _super);
    function JestReporter(globalConfig, options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        _this.testResults = {
            suites: [],
            name: "",
            environment: "",
            framework: "",
            date: $c.format($c.now(), "Y-m-d"),
            runtime: 0,
            config: globalConfig,
            options: options,
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            time: 0.0,
            errors: 0
        };
        var hooksPath = ($c.get(_this, 'testResults.options.hooks') || "").replace("<rootDir>", globalConfig.rootDir);
        options.hooks = hooksPath ? $c.include(hooksPath) : {};
        return _this;
    }
    JestReporter.prototype.onTestResult = function (test, testResult, aggregatedResult) {
        var suiteGroups = {};
        var options = this.testResults.options;
        for (var i = 0, len = testResult.testResults.length; i < len; i++) {
            var result = testResult.testResults[i];
            this.testResults.time += result.duration;
            var group = $c
                .last(result.ancestorTitles)
                .replace(/\{.*?(\}\s-\s)/g, "");
            var _a = this._getSuiteGroupAndTests(result, suiteGroups[group]), tests = _a.tests, suiteGroup = _a.suiteGroup;
            suiteGroups[group] = suiteGroup;
            var metaObjects = (result.fullName.match(/\{.*?(\}\s)/g) || []).map(function (x) {
                return $c.tryEval(x);
            });
            if (!metaObjects.length) {
                continue;
            }
            var test_1 = {
                name: result.title.replace(/\{.*?(\}\s-\s)/g, ""),
                time: result.duration,
                result: result.status,
                storyId: "",
                automationId: "",
                tags: {},
                type: "UnitTest"
            };
            for (var j = 0, jlen = metaObjects.length; j < jlen; j++) {
                var storyIds = metaObjects[j].storyIds || [];
                var automationIds = metaObjects[j].automationIds || [];
                test_1.tags = metaObjects[j].tags || {};
                if (storyIds.length && automationIds.length) {
                    for (var k = 0, klen = storyIds.length; k < klen; k++) {
                        for (var l = 0, llen = automationIds.length; l < llen; l++) {
                            var newTest = this._getTest(tests, test_1, storyIds[k], automationIds[l]);
                            if (!newTest) {
                                continue;
                            }
                            tests.push(newTest);
                        }
                    }
                }
                else if (storyIds.length) {
                    for (var l = 0, llen = storyIds.length; l < llen; l++) {
                        var newTest = this._getTest(tests, test_1, storyIds[l]);
                        if (!newTest) {
                            continue;
                        }
                        tests.push(newTest);
                    }
                }
                else {
                    for (var l = 0, llen = automationIds.length; l < llen; l++) {
                        var newTest = this._getTest(tests, test_1, null, automationIds[l]);
                        if (!newTest) {
                            continue;
                        }
                        tests.push(newTest);
                    }
                }
            }
        }
        this._addSuitesToResults(suiteGroups);
        if ($c.get(options, "hooks.onTestResult")) {
            try {
                var groups = [];
                for (var name_1 in suiteGroups) {
                    var suiteGroup = suiteGroups[name_1];
                    groups.push(suiteGroup);
                }
                options.hooks.onTestResult(groups, this.testResults);
            }
            catch (e) {
                console.log(RED, e);
            }
        }
    };
    JestReporter.prototype.onRunComplete = function (contexts, results) {
        var config = this.testResults.config;
        var options = this.testResults.options;
        var templatePath = (options.template || "").replace("<rootDir>", config.rootDir);
        var path = (options.outputFile || "<rootDir>/results.json").replace("<rootDir>", config.rootDir);
        this.testResults.runtime = $c.now().getTime() - results.startTime;
        if ($c.get(options, "hooks.onRunComplete")) {
            try {
                options.hooks.onRunComplete(this.testResults);
            }
            catch (e) {
                console.log(RED, e);
            }
        }
        else {
            try {
                var dir = require("path").dirname(path);
                fs.mkdirSync(dir, { recursive: true });
            }
            catch (e) {
                if (e.code !== "EEXIST") {
                    throw e;
                }
            }
            if (!templatePath) {
                return this._writeToJSON(path);
            }
            this._writeToFile(templatePath, path);
        }
    };
    JestReporter.prototype._addSuitesToResults = function (suiteGroups) {
        for (var name_2 in suiteGroups) {
            var suiteGroup = suiteGroups[name_2];
            if (!suiteGroup.tests.length) {
                continue;
            }
            var suite = {
                total: suiteGroup.total,
                passed: suiteGroup.passed,
                failed: suiteGroup.failed,
                pending: suiteGroup.pending,
                skipped: suiteGroup.pending,
                name: name_2,
                time: suiteGroup.time,
                tests: suiteGroup.tests
            };
            this.testResults.suites.push(suite);
        }
    };
    JestReporter.prototype._getSuiteGroupAndTests = function (result, suiteGroup) {
        suiteGroup = suiteGroup || {
            name: "",
            tests: [],
            total: 0,
            passed: 0,
            failed: 0,
            pending: 0,
            skipped: 0,
            time: 0
        };
        suiteGroup.time += result.duration;
        suiteGroup[result.status] += 1;
        suiteGroup.total += 1;
        return { suiteGroup: suiteGroup, tests: suiteGroup.tests };
    };
    JestReporter.prototype._getTest = function (tests, test, storyId, automationId) {
        storyId = storyId || '';
        automationId = automationId || '';
        var obj = tests.find(function (x) { return x.storyId == storyId && x.automationId == automationId; });
        if (obj && !(storyId == '' && automationId == '')) {
            if (test.result === "failed" || obj.result === "failed") {
                obj.result = "failed";
            }
            else {
                obj.result = test.result;
            }
            obj.time += test.time;
            return;
        }
        var newTest = __assign({}, test, { storyId: storyId, automationId: automationId });
        return newTest;
    };
    JestReporter.prototype._writeToFile = function (templatePath, path) {
        var template = fs.readFileSync(templatePath, "utf8");
        var content = $c
            .fillTemplate(template, this.testResults)
            .replace_all("\n", "");
        fs.writeFileSync(path, content);
    };
    JestReporter.prototype._writeToJSON = function (path) {
        fs.writeFileSync(path, JSON.stringify(this.testResults, null, 2));
    };
    return JestReporter;
}(reporters_1.BaseReporter));
exports.default = JestReporter;
//# sourceMappingURL=reporter.js.map