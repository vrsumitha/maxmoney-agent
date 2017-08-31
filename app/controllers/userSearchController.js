function userSearchController($log, $rootScope, $scope, wydNotifyService, storageService, sessionService, $location, $timeout) {
    var cmpId = 'userSearchController', cmpName = 'User Search';
    $log.info(cmpId + ' started ...');

    $rootScope.viewName = cmpName;

    var vm = this, uiState = {isReady: false, isBlocked: false, isValid: false};

    function onSignIn() {

    }
    function reset() {
        $log.info('reset started...');

        vm.searchId = '';
        vm.model = {};

        $log.info('reset started...');
    }
    function search() {
        $log.info('Search started...');

        wydNotifyService.hide();

        if(vm.searchId && vm.searchId.trim() != '') {
            sessionService.getUser(vm.searchId).then(function(res) {
                _.assign(vm.model, res.data);
                console.log(vm.model);
            }, function(res) {
                wydNotifyService.showError(res.data.message);
                vm.model = {};
            });
        }
        $log.info('Search finished...');
    }

    function resendSms() {
        $log.info('resendSms started...');


        $log.info('resendSms finished...');
    }

    function init() {
        $log.info('init started...');

        vm.model = {};
        vm.searchId = 'vteial@gmail.com';

        $log.info('init finished...');
    }

    angular.extend(this, {
        uiState: uiState,
        search: search,
        reset: reset,
        resendSms: resendSms
    });

    init();

    $log.info(cmpId + 'finished...');
}
userSearchController.$inject = ['$log', '$rootScope', '$scope', 'wydNotifyService', 'storageService', 'sessionService', '$location', '$timeout'];
appControllers.controller('userSearchController', userSearchController);
