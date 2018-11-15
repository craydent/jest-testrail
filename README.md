<img src="http://craydent.com/JsonObjectEditor/img/svgs/craydent-logo.svg" width=75 height=75/>

# Jest TestRail
**by Clark Inada**

This module is an extention for Jest and provides a transformer and reporter producing a JSON or xUnit XML file based on attributes defined in comments.
```
    // [StoryID('storyID1', 'storyID2')]
    describe('test group', () => {
        // [StoryID('storyID3')]
        // [StoryID('storyID4')]
        // [AutomationID('autoID1', 'autoID2')]
        test('test case 1', ()=>{
            //...
        });
        // [AutomationID('autoID3')]
        // [AutomationID('autoID4')]
        test('test case 2', ()=>{
            //...
        });
        // [StoryID('storyID5'), StoryID('storyID6')]
        // [AutomationID('autoID5'), AutomationID('autoID6')]
        test('test case 3', ()=>{
            //...
        });
    })
```

#### Usage

```js
// this is the "jest" part of the package.json
{
    "jest":{
        ...otherJestOptions,
        "reporters": [
            ["jest-testrail/reporter",{
                // template file (example given below)
                "template": "<rootDir>/template.xml", // optional template file
                "outputFile": "<rootDir>/results.json" // any file name and type when "template" is defined
            }]
        ],
        "transform": {
            ".*test.*": "jest-testrail/transform"
        }
    }
}
```
```ts
// data object passed to the template
{
    suites: [{
        total: number,
        passed: number,
        failed: number,
        skipped: number,
        name: string,
        time: number,
        tests: [{
            name: string,
            time: number,
            result: string,
            storyId: string,
            automationId: string,
            type: 'UnitTest'
        }]
    }],
    name: string,
    environment: string,
    framework: string,
    date: string, //today's date in Y-m-d format
    runtime: string,
    config: any, //globalConfig object passed to the Reporter
    options: any, //options object passed to the Reporter
    total: number,
    passed: number,
    failed: number,
    skipped: number,
    time: number,
    errors: number
}
```
```xml
<!-- example xUnit xml template-->
<?xml version="1.0" encoding="utf-8"?>
<assemblies>
 <assembly name="SomeName" run-date="${date}" run-time="${runtime}" total="${total}" passed="${passed}" failed="${failed}" skipped="${skipped}" time="time" errors="0">
   <errors />
   ${FOREACH ${suite} in ${suites}}
     <collection total="${suite.total}" passed="${suite.passed}" failed="${suite.failed}" skipped="${suite.skipped}" name="${suite.name}" time="${suite.time}">
       ${FOREACH ${test} in ${suite.tests}}
       <test name="${test.name}" time="${test.time}" result="${test.result}" sid="${test.storyId}" aid="${test.automationId}" type="${test.type}">
         <traits>
           ${if ('${test.storyId}')}<trait name="StoryID" value="${test.storyId}" />${end if}
           ${if ('${test.automationId}'')}<trait name="TestID" value="${test.automationId}" />${end if}
           ${if ('${test.type}')}<trait name="TestType" value="${test.type}" />${end if}
         </traits>
       </test>
       ${END FOREACH}
     </collection>
   ${END FOREACH}
 </assembly>
</assemblies>
```

## Download

 * [GitHub](https://github.com/cinada/jest-testrails)
 * [BitBucket](https://bitbucket.org/cinada/jest-testrails)
 * [GitLab](https://gitlab.com/cinada/jest-testrails)

Jest TestRail is released under the [licensed under the MIT license].