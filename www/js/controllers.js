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

    $rootScope.hasCar = false;

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

.controller('HomeController', function($scope, $state, $rootScope, venmoAPIFactory) {
    if (!$rootScope.isLoggedIn) {
        $state.go('welcome');
    }

    var Car = Parse.Object.extend('Car');
    var query = new Parse.Query(Car);
    query.equalTo("user", Parse.User.current());
    query.count({
      success: function(number) {
        if (number > 0)
          $rootScope.hasCar = true;
      },
      error: function(error) {
        alert("Error: " + error.code + " " + error.message);
      }
    });

    scope_home = $scope;
    $scope.venmo = venmoAPIFactory;
    if (venmoAPIFactory.isAuthenticated)
        venmoAPIFactory.getUserProfile();

    if (!venmoAPIFactory.isAuthenticated && window.location.search) {
        var string = "?access_token="
        var accessToken = window.location.search.substring(string.length, window.location.search.length);
        venmoAPIFactory.setAccessToken(accessToken);

        venmoAPIFactory.getUserProfile().then(function(response) {
            Parse.User.current().set('venmoUsername', venmoAPIFactory.userName);
            Parse.User.current().save(null, {success: function() {
                console.log('user saved');
            }})
        });
       
        // venmoAPIFactory.storeVenmoUsername();
    }

    $scope.venmoRedirect = function() {
        window.location = venmoAPIFactory.getUrl();
    }

    $scope.checkAuth = function() {
        return venmoAPIFactory.isAuthenticated;
    }


})

.controller('TripController', function($scope, $state, $rootScope, $compile, $ionicLoading, distanceTracker, $ionicPopup, current) {

    if (!$rootScope.isLoggedIn) {
        $state.go('welcome');
    }

    $scope.selectcar = function() {
      var showPopup = $ionicPopup.show({
        scope: $scope,
        title: 'Select Car',
        templateUrl: '/templates/selectcar.html'
      });
      showPopup.then(function(res) {
        console.log('Thank you for not eating my delicious ice cream cone');
      });
    }

    console.log("Hi", $scope.user.attributes.email);
    scope_trip = $scope;
    dist_track = distanceTracker;
    hi = current;
    initialize = function () {
      $scope.selectcar();
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
        $scope.selectcar();
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
            success: function(tripSaved) {
                console.log('trip save', tripSaved);
                $scope.currentTrip = tripSaved
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
        distanceTracker.startWatcher()
        $ionicLoading.hide();

    };

    $scope.endtrip = function(){
        console.log("end", $scope.geoMarker);
        distanceTracker.stopWatcher()
           var alertPopup = $ionicPopup.alert({
             title: 'Trip Details',
             template: 'Total Distance: '+ distanceTracker.getDistance(),
           });
           alertPopup.then(function(res) {
             console.log('Thank you for not eating my delicious ice cream cone');
           });


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
            success: function(tripSaved) {
                console.log('trip saved', tripSaved);
                $scope.currentTrip = tripSaved;
                current.tripUpdate($scope.currentTrip);
            }
        })


    }

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

.controller('CostCreationController', function($scope, $state, $rootScope, venmoAPIFactory) {
    //TODO: cost calculation
    $scope.Parse = Parse;
    var venmoPayer = Parse.Object.extend('venmoPayer')
    var venmoPayerQuery = new Parse.Query(venmoPayer)
    venmoPayerQuery.equalTo("user", $scope.user);
    venmoPayerQuery.find({
        success: function(results) {
            console.log('results', results);
            $scope.currentUserVenmoPayer = results[0];
        }
    })
    blahblah = $scope;
    $scope.data = {};

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
        for (index in $scope.payerList) {
            payer = $scope.payerList[index];
            payer.save(null, {
                success: function(payer) {
                    console.log('payer', payer, $scope.rideCost);
                    var Payment = $scope.Parse.Object.extend('Payment')
                    var payment = new Payment();
                    payment.set('amount', $scope.rideCost/($scope.payerList.length + 1))
                    payment.set('paidTowards', cost);
                    payment.set('paidTo', $scope.currentUserVenmoPayer);
                    payment.set('paidBy', payer);
                    payment.save(null, {
                        success: function(payment) {
                            console.log('payment saved', payment);
                        }
                    })
                }
            })
        }
        
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

.controller('SelectCarController', function($scope) {

    $scope.userCars = {};

    var Car = Parse.Object.extend('Car');
    var query = new Parse.Query(Car);
    query.equalTo("user", Parse.User.current());
    query.descending("avgMPG");
    query.find({
      success: function(results) {
        $scope.cars = results;
      },
      error: function(error) {
        alert("Error: " + error.code + " " + error.message);
      }
    });

    $scope.updateCarStats = function() {
        $scope.carInfo = $scope.userCars.car.attributes;
        console.log($scope.carInfo);
        console.log($scope.carInfo.make);
    };
})

.controller('CarController', function($scope, fuelecoAPIservice) {
    $scope.carData = {};

    //Helper Functions
    $scope.reset = function(setYear, setMake, setModel, setEngine) {
        if (setYear)
          $scope.carData.carYear = '';
        if (setMake)
          $scope.carData.carMake = '';
        if (setModel)
          $scope.carData.carModel = '';
        if (setEngine)
          $scope.carData.carEngine = '';
    }

    $scope.listify = function(obj, value) {
        if (obj == undefined)
          return [value];
        return value;
    };
    //End Helpers

    $scope.reset(true, true, true, true);

    fuelecoAPIservice.getYears().success(function (response) {
        console.log("Year Service: succeeded.");
        $scope.years = response.menuItem;
        $scope.reset(false, true, true, true);
    });

    $scope.updateMake = function() {
        fuelecoAPIservice.getMakes($scope.carData.carYear.value).success(function (response) {
            console.log("Make Service: succeeded.");
            $scope.makes = $scope.listify(response.menuItem.length, response.menuItem);
            $scope.reset(false, false, true, true);
        });
    };

    $scope.updateModel = function() {
        fuelecoAPIservice.getModels($scope.carData.carYear.value, $scope.carData.carMake.value).success(function (response) {
            console.log("Model Service: succeeded.");
            $scope.models = $scope.listify(response.menuItem.length, response.menuItem);
            $scope.reset(false, false, false, true);
        });
    };

    $scope.updateEngine = function() {
        fuelecoAPIservice.getVehicles($scope.carData.carYear.value, $scope.carData.carMake.value, $scope.carData.carModel.value).success(function (response) {
            console.log("Vehicle Service: succeeded.");
            $scope.vehicles = $scope.listify(response.menuItem.length, response.menuItem);
        });
    };

    $scope.addCar = function() {
      if ($scope.carData.carEngine.value != undefined &&
          $scope.carData.carEngine.value != "") {
            var Car = Parse.Object.extend('Car');
            var car = new Car();

            fuelecoAPIservice.getVehicleMPG($scope.carData.carEngine.value).success(function (response) {
                console.log("Vehicle MPG Service: succeeded.");
                $scope.avgMPG = response.avgMpg;
            });

            fuelecoAPIservice.getVehicleInfo($scope.carData.carEngine.value).success(function (response) {
                console.log("Vehicle Info Service: succeeded.");
                $scope.gasType = response.fuelType;
                if ($scope.avgMPG == undefined)
                {
                  $scope.avgMPG = (parseFloat(response.UCity) + parseFloat(response.UHighway))/2.0;
                }

                car.set('user', $scope.user);
                car.set('dbId', $scope.carData.carEngine.value);
                car.set('avgMPG', $scope.avgMPG.toString());
                car.set('gasType', $scope.gasType);
                car.set('make', $scope.carData.carMake.value);
                car.set('model', $scope.carData.carModel.value);
                car.set('year', parseInt($scope.carData.carYear.value));

                car.save(null, {
                    success: function(car) {
                        console.log('car', car);
                    }
                })
            });
          }
      };
});
