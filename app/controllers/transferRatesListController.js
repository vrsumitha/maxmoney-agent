function transferRatesListController($log, $rootScope, $scope, wydNotifyService, storageService, sessionService, $http) {
    var cmpId = 'transferRatesListController', cmpName = 'Transfer Rates';
    $log.info(cmpId + ' started ...');

    $rootScope.viewName = cmpName;

    var vm = this, uiState = {isReady: false, isBlocked: false, isValid: false};
    vm.currencies = [];

    function processRates(rates) {
      //  console.log(rates);
        var keys = _.keys(rates);
        _.forEach(keys, function(key) {
            //console.log(key + ' = ' + rates[key]);
            if(key.endsWith('_country') && rates[key]) {
                //console.log(key + ' = ' + rates[key]);
                var cur = {};
                cur.code = key.substr(0, 3);
                cur.country = rates[cur.code + '_country'];
                cur.transferRate = rates[cur.code + '_tt'];
                cur.time = rates[cur.code + '_time'];
                vm.currencies.push(cur);
            }
        });
    }

    function loadRates() {
        $log.debug('loadRates started...');

            var path = sessionService.getApiBasePath() + '/boards/moos';
            var req = {
                method: 'GET',
                url: path,
                headers: {'api-key': $rootScope.sessionId}
            };
           // $log.info(req);
            $http(req).then(function (res) {
               // $log.debug(res);
               // $log.debug('loadRates finished with success.');
                processRates(res.data);
            }, function (res) {
                $log.error(res);
                $log.debug('loadRates finished with failure.');
            });
        $log.debug('loadRates finished...');
    }

    function init() {
        $log.info('init started...');

        loadRates();

        $log.info('init finished...');
    }

    angular.extend(this, {
        uiState: uiState
    });

    init();

    $log.info(cmpId + 'finished...');

}
transferRatesListController.$inject = ['$log', '$rootScope', '$scope', 'wydNotifyService', 'storageService', 'sessionService', '$http'];
appControllers.controller('transferRatesListController', transferRatesListController);