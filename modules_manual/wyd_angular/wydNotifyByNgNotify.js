appServices.factory('wydNotifyService', function ($log, $timeout, ngNotify) {

    ngNotify.config({
        theme: 'pure',
        position: 'top',
        duration: 3000,
        type: 'info',
        sticky: false
    });

    return {
        showInfo: function (message, clear) {
            if (clear) {
                ngNotify.dismiss();
            }
            ngNotify.set(message, {
                type: 'info',
                duration: 4000
            });
        },

        showSuccess: function (message, clear) {
            if (clear) {
                ngNotify.dismiss();
            }
            ngNotify.set(message, {
                type: 'success',
                duration: 3000
            });
        },

        showWarning: function (message, clear) {
            if (clear) {
                ngNotify.dismiss();
            }
            ngNotify.set(message, {
                type: 'warn',
                duration: 2000
            });
        },

        showError: function (message, clear) {
            if (clear) {
                ngNotify.dismiss();
            }
            ngNotify.set(message, {
                sticky: true,
                type: 'error',
                duration: 5000
            });
        },

        hide: function () {
            ngNotify.dismiss();
        }
    };
});