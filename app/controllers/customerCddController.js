function customerCddController($log, $rootScope, $scope, _session, wydNotifyService, storageService, sessionService, $http, Upload, $location) {
    var cmpId = 'customerCddController', cmpName = 'CDD';
    $log.info(cmpId + ' started ...');

    $rootScope.viewName = cmpName;

    var vm = this, uiState = {isReady: false, isBlocked: false, isValid: false};

    vm.sourceOfIncomes = sessionService.sourceOfIncomes;
    vm.natureOfBusinesses = sessionService.natureOfBusinesses;

    $scope.$on('session:sourceOfIncomes', function (event, data) {
        vm.sourceOfIncomes = sessionService.sourceOfIncomes;
    });

    $scope.$on('session:natureOfBusinesses', function (event, data) {
        vm.natureOfBusinesses = sessionService.natureOfBusinesses;
    });

    function onCustomerChange() {
        sessionService.getCustomer(vm.customer.idNo).then(function (res) {
            _.assign(vm.customer, res);
            $log.info(vm.customer);
        });
    }

    function save() {
        $log.info('update started...');

        wydNotifyService.hide();

        var value = vm.sourceOfIncome;
        if(!value) {
            wydNotifyService.showError('Please select the source of income.');
            return;
        }
        value = vm.natureOfBusiness;
        if(!value) {
            wydNotifyService.showError('Please select the nature of business.');
            return;
        }

        var path = sessionService.getApiBasePath() + '/customers/' + vm.customer.idNo;
        var reqData = {'idType': vm.customer.idType};
        if (vm.customer.idType == 'Passport') {
            if (!vm.passportFront || !vm.passportBack) {
                wydNotifyService.showWarning('There is nothing to update...');
                return;
            }
            if (vm.passportFront) {
                reqData['front'] = vm.passportFront;
            }
            if (vm.passportBack) {
                reqData['back'] = vm.passportBack;
            }
        }
        if (vm.customer.idType == 'NRIC') {
            if (!vm.nricFront || !vm.nricBack) {
                wydNotifyService.showWarning('There is nothing to update...');
                return;
            }
            if (vm.nricFront) {
                reqData['front'] = vm.nricFront;
            }
            if (vm.nricBack) {
                reqData['back'] = vm.nricBack;
            }
        }
        //if (vm.signature) {
        //    reqData['signature'] = vm.signature;
        //}

        $log.info(reqData);
        Upload.upload({
            url: path,
            method: 'PUT',
            headers: {'api-key': $rootScope.sessionId},
            transformRequest: angular.identity,
            data: reqData
        }).then(function (res) {
            $log.debug(res);
            wydNotifyService.showSuccess('Images Uploaded Successfully...');
            approve();
        }, function (res) {
            $log.debug(res);
            $log.error('Error Status: ' + res.status);
            wydNotifyService.showError('image Upload failed. ' + res.description);
        }, function (evt) {
            $log.info(evt);
            var pp = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            if (vm.customer.idType == 'Passport') {
                vm.passportFront.progress = pp;
                vm.passportBack.progress = pp;
            }
            if (vm.customer.idType == 'NRIC') {
                vm.nricFront.progress = pp;
                vm.nricBack.progress = pp;
            }
            //vm.signature.progress = pp;
            //$log.info('Progress: ' + pp + '% ');
        });

        // var reqData = { 'customerName' : vm.name};
        // var req = {
        //     method: 'PUT',
        //     url: path,
        //     headers: { 'api-key' : $rootScope.sessionId},
        //     params: reqData
        // };

        //console.log(vm.passportFrontX);
        // var reqData = new FormData();
        // reqData.append('front', vm.passportFrontX);
        // reqData.append('customerName', vm.name);
        // var req = {
        //     method: 'PUT',
        //     url: path,
        //     headers: { 'api-key' : $rootScope.sessionId, 'Content-Type': undefined},
        //     transformRequest: angular.identity,
        //     data: reqData
        // };

        // $log.info(req);
        // $http(req).then(function (res) {
        //     console.log(res);
        // }, function (res) {
        //     console.log(res);
        // });

        $log.info('update finished...');
    }

    function approve() {
        $log.info('approve started...');

        sessionService.approve(vm.customer.idNo).then(function (res) {
            $log.debug(res);
            sessionService.currentCustomer.sourceOfIncomeX = vm.sourceOfIncome;
            sessionService.currentCustomer.natureOfBusinessX = vm.natureOfBusiness;
            console.log(sessionService.currentCustomer);
            wydNotifyService.showSuccess('Successfully approved...');
            $location.path('/customers/customer/' + vm.customer.idNo + '/convert');
        }, function (res) {
            $log.debug(res);
            wydNotifyService.showError('Approve failed. ' + res.description);
        });

        $log.info('approve finished...');
    }

    function init() {
        $log.info('init started...');

        vm.maxSizeForIdDoucuments = '3MB';

        vm.customers = storageService.getCustomers();
        vm.customer = sessionService.currentCustomer;
        if (!vm.customer) {
            vm.customer = vm.customers[vm.customers.length - 1];
            vm.name = vm.customer.customerName;
            onCustomerChange();
        }

        if (_.keys(vm.sourceOfIncomes).length === 0) {
            sessionService.getSourceOfIncomes();
        }
        if (_.keys(vm.natureOfBusinesses).length === 0) {
            sessionService.getNatureOfBusinesses();
        }

        console.log(vm.customer);
        $log.info('init finished...');
    }

    angular.extend(this, {
        uiState: uiState,
        onCustomerChange: onCustomerChange,
        save: save,
        approve: approve
    });

    init();

    $log.info(cmpId + 'finished...');
}
customerCddController.$inject = ['$log', '$rootScope', '$scope', '_session', 'wydNotifyService', 'storageService', 'sessionService', '$http', 'Upload', '$location'];
customerCddController.resolve = {
    '_session': ['sessionService', function (sessionService) {
        //sessionService.switchOffAutoComplete();
        return '-:coming_soon:-';
        //return sessionService.getCurrentSession();
    }]
};
appControllers.controller('customerCddController', customerCddController);
