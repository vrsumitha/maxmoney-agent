function sessionService($rootScope, $log, $http, $q, $filter, $http, $sessionStorage) {
    var basePath = 'sessions', apiBasePath = 'https://api-staging.maxmoney.com/v1';

    var service = {
        context: {},
        currentUser: {},
        countries: [],
        malasiyaStates: [],
        orderPurposes: {},
        agentDetail: {},
        beneficiaries: []
    };
    
    service.getApiBasePath = function () {
      return apiBasePath;
    };

    function addOrUpdateCache(propName, objectx) {
        //var objectsLst = service[propName]
        var objectsMap = service[propName + 'Map'];
        var object = objectsMap[objectx.id];
        if (object) {
            _.assign(object, objectx);
        } else {
            //objectsLst.push(objectx);
            objectsMap[objectx.id] = objectx;
        }
    }

    service.getCountries = function () {
        var path = 'app/countries.json';
        var req = {
            method: 'GET',
            url: path
        };
        //$log.info(req);
        $log.debug('fetching countries started...');
        var deferred = $q.defer();
        $http(req).then(function (res, status) {
            $log.debug(res);
            //$log.debug(status);
            service.countries = res.data;
            // _.forEach(service.countries, function (item) {
            //    item.nationality = item.name;
            // });
            $rootScope.$broadcast('session:countries', 'Session countries updated...');
            deferred.resolve(res);
            $log.debug('fetching countries finished with success.');
        }, function (res, status) {
            $log.debug(res);
            $log.debug(status);
            deferred.reject({res: res, status: status});
            $log.debug('fetching countries finished with failure.');
        });
        return deferred.promise;
    };

    service.getMalasiyaStates = function () {
        var path = 'app/malasiyaStates.json';
        var req = {
            method: 'GET',
            url: path
        };
        //$log.info(req);
        $log.debug('fetching malasiyaStates started...');
        var deferred = $q.defer();
        $http(req).then(function (res, status) {
            $log.debug(res);
            //$log.debug(status);
            service.malasiyaStates = res.data;
            $rootScope.$broadcast('session:malasiyaStates', 'Session malasiyaStates updated...');
            deferred.resolve(res);
            $log.debug('fetching malasiyaStates finished with success.');
        }, function (res, status) {
            $log.debug(res);
            $log.debug(status);
            deferred.reject({res: res, status: status});
            $log.debug('fetching malasiyaStates finished with failure.');
        });
        return deferred.promise;
    };

    function processOrderPurposes(ipurposes) {
        var opurposes = service.orderPurposes;
        _.forOwn(ipurposes, function (value, key) {
            opurposes[key] = value;
        });
        //console.log(service.orderPurposes);
    }

    service.getOrderPurposes = function () {
        var path = apiBasePath + '/risks/purposes';
        var req = {
            method: 'GET',
            url: path
        };
        //$log.info(req);
        $log.debug('fetching order purposes started...');
        var deferred = $q.defer();
        $http(req).then(function (res, status) {
            $log.debug(res);
            //$log.debug(status);
            processOrderPurposes(res.data);
            $rootScope.$broadcast('session:orderPurposes', 'Session order purposes updated...');
            deferred.resolve(res);
            $log.debug('fetching order purposes finished with success.');
        }, function (res, status) {
            $log.debug(res);
            $log.debug(status);
            deferred.reject({res: res, status: status});
            $log.debug('fetching order purposes finished with failure.');
        });
        return deferred.promise;
    };

    service.getRelationships = function () {
        var path = 'app/relationships.json';
        var req = {
            method: 'GET',
            url: path
        };
        //$log.info(req);
        $log.debug('fetching relationships started...');
        var deferred = $q.defer();
        $http(req).then(function (res, status) {
            $log.debug(res);
            //$log.debug(status);
            service.relationships = res.data;
            $rootScope.$broadcast('session:relationships', 'Session relationships updated...');
            deferred.resolve(res);
            $log.debug('fetching relationships finished with success.');
        }, function (res, status) {
            $log.debug(res);
            $log.debug(status);
            deferred.reject({res: res, status: status});
            $log.debug('fetching relationships with failure.');
        });
        return deferred.promise;
    };

    service.getAgents = function () {
        var path = apiBasePath + '/agents?provider=mremit';
        var req = {
            method: 'GET',
            url: path
        };
        //$log.info(req);
        $log.debug('fetching agents started...');
        var deferred = $q.defer();
        $http(req).then(function (res, status) {
            $log.debug(res);
            //$log.debug(status);
            // processAgents(res);
            service.agentDetail = res.data;
            $rootScope.$broadcast('session:agents', 'Session agents updated...');
            deferred.resolve(res);
            $log.debug('fetching agents finished with success.');
        }, function (res, status) {
            $log.debug(res);
            $log.debug(status);
            deferred.reject({res: res, status: status});
            $log.debug('fetching agents finished with failure.');
        });
        return deferred.promise;
    };

    service.getPayoutAgentsInfo = function (type, country, reqData) {
        var path = apiBasePath + '/locations/current?type=' + type + '&country=' + country;
        var req = {
            method: 'GET',
            url: path,
            params: reqData
        };
        //$log.info(req);
        $log.debug('fetching payout agents info started...');
        var deferred = $q.defer();
        $http(req).then(function (res, status) {
            $log.debug(res);
            //$log.debug(status);
            deferred.resolve(res.data);
            $log.debug('fetching payout agents info finished with success.');
        }, function (res, status) {
            $log.debug(res);
            $log.debug(status);
            deferred.reject({res: res, status: status});
            $log.debug('fetching payout agents info finished with failure.');
        });
        return deferred.promise;
    };

    service.getBeneficiaries = function () {
        var path = apiBasePath + '/users/current/beneficiaries';
        var req = {
            method: 'GET',
            url: path
        };
        //$log.info(req);
        $log.debug('fetching current beneficiaries started...');
        var deferred = $q.defer();
        $http(req).success(function (res, status) {
            $log.debug(res);
            //$log.debug(status);
            service.beneficiaries = res;
            service.getAgents();
            $rootScope.$broadcast('session:beneficiaries', 'Session beneficiaries updated...');
            deferred.resolve(res);
            $log.debug('fetching current beneficiaries finished with success.');
        }).error(function (res, status) {
            $log.debug(res);
            $log.debug(status);
            deferred.reject({res: res, status: status});
            $log.debug('fetching current beneficiaries finished with failure.');
        });
        return deferred.promise;
    };

    service.createBeneficiary = function (params) {
        var path = apiBasePath + '/beneficiaries';
        var req = {
            method: 'POST',
            url: path,
            params: params
        };
        //$log.info(req);
        var deferred = $q.defer();
        $http(req).then(function (res, status) {
            deferred.resolve(res);
        }, function (res, status) {
            deferred.reject(res);
        });
        return deferred.promise;
    };

    service.updateBeneficiary = function (id, params) {
        var path = apiBasePath + '/beneficiaries/' + id;
        var req = {
            method: 'PUT',
            url: path,
            params: params
        };
        $log.info(req);
        var deferred = $q.defer();
        $http(req).then(function (res, status) {
            deferred.resolve(res);
        }, function (res, status) {
            deferred.reject(res);
        });
        return deferred.promise;
    };

    service.deleteBeneficiary = function (id, params) {
        var path = apiBasePath + '/beneficiaries/' + id;
        var req = {
            method: 'DELETE',
            url: path
        };
        //$log.info(req);
        var deferred = $q.defer();
        $http(req).then(function (res, status) {
            deferred.resolve(res);
        }, function (res, status) {
            deferred.reject(res);
        });
        return deferred.promise;
    };

    service.createBeneficiaryBankAccount = function (id, params) {
        var path = apiBasePath + '/beneficiaries/' + id + '/accounts';
        var req = {
            method: 'POST',
            url: path,
            params: params
        };
        //$log.info(req);
        var deferred = $q.defer();
        $http(req).then(function (res, status) {
            deferred.resolve(res);
        }, function (res, status) {
            deferred.reject(res);
        });
        return deferred.promise;
    };

    service.deleteBeneficiaryBankAccount = function (id, params) {
        var path = apiBasePath + '/beneficiaries/' + id + '/accounts';
        var req = {
            method: 'DELETE',
            url: path
        };
        //$log.info(req);
        var deferred = $q.defer();
        $http(req).then(function (res, status) {
            deferred.resolve(res);
        }, function (res, status) {
            deferred.reject(res);
        });
        return deferred.promise;
    };

    service.signUp = function (params) {
        var path = apiBasePath + '/customers';
        var req = {
            method: 'POST',
            url: path,
            params: params
        };
        //$log.info(req);
        var deferred = $q.defer();
        $http(req).then(function (res, status) {
            deferred.resolve(res);
        }, function (res, status) {
            deferred.reject(res);
        });
        return deferred.promise;
    };

    service.signIn = function(params) {
        var reqData = {'username': params.userId, 'password': params.password};
        var path = apiBasePath + '/sessions/current';
        var req = {
            method: 'POST',
            url: path,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj) {
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                }
                return str.join("&");
            },
            data: reqData
        };
        //$log.debug(req);
        $log.debug('signIn started...');
        var deferred = $q.defer();
        $http(req).then(function (res) {
            //$log.info(res);
            $log.debug('signIn finished with success.');
            $sessionStorage.sessionId = res.data.session;
            $rootScope.sessionId = $sessionStorage.sessionId;
            deferred.resolve(res.data);
        }, function (res) {
            $log.error(res);
            $log.debug('signIn finished with failure.');
            deferred.reject(res.data);
        });
        return deferred.promise;
    };

    service.getCurrentUser = function () {
        var path = apiBasePath + '/users/current';
        var req = {
            method: 'GET',
            url: path
        };
        //$log.info(req);
        $log.debug('fetching current user started...');
        var deferred = $q.defer();
        $http(req).then(function (res, status) {
            console.log(res);
            //$log.debug(res);
            //$log.debug(status);
            _.assign(service.currentUser, res);
            $rootScope.$broadcast('session:currentUser', 'Session current user updated...');
            deferred.resolve(res);
            $log.debug('fetching current user finished with success.');
        }, function (res, status) {
            $log.debug(res);
            $log.debug(status);
            deferred.reject({res: res, status: status});
            $log.debug('fetching current user finished with failure.');
        });
        return deferred.promise;
    };

    service.getCurrentSessionX = function () {
        var path = apiBasePath + '/sessions/current';
        var req = {
            method: 'GET',
            headers: {'api-key': $rootScope.sessionId},
            url: path
        };
        //$log.info(req);
        $log.debug('fetching current session started...');
        var deferred = $q.defer();
        $http(req).then(function (res) {
            //$log.info(res);
            $log.debug('fetching current session finished with success.');
            deferred.resolve(res.data);
        }, function (res) {
            $log.error(res.data);
            $log.debug('fetching current session finished with failure.');
            deferred.reject(res.data);
        });
        return deferred.promise;
    };

    service.getCurrentSession = function() {
        $log.info('fetching current session started...');
        var deferred = $q.defer();
        $http.get('app/session.json').then(function(res, status){
            deferred.resolve(res.data);
            $log.info('fetching current session finished with success...');
        }, function(res, status){
            deferred.reject({res: res, status: status});
            $log.info('fetching current session finished with failure...');
        });
        return deferred.promise;
    };

    service.signOut = function () {
        var path = apiBasePath + '/sessions/current';
        var req = {
            method: 'DELETE',
            url: path
        };
        //$log.info(req);
        $log.debug('signout current session started...');
        var deferred = $q.defer();
        $http(req).then(function (res) {
            // $log.info(res);
            $rootScope.sessionId = null;
            $sessionStorage.$reset();
            deferred.resolve(res.data);
            $log.debug('signOut current session finished with success.');
        }, function (res, status) {
            // $log.info(res);
            $rootScope.sessionId = null;
            $sessionStorage.$reset();
            deferred.reject(res.data);
            $log.debug('signOut current session finished with failure.');
        });
        return deferred.promise;
    };

    console.log('Frontend Hostname : ' + window.location.hostname);
    if(window.location.hostname == 'maxmoney.com') {
        apiBasePath = 'https://api.maxmoney.com/v1';
    }
    console.log('Backend URL : ' + apiBasePath);
    if(window.location.hostname == 'localhost') {
        $rootScope.appMode = 'local';
    }
    console.log('Application Mode : ' + $rootScope.appMode);

    return service;
}
appServices.factory('sessionService', sessionService);