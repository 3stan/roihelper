var buildings = {}
var items = {}

$(document).ready(function() {
    $.getJSON('/resources/buildings.json', dataType="json", function(data) {
      $(data).each(function() {
        buildings[this.name] = this.items
      })  
    });
    $.getJSON('/resources/items.json', dataType="json", function(data) {
      $(data).each(function() {
        items[this.name] = this.req
      })  
      $("#item-field").typeahead({ source:Object.keys(items) })
    });
});
