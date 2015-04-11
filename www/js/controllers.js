angular.module('ionicParseApp.controllers', [])

.controller('AppController', function($scope, $state, $rootScope, $ionicHistory, $stateParams) {
    if ($stateParams.clear) {
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
    }

    $scope.logout = function() {
        Parse.User.logOut();
        $rootScope.user = null;
        $rootScope.isLoggedIn = false;
        $state.go('welcome', {
            clear: true
        });
    };
})

.controller('WelcomeController', function($scope, $state, $rootScope, $ionicHistory, $stateParams) {
    if ($stateParams.clear) {
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
    }

    $scope.login = function() {
        $state.go('app.login');
    };

    $scope.signUp = function() {
        $state.go('app.register');
    };

    if ($rootScope.isLoggedIn) {
        $state.go('app.home');
    }
})

.controller('HomeController', function($scope, $state, $rootScope) {

    if (!$rootScope.isLoggedIn) {
        $state.go('welcome');
    }
    scope_home = $scope;
})

.controller('TripController', function($scope, $state, $rootScope, $compile, $ionicLoading) {

    if (!$rootScope.isLoggedIn) {
        $state.go('welcome');
    }

    console.log("Hi", $scope.user.attributes.email);
    scope_trip = $scope;
    initialize = function () {
      //var startlocation = new google.maps.LatLng(55.9879314,-4.3042387);
      var startLocation = new google.maps.LatLng(42.3503446, -71.0571948)
      //var end = new google.maps.LatLng(55.8934378,-4.2201905);

      var mapOptions = {
        streetViewControl:true,
        center: startLocation,
        zoom: 18,
        //mapTypeId: google.maps.MapTypeId.TERRAIN
      };
      var map = new google.maps.Map(document.getElementById("map"),
          mapOptions);

      //Marker + infowindow + angularjs compiled ng-click
      

      $scope.map = map;
      var GeoMarker = new GeolocationMarker(map);

      // var directionsService = new google.maps.DirectionsService();
      // var directionsDisplay = new google.maps.DirectionsRenderer();

      // var request = {
      //     origin : site,
      //     destination : hospital,
      //     travelMode : google.maps.TravelMode.DRIVING
      // };
      // directionsService.route(request, function(response, status) {
      //     if (status == google.maps.DirectionsStatus.OK) {
      //         directionsDisplay.setDirections(response);
      //     }
      // });

      // directionsDisplay.setMap(map);
    }


    google.maps.event.addDomListener(window, 'load', initialize());

    $scope.centerOnMe = function() {
        if(!$scope.map) {
          return;
        }

        $scope.loading = $ionicLoading.show({
          content: 'Getting current location...',
          template: 'hi',
          showBackdrop: true
        });
        navigator.geolocation.getCurrentPosition(function(pos) {
          $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
          $scope.loading.hide();
        }, function(error) {
          alert('Unable to get location: ' + error.message);
        });
    };

    $scope.clickTest = function() {
    alert('Example of infowindow with ng-click')
    };
})

.controller('EndTripController', function($scope, $state, $rootScope) {

    if (!$rootScope.isLoggedIn) {
        $state.go('welcome');
    }
    scope_end = $scope;
})

.controller('LoginController', function($scope, $state, $rootScope, $ionicLoading, $http) {
    $scope.user = {
        username: null,
        password: null
    };

    $scope.error = {};
    $scope.name = "hi";
    $scope.login = function() {
        $scope.loading = $ionicLoading.show({
            content: 'Logging in',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });

        var user = $scope.user;
        Parse.User.logIn(('' + user.username).toLowerCase(), user.password, {
            success: function(user) {
                $ionicLoading.hide();
                $rootScope.user = user;
                $rootScope.isLoggedIn = true;
                $state.go('app.home', {
                    clear: true
                });
            },
            error: function(user, err) {
                $ionicLoading.hide();
                // The login failed. Check error to see why.
                if (err.code === 101) {
                    $scope.error.message = 'Invalid login credentials';
                } else {
                    $scope.error.message = 'An unexpected error has ' +
                        'occurred, please try again.';
                }
                $scope.$apply();
            }
        });
    };

    $scope.forgot = function() {
        $state.go('app.forgot');
    };
})

.controller('ForgotPasswordController', function($scope, $state, $ionicLoading) {
    $scope.user = {};
    $scope.error = {};
    $scope.state = {
        success: false
    };

    $scope.reset = function() {
        $scope.loading = $ionicLoading.show({
            content: 'Sending',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });

        Parse.User.requestPasswordReset($scope.user.email, {
            success: function() {
                // TODO: show success
                $ionicLoading.hide();
                $scope.state.success = true;
                $scope.$apply();
            },
            error: function(err) {
                $ionicLoading.hide();
                if (err.code === 125) {
                    $scope.error.message = 'Email address does not exist';
                } else {
                    $scope.error.message = 'An unknown error has occurred, ' +
                        'please try again';
                }
                $scope.$apply();
            }
        });
    };

    $scope.login = function() {
        $state.go('app.login');
    };
})

.controller('RegisterController', function($scope, $state, $ionicLoading, $rootScope) {
    $scope.user = {};
    $scope.error = {};

    $scope.register = function() {

        // TODO: add age verification step

        $scope.loading = $ionicLoading.show({
            content: 'Sending',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });

        var user = new Parse.User();
        user.set("username", $scope.user.email);
        user.set("password", $scope.user.password);
        user.set("email", $scope.user.email);

        user.signUp(null, {
            success: function(user) {
                $ionicLoading.hide();
                $rootScope.user = user;
                $rootScope.isLoggedIn = true;
                $state.go('app.home', {
                    clear: true
                });
            },
            error: function(user, error) {
                $ionicLoading.hide();
                if (error.code === 125) {
                    $scope.error.message = 'Please specify a valid email ' +
                        'address';
                } else if (error.code === 202) {
                    $scope.error.message = 'The email address is already ' +
                        'registered';
                } else {
                    $scope.error.message = error.message;
                }
                $scope.$apply();
            }
        });
    };
})

.controller('CostCreationController', function($scope, $state, $rootScope) {
    //TODO: cost calculation

    console.log('tetst');
    $scope.rideCost = 10.00;
})

.controller('MainController', function($scope, $state, $rootScope, $stateParams, $ionicHistory) {
    if ($stateParams.clear) {
        $ionicHistory.clearHistory();
    }

    $scope.rightButtons = [{
        type: 'button-positive',
        content: '<i class="icon ion-navicon"></i>',
        tap: function(e) {
            $scope.sideMenuController.toggleRight();
        }
    }];

    $scope.logout = function() {
        Parse.User.logOut();
        $rootScope.user = null;
        $rootScope.isLoggedIn = false;
        $state.go('welcome', {
            clear: true
        });
    };

    $scope.toggleMenu = function() {
        $scope.sideMenuController.toggleRight();
    };
})

.controller('CarController', function($scope, fuelecoAPIservice) {
    $scope.colors = [
      {name:'black', shade:'dark'},
      {name:'white', shade:'light', notAnOption: true},
      {name:'red', shade:'dark'},
      {name:'blue', shade:'dark', notAnOption: true},
      {name:'yellow', shade:'light', notAnOption: false}
    ];

    $scope.yearsList = [];
    $scope.msg = "failed :(";
    fuelecoAPIservice.getYears().success(function (response) {
        $scope.msg = "succeeded! :D";
    });
});
