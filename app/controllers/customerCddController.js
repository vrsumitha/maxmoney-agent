function customerCddController($log, $rootScope, $scope, _session, wydNotifyService, storageService, sessionService, $uibModal, $http, Upload, $location, $sessionStorage) {
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

    function addOrEditBeneficiary() {
        var bnyModel = vm.beneficiary.id == 'NA' ? null : vm.beneficiary;
        var modalInstance = $uibModal.open({
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'app/views/beneficiaryAddOrEdit.html',
            controller: 'beneficiaryAddOrEditController',
            controllerAs: 'vm',
            size: 'lg',
            resolve: {
                model: function () {
                    //sessionService.switchOffAutoComplete();
                    return bnyModel;
                },
                country: function () {
                    return null;
                }
            }
        });
        modalInstance.result.then(function (result) {
            $log.debug('beneficiary created successfully...');
            $log.debug(result);
            vm.beneficiary = result;
            vm.beneficiaryLabel = 'Edit';
            //loadBeneficiaries();
        }, function () {
            $log.debug('canceled beneficiary creation...');
        });
    }

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
        if (!value) {
            wydNotifyService.showError('Please select the source of income.');
            return;
        }
        value = vm.natureOfBusiness;
        if (!value) {
            wydNotifyService.showError('Please select the nature of business.');
            return;
        }

        var path = sessionService.getApiBasePath() + '/customers/' + vm.customer.idNo;
        var reqData = {'idType': vm.customer.idType}, msg = null;
        if (vm.customer.idType == 'Passport') {
            if (!vm.passportFront || !vm.passportBack) {
                wydNotifyService.showWarning('Image Missing ...');
                return;
            }
            if (vm.passportFront) {
                var mbs = vm.passportFront.size / (1024 * 1024);
                console.log(mbs);
                if (mbs >= vm.maxSizeForIdDoucumentsX) {
                    msg = 'Passport front image size should not be more than ' + vm.maxSizeForIdDoucuments;
                    wydNotifyService.showError(msg);
                    return;
                }
            }
            reqData['front'] = vm.passportFront;

            if (vm.passportBack) {
                var mbs = vm.passportBack.size / (1024 * 1024);
                console.log(mbs);
                if (mbs >= vm.maxSizeForIdDoucumentsX) {
                    msg = 'Passport Back image size should not be more than ' + vm.maxSizeForIdDoucuments;
                    wydNotifyService.showError(msg);
                    return;
                }
            }
            reqData['back'] = vm.passportBack;
        }
        if (vm.customer.idType == 'NRIC') {
            if (!vm.nricFront || !vm.nricBack) {
                wydNotifyService.showWarning('Image Missing...');
                return;
            }
            if (vm.nricFront) {
                var mbs = vm.nricFront.size / (1024 * 1024);
                console.log(mbs);
                if (mbs >= vm.maxSizeForIdDoucumentsX) {
                    msg = 'NRIC front image size should not be more than ' + vm.maxSizeForIdDoucuments;
                    wydNotifyService.showError(msg);
                    return;
                }
            }
            reqData['front'] = vm.nricFront;

            if (vm.nricBack) {
                var mbs = vm.nricBack.size / (1024 * 1024);
                console.log(mbs);
                if (mbs >= vm.maxSizeForIdDoucumentsX) {
                    msg = 'NRIC back image size should not be more than ' + vm.maxSizeForIdDoucuments;
                    wydNotifyService.showError(msg);
                    return;
                }
            }
            reqData['back'] = vm.nricBack;
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

    function cancel() {
        if ($rootScope.session.role == 'maxCddOfficer') {
            path = '/customers/customer'; // customer registration
            $location.path(path);
            return
        }
        if ($rootScope.session.role == 'cddOfficer') {
            path = '/customers'; // customer listing
            $location.path(path);
            return;
        }
    }

    function init() {
        $log.info('init started...');

        vm.minSizeForIdDoucuments = '500KB';
        vm.minSizeForIdDoucumentsX = 500;
        vm.maxSizeForIdDoucuments = '6MB';
        vm.maxSizeForIdDoucumentsX = 6;

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
       // console.log(vm.customer.beneficiaryId);

        if(vm.customer.beneficiaryId) {
            vm.beneficiaryLabel = 'Edit';
            vm.beneficiary = {id: vm.customer.beneficiaryId};
        } else {
            vm.beneficiaryLabel = 'Add';
            vm.beneficiary = {id: 'NA'};
        }

        $log.info('init finished...');
    }

    angular.extend(this, {
        uiState: uiState,
        addOrEditBeneficiary: addOrEditBeneficiary,
        onCustomerChange: onCustomerChange,
        save: save,
        approve: approve,
        cancel: cancel
    });

    init();

    $log.info(cmpId + 'finished...');
}
customerCddController.$inject = ['$log', '$rootScope', '$scope', '_session', 'wydNotifyService', 'storageService', 'sessionService','$uibModal', '$http', 'Upload', '$location', '$sessionStorage'];
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
