import _ from "lodash";
import fs from "fs";
import path from "path";

export type Rule = (options: {
  source: MultilineString;
  metadata: CellMetadata;
  outputs: Output[];
  memory: any;
  debug: Function;
}) => [MultilineString, CellMetadata];

export type MigrateOptions = {
  notebooks: { content: any; path: string }[];
  hierarchies: string[];
  debug?: Function;
};

export type MigrateCLIOptions = {
  notebooks: string[];
  hierarchies: string[];
};

export type Notebook = {
  /** Notebook root-level metadata. */
  metadata: NotebookMetadata;

  /** Notebook format (minor number). Incremented for backward compatible changes to the notebook format. */
  nbformat_minor: number;

  /** Notebook format (major number). Incremented between backwards incompatible changes to the notebook format. */
  nbformat: number;

  /** Array of cells of the current notebook. */
  cells: Cell[];
};

type NotebookMetadata = {
  /** Kernel information. */
  kernelspec?: KernelSpec;

  /** Kernel information. */
  language_info?: LanguageInfo;

  /** Original notebook format (major number) before converting the notebook between versions. This should never be written to a file. */
  orig_nbformat?: number;

  /** The title of the notebook document */
  title?: string;

  /** The author(s) of the notebook document */
  authors?: any[];

  /** Extra properties. */
  [key: string]: any;
};

type KernelSpec = {
  /** Name of the kernel specification. */
  name: string;

  /** Name to display in UI. */
  display_name: string;

  /** Extra properties. */
  [key: string]: any;
};

/** Kernel information. */
type LanguageInfo = {
  /** The programming language which this kernel runs. */
  name: string;

  /** The codemirror mode to use for code in this language. */
  codemirror_mode?: string | { [k: string]: any };

  /** The file extension for files in this language. */
  file_extension?: string;

  /** The mimetype corresponding to files in this language. */
  mimetype?: string;

  /** The pygments lexer to use for code in this language. */
  pygments_lexer?: string;

  /** Extra properties. */
  [key: string]: any;
};

// ---------------------- Input (Cell) types ----------------------- //

type Cell = RawCell | MarkdownCell | CodeCell;

enum CellType {
  Raw = "raw",
  Markdown = "markdown",
  Code = "code",
}

type BaseCell = {
  /** String identifying the type of cell. */
  cell_type: CellType;

  /** Cell-level metadata. */
  metadata: CellMetadata;

  /** Contents of the cell, represented as an array of lines. */
  source: MultilineString;
};

/** Notebook raw nbconvert cell. */
interface RawCell extends BaseCell {
  /** String identifying the type of cell. */
  cell_type: CellType.Raw;

  /** Cell-level metadata. */
  metadata: CellMetadata & {
    /** Raw cell metadata format for nbconvert. */
    format?: string;
  };

  /** Media attachments (e.g. inline images), stored as mimebundle keyed by filename. */
  attachments?: MediaAttachments;
}

/** Notebook markdown cell. */
interface MarkdownCell extends BaseCell {
  /** String identifying the type of cell. */
  cell_type: CellType.Markdown;

  /** Media attachments (e.g. inline images), stored as mimebundle keyed by filename. */
  attachments?: MediaAttachments;
}

/** Notebook code cell. */
export interface CodeCell extends BaseCell {
  /** String identifying the type of cell. */
  cell_type: CellType.Code;

  /** Cell-level metadata. */
  metadata: CellMetadata & {
    /** Whether the cell's output is collapsed/expanded. */
    collapsed?: boolean;

    /** Whether the cell's output is scrolled, unscrolled, or autoscrolled. */
    scrolled?: true | false | "auto";
  };

  /** Execution, display, or stream outputs. */
  outputs: Output[];

  /** The code cell's prompt number. Will be null if the cell has not been run. */
  execution_count: number | null;
}

export type CellMetadata = {
  /** Official Jupyter Metadata for Raw Cells */
  jupyter?: { [k: string]: any };

  /**
   * The cell's name. If present, must be a non-empty string. Cell names are expected to be unique
   * across all the cells in a given notebook. This criterion cannot be checked by the json schema
   * and must be established by an additional check.
   */
  name?: string;

  /** The cell's tags. Tags must be unique, and must not contain commas. */
  tags?: string[];

  /** Extra properties. */
  [key: string]: any;
};

type MediaAttachments = {
  /** The attachment's data stored as a mimebundle. */
  [filename: string]: MimeBundle;
};

// ------------------------- Output types ------------------------- //

export type Output = ExecuteResult | DisplayData | StreamOutput | ErrorOutput;

export enum OutputType {
  ExecuteResult = "execute_result",
  DisplayData = "display_data",
  Stream = "stream",
  Error = "error",
}

/** Result of executing a code cell. */
export type ExecuteResult = {
  /** Type of cell output. */
  output_type: OutputType.ExecuteResult;

  /** A result's prompt number. */
  execution_count: number | null;

  /** A mime-type keyed dictionary of data */
  data: MimeBundle;

  /** Cell output metadata. */
  metadata: {
    [k: string]: any;
  };
};

/** Data displayed as a result of code cell execution. */
export type DisplayData = {
  /** Type of cell output. */
  output_type: OutputType.DisplayData;

  /** A mime-type keyed dictionary of data */
  data: MimeBundle;

  /** Cell output metadata. */
  metadata: {
    [k: string]: any;
  };
};

/** Stream output from a code cell. */
type StreamOutput = {
  /** Type of cell output. */
  output_type: OutputType.Stream;

  /** The name of the stream (stdout, stderr). */
  name: string;

  /** The stream's text output, represented as an array of strings. */
  text: MultilineString;
};

/** Output of an error that occurred during code cell execution. */
type ErrorOutput = {
  /** Type of cell output. */
  output_type: OutputType.Error;

  /** The name of the error. */
  ename: string;

  /** The value, or message, of the error. */
  evalue: string;

  /** The error's traceback, represented as an array of strings. */
  traceback: string[];
};

// ------------------------- Misc types ------------------------- //

type MimeBundle = {
  /** mimetype output (e.g. text/plain), represented as either an array of strings or a string. */
  [mediaType: string]: MultilineString;
};

export type MultilineString = string | string[];

type ExportOptions = {
  content: string;
  filePath: string;
};

export const exportData = ({ content, filePath }: ExportOptions) => {
  const parsedPath = path.parse(filePath);

  if (parsedPath.dir) {
    fs.mkdir(parsedPath.dir, { recursive: true }, (err) => {
      if (err) throw err;
    });
  }

  fs.writeFileSync(filePath, content);
};

export const printExtractSummary = ({ notebooks }: { notebooks: string[] }) => {
  console.log(`${notebooks.length} notebook(s) successfully migrated!`);
};
