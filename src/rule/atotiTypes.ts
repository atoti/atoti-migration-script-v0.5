import { MultilineString, CellMetadata, Rule } from "../utils";

// ASSUMPTION = atoti is "atoti" or "tt"
export const atotiTypes: Rule = ({
  source,
  metadata,
  debug,
}): [MultilineString, CellMetadata] => {
  const doAtotiTypes = (line: string): string => {
    if (line.includes("atoti.types")) {
      debug(`Migrating "atoti.types" to "atoti.type"...`);
      return line
        .replace(/atoti\.types/g, "atoti.type")
        .replace(/atoti\.type\.INT_PYTHON_LIST/g, "atoti.type.PYTHON_INT_LIST")
        .replace(/atoti\.type\.DOUBLE_NULLABLE/g, "atoti.type.NULLABLE_DOUBLE");
    } else if (line.includes("tt.types")) {
      debug(`Migrating "tt.types" to "tt.type"...`);
      return line
        .replace(/tt\.types/g, "tt.type")
        .replace(/tt\.type\.INT_PYTHON_LIST/g, "tt.type.PYTHON_INT_LIST")
        .replace(/tt\.type\.DOUBLE_NULLABLE/g, "tt.type.NULLABLE_DOUBLE");
    } else {
      return line;
    }
  };
  if (typeof source === "string") {
    return [doAtotiTypes(source), metadata];
  } else {
    return [source.map((sourceLine) => doAtotiTypes(sourceLine)), metadata];
  }
};
