import { MultilineString, CellMetadata, Rule } from "../utils";

// ASSUMPTION = atoti is "atoti" or "tt"
export const atotiMath: Rule = ({
  source,
  metadata,
  debug,
}): [MultilineString, CellMetadata] => {
  const doAtotiMath = (line: string): string => {
    if (line.includes("atoti.ceil")) {
      debug(`Migrating "atoti.ceil" to "atoti.math.ceil"...`);
      return line.replace(/atoti\.ceil/g, "atoti.math.ceil");
    } else if (line.includes("tt.ceil")) {
      debug(`Migrating "tt.ceil" to "tt.math.ceil"...`);
      return line.replace(/tt\.ceil/g, "tt.math.ceil");
    } else if (line.includes("atoti.min")) {
      debug(`Migrating "atoti.min" to "atoti.math.min"...`);
      return line.replace(/atoti\.min/g, "atoti.math.min");
    } else if (line.includes("tt.min")) {
      debug(`Migrating "tt.min" to "tt.math.min"...`);
      return line.replace(/tt\.min/g, "tt.math.min");
    } else if (line.includes("atoti.max")) {
      debug(`Migrating "atoti.max" to "atoti.math.max"...`);
      return line.replace(/atoti\.max/g, "atoti.math.max");
    } else if (line.includes("tt.max")) {
      debug(`Migrating "tt.max" to "tt.math.max"...`);
      return line.replace(/tt\.max/g, "tt.math.max");
    } else {
      return line;
    }
  };
  if (typeof source === "string") {
    return [doAtotiMath(source), metadata];
  } else {
    return [source.map((sourceLine) => doAtotiMath(sourceLine)), metadata];
  }
};
