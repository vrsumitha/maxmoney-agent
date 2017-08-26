function userListingController($log, $rootScope, $scope, wydNotifyService, sessionService, $location) {
    var cmpId = 'userListingController', cmpName = 'Approve Users';
    $log.info(cmpId + ' started ...');

    $rootScope.viewName = cmpName;

    var vm = this, uiState = {isReady: false, isBlocked: false, isValid: false};

    function reload() {
        $log.info('reload started...');

        wydNotifyService.hide();
        vm.users = [];

        if(vm.searchId && vm.searchId.trim() != '') {
            console.log(1);
            sessionService.getUser(vm.searchId).then(function(res) {
                vm.users = [res.data];
            }, function(res) {
                wydNotifyService.showError(res.data.message);
            });
        } else {
            console.log(2);
            sessionService.getUsers().then(function (res) {
                vm.users = res.data.users;
            });
        }

        $log.info('reload started...');
    }

    function init() {
        $log.info('init started...');
        reload();
        $log.info('init finished...');
    }

    angular.extend(this, {
        uiState: uiState,
        reload: reload
    });

    init();

    $log.info(cmpId + 'finished...');
}
userListingController.$inject = ['$log', '$rootScope', '$scope', 'wydNotifyService', 'sessionService', '$location'];
appControllers.controller('userListingController', userListingController);
