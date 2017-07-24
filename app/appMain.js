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

    var params = {userId: 'sa@maxmoney.com', password: 'MaxMoney@2016'};
    sessionService.signIn(params).then(function (res) {
        sessionService.getCurrentSession().then(function (res) {
            $log.info('Current Session Id : ' + $rootScope.sessionId);
            $log.info('Current User Id    : ' + res.username);
            $log.info('Current User Role  : ' + res.role);
        });
    });

}
appControllers.controller('rootController', rootController);

var dependents = ['ngRoute', 'ngSanitize', 'ngMessages'];
dependents.push('ngStorage');
dependents.push('ngclipboard');
dependents.push('green.inputmask4angular');
dependents.push('blockUI');
dependents.push('ngNotify');
dependents.push('selector');
dependents.push('moment-picker');
dependents.push('ui.bootstrap');
dependents.push('ngFileUpload');
dependents.push('app.filters');
dependents.push('app.directives');
dependents.push('app.services');
dependents.push('app.controllers');
var app = angular.module('app', dependents), lodash = _, jquery = $;

// app.config(function ($logProvider) {
//     if (window.location.hostname != 'localhost') {
//         $logProvider.debugEnabled(false);
//     }
// });

// app.config(function ($httpProvider) {
//     // $httpProvider.defaults.useXDomain = true;
//     // $httpProvider.defaults.withCredentials = true;
//     // delete $httpProvider.defaults.headers.common['X-Requested-With'];
//     $httpProvider.interceptors.push('generalHttpInterceptor');
// });

function appConfig($routeProvider, $locationProvider) {
    $routeProvider.when('/', {
        redirectTo: '/home'
    });
    /*
     $routeProvider.when('/home', {
     templateUrl: 'app/views/home.html',
     controller: 'homeController as vm',
     resolve: homeController.resolve
     });
     */
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
    /*
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
     */
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

    if (window.location.hostname == 'localhost') {
        $rootScope.appMode = 'local';
    } else {
        $rootScope.appMode = 'prod';
    }
    console.log('Application Mode : ' + $rootScope.appMode);

    var path = '/sign-up';
    if($rootScope.appMode == 'local') {
        //path = '/cdd';
    }
    $log.info('Startup Path : ' + path);
    $location.path(path);

    $log.info('Initialization finished...');
}
app.run(['$log', '$rootScope', '$location', '$sessionStorage', appInit]);


