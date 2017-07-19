appDirectives.directive('inputMaskModel', function ($parse) {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, modelCtrl) {
            modelCtrl.$validators.integer = function (modelValue, viewValue) {
                //console.log('mv : ' + modelValue + ' vv : ' +viewValue);
                if (modelCtrl.$isEmpty(modelValue)) {
                    return true;
                }
                if (viewValue.indexOf('_') == -1) {
                    return true;
                }
                return false;
            };
        }
    };
});

function rootController($log, $rootScope, $scope, $window, sessionService) {
    $log.debug('rootController...');

    $scope.lodash = _;

    $scope.historyBack = function () {
        $window.history.back();
    };

    $scope.viewSource = function () {
        var s = 'view-source:' + $rootScope.currentViewSrcUrl;
        $log.info(s);
        $window.open(s);
    };

    sessionService.getCountries();
    sessionService.getMalasiyaStates();
    sessionService.getRelationships();
    sessionService.getOrderPurposes();
    sessionService.getAgents();

    $rootScope.message = {};

}
appControllers.controller('rootController', rootController);

function homeController($log, $rootScope, $scope, _session) {
    var cmpId = 'homeController', cmpName = 'Home';
    $log.info(cmpId + ' started ...');

    $rootScope.viewName = cmpName;

    var vm = this;
    vm.isReady = false;

    vm.session = _session;

    $log.info(cmpId + 'finished...');
}
homeController.$inject = ['$log', '$rootScope', '$scope', '_session'];
homeController.resolve = {
    '_session': ['sessionService', function (sessionService) {
        return sessionService.getCurrentSession();
    }]
};
appControllers.controller('homeController', homeController);

function signUpController($log, $rootScope, $scope, _session, wydNotifyService, sessionService, $uibModal) {
    var cmpId = 'signUpController', cmpName = 'Sign Up';
    $log.info(cmpId + ' started ...');

    $rootScope.viewName = cmpName;

    var vm = this, uiState = {isReady: false, isBlocked: false, isValid: false};

    var dnationality = {name: '-', dial_code: '-', code: '-', nationality: '<Select Nationality>'};

    vm.countries = sessionService.countries;
    vm.malasiyaStates = sessionService.malasiyaStates;

    $scope.$on('session:countries', function (event, data) {
        vm.countries = sessionService.countries;
        if (vm.countries && vm.countries.length > 0) {
            vm.countries.unshift(dnationality);
        }
    });

    $scope.$on('session:countries', function (event, data) {
        vm.malasiyaStates = sessionService.malasiyaStates;
        if (vm.malasiyaStates && vm.malasiyaStates.length > 0) {
            vm.malasiyaStates.unshift(vm.state);
        }
    });

    // function onIdTypeChange() {
    //     if(vm.idType == 'nric') {
    //         vm.idNoLabel = 'NRIC Number';
    //     } else {
    //         vm.idNoLabel = 'Passport Number';
    //     }
    // }

    function reset() {
        $log.info("reset started...");

        vm.form.$setPristine();
        vm.beneficiary = {id: 'NA'};
        vm.beneficiaryLabel = 'Add';

        $log.info("reset started...");
    }

    function addOrEditBeneficiary() {
        var bnyModel = vm.beneficiary.id == '-' ? null : vm.beneficiary;
        var modalInstance = $uibModal.open({
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'app/views/beneficiaryAddOrEdit.html',
            controller: 'beneficiaryAddOrEditController',
            controllerAs: 'vm',
            size: 'lg',
            resolve: {
                model: function () {
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
            vm.beneficiaryLabel = 'Edit'
            //loadBeneficiaries();
        }, function () {
            $log.info('canceled beneficiary creation...');
        });
    }

    function save() {
        $log.info("saving started...");

        if (vm.form.$pristine) {
            alertify.alert("There is no change. Hence, nothing to save.");
            return;
        }

        var reqCus = {};

        var value = vm.name;
        reqCus.customerName = value;

        value = vm.emailId;
        reqCus.email = value;

        value = vm.mobileNo;
        reqCus.mobile = '+60' + value;

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
        //reqCus.dob = moment(value).format('DD-MM-YYYY');
        reqCus.dob = value;

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
        $log.info(reqCus);

        sessionService.signUp(reqCus).then(function (res) {
            $log.info(res);
            wydNotifyService.showSuccess('Successfully signed up...');
            reset();
        }, function (res) {
            $log.info(res);
            wydNotifyService.showError(res.data.description);
        });

        $log.info("saving finished...");
    }

    function init() {
        $log.info("init started...");

        vm.beneficiaryLabel = 'Add';
        vm.beneficiary = {id:  'NA'};

        vm.accountType = 'personal';
        vm.idType = 'passport';
        //onIdTypeChange();

        vm.dobMax = moment().subtract(16, 'years').format('YYYY-MM-DD');
        vm.dobMin = moment().subtract(100, 'years').format('YYYY-MM-DD');

        vm.nationality = dnationality;
        if (vm.countries && vm.countries.length > 0) {
            vm.countries.unshift(dnationality);
        }

        vm.state = '<Select State>';
        if (vm.malasiyaStates && vm.malasiyaStates.length > 0) {
            vm.malasiyaStates.unshift(vm.state);
        }

        $log.info("init finished...");
    }

    angular.extend(this, {
        uiState: uiState,
        addOrEditBeneficiary: addOrEditBeneficiary,
        save: save,
        reset: reset
    });

    init();

    $log.info(cmpId + 'finished...');
}
signUpController.$inject = ['$log', '$rootScope', '$scope', '_session', 'wydNotifyService', 'sessionService', '$uibModal'];
signUpController.resolve = {
    '_session': ['sessionService', function (sessionService) {
        return sessionService.getCurrentSession();
    }]
};
appControllers.controller('signUpController', signUpController);

function cddController($log, $rootScope, $scope, _session) {
    var cmpId = 'cddController', cmpName = 'CDD';
    $log.info(cmpId + ' started ...');

    $rootScope.viewName = cmpName;

    var vm = this, uiState = {isReady: false, isBlocked: false, isValid: false};

    function init() {
        $log.info("init started...");

        $log.info("init finished...");
    }

    angular.extend(this, {
        uiState: uiState
    });

    init();

    $log.info(cmpId + 'finished...');
}
cddController.$inject = ['$log', '$rootScope', '$scope', '_session'];
cddController.resolve = {
    '_session': ['sessionService', function (sessionService) {
        return sessionService.getCurrentSession();
    }]
};
appControllers.controller('cddController', cddController);

function customerToUserController($log, $rootScope, $scope, _session) {
    var cmpId = 'customerToUserController', cmpName = 'Customer To User';
    $log.info(cmpId + ' started ...');

    $rootScope.viewName = cmpName;

    var vm = this, uiState = {isReady: false, isBlocked: false, isValid: false};

    function init() {
        $log.info("init started...");

        $log.info("init finished...");
    }

    angular.extend(this, {
        uiState: uiState
    });

    init();

    $log.info(cmpId + 'finished...');
}
customerToUserController.$inject = ['$log', '$rootScope', '$scope', '_session'];
customerToUserController.resolve = {
    '_session': ['sessionService', function (sessionService) {
        return sessionService.getCurrentSession();
    }]
};
appControllers.controller('customerToUserController', customerToUserController);

function beneficiaryListController($log, $rootScope, _session, $uibModal) {
    var cmpId = 'beneficiaryListController', cmpName = 'Beneficiaries';
    $log.info(cmpId + ' started ...');

    $rootScope.viewName = cmpName;

    var vm = this, uiState = {isReady: false, isBlocked: false, isValid: false};

    function addBeneficiary() {

        var modalInstance = $uibModal.open({
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'app/bootstrap/beneficiaryAddOrEdit.html',
            controller: 'beneficiaryAddOrEditController',
            controllerAs: 'vm',
            size: 'lg',
            resolve: {
                model: function () {
                    return null;
                },
                country: function () {
                    return null;
                }
            }
        });
        modalInstance.result.then(function (result) {
            $log.info('beneficiary created successfully...');
            //loadBeneficiaries();
        }, function () {
            $log.info('canceled beneficiary creation...');
        });

    }

    function init() {
        $log.info("init started...");

        $log.info("init finished...");
    }

    angular.extend(this, {
        uiState: uiState,
        addBeneficiary: addBeneficiary
    });

    init();

    $log.info(cmpId + 'finished...');
}
beneficiaryListController.$inject = ['$log', '$rootScope', '_session', '$uibModal'];
beneficiaryListController.resolve = {
    '_session': ['sessionService', function (sessionService) {
        return sessionService.getCurrentSession();
    }]
};
appControllers.controller('beneficiaryListController', beneficiaryListController);

function beneficiaryAddOrEditController($log, $rootScope, $scope, sessionService, $uibModalInstance, model, country) {
    var cmpId = 'beneficiaryAddOrEditController', cmpName = 'Add/Edit Beneficiary';
    $log.info(cmpId + ' started ...');

    //$rootScope.viewName = cmpName;

    var vm = this, uiState = {isReady: false, isBlocked: false, isValid: false};

    vm.title = 'Add Beneficiary';
    vm.payoutAgentBanks = [];
    vm.relationships = sessionService.relationships;
    vm.orderPurposes = _.keys(sessionService.orderPurposes);
    vm.agentCountries = sessionService.agentDetail.agents;

    vm.payBy = 'CP';
    vm.isCountryInitialized = false;

    if (model) {
        vm.title = 'Edit Beneficiary';
        if (model.bankAccounts) {
            model.bankAccount = model.bankAccounts[1];
            vm.payBy = 'BD';
        } else {
            vm.payBy = 'CP';
        }
        var countryInfo = findCountryInfo(model.country);
        if (countryInfo) {
            model.dialingCode = countryInfo.dial_code;
            if (model.mobile.startsWith(countryInfo.dial_code)) {
                model.dialingNumber = model.mobile.substring(countryInfo.dial_code.length);
            }
            model.agentCountry = _.find(vm.agentCountries, function (item) {
                return item.country == model.country;
            });
            onCountryChange();
        }
    } else {
        model = {
            dialingCode: '-', bankAccount: {}
        };
        vm.payBy = 'CP';
        if (country) {
            var countryInfo = findCountryInfo(country);
            if (countryInfo) {
                vm.isCountryInitialized = true;
                model.country = country;
                model.dialingCode = countryInfo.dial_code;
                model.agentCountry = _.find(vm.agentCountries, function (item) {
                    return item.country == model.country;
                });
                onCountryChange();
            }
        }
    }
    vm.model = model;
    console.log(vm.model);

    $scope.$on('session:relationships', function (event, data) {
        vm.relationships = sessionService.relationships;
    });

    $scope.$on('session:orderPurposes', function (event, data) {
        vm.orderPurposes = sessionService.orderPurposes;
    });

    $scope.$on('session:agents', function (event, data) {
        vm.agentsCountries = sessionService.agentDetail.agents;
    });

    function findCountryInfo(icountry) {
        var countryInfo = _.find(sessionService.countries, function (item) {
            return item.name == icountry;
        });
        return countryInfo;
    }

    function onCountryChange() {
        sessionService.getPayoutAgentsInfo('BANK', vm.model.agentCountry.country, {size: 1000}).then(function (res) {
            res = _.uniqBy(res.locations, 'name');
            vm.payoutAgentBanks = res;
            if (vm.model.bankAccount) {
                vm.model.bankAccount.payoutAgent = _.find(vm.payoutAgentBanks, function (item) {
                    return item.code == vm.model.bankAccount.location;
                });
            }
        });
        var countryInfo = findCountryInfo(vm.model.agentCountry.country);
        if (countryInfo) {
            vm.model.dialingCode = countryInfo.dial_code;
        }
    }

    // function onPayBy(value) {
    //     vm.payBy = value;
    //     console.log(vm.payBy);
    // }

    function reset() {
        $log.info("reset started...");

        vm.form.$setPristine();

        $log.info("reset started...");
    }

    function cancel() {
        $uibModalInstance.dismiss('cancel');
    }

    function save() {
        var reqBen = {}, reqBnk = {}, flag = false;

        var value = vm.model.name;
        reqBen.name = value;

        value = vm.model.address;
        if (value && value != '') {
            reqBen.address = value;
        }

        value = vm.model.agentCountry;
        reqBen.country = value.country;

        value = vm.model.dialingNumber;
        value = vm.model.dialingCode + value;
        reqBen.mobile = value;

        value = vm.model.email;
        if (value && value != '') {
            reqBen.email = value;
        }

        value = vm.model.orderPurpose;
        reqBen.orderPurpose = value;

        value = vm.model.relationship;
        reqBen.relationship = value;

        //$log.info(reqBen);

        if (vm.payBy == 'BD') {
            value = vm.model.bankAccount.acctName;
            reqBnk.acctName = value;

            value = vm.model.bankAccount.acctNo;
            reqBnk.acctNo = value;

            if (vm.model.bankAccount.payoutAgent) {
                value = vm.model.bankAccount.payoutAgent.name;
                reqBnk.name = value;

                value = vm.model.bankAccount.payoutAgent.country;
                reqBnk.country = value;

                value = vm.model.bankAccount.payoutAgent.code;
                reqBnk.location = value;
            }

            value = vm.model.bankAccount.branch;
            reqBnk.branch = value;

            //$log.info(reqBnk);
        }

        if (!flag) {
            reqBen.name = reqBen.name.toUpperCase();

            if ($scope.payBy == 'BD') {
                reqBnk.acctName = reqBnk.acctName.toUpperCase();
                reqBnk.branch = reqBnk.branch.toUpperCase();
            }

            if (vm.model.id) {
                updateBeneficiary(reqBen, reqBnk);
            } else {
                createBeneficiary(reqBen, reqBnk);
            }
        }
        // $uibModalInstance.close('save');
    }

    function createBeneficiary(reqBen, reqBnk) {
        $log.info('create beneficiary...');
        $log.info(reqBen);
        sessionService.createBeneficiary(reqBen).then(function (res) {
            $log.info(res);
            vm.resModel = res.data;
            vm.model.id = vm.resModel.id;
            if (vm.payBy == 'BT') {
                createBeneficiaryBankAccount(reqBnk);
            } else {
                $uibModalInstance.close(vm.resModel);
            }
        });
    }

    function createBeneficiaryBankAccount(reqBnk) {
        $log.info('create beneficiary bank account...');
        $log.info(reqBnk);
        sessionService.createBeneficiaryBankAccount($scope.model.id, reqBnk).then(function (res) {
            $log.info(res);
            $uibModalInstance.close(vm.resModel);
        });
    }

    function updateBeneficiary(reqBen, reqBnk) {
        $log.info('update beneficiary...');
        $log.info(reqBen);
        sessionService.updateBeneficiary($scope.model.id, reqBen).then(function (res) {
            $log.info(res);
            if ($scope.payBy == 'BT') {
                deleteAndUpdateBeneficiaryBankAccount(reqBnk);
            } else {
                $uibModalInstance.close(vm.resModel);
            }
        });
    }

    function deleteAndUpdateBeneficiaryBankAccount(reqBnk) {
        $log.info('delete beneficiary bank account...');
        sessionService.deleteBeneficiaryBankAccount($scope.model.id, {index: 1}).then(function (res) {
            $log.info(res);
            createBeneficiaryBankAccount(reqBnk);
        });
    }

    function init() {
        $log.info("init started...");

        $log.info("init finished...");
    }

    angular.extend(this, {
        uiState: uiState,
        onCountryChange: onCountryChange,
        reset: reset,
        cancel: cancel,
        save: save
    });

    init();

    $log.info(cmpId + 'finished...');
}
beneficiaryAddOrEditController.$inject = ['$log', '$rootScope', '$scope', 'sessionService', '$uibModalInstance', 'model', 'country'];
appControllers.controller('beneficiaryAddOrEditController', beneficiaryAddOrEditController);

var dependents = ['ngRoute', 'ngSanitize', 'ngMessages'];
dependents.push('ngStorage');
dependents.push('ngclipboard');
dependents.push('green.inputmask4angular');
dependents.push('blockUI');
dependents.push('ngNotify');
dependents.push('ui.bootstrap');
dependents.push('app.filters');
dependents.push('app.directives');
dependents.push('app.services');
dependents.push('app.controllers');
var app = angular.module('app', dependents), lodash = _, jquery = $;

function appConfig($routeProvider, $locationProvider) {
    $routeProvider.when('/', {
        redirectTo: '/home'
    });

    $routeProvider.when('/home', {
        templateUrl: 'app/views/home.html',
        controller: 'homeController as vm',
        resolve: homeController.resolve
    });

    $routeProvider.when('/sign-up', {
        templateUrl: 'app/views/signUp.html',
        controller: 'signUpController as vm',
        resolve: signUpController.resolve
    });

    $routeProvider.when('/cdd', {
        templateUrl: 'app/views/cdd.html',
        controller: 'cddController as vm',
        resolve: cddController.resolve
    });

    $routeProvider.when('/customer-to-user', {
        templateUrl: 'app/views/customerToUser.html',
        controller: 'customerToUserController as vm',
        resolve: customerToUserController.resolve
    });

    $routeProvider.when('/beneficiaries', {
        templateUrl: 'app/views/beneficiaryList.html',
        controller: 'beneficiaryListController as vm',
        resolve: beneficiaryListController.resolve
    });

    $routeProvider.when('/beneficiaries/beneficiary', {
        templateUrl: 'app/views/beneficiaryAddOrEdit.html',
        controller: 'beneficiaryAddOrEditController as vm',
        resolve: beneficiaryAddOrEditController.resolve
    });

    $routeProvider.when('/not-found', {
        template: '<p>Not Found</p>'
    });

    $routeProvider.otherwise({
        redirectTo: '/not-found'
    });

    //$locationProvider.hashPrefix('');
};
app.config(appConfig);

function appInit($log, $rootScope, $location, $sessionStorage) {
    $log.info('Initialization started...');

    // $rootScope.$on("$routeChangeStart", function (event, next, current) {
    //     $log.info('Location : ', $location.path());
    //     var curLocPath = $location.path();
    //     $log.info('Before Current Location : ', curLocPath);
    // });
    //
    // $rootScope.$on("$routeChangeSuccess", function (event, next, current) {
    //    $log.info('Location : ', $location.path());
    //    var curLocPath = $location.path();
    //    $log.info('After Current Location : ', curLocPath);
    // });

    var path = '/sign-up';
    $location.path(path);

    $log.info('Initialization finished...');
}
app.run(['$log', '$rootScope', '$location', '$sessionStorage', appInit]);

// if(window.location.hostname == 'maxmoney.com') {
//     app.maxApiUrlPrefix = 'https://api.maxmoney.com/v1';
// }
// console.log('Current Api End Point : ' + app.maxApiUrlPrefix);
