import {load} from "js-yaml";
import {readFileSync} from "fs";

export default load(readFileSync("Properties.yaml", "utf8"));