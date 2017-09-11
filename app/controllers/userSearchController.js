function userSearchController($log, $rootScope, $scope, wydNotifyService, sessionService, $http) {
    var cmpId = 'userSearchController', cmpName = 'User Search';
    $log.info(cmpId + ' started ...');

    $rootScope.viewName = cmpName;

    var vm = this, uiState = {isReady: false, isBlocked: false, isValid: false};

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
            sessionService.getUserByIdentificationDocumentId(vm.searchId).then(function(res) {
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

        var path = sessionService.getApiBasePath() + '/users/' + vm.model.email + '/resend-welcome-message';
        var req = {
            method: 'GET',
            url: path,
            headers: {'api-key': $rootScope.sessionId}
        };
        //$log.info(req);
        $http(req).then(function (res) {
            $log.debug(res);
            wydNotifyService.showSuccess('Successfully SMS sent.');
        }, function (res) {
            $log.error(res);
            wydNotifyService.showError(res.data.message);
        });

        $log.info('resendSms finished...');
    }

    function init() {
        $log.info('init started...');

        vm.model = {};

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
userSearchController.$inject = ['$log', '$rootScope', '$scope', 'wydNotifyService', 'sessionService', '$http'];
appControllers.controller('userSearchController', userSearchController);
