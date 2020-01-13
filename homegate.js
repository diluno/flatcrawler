module.exports = {
  db: 'homegate',
  uri: 'https://www.homegate.ch/mieten/wohnung/plz/trefferliste?ag=1000&ah=2500&tab=list&o=sortToplisting-desc&ao=8003%2C8004%2C8005%2C8006%2C8002%2C8057&loc=8003%2C%208004%2C%208005%2C%208006%2C%208002%2C%208057',
  parse: ($, makeHash) => {
    let flats = [];
    const entries = $('.ResultlistItem_itemLink_UKXbv');
    entries.each((i, entry) => {
      const $link = $(entry);
      let foo = {};
      foo.title = $link.find('span.AddressData_address_1K-LV').text();
      foo.link = 'https://www.homegate.ch' + $link.attr('href');
      foo._id = makeHash(foo.title);
      if(foo.title) flats.push(foo);
    });
    return flats;
  }
}