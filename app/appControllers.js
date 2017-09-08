function signInController($log, $rootScope, $scope, wydNotifyService, storageService, sessionService, $location, $timeout) {
    var cmpId = 'signInController', cmpName = 'Sign In';
    $log.info(cmpId + ' started ...');

    $rootScope.viewName = cmpName;

    var vm = this, uiState = {isReady: false, isBlocked: false, isValid: false};

    function onSignIn() {

    }

    function reset() {
        $log.info('reset started...');

        vm.form.$setPristine();
        vm.password = null;
        vm.message = 'Sign In';

        $log.info('reset started...');
    }

    function signIn() {
        $log.info('signIn started...');

        wydNotifyService.hide();

        vm.message = 'Sign In';
        var params = {userId: vm.userId, password: vm.password};
        if(params.userId.indexOf("@") === -1) {
            params.userId = params.userId + '@maxmoney.com';
        }
        sessionService.signIn(params).then(function (res) {
            if (res.status > 199) {
                sessionService.getCurrentSession().then(function (res) {
                    $log.info('Current Session Id : ' + $rootScope.sessionId);
                    $log.info('Current User Id    : ' + $rootScope.session.username);
                    $log.info('Current User Role  : ' + $rootScope.session.role);
                    var obj = sessionService.roleInfo[$rootScope.session.role];
                    if(obj) {
                        $rootScope.homePath = obj.homePath;
                    } else {
                        $rootScope.homePath = '/not-found';
                        wydNotifyService.showError("This role '" + $rootScope.session.role + "' is not authorized to use this application.");
                        reset();
                        return;
                    }
                    $log.info('Current Home Path : ' + $rootScope.homePath);
                    $location.path($rootScope.homePath);
                }, function(res) {
                    wydNotifyService.showError('Fetching current session failed : ' + res.data.message);
                });
            }
        }, function (res) {
            wydNotifyService.showError(res.data.message);
        });

        $log.info('signIn finished...');
    }

    function init() {
        $log.info('init started...');

        vm.message = 'Sign In';

        if(window.location.hostname == 'localhost') {
            vm.userId = 'kamilcm@maxmoney.com';
            //vm.password = 'moos';
            //$timeout(signIn, 2000);
        }

        $log.info('init finished...');
    }

    angular.extend(this, {
        uiState: uiState,
        signIn: signIn,
        reset: reset
    });

    init();

    $log.info(cmpId + 'finished...');
}
signInController.$inject = ['$log', '$rootScope', '$scope', 'wydNotifyService', 'storageService', 'sessionService', '$location', '$timeout'];
appControllers.controller('signInController', signInController);

function signOutController($log, $rootScope, $scope, sessionService, $sessionStroage, $location) {
    var cmpId = 'signOutController', cmpName = 'Sign Out';
    $log.info(cmpId + ' started ...');

    $rootScope.viewName = cmpName;

    var vm = this, uiState = {isReady: false, isBlocked: false, isValid: false};

    function onSignOut() {
        sessionService.currentCustomer = null;
        $rootScope.session = null;
        $rootScope.sessionId = null;
        $rootScope.homePath = '/sign-in';
        $sessionStroage.$reset();
    }

    sessionService.signOut().then(function (res) {
        onSignOut();
        $location.path($rootScope.homePath);
    }, function (res) {
        onSignOut();
        $location.path($rootScope.homePath);
    });

}
signOutController.$inject = ['$log', '$rootScope', '$scope', 'sessionService', '$sessionStorage', '$location'];
appControllers.controller('signOutController', signOutController);

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
        vm.model = model;
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
                model.dialingNumber = parseInt(model.mobile.substring(countryInfo.dial_code.length));
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
        vm.model = model;
    }
    $log.debug(vm.model);

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

    function onPayoutAgentChangeX(ov, nv) {
        if (nv) {
            vm.model.bankAccount.payoutAgent.$setValidity('required', false);
            //vm.form.bankName.$setValidity('required', false);
        } else {
            vm.model.bankAccount.payoutAgent.$setValidity('required', true);
            // vm.form.bankName.$setValidity('required', true);
        }
    }

    // function onPayBy(value) {
    //     vm.payBy = value;
    //     console.log(vm.payBy);
    // }

    function reset() {
        $log.info('reset started...');

        vm.form2.$setPristine();
        vm.payBy = 'CP';
        vm.model.agentCountry = null;
        vm.model.orderPurpose = null;
        vm.model.relationship = null;
        vm.model.bankAccount.payoutAgent = null;

        $log.info('reset finished...');
    }

    function cancel() {
        $uibModalInstance.dismiss('cancel');
    }

    function save() {
        //wydNotifyService.hide();

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
        //value = value.replace(new RegExp('_', 'g'), ' ').trim();
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

            if (vm.payBy == 'BD') {
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
            if (vm.payBy == 'BD') {
                createBeneficiaryBankAccount(reqBnk);
            } else {
                $uibModalInstance.close(vm.resModel);
            }
        });
    }

    function createBeneficiaryBankAccount(reqBnk) {
        $log.debug('create beneficiary bank account...');
        $log.debug(reqBnk);
        sessionService.createBeneficiaryBankAccount(vm.model.id, reqBnk).then(function (res) {
            $log.debug(res);
            vm.resModel = res.data;
            $uibModalInstance.close(vm.resModel);
        });
    }

    function updateBeneficiary(reqBen, reqBnk) {
        $log.debug('update beneficiary...');
        $log.debug(reqBen);
        sessionService.updateBeneficiary(vm.model.id, reqBen).then(function (res) {
            $log.debug(res);
            vm.resModel = res.data;
            if (vm.payBy == 'BD') {
                deleteAndUpdateBeneficiaryBankAccount(reqBnk);
            } else {
                $uibModalInstance.close(vm.resModel);
            }
        });
    }

    function deleteAndUpdateBeneficiaryBankAccount(reqBnk) {
        $log.info('delete beneficiary bank account...');
        sessionService.deleteBeneficiaryBankAccount(vm.model.id, {index: 1}).then(function (res) {
            $log.debug(res);
            createBeneficiaryBankAccount(reqBnk);
        });
    }

    function init() {
        $log.info('init started...');

        $log.info('init finished...');
    }

    angular.extend(this, {
        uiState: uiState,
        onCountryChange: onCountryChange,
        onPayoutAgentChangeX: onPayoutAgentChangeX,
        reset: reset,
        cancel: cancel,
        save: save
    });

    init();

    $log.info(cmpId + 'finished...');
}
beneficiaryAddOrEditController.$inject = ['$log', '$rootScope', '$scope', 'sessionService', '$uibModalInstance', 'model', 'country'];
appControllers.controller('beneficiaryAddOrEditController', beneficiaryAddOrEditController);

function resendSmsController($log, $rootScope, $scope, sessionService, $uibModalInstance, model, http, wydNotifyService) {
    var cmpId = 'resendSmsController', cmpName = 'Resend SMS';
    $log.info(cmpId + ' started ...');

    var vm = this, uiState = {isReady: false, isBlocked: false, isValid: false};

    vm.title = 'Resend SMS';

    if (model) {
        vm.model = model;
    }
    $log.debug(vm.model);

    function cancel() {
        $uibModalInstance.dismiss('cancel');
    }

    function sendSms() {
        //wydNotifyService.hide();

        var path = sessionService.getApiBasePath() + '/users/' + vm.model.email + '/resend-welcome-message';
        var req = {
            method: 'GET',
            url: path,
            headers: {'api-key': $rootScope.sessionId}
        };
        //$log.info(req);
        http(req).then(function (res) {
            $log.debug(res);
            $uibModalInstance.dismiss('cancel');
            wydNotifyService.showSuccess('Successfully SMS sent.');
        }, function (res) {
            $log.error(res);
            wydNotifyService.showError(res.data.message);
        });
    }

    function init() {
        $log.info('init started...');

        $log.info('init finished...');
    }

    angular.extend(this, {
        uiState: uiState,
        cancel: cancel,
        sendSms: sendSms
    });

    init();

    $log.info(cmpId + 'finished...');
}
resendSmsController.$inject = ['$log', '$rootScope', '$scope', 'sessionService', '$uibModalInstance', 'model', 'http', 'wydNotifyService'];
appControllers.controller('resendSmsController', resendSmsController);

function testBenchController($log, $rootScope, $scope, sessionService, $sessionStroage) {
    var cmpId = 'testBenchController', cmpName = 'Test Bench';
    $log.info(cmpId + ' started ...');

    $rootScope.viewName = cmpName;

    var vm = this, uiState = {isReady: false, isBlocked: false, isValid: false};

}
testBenchController.$inject = ['$log', '$rootScope', '$scope', 'sessionService', '$sessionStorage'];
appControllers.controller('testBenchController', testBenchController);
