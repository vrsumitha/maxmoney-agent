function orderViewController($log, $rootScope, $scope, wydNotifyService, sessionService, $sessionStorage, $location) {
    var cmpId = 'orderViewController', cmpName = 'Order Detail';
    $log.info(cmpId + ' started ...');

    $rootScope.viewName = cmpName;
    var vm = this, uiState = {isReady: false, isBlocked: false, isValid: false};

    init();

    function search() {
        wydNotifyService.hide();
        sessionService.getOrder(vm.searchOrderId).then(function(res) {
            _.assign(vm.model, res.data);
            $log.debug(vm.model);
            console.log(vm.model.receipts);
        }, function(res) {
            wydNotifyService.showError("Order Id '" + vm.searchOrderId + "' doesn't exist...");
        });
    }

    function reset() {
        vm.searchOrderId = '';
    }

    function init() {
        console.log('init started...');

        vm.model = {};
        vm.searchOrderId = '6321-6278-7858';

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