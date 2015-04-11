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
    }

    return fuelecoAPI;
});
