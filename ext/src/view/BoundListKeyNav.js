/**
 * A specialized {@link Ext.util.KeyNav} implementation for navigating a {@link Ext.view.BoundList} using
 * the keyboard. The up, down, pageup, pagedown, home, and end keys move the active highlight
 * through the list. The enter key invokes the selection model's select action using the highlighted item.
 */
Ext.define('Ext.view.BoundListKeyNav', {
    extend: 'Ext.view.NavigationModel',

    alias: 'view.navigation.boundlist',

    /**
     * @cfg {Ext.view.BoundList} boundList (required)
     * The {@link Ext.view.BoundList} instance for which key navigation will be managed.
     */
    
    navigateOnSpace: true,

    initKeyNav: function(view) {
        var me = this,
            field = view.pickerField;

        // Add the regular KeyNav to the view.
        // Unless it's already been done (we may have to defer a call until the field is rendered.
        if (!me.keyNav) {
            me.callParent([view]);
        }

        // BoundLists must be able to function standalone with no bound field
        if (!field) {
            return;
        }

        if (!field.rendered) {
            field.on('render', Ext.Function.bind(me.initKeyNav, me, [view], 0), me, {single: true});
            return;
        }

        // BoundListKeyNav also listens for key events from the field to which it is bound.
        me.fieldKeyNav = new Ext.util.KeyNav({
            disabled: true,
            target: field.inputEl,
            forceKeyDown: true,
            up: me.onKeyUp,
            down: me.onKeyDown,
            right: me.onKeyRight,
            left: me.onKeyLeft,
            pageDown: me.onKeyPageDown,
            pageUp: me.onKeyPageUp,
            home: me.onKeyHome,
            end: me.onKeyEnd,
            tab: me.onKeyTab,
            space: me.onKeySpace,
            enter: me.onKeyEnter,
            A: {
                ctrl: true,
                // Need a separate function because we don't want the key
                // events passed on to selectAll (causes event suppression).
                handler: me.onSelectAllKeyPress
            },
            scope: me
        });
    },

    enable: function() {
        this.fieldKeyNav.enable();
        this.callParent();
    },

    disable: function() {
        this.fieldKeyNav.disable();
        this.callParent();
    },

    onItemMouseDown: function(view, record, item, index, event) {
        this.callParent([view, record, item, index, event]);
        
        // Stop the mousedown from blurring the input field
        event.preventDefault();
    },

    onKeyUp: function() {
        var me = this,
            boundList = me.view,
            allItems = boundList.all,
            oldItem = boundList.highlightedItem,
            oldItemIdx = oldItem ? boundList.indexOf(oldItem) : -1,
            newItemIdx = oldItemIdx > 0 ? oldItemIdx - 1 : allItems.getCount() - 1; //wraps around

        me.setPosition(newItemIdx);
    },

    onKeyDown: function() {
        var me = this,
            boundList = me.view,
            allItems = boundList.all,
            oldItem = boundList.highlightedItem,
            oldItemIdx = oldItem ? boundList.indexOf(oldItem) : -1,
            newItemIdx = oldItemIdx < allItems.getCount() - 1 ? oldItemIdx + 1 : 0; //wraps around

        me.setPosition(newItemIdx);
    },

    onKeyLeft: Ext.returnTrue,

    onKeyRight: Ext.returnTrue,

    onKeyTab: function(e) {
        var view = this.view,
            field = view.pickerField;

        if (view.isVisible()) {
            if (field.selectOnTab) {
                this.selectHighlighted(e);
            }
            field.collapse();
        }

        // Tab key event is allowed to propagate to field
        return true;
    },

    onKeyEnter: function(e) {
        var view = this.view,
            selModel = view.getSelectionModel(),
            field = view.pickerField,
            count = selModel.getCount();

        // Stop the keydown event so that an ENTER keyup does not get delivered to
        // any element which focus is transferred to in a select handler.
        e.stopEvent();
        this.selectHighlighted(e);

        // Handle the case where the highlighted item is already selected
        // In this case, the change event won't fire, so just collapse
        if (!field.multiSelect && count === selModel.getCount()) {
            field.collapse();
        }
    },

    onKeySpace: function() {
        if (this.navigateOnSpace) {
            this.callParent(arguments);
        }
        // Allow to propagate to field
        return true;
    },

    /**
     * Highlights the item at the given index.
     * @param {Number} index
     */
    focusItem: function(item) {
        var me = this,
            boundList = me.view;

        if (typeof item === 'number') {
            item = boundList.all.item(item);
        }
        if (item) {
            item = item.dom;
            boundList.highlightItem(item);
            boundList.getOverflowEl().scrollChildIntoView(item, false);
        }
    },

    /**
     * Triggers selection of the currently highlighted item according to the behavior of
     * the configured SelectionModel.
     */
    selectHighlighted: function(e) {
        var me = this,
            boundList = me.view,
            selModel = boundList.getSelectionModel(),
            highlightedRec,
            highlightedPosition = me.recordIndex;

        // If all options have been filtered out, then do NOT add most recently highlighted.
        if (boundList.all.getCount()) {
            highlightedRec = me.getRecord();
            if (highlightedRec) {

                // Select if not already selected.
                // If already selected, selecting with no CTRL flag will deselect the record.
                if (e.getKey() === e.ENTER || !selModel.isSelected(highlightedRec)) {
                    selModel.selectWithEvent(highlightedRec, e);

                    // If the result of that selection is that the record is removed or filtered out,
                    // jump to the next one.
                    if (!boundList.store.data.contains(highlightedRec)) {
                        me.setPosition(Math.min(highlightedPosition, boundList.store.getCount() - 1));
                    }
                }
            }
        }
    },

    destroy: function() {
        Ext.destroy(this.fieldKeyNav);
        this.callParent();
    }
});