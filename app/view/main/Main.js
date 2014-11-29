Ext.define('MyApp.view.main.Main', {
    extend : 'Ext.container.Container',
    xtype  : 'app-main',

    requires : [
        'MyApp.view.main.MainController',
        'MyApp.view.main.MainModel',

        'Ext.ux.IFrame',

        'PostMessage.Mixin'
    ],

    mixins : [
        'PostMessage.Mixin'
    ],

    config : {
        postMessageListeners : {
            test : {
                scope : 'this',
                fn    : 'onTest'
            }
        }
    },

    controller : 'main',

    viewModel : {
        type : 'main'
    },

    layout : {
        type : 'border'
    },

    items : [
        {
            xtype  : 'panel',
            bind   : {
                title : '{name}'
            },
            region : 'west',
            html   : '<ul><li>This area is commonly used for navigation, for example, using a "tree" component.</li></ul>',
            width  : 250,
            split  : true,
            tbar   : [
                {
                    text    : 'Remove Listeners',
                    handler : 'onClickButton'
                }
            ]
        },
        {
            xtype     : 'tabpanel',
            reference : 'center',
            region    : 'center',
            items     : [
                {
                    xtype : 'uxiframe',
                    title : 'Tab 1',
                    src   : 'iframe.html'
                }
            ]
        }
    ],

    beforeInitConfig : function(config) {
        this.mixins.postmessage.constructor.call(this);

        this.callParent([config]);
    },

    onTest : function(data) {
        console.log('Main');
        console.log(data);
    }
});
