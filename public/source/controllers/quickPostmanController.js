beDummy.controller("quickPostmanController", function($scope) {
    //TODO
    $scope.apiUrl = "";
    $scope.methodType = "GET";
    $scope.requestBodyOptions = { mode: "code" };
    $scope.editorIstance = null;
    $scope.requestBody = null;

    $scope.responseData = "";

    $scope.sendRequest = function() {
        try {
            var url = document.location.origin + "/api/" + $scope.apiUrl;

            var requestBodyText = $scope.editorIstance.getText();
            var data = JSON.parse(
                requestBodyText !== "" ? requestBodyText : null
            );
            if (
                (data !== null && typeof data === "object") ||
                (data !== null && Array.isArray(data))
            ) {
                data = JSON.stringify(data);
            }

            $.ajax({
                url: url,
                data: data,
                type: $scope.methodType,
                dataType: "json",
                contentType: "application/json",
                success: function(data) {
                    window.successAlert("Request succeeded!");
                    $scope.responseData = JSON.stringify(data, null, 2);
                    $scope.$apply();
                },
                error: function(error) {
                    console.log(error);
                    window.errorAlert(
                        `Request error.
                        [Status: ${error.status}
                        - Status text: ${error.statusText}
                        - Url: ${url}]`
                    );
                    window.errorAlert(error.responseText);
                }
            });
        } catch (e) {
            window.errorAlert("Global: " + e.message);
        }
    };

    $scope.reset = function() {
        $scope.apiUrl = "";
        $scope.methodType = "GET";
        $scope.requestBody = null;

        $scope.responseData = "";
    };

    $scope.jsoneditorLoad = function(istance) {
        $scope.editorIstance = istance;
        $(".jsoneditor-menu").text("");
    };
});
