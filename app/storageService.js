function storageService($rootScope, $log, $q, $filter, $localStorage) {

    var service = {};

    service.getCustomers = function () {
        var customers = $localStorage.customers;
        return customers;
    };

    service.saveCustomer = function (model) {
        $localStorage.customers.push(model);
    };

    function init() {
        var customers = $localStorage.customers;
        if (!customers) {
            customers = [];
            $localStorage.customers = customers;
        }
    }

    init();

    return service;
}
appServices.factory('storageService', storageService);