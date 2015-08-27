function __renderDOMDetails(obj) {
  var div = document.createElement("div");
  var p = document.createElement("p");
  p.appendChild(document.createTextNode("Member Affiliation: " + obj.affiliation || "none"));
  var pg = document.createElement("p");
  pg.appendChild(document.createTextNode("W3C Groups: "));
  obj.groups = obj.groups || [];
  if (!obj.groups || !obj.groups.length) {
    pg.appendChild(document.createTextNode("none"));
  } else {
    obj.groups.forEach(function (g, i) {
      var container;
      if (g.name !== g.shortername) {
        container = document.createElement("abbr");
        container.title = g.name;
      } else {
        container = document.createElement("span");
      }
      container.appendChild(document.createTextNode(g.shortername + (i < obj.groups.length - 1 ? ", ": "")));
      pg.appendChild(container);
    });
  }
  div.appendChild(p);
  div.appendChild(pg);
  return div.outerHTML;
}
