import {
  MultilineString,
  CellMetadata,
  Rule,
  ExecuteResult,
  OutputType,
} from "../utils";
import _ from "lodash";

// ASSUMPTION = store  ".head()" method is used and all columns are displayed in the output (not too many columns)
export const extractStoreLevels: Rule = ({
  source,
  metadata,
  outputs,
  memory,
  debug,
}): [MultilineString, CellMetadata] => {
  if (memory.level2Hierarchy === undefined) {
    memory.level2Hierarchy = {};
  }

  const doExtractStoreLevels = (line: string) => {
    _.forEach(memory.storeVar2Name, (storeName, storeVariable) => {
      const headRegex = new RegExp(_.escapeRegExp(`${storeVariable}.head()`));

      if (headRegex.test(line)) {
        debug(`${storeName} HEAD FOUND!`);

        const execResults = outputs.filter(
          (output) => output.output_type === OutputType.ExecuteResult
        ) as ExecuteResult[];

        execResults.forEach((execResult) => {
          const html = execResult.data["text/html"] as string[];

          if (html) {
            const headStart = html.findIndex((v) => v.includes("<thead>"));
            const headEnd = html.findIndex((v) => v.includes("</thead>"));

            const relevantHtml = html.slice(headStart, headEnd);

            const levels = relevantHtml
              .map((th) => {
                const thRegex = /<th>(.+)<\/th>/g;
                const result = thRegex.exec(th);
                return result && result[1];
              })
              .filter((level) => level !== null);
            levels.forEach((lvl) => {
              memory.level2Hierarchy[lvl] = storeName;
            });
          }
        });
      }
    });
  };
  if (typeof source === "string") {
    doExtractStoreLevels(source);
  } else {
    source.forEach((sourceLine) => doExtractStoreLevels(sourceLine));
  }

  return [source, metadata];
};
