angular.module('ionicParseApp.services', [])

.factory('fuelecoAPIservice', function($http) {

    var fuelecoAPI = {};

    fuelecoAPI.getYears = function() {
      return $http({
        method: 'GET',
        url: 'http://www.fueleconomy.gov/ws/rest/vehicle/menu/year'
      });
    },
    fuelecoAPI.getMakes = function(year) {
      return $http({
        method: 'GET',
        url: 'http://www.fueleconomy.gov/ws/rest/vehicle/menu/make?year=' + year
      });
    },
    fuelecoAPI.getModels = function(year, make) {
      return $http({
        method: 'GET',
        url: 'http://www.fueleconomy.gov/ws/rest/vehicle/menu/model?year=' + year + '&make=' + make
      });
    },
    fuelecoAPI.getVehicles = function(year, make, model) {
      return $http({
        method: 'GET',
        url: 'http://www.fueleconomy.gov/ws/rest/vehicle/menu/options?year=' + year + '&make=' + make + '&model=' + model
      });
    },
    fuelecoAPI.getVehicleInfo = function(vehicleId) {
      return $http({
        method: 'GET',
        url: 'http://www.fueleconomy.gov/ws/rest/vehicle/' + vehicleId
      });
    },
    fuelecoAPI.getVehicleMPG = function(vehicleId) {
      return $http({
        method: 'GET',
        url: 'http://www.fueleconomy.gov/ws/rest/ympg/shared/ympgVehicle/' + vehicleId
      });
    },
    fuelecoAPI.getFuelPrices = function() {
      return $http({
        method: 'GET',
        url: 'http://www.fueleconomy.gov/ws/rest/fuelprices'
      });
    }

    return fuelecoAPI;
})

.factory('distanceTracker', function($http, $rootScope) {

    //var distance = {};
    var tracker = {}
    
    var watchID;
    var watchCallback;
    var coords = [];
    var distance = 0;
    tracker.distance = 0;

    tracker.calculateDistance = function(fromPos, toPos) {
          //var radius = 6371;
          //miles
          var radius = 3958.76; 

          var toRad = function(number) {
              return number * Math.PI / 180;
          };

          var latDistance = toRad(toPos.latitude - fromPos.latitude);
          var lonDistance = toRad(toPos.longitude - fromPos.longitude);
          var a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2) + 
                  Math.cos(toRad(fromPos.latitude)) * Math.cos(toRad(toPos.latitude)) * 
                  Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);

          return radius * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))); 
      }

    tracker.displayError = function (error) {
        alert("Error occurred. Error code: " + error.code);
        // error.code can be:
        //   0: unknown error
        //   1: permission denied
        //   2: position unavailable (error response from locaton provider)
        //   3: timed out
    }

    tracker.appendPosition = function (position) {
        // Calculate distance from last position if available
        var lastPos = coords[coords.length-1];
        if(lastPos) {
            distance += tracker.calculateDistance(lastPos, position.coords);
            console.log("distance", distance, position.coords);
            $rootScope.map.panTo(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
            //$rootScope.map.panTo(55.9879314,-4.3042387);
        }

        // Add new coordinates to array
        coords.push(position.coords);

        // Call custom callback
        if(watchCallback) {
            watchCallback(position, distance, watchID);
        }
    }

    tracker.startWatcher = function (callback, options) {
        console.log("started")
        if ("geolocation" in navigator) {
            // Watch position updates
            watchCallback = callback;
            // Watch for updates
            watchID = navigator.geolocation.watchPosition(tracker.appendPosition, tracker.displayError, options);
            var registerWatchPosition = function(position) {
                tracker.appendPosition(position);
            };
        } else {
            alert('Geolocation is not supported!');
        }
    }

    tracker.forceUpdate= function (options) {
        navigator.geolocation.getCurrentPosition(appendPosition, displayError, options);
    }

    tracker.stopWatcher = function()  {
        console.log("stop tracker", distance)
        tracker.distance = distance;
        navigator.geolocation.clearWatch(watchID);
    }

    tracker.getDistance = function(){
      return distance;
    }


    return tracker;
})

.factory('venmoAPIFactory', function($http) {
    var venmo = {}
    venmo.oAuth_url = "https://api.venmo.com/v1/oauth/authorize?client_id=2532&scope=make_payments%20access_profile%20access_friends";

    venmo.getUrl = function() {
        return venmo.oAuth_url;
    }

    venmo.setAccessToken = function(token) {
        venmo.accessToken = token;
    }

    venmo.setVenmoUserId = function(id) {
        venmo.venmoUserId = id;
    }

    venmo.getAccessToken = function() {
        return venmo.accessToken;
    }

    venmo.getFriends = function() {
        return $http({
          method: 'GET',
          url: "https://api.venmo.com/v1/users/"+venmo.userId+"/friends?access_token="+venmo.getAccessToken()
        }).success(function(response) {
          return response.data;
        })
    }

    venmo.getUserProfile = function() {
        return $http({
          method: 'GET',
          url: "https://api.venmo.com/v1/me?access_token="+venmo.getAccessToken()
        }).success(function(response) {
          venmo.isAuthenticated = true;
          venmo.userName = response.data.user.username;
          venmo.userId = response.data.user.id;
        }).error(function(err) {
          venmo.isAuthenticated = false;
          venmo.userName = undefined;
          venmo.userId = undefined;
        });
    }

    venmo.checkAuth = function() {
        return venmo.isAuthenticated;
    }
    if (venmo.accessToken) {
        return $http({
          method: 'GET',
          url: "https://api.venmo.com/v1/me?access_token="+venmo.getAccessToken()
        }).success(function(response) {
          venmo.isAuthenticated = true;
          venmo.userName = response.data.user.username;
        }).error(function(err) {
          venmo.isAuthenticated = false;
          venmo.userName = undefined;
        });
    }

    else venmo.isAuthenticated = false;
    return venmo;
})

.factory('current', function($http) { 
    var current = {}
    var trip = {}
    current.tripUpdate = function(_trip){
      //console.log(trip1);
      trip = _trip;
    }
    current.tripGet = function(){
      return trip;
    }
    return current

});
