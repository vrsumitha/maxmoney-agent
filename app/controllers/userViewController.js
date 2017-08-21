function userViewController($log, $rootScope, $scope, wydNotifyService, sessionService, $routeParams, $http, $location) {
    var cmpId = 'userViewController', cmpName = 'Approve Users';
    $log.info(cmpId + ' started ...');

    $rootScope.viewName = cmpName;

    var vm = this, uiState = {isReady: false, isBlocked: false, isValid: false};

    function computeImageUrls() {
        if (vm.model.images.Front) {
            var imgUrl = sessionService.getApiBasePath() + '/users/';
            imgUrl += vm.model.idNo + '/images/';
            imgUrl += vm.model.images.Front;
            imgUrl += '?api-key=' + $rootScope.sessionId;
            vm.model.imageFrontUrl = imgUrl;
            console.log(vm.model.imageFrontUrl);
        }
        if (vm.model.images.Back) {
            var imgUrl = sessionService.getApiBasePath() + '/users/';
            imgUrl += vm.model.idNo + '/images/';
            imgUrl += vm.model.images.Back;
            imgUrl += '?api-key=' + $rootScope.sessionId;
            vm.model.imageBackUrl = imgUrl;
            console.log(vm.model.imageBackUrl);
        }
        //if (vm.model.images.Signature) {
        //    var imgUrl = sessionService.getApiBasePath() + '/users/';
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
            wydNotifyService.showSuccess('Successfully approved...');
            $location.path('/users');
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
            console.log(model);
            vm.model = model;
            computeImageUrls();
        }

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
