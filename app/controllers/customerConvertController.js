function customerConvertController($log, $rootScope, $scope, _session, wydNotifyService, storageService, sessionService, $http, $location) {
    var cmpId = 'customerConvertController', cmpName = 'Convert Customer';
    $log.info(cmpId + ' started ...');

    $rootScope.viewName = cmpName;

    var vm = this, uiState = {isReady: false, isBlocked: false, isValid: false};

    function onCustomerChange() {
        sessionService.getCustomer(vm.customer.idNo).then(function (res) {
            _.assign(vm.customer, res);
            $log.info(vm.customer);
            computeImageUrls();
        });
    }

    function computeImageUrls() {
        if (vm.customer.images.Front) {
            var imgUrl = sessionService.getApiBasePath() + '/customers/';
            imgUrl += vm.customer.idNo + '/images/';
            imgUrl += vm.customer.images.Front;
            imgUrl += '?api-key=' + $rootScope.sessionId;
            vm.customer.imageFrontUrl = imgUrl;
            console.log(vm.customer.imageFrontUrl);
        }
        if (vm.customer.images.Back) {
            var imgUrl = sessionService.getApiBasePath() + '/customers/';
            imgUrl += vm.customer.idNo + '/images/';
            imgUrl += vm.customer.images.Back;
            imgUrl += '?api-key=' + $rootScope.sessionId;
            vm.customer.imageBackUrl = imgUrl;
            console.log(vm.customer.imageBackUrl);
        }
        //if (vm.customer.images.Signature) {
        //    var imgUrl = sessionService.getApiBasePath() + '/customers/';
        //    imgUrl += vm.customer.idNo + '/images/';
        //    imgUrl += vm.customer.images.Signature;
        //    imgUrl += '?api-key=' + $rootScope.sessionId;
        //    vm.customer.imageSignatureUrl = imgUrl;
        //    console.log(vm.customer.imageSignatureUrl);
        //}
    }

    function validateCustomer() {
        $log.info('validate customer started...');

        wydNotifyService.hide();

        var params = {url: 'https://www.maxmoney.com/agent/validate', status: 'Validated'};
        sessionService.validateCustomer(vm.customer.idNo, params).then(function (res) {
            $log.debug(res);
            // wydNotifyService.showSuccess('Successfully validated...');
            if (res.status === 204) {
                convertCustomer();
            }
        }, function (res) {
            $log.debug(res.value);
            wydNotifyService.showError('Validation failed. ' + res.description);
        });

        $log.info('validate customer finished...');
    }

    function convertCustomer() {
        $log.info('convert customer started...');

        var params = {id: vm.customer.idNo, password: vm.customer.password};
        //var params = {id: vm.customer.idNo, password: '123456'};
        sessionService.convertCustomer(params).then(function (res) {
            $log.debug(res);
            if (res.status === 201) {
                updateUserInfo();
                swal({
                    type: 'success',
                    title: 'Customer Created.',
                    text: 'Your MaxMoney Id is ' + res.data.maxMoneyId,
                    allowOutsideClick: false
                }).then(
                    function () {
                        $scope.$apply(function () {
                            $location.path($rootScope.customerConvertBackUrl);
                        });
                    }
                );
            }
        }, function (res) {
            $log.debug(res);
            wydNotifyService.showError('Conversion failed. ' + res.description);
        });

        $log.info('convert customer finished...');
    }

    function updateUserInfo() {
        $log.debug('update user info started...');
        sessionService.updateSourceOfIncomeAndNatureOfBusinessForUser(vm.customer.email, vm.customer.sourceOfIncomeX, vm.customer.natureOfBusinessX);
        $log.debug('update user info finished...');
    }

    function init() {
        $log.info('init started...');
        vm.customers = storageService.getCustomers();
        vm.customer = sessionService.currentCustomer;
        if (!vm.customer) {
            vm.customer = vm.customers[vm.customers.length - 1];
            vm.name = vm.customer.customerName;
        }
        onCustomerChange();
        console.log(vm.customer);
        $log.info('init finished...');
    }

    angular.extend(this, {
        uiState: uiState,
        onCustomerChange: onCustomerChange,
        validateCustomer: validateCustomer,
        convertCustomer: convertCustomer
    });

    init();

    $log.info(cmpId + 'finished...');
}
customerConvertController.$inject = ['$log', '$rootScope', '$scope', '_session', 'wydNotifyService', 'storageService', 'sessionService', '$http', '$location'];
customerConvertController.resolve = {
    '_session': ['sessionService', function (sessionService) {
        //sessionService.switchOffAutoComplete();
        return '-:coming_soon:-';
        //return sessionService.getCurrentSession();
    }]
};
appControllers.controller('customerConvertController', customerConvertController);