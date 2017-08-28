function customerCreateOrUpdateController($log, $rootScope, $scope, _session, wydNotifyService, storageService, sessionService, $uibModal, $location, $routeParams, $timeout) {
    var cmpId = 'customerCreateOrUpdateController', cmpName = 'Create Customer';
    $log.info(cmpId + ' started ...');

    $rootScope.viewName = cmpName;

    var vm = this, uiState = {isReady: false, isBlocked: false, isValid: false};
    vm.isEdit = false;

    var dnationality = {name: '-', dial_code: '-', code: '-', nationality: '<Select Nationality>'};

    vm.countries = sessionService.countries;
    vm.malasiyaStates = sessionService.malasiyaStates;

    $scope.$on('session:countries', function (event, data) {
        vm.countries = sessionService.countries;
        // if (vm.countries && vm.countries.length > 0) {
        //     vm.countries.unshift(dnationality);
        // }
    });

    $scope.$on('session:malasiyaStates', function (event, data) {
        vm.malasiyaStates = sessionService.malasiyaStates;
        // if (vm.malasiyaStates && vm.malasiyaStates.length > 0) {
        //     vm.malasiyaStates.unshift(vm.state);
        // }
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
            $log.info('beneficiary created successfully...');
            vm.beneficiary = result;
            vm.beneficiaryLabel = 'Edit';
            //loadBeneficiaries();
        }, function () {
            $log.info('canceled beneficiary creation...');
        });
    }

    function validateDob() {
        $log.info('vm.dob = ' + vm.dob);
        var dob = moment(vm.dob, 'DDMMYYYY');
        vm.form.dob.$setValidity('min', !dob.isAfter(vm.dobxMax));
        $log.info('min = ' + dob.format('DD-MM-YYYY') + ' > ' + vm.dobxMax.format('DD-MM-YYYY') + ' = ' + dob.isAfter(vm.dobxMax));
        vm.form.dob.$setValidity('max', !dob.isBefore(vm.dobxMin));
        $log.info('max = ' + dob.format('DD-MM-YYYY') + ' < ' + vm.dobxMin.format('DD-MM-YYYY') + ' = ' + dob.isBefore(vm.dobxMin));
    }

    function onDobChange() {
        if (vm.dob) {
            vm.dobx = moment(vm.dob, 'DDMMYYYY');
            validateDob();
        }
    }

    function onDobChangeX(nv, ov) {
        //console.log(ov);
        //console.log(nv);
        if (nv) {
            vm.dob = nv.format('DDMMYYYY');
            validateDob();
        }
    }

    function onNationalityChange() {
        vm.dialCode = vm.nationality.dial_code;
    }

    function onNationalityChangeX(ov, nv) {
        if (nv) {
            vm.dialCode = nv.dial_code;
            vm.form.nationality.$setValidity('required', false);
            //$log.info('ov value is : ', nv);
            if (nv.code == 'MY') {
                vm.idType = 'nric';
            } else {
                vm.idType = 'passport';
            }
        } else {
            vm.dialCode = '-';
            vm.form.nationality.$setValidity('required', true);
        }
        //
        //$log.info(vm.nationality);
        //if (vm.nationality.code == 'MY') {
        //    vm.idType = 'nric';
        //} else {
        //    vm.idType = 'passport';
        //}


    }

    function onStateChangeX(ov, nv) {
        if (nv) {
            vm.form.state.$setValidity('required', false);
        } else {
            vm.form.state.$setValidity('required', true);
        }
    }

    function onIdTypeChange() {
        if (vm.idType == 'nric') {
            vm.nationality = _.find(vm.countries, function (item) {
                return item.code == 'MY';
            });
            if (vm.nationality) {
                onNationalityChange();
            }
        }
    }

    function reset() {
        $log.info('reset started...');

        vm.form.$setPristine();
        vm.beneficiary = {id: 'NA'};
        vm.beneficiaryLabel = 'Add';
        vm.dialCode = '-';
        vm.nationality = null;
        vm.state = null;

        $log.info('reset finished...');
    }

    function save() {
        $log.info('saving started...');

        wydNotifyService.hide();

        var reqCus = {};

        var value = vm.name;
        reqCus.customerName = value;

        value = vm.emailId;
        reqCus.email = value;

        value = vm.mobileNo;
        value = value.replace(new RegExp('_', 'g'), ' ').trim();
        reqCus.mobile = '+6' + value;

        if (vm.idType == 'nric') {
            value = vm.idNoNric;
            reqCus.idNo = value;
        } else {
            value = vm.idNoPassport;
            reqCus.idNo = value;
            reqCus.idExpiryDate = moment().add(365, 'days').format('DD-M-YYYY');
        }

        value = vm.nationality;
        reqCus.nationality = value.nationality;

        value = vm.idType;
        if (value == 'nric') {
            reqCus.idType = value.toUpperCase();
        } else {
            reqCus.idType = 'Passport';
        }

        value = vm.dob;
        reqCus.dob = moment(value, 'DDMMYYYY').format('DD-MM-YYYY');
        //reqCus.dob = value;

        if (vm.accountType != 'personal') {
            value = vm.companyType;
            reqCus.companyType = value;
        }

        value = vm.state;
        reqCus.state = value.toUpperCase().replace(' ', '_');

        value = vm.city;
        reqCus.city = value;

        value = vm.address;
        reqCus.address = value;

        value = vm.postalCode;
        reqCus.postalCode = value;

        if (vm.accountType != 'personal') {
            value = vm.companyName;
            reqCus.companyName = value;
        }

        if (vm.accountType != 'personal') {
            value = vm.companyType;
            reqCus.companyType = value;
        }

        if (vm.accountType != 'personal') {
            value = vm.contactPerson;
            reqCus.contactPerson = value;
        }

        if (vm.accountType != 'personal') {
            value = vm.nameOfBusiness;
            reqCus.natureOfBusiness = value;
        }

        value = vm.accountType;
        if (value == 'personal') {
            reqCus.type = 'Individual';
        } else {
            reqCus.type = 'SME';
        }

        reqCus.country = 'Malaysia';

        if (vm.beneficiary.id != 'NA') {
            reqCus.beneficiaryId = vm.beneficiary.id;
        }
        if(!$routeParams.id) {
            reqCus.registeredThrough = 'agent';
        }
        $log.info(reqCus);

        if($routeParams.id) {
             sessionService.updateCustomer(reqCus).then(function (res) {
                 $log.debug(res);
                 sessionService.currentCustomer = res.data;
                 storageService.saveCustomer(res.data);
                 wydNotifyService.showSuccess('Successfully signed up...');
                 $location.path('/customers/customer/' + res.data.idNo + '/cdd');
             }, function (res) {
                 $log.error(res);
                 wydNotifyService.showError(res.data.description);
             });
        } else {
             sessionService.createCustomer(reqCus).then(function (res) {
                 $log.debug(res);
                 sessionService.currentCustomer = res.data;
                 storageService.saveCustomer(res.data);
                 wydNotifyService.showSuccess('Successfully signed up...');
                 $location.path('/customers/customer/' + res.data.idNo + '/cdd');
             }, function (res) {
                 $log.error(res);
                 wydNotifyService.showError(res.data.description);
             });
        }

        $log.info('saving finished...');
    }

    function preFill() {

        vm.emailId = 'sample@gmail.com';
        vm.name = 'Sample';

        vm.nationality = vm.countries[1];

        vm.mobileNo = '1234567890';
        vm.accountType = 'personal';
        vm.idType = 'passport';
        vm.idNoPassport = '123400';

        vm.dob = '10-05-1980';
        vm.form.dob.$setValidity('date', true);

        vm.address = 'abc address';
        vm.city = 'Chennai';

        vm.state = vm.malasiyaStates[0];

        vm.postalCode = '12345';
        vm.sourceOfIncome = 'Individual';
        vm.natureOfBusiness = 'Accountants';

        // angular.forEach(vm.form.$error, function (type) {
        //     angular.forEach(type, function (field) {
        //         field.$setDirty();
        //     });
        // });
    }

    function init() {
        $log.info('init started...');

        vm.customer = {};

        vm.beneficiaryLabel = 'Add';
        vm.beneficiary = {id: 'NA'};
        vm.dialCode = '-';
        vm.accountType = 'personal';
        vm.idType = 'passport';
        //onIdTypeChange();

        var tmoment = moment().subtract(18, 'years');
        vm.dobMax = tmoment.format('YYYY-MM-DD');
        vm.dobxMax = tmoment;
        tmoment = moment().subtract(100, 'years');
        vm.dobMin = tmoment.format('YYYY-MM-DD');
        vm.dobxMin = tmoment;

        //vm.nationality = dnationality;
        // if (vm.countries && vm.countries.length > 0) {
        //     vm.countries.unshift(dnationality);
        // }

        // vm.state = '<Select State>';
        // if (vm.malasiyaStates && vm.malasiyaStates.length > 0) {
        //     vm.malasiyaStates.unshift(vm.state);
        // }

        if ($routeParams.id) {
            $rootScope.viewName = 'Edit Customer';
            console.log($routeParams.id);

            vm.isEdit = true;
            //var model = _.find(sessionService.customers, function (item) {
            //    return item.idNo === $routeParams.id
            //});
            var model = sessionService.currentCustomer;
            console.log(model);
            vm.emailId = model.email;
            vm.name = model.customerName;
            if (model.nationality) {
                vm.nationality = _.find(vm.countries, function (item) {
                    return model.nationality == item.nationality;
                });
                //vm.mobileNo = model.mobile.substring(vm.nationality.dial_code.length);
            }
            vm.mobileNo = model.mobile.substring(2);

            if (model.type === 'Individual') {
                vm.accountType = 'personal';
            }
            if (model.idType === 'NRIC') {
                vm.idType = 'nric';
                vm.idNoNric = model.idNo;
            }
            if (model.idType === 'Passport') {
                vm.idType = 'passport';
                vm.idNoPassport = model.idNo;
            }
            vm.dob = moment(model.dob).format('DD-MM-YYYY');
            vm.address = model.address;
            vm.city = model.city;

            if (model.state) {
                var state = model.state.replace('_', ' ').toLowerCase();
                vm.state = _.find(vm.malasiyaStates, function (item) {
                    return state == item.toLowerCase();
                });
            }
            vm.postalCode = model.postalCode;

            // $timeout(function(){
            //    angular.forEach(vm.form.$error, function (type) {
            //        angular.forEach(type, function (field) {
            //            field.$setDirty();
            //        });
            //    });
            // }, 10000);
        }

        $log.info('init finished...');
    }

    angular.extend(this, {
        uiState: uiState,
        addOrEditBeneficiary: addOrEditBeneficiary,
        onDobChange: onDobChange,
        onDobChangeX: onDobChangeX,
        onNationalityChange: onNationalityChange,
        onNationalityChangeX: onNationalityChangeX,
        onStateChangeX: onStateChangeX,
        onIdTypeChange: onIdTypeChange,
        save: save,
        reset: reset,
        preFill: preFill
    });

    init();

    $log.info(cmpId + 'finished...');
}
customerCreateOrUpdateController.$inject = ['$log', '$rootScope', '$scope', '_session', 'wydNotifyService', 'storageService', 'sessionService', '$uibModal', '$location', '$routeParams', '$timeout'];
customerCreateOrUpdateController.resolve = {
    '_session': ['sessionService', function (sessionService) {
        //sessionService.switchOffAutoComplete();
        return '-:coming_soon:-';
        //return sessionService.getCurrentSession();
    }]
};
appControllers.controller('customerCreateOrUpdateController', customerCreateOrUpdateController);
