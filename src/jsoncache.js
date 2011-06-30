/**
 * @preserve JSONCache version #VERSION#
 *
 * Author: Kimmo Puputti (kpuputti at gmail)
 *
 * See README.rst at https://github.com/kpuputti/JSONCache
 * for requirements and usage.
 */
/*jslint white: true, devel: true, onevar: false, undef: true, nomen: true,
  regexp: true, plusplus: false, bitwise: true, newcap: true, maxerr: 50,
  indent: 4 */
/*global jQuery: false, window: false */

(function ($) {


    // Configuration.
    var settings = {

        // This is expanded by the build process from the VERSION.txt file.
        version: '#VERSION#',

        debug: true,
        prefix: 'JSONCache',
        keySeparator: ' '
    };

    var log = function () {
        if (settings.debug && window.console) {
            var args = Array.prototype.slice.call(arguments);
            args.unshift('JSONCache:');
            console.log.apply(console, args);
        }
    };

    // Check the prerequisites for the browser.
    settings.browserOk = (function () {
        var jsonOk = window.JSON &&
            typeof window.JSON.parse === 'function' &&
            typeof window.JSON.stringify === 'function';
        var localStorageOk;
        try {
            localStorageOk =  'localStorage' in window && window.localStorage !== null;
        } catch (e) {
            localStorageOk = false;
        }
        return jsonOk && localStorageOk;
    }());

    // Namespace for all the code.
    var JSONCache = {};
    JSONCache.settings = settings;

    // Provide the proxy function for testing to mock the real jQuery.getJSON calls.
    JSONCache.getJSONProxy = function (url, options) {
        $.ajax(url, options);
    };

    JSONCache.getCachedJSON = function (url, options) {
        var success = options.success;
        var key = settings.prefix + settings.keySeparator + 'data' +
            settings.keySeparator + url;
        var cachedData = window.localStorage[key];
        if (cachedData) {
            log('Value found from cache for url:', url);
            success(JSON.parse(cachedData));
        } else {
            log('Value not found in cache fetching data from url:', url);

            // Wrap the success function to cache the data.
            options.success = function (data) {
                log('Fetched data, adding to cache for url:', url);
                window.localStorage[key] = JSON.stringify(data);
                success(data);
            };
            // Assure a json datatype.
            options.dataType = 'json';
            JSONCache.getJSONProxy(url, options);
        }
    };

    // Expose the namespace.
    window.JSONCache = JSONCache;

}(jQuery));