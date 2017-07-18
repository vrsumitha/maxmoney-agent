function messageController($log, $rootScope, $scope, $location) {
    var cmpId = 'messageController', cmpName = 'Message';
    $log.debug(cmpId + '...');
    $rootScope.viewName = cmpName;

    var vm = this;
    vm.uiState = {isReady: false};

    function init() {
        vm.params = $location.search();
        //$log.debug(vm.params);
        if (vm.params.errorMessage) {
            vm.hasErrorMessage = true;
        }
        else {
            vm.hasErrorMessage = false;
        }
    }

    init();
}
appControllers.controller('messageController', messageController);

function dialogController($log, $rootScope, $scope, $mdDialog, arguments) {
    var cmpId = 'dialogController', cmpName = 'Dialog';
    $log.debug(cmpId + '...');

    $scope.arguments = arguments;

    $scope.hide = function () {
        $mdDialog.hide();
    };

    $scope.cancel = function () {
        $mdDialog.cancel();
    };
}
appControllers.controller('dialogController', dialogController);