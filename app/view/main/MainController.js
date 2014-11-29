Ext.define('MyApp.view.main.MainController', {
    extend : 'Ext.app.ViewController',
    alias  : 'controller.main',

    requires : [
        'PostMessage.EventDomain'
    ],

    listen : {
        postmessage : {
            '*' : {
                test : 'onTest'
            }
        }
    },

    onClickButton : function () {
        var main = this.getView();

        main.setPostMessageListeners(null);
    },

    onTest : function(data, e) {
        console.log('MainController');
        console.log(data);
    }
});
