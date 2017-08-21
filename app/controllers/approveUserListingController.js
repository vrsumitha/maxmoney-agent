function approveUserListingController($log, $rootScope, $scope, wydNotifyService, sessionService, $location) {
    var cmpId = 'approveUserListingController', cmpName = 'Approve Users';
    $log.info(cmpId + ' started ...');

    $rootScope.viewName = cmpName;

    var vm = this, uiState = {isReady: false, isBlocked: false, isValid: false};

    function reload() {
        $log.info('reload started...');

        $log.info('reload started...');
    }

    function init() {
        $log.info('init started...');

        $log.info('init finished...');
    }

    angular.extend(this, {
        uiState: uiState,
        reload: reload
    });

    init();

    $log.info(cmpId + 'finished...');
}
approveUserListingController.$inject = ['$log', '$rootScope', '$scope', 'wydNotifyService', 'sessionService', '$location'];
appControllers.controller('approveUserListingController', approveUserListingController);
