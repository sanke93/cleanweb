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
});
