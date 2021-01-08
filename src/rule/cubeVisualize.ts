import { MultilineString, CellMetadata, Rule } from "../utils";

// ASSUMPTION = atoti cube name is "cube"
// ASSUMPTION = atoti session variable is "session"
export const cubeVisualize: Rule = ({
  source,
  metadata,
  debug,
}): [MultilineString, CellMetadata] => {
  const doCubeVisualize = (line: string): string => {
    if (line.includes("cube.visualize")) {
      debug(`Migrating "cube.visualize" to "session.visualize"...`);
      return line.replace(/[^ \.]*cube\.visualize/g, "session.visualize");
    } else {
      return line;
    }
  };
  if (typeof source === "string") {
    return [doCubeVisualize(source), metadata];
  } else {
    return [source.map((sourceLine) => doCubeVisualize(sourceLine)), metadata];
  }
};
