/**
 * @module "ui/core/view-base"
 */ /** */
import { Property, CssProperty, CssAnimationProperty, InheritedProperty, Style } from "../properties";
import { BindingOptions, Observable } from "../bindable";

import { SelectorCore } from "../../styling/css-selector";
import { isIOS, isAndroid } from "../../../platform";

import { KeyframeAnimation } from "../../animation/keyframe-animation";
import { Page } from "../../page";
import { layout } from "../../../utils/utils";

import { Color } from "../../../color";
import { Order, FlexGrow, FlexShrink, FlexWrapBefore, AlignSelf } from "../../layouts/flexbox-layout";
import { Length } from "../../styling/style-properties";
import { DOMNode } from "../../../debugger/dom-node";

export { isIOS, isAndroid, layout, Color };

export * from "../properties";
export * from "../bindable";

/**
 * Iterates through all child views (via visual tree) and executes a function.
 * @param view - Starting view (parent container).
 * @param callback - A function to execute on every child. If function returns false it breaks the iteration.
 */
export function eachDescendant(view: ViewBase, callback: (child: ViewBase) => boolean);

/**
 * Gets an ancestor from a given type.
 * @param view - Starting view (child view).
 * @param criterion - The type of ancestor view we are looking for. Could be a string containing a class name or an actual type.
 * Returns an instance of a view (if found), otherwise undefined.
 */
export function getAncestor(view: ViewBase, criterion: string | Function): ViewBase;

export function isEventOrGesture(name: string, view: ViewBase): boolean;

/**
 * Gets a child view by id.
 * @param view - The parent (container) view of the view to look for.
 * @param id - The id of the view to look for.
 * Returns an instance of a view (if found), otherwise undefined.
 */
export function getViewById(view: ViewBase, id: string): ViewBase;

export abstract class ViewBase extends Observable {
    // Dynamic properties.
    left: Length;
    top: Length;
    effectiveLeft: number;
    effectiveTop: number;
    dock: "left" | "top" | "right" | "bottom";
    row: number;
    col: number;
    rowSpan: number;
    colSpan: number;
    domNode: DOMNode;

    order: Order;
    flexGrow: FlexGrow;
    flexShrink: FlexShrink;
    flexWrapBefore: FlexWrapBefore;
    alignSelf: AlignSelf;

    

    /**
     * Shows the View contained in moduleName as a modal view.
     * @param moduleName - The name of the module to load starting from the application root.
     * @param context - Any context you want to pass to the modally shown view.
     * This same context will be available in the arguments of the shownModally event handler.
     * @param closeCallback - A function that will be called when the view is closed.
     * Any arguments provided when calling ShownModallyData.closeCallback will be available here.
     * @param fullscreen - An optional parameter specifying whether to show the modal view in full-screen mode.
     * @param animated - An optional parameter specifying whether to show the modal view with animation.
     * @param stretched - An optional parameter specifying whether to stretch the modal view when not in full-screen mode.
     */
    showModal(moduleName: string, context: any, closeCallback: Function, fullscreen?: boolean, animated?: boolean, stretched?: boolean): ViewBase;

    /**
     * Shows the view passed as parameter as a modal view.
     * @param view - View instance to be shown modally.
     * @param context - Any context you want to pass to the modally shown view. This same context will be available in the arguments of the shownModally event handler.
     * @param closeCallback - A function that will be called when the view is closed. Any arguments provided when calling ShownModallyData.closeCallback will be available here.
     * @param fullscreen - An optional parameter specifying whether to show the modal view in full-screen mode.
     * @param animated - An optional parameter specifying whether to show the modal view with animation.
     * @param stretched - An optional parameter specifying whether to stretch the modal view when not in full-screen mode.
     */
    showModal(view: ViewBase, context: any, closeCallback: Function, fullscreen?: boolean, animated?: boolean, stretched?: boolean): ViewBase;

    /**
     * Deprecated. Showing view as modal is deprecated.
     * Use showModal method with arguments.
     */
    showModal(): ViewBase;

    /**
     * Closes the current modal view that this page is showing.
     * @param context - Any context you want to pass back to the host when closing the modal view.
     */
    closeModal(context?: any): void;

    public effectiveMinWidth: number;
    public effectiveMinHeight: number;
    public effectiveWidth: number;
    public effectiveHeight: number;
    public effectiveMarginTop: number;
    public effectiveMarginRight: number;
    public effectiveMarginBottom: number;
    public effectiveMarginLeft: number;
    public effectivePaddingTop: number;
    public effectivePaddingRight: number;
    public effectivePaddingBottom: number;
    public effectivePaddingLeft: number;
    public effectiveBorderTopWidth: number;
    public effectiveBorderRightWidth: number;
    public effectiveBorderBottomWidth: number;
    public effectiveBorderLeftWidth: number;

    /**
     * String value used when hooking to loaded event.
     */
    public static loadedEvent: string;

    /**
     * String value used when hooking to unloaded event.
     */
    public static unloadedEvent: string;

    public ios: any;
    public android: any;

    /**
     * returns the native UIViewController.
     */
    public viewController: any;

    /**
     * read-only. If you want to set out-of-band the nativeView use the setNativeView method.
     */
    public nativeViewProtected: any;
    public nativeView: any;
    public bindingContext: any;

    /**
     * Gets the name of the constructor function for this instance. E.g. for a Button class this will return "Button".
     */
    public typeName: string;

    /**
     * Gets the parent view. This property is read-only.
     */
    public readonly parent: ViewBase;

    /**
     * Gets the template parent or the native parent. Sets the template parent.
     */
    public parentNode: ViewBase;

    /**
     * Gets or sets the id for this view.
     */
    public id: string;

    /**
     * Gets or sets the CSS class name for this view.
     */
    public className: string;

    /**
     * Gets owner page. This is a read-only property.
     */
    public readonly page: Page;

    /**
     * Gets the style object associated to this view.
     */
    public readonly style: Style;

    /**
     * Returns true if visibility is set to 'collapse'.
     * Readonly property
     */
    public isCollapsed: boolean;
    public readonly isLoaded: boolean;

    /**
     * Returns the child view with the specified id.
     */
    public getViewById<T extends ViewBase>(id: string): T;

    /**
     * Load view.
     * @param view to load.
     */
    public loadView(view: ViewBase): void;

    /**
     * Unload view.
     * @param view to unload.
     */
    public unloadView(view: ViewBase): void;

    public onLoaded(): void;
    public onUnloaded(): void;
    public onResumeNativeUpdates(): void;

    public bind(options: BindingOptions, source?: Object): void;
    public unbind(property: string): void;

    /**
     * Invalidates the layout of the view and triggers a new layout pass.
     */
    public requestLayout(): void;

    /**
     * Iterates over children of type ViewBase. 
     * @param callback Called for each child of type ViewBase. Iteration stops if this method returns falsy value.
     */
    public eachChild(callback: (child: ViewBase) => boolean): void;

    public _addView(view: ViewBase, atIndex?: number): void;
    /**
     * Method is intended to be overridden by inheritors and used as "protected"
     */
    public _addViewCore(view: ViewBase, atIndex?: number): void;

    public _removeView(view: ViewBase): void;
    /**
     * Method is intended to be overridden by inheritors and used as "protected"
     */
    public _removeViewCore(view: ViewBase): void;
    public _parentChanged(oldParent: ViewBase): void;
    /**
     * Method is intended to be overridden by inheritors and used as "protected"
     */
    public _dialogClosed(): void;
    /**
     * Method is intended to be overridden by inheritors and used as "protected"
     */
    public _onRootViewReset(): void;

    _domId: number;

    _cssState: any /* "ui/styling/style-scope" */;
    /**
     * @private
     * Notifies each child's css state for change, recursively.
     * Either the style scope, className or id properties were changed. 
     */
    _onCssStateChange(): void;

    public cssClasses: Set<string>;
    public cssPseudoClasses: Set<string>;

    public _goToVisualState(state: string): void;
    /**
     * This used to be the way to set attribute values in early {N} versions.
     * Now attributes are expected to be set as plain properties on the view instances.
     * @deprecated
     */
    public _applyXmlAttribute(attribute, value): boolean;
    public setInlineStyle(style: string): void;

    _context: any /* android.content.Context */;

    /** 
     * Setups the UI for ViewBase and all its children recursively.
     * This method should *not* be overridden by derived views.
     */
    _setupUI(context: any /* android.content.Context */, atIndex?: number): void;

    /**
     * Tears down the UI for ViewBase and all its children recursively.
     * This method should *not* be overridden by derived views.
     */
    _tearDownUI(force?: boolean): void;

    /**
     * Creates a native view.
     * Returns either android.view.View or UIView.
     */
    createNativeView(): Object;

    /**
     * Initializes properties/listeners of the native view.
     */
    initNativeView(): void;

    /**
     * Clean up references to the native view.
     */
    disposeNativeView(): void;

    /**
     * Resets properties/listeners set to the native view.
     */
    resetNativeView(): void;

    /**
     * Set the nativeView field performing extra checks and updates to the native properties on the new view.
     * Use in cases where the createNativeView is not suitable.
     * As an example use in item controls where the native parent view will create the native views for child items.
     */
    setNativeView(view: any): void;

    _isAddedToNativeVisualTree: boolean;

    /**
     * Performs the core logic of adding a child view to the native visual tree. Returns true if the view's native representation has been successfully added, false otherwise.
    */
    _addViewToNativeVisualTree(view: ViewBase, atIndex?: number): boolean;
    _removeViewFromNativeVisualTree(view: ViewBase): void;
    _childIndexToNativeChildIndex(index?: number): number;

    /**
     * @protected
     * @unstable
     * A widget can call this method to add a matching css pseudo class.
     */
    public addPseudoClass(name: string): void;

    /**
     * @protected
     * @unstable
     * A widget can call this method to discard matching css pseudo class.
     */
    public deletePseudoClass(name: string): void;

    /**
     * @unstable
     * Ensures a dom-node for this view.
     */
    public ensureDomNode();

    
}

export class Binding {
    constructor(target: ViewBase, options: BindingOptions);
    public bind(source: Object): void;
    public unbind();
}

export const idProperty: Property<ViewBase, string>;
export const classNameProperty: Property<ViewBase, string>;
export const bindingContextProperty: InheritedProperty<ViewBase, any>;

/**
 * Converts string into boolean value.
 * Throws error if value is not 'true' or 'false'.
 */
export function booleanConverter(v: string): boolean;
