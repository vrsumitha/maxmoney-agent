function orderViewController($log, $rootScope, $scope, wydNotifyService, sessionService, $sessionStorage, $location) {
    var cmpId = 'orderViewController', cmpName = 'Order Detail';
    $log.info(cmpId + ' started ...');

    $rootScope.viewName = cmpName;
    var vm = this, uiState = {isReady: false, isBlocked: false, isValid: false};

    init();

    function search() {
        wydNotifyService.hide();

        sessionService.getOrder(vm.searchOrderId).then(function(res) {
            console.log(vm.searchOrderId);
            _.assign(vm.model, res.data);
            $log.debug(vm.model);
        }, function(res) {
            wydNotifyService.showError("Order Id '" + vm.searchOrderId + "' doesn't exist...");
        });
    }

    function reset() {
        vm.searchOrderId = '';
        vm.model = {};
    }

    function init() {
        console.log('init started...');

        vm.model = {};
       // vm.searchOrderId = '1997-5632-8503';
        console.log('init finished...');
    }

    angular.extend(this, {
        uiState: uiState,
        search: search,
        reset: reset
    });
}
orderViewController.$inject = ['$log', '$rootScope', '$scope', 'wydNotifyService', 'sessionService', '$sessionStorage', '$location'];
appControllers.controller('orderViewController', orderViewController);