function ItemHelperView(model) {
  this._model = model

  this.demandedListDiv = $("#demand-list")
  this.requiredListDiv = $("#required-list")
  this.typeaheadInput = $("#item-field")

  this.demandItemAdded = new Event(this)

  var _this = this

  this._model.demandedItemAdded.attach(function (args) {
    _this.rebuildDemandList(args)
    _this.rebuildRequiredList(args)
    _this.resetInputs()
  })
  this._model.demandedItemRemoved.attach(function () {
    _this.rebuildDemandList()
    _this.rebuildRequiredList()
  })

  var suggestionEngine = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.whitespace,
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: this._model.getItemKeys()
  });
  this.typeaheadInput.typeahead(
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
  this.typeaheadInput.bind('typeahead:select', function (ev, suggestion) {
    _this.demandItemAdded.notify({ item: _this._model.getItemById(suggestion) })
  })
}

ItemHelperView.prototype = {
  show: function () {
    this.rebuildDemandList()
    this.rebuildRequiredList()
  },

  resetInputs: function() {
    this.typeaheadInput.typeahead('val', '');
  },

  renderDemandItem: function (itemName, itemAmount) {
    this.demandedListDiv.append(
      $('<tr>').attr('id', 'demanded-' + itemName).append(
        [
          $('<td>').attr('class', 'demanded-name').append(itemName),
          $('<td>').attr('class', 'demanded-quantity').append(itemAmount)
        ]
      ));
  },

  rebuildDemandList: function (args) {
    this.demandedListDiv.empty()
    var demandedItems = this._model.getDemandedItems()
    for (var key in demandedItems) {
      if (demandedItems.hasOwnProperty(key)) {
        this.renderDemandItem(key, demandedItems[key])
      }
    }
  },

  addNewRequiredItem: function (itemName, itemAmount) {
    this.requiredListDiv.append(
      $('<tr>').attr('id', 'required-' + itemName).append(
        [
          $('<td>').attr('class', 'required-name').append(itemName),
          $('<td>').attr('class', 'required-quantity').append(itemAmount)
        ]
      ));
  },

  rebuildRequiredList: function (args) {
    this.requiredListDiv.empty()
    var requiredItems = this._model.getRequiredResources()
    for (var key in requiredItems) {
      if (requiredItems.hasOwnProperty(key)) {
        this.addNewRequiredItem(key, requiredItems[key])
      }
    }
  }
}

function ItemHelperController(model, view) {
  this._model = model
  this._view = view

  var _this = this

  this._view.demandItemAdded.attach(function (sender, item) {
    _this.addItem(item)
  })
}

ItemHelperController.prototype = {
  addItem: function (item) {
    this._model.addDemanded(item)
  }
}