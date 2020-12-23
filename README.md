## atoti migration script

Migrate atoti notebooks from 0.4.3 to 0.5.x

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
```

#### migrate

```console
> atoti-helper migrate
atoti-helper migrate

migrate notebooks from 0.4 to 0.5

Options:
  --version    Show version number                                     [boolean]
  --help       Show help                                               [boolean]
  --notebooks  A list of space-separated notebook path to migrate        [array]
```

### Troubleshoot

N/A
