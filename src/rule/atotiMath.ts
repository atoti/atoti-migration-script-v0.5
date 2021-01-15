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
    } else if (line.includes("atoti.abs")) {
      debug(`Migrating "atoti.abs" to "atoti.math.abs"...`);
      return line.replace(/atoti\.abs/g, "atoti.math.abs");
    } else if (line.includes("tt.abs")) {
      debug(`Migrating "tt.abs" to "tt.math.abs"...`);
      return line.replace(/tt\.abs/g, "tt.math.abs");
    } else if (line.includes("atoti.exp")) {
      debug(`Migrating "atoti.exp" to "atoti.math.exp"...`);
      return line.replace(/atoti\.exp/g, "atoti.math.exp");
    } else if (line.includes("tt.exp")) {
      debug(`Migrating "tt.exp" to "tt.math.exp"...`);
      return line.replace(/tt\.exp/g, "tt.math.exp");
    } else if (line.includes("atoti.sqrt")) {
      debug(`Migrating "atoti.sqrt" to "atoti.math.sqrt"...`);
      return line.replace(/atoti\.sqrt/g, "atoti.math.sqrt");
    } else if (line.includes("tt.sqrt")) {
      debug(`Migrating "tt.sqrt" to "tt.math.sqrt"...`);
      return line.replace(/tt\.sqrt/g, "tt.math.sqrt");
    } else if (line.includes("atoti.log")) {
      debug(`Migrating "atoti.log" to "atoti.math.log"...`);
      return line.replace(/atoti\.log/g, "atoti.math.log");
    } else if (line.includes("tt.log")) {
      debug(`Migrating "tt.log" to "tt.math.log"...`);
      return line.replace(/tt\.log/g, "tt.math.log");
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
