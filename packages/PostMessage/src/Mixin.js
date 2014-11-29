Ext.define('PostMessage.Mixin', {
    extend : 'Ext.Mixin',

    requires : [
        'PostMessage.Observable'
    ],

    mixinConfig : {
        id    : 'postmessage',
        after : {
            destroy : 'destroy'
        }
    },

    config : {
        /**
         * @cfg {Object} postMessageListeners An object describing the postMessage event. Example:
         *
         *     postMessageListeners : {
         *         eventName : 'someEvent'
         *     }
         *
         * You can also pass an object to controller the scope. By default, it will lookup the method
         * on the ViewController if present. If not then it will look on the class. To control the scope,
         * you can use the scope config and pass an object, 'this' (as a string) or 'controller' (as a string):
         *
         *     postMessageListeners : {
         *         eventName : {
         *             scope : 'this',
         *             fn    : 'someEvent'
         *         }
         *     }
         */
        postMessageListeners : null
    },

    constructor : function(config) {
        this.initConfig(config);
    },

    destroy : function() {
        this.clearPostMessageListeners();
    },

    updatePostMessageListeners : function(newListeners, oldListeners) {
        if (newListeners) {
            this.addPostMessageListener(newListeners);
        }

        if (oldListeners) {
            this.removePostMessageListener(oldListeners);
        }
    },

    addPostMessageListener : function(listeners) {
        var controller = this.getController ? this.getController() : null,
            event, cfg, scope, isString;

        for (event in listeners) {
            cfg = listeners[event];

            if (Ext.isString(cfg) || Ext.isFunction(cfg)) {
                cfg = {
                    fn : cfg
                };
            } else {
                cfg = Ext.clone(cfg);
            }

            scope    = cfg.scope;
            isString = Ext.isString(cfg.fn);

            if (scope === 'this') {
                scope = cfg.scope = this;

                if (isString) {
                    cfg.fn = scope[cfg.fn];
                }
            } else if (scope === 'controller') {
                //<debug>
                if (!controller) {
                    console.warn('ViewController not found for postMessageListener');
                }

                //</debug>
                scope = cfg.scope = controller;

                if (isString) {
                    cfg.fn = scope[cfg.fn];
                }
            } else if (!scope && isString) {
                if (controller && controller[cfg.fn]) {
                    cfg.fn    = controller[cfg.fn];
                    cfg.scope = controller;
                } else if (this[cfg.fn]) {
                    cfg.fn    = this[cfg.fn];
                    cfg.scope = this;
                }
            }

            if (!cfg.scope) {
                cfg.scope = this;
            }

            if (cfg.fn) {
                PostMessage.Observable.subscribe(event, cfg);
            }
        }
    },

    removePostMessageListener : function(listeners) {
        var event, cfg, scope;

        for (event in listeners) {
            cfg = listeners[event];

            if (Ext.isString(cfg)) {
                cfg = {
                    fn    : cfg,
                    scope : this
                };
            }

            scope = cfg.scope;

            if (!scope) {
                scope = cfg.scope = this;
            }

            //TODO handle scope as 'this' and 'controller'

            if (Ext.isString(cfg.fn) && !Ext.isString(scope)) {
                cfg.fn = scope[cfg.fn];
            }

            PostMessage.Observable.unsubscribe(event, cfg);
        }
    },

    clearPostMessageListeners : function() {
        var listeners = this.getPostMessageListeners();

        this.removePostMessageListener(listeners);
    }
});
