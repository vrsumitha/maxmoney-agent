function customerCddController($log, $rootScope, $scope, _session, wydNotifyService, storageService, sessionService, $http, Upload, $location) {
    var cmpId = 'customerCddController', cmpName = 'CDD';
    $log.info(cmpId + ' started ...');

    $rootScope.viewName = cmpName;

    var vm = this, uiState = {isReady: false, isBlocked: false, isValid: false};

    function onCustomerChange() {
        sessionService.getCustomer(vm.customer.idNo).then(function (res) {
            _.assign(vm.customer, res);
            $log.info(vm.customer);
        });
    }

    function save() {
        $log.info('update started...');

        wydNotifyService.hide();

        var path = sessionService.getApiBasePath() + '/customers/' + vm.customer.idNo;
        var reqData = {'idType': vm.customer.idType};
        if (vm.customer.idType == 'Passport') {
            if (!vm.passportFront || !vm.passportBack) {
                wydNotifyService.showWarning('Please provide the missing documents...');
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
                wydNotifyService.showWarning('Please provide the missing documents...');
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

        if (vm.customer.type == 'SME') {
            if (!vm.br || !vm.form24_1 || !vm.form24_2 || !vm.form24_3 || !vm.form49_1 || !vm.form49_2) {
                wydNotifyService.showWarning('Please provide the missing documents...');
                return;
            }
            if (vm.br) {
                reqData['br'] = vm.br;
            }
            if (vm.form24_1) {
                reqData['form24_1'] = vm.form24_1;
            }
            if (vm.form24_2) {
                reqData['form24_2'] = vm.form24_2;
            }
            if (vm.form24_3) {
                reqData['form24_3'] = vm.form24_3;
            }
            if (vm.form49_1) {
                reqData['form24_1'] = vm.form49_1;
            }
            if (vm.form49_2) {
                reqData['form24_1'] = vm.form49_2;
            }
        }
        $log.info(reqData);
        Upload.upload({
            url: path,
            method: 'PUT',
            headers: {'api-key': $rootScope.sessionId},
            transformRequest: angular.identity,
            data: reqData
        }).then(function (res) {
            $log.debug(res);
            wydNotifyService.showSuccess('Successfully updated...');
            approve();
        }, function (res) {
            $log.debug(res);
            $log.error('Error Status: ' + res.status);
            wydNotifyService.showError('Update failed. ' + res.description);
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
            if (vm.customer.type == 'SME') {
                vm.br.progress = pp;
                vm.form24_1.progress = pp;
                vm.form24_2.progress = pp;
                vm.form24_3.progress = pp;
                vm.form49_1.progress = pp;
                vm.form49_2.progress = pp;
            }
        });

        $log.info('update finished...');
    }

    function approve() {
        $log.info('approve started...');

        sessionService.approve(vm.customer.idNo).then(function (res) {
            $log.debug(res);
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
        vm.customers = storageService.getCustomers();
        vm.customer = sessionService.currentCustomer;
        if (!vm.customer) {
            vm.customer = vm.customers[vm.customers.length - 1];
            vm.name = vm.customer.customerName;
            onCustomerChange();
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
