/*! Built with http://stenciljs.com */
const { h } = window.PieDemo;

/**
 * A collection of shims that provide minimal functionality of the ES6 collections.
 *
 * These implementations are not meant to be used outside of the ResizeObserver
 * modules as they cover only a limited range of use cases.
 */
/* eslint-disable require-jsdoc, valid-jsdoc */
var MapShim = (function () {
    if (typeof Map !== 'undefined') {
        return Map;
    }
    /**
     * Returns index in provided array that matches the specified key.
     *
     * @param {Array<Array>} arr
     * @param {*} key
     * @returns {number}
     */
    function getIndex(arr, key) {
        var result = -1;
        arr.some(function (entry, index) {
            if (entry[0] === key) {
                result = index;
                return true;
            }
            return false;
        });
        return result;
    }
    return /** @class */ (function () {
        function class_1() {
            this.__entries__ = [];
        }
        Object.defineProperty(class_1.prototype, "size", {
            /**
             * @returns {boolean}
             */
            get: function () {
                return this.__entries__.length;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * @param {*} key
         * @returns {*}
         */
        class_1.prototype.get = function (key) {
            var index = getIndex(this.__entries__, key);
            var entry = this.__entries__[index];
            return entry && entry[1];
        };
        /**
         * @param {*} key
         * @param {*} value
         * @returns {void}
         */
        class_1.prototype.set = function (key, value) {
            var index = getIndex(this.__entries__, key);
            if (~index) {
                this.__entries__[index][1] = value;
            }
            else {
                this.__entries__.push([key, value]);
            }
        };
        /**
         * @param {*} key
         * @returns {void}
         */
        class_1.prototype.delete = function (key) {
            var entries = this.__entries__;
            var index = getIndex(entries, key);
            if (~index) {
                entries.splice(index, 1);
            }
        };
        /**
         * @param {*} key
         * @returns {void}
         */
        class_1.prototype.has = function (key) {
            return !!~getIndex(this.__entries__, key);
        };
        /**
         * @returns {void}
         */
        class_1.prototype.clear = function () {
            this.__entries__.splice(0);
        };
        /**
         * @param {Function} callback
         * @param {*} [ctx=null]
         * @returns {void}
         */
        class_1.prototype.forEach = function (callback, ctx) {
            if (ctx === void 0) { ctx = null; }
            for (var _i = 0, _a = this.__entries__; _i < _a.length; _i++) {
                var entry = _a[_i];
                callback.call(ctx, entry[1], entry[0]);
            }
        };
        return class_1;
    }());
})();

/**
 * Detects whether window and document objects are available in current environment.
 */
var isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined' && window.document === document;

// Returns global object of a current environment.
var global$1 = (function () {
    if (typeof global !== 'undefined' && global.Math === Math) {
        return global;
    }
    if (typeof self !== 'undefined' && self.Math === Math) {
        return self;
    }
    if (typeof window !== 'undefined' && window.Math === Math) {
        return window;
    }
    // eslint-disable-next-line no-new-func
    return Function('return this')();
})();

/**
 * A shim for the requestAnimationFrame which falls back to the setTimeout if
 * first one is not supported.
 *
 * @returns {number} Requests' identifier.
 */
var requestAnimationFrame$1 = (function () {
    if (typeof requestAnimationFrame === 'function') {
        // It's required to use a bounded function because IE sometimes throws
        // an "Invalid calling object" error if rAF is invoked without the global
        // object on the left hand side.
        return requestAnimationFrame.bind(global$1);
    }
    return function (callback) { return setTimeout(function () { return callback(Date.now()); }, 1000 / 60); };
})();

// Defines minimum timeout before adding a trailing call.
var trailingTimeout = 2;
/**
 * Creates a wrapper function which ensures that provided callback will be
 * invoked only once during the specified delay period.
 *
 * @param {Function} callback - Function to be invoked after the delay period.
 * @param {number} delay - Delay after which to invoke callback.
 * @returns {Function}
 */
function throttle (callback, delay) {
    var leadingCall = false, trailingCall = false, lastCallTime = 0;
    /**
     * Invokes the original callback function and schedules new invocation if
     * the "proxy" was called during current request.
     *
     * @returns {void}
     */
    function resolvePending() {
        if (leadingCall) {
            leadingCall = false;
            callback();
        }
        if (trailingCall) {
            proxy();
        }
    }
    /**
     * Callback invoked after the specified delay. It will further postpone
     * invocation of the original function delegating it to the
     * requestAnimationFrame.
     *
     * @returns {void}
     */
    function timeoutCallback() {
        requestAnimationFrame$1(resolvePending);
    }
    /**
     * Schedules invocation of the original function.
     *
     * @returns {void}
     */
    function proxy() {
        var timeStamp = Date.now();
        if (leadingCall) {
            // Reject immediately following calls.
            if (timeStamp - lastCallTime < trailingTimeout) {
                return;
            }
            // Schedule new call to be in invoked when the pending one is resolved.
            // This is important for "transitions" which never actually start
            // immediately so there is a chance that we might miss one if change
            // happens amids the pending invocation.
            trailingCall = true;
        }
        else {
            leadingCall = true;
            trailingCall = false;
            setTimeout(timeoutCallback, delay);
        }
        lastCallTime = timeStamp;
    }
    return proxy;
}

// Minimum delay before invoking the update of observers.
var REFRESH_DELAY = 20;
// A list of substrings of CSS properties used to find transition events that
// might affect dimensions of observed elements.
var transitionKeys = ['top', 'right', 'bottom', 'left', 'width', 'height', 'size', 'weight'];
// Check if MutationObserver is available.
var mutationObserverSupported = typeof MutationObserver !== 'undefined';
/**
 * Singleton controller class which handles updates of ResizeObserver instances.
 */
var ResizeObserverController = /** @class */ (function () {
    /**
     * Creates a new instance of ResizeObserverController.
     *
     * @private
     */
    function ResizeObserverController() {
        /**
         * Indicates whether DOM listeners have been added.
         *
         * @private {boolean}
         */
        this.connected_ = false;
        /**
         * Tells that controller has subscribed for Mutation Events.
         *
         * @private {boolean}
         */
        this.mutationEventsAdded_ = false;
        /**
         * Keeps reference to the instance of MutationObserver.
         *
         * @private {MutationObserver}
         */
        this.mutationsObserver_ = null;
        /**
         * A list of connected observers.
         *
         * @private {Array<ResizeObserverSPI>}
         */
        this.observers_ = [];
        this.onTransitionEnd_ = this.onTransitionEnd_.bind(this);
        this.refresh = throttle(this.refresh.bind(this), REFRESH_DELAY);
    }
    /**
     * Adds observer to observers list.
     *
     * @param {ResizeObserverSPI} observer - Observer to be added.
     * @returns {void}
     */
    ResizeObserverController.prototype.addObserver = function (observer) {
        if (!~this.observers_.indexOf(observer)) {
            this.observers_.push(observer);
        }
        // Add listeners if they haven't been added yet.
        if (!this.connected_) {
            this.connect_();
        }
    };
    /**
     * Removes observer from observers list.
     *
     * @param {ResizeObserverSPI} observer - Observer to be removed.
     * @returns {void}
     */
    ResizeObserverController.prototype.removeObserver = function (observer) {
        var observers = this.observers_;
        var index = observers.indexOf(observer);
        // Remove observer if it's present in registry.
        if (~index) {
            observers.splice(index, 1);
        }
        // Remove listeners if controller has no connected observers.
        if (!observers.length && this.connected_) {
            this.disconnect_();
        }
    };
    /**
     * Invokes the update of observers. It will continue running updates insofar
     * it detects changes.
     *
     * @returns {void}
     */
    ResizeObserverController.prototype.refresh = function () {
        var changesDetected = this.updateObservers_();
        // Continue running updates if changes have been detected as there might
        // be future ones caused by CSS transitions.
        if (changesDetected) {
            this.refresh();
        }
    };
    /**
     * Updates every observer from observers list and notifies them of queued
     * entries.
     *
     * @private
     * @returns {boolean} Returns "true" if any observer has detected changes in
     *      dimensions of it's elements.
     */
    ResizeObserverController.prototype.updateObservers_ = function () {
        // Collect observers that have active observations.
        var activeObservers = this.observers_.filter(function (observer) {
            return observer.gatherActive(), observer.hasActive();
        });
        // Deliver notifications in a separate cycle in order to avoid any
        // collisions between observers, e.g. when multiple instances of
        // ResizeObserver are tracking the same element and the callback of one
        // of them changes content dimensions of the observed target. Sometimes
        // this may result in notifications being blocked for the rest of observers.
        activeObservers.forEach(function (observer) { return observer.broadcastActive(); });
        return activeObservers.length > 0;
    };
    /**
     * Initializes DOM listeners.
     *
     * @private
     * @returns {void}
     */
    ResizeObserverController.prototype.connect_ = function () {
        // Do nothing if running in a non-browser environment or if listeners
        // have been already added.
        if (!isBrowser || this.connected_) {
            return;
        }
        // Subscription to the "Transitionend" event is used as a workaround for
        // delayed transitions. This way it's possible to capture at least the
        // final state of an element.
        document.addEventListener('transitionend', this.onTransitionEnd_);
        window.addEventListener('resize', this.refresh);
        if (mutationObserverSupported) {
            this.mutationsObserver_ = new MutationObserver(this.refresh);
            this.mutationsObserver_.observe(document, {
                attributes: true,
                childList: true,
                characterData: true,
                subtree: true
            });
        }
        else {
            document.addEventListener('DOMSubtreeModified', this.refresh);
            this.mutationEventsAdded_ = true;
        }
        this.connected_ = true;
    };
    /**
     * Removes DOM listeners.
     *
     * @private
     * @returns {void}
     */
    ResizeObserverController.prototype.disconnect_ = function () {
        // Do nothing if running in a non-browser environment or if listeners
        // have been already removed.
        if (!isBrowser || !this.connected_) {
            return;
        }
        document.removeEventListener('transitionend', this.onTransitionEnd_);
        window.removeEventListener('resize', this.refresh);
        if (this.mutationsObserver_) {
            this.mutationsObserver_.disconnect();
        }
        if (this.mutationEventsAdded_) {
            document.removeEventListener('DOMSubtreeModified', this.refresh);
        }
        this.mutationsObserver_ = null;
        this.mutationEventsAdded_ = false;
        this.connected_ = false;
    };
    /**
     * "Transitionend" event handler.
     *
     * @private
     * @param {TransitionEvent} event
     * @returns {void}
     */
    ResizeObserverController.prototype.onTransitionEnd_ = function (_a) {
        var _b = _a.propertyName, propertyName = _b === void 0 ? '' : _b;
        // Detect whether transition may affect dimensions of an element.
        var isReflowProperty = transitionKeys.some(function (key) {
            return !!~propertyName.indexOf(key);
        });
        if (isReflowProperty) {
            this.refresh();
        }
    };
    /**
     * Returns instance of the ResizeObserverController.
     *
     * @returns {ResizeObserverController}
     */
    ResizeObserverController.getInstance = function () {
        if (!this.instance_) {
            this.instance_ = new ResizeObserverController();
        }
        return this.instance_;
    };
    /**
     * Holds reference to the controller's instance.
     *
     * @private {ResizeObserverController}
     */
    ResizeObserverController.instance_ = null;
    return ResizeObserverController;
}());

/**
 * Defines non-writable/enumerable properties of the provided target object.
 *
 * @param {Object} target - Object for which to define properties.
 * @param {Object} props - Properties to be defined.
 * @returns {Object} Target object.
 */
var defineConfigurable = (function (target, props) {
    for (var _i = 0, _a = Object.keys(props); _i < _a.length; _i++) {
        var key = _a[_i];
        Object.defineProperty(target, key, {
            value: props[key],
            enumerable: false,
            writable: false,
            configurable: true
        });
    }
    return target;
});

/**
 * Returns the global object associated with provided element.
 *
 * @param {Object} target
 * @returns {Object}
 */
var getWindowOf = (function (target) {
    // Assume that the element is an instance of Node, which means that it
    // has the "ownerDocument" property from which we can retrieve a
    // corresponding global object.
    var ownerGlobal = target && target.ownerDocument && target.ownerDocument.defaultView;
    // Return the local global object if it's not possible extract one from
    // provided element.
    return ownerGlobal || global$1;
});

// Placeholder of an empty content rectangle.
var emptyRect = createRectInit(0, 0, 0, 0);
/**
 * Converts provided string to a number.
 *
 * @param {number|string} value
 * @returns {number}
 */
function toFloat(value) {
    return parseFloat(value) || 0;
}
/**
 * Extracts borders size from provided styles.
 *
 * @param {CSSStyleDeclaration} styles
 * @param {...string} positions - Borders positions (top, right, ...)
 * @returns {number}
 */
function getBordersSize(styles) {
    var positions = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        positions[_i - 1] = arguments[_i];
    }
    return positions.reduce(function (size, position) {
        var value = styles['border-' + position + '-width'];
        return size + toFloat(value);
    }, 0);
}
/**
 * Extracts paddings sizes from provided styles.
 *
 * @param {CSSStyleDeclaration} styles
 * @returns {Object} Paddings box.
 */
function getPaddings(styles) {
    var positions = ['top', 'right', 'bottom', 'left'];
    var paddings = {};
    for (var _i = 0, positions_1 = positions; _i < positions_1.length; _i++) {
        var position = positions_1[_i];
        var value = styles['padding-' + position];
        paddings[position] = toFloat(value);
    }
    return paddings;
}
/**
 * Calculates content rectangle of provided SVG element.
 *
 * @param {SVGGraphicsElement} target - Element content rectangle of which needs
 *      to be calculated.
 * @returns {DOMRectInit}
 */
function getSVGContentRect(target) {
    var bbox = target.getBBox();
    return createRectInit(0, 0, bbox.width, bbox.height);
}
/**
 * Calculates content rectangle of provided HTMLElement.
 *
 * @param {HTMLElement} target - Element for which to calculate the content rectangle.
 * @returns {DOMRectInit}
 */
function getHTMLElementContentRect(target) {
    // Client width & height properties can't be
    // used exclusively as they provide rounded values.
    var clientWidth = target.clientWidth, clientHeight = target.clientHeight;
    // By this condition we can catch all non-replaced inline, hidden and
    // detached elements. Though elements with width & height properties less
    // than 0.5 will be discarded as well.
    //
    // Without it we would need to implement separate methods for each of
    // those cases and it's not possible to perform a precise and performance
    // effective test for hidden elements. E.g. even jQuery's ':visible' filter
    // gives wrong results for elements with width & height less than 0.5.
    if (!clientWidth && !clientHeight) {
        return emptyRect;
    }
    var styles = getWindowOf(target).getComputedStyle(target);
    var paddings = getPaddings(styles);
    var horizPad = paddings.left + paddings.right;
    var vertPad = paddings.top + paddings.bottom;
    // Computed styles of width & height are being used because they are the
    // only dimensions available to JS that contain non-rounded values. It could
    // be possible to utilize the getBoundingClientRect if only it's data wasn't
    // affected by CSS transformations let alone paddings, borders and scroll bars.
    var width = toFloat(styles.width), height = toFloat(styles.height);
    // Width & height include paddings and borders when the 'border-box' box
    // model is applied (except for IE).
    if (styles.boxSizing === 'border-box') {
        // Following conditions are required to handle Internet Explorer which
        // doesn't include paddings and borders to computed CSS dimensions.
        //
        // We can say that if CSS dimensions + paddings are equal to the "client"
        // properties then it's either IE, and thus we don't need to subtract
        // anything, or an element merely doesn't have paddings/borders styles.
        if (Math.round(width + horizPad) !== clientWidth) {
            width -= getBordersSize(styles, 'left', 'right') + horizPad;
        }
        if (Math.round(height + vertPad) !== clientHeight) {
            height -= getBordersSize(styles, 'top', 'bottom') + vertPad;
        }
    }
    // Following steps can't be applied to the document's root element as its
    // client[Width/Height] properties represent viewport area of the window.
    // Besides, it's as well not necessary as the <html> itself neither has
    // rendered scroll bars nor it can be clipped.
    if (!isDocumentElement(target)) {
        // In some browsers (only in Firefox, actually) CSS width & height
        // include scroll bars size which can be removed at this step as scroll
        // bars are the only difference between rounded dimensions + paddings
        // and "client" properties, though that is not always true in Chrome.
        var vertScrollbar = Math.round(width + horizPad) - clientWidth;
        var horizScrollbar = Math.round(height + vertPad) - clientHeight;
        // Chrome has a rather weird rounding of "client" properties.
        // E.g. for an element with content width of 314.2px it sometimes gives
        // the client width of 315px and for the width of 314.7px it may give
        // 314px. And it doesn't happen all the time. So just ignore this delta
        // as a non-relevant.
        if (Math.abs(vertScrollbar) !== 1) {
            width -= vertScrollbar;
        }
        if (Math.abs(horizScrollbar) !== 1) {
            height -= horizScrollbar;
        }
    }
    return createRectInit(paddings.left, paddings.top, width, height);
}
/**
 * Checks whether provided element is an instance of the SVGGraphicsElement.
 *
 * @param {Element} target - Element to be checked.
 * @returns {boolean}
 */
var isSVGGraphicsElement = (function () {
    // Some browsers, namely IE and Edge, don't have the SVGGraphicsElement
    // interface.
    if (typeof SVGGraphicsElement !== 'undefined') {
        return function (target) { return target instanceof getWindowOf(target).SVGGraphicsElement; };
    }
    // If it's so, then check that element is at least an instance of the
    // SVGElement and that it has the "getBBox" method.
    // eslint-disable-next-line no-extra-parens
    return function (target) { return (target instanceof getWindowOf(target).SVGElement &&
        typeof target.getBBox === 'function'); };
})();
/**
 * Checks whether provided element is a document element (<html>).
 *
 * @param {Element} target - Element to be checked.
 * @returns {boolean}
 */
function isDocumentElement(target) {
    return target === getWindowOf(target).document.documentElement;
}
/**
 * Calculates an appropriate content rectangle for provided html or svg element.
 *
 * @param {Element} target - Element content rectangle of which needs to be calculated.
 * @returns {DOMRectInit}
 */
function getContentRect(target) {
    if (!isBrowser) {
        return emptyRect;
    }
    if (isSVGGraphicsElement(target)) {
        return getSVGContentRect(target);
    }
    return getHTMLElementContentRect(target);
}
/**
 * Creates rectangle with an interface of the DOMRectReadOnly.
 * Spec: https://drafts.fxtf.org/geometry/#domrectreadonly
 *
 * @param {DOMRectInit} rectInit - Object with rectangle's x/y coordinates and dimensions.
 * @returns {DOMRectReadOnly}
 */
function createReadOnlyRect(_a) {
    var x = _a.x, y = _a.y, width = _a.width, height = _a.height;
    // If DOMRectReadOnly is available use it as a prototype for the rectangle.
    var Constr = typeof DOMRectReadOnly !== 'undefined' ? DOMRectReadOnly : Object;
    var rect = Object.create(Constr.prototype);
    // Rectangle's properties are not writable and non-enumerable.
    defineConfigurable(rect, {
        x: x, y: y, width: width, height: height,
        top: y,
        right: x + width,
        bottom: height + y,
        left: x
    });
    return rect;
}
/**
 * Creates DOMRectInit object based on the provided dimensions and the x/y coordinates.
 * Spec: https://drafts.fxtf.org/geometry/#dictdef-domrectinit
 *
 * @param {number} x - X coordinate.
 * @param {number} y - Y coordinate.
 * @param {number} width - Rectangle's width.
 * @param {number} height - Rectangle's height.
 * @returns {DOMRectInit}
 */
function createRectInit(x, y, width, height) {
    return { x: x, y: y, width: width, height: height };
}

/**
 * Class that is responsible for computations of the content rectangle of
 * provided DOM element and for keeping track of it's changes.
 */
var ResizeObservation = /** @class */ (function () {
    /**
     * Creates an instance of ResizeObservation.
     *
     * @param {Element} target - Element to be observed.
     */
    function ResizeObservation(target) {
        /**
         * Broadcasted width of content rectangle.
         *
         * @type {number}
         */
        this.broadcastWidth = 0;
        /**
         * Broadcasted height of content rectangle.
         *
         * @type {number}
         */
        this.broadcastHeight = 0;
        /**
         * Reference to the last observed content rectangle.
         *
         * @private {DOMRectInit}
         */
        this.contentRect_ = createRectInit(0, 0, 0, 0);
        this.target = target;
    }
    /**
     * Updates content rectangle and tells whether it's width or height properties
     * have changed since the last broadcast.
     *
     * @returns {boolean}
     */
    ResizeObservation.prototype.isActive = function () {
        var rect = getContentRect(this.target);
        this.contentRect_ = rect;
        return (rect.width !== this.broadcastWidth ||
            rect.height !== this.broadcastHeight);
    };
    /**
     * Updates 'broadcastWidth' and 'broadcastHeight' properties with a data
     * from the corresponding properties of the last observed content rectangle.
     *
     * @returns {DOMRectInit} Last observed content rectangle.
     */
    ResizeObservation.prototype.broadcastRect = function () {
        var rect = this.contentRect_;
        this.broadcastWidth = rect.width;
        this.broadcastHeight = rect.height;
        return rect;
    };
    return ResizeObservation;
}());

var ResizeObserverEntry = /** @class */ (function () {
    /**
     * Creates an instance of ResizeObserverEntry.
     *
     * @param {Element} target - Element that is being observed.
     * @param {DOMRectInit} rectInit - Data of the element's content rectangle.
     */
    function ResizeObserverEntry(target, rectInit) {
        var contentRect = createReadOnlyRect(rectInit);
        // According to the specification following properties are not writable
        // and are also not enumerable in the native implementation.
        //
        // Property accessors are not being used as they'd require to define a
        // private WeakMap storage which may cause memory leaks in browsers that
        // don't support this type of collections.
        defineConfigurable(this, { target: target, contentRect: contentRect });
    }
    return ResizeObserverEntry;
}());

var ResizeObserverSPI = /** @class */ (function () {
    /**
     * Creates a new instance of ResizeObserver.
     *
     * @param {ResizeObserverCallback} callback - Callback function that is invoked
     *      when one of the observed elements changes it's content dimensions.
     * @param {ResizeObserverController} controller - Controller instance which
     *      is responsible for the updates of observer.
     * @param {ResizeObserver} callbackCtx - Reference to the public
     *      ResizeObserver instance which will be passed to callback function.
     */
    function ResizeObserverSPI(callback, controller, callbackCtx) {
        /**
         * Collection of resize observations that have detected changes in dimensions
         * of elements.
         *
         * @private {Array<ResizeObservation>}
         */
        this.activeObservations_ = [];
        /**
         * Registry of the ResizeObservation instances.
         *
         * @private {Map<Element, ResizeObservation>}
         */
        this.observations_ = new MapShim();
        if (typeof callback !== 'function') {
            throw new TypeError('The callback provided as parameter 1 is not a function.');
        }
        this.callback_ = callback;
        this.controller_ = controller;
        this.callbackCtx_ = callbackCtx;
    }
    /**
     * Starts observing provided element.
     *
     * @param {Element} target - Element to be observed.
     * @returns {void}
     */
    ResizeObserverSPI.prototype.observe = function (target) {
        if (!arguments.length) {
            throw new TypeError('1 argument required, but only 0 present.');
        }
        // Do nothing if current environment doesn't have the Element interface.
        if (typeof Element === 'undefined' || !(Element instanceof Object)) {
            return;
        }
        if (!(target instanceof getWindowOf(target).Element)) {
            throw new TypeError('parameter 1 is not of type "Element".');
        }
        var observations = this.observations_;
        // Do nothing if element is already being observed.
        if (observations.has(target)) {
            return;
        }
        observations.set(target, new ResizeObservation(target));
        this.controller_.addObserver(this);
        // Force the update of observations.
        this.controller_.refresh();
    };
    /**
     * Stops observing provided element.
     *
     * @param {Element} target - Element to stop observing.
     * @returns {void}
     */
    ResizeObserverSPI.prototype.unobserve = function (target) {
        if (!arguments.length) {
            throw new TypeError('1 argument required, but only 0 present.');
        }
        // Do nothing if current environment doesn't have the Element interface.
        if (typeof Element === 'undefined' || !(Element instanceof Object)) {
            return;
        }
        if (!(target instanceof getWindowOf(target).Element)) {
            throw new TypeError('parameter 1 is not of type "Element".');
        }
        var observations = this.observations_;
        // Do nothing if element is not being observed.
        if (!observations.has(target)) {
            return;
        }
        observations.delete(target);
        if (!observations.size) {
            this.controller_.removeObserver(this);
        }
    };
    /**
     * Stops observing all elements.
     *
     * @returns {void}
     */
    ResizeObserverSPI.prototype.disconnect = function () {
        this.clearActive();
        this.observations_.clear();
        this.controller_.removeObserver(this);
    };
    /**
     * Collects observation instances the associated element of which has changed
     * it's content rectangle.
     *
     * @returns {void}
     */
    ResizeObserverSPI.prototype.gatherActive = function () {
        var _this = this;
        this.clearActive();
        this.observations_.forEach(function (observation) {
            if (observation.isActive()) {
                _this.activeObservations_.push(observation);
            }
        });
    };
    /**
     * Invokes initial callback function with a list of ResizeObserverEntry
     * instances collected from active resize observations.
     *
     * @returns {void}
     */
    ResizeObserverSPI.prototype.broadcastActive = function () {
        // Do nothing if observer doesn't have active observations.
        if (!this.hasActive()) {
            return;
        }
        var ctx = this.callbackCtx_;
        // Create ResizeObserverEntry instance for every active observation.
        var entries = this.activeObservations_.map(function (observation) {
            return new ResizeObserverEntry(observation.target, observation.broadcastRect());
        });
        this.callback_.call(ctx, entries, ctx);
        this.clearActive();
    };
    /**
     * Clears the collection of active observations.
     *
     * @returns {void}
     */
    ResizeObserverSPI.prototype.clearActive = function () {
        this.activeObservations_.splice(0);
    };
    /**
     * Tells whether observer has active observations.
     *
     * @returns {boolean}
     */
    ResizeObserverSPI.prototype.hasActive = function () {
        return this.activeObservations_.length > 0;
    };
    return ResizeObserverSPI;
}());

// Registry of internal observers. If WeakMap is not available use current shim
// for the Map collection as it has all required methods and because WeakMap
// can't be fully polyfilled anyway.
var observers = typeof WeakMap !== 'undefined' ? new WeakMap() : new MapShim();
/**
 * ResizeObserver API. Encapsulates the ResizeObserver SPI implementation
 * exposing only those methods and properties that are defined in the spec.
 */
var ResizeObserver = /** @class */ (function () {
    /**
     * Creates a new instance of ResizeObserver.
     *
     * @param {ResizeObserverCallback} callback - Callback that is invoked when
     *      dimensions of the observed elements change.
     */
    function ResizeObserver(callback) {
        if (!(this instanceof ResizeObserver)) {
            throw new TypeError('Cannot call a class as a function.');
        }
        if (!arguments.length) {
            throw new TypeError('1 argument required, but only 0 present.');
        }
        var controller = ResizeObserverController.getInstance();
        var observer = new ResizeObserverSPI(callback, controller, this);
        observers.set(this, observer);
    }
    return ResizeObserver;
}());
// Expose public methods of ResizeObserver.
[
    'observe',
    'unobserve',
    'disconnect'
].forEach(function (method) {
    ResizeObserver.prototype[method] = function () {
        var _a;
        return (_a = observers.get(this))[method].apply(_a, arguments);
    };
});

var index = (function () {
    // Export existing implementation if available.
    if (typeof global$1.ResizeObserver !== 'undefined') {
        return global$1.ResizeObserver;
    }
    return ResizeObserver;
})();

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var classnames = createCommonjsModule(function (module) {
/*!
  Copyright (c) 2017 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/
/* global define */

(function () {

	var hasOwn = {}.hasOwnProperty;

	function classNames () {
		var classes = [];

		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			if (!arg) continue;

			var argType = typeof arg;

			if (argType === 'string' || argType === 'number') {
				classes.push(arg);
			} else if (Array.isArray(arg) && arg.length) {
				var inner = classNames.apply(null, arg);
				if (inner) {
					classes.push(inner);
				}
			} else if (argType === 'object') {
				for (var key in arg) {
					if (hasOwn.call(arg, key) && arg[key]) {
						classes.push(key);
					}
				}
			}
		}

		return classes.join(' ');
	}

	if (module.exports) {
		classNames.default = classNames;
		module.exports = classNames;
	} else {
		window.classNames = classNames;
	}
}());
});

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

var _freeGlobal = freeGlobal;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = _freeGlobal || freeSelf || Function('return this')();

var _root = root;

/** Built-in value references. */
var Symbol = _root.Symbol;

var _Symbol = Symbol;

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

var _getRawTag = getRawTag;

/** Used for built-in method references. */
var objectProto$1 = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString$1 = objectProto$1.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString$1.call(value);
}

var _objectToString = objectToString;

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag$1 = _Symbol ? _Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag$1 && symToStringTag$1 in Object(value))
    ? _getRawTag(value)
    : _objectToString(value);
}

var _baseGetTag = baseGetTag;

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

var isObject_1 = isObject;

/** `Object#toString` result references. */
var asyncTag = '[object AsyncFunction]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    proxyTag = '[object Proxy]';

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject_1(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = _baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

var isFunction_1 = isFunction;

const getEmptyConfigure = () => class extends HTMLElement {
    set model(_) {
    }
};
/**
 *
 * @param {Object<string,string>} elements elements to load from pie cloud service
 * @param {HTMLDocument} doc - the document to load the scripts
 * @param {string} base_url - default base url for cloud service
 */
function loadCloudPies(elements, doc, base_url = 'https://pits-dot-pie-dev-221718.appspot.com/bundles/') {
    const head = doc.getElementsByTagName('head')[0];
    const keys = Object.keys(elements);
    for (const key in keys) {
        const elementName = keys[key];
        const npmPackage = elements[elementName];
        const packageWithoutVersion = npmPackage.replace(/(?<=[a-z])\@(?:.(?!\@))+/g, '');
        const script = doc.createElement('script');
        const onloadFn = (_package => {
            return () => {
                const packages = _package.split('+');
                const elementsName = elementName.split('+');
                packages.forEach((pack, index) => {
                    const pie = window['pie'].default[pack];
                    const initialEl = elementsName[index];
                    const atSymbolPos = initialEl.indexOf('@');
                    const elName = atSymbolPos >= 0 ? initialEl.slice(0, atSymbolPos) : initialEl;
                    console.log('defining elements');
                    if (!customElements.get(elName)) {
                        customElements.define(elName, pie.Element);
                        // This fixes some cases where the pie build service fails
                        pie.Configure = isFunction_1(pie.Configure) ? pie.Configure : getEmptyConfigure();
                        customElements.define(elName + '-config', pie.Configure);
                    }
                });
            };
        })(packageWithoutVersion);
        script.id = elementName;
        script.onload = onloadFn;
        script.src = base_url + npmPackage + '/editor.js';
        head.appendChild(script);
    }
}

var ViewState;
(function (ViewState) {
    ViewState[ViewState["LOADING"] = 0] = "LOADING";
    ViewState[ViewState["READY"] = 1] = "READY";
    ViewState[ViewState["ERROR"] = 2] = "ERROR";
})(ViewState || (ViewState = {}));
class PieDemo {
    constructor() {
        /**
         * Tells the component if it needs to load the elements or not
         */
        this.load = true;
        /**
         * Include an editor in the view
         */
        this.editor = true;
        /**
         * Include an item preview in the view
         */
        this.preview = true;
        /**
         * Include control panel for adjusting player settings.
         */
        this.playerControls = true;
        this.state = ViewState.LOADING;
        this.minHeightAuthoring = 'initial';
        this.studentHeaderWidth = 500;
        this.tabIndex = 0;
        this.currentOption = 'option1';
        this.studSettVisible = false;
        this.env = { mode: 'gather' };
        this.session = {};
        // @Element() private element: HTMLElement
        /**
         * Some functionality
         */
        this.loadPies = (elements) => {
            loadCloudPies(elements, document);
        };
        this.renderAuthoringHolder = () => {
            const ConfigTag = this.pieName + '-config';
            const isCollapsed = this.collapsed === 'authoring';
            return (h("div", { class: classnames('authoring-holder', {
                    collapsed: this.collapsed === 'authoring',
                    toggled: this.isToggled()
                }) },
                h("div", { class: "control-bar" }, this.renderAuthoringHeader()),
                isCollapsed && this.renderCollapsedPanel('Authoring View', this.isToggled()),
                !isCollapsed &&
                    h("div", { ref: el => el && (this.elementParent1 = el), class: "element-holder" },
                        h("div", { class: "element-parent" },
                            h(ConfigTag, { id: "configure", ref: el => (this.configElement = el), model: this.model, configure: this.configure, session: this.session })))));
        };
        this.renderStudentHolder = () => {
            const TagName = this.pieName + '';
            const isCollapsed = this.collapsed === 'student';
            return (h("div", { class: classnames('student-view-holder', {
                    'collapsed': this.collapsed === 'student'
                }) },
                h("div", { class: "control-bar" }, this.renderStudentHeader()),
                isCollapsed && this.renderCollapsedPanel('Student View'),
                !isCollapsed &&
                    h("div", { class: classnames('element-holder', {
                            toggled: this.studSettVisible
                        }) },
                        h("div", { ref: el => el && (this.elementParent2 = el), class: "element-parent", style: {
                                minHeight: `${this.minHeightAuthoring}px`
                            } },
                            h(TagName, { id: "render", ref: el => el && (this.pieElement = el), model: this.pieElementModel, session: this.session })))));
        };
    }
    collapsePanel(name) {
        this.collapsed = this.collapsed === name ? null : name;
    }
    toggleStudentSettings() {
        this.studSettVisible = !this.studSettVisible;
    }
    isToggled() {
        return this.studSettVisible && this.collapsed !== 'student';
    }
    watchPie(newPie) {
        console.log('pie-watch triggered');
        this.package = newPie;
        this.pieName = newPie.substr(newPie.lastIndexOf('/') + 1, newPie.length).split('@')[0];
        if (this.pieName.indexOf('-') < 0) {
            this.pieName = `x-${this.pieName}`;
        }
        customElements.whenDefined(this.pieName).then(async () => {
            // TODO - what if same element reloaded, could elems be redefined? may need to undefine prior?
            const packageWithoutVersion = this.package.replace(/(?<=[a-z])\@(?:.(?!\@))+$/, '');
            this.pieController = window['pie'].default[packageWithoutVersion].controller;
            this.updatePieModelFromController(this.model, this.session, this.env);
            this.state = ViewState.READY;
        });
        if (this.load) {
            loadCloudPies({ [this.pieName]: this.package }, document);
        }
    }
    async updateModel(newModel) {
        this.configModel = newModel;
    }
    async updateConfigure(newConfigure) {
        this.configureObject = newConfigure;
    }
    async watchConfigModel(newModel) {
        if (this.configElement)
            this.configElement.model = newModel;
        this.updatePieModelFromController(newModel, this.session, this.env);
    }
    async watchConfigureObject(newConfigure) {
        if (this.configElement)
            this.configElement.configure = newConfigure;
    }
    async updatePieModelFromController(model, session, env) {
        if (this.pieController && this.pieController.model) {
            this.pieElementModel = await this.pieController.model(model, session, env);
            if (this.pieElement) {
                this.pieElement.model = this.pieElementModel;
            }
        }
    }
    watchPieElement(pieElement) {
        if (pieElement && !pieElement.model) {
            pieElement.model = this.model;
            pieElement.configure = this.configureObject;
        }
    }
    watchPieElementModel(newModel) {
        if (this.pieElement) {
            this.pieElement.model = newModel;
            this.pieElement.configure = this.configureObject;
        }
    }
    watchResizerObserver(current, previous) {
        if (current) {
            this.resizeObserver.observe(current);
        }
        else {
            this.resizeObserver.unobserve(previous);
        }
    }
    watchElementParent1(current) {
        if (current) {
            this.mutationObserver.observe(current, { attributes: true, childList: true, subtree: true });
        }
        else {
            this.mutationObserver.disconnect();
        }
    }
    watchElementParent2(current) {
        if (current) {
            this.mutationObserver.observe(current, { attributes: true, childList: true, subtree: true });
        }
        else {
            this.mutationObserver.disconnect();
        }
    }
    componentWillLoad() {
        console.log('component will load ... ');
        this.watchPie(this.pie);
        this.resizeObserver = new index(() => {
            if (this.studentHeader) {
                this.studentHeaderWidth = this.studentHeader.offsetWidth;
            }
        });
        this.mutationObserver = new MutationObserver(() => {
            this.handleElementParentResize();
        });
        if (this.model) {
            this.updateModel(this.model);
        }
        if (this.configure) {
            this.updateConfigure(this.configure);
        }
    }
    handleElementResize(el) {
        let minHeight = 'initial';
        const navigateNode = (el) => {
            if (el.nodeType === 1) {
                const allStyle = getComputedStyle(el);
                if (allStyle.position === 'absolute') {
                    const currentHeight = el.offsetTop + el.offsetHeight;
                    if (minHeight === 'initial' || currentHeight > minHeight) {
                        minHeight = currentHeight;
                    }
                }
                if (el.childNodes.length > 0) {
                    el.childNodes.forEach(ch => navigateNode(ch));
                }
            }
        };
        navigateNode(el);
        this.minHeightAuthoring = minHeight;
    }
    handleElementParentResize() {
        if (this.elementParent1) {
            this.handleElementResize(this.elementParent1);
        }
        if (this.elementParent2) {
            this.handleElementResize(this.elementParent2);
        }
    }
    wachConfigElement(newEl) {
        newEl && newEl.addEventListener('model.updated', (event) => {
            console.log('model.updated');
            this.configModel = event.detail && event.detail.update;
            this.updatePieModelFromController(this.configModel, this.session, this.env);
        });
    }
    setMode(mode) {
        this.env['mode'] = mode;
        this.updatePieModelFromController(this.configModel, this.session, this.env);
    }
    setOption(option) {
        this.currentOption = option;
    }
    customCheckBox({ label, checked, value, action = undefined }) {
        return (h("label", { class: "custom-checkbox", onClick: () => action.call(this, value) },
            h("i", { class: "material-icons" }, checked ? 'radio_button_checked' : 'radio_button_unchecked'),
            h("span", null, label)));
    }
    renderHeaderTitleInfo({ title, description, options = undefined }) {
        return (h("div", { class: "header-title" },
            h("div", { class: "title-info" },
                h("h4", null, title),
                options &&
                    options.map((opt) => (h("span", { class: "option" },
                        h("i", { class: "fa fa-circle" }),
                        opt)))),
            h("span", null, description)));
    }
    renderAuthoringHeader() {
        return (h("div", { class: classnames('authoring-header', {
                collapsed: this.collapsed === 'authoring'
            }) },
            this.renderHeaderTitleInfo({
                title: 'Authoring View',
                description: 'The view an author sees when configuring this interaction.'
            }),
            h("i", { class: "material-icons collapse-icon", onClick: () => this.collapsePanel('student') }, this.collapsed === 'student' ? 'format_indent_decrease' : 'format_indent_increase')));
    }
    ;
    renderRoleConfigContainer() {
        return (h("div", { class: "roles-settings" },
            h("h5", null, "Role"),
            h("div", { class: "roles-options" },
                this.customCheckBox({
                    label: 'Student',
                    checked: this.currentOption === 'student',
                    value: 'student',
                    action: this.setOption
                }),
                this.customCheckBox({
                    label: 'Instructor',
                    checked: this.currentOption === 'instructor',
                    value: 'instructor',
                    action: this.setOption
                }))));
    }
    ;
    renderModeConfigContainer() {
        return (h("div", { class: "modes-settings" },
            h("h5", null, "Mode"),
            h("div", { class: "modes-options" },
                this.customCheckBox({
                    label: 'Gather',
                    checked: this.env['mode'] === 'gather',
                    value: 'gather',
                    action: this.setMode
                }),
                this.customCheckBox({
                    label: 'View',
                    checked: this.env['mode'] === 'view',
                    value: 'view',
                    action: this.setMode
                }),
                this.customCheckBox({
                    label: 'Evaluate',
                    checked: this.env['mode'] === 'evaluate',
                    value: 'evaluate',
                    action: this.setMode
                }))));
    }
    ;
    renderSettingsContainer() {
        return (h("div", { class: "settings-tab-container" },
            this.renderModeConfigContainer(),
            this.renderRoleConfigContainer()));
    }
    ;
    renderBottomContent() {
        return (h("div", { class: "tabs-container" },
            h("div", { class: "tabs" },
                h("div", { class: classnames('tab', {
                        selected: this.tabIndex === 0
                    }), onClick: () => this.tabIndex = 0 }, "Settings"),
                h("div", { class: classnames('tab', {
                        selected: this.tabIndex === 1
                    }), onClick: () => this.tabIndex = 1 }, "Embed")),
            h("span", { class: "selected-line", style: {
                    left: `${this.tabIndex * 100}px`
                } }),
            h("div", { class: "tab-content" }, this.tabIndex === 0 && this.renderSettingsContainer())));
    }
    renderStudentHeader() {
        return (h("div", { ref: el => (this.studentHeader = el), class: classnames('student-view-header', {
                collapsed: this.collapsed === 'student',
                toggled: this.isToggled()
            }) },
            h("div", { class: "topContent" },
                this.renderHeaderTitleInfo({
                    title: 'Student view',
                    description: 'The view a student (or instructor) sees when entering or reviewing the interaction.',
                    options: [
                        this.env['mode'],
                        this.currentOption
                    ]
                }),
                this.studentHeaderWidth >= 800 &&
                    h("span", null, "Toggle Settings"),
                h("i", { class: classnames('material-icons', 'toggle-icon', {
                        toggled: this.isToggled()
                    }), onClick: () => this.toggleStudentSettings() }, this.studSettVisible ? 'toggle_on' : 'toggle_off'),
                h("i", { class: "material-icons collapse-icon", onClick: () => this.collapsePanel('authoring') }, this.collapsed === 'authoring' ? 'format_indent_increase' : 'format_indent_decrease')),
            h("div", { class: "bottomContent" }, this.renderBottomContent())));
    }
    renderControlBar() {
        return (h("div", { class: "control-bar" },
            this.renderAuthoringHeader(),
            this.renderStudentHeader()));
    }
    ;
    renderCollapsedPanel(title, toggled = undefined) {
        return (h("div", { class: classnames('collapsed-panel', {
                toggled: toggled
            }) },
            h("span", null, title)));
    }
    ;
    render() {
        switch (this.state) {
            case ViewState.LOADING:
                return h("div", { id: "loading" }, "Loading...");
            case ViewState.ERROR:
                return h("div", { id: "error" }, "Error...");
            case ViewState.READY:
                return (h("div", { class: "root" },
                    h("div", { class: "config-holder" },
                        this.renderAuthoringHolder(),
                        h("span", { class: "divider" }),
                        this.renderStudentHolder())));
        }
    }
    static get is() { return "pie-demo"; }
    static get properties() { return {
        "collapsed": {
            "state": true
        },
        "configElement": {
            "state": true,
            "watchCallbacks": ["wachConfigElement"]
        },
        "configModel": {
            "state": true,
            "watchCallbacks": ["watchConfigModel"]
        },
        "configure": {
            "type": "Any",
            "attr": "configure",
            "watchCallbacks": ["updateConfigure"]
        },
        "configureObject": {
            "state": true,
            "watchCallbacks": ["watchConfigureObject"]
        },
        "currentOption": {
            "state": true
        },
        "editor": {
            "type": Boolean,
            "attr": "editor"
        },
        "elementParent1": {
            "state": true,
            "watchCallbacks": ["watchElementParent1"]
        },
        "elementParent2": {
            "state": true,
            "watchCallbacks": ["watchElementParent2"]
        },
        "env": {
            "state": true
        },
        "load": {
            "type": Boolean,
            "attr": "load"
        },
        "loadPies": {
            "type": "Any",
            "attr": "load-pies"
        },
        "minHeightAuthoring": {
            "state": true
        },
        "model": {
            "type": "Any",
            "attr": "model",
            "watchCallbacks": ["updateModel"]
        },
        "mutationObserver": {
            "state": true
        },
        "package": {
            "state": true
        },
        "pie": {
            "type": String,
            "attr": "pie",
            "watchCallbacks": ["watchPie"]
        },
        "pieController": {
            "state": true
        },
        "pieElement": {
            "state": true,
            "watchCallbacks": ["watchPieElement"]
        },
        "pieElementModel": {
            "state": true,
            "watchCallbacks": ["watchPieElementModel"]
        },
        "pieName": {
            "state": true
        },
        "playerControls": {
            "type": Boolean,
            "attr": "player-controls"
        },
        "preview": {
            "type": Boolean,
            "attr": "preview"
        },
        "resizeObserver": {
            "state": true
        },
        "session": {
            "state": true
        },
        "state": {
            "state": true
        },
        "studentHeader": {
            "state": true,
            "watchCallbacks": ["watchResizerObserver"]
        },
        "studentHeaderWidth": {
            "state": true
        },
        "studSettVisible": {
            "state": true
        },
        "tabIndex": {
            "state": true
        }
    }; }
    static get style() { return "\@import url(\"https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css\");\n\@import url('https://fonts.googleapis.com/css?family=Roboto');\n\@import url('https://fonts.googleapis.com/icon?family=Material+Icons');\n\nhtml, body {\n    height: 100%;\n    margin: 0;\n    padding: 0;\n}\n\n*:not(i) {\n    font-family: Roboto, serif !important;\n}\n\n.root {\n    background-color: #3f51b5;\n    display: -ms-flexbox;\n    display: flex;\n    -ms-flex-direction: column;\n    flex-direction: column;\n    max-height: 100%;\n    height: 100%;\n}\n\n.control-bar {\n    color: grey;\n    display: -ms-flexbox;\n    display: flex;\n    font-size: 16px;\n    font-weight: bold;\n    min-height: 76px;\n    -ms-flex-pack: justify;\n    justify-content: space-between;\n    width: 100%;\n}\n\n.control-bar .collapse-icon {\n    cursor: pointer;\n    margin-right: 22px;\n}\n\n.control-bar .toggle-icon {\n    cursor: pointer;\n    margin-right: 20px;\n}\n\n.control-bar .toggle-icon.toggled {\n    color: #f9a825;\n}\n\n.control-bar .authoring-header {\n    background: #fff;\n    -ms-flex-align: center;\n    align-items: center;\n    display: -ms-flexbox;\n    display: flex;\n    -ms-flex: 1;\n    flex: 1;\n    height: 76px;\n    -ms-flex-pack: center;\n    justify-content: center;\n    position: relative;\n    border-right: 2px solid #ebebeb;\n}\n\n.control-bar .header-title {\n    display: -ms-flexbox;\n    display: flex;\n    -ms-flex: 1;\n    flex: 1;\n    -ms-flex-direction: column;\n    flex-direction: column;\n    margin-left: 24px;\n}\n\n.control-bar .header-title .title-info {\n    display: -ms-flexbox;\n    display: flex;\n    -ms-flex-pack: start;\n    justify-content: flex-start;\n}\n\n.control-bar .header-title .title-info .option {\n    margin-right: 5px;\n    text-transform: uppercase;\n}\n\n.control-bar .header-title .title-info i {\n    font-size: 4px;\n    margin-right: 5px;\n    vertical-align: middle;\n}\n\n.control-bar .header-title span {\n    font-size: 12px;\n    font-weight: 300;\n    line-height: 1.5;\n    color: rgba(0, 0, 0, 0.56);\n}\n\n.control-bar .header-title .title-info h4,\n.control-bar .header-title .title-info h4 {\n    color: rgba(0, 0, 0, 0.87);\n    font-size: 16px;\n    letter-spacing: 3px;\n    margin: 0 8px 4px 0;\n    text-align: left;\n    text-transform: uppercase;\n}\n\n.control-bar .student-view-header.collapsed,\n.control-bar .authoring-header.collapsed {\n    max-width: 56px;\n}\n\n.control-bar .authoring-header.collapsed .header-title,\n.control-bar .student-view-header.collapsed .header-title {\n    display: none;\n}\n\n.control-bar .authoring-header.collapsed i,\n.control-bar .student-view-header.collapsed i {\n    margin: 0;\n}\n\n.control-bar .student-view-header.collapsed .toggle-icon {\n    display: none;\n}\n\n.control-bar .student-view-header {\n    background: #fff;\n    -ms-flex: 1 0 0px;\n    flex: 1 0 0;\n    height: 76px;\n}\n\n.control-bar .student-view-header .bottomContent {\n    display: none;\n}\n\n.control-bar .student-view-header .bottomContent .tabs-container {\n    display: -ms-flexbox;\n    display: flex;\n    -ms-flex-direction: column;\n    flex-direction: column;\n    position: relative;\n}\n\n.control-bar .student-view-header .bottomContent .tabs-container .tabs {\n    border-bottom: 4px solid #eeeeee;\n    display: -ms-flexbox;\n    display: flex;\n    -ms-flex-direction: row;\n    flex-direction: row;\n    height: 48px;\n    -ms-flex-pack: start;\n    justify-content: flex-start;\n}\n\n.control-bar .student-view-header .bottomContent .tabs-container .tabs .tab {\n    cursor: pointer;\n    min-width: 100px;\n    height: 48px;\n    line-height: 48px;\n    text-align: center;\n}\n\n.control-bar .student-view-header .bottomContent .tabs-container .selected-line {\n    background-color: #3f51b5;\n    bottom: 4px;\n    height: 4px;\n    position: absolute;\n    top: 48px;\n    -webkit-transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;\n    transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;\n    width: 100px;\n}\n\n.control-bar .student-view-header .bottomContent .tabs-container .tab-content {\n    height: 78px;\n}\n\n.control-bar .student-view-header.toggled {\n    height: 210px;\n}\n\n.control-bar .student-view-header.toggled .bottomContent {\n    display: block;\n    height: 134px;\n}\n\n.control-bar .student-view-header.toggled .topContent {\n    height: 76px;\n}\n\n.control-bar .student-view-header .topContent {\n    -ms-flex-align: center;\n    align-items: center;\n    display: -ms-flexbox;\n    display: flex;\n    -ms-flex-pack: center;\n    justify-content: center;\n    height: 100%;\n}\n\n.control-bar .student-view-header .topContent span {\n    font-size: 12px;\n    margin-right: 10px;\n}\n\n.control-bar .student-view-header .topContent h4 {\n    margin-bottom: 10px;\n}\n\n.control-bar .student-view-header .bottomContent {\n    height: 126px;\n}\n\n.control-bar .student-view-header .bottomContent .settings-tab-container {\n    background-color: #fafafa;\n    -ms-flex-align: start;\n    align-items: flex-start;\n    display: -ms-flexbox;\n    display: flex;\n    -ms-flex-wrap: wrap;\n    flex-wrap: wrap;\n    height: 100%;\n    -ms-flex-pack: start;\n    justify-content: flex-start;\n    padding-left: 20px;\n    width: 100%;\n}\n\n.control-bar .student-view-header .bottomContent .settings-tab-container .roles-settings,\n.control-bar .student-view-header .bottomContent .settings-tab-container .modes-settings {\n    -ms-flex-item-align: center;\n    align-self: center;\n}\n\n.control-bar .student-view-header .bottomContent .settings-tab-container .roles-settings h5,\n.control-bar .student-view-header .bottomContent .settings-tab-container .modes-settings h5 {\n    font-size: 12px;\n    margin: 0 0 8px 0;\n}\n\n.control-bar .student-view-header .bottomContent .settings-tab-container .roles-settings .roles-options,\n.control-bar .student-view-header .bottomContent .settings-tab-container .modes-settings .modes-options {\n    -ms-flex-align: center;\n    align-items: center;\n    display: -ms-flexbox;\n    display: flex;\n    -ms-flex-pack: center;\n    justify-content: center;\n}\n\n.control-bar .student-view-header .bottomContent .settings-tab-container .roles-settings .roles-options > *,\n.control-bar .student-view-header .bottomContent .settings-tab-container .modes-settings .modes-options > * {\n    margin-right: 18px;\n}\n\n.config-holder {\n    background-color: #3f51b5;\n    display: -ms-flexbox;\n    display: flex;\n    -ms-flex: 1;\n    flex: 1;\n    height: 100%;\n    width: 100%;\n}\n\n.config-holder .element-holder {\n    position: absolute;\n    top: 76px;\n    left: 0;\n    width: 96%;\n    overflow: scroll;\n\n    border: 16px solid #3f51b5;\n    -ms-flex: 1;\n    flex: 1;\n    height: calc(100% - 108px);\n}\n\n.config-holder .element-holder.toggled {\n    top: 210px;\n}\n\n.config-holder .element-parent {\n    background: #fff;\n    border-radius: 4px;\n    overflow: scroll;\n    padding: 20px;\n    position: relative;\n}\n\n.config-holder .collapsed-panel {\n    -ms-flex-pack: center;\n    justify-content: center;\n    background: #fff;\n    display: -ms-flexbox;\n    display: flex;\n    color: #707070;\n    max-width: 56px;\n    -ms-flex: 1;\n    flex: 1;\n}\n\n.config-holder .collapsed-panel span {\n    line-height: 1.83;\n    text-orientation: upright;\n    text-transform: uppercase;\n    -webkit-writing-mode: tb-rl;\n    -ms-writing-mode: tb-rl;\n    writing-mode: tb-rl;\n}\n\n.config-holder .authoring-holder {\n    /*background: #fff;*/\n    display: -ms-flexbox;\n    display: flex;\n    -ms-flex-direction: column;\n    flex-direction: column;\n    -ms-flex: 1 0 0px;\n    flex: 1 0 0;\n    position: relative;\n}\n\n.config-holder .authoring-holder.collapsed {\n    max-width: 56px;\n}\n\n.toggle-button {\n    background-color: lightgrey;\n    border: none;\n    cursor: pointer;\n    outline: none;\n}\n\n.divider {\n    background: #2336a0;\n    -ms-flex: 1;\n    flex: 1;\n    max-width: 2px !important;\n    z-index: 9;\n}\n\n.config-holder .student-view-holder {\n    display: -ms-flexbox;\n    display: flex;\n    -ms-flex: 1 0 0px;\n    flex: 1 0 0;\n    -ms-flex-direction: column;\n    flex-direction: column;\n    position: relative;\n}\n\n.config-holder .student-view-holder.collapsed {\n    max-width: 56px;\n}\n\n.custom-checkbox {\n    display: -ms-inline-flexbox;\n    display: inline-flex;\n    -ms-flex-align: center;\n    align-items: center;\n}\n\n.custom-checkbox i {\n    color: #3f51b5;\n    margin-right: 8px;\n}\n\n/* Overrides */\n[class*=MuiCheckbox-checked] {\n    color: green !important;\n}"; }
}

export { PieDemo };
