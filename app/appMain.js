function rootController($log, $rootScope, $scope, $window, sessionService) {
    $log.debug('rootController...');

    $scope.lodash = _;
    $rootScope.homePath = '/sign-in';

    $scope.historyBack = function () {
        $window.history.back();
    };

    $scope.viewSource = function () {
        var s = 'view-source:' + $rootScope.currentViewSrcUrl;
        $log.info(s);
        $window.open(s);
    };

    $scope.isNavCollapsed = true;
    sessionService.initRoleInfo();
    sessionService.getCountries();
    sessionService.getMalasiyaStates();
    sessionService.getRelationships();
    sessionService.getOrderPurposes();
    sessionService.getAgents();

    // var params = {userId: 'sa@maxmoney.com', password: 'MaxMoney@2016'};
    // sessionService.signIn(params).then(function (res) {
    //     sessionService.getCurrentSession().then(function (res) {
    //         $log.info('Current Session Id : ' + $rootScope.sessionId);
    //         $log.info('Current User Id    : ' + res.username);
    //         $log.info('Current User Role  : ' + res.role);
    //     });
    // });

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
        redirectTo: '/sign-in'
    });

    $routeProvider.when('/sign-in', {
        templateUrl: 'app/views/signIn.html',
        controller: 'signInController as vm'
    });

    $routeProvider.when('/sign-out', {
        templateUrl: 'app/views/signOut.html',
        controller: 'signOutController as vm'
    });

    $routeProvider.when('/customers', {
        templateUrl: 'app/views/customerListing.html',
        controller: 'customerListingController as vm',
        resolve: customerListingController.resolve
    });

    $routeProvider.when('/customers/customer', {
        templateUrl: 'app/views/customerCreateOrUpdate.html',
        controller: 'customerCreateOrUpdateController as vm',
        resolve: customerCreateOrUpdateController.resolve
    });

    $routeProvider.when('/customers/customer/:id', {
        templateUrl: 'app/views/customerCreateOrUpdateX.html',
        controller: 'customerCreateOrUpdateController as vm',
        resolve: customerCreateOrUpdateController.resolve
    });

    $routeProvider.when('/customers/customer/:id/cdd', {
        templateUrl: 'app/views/customerCdd.html',
        controller: 'customerCddController as vm',
        resolve: customerCddController.resolve
    });

    $routeProvider.when('/customers/customer/:id/convert', {
        templateUrl: 'app/views/customerConvert.html',
        controller: 'customerConvertController as vm',
        resolve: customerConvertController.resolve
    });

    $routeProvider.when('/users', {
        templateUrl: 'app/views/userListing.html',
        controller: 'userListingController as vm',
        resolve: userListingController.resolve
    });

    $routeProvider.when('/users/user/:id', {
        templateUrl: 'app/views/userView.html',
        controller: 'userViewController as vm',
        resolve: userViewController.resolve
    });

    $routeProvider.when('/transfer-rates', {
        templateUrl: 'app/views/transferRatesList.html',
        controller: 'transferRatesListController as vm',
        resolve: transferRatesListController.resolve
    });

    $routeProvider.when('/not-found', {
        templateUrl: 'app/views/notFound.html'
    });

    $routeProvider.when('/test-bench', {
        controller: 'testBenchController as vm',
        templateUrl: 'app/views/testBench.html'
    });

    $routeProvider.otherwise({
        redirectTo: '/not-found'
    });

    //$locationProvider.hashPrefix('');
};
app.config(appConfig);

function appInit($log, $rootScope, $location, $sessionStorage, sessionService) {
    $log.info('Initialization started...');

    if (window.location.hostname == 'localhost') {
        $rootScope.appMode = 'local';
    } else {
        $rootScope.appMode = 'prod';

    }
    $log.info('App Mode : ' + $rootScope.appMode);

    console.log(window.location);
    $log.info('Hostname : ' + window.location.hostname);
    if (window.location.hostname.indexOf('maxmoney.com') > -1) {
        sessionService.setApiBasePath('https://api.maxmoney.com/v1');
    }
    $log.info('Backend URL : ' + sessionService.getApiBasePath());


    $rootScope.sessionId = $sessionStorage.sessionId;
    if($rootScope.sessionId) {
        $rootScope.session = $sessionStorage.session;
        $log.info('Current Session Id : ' + $rootScope.sessionId);
        $log.info('Current User Id    : ' + $rootScope.session.username);
        $log.info('Current User Role  : ' + $rootScope.session.role);
    }

    var path = $location.path().trim();
    if(!path || path == '' || path == '/not-found' || path == '/sign-out' || !$rootScope.sessionId) {
        var path = '/sign-in';
    }
    $log.info('Start Path : ' + path);
    $location.path(path);

    $log.info('Initialization finished...');
}
app.run(['$log', '$rootScope', '$location', '$sessionStorage', 'sessionService', appInit]);


