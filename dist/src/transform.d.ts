import { Options } from "../models/TestResult";
import { GlobalConfig } from "@jest/types/build/Config";
interface AlterSourceArg {
    src: string;
    match: string;
    storyIds: string[];
    automationIds: string[];
    tags: Object;
}
export declare function process(src: string, filename: string, config: GlobalConfig): string;
export declare function processMatches(src: string, matches: string[], options: Options): string;
export declare function alterSource(params: AlterSourceArg): string;
export {};
