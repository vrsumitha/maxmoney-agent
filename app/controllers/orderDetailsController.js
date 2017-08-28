function orderDetailsController($log, $rootScope, $scope, sessionService, $sessionStorage, $location) {
    var cmpId = 'orderDetailsController', cmpName = 'Order Details';
    $log.info(cmpId + ' started ...');

    $rootScope.viewName = cmpName;
    var vm = this, uiState = {isReady: false, isBlocked: false, isValid: false};

    init();

    function init() {
      console.log('init started...');

      console.log('init finished...');
    }

}
orderDetailsController.$inject = ['$log', '$rootScope', '$scope', 'sessionService', '$sessionStorage', '$location'];
appControllers.controller('orderDetailsController', orderDetailsController);