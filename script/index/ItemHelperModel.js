function ItemHelperModel(items) {
  this._items = items

  this._demanded = {}
  this._requiredRawResources = {}

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

  reduceToRaw: function (itemId) {
    var itemToAdd = this._items[itemId]
    var reducing = [{ "item": itemToAdd, "quantity": 1 }]

    if (itemToAdd.isRawResource()) {
      return [{"id": itemId, "quantity": 1}]
    }

    var rawRequired = {}
    var ans = []

    while (reducing.length > 0) {
      var currItem = reducing.pop()
      var requirements = currItem.item.requirements
      for (var i = 0; i < requirements.length; i++) {
        var requirement = requirements[i]
        var requirementItem = this._items[requirement.id]
        if (requirementItem.isRawResource()) {
          if (rawRequired[requirement.id] == undefined) {
            rawRequired[requirement.id] = requirement.quantity * currItem.quantity
          } else {
            rawRequired[requirement.id] += requirement.quantity * currItem.quantity
          }
        } else {
          reducing.push({ "item": this._items[requirement.id], "quantity": requirement.quantity * currItem.quantity })
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