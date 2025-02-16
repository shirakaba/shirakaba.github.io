function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var view_1 = require("../core/view");
var tab_view_common_1 = require("./tab-view-common");
var text_base_1 = require("../text-base");
var image_source_1 = require("../../image-source");
var profiling_1 = require("../../profiling");
var frame_1 = require("../frame");
var utils_1 = require("../../utils/utils");
var platform_1 = require("../../platform");
__export(require("./tab-view-common"));
var majorVersion = utils_1.ios.MajorVersion;
var isPhone = platform_1.device.deviceType === "Phone";
var UITabBarControllerImpl = (function (_super) {
    __extends(UITabBarControllerImpl, _super);
    function UITabBarControllerImpl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    UITabBarControllerImpl.initWithOwner = function (owner) {
        var handler = UITabBarControllerImpl.new();
        handler._owner = owner;
        return handler;
    };
    UITabBarControllerImpl.prototype.viewWillAppear = function (animated) {
        _super.prototype.viewWillAppear.call(this, animated);
        var owner = this._owner.get();
        if (!owner) {
            return;
        }
        view_1.ios.updateAutoAdjustScrollInsets(this, owner);
        if (!owner.parent) {
            owner.callLoaded();
        }
    };
    UITabBarControllerImpl.prototype.viewDidDisappear = function (animated) {
        _super.prototype.viewDidDisappear.call(this, animated);
        var owner = this._owner.get();
        if (owner && !owner.parent && owner.isLoaded && !this.presentedViewController) {
            owner.callUnloaded();
        }
    };
    UITabBarControllerImpl.prototype.viewWillTransitionToSizeWithTransitionCoordinator = function (size, coordinator) {
        var _this = this;
        _super.prototype.viewWillTransitionToSizeWithTransitionCoordinator.call(this, size, coordinator);
        UIViewControllerTransitionCoordinator.prototype.animateAlongsideTransitionCompletion
            .call(coordinator, null, function () {
            var owner = _this._owner.get();
            if (owner && owner.items) {
                owner.items.forEach(function (tabItem) { return tabItem._updateTitleAndIconPositions(); });
            }
        });
    };
    __decorate([
        profiling_1.profile
    ], UITabBarControllerImpl.prototype, "viewWillAppear", null);
    __decorate([
        profiling_1.profile
    ], UITabBarControllerImpl.prototype, "viewDidDisappear", null);
    return UITabBarControllerImpl;
}(UITabBarController));
var UITabBarControllerDelegateImpl = (function (_super) {
    __extends(UITabBarControllerDelegateImpl, _super);
    function UITabBarControllerDelegateImpl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    UITabBarControllerDelegateImpl.initWithOwner = function (owner) {
        var delegate = UITabBarControllerDelegateImpl.new();
        delegate._owner = owner;
        return delegate;
    };
    UITabBarControllerDelegateImpl.prototype.tabBarControllerShouldSelectViewController = function (tabBarController, viewController) {
        if (tab_view_common_1.traceEnabled()) {
            tab_view_common_1.traceWrite("TabView.delegate.SHOULD_select(" + tabBarController + ", " + viewController + ");", tab_view_common_1.traceCategories.Debug);
        }
        var owner = this._owner.get();
        if (owner) {
            var backToMoreWillBeVisible = false;
            owner._handleTwoNavigationBars(backToMoreWillBeVisible);
        }
        tabBarController._willSelectViewController = viewController;
        return true;
    };
    UITabBarControllerDelegateImpl.prototype.tabBarControllerDidSelectViewController = function (tabBarController, viewController) {
        if (tab_view_common_1.traceEnabled()) {
            tab_view_common_1.traceWrite("TabView.delegate.DID_select(" + tabBarController + ", " + viewController + ");", tab_view_common_1.traceCategories.Debug);
        }
        var owner = this._owner.get();
        if (owner) {
            owner._onViewControllerShown(viewController);
        }
        tabBarController._willSelectViewController = undefined;
    };
    UITabBarControllerDelegateImpl.ObjCProtocols = [UITabBarControllerDelegate];
    return UITabBarControllerDelegateImpl;
}(NSObject));
var UINavigationControllerDelegateImpl = (function (_super) {
    __extends(UINavigationControllerDelegateImpl, _super);
    function UINavigationControllerDelegateImpl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    UINavigationControllerDelegateImpl.initWithOwner = function (owner) {
        var delegate = UINavigationControllerDelegateImpl.new();
        delegate._owner = owner;
        return delegate;
    };
    UINavigationControllerDelegateImpl.prototype.navigationControllerWillShowViewControllerAnimated = function (navigationController, viewController, animated) {
        if (tab_view_common_1.traceEnabled()) {
            tab_view_common_1.traceWrite("TabView.moreNavigationController.WILL_show(" + navigationController + ", " + viewController + ", " + animated + ");", tab_view_common_1.traceCategories.Debug);
        }
        var owner = this._owner.get();
        if (owner) {
            var backToMoreWillBeVisible = owner._ios.viewControllers.containsObject(viewController);
            owner._handleTwoNavigationBars(backToMoreWillBeVisible);
        }
    };
    UINavigationControllerDelegateImpl.prototype.navigationControllerDidShowViewControllerAnimated = function (navigationController, viewController, animated) {
        if (tab_view_common_1.traceEnabled()) {
            tab_view_common_1.traceWrite("TabView.moreNavigationController.DID_show(" + navigationController + ", " + viewController + ", " + animated + ");", tab_view_common_1.traceCategories.Debug);
        }
        navigationController.navigationBar.topItem.rightBarButtonItem = null;
        var owner = this._owner.get();
        if (owner) {
            owner._onViewControllerShown(viewController);
        }
    };
    UINavigationControllerDelegateImpl.ObjCProtocols = [UINavigationControllerDelegate];
    return UINavigationControllerDelegateImpl;
}(NSObject));
function updateTitleAndIconPositions(tabItem, tabBarItem, controller) {
    if (!tabItem || !tabBarItem) {
        return;
    }
    var orientation = controller.interfaceOrientation;
    var isPortrait = orientation !== 4 && orientation !== 3;
    var isIconAboveTitle = (majorVersion < 11) || (isPhone && isPortrait);
    if (!tabItem.iconSource) {
        if (isIconAboveTitle) {
            tabBarItem.titlePositionAdjustment = { horizontal: 0, vertical: -20 };
        }
        else {
            tabBarItem.titlePositionAdjustment = { horizontal: 0, vertical: 0 };
        }
    }
    if (!tabItem.title) {
        if (isIconAboveTitle) {
            tabBarItem.imageInsets = new UIEdgeInsets({ top: 6, left: 0, bottom: -6, right: 0 });
        }
        else {
            tabBarItem.imageInsets = new UIEdgeInsets({ top: 0, left: 0, bottom: 0, right: 0 });
        }
    }
}
var TabViewItem = (function (_super) {
    __extends(TabViewItem, _super);
    function TabViewItem() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TabViewItem.prototype.setViewController = function (controller, nativeView) {
        this.__controller = controller;
        this.setNativeView(nativeView);
    };
    TabViewItem.prototype.disposeNativeView = function () {
        this.__controller = undefined;
        this.setNativeView(undefined);
    };
    TabViewItem.prototype.loadView = function (view) {
        var tabView = this.parent;
        if (tabView && tabView.items) {
            var index_1 = tabView.items.indexOf(this);
            if (index_1 === tabView.selectedIndex) {
                _super.prototype.loadView.call(this, view);
            }
        }
    };
    TabViewItem.prototype._update = function () {
        var parent = this.parent;
        var controller = this.__controller;
        if (parent && controller) {
            var icon = parent._getIcon(this.iconSource);
            var index_2 = parent.items.indexOf(this);
            var title = text_base_1.getTransformedText(this.title, this.style.textTransform);
            var tabBarItem = UITabBarItem.alloc().initWithTitleImageTag(title, icon, index_2);
            updateTitleAndIconPositions(this, tabBarItem, controller);
            var states = getTitleAttributesForStates(parent);
            applyStatesToItem(tabBarItem, states);
            controller.tabBarItem = tabBarItem;
        }
    };
    TabViewItem.prototype._updateTitleAndIconPositions = function () {
        if (!this.__controller || !this.__controller.tabBarItem) {
            return;
        }
        updateTitleAndIconPositions(this, this.__controller.tabBarItem, this.__controller);
    };
    TabViewItem.prototype[text_base_1.textTransformProperty.setNative] = function (value) {
        this._update();
    };
    return TabViewItem;
}(tab_view_common_1.TabViewItemBase));
exports.TabViewItem = TabViewItem;
var TabView = (function (_super) {
    __extends(TabView, _super);
    function TabView() {
        var _this = _super.call(this) || this;
        _this._iconsCache = {};
        _this.viewController = _this._ios = UITabBarControllerImpl.initWithOwner(new WeakRef(_this));
        _this.nativeViewProtected = _this._ios.view;
        return _this;
    }
    TabView.prototype.initNativeView = function () {
        _super.prototype.initNativeView.call(this);
        this._delegate = UITabBarControllerDelegateImpl.initWithOwner(new WeakRef(this));
        this._moreNavigationControllerDelegate = UINavigationControllerDelegateImpl.initWithOwner(new WeakRef(this));
    };
    TabView.prototype.disposeNativeView = function () {
        this._delegate = null;
        this._moreNavigationControllerDelegate = null;
        _super.prototype.disposeNativeView.call(this);
    };
    TabView.prototype.onLoaded = function () {
        _super.prototype.onLoaded.call(this);
        var selectedIndex = this.selectedIndex;
        var selectedView = this.items && this.items[selectedIndex] && this.items[selectedIndex].view;
        if (selectedView instanceof frame_1.Frame) {
            selectedView._pushInFrameStack();
        }
        this._ios.delegate = this._delegate;
    };
    TabView.prototype.onUnloaded = function () {
        this._ios.delegate = null;
        this._ios.moreNavigationController.delegate = null;
        _super.prototype.onUnloaded.call(this);
    };
    Object.defineProperty(TabView.prototype, "ios", {
        get: function () {
            return this._ios;
        },
        enumerable: true,
        configurable: true
    });
    TabView.prototype.layoutNativeView = function (left, top, right, bottom) {
    };
    TabView.prototype._setNativeViewFrame = function (nativeView, frame) {
    };
    TabView.prototype.onSelectedIndexChanged = function (oldIndex, newIndex) {
        var items = this.items;
        if (!items) {
            return;
        }
        var oldItem = items[oldIndex];
        if (oldItem) {
            oldItem.unloadView(oldItem.view);
        }
        var newItem = items[newIndex];
        if (newItem && this.isLoaded) {
            var selectedView = items[newIndex].view;
            if (selectedView instanceof frame_1.Frame) {
                selectedView._pushInFrameStack();
            }
            newItem.loadView(newItem.view);
        }
        _super.prototype.onSelectedIndexChanged.call(this, oldIndex, newIndex);
    };
    TabView.prototype.onMeasure = function (widthMeasureSpec, heightMeasureSpec) {
        var width = tab_view_common_1.layout.getMeasureSpecSize(widthMeasureSpec);
        var widthMode = tab_view_common_1.layout.getMeasureSpecMode(widthMeasureSpec);
        var height = tab_view_common_1.layout.getMeasureSpecSize(heightMeasureSpec);
        var heightMode = tab_view_common_1.layout.getMeasureSpecMode(heightMeasureSpec);
        var widthAndState = tab_view_common_1.View.resolveSizeAndState(width, width, widthMode, 0);
        var heightAndState = tab_view_common_1.View.resolveSizeAndState(height, height, heightMode, 0);
        this.setMeasuredDimension(widthAndState, heightAndState);
    };
    TabView.prototype._onViewControllerShown = function (viewController) {
        if (tab_view_common_1.traceEnabled()) {
            tab_view_common_1.traceWrite("TabView._onViewControllerShown(" + viewController + ");", tab_view_common_1.traceCategories.Debug);
        }
        if (this._ios.viewControllers && this._ios.viewControllers.containsObject(viewController)) {
            this.selectedIndex = this._ios.viewControllers.indexOfObject(viewController);
        }
        else {
            if (tab_view_common_1.traceEnabled()) {
                tab_view_common_1.traceWrite("TabView._onViewControllerShown: viewController is not one of our viewControllers", tab_view_common_1.traceCategories.Debug);
            }
        }
    };
    TabView.prototype._handleTwoNavigationBars = function (backToMoreWillBeVisible) {
        if (tab_view_common_1.traceEnabled()) {
            tab_view_common_1.traceWrite("TabView._handleTwoNavigationBars(backToMoreWillBeVisible: " + backToMoreWillBeVisible + ")", tab_view_common_1.traceCategories.Debug);
        }
        var page = this.page || this._selectedView.page || this._selectedView.currentPage;
        if (!page || !page.frame) {
            return;
        }
        var actionBarVisible = page.frame._getNavBarVisible(page);
        if (backToMoreWillBeVisible && actionBarVisible) {
            page.frame.ios._disableNavBarAnimation = true;
            page.actionBarHidden = true;
            page.frame.ios._disableNavBarAnimation = false;
            this._actionBarHiddenByTabView = true;
            if (tab_view_common_1.traceEnabled()) {
                tab_view_common_1.traceWrite("TabView hid action bar", tab_view_common_1.traceCategories.Debug);
            }
            return;
        }
        if (!backToMoreWillBeVisible && this._actionBarHiddenByTabView) {
            page.frame.ios._disableNavBarAnimation = true;
            page.actionBarHidden = false;
            page.frame.ios._disableNavBarAnimation = false;
            this._actionBarHiddenByTabView = undefined;
            if (tab_view_common_1.traceEnabled()) {
                tab_view_common_1.traceWrite("TabView restored action bar", tab_view_common_1.traceCategories.Debug);
            }
            return;
        }
    };
    TabView.prototype.getViewController = function (item) {
        var newController = item.view ? item.view.viewController : null;
        if (newController) {
            item.setViewController(newController, newController.view);
            return newController;
        }
        if (item.view.ios instanceof UIViewController) {
            newController = item.view.ios;
            item.setViewController(newController, newController.view);
        }
        else if (item.view.ios && item.view.ios.controller instanceof UIViewController) {
            newController = item.view.ios.controller;
            item.setViewController(newController, newController.view);
        }
        else {
            newController = view_1.ios.UILayoutViewController.initWithOwner(new WeakRef(item.view));
            newController.view.addSubview(item.view.nativeViewProtected);
            item.view.viewController = newController;
            item.setViewController(newController, item.view.nativeViewProtected);
        }
        return newController;
    };
    TabView.prototype.setViewControllers = function (items) {
        var _this = this;
        var length = items ? items.length : 0;
        if (length === 0) {
            this._ios.viewControllers = null;
            return;
        }
        var controllers = NSMutableArray.alloc().initWithCapacity(length);
        var states = getTitleAttributesForStates(this);
        items.forEach(function (item, i) {
            var controller = _this.getViewController(item);
            var icon = _this._getIcon(item.iconSource);
            var tabBarItem = UITabBarItem.alloc().initWithTitleImageTag((item.title || ""), icon, i);
            updateTitleAndIconPositions(item, tabBarItem, controller);
            applyStatesToItem(tabBarItem, states);
            controller.tabBarItem = tabBarItem;
            controllers.addObject(controller);
            item.canBeLoaded = true;
        });
        this._ios.viewControllers = controllers;
        this._ios.customizableViewControllers = null;
        this._ios.moreNavigationController.delegate = this._moreNavigationControllerDelegate;
    };
    TabView.prototype._getIconRenderingMode = function () {
        switch (this.iosIconRenderingMode) {
            case "alwaysOriginal":
                return 1;
            case "alwaysTemplate":
                return 2;
            case "automatic":
            default:
                return 0;
        }
    };
    TabView.prototype._getIcon = function (iconSource) {
        if (!iconSource) {
            return null;
        }
        var image = this._iconsCache[iconSource];
        if (!image) {
            var is = image_source_1.fromFileOrResource(iconSource);
            if (is && is.ios) {
                var originalRenderedImage = is.ios.imageWithRenderingMode(this._getIconRenderingMode());
                this._iconsCache[iconSource] = originalRenderedImage;
                image = originalRenderedImage;
            }
            else {
                tab_view_common_1.traceMissingIcon(iconSource);
            }
        }
        return image;
    };
    TabView.prototype._updateIOSTabBarColorsAndFonts = function () {
        if (!this.items) {
            return;
        }
        var tabBar = this.ios.tabBar;
        var states = getTitleAttributesForStates(this);
        for (var i = 0; i < tabBar.items.count; i++) {
            applyStatesToItem(tabBar.items[i], states);
        }
    };
    TabView.prototype[tab_view_common_1.selectedIndexProperty.setNative] = function (value) {
        if (tab_view_common_1.traceEnabled()) {
            tab_view_common_1.traceWrite("TabView._onSelectedIndexPropertyChangedSetNativeValue(" + value + ")", tab_view_common_1.traceCategories.Debug);
        }
        if (value > -1) {
            this._ios._willSelectViewController = this._ios.viewControllers[value];
            this._ios.selectedIndex = value;
        }
    };
    TabView.prototype[tab_view_common_1.itemsProperty.getDefault] = function () {
        return null;
    };
    TabView.prototype[tab_view_common_1.itemsProperty.setNative] = function (value) {
        this.setViewControllers(value);
        tab_view_common_1.selectedIndexProperty.coerce(this);
    };
    TabView.prototype[tab_view_common_1.tabTextFontSizeProperty.getDefault] = function () {
        return null;
    };
    TabView.prototype[tab_view_common_1.tabTextFontSizeProperty.setNative] = function (value) {
        this._updateIOSTabBarColorsAndFonts();
    };
    TabView.prototype[tab_view_common_1.tabTextColorProperty.getDefault] = function () {
        return null;
    };
    TabView.prototype[tab_view_common_1.tabTextColorProperty.setNative] = function (value) {
        this._updateIOSTabBarColorsAndFonts();
    };
    TabView.prototype[tab_view_common_1.tabBackgroundColorProperty.getDefault] = function () {
        return this._ios.tabBar.barTintColor;
    };
    TabView.prototype[tab_view_common_1.tabBackgroundColorProperty.setNative] = function (value) {
        this._ios.tabBar.barTintColor = value instanceof tab_view_common_1.Color ? value.ios : value;
    };
    TabView.prototype[tab_view_common_1.selectedTabTextColorProperty.getDefault] = function () {
        return this._ios.tabBar.tintColor;
    };
    TabView.prototype[tab_view_common_1.selectedTabTextColorProperty.setNative] = function (value) {
        this._ios.tabBar.tintColor = value instanceof tab_view_common_1.Color ? value.ios : value;
        this._updateIOSTabBarColorsAndFonts();
    };
    TabView.prototype[tab_view_common_1.fontInternalProperty.getDefault] = function () {
        return null;
    };
    TabView.prototype[tab_view_common_1.fontInternalProperty.setNative] = function (value) {
        this._updateIOSTabBarColorsAndFonts();
    };
    TabView.prototype[tab_view_common_1.iosIconRenderingModeProperty.getDefault] = function () {
        return "automatic";
    };
    TabView.prototype[tab_view_common_1.iosIconRenderingModeProperty.setNative] = function (value) {
        this._iconsCache = {};
        var items = this.items;
        if (items && items.length) {
            for (var i = 0, length_1 = items.length; i < length_1; i++) {
                var item = items[i];
                if (item.iconSource) {
                    item._update();
                }
            }
        }
    };
    __decorate([
        profiling_1.profile
    ], TabView.prototype, "onLoaded", null);
    return TabView;
}(tab_view_common_1.TabViewBase));
exports.TabView = TabView;
function getTitleAttributesForStates(tabView) {
    var _a, _b;
    var result = {};
    var defaultTabItemFontSize = 10;
    var tabItemFontSize = tabView.style.tabTextFontSize || defaultTabItemFontSize;
    var font = tabView.style.fontInternal.getUIFont(UIFont.systemFontOfSize(tabItemFontSize));
    var tabItemTextColor = tabView.style.tabTextColor;
    var textColor = tabItemTextColor instanceof tab_view_common_1.Color ? tabItemTextColor.ios : null;
    result.normalState = (_a = {}, _a[NSFontAttributeName] = font, _a);
    if (textColor) {
        result.normalState[UITextAttributeTextColor] = textColor;
    }
    var tabSelectedItemTextColor = tabView.style.selectedTabTextColor;
    var selectedTextColor = tabItemTextColor instanceof tab_view_common_1.Color ? tabSelectedItemTextColor.ios : null;
    result.selectedState = (_b = {}, _b[NSFontAttributeName] = font, _b);
    if (selectedTextColor) {
        result.selectedState[UITextAttributeTextColor] = selectedTextColor;
    }
    return result;
}
function applyStatesToItem(item, states) {
    item.setTitleTextAttributesForState(states.normalState, 0);
    item.setTitleTextAttributesForState(states.selectedState, 4);
}
//# sourceMappingURL=tab-view.ios.js.map