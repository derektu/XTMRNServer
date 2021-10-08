"use strict"

const fs = require('fs');
const _ = require('lodash');

class SymbolSvc {

  constructor() {
    this._symbolNames = {};
  }

  init(idnameFile) {
    this._symbolNames = {};
    let data = fs.readFileSync(idnameFile, {encoding:'utf-8'});
    let lines = data.split('\n');

    _.each(lines, (line)=> {
      let fields = line.split(',');
      if (fields.length != 2)
        return;

      let id = fields[0].trim();
      let name = fields[1].trim();
      if (id && name) 
        this._symbolNames[id] = name;
    })
  }

  getName(id) {
    let name = this._symbolNames[id];
    return name || id;
  }
}

module.exports = SymbolSvc;