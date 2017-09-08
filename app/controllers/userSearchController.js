function userSearchController($log, $rootScope, $scope, wydNotifyService, sessionService, $http, $uibModal) {
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
        var modalInstance = $uibModal.open({
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'app/views/resendSms.html',
            controller: 'resendSmsController',
            controllerAs: 'vm',
            size: 'sm',
            resolve: {
                model: function () {
                    return vm.model;
                },
                http: function () {
                    return $http;
                },
                wydNotifyService: function () {
                    return wydNotifyService;
                }
            }
        });
        modalInstance.result.then(function (result) {
            $log.debug('sms sent successfully...');
            $log.debug(result);
        }, function () {
            $log.debug('canceled sms sending...');
        });
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
userSearchController.$inject = ['$log', '$rootScope', '$scope', 'wydNotifyService', 'sessionService', '$http', '$uibModal'];
appControllers.controller('userSearchController', userSearchController);
