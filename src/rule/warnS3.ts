import { MultilineString, CellMetadata, Rule } from "../utils";

export const warnS3: Rule = ({
  source,
  metadata,
  debug,
}): [MultilineString, CellMetadata] => {
  const doWarnS3 = (line: string) => {
    if (line.includes("s3://")) {
      debug(`Please install the plugin atoti-aws`);
    }
  };
  if (typeof source === "string") {
    doWarnS3(source);
  } else {
    source.forEach((sourceLine) => doWarnS3(sourceLine));
  }

  return [source, metadata];
};
