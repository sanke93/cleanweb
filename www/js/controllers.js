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
      $scope.startLocation = {}
      $scope.loading1 = $ionicLoading.show({
        content: 'Getting current location...',
        //template: 'hi',
        showBackdrop: true
      });
      navigator.geolocation.getCurrentPosition(function(pos) {

        $scope.startLocation = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        console.log("center", $scope.startLocation);

        var mapOptions = {
          streetViewControl:true,
          center: $scope.startLocation,
          zoom: 18,
          streetViewControl: false,
          panControl: false,
          zoomControl: false,
          mapTypeControl: false,
        };
        var map = new google.maps.Map(document.getElementById("map"),
            mapOptions);

        $scope.map = map;
        $scope.geoMarker = new GeolocationMarker(map);
        $ionicLoading.hide();
      }, function(error) {
        alert('Unable to get location: ' + error.message);
      });
      //var startLocation = new google.maps.LatLng(42.3503446, -71.0571948)
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


    $scope.starttrip = function() {
        //console.log("trip started", GeoMarker.position);
        $scope.tripStarted = true;
        var Trip = Parse.Object.extend('Trip');
        if(!$scope.map) {
          return;
        }

        var trip = new Trip();
        trip.set('driver', $scope.user);
       // trip.set('startPoint', ($scope.tripStarted.k, $scope.tripStarted.D));

        trip.set('startPoint', new Parse.GeoPoint({latitude: $scope.startLocation.k, longitude: $scope.startLocation.D}));
        //trip.set('startPoint', (12,32));
        trip.save(null, {
            success: function(trip) {
                console.log('trip', trip);
                $scope.currentTrip = trip
            }
        })
        var infowindow = new google.maps.InfoWindow({
              content: 'Start'
          });

        var marker = new google.maps.Marker({
          position: $scope.startLocation,
          map: $scope.map,
          title: 'Trip'
        });
        google.maps.event.addListener(marker, 'click', function() {
        infowindow.open($scope.map,marker);
        });

        $scope.loading = $ionicLoading.show({
          content: 'Getting current location...',
          //template: 'hi',
          showBackdrop: true
        });
        // navigator.geolocation.getCurrentPosition(function(pos) {
        //   $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
        //   $scope.loading.hide();
        // }, function(error) {
        //   alert('Unable to get location: ' + error.message);
        // });
        // $scope.watch('GeoMarker', function(val){
        //     if(!(typeof val.position === 'undefined')){
        //         $scope.map.setCenter(new google.maps.LatLng(GeoMarker.position.k, GeoMarker.position.D));
        //         $scope.loading.hide();
        //     }
        // });
        //$scope.map.setCenter(new google.maps.LatLng(GeoMarker.position.k, GeoMarker.position.D));
        //$scope.map.setCenter(new google.maps.LatLng(42.3503446, -71.0571948));
<<<<<<< HEAD
        
        $ionicLoading.hide();
        
=======

        $scope.loading.hide();

>>>>>>> bac39ba992968ead3700fac65d239c610a26bf08
    };

    $scope.endtrip = function(){
        console.log("end", $scope.geoMarker);
        var infowindow = new google.maps.InfoWindow({
              content: 'End Trip'
          });

        var marker = new google.maps.Marker({
          position: new google.maps.LatLng($scope.geoMarker.position.k, $scope.geoMarker.position.D),
          map: $scope.map,
          title: 'Trip'
        });
        google.maps.event.addListener(marker, 'click', function() {
        infowindow.open($scope.map,marker);
        });

        $scope.currentTrip.set('endPoint', new Parse.GeoPoint({latitude: $scope.geoMarker.position.k, longitude: $scope.geoMarker.position.D}));
        $scope.currentTrip.set('endedAt', new Date());
        //trip.set('startPoint', (12,32));
        $scope.currentTrip.save(null, {
            success: function(trip) {
                console.log('trip', trip);
                $scope.currentTrip = trip
            }
        })
    }

    // $scope.clickTest = function() {
    // alert('Example of infowindow with ng-click')
    // };
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
    var venmoPayer = Parse.Object.extend('venmoPayer')
    blahblah = $scope;
    $scope.data = {};

    console.log('tetst');
    $scope.rideCost = 10.00;
    $scope.data.venmoUsername = '';
    $scope.payerList = [];
    var Trip = Parse.Object.extend('Trip');
    var Cost = Parse.Object.extend('Cost');
    var CostComponent = Parse.Object.extend('CostComponent');

    var trip = new Trip();
    trip.set('driver', $scope.user)
    trip.save(null, {
        success: function(trip) {
            console.log('trip', trip);
        }
    })

    var cost = new Cost();
    cost.set('trip', trip)
    cost.save(null, {
        success: function(trip) {
            console.log('cost', cost);
        }
    })

    var costcomponent = new CostComponent();
    costcomponent.set('cost', cost)
    costcomponent.set('amount', 10)
    costcomponent.set('blurb', 'test')
    costcomponent.save(null, {
        success: function(trip) {
            console.log('costcomponent', costcomponent);
        }
    })

    $scope.removePayer = function(payerInstance, $index) {
        $scope.payerList.splice($index, 1);
    }

    $scope.addPayer = function() {
        $scope.payerInstance = new venmoPayer();
        $scope.payerInstance.set('venmoUsername', $scope.data.venmoUsername)
        $scope.payerList.push($scope.payerInstance);
    }

    $scope.createPayments = function() {
        var Payment = Parse.objects.extend('Payment')
        var payment = new Payment();
        payment.set('amount', $scope.rideCost/($scope.payerList.length + 1))
        payment.set('cost', cost);
        payment.set('')
    }
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
    $scope.carData = {};
    $scope.carData.carYear = '';
    $scope.carData.carMake = '';
    $scope.carData.carModel = '';
    $scope.carData.carEngine = '';

    $scope.yearService = "Year Service: failed.";
    fuelecoAPIservice.getYears().success(function (response) {
        $scope.yearService = "Year Service: succeeded.";
        $scope.years = response.menuItem;
    });

    $scope.listify = function(obj, value) {
        if (obj == undefined)
          return [value];
        return value;
    };

    $scope.updateMake = function() {
        $scope.makeService = "Make Service: failed."
        fuelecoAPIservice.getMakes($scope.carData.carYear.value).success(function (response) {
            $scope.makeService = "Make Service: succeeded."
            $scope.makes = $scope.listify(response.menuItem.length, response.menuItem);
        });
    };

    $scope.updateModel = function() {
        $scope.modelService = "Model Service: failed."
        fuelecoAPIservice.getModels($scope.carData.carYear.value, $scope.carData.carMake.value).success(function (response) {
            $scope.modelService = "Model Service: succeeded."
            $scope.models = $scope.listify(response.menuItem.length, response.menuItem);
        });
    };

    $scope.updateEngine = function() {
        scopetesting = $scope;
        $scope.vehicleService = "Vehicle Service: failed."
        fuelecoAPIservice.getVehicles($scope.carData.carYear.value, $scope.carData.carMake.value, $scope.carData.carModel.value).success(function (response) {
            $scope.vehicleService = "Vehicle Service: succeeded."
            $scope.vehicles = $scope.listify(response.menuItem.length, response.menuItem);
        });
    };

    $scope.addCar = function() {
        alert('Vehicle ID: ' + $scope.carData.carEngine.value);
    };
});
