const Crawler = require('crawler');
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
const Handlebars = require('handlebars');
const moment = require('moment');
const ronorp = require('./ronorp');
const tutti = require('./tutti');
const homegate = require('./homegate');
const templateSrc = fs.readFileSync('template.html', 'utf8');

const modules = [ronorp, tutti, homegate];
const flatDocs = [];

const url = 'mongodb://localhost:27017';

var c = new Crawler({
  maxConnections: 10,
  callback: (error, res, done) => {
    if(error) {
      console.log(error);
    }
    done();
  }
});

let count = 0;

modules.forEach(module => {
  console.log(module);
  c.queue([{
    uri: module.uri,
    callback: (err, res, done) => {
      var $ = res.$;
      let flats = module.parse($, makeHash);
      console.log('Module: ' + module.db + ', Flats found: ' + flats.length);

      MongoClient.connect(url, (err, client) => {

        const timestamp = new Date();
        const formattedTimestamp = moment().format('MMMM Do YYYY, HH:mm');
        const db = client.db('flats');
        flats.forEach((flat) => {
        db.collection(module.db).update(
          { _id: flat._id },
            {
            $set: {
              title: flat.title,
              link: flat.link
            },
            $setOnInsert: {
              timestamp: timestamp,
              formattedTimestamp: formattedTimestamp
            }
          },
          {
            upsert: true
          },
            (err, res) => {
              if(err) throw err;
            }
          )
        });

        const flatColl = db.collection(module.db);
        flatColl.find().sort({timestamp: -1}).limit(30).toArray((err, docs) => {
          console.log(docs.length);
          flatDocs.push({
            title: module.db,
            flats: docs
          });
          count++;
          if(count == modules.length) {
            writeHtml(client);
          }
        });
        
      });
    }
  }]);
});


function writeHtml(client) {
  if (!flatDocs) return;
  let template = Handlebars.compile(templateSrc);
  let now = moment().format('MMMM Do YYYY, HH:mm');
  let result = template({
    docs: flatDocs,
    updateTime: now
  });
  fs.writeFile('index.html', result, (err) => {
    if(err) return console.log(err);
    console.log('HTML written');
    client.close(() => {
      console.log('DB Closed');
      process.exit();
    });
  })
}

function makeHash(string) {
  var hash = 0, i, chr;
  if (string.length === 0) return hash;
  for (i = 0; i < string.length; i++) {
    chr = string.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}
