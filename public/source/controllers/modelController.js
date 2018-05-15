beDummy.controller("modelController", function(
    $scope,
    localStorageService,
    $http,
    $cookies,
    $rootScope
) {
    //all models
    $scope.models = [];
    //index of model in model array
    //this is used to edit selected item
    $scope.editModel = null;
    $scope.hasUserDataModel = false;
    $scope.modelIdToDelete = null;

    //show types data
    $scope.typesListData = null;

    $scope.init = function(items = null) {
        if (items !== null) {
            localStorageService.set("user_models", items);
        }
        var models = localStorageService.get("user_models");
        if (models !== undefined && models !== null) {
            $scope.models = models;
        }
    };

    $scope.init();

    $scope.addModel = function(model) {
        $scope.models.push(model);
        localStorageService.set("user_models", $scope.models);
    };

    $scope.setItemIdToDelete = function(key) {
        $scope.modelIdToDelete = key;
    };

    $scope.removeModel = function() {
        var key = $scope.modelIdToDelete;
        if (key !== null) {
            //TODO
            // get model name from models and
            // send it to api to remove it
            var model = $scope.models[key];
            //console.log("remove model data ", model);
            console.log("modle", model);
            $http
                .delete("/user/delete-model/" + model.routePath, {
                    model: model
                })
                .then(
                    function(response, status) {
                        $rootScope.$broadcast(
                            "handle-api-status",
                            response.data
                        );
                    },
                    function(response, status) {
                        errorAlert(response.data.error);
                    }
                );

            $scope.models.splice(key, 1);
            localStorageService.set("user_models", $scope.models);

            window.successAlert("Model removed successfuly!");
            $scope.modelIdToDelete = null;
        }
    };

    $scope.setModelIndex = function(key) {
        $scope.hasUserDataModel = false;
        $scope.removeModelIndex();
        $scope.editModel = angular.copy($scope.models[key]);
        $scope.editModel.key = key;
    };

    $scope.removeModelIndex = function() {
        $("#userDataModel").html("");
        $scope.editModel = {
            idName: "",
            name: "",
            routePath: "",
            dataModel: []
        };
    };

    $scope.saveModel = function() {
        var key = $scope.editModel.key;

        //model exist
        if (key !== undefined) {
            $scope.models[key] = angular.copy($scope.editModel);
            $scope.models[key].idName = $scope.models[key].name
                .replace(/[\s-.]/g, "_")
                .toLowerCase();
            delete $scope.models.key;
            $scope.models[key].dataModel = $scope.getDataModels();
            $scope.sendModelToServerForUpdate($scope.models[key]);
            window.successAlert("Model updated successfuly!");
        } else {
            var obj = angular.copy($scope.editModel);
            obj.idName = obj.name.replace(/[\s-.]/g, "_").toLowerCase();
            obj.dataModel = $scope.getDataModels();

            $scope.models.push(obj);
            $scope.sendModelToServer(obj);
            $scope.removeModelIndex();
            window.successAlert("Model saved successfuly!");
        }
        localStorageService.set("user_models", $scope.models);
    };

    $scope.getDataModels = function() {
        var result = [];

        $("#userDataModel .card").each(function() {
            var type = $(this)
                .find(".type")
                .val();
            var obj = null;
            if (type === "label") {
                //get data for that model
                obj = {
                    columnName: $(this)
                        .find(".column_name")
                        .val(),
                    text: $(this)
                        .children("span")
                        .text(),
                    example: $(this)
                        .children("i")
                        .text()
                        .replace(/[()\s]/g, ""),
                    type: type,
                    id: $(this)
                        .find(".id")
                        .val()
                };
            } else if (type === "pattern") {
                //get data for that model
                obj = {
                    columnName: $(this)
                        .find(".column_name")
                        .val(),
                    pattern: $(this)
                        .find(".pattern_value")
                        .val(),
                    type: type
                };
            }
            if (obj !== null) {
                result.push(obj);
            }
        });

        return result;
    };

    $scope.initUserDataModel = function() {
        if ($scope.editModel === null || $scope.hasUserDataModel) {
            return;
        }
        $scope.hasUserDataModel = true;
        var el = "";
        for (item of $scope.editModel.dataModel) {
            if (item.type == "pattern") {
                el +=
                    `
                <div class="card">
                    <div class="input-group column-name">
                        <span class="input-group-addon">Pattern</span>
                        <input type="text" class="form-control pattern_value" value="` +
                    item.pattern +
                    `">
                    </div>
                    <div class="input-group column-name">
                        <span class="input-group-addon">Column name</span>
                        <input type="text" class="form-control column_name" value="` +
                    item.columnName +
                    `">
                    </div>
                    <input type="hidden" class="type" value="pattern" />
                </div>
            `;
            } else if (item.type == "label") {
                el +=
                    `
                <div class="card">
                    <span>` +
                    item.text +
                    `</span>
                    <i class="pull-right">( ` +
                    item.example +
                    ` )</i>
                    <div class="input-group column-name">
                    <span class="input-group-addon">Column name</span>
                    <input type="text" class="form-control column_name" value="` +
                    item.columnName +
                    `">
                    </div>
                    <input type="hidden" class="type" value="label" />
                    <input type="hidden" class="id" value="` +
                    item.id +
                    `" />
                </div>
                `;
            }
        }

        if (el !== "") {
            $("#userDataModel").append(el);
        }
    };

    $scope.downloadModels = function() {
        var element = document.createElement("a");
        element.setAttribute(
            "href",
            "data:application/json;charset=utf-8," +
                encodeURIComponent(JSON.stringify({ models: $scope.models }))
        );
        element.setAttribute("download", "beDummy_Models.json");

        element.style.display = "none";
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    };

    $scope.importModels = function(event) {
        if (event) {
            var files = event.target.files;
            if (files !== undefined && files.length > 0) {
                f = files[0];

                var reader = new FileReader();

                reader.onload = (function(theFile) {
                    return function(e) {
                        var items = JSON.parse(e.target.result);
                        if (items.models !== undefined) {
                            $scope.init(items.models);
                            window.successAlert("Models imported successfuly!");

                            $http
                                .post("/user/recreate-model", {
                                    models: items.models
                                })
                                .then(
                                    function(response, status) {
                                        console.log(
                                            "done - recreating models.",
                                            response
                                        );
                                        $rootScope.$broadcast(
                                            "handle-api-status",
                                            response.data
                                        );
                                    },
                                    function(response, status) {
                                        errorAlert(response.data.error);
                                    }
                                );
                        } else {
                            window.errorAlert("Bad file model!");
                        }
                    };
                })(f);

                reader.readAsText(f);
            }
        }
    };

    $scope.sendModelToServer = function(model) {
        if (
            $cookies.get("token") !== undefined ||
            $cookies.get("token") !== null
        ) {
            $http.post("/user/create-model", { models: model }).then(
                function(response, status) {
                    $rootScope.$broadcast("handle-api-status", response.data);
                },
                function(response, status) {
                    errorAlert(response.data.error);
                }
            );
        } else {
            infoAlert("Please refresh this page.");
        }
    };

    $scope.sendModelToServerForUpdate = function(model) {
        if (
            $cookies.get("token") !== undefined ||
            $cookies.get("token") !== null
        ) {
            $http.patch("/user/update-model", { model: model }).then(
                function(response, status) {
                    $rootScope.$broadcast("handle-api-status", response.data);
                },
                function(response, status) {
                    errorAlert(response.data.error);
                }
            );
        } else {
            infoAlert("Please refresh this page.");
        }
    };

    $scope.generateCode = function(type, modelKey) {
        var returnObj = null;
        switch (type.toUpperCase()) {
            case "POST":
            case "PATCH":
                returnObj = {};
                $scope.models[modelKey].dataModel.forEach(element => {
                    returnObj[element.columnName] = "...";
                });
                break;
            case "DELETE":
                returnObj = {
                    _id: "..."
                };
                break;
        }
        return JSON.stringify(returnObj, null, 2);
    };

    $scope.getMemorizeTypes = function() {
        if ($scope.typesListData === null)
            $scope.typesListData = TypesList(ModelTypesList).generate();

        return $scope.typesListData;
    };
    //controller end
});
