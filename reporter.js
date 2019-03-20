const fs = require('fs');
const $c = require('craydent');
const RED = '\x1b[31m%s\x1b[0m';
const GREEN = '\x1b[32m%s\x1b[0m';
const YELLOW = '\x1b[33m%s\x1b[0m';
class Reporter {
    constructor(globalConfig, options) {
        this.testResults = {
            suites: [],
            name: '',
            environment: '',
            framework: '',
            date: $c.format($c.now(), 'Y-m-d'),
            runtime: '',
            config: globalConfig,
            options: options || {},
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            time: 0.0,
            errors: 0
        };
        let hooksPath = (this.testResults.options.hooks || '').replace('<rootDir>', globalConfig.rootDir);
        let hooks = $c.include(hooksPath);
        options.hooks = hooks || {}
    }

    onTestResult(test, testResult, aggregatedResult) {
        let suiteGroups = {};
        let options = this.testResults.options;
        for (let i = 0, len = testResult.testResults.length; i < len; i++) {
            const result = testResult.testResults[i];
            this.testResults.time += result.duration;
            const group = $c
                .last(result.ancestorTitles)
                .replace(/\{.*?(\}\s-\s)/g, '');
            let { tests, suiteGroup } = this._getSuiteGroupAndTests(
                result,
                suiteGroups[group]
            );
            suiteGroups[group] = suiteGroup;
            let metaObjects = (result.fullName.match(/\{.*?(\}\s)/g) || []).map(x =>
                $c.tryEval(x)
            );

            if (!metaObjects.length) {
                continue;
            }
            let test = {
                name: result.title.replace(/\{.*?(\}\s-\s)/g, ''),
                time: result.duration,
                result: result.status,
                storyId: '',
                automationId: '',
                tags: {},
                type: 'UnitTest'
            };

            for (let j = 0, jlen = metaObjects.length; j < jlen; j++) {
                let storyIds = metaObjects[j].storyIds || [];
                let automationIds = metaObjects[j].automationIds || [];
                test.tags = metaObjects[j].tags || {};
                if (storyIds.length && automationIds.length) {
                    for (let k = 0, klen = storyIds.length; k < klen; k++) {
                        for (let l = 0, llen = automationIds.length; l < llen; l++) {
                            let newTest = this._getTest(
                                tests,
                                test,
                                storyIds[k],
                                automationIds[l]
                            );
                            if (!newTest) {
                                continue;
                            }
                            tests.push(newTest);
                        }
                    }
                } else if (storyIds.length) {
                    for (let l = 0, llen = storyIds.length; l < llen; l++) {
                        let newTest = this._getTest(tests, test, storyIds[l]);
                        if (!newTest) {
                            continue;
                        }
                        tests.push(newTest);
                    }
                } else if (automationIds.length) {
                    for (let l = 0, llen = automationIds.length; l < llen; l++) {
                        let newTest = this._getTest(tests, test, null, automationIds[l]);
                        if (!newTest) {
                            continue;
                        }
                        tests.push(newTest);
                    }
                }
            }
        }
        this._addSuitesToResults(suiteGroups);

        if ($c.get(options, 'hooks.onTestResult')) {
            try {
                let groups = [];
                for (let name in suiteGroups) {
                    const suiteGroup = suiteGroups[name];
                    groups.push(suiteGroup);
                }
                options.hooks.onTestResult(groups, this.testResults);
            } catch (e) {
                console.log(RED, e);
            }
        }
    }
    onRunComplete(contexts, results) {
        let config = this.testResults.config;
        let options = this.testResults.options;
        let templatePath = (options.template || "").replace('<rootDir>', config.rootDir);
        let path = (options.outputFile || '<rootDir>/results.json').replace('<rootDir>', config.rootDir);

        this.testResults.runtime = $c.now().getTime() - results.startTime;
        if ($c.get(options, 'hooks.onRunComplete')) {
            try {
                options.hooks.onRunComplete(this.testResults);
            } catch (e) {
                console.log(RED, e);
            }
        } else {
            try {
                let dir = require('path').dirname(path);
                fs.mkdirSync(dir, { recursive: true });
            } catch(e){
                if (e.code !== 'EEXIST') {
                    throw e;
                }
            }
            if (!templatePath) {
                this._writeToJSON(path);
            } else {
                this._writeToFile(templatePath, path);
            }
        }
    }

    _addSuitesToResults(suiteGroups) {
        for (let name in suiteGroups) {
            const suiteGroup = suiteGroups[name];
            if (!suiteGroup.tests.length) {
                continue;
            }
            const suite = {
                total: suiteGroup.total,
                passed: suiteGroup.passed,
                failed: suiteGroup.failed,
                skipped: suiteGroup.pending,
                name: name,
                time: suiteGroup.time,
                tests: suiteGroup.tests
            };

            this.testResults.suites.push(suite);
        }
    }
    _getSuiteGroupAndTests(result, suiteGroup) {
        suiteGroup = suiteGroup || {
            tests: [],
            total: 0,
            passed: 0,
            failed: 0,
            pending: 0,
            time: 0
        };
        suiteGroup.time += result.duration;
        suiteGroup[result.status] += 1;
        suiteGroup.total += 1;
        return { suiteGroup, tests: suiteGroup.tests };
    }
    _getTest(tests, test, storyId, automationId) {
        let obj = tests.find(x => x.storyId == storyId);
        if (obj) {
            if (test.result === 'failed' || obj.result === 'failed') {
                obj.result = 'failed';
            } else {
                obj.result = test.result;
            }
            return;
        }
        let newTest = { ...test };
        if (storyId) {
            newTest.storyId = storyId;
        }
        if (automationId) {
            newTest.automationId = automationId;
        }
        return newTest;
    }
    _writeToFile(templatePath, path) {
        const template = fs.readFileSync(templatePath, 'utf8');
        const content = $c
            .fillTemplate(template, this.testResults)
            .replace_all('\n', '');
        fs.writeFileSync(path, content);
    }
    _writeToJSON(path) {
        const fs = require('fs');
        fs.writeFileSync(path, JSON.stringify(this.testResults, null, 2));
    }
}

module.exports = Reporter;