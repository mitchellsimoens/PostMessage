/**
 * An event domain to listen to events fired via window.postMessage events.
 *
 * An example usage is:
 *
 *     Ext.define('MyApp.view.main.MainController', {
 *         extend : 'Ext.app.ViewController',
 *         alias  : 'controller.myapp-main-main',
 *
 *         listen : {
 *             postmessage : {
 *                 '*' : {
 *                     eventName : 'someMethod'
 *                 }
 *             }
 *         },
 *
 *         someMethod : function(message, e) {}
 *     });
 */

Ext.define('PostMessage.EventDomain', {
    extend    : 'Ext.app.EventDomain',
    singleton : true,

    requires : [
        'PostMessage.Observable'
    ],

    type : 'postmessage',

    publish : function(event, data, e) {
        var bus       = this.bus,
            selectors = bus[event],
            selector, controllers,
            id, info, events, len, i;

        if (selectors) {
            for (selector in selectors) {
                if (selectors.hasOwnProperty(selector)) {
                    controllers = selectors[selector];

                    if (controllers) {
                        for (id in controllers) {
                            if (controllers.hasOwnProperty(id)) {
                                info = controllers[id];

                                if (info.controller.isActive()) {
                                    events = info.list;
                                    len    = events.length;

                                    for (i = 0; i < len; i++) {
                                        event = events[i];

                                        if (event.fire.call(event, data, e) === false) {
                                            return false;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
});
