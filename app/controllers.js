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

function messageController($log, $rootScope, $scope) {
    var cmpId = 'messageController', cmpName = 'Message';
    $log.debug(cmpId + '...');
    $rootScope.viewName = cmpName;

    var vm = this;
    vm.uiState = {isReady: false};

    vm.params = $location.search();
    if (vm.params.errorMessage) {
        vm.hasErrorMessage = true;
    }
    else {
        vm.hasErrorMessage = false;
    }
    //$log.debug(vm.params);
}
appControllers.controller('messageController', messageController);

