const Crawler = require('crawler');
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
const Handlebars = require('handlebars');
const moment = require('moment');
const templateSrc = fs.readFileSync('./template.html', 'utf8');

const url = 'mongodb://localhost:27017';

var c = new Crawler({
  rateLimit: 3000,
  maxConnections: 1,
  callback: (error, res, done) => {
    if(error) {
      console.log(error);
    }else{
      var $ = res.$;
      let flats = [];
      const entries = $('.short_advert');
      entries.each((i, entry) => {
        if($(entry).hasClass('topplatzierte')) return;
        const $link = $(entry).find('.text_content_title h2 a');
        let foo = {};
        foo.title = $link.text().substr(2).trim();
        foo.link = $link.attr('href');
        foo._id = makeHash(foo.title);
        flats.push(foo);
      });

      MongoClient.connect(url, function (err, client) {
        console.log('Connected to server. Flats: ' + flats.length);

        const timestamp = new Date();
        const formattedTimestamp = moment().format('MMMM Do YYYY, h:mm:ss a');
        const db = client.db('flats');
        flats.forEach((flat) => {
          db.collection('ronorp').update(
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

        const flatColl = db.collection('ronorp');
        flatColl.find({}).sort({timestamp: -1}).toArray((err, docs) => {
          if(!docs) return;
          // let d = docs.reverse();
          writeHtml(docs);
        });
        
        client.close();
      });
    }
    done();
  }
});

function writeHtml(docs) {
  if(!docs) return;
  let template = Handlebars.compile(templateSrc);
  let now = moment().format('MMMM Do YYYY, h:mm:ss a');
  let result = template({
    docs: docs,
    updateTime: now
  });
  fs.writeFile('index.html', result, (err) => {
    if(err) return console.log(err);
    console.log('HTML written');
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

// c.queue('https://www.ronorp.net/zuerich/immobilien/wohnung-zuerich.1219');
c.queue('https://www.ronorp.net/zuerich/immobilien/wohnung-zuerich.1219?hash=7e27305410eb19bd251d207da800cf29&fdata%5Brons_filter%5D=&cmd=update&record_id=&fdata%5Badvert_type%5D=angebot&fdata%5Bsp_realty_type%5D=rent&fdata%5Bsp_realty_stadt_agglo%5D=stadt&fdata%5Bsp_realty_contract_limited%5D=N&fdata%5Bplz%5D=&fdata%5Bsp_realty_plz%5D=&page=1&adverts_filter=1&fdata%5Bsearch%5D=');

const dbName = 'flats';

