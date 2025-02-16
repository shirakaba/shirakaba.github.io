function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var action_bar_common_1 = require("./action-bar-common");
var image_source_1 = require("../../image-source");
var utils_1 = require("../../utils/utils");
__export(require("./action-bar-common"));
var majorVersion = utils_1.ios.MajorVersion;
var UNSPECIFIED = action_bar_common_1.layout.makeMeasureSpec(0, action_bar_common_1.layout.UNSPECIFIED);
function loadActionIconFromFileOrResource(icon) {
    var img = image_source_1.fromFileOrResource(icon);
    if (img && img.ios) {
        return img.ios;
    }
    else {
        action_bar_common_1.traceMissingIcon(icon);
        return null;
    }
}
var TapBarItemHandlerImpl = (function (_super) {
    __extends(TapBarItemHandlerImpl, _super);
    function TapBarItemHandlerImpl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TapBarItemHandlerImpl.initWithOwner = function (owner) {
        var handler = TapBarItemHandlerImpl.new();
        handler._owner = owner;
        return handler;
    };
    TapBarItemHandlerImpl.prototype.tap = function (args) {
        var owner = this._owner.get();
        if (owner) {
            owner._raiseTap();
        }
    };
    TapBarItemHandlerImpl.ObjCExposedMethods = {
        "tap": { returns: interop.types.void, params: [interop.types.id] }
    };
    return TapBarItemHandlerImpl;
}(NSObject));
var ActionItem = (function (_super) {
    __extends(ActionItem, _super);
    function ActionItem() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._ios = {
            position: "left",
            systemIcon: undefined
        };
        return _this;
    }
    Object.defineProperty(ActionItem.prototype, "ios", {
        get: function () {
            return this._ios;
        },
        set: function (value) {
            throw new Error("ActionItem.ios is read-only");
        },
        enumerable: true,
        configurable: true
    });
    return ActionItem;
}(action_bar_common_1.ActionItemBase));
exports.ActionItem = ActionItem;
var NavigationButton = (function (_super) {
    __extends(NavigationButton, _super);
    function NavigationButton() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NavigationButton.prototype._onVisibilityChanged = function (visibility) {
        if (this._navigationItem) {
            var visible = visibility === "visible";
            this._navigationItem.setHidesBackButtonAnimated(!visible, true);
        }
    };
    return NavigationButton;
}(ActionItem));
exports.NavigationButton = NavigationButton;
var ActionBar = (function (_super) {
    __extends(ActionBar, _super);
    function ActionBar() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(ActionBar.prototype, "ios", {
        get: function () {
            var page = this.page;
            if (!page || !page.parent) {
                return;
            }
            var viewController = page.ios;
            if (viewController.navigationController !== null) {
                return viewController.navigationController.navigationBar;
            }
            return null;
        },
        enumerable: true,
        configurable: true
    });
    ActionBar.prototype.createNativeView = function () {
        return this.ios;
    };
    ActionBar.prototype._addChildFromBuilder = function (name, value) {
        if (value instanceof NavigationButton) {
            this.navigationButton = value;
        }
        else if (value instanceof ActionItem) {
            this.actionItems.addItem(value);
        }
        else if (value instanceof action_bar_common_1.View) {
            this.titleView = value;
        }
    };
    Object.defineProperty(ActionBar.prototype, "_getActualSize", {
        get: function () {
            var navBar = this.ios;
            if (!navBar) {
                return { width: 0, height: 0 };
            }
            var frame = navBar.frame;
            var size = frame.size;
            var width = action_bar_common_1.layout.toDevicePixels(size.width);
            var height = action_bar_common_1.layout.toDevicePixels(size.height);
            return { width: width, height: height };
        },
        enumerable: true,
        configurable: true
    });
    ActionBar.prototype.layoutInternal = function () {
        var _a = this._getActualSize, width = _a.width, height = _a.height;
        var widthSpec = action_bar_common_1.layout.makeMeasureSpec(width, action_bar_common_1.layout.EXACTLY);
        var heightSpec = action_bar_common_1.layout.makeMeasureSpec(height, action_bar_common_1.layout.EXACTLY);
        this.measure(widthSpec, heightSpec);
        this.layout(0, 0, width, height, false);
    };
    ActionBar.prototype.update = function () {
        var page = this.page;
        if (!page || !page.frame) {
            return;
        }
        var viewController = page.ios;
        var navigationItem = viewController.navigationItem;
        var navController = viewController.navigationController;
        if (!navController) {
            return;
        }
        var navigationBar = navController.navigationBar;
        var previousController;
        navigationItem.title = this.title;
        var titleView = this.titleView;
        if (titleView && titleView.ios) {
            navigationItem.titleView = titleView.ios;
        }
        else {
            navigationItem.titleView = null;
        }
        var indexOfViewController = navController.viewControllers.indexOfObject(viewController);
        if (indexOfViewController > 0 && indexOfViewController < navController.viewControllers.count) {
            previousController = navController.viewControllers[indexOfViewController - 1];
        }
        if (previousController) {
            if (this.navigationButton) {
                var tapHandler = TapBarItemHandlerImpl.initWithOwner(new WeakRef(this.navigationButton));
                var barButtonItem = UIBarButtonItem.alloc().initWithTitleStyleTargetAction(this.navigationButton.text + "", 0, tapHandler, "tap");
                previousController.navigationItem.backBarButtonItem = barButtonItem;
            }
            else {
                previousController.navigationItem.backBarButtonItem = null;
            }
        }
        var img;
        if (this.navigationButton && action_bar_common_1.isVisible(this.navigationButton) && this.navigationButton.icon) {
            img = loadActionIconFromFileOrResource(this.navigationButton.icon);
        }
        if (img) {
            var image = img.imageWithRenderingMode(1);
            navigationBar.backIndicatorImage = image;
            navigationBar.backIndicatorTransitionMaskImage = image;
        }
        else {
            navigationBar.backIndicatorImage = null;
            navigationBar.backIndicatorTransitionMaskImage = null;
        }
        if (this.navigationButton) {
            this.navigationButton._navigationItem = navigationItem;
            navigationItem.setHidesBackButtonAnimated(!action_bar_common_1.isVisible(this.navigationButton), false);
        }
        this.populateMenuItems(navigationItem);
        this.updateColors(navigationBar);
        this.updateFlatness(navigationBar);
        if (!this.isLayoutValid) {
            this.layoutInternal();
        }
    };
    ActionBar.prototype.populateMenuItems = function (navigationItem) {
        var items = this.actionItems.getVisibleItems();
        var leftBarItems = [];
        var rightBarItems = [];
        for (var i = 0; i < items.length; i++) {
            var barButtonItem = this.createBarButtonItem(items[i]);
            if (items[i].ios.position === "left") {
                leftBarItems.push(barButtonItem);
            }
            else {
                rightBarItems.splice(0, 0, barButtonItem);
            }
        }
        navigationItem.setLeftBarButtonItemsAnimated(leftBarItems, false);
        navigationItem.setRightBarButtonItemsAnimated(rightBarItems, false);
        if (leftBarItems.length > 0) {
            navigationItem.leftItemsSupplementBackButton = true;
        }
    };
    ActionBar.prototype.createBarButtonItem = function (item) {
        var tapHandler = TapBarItemHandlerImpl.initWithOwner(new WeakRef(item));
        item.handler = tapHandler;
        var barButtonItem;
        if (item.actionView && item.actionView.ios) {
            var recognizer = UITapGestureRecognizer.alloc().initWithTargetAction(tapHandler, "tap");
            item.actionView.ios.addGestureRecognizer(recognizer);
            barButtonItem = UIBarButtonItem.alloc().initWithCustomView(item.actionView.ios);
        }
        else if (item.ios.systemIcon !== undefined) {
            var id = item.ios.systemIcon;
            if (typeof id === "string") {
                id = parseInt(id);
            }
            barButtonItem = UIBarButtonItem.alloc().initWithBarButtonSystemItemTargetAction(id, tapHandler, "tap");
        }
        else if (item.icon) {
            var img = loadActionIconFromFileOrResource(item.icon);
            barButtonItem = UIBarButtonItem.alloc().initWithImageStyleTargetAction(img, 0, tapHandler, "tap");
        }
        else {
            barButtonItem = UIBarButtonItem.alloc().initWithTitleStyleTargetAction(item.text + "", 0, tapHandler, "tap");
        }
        if (item.text) {
            barButtonItem.isAccessibilityElement = true;
            barButtonItem.accessibilityLabel = item.text;
            barButtonItem.accessibilityTraits = UIAccessibilityTraitButton;
        }
        return barButtonItem;
    };
    ActionBar.prototype.updateColors = function (navBar) {
        var _a;
        var color = this.color;
        if (color) {
            navBar.titleTextAttributes = (_a = {}, _a[NSForegroundColorAttributeName] = color.ios, _a);
            navBar.tintColor = color.ios;
        }
        else {
            navBar.titleTextAttributes = null;
            navBar.tintColor = null;
        }
        var bgColor = this.backgroundColor;
        navBar.barTintColor = bgColor ? bgColor.ios : null;
    };
    ActionBar.prototype._onTitlePropertyChanged = function () {
        var page = this.page;
        if (!page) {
            return;
        }
        if (page.frame) {
            page.frame._updateActionBar();
        }
        var navigationItem = page.ios.navigationItem;
        navigationItem.title = this.title;
    };
    ActionBar.prototype.updateFlatness = function (navBar) {
        if (this.flat) {
            navBar.setBackgroundImageForBarMetrics(UIImage.new(), 0);
            navBar.shadowImage = UIImage.new();
            navBar.translucent = false;
        }
        else {
            navBar.setBackgroundImageForBarMetrics(null, null);
            navBar.shadowImage = null;
            navBar.translucent = true;
        }
    };
    ActionBar.prototype.onMeasure = function (widthMeasureSpec, heightMeasureSpec) {
        var _this = this;
        var width = action_bar_common_1.layout.getMeasureSpecSize(widthMeasureSpec);
        var height = action_bar_common_1.layout.getMeasureSpecSize(heightMeasureSpec);
        if (this.titleView) {
            action_bar_common_1.View.measureChild(this, this.titleView, UNSPECIFIED, UNSPECIFIED);
        }
        this.actionItems.getItems().forEach(function (actionItem) {
            var actionView = actionItem.actionView;
            if (actionView) {
                action_bar_common_1.View.measureChild(_this, actionView, UNSPECIFIED, UNSPECIFIED);
            }
        });
        this.setMeasuredDimension(width, height);
    };
    ActionBar.prototype.onLayout = function (left, top, right, bottom) {
        var _this = this;
        var titleView = this.titleView;
        if (titleView) {
            if (majorVersion > 10) {
                action_bar_common_1.View.layoutChild(this, titleView, 0, 0, titleView.getMeasuredWidth(), titleView.getMeasuredHeight());
            }
            else {
                action_bar_common_1.View.layoutChild(this, titleView, 0, 0, right - left, bottom - top);
            }
        }
        this.actionItems.getItems().forEach(function (actionItem) {
            var actionView = actionItem.actionView;
            if (actionView && actionView.ios) {
                var measuredWidth = actionView.getMeasuredWidth();
                var measuredHeight = actionView.getMeasuredHeight();
                action_bar_common_1.View.layoutChild(_this, actionView, 0, 0, measuredWidth, measuredHeight);
            }
        });
        _super.prototype.onLayout.call(this, left, top, right, bottom);
    };
    ActionBar.prototype.layoutNativeView = function (left, top, right, bottom) {
        return;
    };
    Object.defineProperty(ActionBar.prototype, "navBar", {
        get: function () {
            var page = this.page;
            if (!page || !page.frame) {
                return undefined;
            }
            return page.frame.ios.controller.navigationBar;
        },
        enumerable: true,
        configurable: true
    });
    ActionBar.prototype[action_bar_common_1.colorProperty.getDefault] = function () {
        return null;
    };
    ActionBar.prototype[action_bar_common_1.colorProperty.setNative] = function (color) {
        var _a;
        var navBar = this.navBar;
        if (color) {
            navBar.tintColor = color.ios;
            navBar.titleTextAttributes = (_a = {}, _a[NSForegroundColorAttributeName] = color.ios, _a);
        }
        else {
            navBar.tintColor = null;
            navBar.titleTextAttributes = null;
        }
    };
    ActionBar.prototype[action_bar_common_1.backgroundColorProperty.getDefault] = function () {
        return null;
    };
    ActionBar.prototype[action_bar_common_1.backgroundColorProperty.setNative] = function (value) {
        var navBar = this.navBar;
        if (navBar) {
            var color = value instanceof action_bar_common_1.Color ? value.ios : value;
            navBar.barTintColor = color;
        }
    };
    ActionBar.prototype[action_bar_common_1.backgroundInternalProperty.getDefault] = function () {
        return null;
    };
    ActionBar.prototype[action_bar_common_1.backgroundInternalProperty.setNative] = function (value) {
    };
    ActionBar.prototype[action_bar_common_1.flatProperty.setNative] = function (value) {
        var navBar = this.navBar;
        if (navBar) {
            this.updateFlatness(navBar);
        }
    };
    return ActionBar;
}(action_bar_common_1.ActionBarBase));
exports.ActionBar = ActionBar;
//# sourceMappingURL=action-bar.ios.js.map