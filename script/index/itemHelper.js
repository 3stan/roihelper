class Item {
  constructor(id, requirements) {
    this.id = id
    this.requirements = requirements
  }

  isRawResource(item) {
    return item.requirements.length == 0
  }
}

class ItemRenderHelper {
  constructor(dataHelper) {
    this.dataHelper = dataHelper

    this.demandedListDiv = $("#demand-list")
    this.requiredListDiv = $("#required-list")
  }

  setup(renderHelper, items) {
    var suggestionEngine = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.whitespace,
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      local: $.map(items, function (item) { return item.id })
    });

    var typeaheadInput = $("#item-field")
    typeaheadInput.typeahead(
      {
        fitToElement: true,
        highlight: true,
        hint: false,
      },
      {
        name: 'items',
        source: suggestionEngine
      }
    )
    typeaheadInput.bind('typeahead:select', function (ev, suggestion) {
      renderHelper.dataHelper.onDemandedItemAdd(renderHelper.dataHelper, suggestion)
      $('#item-field').typeahead('val', '');
    });

  }

  renderNewDemandedItem(renderHelper, item, numDemanded) {
    renderHelper.demandedListDiv.append(
      $('<tr>').attr('id', 'demanded-' + item.id).append(
        [
          $('<td>').attr('class', 'demanded-name').append(item.id),
          $('<td>').attr('class', 'demanded-quantity').append(numDemanded)
        ]
      ));
  }

  updateExistingDemandedItem(renderHelper, item, numDemanded) {
    $("#demanded-" + item.id).find(".demanded-quantity").html(numDemanded)
  }

  onDemandedItemAdd(renderHelper, item, numDemanded) {
    if ($("#demanded-" + item.id).length == 0) {
      renderHelper.renderNewDemandedItem(renderHelper, item, numDemanded)
    } else {
      renderHelper.updateExistingDemandedItem(renderHelper, item, numDemanded)
    }
  }

  addNewRequiredItem(renderHelper, itemName, itemAmount) {
    renderHelper.requiredListDiv.append(
      $('<tr>').attr('id', 'required-' + itemName).append(
        [
          $('<td>').attr('class', 'required-name').append(itemName),
          $('<td>').attr('class', 'required-quantity').append(itemAmount)
        ]
      ));
  }

  updateExistingRequiredItem(renderHelper, itemName, itemAmount) {
    $("#required-" + itemName).find(".required-quantity").html(itemAmount)
  }

  updatePageWithNewRaw(renderHelper, requiredRawResources) {
    for (var key in requiredRawResources) {
      if (requiredRawResources.hasOwnProperty(key)) {
        if ($("#required-" + key).length == 0) {
          renderHelper.addNewRequiredItem(renderHelper, key, requiredRawResources[key])
        } else {
          renderHelper.updateExistingRequiredItem(renderHelper, key, requiredRawResources[key])
        }
      }
    }
  }
}

class ItemDataHelper {
  constructor() {
    // Key: item id 
    // Value: class Item
    this.items = {}

    // Key: item id
    // Value: int (num demanded)
    this.demanded = {}

    // Key: item id
    // Value; int (num required)
    this.requiredRawResources = {}

    this.renderHelper = new ItemRenderHelper(this)
  }

  setup(itemHelper) {
    return new Promise((resolve, reject) => {
      $.getJSON('https://raw.githubusercontent.com/3stan/roihelper/master/resources/items.json', function (data) {
        $(data).each(function (name, value) {
          var itemToAdd = new Item(value.id, value.req)
          itemHelper.items[value.id] = itemToAdd
        })

        itemHelper.renderHelper.setup(itemHelper.renderHelper, itemHelper.items)
      })
      resolve("setup complete")
    })
  }

  onDemandedItemAdd(dataHelper, item) {
    var demandedItem = dataHelper.items[item]

    if (dataHelper.demanded[item] == undefined) {
      dataHelper.demanded[item] = 1
    } else {
      dataHelper.demanded[item] += 1
    }

    dataHelper.renderHelper.onDemandedItemAdd(
      dataHelper.renderHelper, 
      demandedItem, 
      dataHelper.demanded[item]
    )

    var newRawRequired = dataHelper.reduceToRaw(dataHelper, item)
    dataHelper.mergeNewRawRequired(dataHelper, newRawRequired)
    dataHelper.renderHelper.updatePageWithNewRaw(dataHelper.renderHelper, dataHelper.requiredRawResources)
  }

  reduceToRaw(dataHelper, itemId) {
    var itemToAdd = dataHelper.items[itemId]
    var reducing = [{ "item": itemToAdd, "quantity": 1 }]

    if (itemToAdd.isRawResource(itemToAdd)) {
      return reducing
    }

    var rawRequired = {}
    var ans = []

    while (reducing.length > 0) {
      var currItem = reducing.pop()
      var requirements = currItem.item.requirements
      for (var i = 0; i < requirements.length; i++) {
        var requirement = requirements[i]
        var requirementItem = dataHelper.items[requirement.id]
        if (requirementItem.isRawResource(requirementItem)) {
          if (rawRequired[requirement.id] == undefined) {
            rawRequired[requirement.id] = requirement.quantity * currItem.quantity
          } else {
            rawRequired[requirement.id] += requirement.quantity * currItem.quantity
          }
        } else {
          reducing.push({ "item": dataHelper.items[requirement.id], "quantity": requirement.quantity * currItem.quantity})
        }
      }
    }

    for (var key in rawRequired) {
      if (rawRequired.hasOwnProperty(key)) {
        ans.push({
          "id": key,
          "quantity": rawRequired[key]
        })
      }
    }
    return ans
  }

  mergeNewRawRequired(dataHelper, rawRequired) {
    while (rawRequired.length > 0) {
      var curr = rawRequired.pop()
      if (dataHelper.requiredRawResources[curr.id] == undefined) {
        dataHelper.requiredRawResources[curr.id] = curr.quantity
      } else {
        dataHelper.requiredRawResources[curr.id] += curr.quantity
      }
    }
  }
}