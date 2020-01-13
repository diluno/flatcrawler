module.exports = {
  db: 'tutti',
  uri: 'https://www.tutti.ch/de/li/zuerich/zuerich/immobilien/wohnungen/mieten?pe=2000',
  parse: ($, makeHash) => {
    let flats = [];
    const entries = $('._1MojO');
    entries.each((i, entry) => {
      if ($(entry).hasClass('VXTED')) return;
      const $link = $(entry).find('a._16dGT');
      let foo = {};
      foo.title = $link.find('h4').text();
      foo.link = 'https://www.tutti.ch' + $link.attr('href');
      foo._id = makeHash(foo.title);
      flats.push(foo);
    });
    return flats;
  }
}
