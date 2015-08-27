var fs = require('fs');
var request = require("request");
var hashes = JSON.parse(fs.readFileSync('hashes.json', 'utf8'));
var w3c = require("w3capi");
w3c.apiKey = JSON.parse(fs.readFileSync('key.json', 'utf8'));

var persons = {};
var requested = 0;
var responded = 0;

var abbr = {"Web Applications":"WebApps",
              "Web Real-Time Communications": "WebRTC",
              "Web Application Security": "WebAppSec",
              "Cascading Style Sheet (CSS)": "CSS",
              "Web Cryptography": "WebCrypto",
              "Interest Group": "IG",
              "Working Group": "WG"};

function shortenGroupName(name) {
  Object.keys(abbr).forEach(function(repl) {
    name = name.replace(repl, abbr[repl]);
  });
  return name;
}


function finalize() {
  if (responded === requested) {
    fs.writeFileSync('persons.json', JSON.stringify(Object.keys(persons).map( function(p) { return persons[p];})));
  }
}

hashes.forEach(function(h) {
  persons[h] = {id:h};
  requested++;
  w3c.user(h).fetch(
    function(error, data) {
      responded++;
      if (!error) {
        var photosBySize = {};
        if (data._links && data._links.photos) {
          data._links.photos.forEach(function (p) { photosBySize[p.name] = p.href;});
        }
        var pic = photosBySize['large'] || null;
        persons[h].name = data.name.replace("Doug Schepers", "Doug \"Werewolf\" Schepers");
        persons[h].pic = pic;
      }
      finalize();
    });
  requested++;
  w3c.user(h).affiliations().fetch( { embed: true },
    function(error, data) {
      responded++;
      if (!error) {
        var memberAffiliation = data.filter(function (a) { return a.is_member || a.name === "W3C Staff";})[0] ;
        persons[h].affiliation = memberAffiliation ? memberAffiliation.name : null;
      }
      finalize();
    });
    requested++;
    w3c.user(h).groups().fetch( { embed: true },
      function(error, data) {
        responded++;
        if (!error) {
          var groups = data.filter(function (g) { return g.type === "working group" || g.type === "interest group";});
          persons[h].groups = groups.map(function(g) { return { name: g.name, shortername: shortenGroupName(g.name)};});
        }
        finalize();
      });
});
