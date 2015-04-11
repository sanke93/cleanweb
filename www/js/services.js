angular.module('ionicParseApp.services', [])

.factory('fuelecoAPIservice', function($http) {

    var fuelecoAPI = {};

    fuelecoAPI.getYears = function() {

      data= $http({
        method: 'GET',
        //url: 'http://ergast.com/api/f1/2013/driverStandings.json?callback=JSON_CALLBACK'
        //url: 'http://rest-service.guides.spring.io/greeting'
        url: 'http://www.fueleconomy.gov/ws/rest/vehicle/menu/year'
      });
      console.log(data)
      return data;
    }

    return fuelecoAPI;
});
