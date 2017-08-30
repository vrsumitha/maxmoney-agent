function rootController($log, $rootScope, $scope, $window) {
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

}
appControllers.controller('rootController', rootController);

function homeController($log, $rootScope, $scope, $sessionStroage) {
    var cmpId = 'homeController', cmpName = 'Home';
    $log.info(cmpId + ' started ...');

    $rootScope.viewName = cmpName;

    var vm = this, uiState = {isReady: false, isBlocked: false, isValid: false};

    function init() {

    }

    init();
}
homeController.$inject = ['$log', '$rootScope', '$scope', '$sessionStorage'];
appControllers.controller('homeController', homeController);

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

function appConfig($routeProvider, $locationProvider) {
    $routeProvider.when('/', {
        redirectTo: '/home'
    });

    $routeProvider.when('/home', {
        templateUrl: 'home.html',
        controller: 'homeController as vm'
    });

    $routeProvider.when('/not-found', {
        templateUrl: 'app/views/notFound.html'
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
    $log.info('App Mode : ' + $rootScope.appMode);

    $rootScope.sessionId = $sessionStorage.sessionId;
    if ($rootScope.sessionId) {
        $rootScope.session = $sessionStorage.session;
        $log.info('Current Session Id : ' + $rootScope.sessionId);
        $log.info('Current User Id    : ' + $rootScope.session.username);
        $log.info('Current User Role  : ' + $rootScope.session.role);
    }

    var path = $location.path().trim();
    if (!path || path == '') {
        var path = '/home';
    }
    $log.info('Start Path : ' + path);
    $location.path(path);

    $log.info('Initialization finished...');
}
app.run(['$log', '$rootScope', '$location', '$sessionStorage', appInit]);


