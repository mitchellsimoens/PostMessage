/**
 * The Observable that listens for messages that were sent via window.postMessage. To turn
 * the messages into events, this expects window.postMessage to send a JSON Object back
 * with an `event` and `data` properties. An example postMessage call would be like:
 *
 *     parent.postMessage({
 *         event : 'test',
 *         data  : {
 *             foo : 'bar'
 *         }
 *     }, '*');
 *
 * You can also send plain text as the data but you must still send the main Object:
 *
 *     parent.postMessage({
 *         event : 'test',
 *         data  : 'hello'
 *     }, '*');
 *
 * The data will be sent to Ext.decode to attempt to decode. If that fails then the plaintext
 * will be sent to the listeners.
 *
 * The main Object can also be passed as a string and it will be sent to Ext.decode:
 *
 *     parent.postMessage('{"event": "test", "data" : "{\"foo\": \"bar\"}"}', '*');
 */

Ext.define('PostMessage.Observable', {
    singleton : true,

    map : {},

    constructor : function() {
        Ext.get(window).on('message', this.onMessage, this);
    },

    onMessage : function(e) {
        var browserEvent = e.browserEvent,
            info         = browserEvent.data,
            event, data;

        if (Ext.isString(info)) {
            info = Ext.decode(info);
        }

        event = info.event;
        data  = info.data;

        this.handleEvent(event, data, e);
    },

    getEvent : function(event) {
        var map = this.map,
            arr = map[event];

        if (!arr) {
            arr = map[event] = [];
        }

        return arr;
    },

    subscribe : function(event, cfg) {
        var arr = this.getEvent(event);

        arr.push(cfg);
    },

    unsubscribe : function(event, cfg) {
        var arr    = this.getEvent(event),
            i      = 0,
            length = arr.length,
            newArr = [],
            listener;

        for (; i < length; i++) {
            listener = arr[i];

            if (listener.cfg !== cfg.fn && listener.scope !== cfg.scope) {
                newArr.push(listener);
            }
        }

        this.map[event] = newArr;
    },

    publish : function(listener, data, e, opts) {
        var fn    = listener.fn,
            scope = listener.scope || this;

        fn.call(scope, data, e, opts);
    },

    handleEvent : function(event, data, e) {
        var arr    = this.getEvent(event),
            i      = 0,
            length = arr.length,
            json   = Ext.isString(data) ? Ext.decode(data, true) : data,
            listener, ret;

        for (; i < length; i++) {
            listener = arr[i];
            ret      = json || data;

            this.publish(listener, ret, e, {
                event : event
            });
        }

        if (window.PostMessage.EventDomain) {
            ret = json || data;

            window.PostMessage.EventDomain.publish(event, ret, e);
        }
    }
});
