class BuildingHelper {
  constructor(self) {
    this.buildings = {}
    this.items = {}
  }

  setup(helper) {
    $.getJSON('https://raw.githubusercontent.com/3stan/roihelper/master/resources/buildings.json', function(data) {
      $(data).each(function(name, value) {
        helper.buildings[value.name] = value.items
      })  
    })
    $.getJSON('https://raw.githubusercontent.com/3stan/roihelper/master/resources/items.json', function(data) {
      $(data).each(function(name, value) {
        helper.items[value.name] = value.req
      })  
      $("#item-field").typeahead({ source:Object.keys(helper.items) })
    })

  }  
}

$(document).ready(function() {
  var helper = new BuildingHelper()
  helper.setup(helper)
});
