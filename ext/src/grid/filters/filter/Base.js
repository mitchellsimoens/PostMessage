/**
 * Abstract base class for filter implementations.
 */
Ext.define('Ext.grid.filters.filter.Base', {
    mixins: [
        'Ext.mixin.Factoryable'
    ],

    factoryConfig: {
        type: 'grid.filter'
    },

    $configPrefixed: false,
    $configStrict: false,

    config: {
        /**
         * @cfg {Object} [itemDefaults]
         * The default configuration options for any menu items created by this filter.
         *
         * Example usage:
         *
         *      itemDefaults: {
         *          width: 150
         *      },
         */
        itemDefaults: null,

        menuDefaults: {
            xtype: 'menu'
        },

        /**
         * @cfg {Number} updateBuffer
         * Number of milliseconds to wait after user interaction to fire an update. Only supported
         * by filters: 'list', 'numeric', and 'string'.
         */
        updateBuffer: 500
    },

    /**
     * @property {Boolean} active
     * True if this filter is active.  Use setActive() to alter after configuration.
     */
    /**
     * @cfg {Boolean} active
     * Indicates the initial status of the filter (defaults to false).
     */
    active: false,

    /**
     * @property {String} type
     * The filter type. Used by the filters.Feature class when adding filters and applying state.
     */
    type: 'string',

    /**
     * @cfg {String} dataIndex
     * The {@link Ext.data.Store} dataIndex of the field this filter represents.
     * The dataIndex does not actually have to exist in the store.
     */
    dataIndex: null,

    /**
     * @property {Ext.menu.Menu} menu
     * The filter configuration menu that will be installed into the filter submenu of a column menu.
     */
    menu: null,

    isGridFilter: true,

    defaultRoot: 'data',

    /**
     * The prefix for id's used to track stateful Store filters.
     * @private
     */
    filterIdPrefix: Ext.baseCSSPrefix + 'gridfilter',

    /**
     * @event activate
     * Fires when an inactive filter becomes active
     * @param {Ext.grid.filters.filter.Filter} this
     */

    /**
     * @event deactivate
     * Fires when an active filter becomes inactive
     * @param {Ext.grid.filters.filter.Filter} this
     */

    /**
     * @event update
     * Fires when a filter configuration has changed
     * @param {Ext.grid.filters.filter.Filter} this The filter object.
     */

    /**
     * Initializes the filter given its configuration.
     * @param {Object} config
     */
    constructor: function (config) {
        var me = this;

        me.initConfig(config);
        me.task = new Ext.util.DelayedTask(me.setValue, me);
    },

    /**
     * Destroys this filter by purging any event listeners, and removing any menus.
     */
    destroy: function() {
        this.grid = this.menu = Ext.destroy(this.menu);
    },

    addStoreFilter: function (filter) {
        this.getGridStore().getFilters().add(filter);
    },

    createFilter: function (config, key) {
        return new Ext.util.Filter(this.getFilterConfig(config, key));
    },

    // Note that some derived classes may need to do specific processing and will have its own version of this method
    // beforing calling parent (see the List filter).
    getFilterConfig: function(config, key) {
        config.id = this.getBaseIdPrefix();

        if (!config.property) {
            config.property = this.column.dataIndex;
        }

        if (!config.root) {
            config.root = this.defaultRoot;
        }

        if (key) {
            config.id += '-' + key;
        }
        return config;
    },

    /**
     * @private
     * Creates the Menu for this filter.
     * @param {Object} config Filter configuration
     * @return {Ext.menu.Menu}
     */
    createMenu: function () {
        this.menu = Ext.widget(this.getMenuConfig());
    },

    getBaseIdPrefix: function () {
        return this.filterIdPrefix + '-' + this.column.dataIndex;
    },

    getMenuConfig: function () {
        return Ext.apply({}, this.getMenuDefaults());
    },

    getGridStore: function() {
        return this.grid.getStore();
    },

    getStoreFilter: function (key) {
        var id = this.getBaseIdPrefix();

        if (key) {
            id += '-' + key;
        }

        return this.getGridStore().getFilters().get(id);
    },

    /**
     * @private
     * Handler method called when there is a significant event on an input item.
     */
    onValueChange: function (field, e) {
        var me = this,
            updateBuffer = me.updateBuffer;

        // If the change came from a form field (not a menu CheckItem)...
        if (field.isFormField && e.getKey() === e.RETURN && field.isValid()) {
            me.menu.hide();
            return;
        }

        if (updateBuffer) {
            me.task.delay(updateBuffer, null, null, [me.getValue(field)]);
        } else {
            me.setValue(me.getValue(field));
        }
    },

    /**
     * @private
     * @method preprocess
     * Template method to be implemented by all subclasses that need to perform
     * any operations before the column filter has finished construction.
     * @template
     */
    preprocess: Ext.emptyFn,

    removeStoreFilter: function (filter) {
        this.getGridStore().getFilters().remove(filter);
    },

    /**
     * @private
     * @method getValue
     * Template method to be implemented by all subclasses that is to
     * get and return the value of the filter.
     * @return {Object} The 'serialized' form of this filter
     * @template
     */
    getValue: Ext.emptyFn,

    /**
     * @private
     * @method setValue
     * Template method to be implemented by all subclasses that is to
     * set the value of the filter and fire the 'update' event.
     * @param {Object} data The value to set the filter
     * @template
     */

    /**
     * @method
     * Template method to be implemented by all subclasses that is to
     * return true if the filter has enough configuration information to be activated.
     * Defaults to always returning true.
     * @return {Boolean}
     */

    /**
     * Sets the status of the filter and fires the appropriate events.
     * @param {Boolean} active The new filter state.
     * @param {String} key The filter key for columns that support multiple filters.
     */
    setActive: function (active) {
        var me = this,
            menuItem = me.owner.activeFilterMenuItem,
            filterCollection;

        if (me.active !== active) {
            me.active = active;

            filterCollection = me.getGridStore().getFilters();
            filterCollection.beginUpdate();

            if (active) {
                me.activate();
            } else {
                me.deactivate();
            }

            filterCollection.endUpdate();

            // Make sure we update the 'Filters' menu item.
            if (menuItem && menuItem.activeFilter === me) {
                menuItem.setChecked(active);
            }

            me.setColumnActive(active)
            // TODO: fire activate/deactivate
        }
    },

    setColumnActive: function(active) {
        this.column[active ? 'addCls' : 'removeCls'](this.owner.filterCls);
    },

    showMenu: function (menuItem) {
        if (!this.menu) {
            this.createMenu();
        }

        menuItem.activeFilter = this;

        menuItem.setMenu(this.menu, false);
        menuItem.setChecked(this.active);
        // Disable the menu if filter.disabled explicitly set to true.
        menuItem.setDisabled(this.disabled === true);

        if (this.active) {
            this.activate(/*showingMenu*/ true);
        }
    },

    updateStoreFilter: function (filter) {
        this.getGridStore().getFilters().notify('endupdate');
    }
});