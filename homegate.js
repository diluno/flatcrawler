module.exports = {
  db: 'homegate',
  uri: 'https://www.homegate.ch/mieten/immobilien/plz/trefferliste?ag=1000&ah=2000&ac=2&ad=3.5&tab=list&o=sortToplisting-desc&ao=8003,8004,8005,8006,8002,8057',
  parse: ($, makeHash) => {
    let flats = [];
    const entries = $('.detail-page-link');
    entries.each((i, entry) => {
      const $link = $(entry);
      let foo = {};
      foo.title = $link.find('h2.item-title').text();
      foo.link = 'https://www.homegate.ch' + $link.attr('href');
      foo._id = makeHash(foo.title);
      if(foo.title) flats.push(foo);
    });
    return flats;
  }
}