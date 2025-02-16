function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var scroll_view_common_1 = require("./scroll-view-common");
var utils_1 = require("../../utils/utils");
var uiUtils = require("tns-core-modules/ui/utils");
__export(require("./scroll-view-common"));
var majorVersion = utils_1.ios.MajorVersion;
var UIScrollViewDelegateImpl = (function (_super) {
    __extends(UIScrollViewDelegateImpl, _super);
    function UIScrollViewDelegateImpl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    UIScrollViewDelegateImpl.initWithOwner = function (owner) {
        var impl = UIScrollViewDelegateImpl.new();
        impl._owner = owner;
        return impl;
    };
    UIScrollViewDelegateImpl.prototype.scrollViewDidScroll = function (sv) {
        var owner = this._owner.get();
        if (owner) {
            owner.notify({
                object: owner,
                eventName: "scroll",
                scrollX: owner.horizontalOffset,
                scrollY: owner.verticalOffset
            });
        }
    };
    UIScrollViewDelegateImpl.ObjCProtocols = [UIScrollViewDelegate];
    return UIScrollViewDelegateImpl;
}(NSObject));
var ScrollView = (function (_super) {
    __extends(ScrollView, _super);
    function ScrollView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._contentMeasuredWidth = 0;
        _this._contentMeasuredHeight = 0;
        return _this;
    }
    ScrollView.prototype.createNativeView = function () {
        var view = UIScrollView.new();
        return view;
    };
    ScrollView.prototype.initNativeView = function () {
        _super.prototype.initNativeView.call(this);
        this.updateScrollBarVisibility(this.scrollBarIndicatorVisible);
        this._setNativeClipToBounds();
    };
    ScrollView.prototype._setNativeClipToBounds = function () {
        this.nativeViewProtected.clipsToBounds = true;
    };
    ScrollView.prototype.attachNative = function () {
        this._delegate = UIScrollViewDelegateImpl.initWithOwner(new WeakRef(this));
        this.nativeViewProtected.delegate = this._delegate;
    };
    ScrollView.prototype.dettachNative = function () {
        this.nativeViewProtected.delegate = null;
    };
    ScrollView.prototype.updateScrollBarVisibility = function (value) {
        if (!this.nativeViewProtected) {
            return;
        }
        if (this.orientation === "horizontal") {
            this.nativeViewProtected.showsHorizontalScrollIndicator = value;
        }
        else {
            this.nativeViewProtected.showsVerticalScrollIndicator = value;
        }
    };
    Object.defineProperty(ScrollView.prototype, "horizontalOffset", {
        get: function () {
            return this.nativeViewProtected ? this.nativeViewProtected.contentOffset.x : 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ScrollView.prototype, "verticalOffset", {
        get: function () {
            return this.nativeViewProtected ? this.nativeViewProtected.contentOffset.y : 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ScrollView.prototype, "scrollableWidth", {
        get: function () {
            if (!this.nativeViewProtected || this.orientation !== "horizontal") {
                return 0;
            }
            return Math.max(0, this.nativeViewProtected.contentSize.width - this.nativeViewProtected.bounds.size.width);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ScrollView.prototype, "scrollableHeight", {
        get: function () {
            if (!this.nativeViewProtected || this.orientation !== "vertical") {
                return 0;
            }
            return Math.max(0, this.nativeViewProtected.contentSize.height - this.nativeViewProtected.bounds.size.height);
        },
        enumerable: true,
        configurable: true
    });
    ScrollView.prototype[scroll_view_common_1.scrollBarIndicatorVisibleProperty.getDefault] = function () {
        return true;
    };
    ScrollView.prototype[scroll_view_common_1.scrollBarIndicatorVisibleProperty.setNative] = function (value) {
        this.updateScrollBarVisibility(value);
    };
    ScrollView.prototype.scrollToVerticalOffset = function (value, animated) {
        if (this.nativeViewProtected && this.orientation === "vertical") {
            var bounds = this.nativeViewProtected.bounds.size;
            this.nativeViewProtected.scrollRectToVisibleAnimated(CGRectMake(0, value, bounds.width, bounds.height), animated);
        }
    };
    ScrollView.prototype.scrollToHorizontalOffset = function (value, animated) {
        if (this.nativeViewProtected && this.orientation === "horizontal") {
            var bounds = this.nativeViewProtected.bounds.size;
            this.nativeViewProtected.scrollRectToVisibleAnimated(CGRectMake(value, 0, bounds.width, bounds.height), animated);
        }
    };
    ScrollView.prototype.onMeasure = function (widthMeasureSpec, heightMeasureSpec) {
        var width = scroll_view_common_1.layout.getMeasureSpecSize(widthMeasureSpec);
        var widthMode = scroll_view_common_1.layout.getMeasureSpecMode(widthMeasureSpec);
        var height = scroll_view_common_1.layout.getMeasureSpecSize(heightMeasureSpec);
        var heightMode = scroll_view_common_1.layout.getMeasureSpecMode(heightMeasureSpec);
        var child = this.layoutView;
        this._contentMeasuredWidth = this.effectiveMinWidth;
        this._contentMeasuredHeight = this.effectiveMinHeight;
        if (child) {
            var childSize = void 0;
            if (this.orientation === "vertical") {
                childSize = scroll_view_common_1.View.measureChild(this, child, widthMeasureSpec, scroll_view_common_1.layout.makeMeasureSpec(0, scroll_view_common_1.layout.UNSPECIFIED));
            }
            else {
                childSize = scroll_view_common_1.View.measureChild(this, child, scroll_view_common_1.layout.makeMeasureSpec(0, scroll_view_common_1.layout.UNSPECIFIED), heightMeasureSpec);
            }
            this._contentMeasuredWidth = Math.max(childSize.measuredWidth, this.effectiveMinWidth);
            this._contentMeasuredHeight = Math.max(childSize.measuredHeight, this.effectiveMinHeight);
        }
        var widthAndState = scroll_view_common_1.View.resolveSizeAndState(this._contentMeasuredWidth, width, widthMode, 0);
        var heightAndState = scroll_view_common_1.View.resolveSizeAndState(this._contentMeasuredHeight, height, heightMode, 0);
        this.setMeasuredDimension(widthAndState, heightAndState);
    };
    ScrollView.prototype.onLayout = function (left, top, right, bottom) {
        var insets = this.getSafeAreaInsets();
        var width = (right - left - insets.right - insets.left);
        var height = (bottom - top - insets.bottom - insets.top);
        var nativeView = this.nativeViewProtected;
        if (majorVersion > 10) {
            nativeView.contentInsetAdjustmentBehavior = 2;
        }
        var scrollWidth = width;
        var scrollHeight = height;
        if (this.orientation === "horizontal") {
            scrollWidth = Math.max(this._contentMeasuredWidth + insets.left + insets.right, width);
            scrollHeight = height + insets.top + insets.bottom;
            width = Math.max(this._contentMeasuredWidth, width);
        }
        else {
            scrollHeight = Math.max(this._contentMeasuredHeight + insets.top + insets.bottom, height);
            scrollWidth = width + insets.left + insets.right;
            height = Math.max(this._contentMeasuredHeight, height);
        }
        nativeView.contentSize = CGSizeMake(scroll_view_common_1.layout.toDeviceIndependentPixels(scrollWidth), scroll_view_common_1.layout.toDeviceIndependentPixels(scrollHeight));
        scroll_view_common_1.View.layoutChild(this, this.layoutView, insets.left, insets.top, insets.left + width, insets.top + height);
    };
    ScrollView.prototype._onOrientationChanged = function () {
        this.updateScrollBarVisibility(this.scrollBarIndicatorVisible);
    };
    return ScrollView;
}(scroll_view_common_1.ScrollViewBase));
exports.ScrollView = ScrollView;
function getTabBarHeight(scrollView) {
    var parent = scrollView.parent;
    while (parent) {
        var controller = parent.viewController;
        if (controller instanceof UITabBarController) {
            return uiUtils.ios.getActualHeight(controller.tabBar);
        }
        parent = parent.parent;
    }
    return 0;
}
ScrollView.prototype.recycleNativeView = "auto";
//# sourceMappingURL=scroll-view.ios.js.map