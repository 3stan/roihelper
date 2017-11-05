class BuildingHelper {
  constructor(self) {
    this.buildings = {}
    this.items = {}

    this.selected = []
  }

  setup(helper) {
    return new Promise((resolve, reject) => {
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

      if (true) {
        resolve("setup complete")
      } else {
        reject("something went wrong...")
      }
    })
  }  
}

$(document).ready(function() {
  var helper = new BuildingHelper()
  helper.setup(helper).then(result => {
    console.log(result)
    $("#title").text("Loaded!")
    setTimeout(function () {$("#title-div").remove()}, 1000)
  }, error => {
    console.log(error)
  })
});
