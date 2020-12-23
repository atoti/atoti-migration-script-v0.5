#!/usr/bin/env node
import yargs from "yargs";
import { migrate } from "./migrate";

yargs
  .scriptName("atoti-helper")
  .usage("$0 migrate --help")
  .example(
    "$0 migrate --notebooks my-notebook.ipynb",
    "migrate a single notebook and output result in the same folder"
  )
  .example(
    "$0 migrate --notebooks my-notebook.ipynb a-second-notebook.ipynb",
    "migrate two notebooks and output result in the same folder"
  )
  .command(
    "migrate",
    "migrate notebooks from 0.4 to 0.5",
    (yargs) => {
      yargs
        .option("notebooks", {
          type: "array",
          description:
            "A list of space-separated notebook path to migrate",
        });
    },
    migrate
  )
  .demandCommand(1, "")
  .help().argv;
