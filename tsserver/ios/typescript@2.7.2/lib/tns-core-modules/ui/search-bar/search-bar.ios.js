function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var font_1 = require("../styling/font");
var search_bar_common_1 = require("./search-bar-common");
var utils_1 = require("../../utils/utils");
__export(require("./search-bar-common"));
var majorVersion = utils_1.ios.MajorVersion;
var UISearchBarDelegateImpl = (function (_super) {
    __extends(UISearchBarDelegateImpl, _super);
    function UISearchBarDelegateImpl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    UISearchBarDelegateImpl.initWithOwner = function (owner) {
        var delegate = UISearchBarDelegateImpl.new();
        delegate._owner = owner;
        return delegate;
    };
    UISearchBarDelegateImpl.prototype.searchBarTextDidChange = function (searchBar, searchText) {
        var owner = this._owner.get();
        if (!owner) {
            return;
        }
        search_bar_common_1.textProperty.nativeValueChange(owner, searchText);
        if (searchText === "") {
            owner._emit(search_bar_common_1.SearchBarBase.clearEvent);
        }
    };
    UISearchBarDelegateImpl.prototype.searchBarCancelButtonClicked = function (searchBar) {
        searchBar.resignFirstResponder();
        var owner = this._owner.get();
        if (!owner) {
            return;
        }
        owner._emit(search_bar_common_1.SearchBarBase.clearEvent);
    };
    UISearchBarDelegateImpl.prototype.searchBarSearchButtonClicked = function (searchBar) {
        searchBar.resignFirstResponder();
        var owner = this._owner.get();
        if (!owner) {
            return;
        }
        owner._emit(search_bar_common_1.SearchBarBase.submitEvent);
    };
    UISearchBarDelegateImpl.ObjCProtocols = [UISearchBarDelegate];
    return UISearchBarDelegateImpl;
}(NSObject));
var UISearchBarImpl = (function (_super) {
    __extends(UISearchBarImpl, _super);
    function UISearchBarImpl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    UISearchBarImpl.prototype.sizeThatFits = function (size) {
        if (majorVersion >= 11 && size.width === Number.POSITIVE_INFINITY) {
            size.width = 0;
        }
        return _super.prototype.sizeThatFits.call(this, size);
    };
    return UISearchBarImpl;
}(UISearchBar));
var SearchBar = (function (_super) {
    __extends(SearchBar, _super);
    function SearchBar() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SearchBar.prototype.createNativeView = function () {
        return UISearchBarImpl.new();
    };
    SearchBar.prototype.initNativeView = function () {
        _super.prototype.initNativeView.call(this);
        this._delegate = UISearchBarDelegateImpl.initWithOwner(new WeakRef(this));
    };
    SearchBar.prototype.disposeNativeView = function () {
        this._delegate = null;
        _super.prototype.disposeNativeView.call(this);
    };
    SearchBar.prototype.onLoaded = function () {
        _super.prototype.onLoaded.call(this);
        this.ios.delegate = this._delegate;
    };
    SearchBar.prototype.onUnloaded = function () {
        this.ios.delegate = null;
        _super.prototype.onUnloaded.call(this);
    };
    SearchBar.prototype.dismissSoftInput = function () {
        this.ios.resignFirstResponder();
    };
    Object.defineProperty(SearchBar.prototype, "ios", {
        get: function () {
            return this.nativeViewProtected;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SearchBar.prototype, "_textField", {
        get: function () {
            if (!this.__textField) {
                this.__textField = this.ios.valueForKey("searchField");
            }
            return this.__textField;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SearchBar.prototype, "_placeholderLabel", {
        get: function () {
            if (!this.__placeholderLabel) {
                if (this._textField) {
                    this.__placeholderLabel = this._textField.valueForKey("placeholderLabel");
                }
            }
            return this.__placeholderLabel;
        },
        enumerable: true,
        configurable: true
    });
    SearchBar.prototype[search_bar_common_1.backgroundColorProperty.getDefault] = function () {
        return this.ios.barTintColor;
    };
    SearchBar.prototype[search_bar_common_1.backgroundColorProperty.setNative] = function (value) {
        var color = value instanceof search_bar_common_1.Color ? value.ios : value;
        this.ios.barTintColor = color;
    };
    SearchBar.prototype[search_bar_common_1.colorProperty.getDefault] = function () {
        var sf = this._textField;
        if (sf) {
            return sf.textColor;
        }
        return null;
    };
    SearchBar.prototype[search_bar_common_1.colorProperty.setNative] = function (value) {
        var sf = this._textField;
        var color = value instanceof search_bar_common_1.Color ? value.ios : value;
        if (sf) {
            sf.textColor = color;
            sf.tintColor = color;
        }
    };
    SearchBar.prototype[search_bar_common_1.fontInternalProperty.getDefault] = function () {
        var sf = this._textField;
        return sf ? sf.font : null;
    };
    SearchBar.prototype[search_bar_common_1.fontInternalProperty.setNative] = function (value) {
        var sf = this._textField;
        if (sf) {
            sf.font = value instanceof font_1.Font ? value.getUIFont(sf.font) : value;
        }
    };
    SearchBar.prototype[search_bar_common_1.backgroundInternalProperty.getDefault] = function () {
        return null;
    };
    SearchBar.prototype[search_bar_common_1.backgroundInternalProperty.setNative] = function (value) {
    };
    SearchBar.prototype[search_bar_common_1.textProperty.getDefault] = function () {
        return "";
    };
    SearchBar.prototype[search_bar_common_1.textProperty.setNative] = function (value) {
        var text = (value === null || value === undefined) ? "" : value.toString();
        this.ios.text = text;
    };
    SearchBar.prototype[search_bar_common_1.hintProperty.getDefault] = function () {
        return "";
    };
    SearchBar.prototype[search_bar_common_1.hintProperty.setNative] = function (value) {
        var text = (value === null || value === undefined) ? "" : value.toString();
        this.ios.placeholder = text;
    };
    SearchBar.prototype[search_bar_common_1.textFieldBackgroundColorProperty.getDefault] = function () {
        var textField = this._textField;
        if (textField) {
            return textField.backgroundColor;
        }
        return null;
    };
    SearchBar.prototype[search_bar_common_1.textFieldBackgroundColorProperty.setNative] = function (value) {
        var color = value instanceof search_bar_common_1.Color ? value.ios : value;
        var textField = this._textField;
        if (textField) {
            textField.backgroundColor = color;
        }
    };
    SearchBar.prototype[search_bar_common_1.textFieldHintColorProperty.getDefault] = function () {
        var placeholderLabel = this._placeholderLabel;
        if (placeholderLabel) {
            return placeholderLabel.textColor;
        }
        return null;
    };
    SearchBar.prototype[search_bar_common_1.textFieldHintColorProperty.setNative] = function (value) {
        var color = value instanceof search_bar_common_1.Color ? value.ios : value;
        var placeholderLabel = this._placeholderLabel;
        if (placeholderLabel) {
            placeholderLabel.textColor = color;
        }
    };
    return SearchBar;
}(search_bar_common_1.SearchBarBase));
exports.SearchBar = SearchBar;
//# sourceMappingURL=search-bar.ios.js.map