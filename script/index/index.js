class Helper {
  constructor(itemHelper) {
    this.itemHelper = itemHelper
  }

  setup(helper) {
    return helper.itemHelper.setup(helper.itemHelper)
  }
}

$(document).ready(function () {
  var itemHelper = new ItemDataHelper()
  var helper = new Helper(itemHelper)
  helper.setup(helper).then(result => {
    console.log(result)
    $("#title").text("Loaded!")
    setTimeout(function () { $("#title-div").remove() }, 1000)
  }, error => {
    console.log(error)
  })
});
