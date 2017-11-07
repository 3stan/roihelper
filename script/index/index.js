var googleChartsSetup = google.charts.load('current', { 'packages': ['sankey'] })

var setup = function(result) {
  return new Promise((resolve, reject) => {
    $.getJSON('https://raw.githubusercontent.com/3stan/roihelper/master/resources/items.json', function (data) {
      var allItems = {}
      $(data).each(function (name, value) {
        var itemToAdd = new ItemModel(value.id, value.req)
        allItems[value.id] = itemToAdd
      })

      var model = new ItemHelperModel(allItems)
      var view = new ItemHelperView(model)
      var controller = new ItemHelperController(model, view)
      view.show()
      resolve("Set up complete")
    })
  })
}
  

$(document).ready(function () {
  googleChartsSetup
    .then(setup)
    .then(result => {
      $("#title").text("Loaded!")
      setTimeout(function () { $("#title-div").remove() }, 1000)
    }, error => {
      console.log(error)
    })
});