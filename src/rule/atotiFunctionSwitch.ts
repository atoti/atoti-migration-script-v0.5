import { MultilineString, CellMetadata, Rule } from "../utils";

// ASSUMPTION = atoti is "atoti" or "tt"
export const atotiFunctionSwitch: Rule = ({
  source,
  metadata,
  debug,
}): [MultilineString, CellMetadata] => {
  const doFunctionSwitch = (line: string): string => {
    if (line.includes("atoti.agg.single_value")) {
      debug(`Migrating "atoti.agg.single_value" to "atoti.agg._single_value"...`);
      return line.replace(/atoti\.agg\.single_value/g, "atoti.agg._single_value");
    } else if (line.includes("tt.agg.single_value")) {
      debug(`Migrating "tt.agg.single_value" to "tt.agg._single_value"...`);
      return line.replace(/tt\.agg\.single_value/g, "tt.agg._single_value");
    } else if (line.includes("tt.agg.stop")) {
      debug(`Migrating "tt.agg.stop" to "tt.agg._stop"...`);
      return line.replace(/tt\.agg\.stop/g, "tt.agg._stop");
    } else {
      return line;
    }
  };
  if (typeof source === "string") {
    return [doFunctionSwitch(source), metadata];
  } else {
    return [source.map((sourceLine) => doFunctionSwitch(sourceLine)), metadata];
  }
};
