function customerListingController($log, $rootScope, $scope, wydNotifyService, storageService, sessionService, $location) {
    var cmpId = 'customerListingController', cmpName = 'Customers';
    $log.info(cmpId + ' started ...');

    $rootScope.viewName = cmpName;

    var vm = this, uiState = {isReady: false, isBlocked: false, isValid: false};

    function reload() {
        $log.info('reload started...');

        wydNotifyService.hide();
        vm.customers = [];

        if (vm.searchId) {
            var id = vm.searchId.toUpperCase();
            sessionService.getCustomer(id).then(function (res) {
                sessionService.currentCustomer = res.data;
                vm.customers = [res.data];
            }, function (res) {
                wydNotifyService.showError(res.data.message);
            });
        }

        $log.info('reload finished...');
    }

    function gotoCustomerUpdate(id) {
        $log.info('gotoCustomerUpdate started...');
        sessionService.currentCustomer = _.find(vm.customers, function (item) {
            return item.idNo === id
        });
        // storageService.saveCustomer(res.data);
        $location.path('/customers/' + id);
        $log.info('gotoCustomerUpdate finished...');
    }

    function init() {
        $log.info('init started...');
        reload();
        $log.info('init finished...');
    }

    angular.extend(this, {
        uiState: uiState,
        reload: reload,
        gotoCDD: gotoCustomerUpdate
    });

    // init();

    $log.info(cmpId + 'finished...');

}
customerListingController.$inject = ['$log', '$rootScope', '$scope', 'wydNotifyService', 'storageService', 'sessionService', '$location'];
appControllers.controller('customerListingController', customerListingController);

//function customerUpdateController($log, $rootScope, $scope, wydNotifyService, sessionService, $location, $routeParams) {
//    var cmpId = 'customerUpdateController', cmpName = 'Customers Update';
//    $log.info(cmpId + ' started ...');
//
//    $rootScope.viewName = cmpName;
//
//    var vm = this, uiState = {isReady: false, isBlocked: false, isValid: false};
//
//    function init() {
//        $log.info('init started...');
//        vm.customer = _.find(sessionService.customers, function(item) { return item.idNo; });
//        //if(!vm.customer) {
//        //    sessionService.getCustomer($routeParams.id).then ( function (res){
//        //        vm.customer = res;
//        //        console.log(vm.customer);
//        //    });
//        //}
//        console.log(vm.customer);
//        $log.info('init finished...');
//    }
//
//    angular.extend(this, {
//        uiState: uiState
//    });
//
//    init();
//
//    $log.info(cmpId + 'finished...');
//
//}
//customerUpdateController.$inject = ['$log', '$rootScope', '$scope', 'wydNotifyService', 'sessionService', '$location', '$routeParams'];
//appControllers.controller('customerUpdateController', customerUpdateController);