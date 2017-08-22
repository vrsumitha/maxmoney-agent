function userViewController($log, $rootScope, $scope, wydNotifyService, sessionService, $routeParams, $http, $location) {
    var cmpId = 'userViewController', cmpName = 'Approve Users';
    $log.info(cmpId + ' started ...');

    $rootScope.viewName = cmpName;

    var vm = this, uiState = {isReady: false, isBlocked: false, isValid: false};
    vm.model = {};

    function computeImageUrls() {
        if (vm.model.images.Front) {
            var imgUrl = sessionService.getApiBasePath() + '/customers/';
            imgUrl += vm.model.idNo + '/images/';
            imgUrl += vm.model.images.Front;
            imgUrl += '?api-key=' + $rootScope.sessionId;
            vm.model.imageFrontUrl = imgUrl;
            console.log(vm.model.imageFrontUrl);
        }
        if (vm.model.images.Back) {
            var imgUrl = sessionService.getApiBasePath() + '/customers/';
            imgUrl += vm.model.idNo + '/images/';
            imgUrl += vm.model.images.Back;
            imgUrl += '?api-key=' + $rootScope.sessionId;
            vm.model.imageBackUrl = imgUrl;
            console.log(vm.model.imageBackUrl);
        }
        //if (vm.model.images.Signature) {
        //    var imgUrl = sessionService.getApiBasePath() + '/customers/';
        //    imgUrl += vm.model.idNo + '/images/';
        //    imgUrl += vm.model.images.Signature;
        //    imgUrl += '?api-key=' + $rootScope.sessionId;
        //    vm.model.imageSignatureUrl = imgUrl;
        //    console.log(vm.model.imageSignatureUrl);
        //}
    }

    function updateStatus(status) {
        $log.debug('updateStatus started...');

        var reqData = {'status': status};
        var path = sessionService.getApiBasePath() + '/users/' + vm.model.email;
        var req = {
            method: 'PUT',
            url: path,
            params: reqData,
            headers: {'api-key': $rootScope.sessionId}
        };
        //$log.info(req);
        $http(req).then(function (res) {
            $log.debug(res);
            $log.debug('updateStatus finished with success.');
            var msg = 'Successfully ';
            if(status == 'active') {
                msg += 'activated.';
            }
            if(status == 'removed') {
                msg += 'rejected.';
            }
            swal({
                type: 'success',
                text: msg,
                allowOutsideClick: false
            }).then(
                function () {
                    $scope.$apply(function () {
                        $location.path('/users');
                    });
                }
            );
        }, function (res) {
            $log.error(res);
            $log.debug('updateStatus finished with failure.');
            wydNotifyService.showError('Approve failed. ' + res.data.description);
        });
    }

    function init() {
        $log.info(cmpId + ' init started...');

        if($routeParams.id) {
            var model = _.find(sessionService.users, function(item) { return item.idNo === $routeParams.id });
            _.assign(vm.model, model);
            console.log(model);
            computeImageUrls();
        }

        // https://api-staging.maxmoney.com/v1/risks/peps/ABDUL%20HALIMI%20TAIFOR?country=Malaysia
        var path = sessionService.getApiBasePath() + '/risks/peps/' + vm.model.fullName.trim() + '?country=' + vm.model.riskProfile.cdd.nationalityCountry;
        var req = {
            method: 'GET',
            url: path,
            headers: {'api-key': $rootScope.sessionId}
        };
        //$log.info(req);
        $http(req).then(function (res) {
            $log.debug(res);
            if(res.status === 200) {
                vm.model.isInPEP = res.data.total > 0 ? 'Yes' : 'No';
            }
        }, function (res) {
            $log.error(res);
        });
        // https://api-staging.maxmoney.com/v1/risks/ofac/ABDUL%20HALIMI%20TAIFOR
        path = sessionService.getApiBasePath() + '/risks/ofac/' + vm.model.fullName.trim();
        req = {
            method: 'GET',
            url: path,
            headers: {'api-key': $rootScope.sessionId}
        };
        //$log.info(req);
        $http(req).then(function (res) {
            $log.debug(res);
            if(res.status === 200) {
                vm.model.isInOFAC = res.data.total > 0 ? 'Yes' : 'No';
            }
        }, function (res) {
            $log.error(res);
        });

        $log.info(cmpId + ' init finished...');
    }

    angular.extend(this, {
        uiState: uiState,
        updateStatus: updateStatus
    });

    init();

    $log.info(cmpId + 'finished...');
}
userViewController.$inject = ['$log', '$rootScope', '$scope', 'wydNotifyService', 'sessionService', '$routeParams', '$http', '$location'];
appControllers.controller('userViewController', userViewController);
