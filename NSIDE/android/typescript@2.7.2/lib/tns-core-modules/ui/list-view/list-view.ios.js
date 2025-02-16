function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var list_view_common_1 = require("./list-view-common");
var stack_layout_1 = require("../layouts/stack-layout");
var proxy_view_container_1 = require("../proxy-view-container");
var profiling_1 = require("../../profiling");
var trace = require("../../trace");
var utils_1 = require("../../utils/utils");
__export(require("./list-view-common"));
var ITEMLOADING = list_view_common_1.ListViewBase.itemLoadingEvent;
var LOADMOREITEMS = list_view_common_1.ListViewBase.loadMoreItemsEvent;
var ITEMTAP = list_view_common_1.ListViewBase.itemTapEvent;
var DEFAULT_HEIGHT = 44;
var infinity = list_view_common_1.layout.makeMeasureSpec(0, list_view_common_1.layout.UNSPECIFIED);
var majorVersion = utils_1.ios.MajorVersion;
var ListViewCell = (function (_super) {
    __extends(ListViewCell, _super);
    function ListViewCell() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ListViewCell.initWithEmptyBackground = function () {
        var cell = ListViewCell.new();
        cell.backgroundColor = null;
        return cell;
    };
    ListViewCell.prototype.initWithStyleReuseIdentifier = function (style, reuseIdentifier) {
        var cell = _super.prototype.initWithStyleReuseIdentifier.call(this, style, reuseIdentifier);
        cell.backgroundColor = null;
        return cell;
    };
    ListViewCell.prototype.willMoveToSuperview = function (newSuperview) {
        var parent = (this.view ? this.view.parent : null);
        if (parent && !newSuperview) {
            parent._removeContainer(this);
        }
    };
    Object.defineProperty(ListViewCell.prototype, "view", {
        get: function () {
            return this.owner ? this.owner.get() : null;
        },
        enumerable: true,
        configurable: true
    });
    return ListViewCell;
}(UITableViewCell));
function notifyForItemAtIndex(listView, cell, view, eventName, indexPath) {
    var args = { eventName: eventName, object: listView, index: indexPath.row, view: view, ios: cell, android: undefined };
    listView.notify(args);
    return args;
}
var DataSource = (function (_super) {
    __extends(DataSource, _super);
    function DataSource() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataSource.initWithOwner = function (owner) {
        var dataSource = DataSource.new();
        dataSource._owner = owner;
        return dataSource;
    };
    DataSource.prototype.tableViewNumberOfRowsInSection = function (tableView, section) {
        var owner = this._owner.get();
        return (owner && owner.items) ? owner.items.length : 0;
    };
    DataSource.prototype.tableViewCellForRowAtIndexPath = function (tableView, indexPath) {
        var owner = this._owner.get();
        var cell;
        if (owner) {
            var template = owner._getItemTemplate(indexPath.row);
            cell = (tableView.dequeueReusableCellWithIdentifier(template.key) || ListViewCell.initWithEmptyBackground());
            owner._prepareCell(cell, indexPath);
            var cellView = cell.view;
            if (cellView && cellView.isLayoutRequired) {
                var width = list_view_common_1.layout.getMeasureSpecSize(owner.widthMeasureSpec);
                var rowHeight = owner._effectiveRowHeight;
                var cellHeight = rowHeight > 0 ? rowHeight : owner.getHeight(indexPath.row);
                list_view_common_1.View.layoutChild(owner, cellView, 0, 0, width, cellHeight);
            }
        }
        else {
            cell = ListViewCell.initWithEmptyBackground();
        }
        return cell;
    };
    DataSource.ObjCProtocols = [UITableViewDataSource];
    return DataSource;
}(NSObject));
var UITableViewDelegateImpl = (function (_super) {
    __extends(UITableViewDelegateImpl, _super);
    function UITableViewDelegateImpl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    UITableViewDelegateImpl.initWithOwner = function (owner) {
        var delegate = UITableViewDelegateImpl.new();
        delegate._owner = owner;
        delegate._measureCellMap = new Map();
        return delegate;
    };
    UITableViewDelegateImpl.prototype.tableViewWillDisplayCellForRowAtIndexPath = function (tableView, cell, indexPath) {
        var owner = this._owner.get();
        if (owner && (indexPath.row === owner.items.length - 1)) {
            owner.notify({ eventName: LOADMOREITEMS, object: owner });
        }
    };
    UITableViewDelegateImpl.prototype.tableViewWillSelectRowAtIndexPath = function (tableView, indexPath) {
        var cell = tableView.cellForRowAtIndexPath(indexPath);
        var owner = this._owner.get();
        if (owner) {
            notifyForItemAtIndex(owner, cell, cell.view, ITEMTAP, indexPath);
        }
        return indexPath;
    };
    UITableViewDelegateImpl.prototype.tableViewDidSelectRowAtIndexPath = function (tableView, indexPath) {
        tableView.deselectRowAtIndexPathAnimated(indexPath, true);
        return indexPath;
    };
    UITableViewDelegateImpl.prototype.tableViewHeightForRowAtIndexPath = function (tableView, indexPath) {
        var owner = this._owner.get();
        if (!owner) {
            return tableView.estimatedRowHeight;
        }
        var height = owner.getHeight(indexPath.row);
        if (height === undefined) {
            var template = owner._getItemTemplate(indexPath.row);
            var cell = this._measureCellMap.get(template.key);
            if (!cell) {
                cell = tableView.dequeueReusableCellWithIdentifier(template.key) || ListViewCell.initWithEmptyBackground();
                this._measureCellMap.set(template.key, cell);
            }
            height = owner._prepareCell(cell, indexPath);
        }
        return list_view_common_1.layout.toDeviceIndependentPixels(height);
    };
    UITableViewDelegateImpl.ObjCProtocols = [UITableViewDelegate];
    return UITableViewDelegateImpl;
}(NSObject));
var UITableViewRowHeightDelegateImpl = (function (_super) {
    __extends(UITableViewRowHeightDelegateImpl, _super);
    function UITableViewRowHeightDelegateImpl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    UITableViewRowHeightDelegateImpl.initWithOwner = function (owner) {
        var delegate = UITableViewRowHeightDelegateImpl.new();
        delegate._owner = owner;
        return delegate;
    };
    UITableViewRowHeightDelegateImpl.prototype.tableViewWillDisplayCellForRowAtIndexPath = function (tableView, cell, indexPath) {
        var owner = this._owner.get();
        if (owner && (indexPath.row === owner.items.length - 1)) {
            owner.notify({ eventName: LOADMOREITEMS, object: owner });
        }
    };
    UITableViewRowHeightDelegateImpl.prototype.tableViewWillSelectRowAtIndexPath = function (tableView, indexPath) {
        var cell = tableView.cellForRowAtIndexPath(indexPath);
        var owner = this._owner.get();
        if (owner) {
            notifyForItemAtIndex(owner, cell, cell.view, ITEMTAP, indexPath);
        }
        return indexPath;
    };
    UITableViewRowHeightDelegateImpl.prototype.tableViewDidSelectRowAtIndexPath = function (tableView, indexPath) {
        tableView.deselectRowAtIndexPathAnimated(indexPath, true);
        return indexPath;
    };
    UITableViewRowHeightDelegateImpl.prototype.tableViewHeightForRowAtIndexPath = function (tableView, indexPath) {
        var owner = this._owner.get();
        if (!owner) {
            return tableView.estimatedRowHeight;
        }
        return list_view_common_1.layout.toDeviceIndependentPixels(owner._effectiveRowHeight);
    };
    UITableViewRowHeightDelegateImpl.ObjCProtocols = [UITableViewDelegate];
    return UITableViewRowHeightDelegateImpl;
}(NSObject));
var ListView = (function (_super) {
    __extends(ListView, _super);
    function ListView() {
        var _this = _super.call(this) || this;
        _this.widthMeasureSpec = 0;
        _this._map = new Map();
        _this._heights = new Array();
        return _this;
    }
    ListView.prototype.createNativeView = function () {
        return UITableView.new();
    };
    ListView.prototype.initNativeView = function () {
        _super.prototype.initNativeView.call(this);
        var nativeView = this.nativeViewProtected;
        nativeView.registerClassForCellReuseIdentifier(ListViewCell.class(), this._defaultTemplate.key);
        nativeView.estimatedRowHeight = DEFAULT_HEIGHT;
        nativeView.rowHeight = UITableViewAutomaticDimension;
        nativeView.dataSource = this._dataSource = DataSource.initWithOwner(new WeakRef(this));
        this._delegate = UITableViewDelegateImpl.initWithOwner(new WeakRef(this));
        this._setNativeClipToBounds();
    };
    ListView.prototype.disposeNativeView = function () {
        this._delegate = null;
        this._dataSource = null;
        _super.prototype.disposeNativeView.call(this);
    };
    ListView.prototype._setNativeClipToBounds = function () {
        this.ios.clipsToBounds = true;
    };
    ListView.prototype.onLoaded = function () {
        _super.prototype.onLoaded.call(this);
        if (this._isDataDirty) {
            this.refresh();
        }
        this.ios.delegate = this._delegate;
    };
    ListView.prototype.onUnloaded = function () {
        this.ios.delegate = null;
        _super.prototype.onUnloaded.call(this);
    };
    Object.defineProperty(ListView.prototype, "ios", {
        get: function () {
            return this.nativeViewProtected;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ListView.prototype, "_childrenCount", {
        get: function () {
            return this._map.size;
        },
        enumerable: true,
        configurable: true
    });
    ListView.prototype.eachChildView = function (callback) {
        this._map.forEach(function (view, key) {
            callback(view);
        });
    };
    ListView.prototype.scrollToIndex = function (index) {
        this._scrollToIndex(index, false);
    };
    ListView.prototype.scrollToIndexAnimated = function (index) {
        this._scrollToIndex(index);
    };
    ListView.prototype._scrollToIndex = function (index, animated) {
        if (animated === void 0) { animated = true; }
        if (!this.ios) {
            return;
        }
        var itemsLength = this.items ? this.items.length : 0;
        if (itemsLength > 0) {
            if (index < 0) {
                index = 0;
            }
            else if (index >= itemsLength) {
                index = itemsLength - 1;
            }
            this.ios.scrollToRowAtIndexPathAtScrollPositionAnimated(NSIndexPath.indexPathForItemInSection(index, 0), 1, animated);
        }
        else if (trace.isEnabled()) {
            trace.write("Cannot scroll listview to index " + index + " when listview items not set", trace.categories.Binding);
        }
    };
    ListView.prototype.refresh = function () {
        this._map.forEach(function (view, nativeView, map) {
            if (!(view.bindingContext instanceof list_view_common_1.Observable)) {
                view.bindingContext = null;
            }
        });
        if (this.isLoaded) {
            this.ios.reloadData();
            this.requestLayout();
            this._isDataDirty = false;
        }
        else {
            this._isDataDirty = true;
        }
    };
    ListView.prototype.isItemAtIndexVisible = function (itemIndex) {
        var indexes = Array.from(this.ios.indexPathsForVisibleRows);
        return indexes.some(function (visIndex) { return visIndex.row === itemIndex; });
    };
    ListView.prototype.getHeight = function (index) {
        return this._heights[index];
    };
    ListView.prototype.setHeight = function (index, value) {
        this._heights[index] = value;
    };
    ListView.prototype._onRowHeightPropertyChanged = function (oldValue, newValue) {
        var value = list_view_common_1.layout.toDeviceIndependentPixels(this._effectiveRowHeight);
        var nativeView = this.ios;
        if (value < 0) {
            nativeView.rowHeight = UITableViewAutomaticDimension;
            nativeView.estimatedRowHeight = DEFAULT_HEIGHT;
            this._delegate = UITableViewDelegateImpl.initWithOwner(new WeakRef(this));
        }
        else {
            nativeView.rowHeight = value;
            nativeView.estimatedRowHeight = value;
            this._delegate = UITableViewRowHeightDelegateImpl.initWithOwner(new WeakRef(this));
        }
        if (this.isLoaded) {
            nativeView.delegate = this._delegate;
        }
        _super.prototype._onRowHeightPropertyChanged.call(this, oldValue, newValue);
    };
    ListView.prototype.requestLayout = function () {
        if (!this._preparingCell) {
            _super.prototype.requestLayout.call(this);
        }
    };
    ListView.prototype.measure = function (widthMeasureSpec, heightMeasureSpec) {
        this.widthMeasureSpec = widthMeasureSpec;
        var changed = this._setCurrentMeasureSpecs(widthMeasureSpec, heightMeasureSpec);
        _super.prototype.measure.call(this, widthMeasureSpec, heightMeasureSpec);
        if (changed) {
            this.ios.reloadData();
        }
    };
    ListView.prototype.onMeasure = function (widthMeasureSpec, heightMeasureSpec) {
        var _this = this;
        _super.prototype.onMeasure.call(this, widthMeasureSpec, heightMeasureSpec);
        this._map.forEach(function (childView, listViewCell) {
            list_view_common_1.View.measureChild(_this, childView, childView._currentWidthMeasureSpec, childView._currentHeightMeasureSpec);
        });
    };
    ListView.prototype.onLayout = function (left, top, right, bottom) {
        var _this = this;
        _super.prototype.onLayout.call(this, left, top, right, bottom);
        this._map.forEach(function (childView, listViewCell) {
            var rowHeight = _this._effectiveRowHeight;
            var cellHeight = rowHeight > 0 ? rowHeight : _this.getHeight(childView._listViewItemIndex);
            if (cellHeight) {
                var width = list_view_common_1.layout.getMeasureSpecSize(_this.widthMeasureSpec);
                list_view_common_1.View.layoutChild(_this, childView, 0, 0, width, cellHeight);
            }
        });
    };
    ListView.prototype._layoutCell = function (cellView, indexPath) {
        if (cellView) {
            var rowHeight = this._effectiveRowHeight;
            var heightMeasureSpec = rowHeight >= 0 ? list_view_common_1.layout.makeMeasureSpec(rowHeight, list_view_common_1.layout.EXACTLY) : infinity;
            var measuredSize = list_view_common_1.View.measureChild(this, cellView, this.widthMeasureSpec, heightMeasureSpec);
            var height = measuredSize.measuredHeight;
            this.setHeight(indexPath.row, height);
            return height;
        }
        return this.ios.estimatedRowHeight;
    };
    ListView.prototype._prepareCell = function (cell, indexPath) {
        var cellHeight;
        try {
            this._preparingCell = true;
            var view = cell.view;
            if (!view) {
                view = this._getItemTemplate(indexPath.row).createView();
            }
            var args = notifyForItemAtIndex(this, cell, view, ITEMLOADING, indexPath);
            view = args.view || this._getDefaultItemContent(indexPath.row);
            if (view instanceof proxy_view_container_1.ProxyViewContainer) {
                var sp = new stack_layout_1.StackLayout();
                sp.addChild(view);
                view = sp;
            }
            if (!cell.view) {
                cell.owner = new WeakRef(view);
            }
            else if (cell.view !== view) {
                this._removeContainer(cell);
                cell.view.nativeViewProtected.removeFromSuperview();
                cell.owner = new WeakRef(view);
            }
            this._prepareItem(view, indexPath.row);
            view._listViewItemIndex = indexPath.row;
            this._map.set(cell, view);
            if (view && !view.parent) {
                this._addView(view);
                cell.contentView.addSubview(view.nativeViewProtected);
            }
            cellHeight = this._layoutCell(view, indexPath);
        }
        finally {
            this._preparingCell = false;
        }
        return cellHeight;
    };
    ListView.prototype._removeContainer = function (cell) {
        var view = cell.view;
        if (!(view.parent instanceof ListView)) {
            this._removeView(view.parent);
        }
        var preparing = this._preparingCell;
        this._preparingCell = true;
        view.parent._removeView(view);
        view._listViewItemIndex = undefined;
        this._preparingCell = preparing;
        this._map.delete(cell);
    };
    ListView.prototype[list_view_common_1.separatorColorProperty.getDefault] = function () {
        return this.ios.separatorColor;
    };
    ListView.prototype[list_view_common_1.separatorColorProperty.setNative] = function (value) {
        this.ios.separatorColor = value instanceof list_view_common_1.Color ? value.ios : value;
    };
    ListView.prototype[list_view_common_1.itemTemplatesProperty.getDefault] = function () {
        return null;
    };
    ListView.prototype[list_view_common_1.itemTemplatesProperty.setNative] = function (value) {
        this._itemTemplatesInternal = new Array(this._defaultTemplate);
        if (value) {
            for (var i = 0, length_1 = value.length; i < length_1; i++) {
                this.ios.registerClassForCellReuseIdentifier(ListViewCell.class(), value[i].key);
            }
            this._itemTemplatesInternal = this._itemTemplatesInternal.concat(value);
        }
        this.refresh();
    };
    ListView.prototype[list_view_common_1.iosEstimatedRowHeightProperty.getDefault] = function () {
        return DEFAULT_HEIGHT;
    };
    ListView.prototype[list_view_common_1.iosEstimatedRowHeightProperty.setNative] = function (value) {
        var nativeView = this.ios;
        var estimatedHeight = list_view_common_1.Length.toDevicePixels(value, 0);
        nativeView.estimatedRowHeight = estimatedHeight < 0 ? DEFAULT_HEIGHT : estimatedHeight;
    };
    __decorate([
        profiling_1.profile
    ], ListView.prototype, "onLoaded", null);
    return ListView;
}(list_view_common_1.ListViewBase));
exports.ListView = ListView;
//# sourceMappingURL=list-view.ios.js.map