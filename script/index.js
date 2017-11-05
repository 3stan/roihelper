var buildings = {}
var items = {}

$(document).ready(function() {
    $.getJSON('https://raw.githubusercontent.com/3stan/roihelper/master/resources/buildings.json', dataType="json", function(data) {
      $(data).each(function() {
        buildings[this.name] = this.items
      })  
    });
    $.getJSON('https://raw.githubusercontent.com/3stan/roihelper/master/resources/items.json', dataType="json", function(data) {
      $(data).each(function() {
        items[this.name] = this.req
      })  
      $("#item-field").typeahead({ source:Object.keys(items) })
    });
});
