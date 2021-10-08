"use strict"

const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');
const _ = require('lodash');
const moment = require('moment');
const logger = require('./logger').getLogger('[API]');

class API {

    constructor() {
      this.dataFileFolder = path.resolve(__dirname + '/../mockdata/getfile');
      this.dataSvcFolder = path.resolve(__dirname + '/../mockdata/callsvc');
    }

    getRouter() {
        var router = express.Router();
        router.get('/getfile', (req, res)=> this.getFile(req, res));
        router.get('/callsvc', (req, res)=> this.callSvc(req, res));
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
                res.setHeader('Content-disposition', `attachment; filename=${filename}`);
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
}

module.exports = API;