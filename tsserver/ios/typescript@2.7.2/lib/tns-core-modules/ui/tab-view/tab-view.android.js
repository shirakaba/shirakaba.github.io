function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var font_1 = require("../styling/font");
var tab_view_common_1 = require("./tab-view-common");
var text_base_1 = require("../text-base");
var image_source_1 = require("../../image-source");
var utils_1 = require("../../utils/utils");
var frame_1 = require("../frame");
__export(require("./tab-view-common"));
var ACCENT_COLOR = "colorAccent";
var PRIMARY_COLOR = "colorPrimary";
var DEFAULT_ELEVATION = 4;
var TABID = "_tabId";
var INDEX = "_index";
var PagerAdapter;
function makeFragmentName(viewId, id) {
    return "android:viewpager:" + viewId + ":" + id;
}
function getTabById(id) {
    var ref = exports.tabs.find(function (ref) {
        var tab = ref.get();
        return tab && tab._domId === id;
    });
    return ref && ref.get();
}
function initializeNativeClasses() {
    if (PagerAdapter) {
        return;
    }
    var TabFragmentImplementation = (function (_super) {
        __extends(TabFragmentImplementation, _super);
        function TabFragmentImplementation() {
            var _this = _super.call(this) || this;
            return global.__native(_this);
        }
        TabFragmentImplementation.newInstance = function (tabId, index) {
            var args = new android.os.Bundle();
            args.putInt(TABID, tabId);
            args.putInt(INDEX, index);
            var fragment = new TabFragmentImplementation();
            fragment.setArguments(args);
            return fragment;
        };
        TabFragmentImplementation.prototype.onCreate = function (savedInstanceState) {
            _super.prototype.onCreate.call(this, savedInstanceState);
            var args = this.getArguments();
            this.tab = getTabById(args.getInt(TABID));
            this.index = args.getInt(INDEX);
            if (!this.tab) {
                throw new Error("Cannot find TabView");
            }
        };
        TabFragmentImplementation.prototype.onCreateView = function (inflater, container, savedInstanceState) {
            var tabItem = this.tab.items[this.index];
            return tabItem.view.nativeViewProtected;
        };
        TabFragmentImplementation.prototype.onDestroyView = function () {
            _super.prototype.onDestroyView.call(this);
        };
        return TabFragmentImplementation;
    }(android.support.v4.app.Fragment));
    var POSITION_UNCHANGED = -1;
    var POSITION_NONE = -2;
    var FragmentPagerAdapter = (function (_super) {
        __extends(FragmentPagerAdapter, _super);
        function FragmentPagerAdapter(owner) {
            var _this = _super.call(this) || this;
            _this.owner = owner;
            return global.__native(_this);
        }
        FragmentPagerAdapter.prototype.getCount = function () {
            var items = this.items;
            return items ? items.length : 0;
        };
        FragmentPagerAdapter.prototype.getPageTitle = function (index) {
            var items = this.items;
            if (index < 0 || index >= items.length) {
                return "";
            }
            return items[index].title;
        };
        FragmentPagerAdapter.prototype.startUpdate = function (container) {
            if (container.getId() === android.view.View.NO_ID) {
                throw new Error("ViewPager with adapter " + this + " requires a view containerId");
            }
        };
        FragmentPagerAdapter.prototype.instantiateItem = function (container, position) {
            var fragmentManager = this.owner._getFragmentManager();
            if (!this.mCurTransaction) {
                this.mCurTransaction = fragmentManager.beginTransaction();
            }
            var itemId = this.getItemId(position);
            var name = makeFragmentName(container.getId(), itemId);
            var fragment = fragmentManager.findFragmentByTag(name);
            if (fragment != null) {
                this.mCurTransaction.attach(fragment);
            }
            else {
                fragment = TabFragmentImplementation.newInstance(this.owner._domId, position);
                this.mCurTransaction.add(container.getId(), fragment, name);
            }
            if (fragment !== this.mCurrentPrimaryItem) {
                fragment.setMenuVisibility(false);
                fragment.setUserVisibleHint(false);
            }
            var tabItems = this.owner.items;
            var tabItem = tabItems ? tabItems[position] : null;
            if (tabItem) {
                tabItem.canBeLoaded = true;
            }
            return fragment;
        };
        FragmentPagerAdapter.prototype.getItemPosition = function (object) {
            return this.items ? POSITION_UNCHANGED : POSITION_NONE;
        };
        FragmentPagerAdapter.prototype.destroyItem = function (container, position, object) {
            if (!this.mCurTransaction) {
                var fragmentManager = this.owner._getFragmentManager();
                this.mCurTransaction = fragmentManager.beginTransaction();
            }
            var fragment = object;
            this.mCurTransaction.detach(fragment);
            if (this.mCurrentPrimaryItem === fragment) {
                this.mCurrentPrimaryItem = null;
            }
            var tabItems = this.owner.items;
            var tabItem = tabItems ? tabItems[position] : null;
            if (tabItem) {
                tabItem.canBeLoaded = false;
            }
        };
        FragmentPagerAdapter.prototype.setPrimaryItem = function (container, position, object) {
            var fragment = object;
            if (fragment !== this.mCurrentPrimaryItem) {
                if (this.mCurrentPrimaryItem != null) {
                    this.mCurrentPrimaryItem.setMenuVisibility(false);
                    this.mCurrentPrimaryItem.setUserVisibleHint(false);
                }
                if (fragment != null) {
                    fragment.setMenuVisibility(true);
                    fragment.setUserVisibleHint(true);
                }
                this.mCurrentPrimaryItem = fragment;
                this.owner.selectedIndex = position;
                var tab = this.owner;
                var tabItems = tab.items;
                var newTabItem = tabItems ? tabItems[position] : null;
                if (newTabItem) {
                    tab._loadUnloadTabItems(tab.selectedIndex);
                }
            }
        };
        FragmentPagerAdapter.prototype.finishUpdate = function (container) {
            if (this.mCurTransaction != null) {
                this.mCurTransaction.commitNowAllowingStateLoss();
                this.mCurTransaction = null;
            }
        };
        FragmentPagerAdapter.prototype.isViewFromObject = function (view, object) {
            return object.getView() === view;
        };
        FragmentPagerAdapter.prototype.saveState = function () {
            return null;
        };
        FragmentPagerAdapter.prototype.restoreState = function (state, loader) {
        };
        FragmentPagerAdapter.prototype.getItemId = function (position) {
            return position;
        };
        return FragmentPagerAdapter;
    }(android.support.v4.view.PagerAdapter));
    PagerAdapter = FragmentPagerAdapter;
}
function createTabItemSpec(item) {
    var result = new org.nativescript.widgets.TabItemSpec();
    result.title = item.title;
    if (item.iconSource) {
        if (item.iconSource.indexOf(utils_1.RESOURCE_PREFIX) === 0) {
            result.iconId = utils_1.ad.resources.getDrawableId(item.iconSource.substr(utils_1.RESOURCE_PREFIX.length));
            if (result.iconId === 0) {
                tab_view_common_1.traceMissingIcon(item.iconSource);
            }
        }
        else {
            var is = image_source_1.fromFileOrResource(item.iconSource);
            if (is) {
                result.iconDrawable = new android.graphics.drawable.BitmapDrawable(is.android);
            }
            else {
                tab_view_common_1.traceMissingIcon(item.iconSource);
            }
        }
    }
    return result;
}
var defaultAccentColor = undefined;
function getDefaultAccentColor(context) {
    if (defaultAccentColor === undefined) {
        defaultAccentColor = utils_1.ad.resources.getPaletteColor(ACCENT_COLOR, context) || 0xFF33B5E5;
    }
    return defaultAccentColor;
}
var TabViewItem = (function (_super) {
    __extends(TabViewItem, _super);
    function TabViewItem() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(TabViewItem.prototype, "_hasFragments", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    TabViewItem.prototype.initNativeView = function () {
        _super.prototype.initNativeView.call(this);
        if (this.nativeViewProtected) {
            this._defaultTransformationMethod = this.nativeViewProtected.getTransformationMethod();
        }
    };
    TabViewItem.prototype.onLoaded = function () {
        _super.prototype.onLoaded.call(this);
    };
    TabViewItem.prototype.resetNativeView = function () {
        _super.prototype.resetNativeView.call(this);
        if (this.nativeViewProtected) {
            this.nativeViewProtected.setTransformationMethod(this._defaultTransformationMethod);
        }
    };
    TabViewItem.prototype.disposeNativeView = function () {
        _super.prototype.disposeNativeView.call(this);
        this.canBeLoaded = false;
    };
    TabViewItem.prototype.createNativeView = function () {
        return this.nativeViewProtected;
    };
    TabViewItem.prototype._update = function () {
        var tv = this.nativeViewProtected;
        var tabView = this.parent;
        if (tv && tabView) {
            this.tabItemSpec = createTabItemSpec(this);
            tabView.updateAndroidItemAt(this.index, this.tabItemSpec);
        }
    };
    TabViewItem.prototype._getChildFragmentManager = function () {
        var tabView = this.parent;
        var tabFragment = null;
        var fragmentManager = tabView._getFragmentManager();
        for (var _i = 0, _a = fragmentManager.getFragments().toArray(); _i < _a.length; _i++) {
            var fragment = _a[_i];
            if (fragment.index === this.index) {
                tabFragment = fragment;
                break;
            }
        }
        if (!tabFragment) {
            if (tab_view_common_1.traceEnabled()) {
                tab_view_common_1.traceWrite("Could not get child fragment manager for tab item with index " + this.index, tab_view_common_1.traceCategory);
            }
            return tabView._getRootFragmentManager();
        }
        return tabFragment.getChildFragmentManager();
    };
    TabViewItem.prototype[tab_view_common_1.fontSizeProperty.getDefault] = function () {
        return { nativeSize: this.nativeViewProtected.getTextSize() };
    };
    TabViewItem.prototype[tab_view_common_1.fontSizeProperty.setNative] = function (value) {
        if (typeof value === "number") {
            this.nativeViewProtected.setTextSize(value);
        }
        else {
            this.nativeViewProtected.setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, value.nativeSize);
        }
    };
    TabViewItem.prototype[tab_view_common_1.fontInternalProperty.getDefault] = function () {
        return this.nativeViewProtected.getTypeface();
    };
    TabViewItem.prototype[tab_view_common_1.fontInternalProperty.setNative] = function (value) {
        this.nativeViewProtected.setTypeface(value instanceof font_1.Font ? value.getAndroidTypeface() : value);
    };
    TabViewItem.prototype[text_base_1.textTransformProperty.getDefault] = function () {
        return "default";
    };
    TabViewItem.prototype[text_base_1.textTransformProperty.setNative] = function (value) {
        var tv = this.nativeViewProtected;
        if (value === "default") {
            tv.setTransformationMethod(this._defaultTransformationMethod);
            tv.setText(this.title);
        }
        else {
            var result = text_base_1.getTransformedText(this.title, value);
            tv.setText(result);
            tv.setTransformationMethod(null);
        }
    };
    return TabViewItem;
}(tab_view_common_1.TabViewItemBase));
exports.TabViewItem = TabViewItem;
function setElevation(grid, tabLayout) {
    var compat = android.support.v4.view.ViewCompat;
    if (compat.setElevation) {
        var val = DEFAULT_ELEVATION * tab_view_common_1.layout.getDisplayDensity();
        compat.setElevation(grid, val);
        compat.setElevation(tabLayout, val);
    }
}
exports.tabs = new Array();
function iterateIndexRange(index, eps, lastIndex, callback) {
    var rangeStart = Math.max(0, index - eps);
    var rangeEnd = Math.min(index + eps, lastIndex);
    for (var i = rangeStart; i <= rangeEnd; i++) {
        callback(i);
    }
}
var TabView = (function (_super) {
    __extends(TabView, _super);
    function TabView() {
        var _this = _super.call(this) || this;
        _this._androidViewId = -1;
        exports.tabs.push(new WeakRef(_this));
        return _this;
    }
    Object.defineProperty(TabView.prototype, "_hasFragments", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    TabView.prototype.onItemsChanged = function (oldItems, newItems) {
        _super.prototype.onItemsChanged.call(this, oldItems, newItems);
        if (oldItems) {
            oldItems.forEach(function (item, i, arr) {
                item.index = 0;
                item.tabItemSpec = null;
                item.setNativeView(null);
            });
        }
    };
    TabView.prototype.createNativeView = function () {
        initializeNativeClasses();
        if (tab_view_common_1.traceEnabled()) {
            tab_view_common_1.traceWrite("TabView._createUI(" + this + ");", tab_view_common_1.traceCategory);
        }
        var context = this._context;
        var nativeView = new org.nativescript.widgets.GridLayout(context);
        var viewPager = new org.nativescript.widgets.TabViewPager(context);
        var tabLayout = new org.nativescript.widgets.TabLayout(context);
        var lp = new org.nativescript.widgets.CommonLayoutParams();
        var primaryColor = utils_1.ad.resources.getPaletteColor(PRIMARY_COLOR, context);
        var accentColor = getDefaultAccentColor(context);
        lp.row = 1;
        if (this.androidTabsPosition === "top") {
            nativeView.addRow(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.auto));
            nativeView.addRow(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.star));
            viewPager.setLayoutParams(lp);
        }
        else {
            nativeView.addRow(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.star));
            nativeView.addRow(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.auto));
            tabLayout.setLayoutParams(lp);
            viewPager.setSwipePageEnabled(false);
            accentColor = 0x00FFFFFF;
        }
        nativeView.addView(viewPager);
        nativeView.viewPager = viewPager;
        var adapter = new PagerAdapter(this);
        viewPager.setAdapter(adapter);
        viewPager.adapter = adapter;
        nativeView.addView(tabLayout);
        nativeView.tabLayout = tabLayout;
        setElevation(nativeView, tabLayout);
        if (accentColor) {
            tabLayout.setSelectedIndicatorColors([accentColor]);
        }
        if (primaryColor) {
            tabLayout.setBackgroundColor(primaryColor);
        }
        return nativeView;
    };
    TabView.prototype.initNativeView = function () {
        _super.prototype.initNativeView.call(this);
        if (this._androidViewId < 0) {
            this._androidViewId = android.view.View.generateViewId();
        }
        var nativeView = this.nativeViewProtected;
        this._tabLayout = nativeView.tabLayout;
        var viewPager = nativeView.viewPager;
        viewPager.setId(this._androidViewId);
        this._viewPager = viewPager;
        this._pagerAdapter = viewPager.adapter;
        this._pagerAdapter.owner = this;
    };
    TabView.prototype._loadUnloadTabItems = function (newIndex) {
        var _this = this;
        var items = this.items;
        var lastIndex = this.items.length - 1;
        var offsideItems = this.androidTabsPosition === "top" ? this.androidOffscreenTabLimit : 1;
        var toUnload = [];
        var toLoad = [];
        iterateIndexRange(newIndex, offsideItems, lastIndex, function (i) { return toLoad.push(i); });
        items.forEach(function (item, i) {
            var indexOfI = toLoad.indexOf(i);
            if (indexOfI < 0) {
                toUnload.push(i);
            }
        });
        toUnload.forEach(function (index) {
            var item = items[index];
            if (items[index]) {
                item.unloadView(item.view);
            }
        });
        var newItem = items[newIndex];
        var selectedView = newItem && newItem.view;
        if (selectedView instanceof frame_1.Frame) {
            selectedView._pushInFrameStack();
        }
        toLoad.forEach(function (index) {
            var item = items[index];
            if (_this.isLoaded && items[index]) {
                item.loadView(item.view);
            }
        });
    };
    TabView.prototype.onLoaded = function () {
        _super.prototype.onLoaded.call(this);
        this.setAdapterItems(this.items);
    };
    TabView.prototype.onUnloaded = function () {
        _super.prototype.onUnloaded.call(this);
        this.setAdapterItems(null);
    };
    TabView.prototype.disposeNativeView = function () {
        this._tabLayout.setItems(null, null);
        this._pagerAdapter.owner = null;
        this._pagerAdapter = null;
        this._tabLayout = null;
        this._viewPager = null;
        _super.prototype.disposeNativeView.call(this);
    };
    TabView.prototype.onBackPressed = function () {
        var currentView = this._selectedView;
        if (currentView) {
            return currentView.onBackPressed();
        }
        return false;
    };
    TabView.prototype._onRootViewReset = function () {
        this.disposeCurrentFragments();
        _super.prototype._onRootViewReset.call(this);
    };
    TabView.prototype.disposeCurrentFragments = function () {
        var fragmentManager = this._getFragmentManager();
        var transaction = fragmentManager.beginTransaction();
        for (var _i = 0, _a = fragmentManager.getFragments().toArray(); _i < _a.length; _i++) {
            var fragment = _a[_i];
            transaction.remove(fragment);
        }
        transaction.commitNowAllowingStateLoss();
    };
    TabView.prototype.shouldUpdateAdapter = function (items) {
        if (!this._pagerAdapter) {
            return false;
        }
        var currentPagerAdapterItems = this._pagerAdapter.items;
        if (!items && !currentPagerAdapterItems) {
            return false;
        }
        if (!items || !currentPagerAdapterItems) {
            return true;
        }
        if (items.length !== currentPagerAdapterItems.length) {
            return true;
        }
        var matchingItems = currentPagerAdapterItems.filter(function (currentItem) {
            return !!items.filter(function (item) {
                return item._domId === currentItem._domId;
            })[0];
        });
        if (matchingItems.length !== items.length) {
            return true;
        }
        return false;
    };
    TabView.prototype.setAdapterItems = function (items) {
        if (this.shouldUpdateAdapter(items)) {
            this._pagerAdapter.items = items;
            var length_1 = items ? items.length : 0;
            if (length_1 === 0) {
                this._tabLayout.setItems(null, null);
                this._pagerAdapter.notifyDataSetChanged();
                return;
            }
            var tabItems_1 = new Array();
            items.forEach(function (item, i, arr) {
                var tabItemSpec = createTabItemSpec(item);
                item.index = i;
                item.tabItemSpec = tabItemSpec;
                tabItems_1.push(tabItemSpec);
            });
            var tabLayout_1 = this._tabLayout;
            tabLayout_1.setItems(tabItems_1, this._viewPager);
            items.forEach(function (item, i, arr) {
                var tv = tabLayout_1.getTextViewForItemAt(i);
                item.setNativeView(tv);
            });
            this._pagerAdapter.notifyDataSetChanged();
        }
    };
    TabView.prototype.updateAndroidItemAt = function (index, spec) {
        this._tabLayout.updateItemAt(index, spec);
    };
    TabView.prototype[tab_view_common_1.androidOffscreenTabLimitProperty.getDefault] = function () {
        return this._viewPager.getOffscreenPageLimit();
    };
    TabView.prototype[tab_view_common_1.androidOffscreenTabLimitProperty.setNative] = function (value) {
        this._viewPager.setOffscreenPageLimit(value);
    };
    TabView.prototype[tab_view_common_1.selectedIndexProperty.setNative] = function (value) {
        if (tab_view_common_1.traceEnabled()) {
            tab_view_common_1.traceWrite("TabView this._viewPager.setCurrentItem(" + value + ", true);", tab_view_common_1.traceCategory);
        }
        this._viewPager.setCurrentItem(value, true);
    };
    TabView.prototype[tab_view_common_1.itemsProperty.getDefault] = function () {
        return null;
    };
    TabView.prototype[tab_view_common_1.itemsProperty.setNative] = function (value) {
        this.setAdapterItems(value);
        tab_view_common_1.selectedIndexProperty.coerce(this);
    };
    TabView.prototype[tab_view_common_1.tabBackgroundColorProperty.getDefault] = function () {
        return this._tabLayout.getBackground();
    };
    TabView.prototype[tab_view_common_1.tabBackgroundColorProperty.setNative] = function (value) {
        if (value instanceof tab_view_common_1.Color) {
            this._tabLayout.setBackgroundColor(value.android);
        }
        else {
            this._tabLayout.setBackground(tryCloneDrawable(value, this.nativeViewProtected.getResources));
        }
    };
    TabView.prototype[tab_view_common_1.tabTextFontSizeProperty.getDefault] = function () {
        return this._tabLayout.getTabTextFontSize();
    };
    TabView.prototype[tab_view_common_1.tabTextFontSizeProperty.setNative] = function (value) {
        if (typeof value === "number") {
            this._tabLayout.setTabTextFontSize(value);
        }
        else {
            this._tabLayout.setTabTextFontSize(value.nativeSize);
        }
    };
    TabView.prototype[tab_view_common_1.tabTextColorProperty.getDefault] = function () {
        return this._tabLayout.getTabTextColor();
    };
    TabView.prototype[tab_view_common_1.tabTextColorProperty.setNative] = function (value) {
        var color = value instanceof tab_view_common_1.Color ? value.android : value;
        this._tabLayout.setTabTextColor(color);
    };
    TabView.prototype[tab_view_common_1.selectedTabTextColorProperty.getDefault] = function () {
        return this._tabLayout.getSelectedTabTextColor();
    };
    TabView.prototype[tab_view_common_1.selectedTabTextColorProperty.setNative] = function (value) {
        var color = value instanceof tab_view_common_1.Color ? value.android : value;
        this._tabLayout.setSelectedTabTextColor(color);
    };
    TabView.prototype[tab_view_common_1.androidSelectedTabHighlightColorProperty.getDefault] = function () {
        return getDefaultAccentColor(this._context);
    };
    TabView.prototype[tab_view_common_1.androidSelectedTabHighlightColorProperty.setNative] = function (value) {
        var tabLayout = this._tabLayout;
        var color = value instanceof tab_view_common_1.Color ? value.android : value;
        tabLayout.setSelectedIndicatorColors([color]);
    };
    return TabView;
}(tab_view_common_1.TabViewBase));
exports.TabView = TabView;
function tryCloneDrawable(value, resources) {
    if (value) {
        var constantState = value.getConstantState();
        if (constantState) {
            return constantState.newDrawable(resources);
        }
    }
    return value;
}
//# sourceMappingURL=tab-view.android.js.map