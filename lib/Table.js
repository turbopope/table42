const _ = require('lodash');

class Table {
  constructor(defaultValue = 0, title = '') {
    this._rows = new Set();
    this._cols = new Set();
    this._data = new Map();
    this._default = defaultValue;
    this._title = title;
  }

  static key(row, col) {
    return JSON.stringify({ row: row, col: col });
  }

  set(row, col, data) {
    this._data.set(Table.key(row, col), data);
    this._rows.add(row);
    this._cols.add(col);
  }

  setOrAdd(row, col, data) {
    if (this.has(row, col)) {
      let prev = this.get(row, col);
      let now = prev + data;
      this.set(row, col, now);
    } else {
      this.set(row, col, data);
    }
  }

  get(row, col) {
    if (this.has(row, col)) {
      return this._data.get(Table.key(row, col));
    } else if (this._rows.has(row) && this._cols.has(col)) {
      return this._default;
    } else {
      return undefined;
    }
  }

  getRow(row) {
    if (!this._rows.has(row)) return undefined;
    const result = [];
    for (let col of this._cols) {
      result.push(this.get(row, col));
    }
    return result;
  }

  getCol(col) {
    if (!this._cols.has(col)) return undefined;
    const result = [];
    for (let row of this._rows) {
      result.push(this.get(row, col));
    }
    return result;
  }

  has(row, col) {
    let key = Table.key(row, col);
    return this._data.has(key);
  }

  ensureHasRow(row) {
    this._rows.add(row);
  }

  ensureHasCol(col) {
    this._cols.add(col);
  }

  remove(row, col) {
    const key = Table.key(row, col);
    this._data.delete(key);

    let colEmpty = true;
    for (let r of this._rows) {
      if (this.has(r, col)) {
        colEmpty = false;
        break;
      }
    }
    if (colEmpty) {
      this._cols.delete(col);
    }

    let rowEmpty = true;
    for (let c of this._cols) {
      if (this.has(row, c)) {
        rowEmpty = false;
        break;
      }
    }
    if (rowEmpty) {
      this._rows.delete(row);
    }
  }

  removeRow(row) {
    for (let c of this._cols) {
      this.remove(row, c);
    }
  }

  removeCol(col) {
    for (let r of this._rows) {
      this.remove(r, col);
    }
  }

  toCSV() {
    let csv = `${this._title},` + Array.from(this._cols).join(',') + "\n"; // Head
    for (let row of this._rows) {
      csv = csv.concat(row.replace(',', ''));
      for (let col of this._cols.values()) {
        csv = csv.concat(',' + JSON.stringify(this.get(row, col)).replace(',', ''));
      }
      csv = csv.concat("\n");
    }
    return csv;
  }

  static parse(csv, overwrite = true) {
    csv = csv.trim();
    let rows = csv.split("\n");
    rows = rows.map(row => { return row.split(','); })
    let headers = rows[0];
    const result = new Table(0, headers[0]);

    for (let r = 1; r < rows.length; r++) {
      let cells = rows[r];
      if (cells.length != headers.length) {
        throw new Error(`Row ${r}'s length (${cells.length}) is unequal to the header's length (${headers.length}).`);
      }
      let row_header = cells[0];
      for (let c = 1; c < headers.length; c++) {
        let cell = parseInt(cells[c]);
        if (cell === NaN) throw new Error(`Cell ${r},${c} = ${cells[c]} is not a number.`)
        if (overwrite) {
          result.set(row_header, headers[c], cell);
        } else {
          result.setOrAdd(row_header, headers[c], cell);
        }
      }
    }

    return result;
  }

  static parseJSON(json, row_key_key) {
    const rows = JSON.parse(json);
    const table = new Table(undefined, row_key_key);
    for (let row of rows) {
      const row_key = row[row_key_key];
      delete row[row_key_key];
      for (let col in row) {
        const val = row[col];
        table.set(row_key, col, val);
      }
    }
    return table;
  }

  rowsDescending(red) {
    return _.sortBy(Array.from(this._rows), [ row => { return red(this.getRow(row)); }]).reverse();
  }

  sortRowsDescending(red) {
    this._rows = new Set(this.rowsDescending(red));
  }
}

module.exports = Table;
