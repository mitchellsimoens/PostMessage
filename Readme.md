# Ext JS window.postMessage Observable

Using window.postMessage can be used as a more secure way to communicate between different documents in a single page. For example, if you have multiple `<iframe>` documents instead of trying to execute methods on the parent document (which can be insecure and fragile) you can use the postMessage function to pass text or Objects to the parent document.

However, postMessage is a global way of sending messages and no great way to listen to only certain messages. The hopes of this code is to make it more friendly to use within an Ext JS application.

## Sending messages

Like I said, one of the bad parts of postMessage is that it's global meaning there is no way for certain parts of an application to listen to certain messages. Ext JS has a great event system, using a familiar style of events, classes can opt into certain events and disregard events it doesn't care about. To do this, you must send an event and data to postMessage like so:

    parent.postMessage({
        event : 'eventName',
        data  : {
            foo : 'bar'
        }
    }, '*');
    
The data can be an Object, JSON or plaintext. Likewise, the main Object can be an Object or JSON. Here are some more examples:

    parent.postMessage({
        event : 'eventName',
        data  : '{"foo": "bar"}'
    }, '*');
    
    parent.postMessage({
        event : 'eventName',
        data  : 'hello there'
    }, '*');
    
    parent.postMessage('{"event": "eventName", "data" : "{\"foo\": \"bar\"}"}');

## Listening to messages

When you add the PostMessage.Mixin mixin to a class, it then receives the `postMessageListeners` config. This config is very close to the `listeners` config that you are familiar with. To use the mixin, you just need to add it to the `mixins` array:

    Ext.define('MyApp.view.Main', {
        extend : 'Ext.Component',
        xtype  : 'myapp-main',
        
        requires : [
             'PostMessage.Mixin'
        ],

        mixins : [
            'PostMessage.Mixin'
        ],
        
        beforeInitConfig : function(config) {
            this.mixins.postmessage.constructor.call(this);
    
            this.callParent([config]);
        }
    });

Since we have an event name, we can subscribe certain classes to that event name like so:

    Ext.define('MyApp.view.Main', {
        extend : 'Ext.Component',
        xtype  : 'myapp-main',
        
        requires : [
             'PostMessage.Mixin'
        ],

        mixins : [
            'PostMessage.Mixin'
        ],
        
        config : {
            postMessageListeners : {
                eventName : 'methodName'
            }
        },
        
        beforeInitConfig : function(config) {
            this.mixins.postmessage.constructor.call(this);
    
            this.callParent([config]);
        },
        
        methodName : function(data, e) {}
    });

You can also listen to the messages in a `ViewController` using the PostMessage.EventDomain class:

    Ext.define('MyApp.view.MainController', {
        extend : 'Ext.app.ViewController',
        alias  : 'controller.main',
    
        requires : [
            'PostMessage.EventDomain'
        ],
    
        listen : {
            postmessage : {
                '*' : {
                    eventName : 'methodName'
                }
            }
        },
    
        methodName : function(data, e) {}
    });

## TODO

 - Handle single, buffer, delay event configs
 - Better the add/remove listeners methods on PostMessage.mixin, method signature be more on addListener/removeListener
 
## Limitations

The limitations of this class is the same limitations as window.postMessage has. For example, this is IE8+. For more information, please see [https://developer.mozilla.org/en-US/docs/Web/API/Window.postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window.postMessage)
