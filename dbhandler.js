const JsonDB = require("node-json-db");
const fs = require("fs");
const diff = require("./diffMapForModel").diff;
const dataGenerator = require("./dataGenerator");
const asyncLoop = require("./asyncLoop");

var DbHandler = function() {};
var handler = new DbHandler();
DbHandler.prototype.info = function() {
    console.log("Handle database functionality.");
};

var fileExtension = ".json";
var pathToUserFiles = "./usermodel_data/";
var rowsPerModel = 100;

var file = function(tableName) {
    return pathToUserFiles + tableName;
};
var jsonFile = function(tableName) {
    return pathToUserFiles + tableName + ".json";
};
var settingsFile = function(tableName) {
    return pathToUserFiles + tableName + "_settings";
};
var settingsFileExtension = function(tableName) {
    return pathToUserFiles + tableName + "_settings" + fileExtension;
};
var randomNumber = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

//
// cuvaj podatke o svim modelima u jednom fajlu
// tako da ako editujemo model updateujemo / proveravamo
// taj fajl i naspram njega se organizujemo
//
// ako je novi model isti onda nista ne radi
// ako je drugaciji onda dodaj novo i updateuj stare modele
// ako novi model ne postoji onda ga dodati
// ako se model brise izbaciti ga itd...
//

/////////////////
//recreate models
DbHandler.prototype.recreateModels = function(dbname, models, callback) {
    handler.removeFiles(dbname, function(removed, error) {
        if (error === null) {
            handler.createModels(dbname, models, function(data, err) {
                if (err !== null) {
                    callback(true, null);
                } else {
                    callback(null, err);
                }
            });
        } else {
            callback(null, error);
        }
    });
};

//create models
DbHandler.prototype.createModels = function(dbname, models, callback) {
    //
    //  prolazi kroz modele i pozivaj create model
    //
    var mainResult = true;
    asyncLoop(
        models.length,
        function(loop) {
            handler.createModel(dbname, models[loop.iteration()], function(
                result,
                error
            ) {
                mainResult = mainResult && result;
                loop.next();
            });
        },
        function() {
            //do at end of all loops
            callback(mainResult, null);
        }
    );
};

//create model
DbHandler.prototype.createModel = function(dbname, model, callback) {
    handler.fileExist(dbname, function(dbExist, error) {
        if (error === null) {
            if (dbExist) {
                handler.updateModel(dbname, model, function(data, error) {
                    if (error) {
                        callback(null, error);
                    } else {
                        callback(true, null);
                    }
                });
            } else {
                //
                //part to generate data
                var _id = "_id_" + dbname;
                var startPosition = randomNumber(0, 900); // make it configurable [number of items per file  -  number of items generated]

                var saveData = {
                    settings: {
                        _id: _id,
                        created: new Date().toISOString(),
                        updated: [new Date().toISOString()],
                        finishedFileSaving: [],
                        startPosition: startPosition
                    },
                    user_models: []
                };
                saveData.user_models.push(model);

                //
                //generate data for file from given model
                dataGenerator.generate(model, _id, startPosition, function(
                    generated
                ) {
                    //
                    //save generated data to file
                    var saveGeneratedData = {};
                    saveGeneratedData[model.routePath] = generated;
                    fs.writeFile(
                        jsonFile(dbname),
                        JSON.stringify(saveGeneratedData, null, 2),
                        function(err) {
                            if (err) {
                                callback(null, err);
                            } else {
                                //
                                //save settings data to a different file
                                saveData.settings.finishedFileSaving.push(
                                    new Date().toISOString()
                                );
                                fs.writeFile(
                                    settingsFileExtension(dbname),
                                    JSON.stringify(saveData, null, 2),
                                    function(error) {
                                        if (error) {
                                            callback(null, error);
                                        } else {
                                            callback(true, null);
                                        }
                                    }
                                );
                            }
                        }
                    );
                });
            }
        } else {
            //error
            callback(null, error);
        }
    });
};

//delete model
DbHandler.prototype.deleteModel = function(dbname, routePath, callback) {
    handler.fileExist(dbname, function(dbExist, error) {
        if (error === null) {
            if (dbExist) {
                handler.getSettings(dbname, function(data, error) {
                    if (error !== null) {
                        callback(null, error);
                    } else {
                        var settingsData = JSON.parse(data);
                        settingsData.settings.updated.push(
                            new Date().toISOString()
                        );
                        settingsData.user_models = settingsData.user_models.filter(
                            function(item) {
                                return item.routePath !== routePath;
                            }
                        );
                        handler.getModelData(dbname, function(mdata, error) {
                            if (error !== null) {
                                callback(null, error);
                            } else {
                                var modelData = JSON.parse(mdata);
                                //
                                //save generated data to file

                                delete modelData[routePath];

                                fs.writeFile(
                                    jsonFile(dbname),
                                    JSON.stringify(modelData, null, 2),
                                    function(err) {
                                        if (err) {
                                            callback(null, err);
                                        } else {
                                            //
                                            //save settings data to a different file
                                            settingsData.settings.finishedFileSaving.push(
                                                new Date().toISOString()
                                            );
                                            fs.writeFile(
                                                settingsFileExtension(dbname),
                                                JSON.stringify(
                                                    settingsData,
                                                    null,
                                                    2
                                                ),
                                                function(error) {
                                                    if (error) {
                                                        callback(null, error);
                                                    } else {
                                                        callback(true, null);
                                                    }
                                                }
                                            );
                                        }
                                    }
                                );
                            }
                        });
                    }
                });
            } else {
                callback(dbExist, null);
            }
        } else {
            callback(null, error);
        }
    });
};

//update model
DbHandler.prototype.updateModel = function(dbname, model, callback) {
    //get settings

    //add data to settings
    // fill normal files with new data
    handler.getSettings(dbname, function(data, error) {
        if (error !== null) {
            callback(null, error);
        } else {
            var settingsData = JSON.parse(data);
            settingsData.settings.updated.push(new Date().toISOString());
            settingsData.user_models.push(model);

            // //
            // //generate data for file from given model
            dataGenerator.generate(
                model,
                settingsData.settings._id,
                settingsData.settings.startPosition,
                function(generated) {
                    handler.getModelData(dbname, function(mdata, error) {
                        if (error !== null) {
                            callback(null, error);
                        } else {
                            var modelData = JSON.parse(mdata);
                            //
                            //save generated data to file
                            modelData[model.routePath] = generated;
                            fs.writeFile(
                                jsonFile(dbname),
                                JSON.stringify(modelData, null, 2),
                                function(err) {
                                    if (err) {
                                        callback(null, err);
                                    } else {
                                        //
                                        //save settings data to a different file
                                        settingsData.settings.finishedFileSaving.push(
                                            new Date().toISOString()
                                        );
                                        fs.writeFile(
                                            settingsFileExtension(dbname),
                                            JSON.stringify(
                                                settingsData,
                                                null,
                                                2
                                            ),
                                            function(error) {
                                                if (error) {
                                                    callback(null, error);
                                                } else {
                                                    callback(true, null);
                                                }
                                            }
                                        );
                                    }
                                }
                            );
                        }
                    });
                }
            );
        }
    });
};

//update existing model
DbHandler.prototype.updateCreatedModel = function(dbname, model, callback) {
    handler.getSettings(dbname, function(data, error) {
        if (error !== null) {
            callback(null, error);
        } else {
            var settingsData = JSON.parse(data);
            settingsData.settings.updated.push(new Date().toISOString());

            var _settingsModelIndex = null;
            var oldModel = settingsData.user_models.find(function(item, index) {
                if (item.routePath === model.routePath) {
                    _settingsModelIndex = index;
                    return true;
                } else {
                    return false;
                }
            });

            settingsData.user_models[_settingsModelIndex] = model;
            var settingsDiff = diff(oldModel.dataModel, model.dataModel);

            //console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>");
            //console.log("diff before: ", settingsDiff.slice(0));
            //console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>");
            //
            // samo ako je created
            // pravi nove modele
            // u suprotnom
            asyncLoop(
                settingsDiff.length,
                function(loop) {
                    var modelisPlusType =
                        settingsDiff[loop.iteration()].modelIs +
                        "-" +
                        settingsDiff[loop.iteration()].value.type;

                    switch (modelisPlusType) {
                        case "created-label":
                            dataGenerator.generateArrayFromFile(
                                settingsDiff[loop.iteration()].value.id,
                                settingsData.settings.startPosition,
                                null,
                                function(result, error) {
                                    settingsDiff[loop.iteration()][
                                        "generatedData"
                                    ] = result;
                                    loop.next();
                                }
                            );
                            break;
                        case "created-pattern":
                            settingsDiff[loop.iteration()][
                                "generatedData"
                            ] = dataGenerator.generateArrayPattern(
                                settingsDiff[loop.iteration()].value.pattern,
                                null
                            );
                            loop.next();
                            break;
                        default:
                            loop.next();
                            break;
                    }
                },
                function() {
                    //
                    // sort so we first delete then create
                    //
                    settingsDiff.sort(function(a, b) {
                        return a.modelIs > b.modelIs
                            ? -1
                            : a.modelIs < b.modelIs ? 1 : 0;
                    });
                    //console.log("diff after: ", settingsDiff.slice(0));

                    //
                    //  do at end of all loops - START
                    //
                    handler.getModelData(dbname, function(mdata, error) {
                        if (error !== null) {
                            callback(null, error);
                        } else {
                            var modelData = JSON.parse(mdata);
                            //
                            //save generated data to file

                            settingsDiff.forEach(function(element) {
                                switch (element.modelIs) {
                                    case "created":
                                        //add
                                        //console.log("create: ", element);
                                        modelData[model.routePath].forEach(
                                            function(el, cursor) {
                                                el[element.value.columnName] =
                                                    element.generatedData[
                                                        cursor
                                                    ];
                                            }
                                        );
                                        break;
                                    case "updated":
                                        //delete
                                        //add
                                        //console.log("update: ", element);
                                        modelData[model.routePath].forEach(
                                            function(el, cursor) {
                                                var _oldColumnName =
                                                    element.changedProps
                                                        .oldColumnName;
                                                el[element.value.columnName] =
                                                    el[_oldColumnName];

                                                delete el[_oldColumnName];
                                            }
                                        );
                                        break;
                                    case "deleted":
                                        //delete
                                        //console.log("delete: ", element);
                                        modelData[model.routePath].forEach(
                                            function(el) {
                                                delete el[
                                                    element.value.columnName
                                                ];
                                            }
                                        );
                                        break;
                                    // default:
                                    //     console.log("default: ", element);
                                    //     break;
                                }
                            });

                            //console.log("----------");
                            //console.log("data => ", modelData);
                            //console.log("----------");
                            fs.writeFile(
                                jsonFile(dbname),
                                JSON.stringify(modelData, null, 2),
                                function(err) {
                                    if (err) {
                                        callback(null, err);
                                    } else {
                                        //
                                        //save settings data to a different file
                                        settingsData.settings.finishedFileSaving.push(
                                            new Date().toISOString()
                                        );
                                        fs.writeFile(
                                            settingsFileExtension(dbname),
                                            JSON.stringify(
                                                settingsData,
                                                null,
                                                2
                                            ),
                                            function(error) {
                                                if (error) {
                                                    callback(null, error);
                                                } else {
                                                    callback(true, null);
                                                }
                                            }
                                        );
                                    }
                                }
                            );
                        }
                    });
                    //
                    // end of all lopps - END
                    //
                }
            );
        }
    });
};

//check model (new model | old model)
DbHandler.prototype.checkModel = function(dbname, model, callback) {
    //
    // dobija modele i pita prvo da li on ima napravljene modele,
    // ako ima napravljena oba file-a , proveri sadrzaj iz  settings file-a
    //      i sadrzaj iz model i uporedi i ako se razlikuju dopuni
    // u suprotnom return sve ok
    //
    // onda zovi da se file obnovi ili kako god
    //

    handler.fileExist(dbname, function(dbExist, error) {
        if (error === null) {
            if (dbExist) {
                callback(true, null);
            } else {
                handler.createModels(dbname, model, function(data, err) {
                    if (!err) {
                        callback(true, null);
                    }
                });
            }
        } else {
            callback(null, error);
        }
    });
};

//model exist

//file exist
DbHandler.prototype.fileExist = function(dbname, callback) {
    fs.exists(settingsFileExtension(dbname), function(exists) {
        if (callback !== undefined) {
            callback(exists, null);
        }
    });
};

//remove files
DbHandler.prototype.removeFiles = function(dbname, callback) {
    handler.fileExist(dbname, function(dbExist, error) {
        if (error === null) {
            if (dbExist) {
                //todo
                fs.unlink(jsonFile(dbname), function(err) {
                    if (err !== null) {
                        callback(null, err);
                    } else {
                        fs.unlink(settingsFileExtension(dbname), function(
                            _err
                        ) {
                            if (err !== null) {
                                callback(null, err);
                            } else {
                                callback(true, null);
                            }
                        });
                    }
                });
            } else {
                callback(true, null);
            }
        } else {
            callback(null, error);
        }
    });
};

//get settings
DbHandler.prototype.getSettings = function(dbname, callback) {
    var settingsFileName = settingsFileExtension(dbname);

    fs.exists(settingsFileName, function(exists) {
        if (exists) {
            fs.readFile(settingsFileName, "utf8", function read(err, data) {
                if (err) {
                    callback(null, err);
                } else {
                    callback(data, null);
                }
            });
        } else {
            callback(null, "Settings file does not exist.");
        }
    });
};

//get data
DbHandler.prototype.getModelData = function(dbname, callback) {
    var modelData = jsonFile(dbname);

    fs.exists(modelData, function(exists) {
        if (exists) {
            fs.readFile(modelData, "utf8", function read(err, data) {
                if (err) {
                    callback(null, err);
                } else {
                    callback(data, null);
                }
            });
        } else {
            callback(null, "Model data file does not exist.");
        }
    });
};

/////////////////

//
// ove dole stvari treba da hendluju samo
// stvari koje user-i posalju sa apijem
// npr: update first_name to Goran where id = 1 | email = goran@....
//

/////////////////
//get model data
DbHandler.prototype.findModel = function(dbname, tablename, query) {
    db.connect(settingsFile(dbname), [tablename]);
    return db[tablename].findOne(query);
};

//insert model data

//update model data

//delete model data
/////////////////

//
// ovo dole handluje npr:
// ako first_name vise nije potreban - ovo treba da obrise kolonu iz svakog reda u modelu
// ako se doda nova kolona u modelu ili promeni update/add, etc..
//

/////////////////
//get rows
DbHandler.prototype.findRows = function(dbname, tablename, query) {
    var db = new JsonDB(file(dbname), false, true);
    var result = null;
    try {
        result = db.getData("/" + tablename);
    } catch (e) {
        //TODO
        //
        //  log -> dbname, tablename, query
        //
    }
    return result;
};

//get one row
DbHandler.prototype.findRow = function(dbname, tablename, _id) {
    var result = null;
    var rows = handler.findRows(dbname, tablename, {});
    if (rows !== null && Array.isArray(rows)) {
        var id = "_id_" + dbname;
        rows.forEach(function(item) {
            if (item[id] == _id) {
                result = item;
                return;
            }
        });
    }
    return result;
};

//get last row
DbHandler.prototype.findLast = function(dbname, tablename, query) {
    var db = new JsonDB(file(dbname), false, true);
    var result = null;
    try {
        result = db.getData("/" + tablename + "[-1]");
    } catch (e) {
        //TODO
        //
        //  log -> dbname, tablename, query
        //
    }
    return result;
};

//insert rows
DbHandler.prototype.insertRows = function(
    dbname,
    tablename,
    inputObjs,
    callback
) {
    var lastItem = handler.findLast(dbname, tablename, {});
    var newObjs = [];
    var lastObjIndex = Number(lastItem["_id_" + dbname]);

    handler.getSettings(dbname, function(data, error) {
        if (error !== null) {
            callback({
                status: 500,
                json: {
                    res: "post",
                    error: "Internal server error.",
                    message: "While getting user model settings.",
                    errorMessage: error
                }
            });
        } else {
            var settingsData = JSON.parse(data);
            var model = settingsData.user_models.find(function(params) {
                return params.routePath === tablename;
            });
            if (model !== undefined) {
                var modelValidationErrors = [];

                for (let i = 0; i < inputObjs.length; i++) {
                    newObjs.push({});
                    newObjs[i]["_id_" + dbname] = lastObjIndex + i + 1;

                    model.dataModel.forEach(function(item) {
                        var newItem = inputObjs[i][item.columnName];
                        switch (item.type) {
                            case "label":
                                if (newItem === undefined || newItem === null) {
                                    newObjs[i][item.columnName] = null;
                                } else if (
                                    typeof newItem === "string" ||
                                    newItem instanceof String
                                ) {
                                    newObjs[i][item.columnName] = newItem;
                                } else {
                                    modelValidationErrors.push({
                                        propName: item.columnName,
                                        type: "String|undefind|null",
                                        value: newItem
                                    });
                                }

                                break;
                            case "pattern":
                                //todo
                                var regex = new RegExp(item.pattern);
                                if (newItem === undefined || newItem === null) {
                                    newObjs[i][item.columnName] = null;
                                } else if (regex.test(newItem)) {
                                    newObjs[i][item.columnName] = newItem;
                                } else {
                                    modelValidationErrors.push({
                                        propName: item.columnName,
                                        type: item.pattern,
                                        value: newItem
                                    });
                                }
                                break;
                        }
                    });
                }

                if (modelValidationErrors.length > 0) {
                    callback({
                        status: 400,
                        json: {
                            res: "post",
                            error: "Bad request.",
                            message: "Request body data has fail validation.",
                            errorMessage: modelValidationErrors
                        }
                    });
                } else {
                    console.log("new obj to insert = ", newObjs);
                    var db = new JsonDB(file(dbname), false, true);

                    db.push("/" + tablename, newObj, false);
                    db.save();
                    callback({
                        status: 200,
                        json: { res: "post" }
                    });
                }
            } else {
                callback({
                    status: 400,
                    json: {
                        res: "post",
                        error: "Bad request.",
                        message: "That api request is not good."
                    }
                });
            }
        }
    });
};

//insert row
DbHandler.prototype.insertRow = function(
    dbname,
    tablename,
    inputObj,
    callback
) {
    var lastItem = handler.findLast(dbname, tablename, {});
    var newObj = {};
    newObj["_id_" + dbname] = Number(lastItem["_id_" + dbname]) + 1;

    handler.getSettings(dbname, function(data, error) {
        if (error !== null) {
            callback({
                status: 500,
                json: {
                    res: "post",
                    error: "Internal server error.",
                    message: "While getting user model settings.",
                    errorMessage: error
                }
            });
        } else {
            var settingsData = JSON.parse(data);
            var model = settingsData.user_models.find(function(params) {
                return params.routePath === tablename;
            });
            if (model !== undefined) {
                var modelValidationErrors = [];

                model.dataModel.forEach(function(item) {
                    var newItem = inputObj[item.columnName];
                    switch (item.type) {
                        case "label":
                            if (newItem === undefined || newItem === null) {
                                newObj[item.columnName] = null;
                            } else if (
                                typeof newItem === "string" ||
                                newItem instanceof String
                            ) {
                                newObj[item.columnName] = newItem;
                            } else {
                                modelValidationErrors.push({
                                    propName: item.columnName,
                                    type: "String|undefind|null",
                                    value: newItem
                                });
                            }

                            break;
                        case "pattern":
                            //todo
                            var regex = new RegExp(item.pattern);
                            if (newItem === undefined || newItem === null) {
                                newObj[item.columnName] = null;
                            } else if (regex.test(newItem)) {
                                newObj[item.columnName] = newItem;
                            } else {
                                modelValidationErrors.push({
                                    propName: item.columnName,
                                    type: item.pattern,
                                    value: newItem
                                });
                            }
                            break;
                    }
                });

                if (modelValidationErrors.length > 0) {
                    callback({
                        status: 400,
                        json: {
                            res: "post",
                            error: "Bad request.",
                            message: "Request body data has fail validation.",
                            errorMessage: modelValidationErrors
                        }
                    });
                } else {
                    console.log("new obj to insert = ", newObj);
                    var db = new JsonDB(file(dbname), false, true);

                    db.push("/" + tablename, [newObj], false);
                    db.save();
                    callback({
                        status: 200,
                        json: { res: "post" }
                    });
                }
            } else {
                callback({
                    status: 400,
                    json: {
                        res: "post",
                        error: "Bad request.",
                        message: "That api request is not good."
                    }
                });
            }
        }
    });
};

// //update rows
// DbHandler.prototype.updateRows = function(dbname, tablename, query, item) {
//     db.connect(file(dbname), [tablename]);
//     return db[tablename].update(query, item, { multi: true });
// };

//update row
DbHandler.prototype.updateRow = function(
    dbname,
    tablename,
    _id,
    inputObj,
    callback
) {
    var allItems = handler.findRows(dbname, tablename, {});
    var full_idName = "_id_" + dbname;
    var newObj = {};
    newObj[full_idName] = Number(_id);

    handler.getSettings(dbname, function(data, error) {
        if (error !== null) {
            callback({
                status: 500,
                json: {
                    res: "patch",
                    error: "Internal server error.",
                    message: "While getting user model settings.",
                    errorMessage: error
                }
            });
        } else {
            var settingsData = JSON.parse(data);
            var model = settingsData.user_models.find(function(params) {
                return params.routePath === tablename;
            });
            if (model !== undefined) {
                var modelValidationErrors = [];

                model.dataModel.forEach(function(item) {
                    var newItem = inputObj[item.columnName];
                    switch (item.type) {
                        case "label":
                            if (newItem === undefined || newItem === null) {
                                newObj[item.columnName] = null;
                            } else if (
                                typeof newItem === "string" ||
                                newItem instanceof String
                            ) {
                                newObj[item.columnName] = newItem;
                            } else {
                                modelValidationErrors.push({
                                    propName: item.columnName,
                                    type: "String|undefind|null",
                                    value: newItem
                                });
                            }

                            break;
                        case "pattern":
                            //todo
                            var regex = new RegExp(item.pattern);
                            if (newItem === undefined || newItem === null) {
                                newObj[item.columnName] = null;
                            } else if (regex.test(newItem)) {
                                newObj[item.columnName] = newItem;
                            } else {
                                modelValidationErrors.push({
                                    propName: item.columnName,
                                    type: item.pattern,
                                    value: newItem
                                });
                            }
                            break;
                    }
                });

                if (modelValidationErrors.length > 0) {
                    callback({
                        status: 400,
                        json: {
                            res: "patch",
                            error: "Bad request.",
                            message: "Request body data has fail validation.",
                            errorMessage: modelValidationErrors
                        }
                    });
                } else {
                    var db = new JsonDB(file(dbname), false, true);
                    result = db.getData("/" + tablename);
                    var updateItemIndex = result.findIndex(function(rItem) {
                        return rItem[full_idName] === newObj[full_idName];
                    });

                    db.push(
                        "/" + tablename + "[" + updateItemIndex + "]",
                        newObj,
                        false
                    );
                    db.save();

                    callback({
                        status: 200,
                        json: { res: "patch" }
                    });
                }
            } else {
                callback({
                    status: 400,
                    json: {
                        res: "patch",
                        error: "Bad request.",
                        message: "That api request is not good."
                    }
                });
            }
        }
    });
};

// //delete rows
// DbHandler.prototype.removeRows = function(dbname, tablename, query) {
//     db.connect(file(dbname), [tablename]);
//     return db[tablename].remove(query, true);
// };

// //delete row
// /////////////////
DbHandler.prototype.removeRow = function(dbname, tablename, _id) {
    var db = new JsonDB(file(dbname), false, true);

    var full_idName = "_id_" + dbname;
    result = db.getData("/" + tablename);

    var index = result.findIndex(function(rItem) {
        return rItem[full_idName] == _id;
    });

    if (index !== -1) {
        db.delete("/" + tablename + "[" + index + "]");
        db.save();
        return true;
    } else {
        return false;
    }
};

// //count rows
// DbHandler.prototype.countRows = function(dbname, tablename) {
//     db.connect(file(dbname), [tablename]);
//     return db[tablename].count();
// };

//
//
//

module.exports = handler;
