function customerConvertController($log, $rootScope, $scope, $q, _session, wydNotifyService, storageService, $uibModal, sessionService, $http, $location, $sessionStorage) {
    var cmpId = 'customerConvertController', cmpName = 'Create Customer';
    $log.info(cmpId + ' started ...');

    $rootScope.viewName = cmpName;

    var vm = this, uiState = {isReady: false, isBlocked: false, isValid: false};

    function addOrEditBeneficiary() {
        var bnyModel = vm.customer.beneficiaryId == 'NA' ? null : vm.beneficiary;
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
            updateBeneficiaryForCustomer();
            //loadBeneficiaries();
        }, function () {
            $log.debug('canceled beneficiary creation...');
        });
    }

    function onCustomerChange() {
        sessionService.getCustomer(vm.customer.idNo).then(function (res) {
            _.assign(vm.customer, res.data);
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
        updateUserInfo();
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

        var params = {id: vm.customer.idNo};
        sessionService.convertCustomer(params).then(function (res) {
            $log.debug(res);
            if (res.status === 201) {
                updateUserInfo();
                swal({
                    type: 'success',
                    title: 'Customer Created.',
                   // text: 'Your MaxMoney Id is ' + res.data.maxMoneyId,
                    allowOutsideClick: false
                }).then(
                    function () {
                        $scope.$apply(function () {
                            $location.path($rootScope.homePath);
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

    function updateBeneficiaryForCustomer() {
        console.log(vm.customer.beneficiaryId + ' ' + vm.beneficiary.id);
        if (!vm.customer.beneficiaryId || vm.customer.beneficiaryId != 'NA' || vm.beneficiary.id) {
            var path = sessionService.getApiBasePath() + '/customers/' + vm.customer.idNo;
            var req = {
                method: 'PUT',
                url: path,
                headers: {'api-key': $rootScope.sessionId, 'Content-Type': 'application/x-www-form-urlencoded'},
                transformRequest: function (obj) {
                    var str = [];
                    for (var p in obj) {
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    }
                    return str.join("&");
                },
                data: vm.beneficiary.id
            };
            //$log.info(req);
            var deferred = $q.defer();
            $http(req).then(function (res) {
                $log.debug(res);
                deferred.resolve(res);
                $log.debug('update customer finished with success.');
            }, function (res) {
                deferred.reject(res);
                $log.debug('update customer finished with failure.');
            });
            return deferred.promise;
        }
    }

    //function cancel() {
    //    //console.log($rootScope.session.role);
    //    if ($rootScope.session.role == 'maxCddOfficer') {
    //        path = '/customers/customer'; // customer registration
    //        $location.path(path);
    //        return
    //    }
    //    if ($rootScope.session.role == 'cddOfficer') {
    //        path = '/customers'; // customer listing
    //        $location.path(path);
    //        return;
    //    }
    //}

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
        if(vm.customer.beneficiaryId && vm.customer.beneficiaryId != 'NA' || vm.beneficiary.id) {
            vm.beneficiaryLabel = 'Edit';
            vm.beneficiary = {id: vm.customer.beneficiaryId};
            sessionService.getBeneficiary (vm.customer.beneficiaryId).then(function (res) {
                _.assign(vm.beneficiary, res.data);
                $log.debug(vm.beneficiary);
            });
        }else {
            vm.beneficiaryLabel = 'Add';
            vm.beneficiary = {id: 'NA'};
        }

        $log.info('init finished...');
    }

    angular.extend(this, {
        uiState: uiState,
        addOrEditBeneficiary: addOrEditBeneficiary,
        onCustomerChange: onCustomerChange,
        validateCustomer: validateCustomer,
        convertCustomer: convertCustomer,
        cancel: cancel,
        updateBeneficiaryForCustomer: updateBeneficiaryForCustomer
    });

    init();

    $log.info(cmpId + 'finished...');
}
customerConvertController.$inject = ['$log', '$rootScope', '$scope', '$q', '_session', 'wydNotifyService', 'storageService', '$uibModal', 'sessionService', '$http', '$location', '$sessionStorage'];
customerConvertController.resolve = {
    '_session': ['sessionService', function (sessionService) {
        //sessionService.switchOffAutoComplete();
        return '-:coming_soon:-';
        //return sessionService.getCurrentSession();
    }]
};
appControllers.controller('customerConvertController', customerConvertController);
