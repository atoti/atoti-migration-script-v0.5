## atoti migration script

Migrate atoti notebooks from 0.4.3 to 0.5.x

### WIP

This is a work in progress. Feel free to contribute.

Current assumptions:

- atoti session variable is "session"
- atoti cube name is "cube"
- store variable is not redefined
- store ".head()" method is used and all columns are displayed in the output (not too many columns). Otherwise, use the "--hierarchies" option.
- measures are stored in m variable
- any m["XXX.VALUE"] was an automatically created measure from 0.4.3

Current known limitations:

- does not work with pivot table or featured values.

TODO:

- implement tests
- fix the script for pivot table
- add more options to workaround inference assumptions mentioned above

### CLI

```console
> atoti-helper --help
atoti-helper migrate --help

Commands:
  atoti-helper migrate  migrate notebooks from 0.4 to 0.5

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]

Examples:
  atoti-helper migrate --notebooks          migrate a single notebook and output
  my-notebook.ipynb                         result in the same folder
  atoti-helper migrate --notebooks          migrate two notebooks and output
  my-notebook.ipynb                         result in the same folder
  a-second-notebook.ipynb
  atoti-helper migrate --notebooks          migrate a notebook and predefine
  main.ipynb --hierarchies                  some hierarchies for the migration
  Products_store:Products
  Competitor_prices_store:CompetitorName
```

#### migrate

```console
> atoti-helper migrate
atoti-helper migrate

migrate notebooks from 0.4 to 0.5

Options:
  --version      Show version number                                   [boolean]
  --help         Show help                                             [boolean]
  --notebooks    A list of space-separated notebook path to migrate      [array]
  --hierarchies  A list of space-separated dimension:hierarchy           [array]
```
