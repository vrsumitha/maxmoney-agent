function transferRatesListController($log, $rootScope, $scope, wydNotifyService, storageService, sessionService, $http) {
    var cmpId = 'transferRatesListController', cmpName = 'Transfer Rates';
    $log.info(cmpId + ' started ...');

    $rootScope.viewName = cmpName;

    var vm = this, uiState = {isReady: false, isBlocked: false, isValid: false};
    vm.currencies = [];

    function loadRates() {
        $log.debug('loadRates started...');

        _.forEach(vm.currencies, function(item) {
            var path = sessionService.getApiBasePath() + item.apiSuffix;
            var req = {
                method: 'GET',
                url: path,
                headers: {'api-key': $rootScope.sessionId}
            };
           // $log.info(req);
            $http(req).then(function (res) {
                $log.debug(res);
                $log.debug('loadRate ' + item.code + ' finished with success.');
                item.transferRate = res.data[item.code + '_tt'];
            }, function (res) {
                $log.error(res);
                $log.debug('loadRate ' + item.code + ' finished with failure.');
            });
        });
        $log.debug('loadRates finished...');
    }

    function init() {
        $log.info('init started...');

        var cur = {};
        cur.code = 'php';
        cur.country = 'Philipines';
        cur.apiSuffix = '/boards/moos/rates/' + cur.code;
        cur.transferRate = 0;
        vm.currencies.push(cur);

        cur = {};
        cur.code = 'inr';
        cur.country = 'India';
        cur.apiSuffix = '/boards/moos/rates/' + cur.code;
        cur.transferRate = 0;
        vm.currencies.push(cur);

        cur = {};
        cur.code = 'pkr';
        cur.country = 'pakistan';
        cur.apiSuffix = '/boards/moos/rates/' + cur.code;
        cur.transferRate = 0;
        vm.currencies.push(cur);

        cur = {};
        cur.code = 'idr';
        cur.country = 'Indonesia';
        cur.apiSuffix = '/boards/moos/rates/' + cur.code;
        cur.transferRate = 0;
        vm.currencies.push(cur);

        cur = {};
        cur.code = 'npr';
        cur.country = 'Nepals';
        cur.apiSuffix = '/boards/moos/rates/' + cur.code;
        cur.transferRate = 0;
        vm.currencies.push(cur);
        console.log(vm.currencies);
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