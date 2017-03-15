# table42

> Table For Two -- Two-dimensional HashMap/Table datastructure

A `Table` is like a [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map), except you use key-pairs to access your data. Empty fields in the `Table` return a default value. Example:

```JavaScript
const Table = require('table42');
let timesheet = new Table();

timesheet.set('Jan', 1, 8.0);
timesheet.set('Jan', 2, 4.5);
timesheet.set('Feb', 1, 7.0);

timesheet.get('Jan', 1); // => 8
timesheet.get('Jan', 2); // => 4.5
timesheet.get('Feb', 1); // => 7
timesheet.get('Feb', 2); // => 0 // default
```

Run tests with `npm test`. This is just the byproduct of an other project of mine. Feel free to open issues or send PRs on GitHub. There are probably a million things that still need some love, but the basic functionality is there.

Note that this was designed for string keys and numerical values. Other types may or may not work.

[Guava has a similar datastructure](https://github.com/google/guava/wiki/NewCollectionTypesExplained#table).

## Features

Sum values if record exists:

```JavaScript
timesheet.set('Jan', 1, 8.0);
timesheet.get('Jan', 1); // => 8
timesheet.setOrAdd('Jan', 1, 2.0);
timesheet.get('Jan', 1); // => 10
```

CSV Export:

```JavaScript
timesheet.toCSV(); // => ',1,2\nJan,8,4.5\nFeb,7,0\n'
```

Parse CSV:

```JavaScript
timesheet = Table.parse(',1,2\nJan,8,4.5\nFeb,7,0\n');
timesheet.get('Jan', 1); // => 8
timesheet.get('Jan', 2); // => 4.5
timesheet.get('Feb', 1); // => 7
timesheet.get('Feb', 2); // => 0
```

Parse JSON:

```JavaScript
let data = [
  {"r": "Jan", "1": 8, "2": 4.5},
  {"r": "Feb", "1": 7, "2": 0}
];
timesheet = Table.parseJSON(JSON.stringify(data), 'r');
timesheet.get('Jan', "1"); // => 8
timesheet.get('Jan', "2"); // => 4.5
timesheet.get('Feb', "1"); // => 7
timesheet.get('Feb', "2"); // => 0
```

Sort rows of `Table` in place according to a row reduce function:

```JavaScript
table.set('r2', 'c1', 2);
table.set('r2', 'c2', 2);
table.set('r3', 'c1', 3);
table.set('r3', 'c2', 3);
table.set('r1', 'c1', 1);
table.set('r1', 'c2', 1);
table._rows; // => ['r2', 'r3', 'r1'];
function summarizeRow(row) {
  return row.reduce((acc, val) => acc + val, 0);
}
table.sortRowsDescending(summarizeRow);
table._rows; // => ['r3', 'r2', 'r1'];
```
