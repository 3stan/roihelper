function ItemHelperModel(items) {
  this._items = items

  this._demanded = {}
  this._requiredRawResources = {}
  this._sankeyData = {}

  this.demandedItemAdded = new Event(this)
  this.demandedItemRemoved = new Event(this)
}

ItemHelperModel.prototype = {
  getItems: function () {
    return this._items
  },

  getItemKeys: function () {
    return Object.keys(this._items)
  },

  getItemById: function (id) {
    return this._items[id]
  },

  getDemandedItems: function () {
    return this._demanded
  },

  getRequiredResources: function () {
    return this._requiredRawResources
  },

  getSankeyData: function () {
    var ans = []
    for (var originKey in this._sankeyData) {
      if (this._sankeyData.hasOwnProperty(originKey)) {
        var destinations = this._sankeyData[originKey]
        for (var destinationKey in destinations) {
          if (destinations.hasOwnProperty(destinationKey)) {
            ans.push([originKey, destinationKey, destinations[destinationKey]])
          }
        }
      }
    }
    return ans
  },

  addDemanded: function (args) {
    var item = args.item

    if (this._demanded[item.id] == undefined) {
      this._demanded[item.id] = 1
    } else {
      this._demanded[item.id] += 1
    }

    var newRawRequired = this.reduceToRaw(item.id)
    this.mergeNewRawRequired(newRawRequired)
    this.demandedItemAdded.notify({ item: item })
  },

  addSankeyData: function (origin, destination, amount) {
    if (this._sankeyData[origin] == undefined) {
      var toAdd = {}; toAdd[destination] = amount;
      this._sankeyData[origin] = toAdd
    } else {
      var originDict = this._sankeyData[origin]
      if (originDict[destination] == undefined) {
        this._sankeyData[origin][destination] = amount
      } else {
        this._sankeyData[origin][destination] += amount
      }
    }
  },

  reduceToRaw: function (itemId) {
    var itemToAdd = this._items[itemId]
    var reducing = [{ "item": itemToAdd, "quantity": 1 }]

    if (itemToAdd.isRawResource()) {
      this.addSankeyData(itemId, itemId + " (Unprocessed)", 1)
      return [{ "id": itemId, "quantity": 1 }]
    }

    var rawRequired = {}
    var ans = []

    while (reducing.length > 0) {
      var currItem = reducing.pop()
      var requirements = currItem.item.requirements
      for (var i = 0; i < requirements.length; i++) {
        var requirement = requirements[i]
        var requirementItem = this._items[requirement.id]
        var requiredQuantity = requirement.quantity * currItem.quantity
        this.addSankeyData(requirementItem.id, currItem.item.id, requiredQuantity)
        if (requirementItem.isRawResource()) {
          if (rawRequired[requirement.id] == undefined) {
            rawRequired[requirement.id] = requiredQuantity
          } else {
            rawRequired[requirement.id] += requiredQuantity
          }
        } else {
          reducing.push({ "item": this._items[requirement.id], "quantity": requiredQuantity })
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
  },

  mergeNewRawRequired: function (rawRequired) {
    while (rawRequired.length > 0) {
      var curr = rawRequired.pop()
      if (this._requiredRawResources[curr.id] == undefined) {
        this._requiredRawResources[curr.id] = curr.quantity
      } else {
        this._requiredRawResources[curr.id] += curr.quantity
      }
    }
  }
}