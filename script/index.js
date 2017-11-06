String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

class BuildingHelper {
  constructor(self) {
    this.buildings = {}
    this.items = {}
    this.prettyNameMap = {}

    this.demanded = {}
    this.demandedListDiv = $("#demand-list")

    this.requiredRawResources = {}
    this.requiredListDiv = $("#required-list")
  }

  prettifyName(input) {
    return input.replace("_", " ").toProperCase()
  }

  getNames(helper) {
    var answer = []
    $(Object.keys(helper.items)).each(function(name, value) {
      answer.push(helper.prettifyName(value))
      helper.prettyNameMap[value] = helper.prettifyName(value)
      helper.prettyNameMap[helper.prettifyName(value)] = value
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
          helper.items[value.id] = value.req
        })  
        var suggestionEngine = new Bloodhound({
          datumTokenizer: Bloodhound.tokenizers.whitespace,
          queryTokenizer: Bloodhound.tokenizers.whitespace,
          // `states` is an array of state names defined in "The Basics"
          local: helper.getNames(helper)
        });
        var typeaheadInput = $("#item-field")
        typeaheadInput.typeahead({ 
          fitToElement:true,
          highlight:true,
          hint:false,
        },
        {
          name:'items',
          source:suggestionEngine
        })
        typeaheadInput.bind('typeahead:select', function(ev, suggestion) {
          helper.onDemandedItemAdd(helper, {"id": helper.prettyNameMap[suggestion], "name": suggestion})
          $('#item-field').typeahead('val', '');
        });
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

    var newRawRequired = helper.reduceToRaw(helper, item)
    helper.mergeNewRawRequired(helper, newRawRequired)
    helper.updatePageWithNewRaw(helper)
  }

  isRawResource(helper, item) {
    return helper.items[item.id].length == 0
  }

  reduceToRaw(helper, item) {
    var itemToAdd = item.id
    var rawRequired = {}
    var reducing = [{"id": itemToAdd, "quantity": 1}]
    var ans = []

    if (helper.isRawResource(helper, item)) {
      return reducing
    }

    while(reducing.length > 0) {
      var curr = reducing.pop()
      var requirements = helper.items[curr.id]
      for (var i = 0; i < requirements.length; i++) { 
        var requirement = requirements[i]
        if (helper.isRawResource(helper, requirement)) {
          if (rawRequired[requirement.id] == undefined) {
            rawRequired[requirement.id] = requirement.quantity * curr["quantity"]
          } else {
            rawRequired[requirement.id] += requirement.quantity * curr["quantity"]
          }
        } else {
          reducing.push({"id": requirement.id, "quantity": requirement.quantity * curr["quantity"]})
        }
      } 
    }

    for (var key in rawRequired) {
      // check if the property/key is defined in the object itself, not in parent
      if (rawRequired.hasOwnProperty(key)) {           
        ans.push({
          "id": key,
          "quantity": rawRequired[key]
        })
      }
    }
    return ans
  }

  mergeNewRawRequired(helper, rawRequired) {
    while (rawRequired.length > 0) {
      var curr = rawRequired.pop()
      if (helper.requiredRawResources[curr.id] == undefined) {
        helper.requiredRawResources[curr.id] = curr.quantity
      } else {
        helper.requiredRawResources[curr.id] += curr.quantity
      }
    }
  }

  addNewRequiredItem(helper, itemName, itemAmount) {
    helper.requiredListDiv.append(
      $('<tr>').attr('id', 'required-' + itemName).append(
        [
          $('<td>').attr('class', 'required-name').append(helper.prettyNameMap[itemName]),
          $('<td>').attr('class', 'required-quantity').append(itemAmount)
        ]
    ));  
  }

  updateExistingRequiredItem(helper, itemName, itemAmount) {
    $("#required-" + itemName).find(".required-quantity").html(itemAmount)
  }

  updatePageWithNewRaw(helper) {
    for (var key in helper.requiredRawResources) {
      if (helper.requiredRawResources.hasOwnProperty(key)) {
        if ($("#required-" + key).length == 0) {
          helper.addNewRequiredItem(helper, key, helper.requiredRawResources[key])
        } else {
          helper.updateExistingRequiredItem(helper, key, helper.requiredRawResources[key])
        }
      }
    }
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
