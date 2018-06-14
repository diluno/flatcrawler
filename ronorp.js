module.exports = {
  db: 'ronorp',
  uri: 'https://www.ronorp.net/zuerich/immobilien/wohnung-zuerich.1219?hash=7e27305410eb19bd251d207da800cf29&fdata%5Brons_filter%5D=&cmd=update&record_id=&fdata%5Badvert_type%5D=angebot&fdata%5Bsp_realty_type%5D=rent&fdata%5Bsp_realty_stadt_agglo%5D=stadt&fdata%5Bplz%5D=&fdata%5Bsp_realty_plz%5D=&page=1&adverts_filter=1&fdata%5Bsearch%5D=',
  parse: ($, makeHash) => {
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
    return flats;
  }
}