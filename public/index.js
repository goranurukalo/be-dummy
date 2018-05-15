// create the module and name it beDummy
var beDummy = angular.module("beDummy", [
    "ngRoute",
    "LocalStorageModule",
    "ngCookies",
    "ng.jsoneditor"
]);

// configure our routes
beDummy
    .config(function($locationProvider) {
        $locationProvider.html5Mode(true);
    })
    .config(function($routeProvider) {
        $routeProvider
            .when("/", {
                templateUrl: "assets/source/views/home.html",
                controller: "homeController"
            })
            .when("/models", {
                templateUrl: "assets/source/views/models.html",
                controller: "modelController"
            })
            .when("/documentation", {
                templateUrl: "assets/source/views/documentation.html",
                controller: "documentationController"
            })
            .when("/quick-postman", {
                templateUrl: "assets/source/views/quickPostman.html",
                controller: "quickPostmanController"
            });
    })
    .config(function(localStorageServiceProvider) {
        localStorageServiceProvider.setPrefix("be_dummy_models");
    });

// create directives
beDummy.directive("customOnChange", function() {
    return {
        restrict: "A",
        link: function(scope, element, attrs) {
            var onChangeHandler = scope.$eval(attrs.customOnChange);
            element.on("change", onChangeHandler);
            element.on("$destroy", function() {
                element.off();
            });
        }
    };
});

// create filters
beDummy.filter("trust", [
    "$sce",
    function($sce) {
        return function(htmlCode) {
            return $sce.trustAsHtml(htmlCode);
        };
    }
]);
