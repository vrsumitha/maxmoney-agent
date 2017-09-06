function locationListController($log, $rootScope, $scope, wydNotifyService, sessionService, $http) {
    var cmpId = 'locationListController', cmpName = 'Location Management';
    $log.info(cmpId + ' started ...');

    $rootScope.viewName = cmpName;

    var vm = this, uiState = {isReady: false, isBlocked: false, isValid: false};

    vm.agentCountries = sessionService.agentDetail.agents;

    $scope.$on('session:agents', function (event, data) {
        vm.agentCountries = sessionService.agentDetail.agents;
    });

    function submit() {
        vm.pageNo = 0;
        vm.itemEnd = vm.itemSize;
        vm.itemActive = 0;
        vm.message = 'Activated Locations\n';
        fetchLocations();
    }

    function fetchLocations() {
        $log.info('fetch locations started');
        vm.pageNo++;
        var path = sessionService.getApiBasePath() + '/locations?';
        path += '&size=' + vm.itemSize;
        path += '&page=' + vm.pageNo;
        path += '&status=inactive';
        path += '&country=' + vm.agentCountry.country;
        path += '&type=' + vm.agentType;
        var req = {
            method: 'GET',
            url: path,
            headers: {'api-key': $rootScope.sessionId}
        };
        // $log.info(req);
        $http(req).then(function (res) {
           // $log.debug(res);
            $log.debug('fetch locations finished with success.');
            vm.items = res.data.locations;
            vm.itemEnd = res.data.end;
            vm.itemCount = 0;
            if(vm.pageNo === 1) {
                vm.itemTotal = res.data.total;
                vm.itemInactive = res.data.total;
            }
        }, function (res) {
            $log.error(res);
            $log.debug('fetch locations finished with failure.');
        });
    }

    function makeActive() {
        console.log('itemEnd: ' + vm.itemEnd + ' itemTotal: ' + vm.itemTotal + ' itemCount: ' + vm.itemCount + ' itemLength: ' + vm.items.length);
        if (vm.itemCount <= vm.items.length && vm.itemEnd <= vm.itemTotal) {
            fetchLocations();
        }
        _.forEach(vm.items, function (item) {
            //console.log(item);
            var path = sessionService.getApiBasePath() + '/locations/' + item.code;
            var req = {
                method: 'PUT',
                url: path,
                headers: {'api-key': $rootScope.sessionId, 'Content-Type': 'application/x-www-form-urlencoded'},
                transformRequest: function (obj) {
                    var str = [];
                    for (var p in obj) {
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    }
                    return str.join("&");
                },
                data: {'status': 'active'}
            };
            // $log.info(req);
            $http(req).then(function (res) {
                $log.debug(res);
                vm.itemCount++;
                //vm.itemActive = vm.itemEnd - vm.itemSize + vm.itemCount;
                if (vm.itemInactive > 0) {
                    vm.itemInactive--;
                    vm.itemActive++;
                }
                vm.message += res.data.name + ' ( ' + res.data.code + ' )\n';
            }, function (res) {
                $log.error(res);
            });
        });
    }

    function init() {
        $log.info('init started...');

        vm.itemSize = 100;
        vm.pageNo = 0;
        vm.itemCount = 0;
        vm.itemEnd = vm.itemSize;
        vm.itemTotal = 0;
        vm.itemActive = 0;
        vm.itemInactive = 0;
        console.log(vm.agentCountries);

        $log.info('init finished...');
    }

    angular.extend(this, {
        uiState: uiState,
        submit: submit,
        makeActive: makeActive
    });

    init();

    $log.info(cmpId + 'finished...');
}
locationListController.$inject = ['$log', '$rootScope', '$scope', 'wydNotifyService', 'sessionService', '$http'];
appControllers.controller('locationListController', locationListController);