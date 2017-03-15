const assert = require('chai').assert;
const Table = require('../lib/Table');

describe('Table', function() {

  let table;
  beforeEach(function() {
    table = new Table();
  })

  describe('#get()', function() {
    it('should get the date after setting it', function() {
      table.set('r', 'c', 1);
      assert.equal(1, table.get('r', 'c'));
    });
    it('should get the default if the cell is empty', function() {
      table.set('r1', 'c1', 11);
      table.set('r1', 'c2', 12);
      table.set('r2', 'c1', 21);
      assert.equal(0, table.get('r2', 'c2'));
    });
    it('should get undefined if the cell does not exist', function() {
      assert.equal(undefined, table.get('r', 'c'));
    });
  });

  describe('#has()', function() {
    it('should return true if it has the date', function() {
      table.set('r', 'c', 1);
      assert.isTrue(table.has('r', 'c'));
    });
    it('should return false if it does not have the date', function() {
      assert.isFalse(table.has('r', 'c'));
    });
  });

  describe('#setOrAdd()', function() {
    it('should set the date if new', function() {
      table.setOrAdd('r', 'c', 1);
      assert.equal(1, table.get('r', 'c'));
    });
    it('should sum the dates if the date already exists', function() {
      table.setOrAdd('r', 'c', 1);
      table.setOrAdd('r', 'c', 1);
      assert.equal(2, table.get('r', 'c'));
    });
  });

  describe('#ensureHasRow()', function() {
    it('should set the date if new', function() {
      table.set('r1', 'c', 1);
      table.ensureHasRow('r2');
      assert.equal(0, table.get('r2', 'c'));
    });
  });

  describe('#ensureHasCol()', function() {
    it('should set the date if new', function() {
      table.set('r', 'c1', 1);
      table.ensureHasCol('c2');
      assert.equal(0, table.get('r', 'c2'));
    });
  });

  describe('#csv()', function() {
    it('should produce the expected CSV string (one date)', function() {
      table.set('r', 'c', 1);
      assert.equal(
        ",c\nr,1\n",
        table.toCSV()
      );
    });
    it('should produce the expected CSV string (multiple dates with default)', function() {
      table.set('r1', 'c1', 1);
      table.set('r2', 'c2', 2);
      assert.equal(
        ",c1,c2\nr1,1,0\nr2,0,2\n",
        table.toCSV()
      );
    });
    it('should print the title in the first cell if given', function() {
      table = new Table(0, "title")
      table.set('r', 'c', 1);
      assert.equal(
        "title,c\nr,1\n",
        table.toCSV()
      );
    });
    it('should default to the given default value', function() {
      table = new Table(2)
      table.ensureHasRow('r');
      table.ensureHasCol('c');
      assert.equal(
        ",c\nr,2\n",
        table.toCSV()
      );
    });
  });

  describe('#parse()', function() {
    it('should parse CSV strings', function() {
      const csv = ",c1,c2\nr1,11,12\nr2,21,22\n"
      const table = Table.parse(csv);
      assert.equal(11, table.get('r1', 'c1'));
      assert.equal(12, table.get('r1', 'c2'));
      assert.equal(21, table.get('r2', 'c1'));
      assert.equal(22, table.get('r2', 'c2'));
    });
    it('should parse the title', function() {
      const csv = "title,c1,c2\nr1,11,12\nr2,21,22\n"
      const table = Table.parse(csv);
      assert.equal('title', table._title);
    });
    it('should throw if a column has less cells than the header', function() {
      const csv = "title,c1,c2\nr1,11,12\nr2,21\n"
      assert.throws(function(){ Table.parse(csv) }, Error);
    });
    it('should throw if a column has more cells than the header', function() {
      const csv = "title,c1,c2\nr1,11,12\nr2,21,22,23\n"
      assert.throws(function(){ Table.parse(csv) }, Error);
    });
    it('should throw if a cell contains anything else than a number', function() {
      const csv = "title,c1,c2\nr1,ggg,12\nr2,21,22,23\n"
      assert.throws(function(){ Table.parse(csv) }, Error);
    });
  });

  describe('#parseJSON()', function() {
    it('should parse JSON strings', function() {
      const csv = '[{"r": "r1","c1":11,"c2":12},{"r":"r2","c1":21,"c2":22}]';
      const table = Table.parseJSON(csv, 'r');
      assert.equal(11, table.get('r1', 'c1'));
      assert.equal(12, table.get('r1', 'c2'));
      assert.equal(21, table.get('r2', 'c1'));
      assert.equal(22, table.get('r2', 'c2'));
    });
  });

  describe('#rowsDescending()', function() {
    it('should sort simple tables in descending order', function() {
      table.set('r1', 'c', 1);
      table.set('r2', 'c', 3);
      table.set('r3', 'c', 2);
      const summarizeRow = row => { return row.reduce((acc, val) => acc + val, 0); }
      assert.deepEqual(['r2', 'r3', 'r1'], table.rowsDescending(summarizeRow));
    });
    it('should sort complex tables in descending order', function() {
      table.set('r1', 'c1', 1);
      table.set('r1', 'c2', 1);
      table.set('r1', 'c3', 1);
      table.set('r2', 'c1', 3);
      table.set('r2', 'c2', 3);
      table.set('r2', 'c3', 3);
      table.set('r3', 'c1', 2);
      table.set('r3', 'c2', 2);
      table.set('r3', 'c3', 2);
      const summarizeRow = row => { return row.reduce((acc, val) => acc + val, 0); }
      assert.deepEqual(['r2', 'r3', 'r1'], table.rowsDescending(summarizeRow));
    });
  });

  describe('#sortRowsDescending()', function() {
    it('should sort simple tables in descending order', function() {
      table.set('r1', 'c', 1);
      table.set('r2', 'c', 3);
      table.set('r3', 'c', 2);
      const summarizeRow = row => { return row.reduce((acc, val) => acc + val, 0); }
      table.sortRowsDescending(summarizeRow);
      assert.deepEqual(['r2', 'r3', 'r1'], Array.from(table._rows));
    });
    it('should sort complex tables in descending order', function() {
      table.set('r1', 'c1', 1);
      table.set('r1', 'c2', 1);
      table.set('r1', 'c3', 1);
      table.set('r2', 'c1', 3);
      table.set('r2', 'c2', 3);
      table.set('r2', 'c3', 3);
      table.set('r3', 'c1', 2);
      table.set('r3', 'c2', 2);
      table.set('r3', 'c3', 2);
      const summarizeRow = row => { return row.reduce((acc, val) => acc + val, 0); }
      table.sortRowsDescending(summarizeRow);
      assert.deepEqual(['r2', 'r3', 'r1'], Array.from(table._rows));
    });
  });

  describe('#getCol()', function() {
    it('should return the requested column', function() {
      table.set('r1', 'c', 1);
      table.set('r2', 'c', 2);
      table.set('r3', 'c', 3);
      assert.deepEqual([1, 2, 3], table.getCol('c'));
    });
  });

  describe('#getRow()', function() {
    it('should return the requested row', function() {
      table.set('r', 'c1', 1);
      table.set('r', 'c2', 2);
      table.set('r', 'c3', 3);
      assert.deepEqual([1, 2, 3], table.getRow('r'));
    });
  });

  describe('#remove()', function() {
    it('should return the default value after removing the requested cell', function() {
      table.set('r1', 'c1', 11);
      table.set('r1', 'c2', 12);
      table.set('r2', 'c1', 21);
      table.set('r2', 'c2', 22);
      table.remove('r1', 'c1');
      assert.equal(0, table.get('r1', 'c1'));
    });
    it('should preserve other cells', function() {
      table.set('r1', 'c1', 11);
      table.set('r2', 'c2', 22);
      table.set('r3', 'c3', 33);
      table.remove('r2', 'c2');
      assert.equal(11, table.get('r1', 'c1'));
      assert.equal(33, table.get('r3', 'c3'));
    });
    it('should remove the col key if it was the last cell in that col', function() {
      table.set('r1', 'c1', 11);
      table.set('r2', 'c2', 22);
      table.set('r3', 'c3', 33);
      table.remove('r2', 'c2');
      assert.notInclude(Array.from(table._cols), 'c2');
    });
    it('should remove the row key if it was the last cell in that row', function() {
      table.set('r1', 'c1', 11);
      table.set('r2', 'c2', 22);
      table.set('r3', 'c3', 33);
      table.remove('r2', 'c2');
      assert.notInclude(Array.from(table._rows), 'r2');
    });
    it('should revert to undefined if the cell was the last cell in that col', function() {
      table.set('r1', 'c1', 11);
      table.set('r1', 'c2', 22);
      table.set('r2', 'c1', 33);
      table.remove('r1', 'c2');
      assert.isUndefined(table.get('r1', 'c2'));
    });
    it('should revert to undefined if the cell was the last cell in that row', function() {
      table.set('r1', 'c1', 11);
      table.set('r1', 'c2', 22);
      table.set('r2', 'c1', 33);
      table.remove('r2', 'c1');
      assert.isUndefined(table.get('r2', 'c1'));
    });
  });

  describe('#removeCol()', function() {
    it('should remove the requested column', function() {
      table.set('r1', 'c', 1);
      table.set('r2', 'c', 2);
      table.removeCol('c');
      assert.isUndefined(table.getCol('c'));
      assert.isUndefined(table.get('r1', 'c'));
      assert.isUndefined(table.get('r2', 'c'));
      assert.notInclude('c', table._cols);
    });
    it('should preserve other cells', function() {
      table.set('r1', 'c1', 11);
      table.set('r2', 'c2', 22);
      table.set('r3', 'c3', 33);
      table.removeCol('c2');
      assert.equal(11, table.get('r1', 'c1'));
      assert.equal(33, table.get('r3', 'c3'));
    });
  });

  describe('#removeRow()', function() {
    it('should remove the requested row', function() {
      table.set('r', 'c1', 1);
      table.set('r', 'c2', 2);
      table.removeRow('r');
      assert.isUndefined(table.getRow('r'));
      assert.isUndefined(table.get('r', 'c1'));
      assert.isUndefined(table.get('r', 'c2'));
      assert.notInclude('r', table._rows);
    });
    it('should preserve other cells', function() {
      table.set('r1', 'c1', 11);
      table.set('r2', 'c2', 22);
      table.set('r3', 'c3', 33);
      table.removeRow('r');
      assert.equal(11, table.get('r1', 'c1'));
      assert.equal(33, table.get('r3', 'c3'));
    });
  });
});
