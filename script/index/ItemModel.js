function ItemModel(id, requirements) {
    this.id = id
    this.requirements = requirements
}

ItemModel.prototype = {
  isRawResource: function() {
    return this.requirements.length == 0
  }
}