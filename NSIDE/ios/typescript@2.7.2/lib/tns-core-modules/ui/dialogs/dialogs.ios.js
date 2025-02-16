function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var view_1 = require("../core/view");
var dialogs_common_1 = require("./dialogs-common");
var types_1 = require("../../utils/types");
var application_1 = require("../../application");
__export(require("./dialogs-common"));
function addButtonsToAlertController(alertController, options, callback) {
    if (!options) {
        return;
    }
    if (types_1.isString(options.cancelButtonText)) {
        alertController.addAction(UIAlertAction.actionWithTitleStyleHandler(options.cancelButtonText, 0, function () {
            raiseCallback(callback, false);
        }));
    }
    if (types_1.isString(options.neutralButtonText)) {
        alertController.addAction(UIAlertAction.actionWithTitleStyleHandler(options.neutralButtonText, 0, function () {
            raiseCallback(callback, undefined);
        }));
    }
    if (types_1.isString(options.okButtonText)) {
        alertController.addAction(UIAlertAction.actionWithTitleStyleHandler(options.okButtonText, 0, function () {
            raiseCallback(callback, true);
        }));
    }
}
function raiseCallback(callback, result) {
    if (types_1.isFunction(callback)) {
        callback(result);
    }
}
function alert(arg) {
    return new Promise(function (resolve, reject) {
        try {
            var options = !dialogs_common_1.isDialogOptions(arg) ? { title: dialogs_common_1.ALERT, okButtonText: dialogs_common_1.OK, message: arg + "" } : arg;
            var alertController = UIAlertController.alertControllerWithTitleMessagePreferredStyle(options.title, options.message, 1);
            addButtonsToAlertController(alertController, options, function () { resolve(); });
            showUIAlertController(alertController);
        }
        catch (ex) {
            reject(ex);
        }
    });
}
exports.alert = alert;
function confirm(arg) {
    return new Promise(function (resolve, reject) {
        try {
            var options = !dialogs_common_1.isDialogOptions(arg) ? { title: dialogs_common_1.CONFIRM, okButtonText: dialogs_common_1.OK, cancelButtonText: dialogs_common_1.CANCEL, message: arg + "" } : arg;
            var alertController = UIAlertController.alertControllerWithTitleMessagePreferredStyle(options.title, options.message, 1);
            addButtonsToAlertController(alertController, options, function (r) { resolve(r); });
            showUIAlertController(alertController);
        }
        catch (ex) {
            reject(ex);
        }
    });
}
exports.confirm = confirm;
function prompt(arg) {
    var options;
    var defaultOptions = {
        title: dialogs_common_1.PROMPT,
        okButtonText: dialogs_common_1.OK,
        cancelButtonText: dialogs_common_1.CANCEL,
        inputType: dialogs_common_1.inputType.text,
    };
    if (arguments.length === 1) {
        if (types_1.isString(arg)) {
            options = defaultOptions;
            options.message = arg;
        }
        else {
            options = arg;
        }
    }
    else if (arguments.length === 2) {
        if (types_1.isString(arguments[0]) && types_1.isString(arguments[1])) {
            options = defaultOptions;
            options.message = arguments[0];
            options.defaultText = arguments[1];
        }
    }
    return new Promise(function (resolve, reject) {
        try {
            var textField_1;
            var alertController = UIAlertController.alertControllerWithTitleMessagePreferredStyle(options.title, options.message, 1);
            alertController.addTextFieldWithConfigurationHandler(function (arg) {
                arg.text = types_1.isString(options.defaultText) ? options.defaultText : "";
                arg.secureTextEntry = options && options.inputType === dialogs_common_1.inputType.password;
                if (options && options.inputType === dialogs_common_1.inputType.email) {
                    arg.keyboardType = 7;
                }
                var color = dialogs_common_1.getTextFieldColor();
                if (color) {
                    arg.textColor = arg.tintColor = color.ios;
                }
            });
            textField_1 = alertController.textFields.firstObject;
            if (options) {
                switch (options.capitalizationType) {
                    case dialogs_common_1.capitalizationType.all: {
                        textField_1.autocapitalizationType = 3;
                        break;
                    }
                    case dialogs_common_1.capitalizationType.sentences: {
                        textField_1.autocapitalizationType = 2;
                        break;
                    }
                    case dialogs_common_1.capitalizationType.words: {
                        textField_1.autocapitalizationType = 1;
                        break;
                    }
                    default: {
                        textField_1.autocapitalizationType = 0;
                    }
                }
            }
            addButtonsToAlertController(alertController, options, function (r) { resolve({ result: r, text: textField_1.text }); });
            showUIAlertController(alertController);
        }
        catch (ex) {
            reject(ex);
        }
    });
}
exports.prompt = prompt;
function login() {
    var options;
    var defaultOptions = { title: dialogs_common_1.LOGIN, okButtonText: dialogs_common_1.OK, cancelButtonText: dialogs_common_1.CANCEL };
    if (arguments.length === 1) {
        if (types_1.isString(arguments[0])) {
            options = defaultOptions;
            options.message = arguments[0];
        }
        else {
            options = arguments[0];
        }
    }
    else if (arguments.length === 2) {
        if (types_1.isString(arguments[0]) && types_1.isString(arguments[1])) {
            options = defaultOptions;
            options.message = arguments[0];
            options.userName = arguments[1];
        }
    }
    else if (arguments.length === 3) {
        if (types_1.isString(arguments[0]) && types_1.isString(arguments[1]) && types_1.isString(arguments[2])) {
            options = defaultOptions;
            options.message = arguments[0];
            options.userName = arguments[1];
            options.password = arguments[2];
        }
    }
    return new Promise(function (resolve, reject) {
        try {
            var userNameTextField_1;
            var passwordTextField_1;
            var alertController = UIAlertController.alertControllerWithTitleMessagePreferredStyle(options.title, options.message, 1);
            var textFieldColor_1 = dialogs_common_1.getTextFieldColor();
            alertController.addTextFieldWithConfigurationHandler(function (arg) {
                arg.placeholder = "Login";
                arg.text = types_1.isString(options.userName) ? options.userName : "";
                if (textFieldColor_1) {
                    arg.textColor = arg.tintColor = textFieldColor_1.ios;
                }
            });
            alertController.addTextFieldWithConfigurationHandler(function (arg) {
                arg.placeholder = "Password";
                arg.secureTextEntry = true;
                arg.text = types_1.isString(options.password) ? options.password : "";
                if (textFieldColor_1) {
                    arg.textColor = arg.tintColor = textFieldColor_1.ios;
                }
            });
            userNameTextField_1 = alertController.textFields.firstObject;
            passwordTextField_1 = alertController.textFields.lastObject;
            addButtonsToAlertController(alertController, options, function (r) {
                resolve({
                    result: r,
                    userName: userNameTextField_1.text,
                    password: passwordTextField_1.text
                });
            });
            showUIAlertController(alertController);
        }
        catch (ex) {
            reject(ex);
        }
    });
}
exports.login = login;
function showUIAlertController(alertController) {
    var _a, _b;
    var currentView = dialogs_common_1.getCurrentPage() || application_1.getRootView();
    if (currentView) {
        currentView = currentView.modal || currentView;
        var viewController = currentView.ios;
        if (!(currentView.ios instanceof UIViewController)) {
            var parentWithController = view_1.ios.getParentWithViewController(currentView);
            viewController = parentWithController ? parentWithController.viewController : undefined;
        }
        if (viewController) {
            if (alertController.popoverPresentationController) {
                alertController.popoverPresentationController.sourceView = viewController.view;
                alertController.popoverPresentationController.sourceRect = CGRectMake(viewController.view.bounds.size.width / 2.0, viewController.view.bounds.size.height / 2.0, 1.0, 1.0);
                alertController.popoverPresentationController.permittedArrowDirections = 0;
            }
            var color = dialogs_common_1.getButtonColors().color;
            if (color) {
                alertController.view.tintColor = color.ios;
            }
            var lblColor = dialogs_common_1.getLabelColor();
            if (lblColor) {
                if (alertController.title) {
                    var title = NSAttributedString.alloc().initWithStringAttributes(alertController.title, (_a = {}, _a[NSForegroundColorAttributeName] = lblColor.ios, _a));
                    alertController.setValueForKey(title, "attributedTitle");
                }
                if (alertController.message) {
                    var message = NSAttributedString.alloc().initWithStringAttributes(alertController.message, (_b = {}, _b[NSForegroundColorAttributeName] = lblColor.ios, _b));
                    alertController.setValueForKey(message, "attributedMessage");
                }
            }
            viewController.presentModalViewControllerAnimated(alertController, true);
        }
    }
}
function action() {
    var options;
    var defaultOptions = { title: null, cancelButtonText: dialogs_common_1.CANCEL };
    if (arguments.length === 1) {
        if (types_1.isString(arguments[0])) {
            options = defaultOptions;
            options.message = arguments[0];
        }
        else {
            options = arguments[0];
        }
    }
    else if (arguments.length === 2) {
        if (types_1.isString(arguments[0]) && types_1.isString(arguments[1])) {
            options = defaultOptions;
            options.message = arguments[0];
            options.cancelButtonText = arguments[1];
        }
    }
    else if (arguments.length === 3) {
        if (types_1.isString(arguments[0]) && types_1.isString(arguments[1]) && types_1.isDefined(arguments[2])) {
            options = defaultOptions;
            options.message = arguments[0];
            options.cancelButtonText = arguments[1];
            options.actions = arguments[2];
        }
    }
    return new Promise(function (resolve, reject) {
        try {
            var i = void 0;
            var action_1;
            var alertController = UIAlertController.alertControllerWithTitleMessagePreferredStyle(options.title, options.message, 0);
            if (options.actions) {
                for (i = 0; i < options.actions.length; i++) {
                    action_1 = options.actions[i];
                    if (types_1.isString(action_1)) {
                        alertController.addAction(UIAlertAction.actionWithTitleStyleHandler(action_1, 0, function (arg) {
                            resolve(arg.title);
                        }));
                    }
                }
            }
            if (types_1.isString(options.cancelButtonText)) {
                alertController.addAction(UIAlertAction.actionWithTitleStyleHandler(options.cancelButtonText, 1, function (arg) {
                    resolve(arg.title);
                }));
            }
            showUIAlertController(alertController);
        }
        catch (ex) {
            reject(ex);
        }
    });
}
exports.action = action;
//# sourceMappingURL=dialogs.ios.js.map