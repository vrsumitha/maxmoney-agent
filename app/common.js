function generalHttpInterceptor($log, $rootScope, $q, $window) {
    return {
        'request': function (config) {
            $rootScope.isProgress = true;
            if($rootScope.sessionId) {
                config.headers['api-key'] = $rootScope.sessionId;
                //$log.info('sessionId = ' + $rootScope.sessionId);
            }
            //console.log($rootScope.sessionId);
            return config;
        },

        'requestError': function (rejection) {
            $rootScope.isProgress = false;
            $log.error(rejection);
            return rejection;
        },

        'response': function (response) {
            $rootScope.isProgress = false;
            return response;
        },

        'responseError': function (rejection) {
            //console.log(rejection);
            $rootScope.isProgress = false;
            $log.error(rejection);
            if (rejection.status == 401 && rejection.data.code == 91) {
                $rootScope.$emit('session:invalid', 'Invalid session...');
            }
            return rejection;
        }
    };
}
appServices.factory('generalHttpInterceptor', generalHttpInterceptor);


appDirectives.directive('inputMaskModel', function ($parse) {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, modelCtrl) {
            ctrl.$validators.integer = function(modelValue, viewValue) {
                console.log('modelValue : ' + modelValue);
                console.log('viewValue  : ' + viewValue);
                if (ctrl.$isEmpty(modelValue)) {
                    return true;
                }
                // if (INTEGER_REGEXP.test(viewValue)) {
                //     return true;
                // }
                return false;
            };
        }
    };
});
