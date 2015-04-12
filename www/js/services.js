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

.factory('distanceTracker', function($http) {

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
            console.log("distance", distance)
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

      // return {
      //     start: startWatcher,
      //     stop: stopWatcher,
      //     update: forceUpdate
      // };
    

    return tracker;
});
>>>>>>> bb63e14bc76bcca7f6b9d24c6b9a0c1cc1f49b32
