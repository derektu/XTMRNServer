"use strict"

const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');
const _ = require('lodash');
const moment = require('moment');
const fetch = require('node-fetch');
const DOMParser = require('xmldom').DOMParser;
const logger = require('./logger').getLogger('[API]');

class API {

    constructor(symbolSvc) {
      this.dataFileFolder = path.resolve(__dirname + '/../mockdata/getfile');
      this.dataSvcFolder = path.resolve(__dirname + '/../mockdata/callsvc');

      this.symbolSvc = symbolSvc;
    }

    getRouter() {
        var router = express.Router();
        router.get('/getfile', (req, res)=> this.getFile(req, res));
        router.get('/callsvc', (req, res)=> this.callSvc(req, res));
        router.get('/rtquote', (req, res)=> this.rtQuote(req, res));
        return router;
    }    

    // getfile?file=<filename>
    //
    // 讀取data-getfile底下的<filename>回傳
    //
    getFile(req, res) {
        //
        // 
        let filename = req.query.file;
        let fullpath = path.join(this.dataFileFolder, filename);
        if (!fs.existsSync(fullpath))
            throw `Filename does not exists:${filename}`;
        
        fs.readFile(fullpath, (err, data)=> {
            if (err) {
                throw err;
            }
            else {
                // res.setHeader('Content-disposition', `attachment; filename=${filename}`);
                res.setHeader('Content-type', "application/octet-stream");
                res.send(data);
            }
        })                
    }

    // callsvc?op=<...>&..
    //
    // 讀取data-getsvc/'op'.json檔案回傳
    //
    callSvc(req, res) {
        let filename = req.query.op + '.json';
        let fullpath = path.join(this.dataSvcFolder, filename);
        if (!fs.existsSync(fullpath))
            throw `Filename does not exists:${filename}`;
        
        fs.readFile(fullpath, (err, data)=> {
            if (err) {
                throw err;
            }
            else {
                let obj = JSON.parse(data);
                res.json(obj);
            }
        })                
    }

    // rtquote?id=2330,2301,2303,..
    //
    // 呼叫RT server, 回傳 [ {id:'2330', name:'..', .. }, { } ]
    //
    rtQuote(req, res) {
        let ids = req.query.id.split(',');
        ids = _.map(ids, (id)=> id + ',1');
        let url = `http://192.168.173.16/v1.jdxt?x=1&a=${ids.join(';')}`;

        fetch(url)
          .then((res)=> {
            if (!res.ok) {
              throw `Call RT return error. code=${res.status} text=${res.statusText}`;
            }

            return res.text();
          })
          .then((text) => {
            return this._parseQuoteXML(text);
          })
          .then((data)=> {
            res.json(data);
          })
    }

    _parseQuoteXML(text) {
      let doc = new DOMParser().parseFromString(text);

      let nodes = doc.documentElement.getElementsByTagName("Data");
      let idx;
      let symbols = [];

      for (idx = 0; idx < nodes.length; idx++) {
        let node = nodes.item(idx);
        let id = node.getAttribute("id");

        let symbol = {
          id,
          name: this.symbolSvc.getName(id),
          date: this._getNumberField(node, "Date"),
          time: this._getNumberField(node, "T"),
          ref: this._getPriceField(node, "PC"),
          open: this._getPriceField(node, "O"),
          high: this._getPriceField(node, "H"),
          low: this._getPriceField(node, "L"),
          close: this._getPriceField(node, "P"),
          ulimit: this._getPriceField(node, "U"),
          dlimit: this._getPriceField(node, "D"),
          tickvolume: this._getNumberField(node, "V"),
          volume: this._getNumberField(node, "TV"),
          bid: this._getPriceField(node, "B"),
          ask: this._getPriceField(node, "A"),
          bidsize: this._getNumberField(node, "BS"),
          asksize: this._getNumberField(node, "AS"),
        }
        
        symbols.push(symbol);
      }
      return symbols;
    }

    _getNumberField(node, tag) {
      let text = node.getAttribute(tag) || '';
      if (!text)
        return 0;
      else
        return parseInt(text);
    }

    _getPriceField(node, tag) {
      let text = node.getAttribute(tag) || '';
      if (!text)
        return 0;
      else 
        return parseInt(text) / 100.0;  
    }
}

module.exports = API;