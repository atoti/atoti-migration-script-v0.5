import { MultilineString, CellMetadata, Rule } from "../utils";
import { migrateChart } from "../ui/migrateChart";
import { migrateTable } from "../ui/migrateTable";
import _ from "lodash";

export const uiWidget: Rule = ({
  source,
  metadata,
  memory,
  debug,
}): [MultilineString, CellMetadata] => {
  if (metadata.atoti && metadata.atoti.state) {
    let widget = metadata.atoti.state;

    if (widget.value && widget.value.containerKey === "chart") {
      debug(`Migrating chart state...`);
      widget = migrateChart(widget);
    } else if (widget.value && widget.value.containerKey === "pivot-table") {
      debug(`Migrating pivot table state...`);
      widget = migrateTable(widget);
    } else {
      debug(`Migrating widget metadata to new format...`);
    }

    // Migrating MDX
    widget = _.cloneDeepWith(widget, (value) => {
      if (typeof value === "string") {
        const hierarchyRegex = /\[Hierarchies\]\.\[([^\.]+)\]/g;
        return value.replace(
          hierarchyRegex,
          (match, p1, offset, input_string) => {
            if (memory.level2Hierarchy[p1]) {
              return `[${memory.level2Hierarchy[p1]}].[${p1}]`;
            } else {
              throw new Error(
                `Could not find dimension for hierarchy ${p1}. Add it in the script arguments`
              );
            }
          }
        );
      }
    });

    return [source, Object.assign({}, metadata, { atoti: { widget } })];
  } else {
    return [source, metadata];
  }
};
