import * as fs from "fs";
import * as $c from "craydent";
import { TestResult as Result, Options } from "../models/TestResult";
import { Test as RTest, SuiteGroup } from "../models/Suite";
import { BaseReporter } from "@jest/reporters";
import { AggregatedResult, TestResult, AssertionResult } from '@jest/test-result';
import { Test } from "@jest/reporters/build/types";
import { GlobalConfig } from "@jest/types/build/Config";

const RED = "\x1b[31m%s\x1b[0m";
const GREEN = "\x1b[32m%s\x1b[0m";
const YELLOW = "\x1b[33m%s\x1b[0m";

export default class JestReporter extends BaseReporter {
  public testResults: Result;
  constructor(globalConfig: GlobalConfig, options: Options = {} as Options) {
    super();
    this.testResults = {
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
    let hooksPath = ($c.get(this, 'testResults.options.hooks') || "").replace(
      "<rootDir>",
      globalConfig.rootDir
    );

    options.hooks = hooksPath ? $c.include(hooksPath) : {};
  }

  onTestResult(test: Test, testResult: TestResult, aggregatedResult: AggregatedResult) {
    let suiteGroups = {};
    let options = this.testResults.options;
    for (let i = 0, len = testResult.testResults.length; i < len; i++) {
      const result = testResult.testResults[i];
      this.testResults.time += result.duration;

      const group = $c
        .last(result.ancestorTitles)
        .replace(/\{.*?(\}\s-\s)/g, "");
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
      let test: RTest = {
        name: result.title.replace(/\{.*?(\}\s-\s)/g, ""),
        time: result.duration,
        result: result.status,
        storyId: "",
        automationId: "",
        tags: {},
        type: "UnitTest"
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
        } else {
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

    if ($c.get(options, "hooks.onTestResult")) {
      try {
        let groups: SuiteGroup[] = [];
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
    let templatePath = (options.template || "").replace(
      "<rootDir>",
      config.rootDir
    );
    let path = (options.outputFile || "<rootDir>/results.json").replace(
      "<rootDir>",
      config.rootDir
    );

    this.testResults.runtime = $c.now().getTime() - results.startTime;
    if ($c.get(options, "hooks.onRunComplete")) {
      try {
        options.hooks.onRunComplete(this.testResults);
      } catch (e) {
        console.log(RED, e);
      }
    } else {
      try {
        let dir = require("path").dirname(path);
        fs.mkdirSync(dir, { recursive: true });
      } catch (e) {
        if (e.code !== "EEXIST") {
          throw e;
        }
      }
      if (!templatePath) {
        return this._writeToJSON(path);
      }
      this._writeToFile(templatePath, path);
    }
  }

  _addSuitesToResults(suiteGroups) {
    for (let name in suiteGroups) {
      const suiteGroup: SuiteGroup = suiteGroups[name];
      if (!suiteGroup.tests.length) {
        continue;
      }
      const suite: SuiteGroup = {
        total: suiteGroup.total,
        passed: suiteGroup.passed,
        failed: suiteGroup.failed,
        pending: suiteGroup.pending,
        skipped: suiteGroup.pending,
        name: name,
        time: suiteGroup.time,
        tests: suiteGroup.tests
      };

      this.testResults.suites.push(suite);
    }
  }
  _getSuiteGroupAndTests(result: AssertionResult, suiteGroup: SuiteGroup) {
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
    return { suiteGroup, tests: suiteGroup.tests };
  }
  _getTest(tests: RTest[], test: RTest, storyId?: string, automationId?: string) {
    storyId = storyId || '';
    automationId = automationId || ''
    let obj = tests.find(
      x => x.storyId == storyId && x.automationId == automationId
    );
    if (obj && !(storyId == '' && automationId == '')) {
      if (test.result === "failed" || obj.result === "failed") {
        obj.result = "failed";
      } else {
        obj.result = test.result;
      }

      obj.time += test.time;
      return;

    }

    let newTest = { ...test, storyId, automationId };

    return newTest;
  }
  _writeToFile(templatePath: string, path: string) {
    const template = fs.readFileSync(templatePath, "utf8");
    const content = $c
      .fillTemplate(template, this.testResults)
      .replace_all("\n", "");
    fs.writeFileSync(path, content);
  }
  _writeToJSON(path: string) {
    fs.writeFileSync(path, JSON.stringify(this.testResults, null, 2));
  }
}
