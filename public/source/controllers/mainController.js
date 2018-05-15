beDummy.controller("mainController", function(
    $scope,
    $http,
    localStorageService,
    $cookies
) {
    // 0 - down
    // 1 - prepearing
    // 2 - ready
    $scope.apiState = 0;
    //this is explanation of api status
    //api is ready for use, api down, you dont have models, etc
    $scope.apiTitle = "API Down.";

    $scope.initToken = function() {
        if (
            $cookies.get("token") === undefined ||
            $cookies.get("token") === null
        ) {
            $http.get("/user/token").then(
                function(response, status) {
                    var time = new Date();
                    time.setTime(time.getTime() + 30 * 60000);

                    $cookies.put("token", response.data.token, {
                        expires: time
                    });
                    //clear old stuff
                    localStorageService.clearAll();
                    //check with api is he good
                    $scope.hasActiveApi();
                },
                function(response, status) {
                    errorAlert(response.data.error);
                }
            );
        } else {
            //check api
            $scope.hasActiveApi();
        }
    };

    $scope.hasActiveApi = function() {
        var models = localStorageService.get("user_models");

        $scope.apiState = 1;
        $scope.apiTitle = "Checking API";

        $http.post("/user/has-api", { models: models }).then(
            function(response, status) {
                $scope.handleApiStatusResponse(response.data);
            },
            function(response, status) {
                errorAlert(response.statusText);
                $scope.handleApiStatusResponse(response.data);
            }
        );
    };

    $scope.handleApiStatusResponse = function(response) {
        if (response !== null && response.apiState !== undefined) {
            $scope.apiState = response.apiState;
        }
        if (response !== null && response.apiTitle !== undefined) {
            $scope.apiTitle = response.apiTitle;
        }
    };

    $scope.init = function() {
        $scope.initToken();
    };

    $scope.init();

    $scope.$on("handle-api-status", function(event, args) {
        if (args !== undefined && args !== null) {
            $scope.handleApiStatusResponse(args);
        }
    });
});
