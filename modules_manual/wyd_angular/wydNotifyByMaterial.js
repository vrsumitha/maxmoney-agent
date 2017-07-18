appServices.factory('wydNotifyService', function ($log, $timeout, $mdToast) {

    return {

        showInfo: function (message, actionText) {
            // $log.info(message);
            var atext = 'Ok';
            if (actionText) {
                atext = actionText
            }
            return $mdToast.show($mdToast.simple()
                //.textContent(message)
                .content(message)
                .position('top right')
                .hideDelay(4000)
                .capsule(true)
                .action(atext)
                .highlightAction(false)
                .theme('info-toast')
            );
        },

        showSuccess: function (message) {
            // $log.info(message);
            return $mdToast.show(
                $mdToast.simple()
                    //.textContent(message)
                    .content(message)
                    .position('top right')
                    .hideDelay(3000)
                    .capsule(true)
                    .theme('success-toast')
            );
        },

        showWarning: function (message) {
            // $log.info(message);
            return $mdToast.show(
                $mdToast.simple()
                    //.textContent(message)
                    .content(message)
                    .position('top right')
                    .hideDelay(2000)
                    .capsule(true)
                    .theme('warning-toast')
            );
        },

        showError: function (message, actionText) {
            // $log.info(message);
            var atext = 'Ok';
            if (actionText) {
                atext = actionText
            }
            return $mdToast.show(
                $mdToast.simple()
                    //.textContent(message)
                    .content(message)
                    .position('top right')
                    .hideDelay(5000)
                    .capsule(true)
                    .action(atext)
                    .highlightAction(true)
                    .theme('error-toast')
            );
        },

        hide: function () {
            $mdToast.hide();
        }

    };
});
