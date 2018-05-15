//deep Diff maper
//https://stackoverflow.com/questions/8572826/generic-deep-diff-between-two-objects

var VALUE_CREATED = "created",
    VALUE_UPDATED = "updated",
    VALUE_DELETED = "deleted",
    VALUE_UNCHANGED = "unchanged";

var diff = function(oldModel, newModel) {
    //console.log("old model: ", oldModel);
    //console.log("new model: ", newModel);

    //
    // becouse model is make like this
    // we only need to check dataModel's
    //
    //everying else is copyed
    //
    var diffModel = [];
    newModel.forEach(function(item, index) {
        var obj = {};
        obj["index"] = index;
        obj["value"] = item;
        obj["modelIs"] = VALUE_CREATED;

        diffModel.push(obj);
    });

    oldModel.forEach(function(item, index) {
        switch (item.type) {
            case "label":
                _checkLabel(item, diffModel);
                break;
            case "pattern":
                _checkPattern(item, diffModel);
                break;
        }
    });

    return diffModel;
};

function _checkLabel(oneOldModelItem, newDiffModels) {
    var newItem = newDiffModels.find(function(x) {
        return x.value.type === "label" && x.value.id === oneOldModelItem.id;
    });

    if (newItem === undefined) {
        //removed
        var obj = {};
        obj["index"] = -1;
        obj["value"] = oneOldModelItem;
        obj["modelIs"] = VALUE_DELETED;

        newDiffModels.push(obj);
    } else if (oneOldModelItem.columnName !== newItem.value.columnName) {
        newItem.modelIs = VALUE_UPDATED;
        newItem["changedProps"] = { oldColumnName: oneOldModelItem.columnName };
    } else {
        newItem.modelIs = VALUE_UNCHANGED;
    }
}

function _checkPattern(oneOldModelItem, newDiffModels) {
    var newItem = newDiffModels.find(function(x) {
        return (
            x.value.type === "pattern" &&
            x.value.columnName === oneOldModelItem.columnName &&
            x.value.pattern === oneOldModelItem.pattern
        );
    });

    if (newItem === undefined) {
        //removed
        var obj = {};
        obj["index"] = -1;
        obj["value"] = oneOldModelItem;
        obj["modelIs"] = VALUE_DELETED;

        newDiffModels.push(obj);
    } else {
        newItem.modelIs = VALUE_UNCHANGED;
    }
}

module.exports.diff = diff;
