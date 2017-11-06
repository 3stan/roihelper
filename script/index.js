String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

class BuildingHelper {
  constructor(self) {
    this.buildings = {}
    this.items = {}

    this.demanded = {}
    this.demandedListDiv = $("#demand-list")

    this.requiredRawResources = {}
  }

  prettifyName(input) {
    return input.replace("_", " ").toProperCase()
  }

  getNames(helper) {
    var answer = []
    $(Object.keys(helper.items)).each(function(name, value) {
      answer.push({
        "id": value,
        "name": helper.prettifyName(value)
      })
    })
    return answer
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
        var typeaheadInput = $("#item-field")
        typeaheadInput.typeahead({ 
          source: helper.getNames(helper),
          updater: function(item) {
            helper.onDemandedItemAdd(helper, item)
          },
          fitToElement:true,
          items:5,
          autoSelect:false,
        })
      })

      if (true) {
        resolve("setup complete")
      } else {
        reject("something went wrong...")
      }
    })
  }  

  addNewDemandedItem(helper, item) {
    helper.demandedListDiv.append(
      $('<tr>').attr('id', 'demanded-' + item.id).append(
        [
          $('<td>').attr('class', 'demanded-name').append(item.name),
          $('<td>').attr('class', 'demanded-quantity').append(1)
        ]
    ));  
  }

  updateExistingDemandedItem(helper, item) {
    $("#demanded-" + item.id).find(".demanded-quantity").html(helper.demanded[item.id])
  }

  onDemandedItemAdd(helper, item) {
    if($("#demanded-" + item.id).length == 0) {
      helper.demanded[item.id] = 1
      helper.addNewDemandedItem(helper, item)
    } else {
      helper.demanded[item.id] = helper.demanded[item.id] + 1
      helper.updateExistingDemandedItem(helper, item)
    }

    helper.reduceToRaw(helper, item)
  }

  reduceToRaw(helper, item) {
    var itemToAdd = item.id
    var rawRequired = {}
    var reducing = [{"id": itemToAdd, "quantity": 1}]

    //while(reducing.length > 0) {
      var curr = reducing.pop()
      console.log(helper.items[curr.id])
    //}
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
