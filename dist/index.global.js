/*!
 * @vueuse/motion v1.6.0
 * (c) 2021
 * @license MIT
 */
var VueuseMotion = (function (exports, vueDemi, core, shared, popmotion) {
  'use strict'

  const motionState = {}

  /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

  var __assign = function () {
    __assign =
      Object.assign ||
      function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i]
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p]
        }
        return t
      }
    return __assign.apply(this, arguments)
  }

  function __rest(s, e) {
    var t = {}
    for (var p in s)
      if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p]
    if (s != null && typeof Object.getOwnPropertySymbols === 'function')
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (
          e.indexOf(p[i]) < 0 &&
          Object.prototype.propertyIsEnumerable.call(s, p[i])
        )
          t[p[i]] = s[p[i]]
      }
    return t
  }

  function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value)
          })
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value))
        } catch (e) {
          reject(e)
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value))
        } catch (e) {
          reject(e)
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected)
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next())
    })
  }

  var defaultTimestep = (1 / 60) * 1000
  var getCurrentTime =
    typeof performance !== 'undefined'
      ? function () {
          return performance.now()
        }
      : function () {
          return Date.now()
        }
  var onNextFrame =
    typeof window !== 'undefined'
      ? function (callback) {
          return window.requestAnimationFrame(callback)
        }
      : function (callback) {
          return setTimeout(function () {
            return callback(getCurrentTime())
          }, defaultTimestep)
        }

  function createRenderStep(runNextFrame) {
    var toRun = []
    var toRunNextFrame = []
    var numToRun = 0
    var isProcessing = false
    var toKeepAlive = new WeakSet()
    var step = {
      schedule: function (callback, keepAlive, immediate) {
        if (keepAlive === void 0) {
          keepAlive = false
        }
        if (immediate === void 0) {
          immediate = false
        }
        var addToCurrentFrame = immediate && isProcessing
        var buffer = addToCurrentFrame ? toRun : toRunNextFrame
        if (keepAlive) toKeepAlive.add(callback)
        if (buffer.indexOf(callback) === -1) {
          buffer.push(callback)
          if (addToCurrentFrame && isProcessing) numToRun = toRun.length
        }
        return callback
      },
      cancel: function (callback) {
        var index = toRunNextFrame.indexOf(callback)
        if (index !== -1) toRunNextFrame.splice(index, 1)
        toKeepAlive.delete(callback)
      },
      process: function (frameData) {
        var _a
        isProcessing = true
        ;(_a = [toRunNextFrame, toRun]),
          (toRun = _a[0]),
          (toRunNextFrame = _a[1])
        toRunNextFrame.length = 0
        numToRun = toRun.length
        if (numToRun) {
          for (var i = 0; i < numToRun; i++) {
            var callback = toRun[i]
            callback(frameData)
            if (toKeepAlive.has(callback)) {
              step.schedule(callback)
              runNextFrame()
            }
          }
        }
        isProcessing = false
      },
    }
    return step
  }

  var maxElapsed = 40
  var useDefaultElapsed = true
  var runNextFrame = false
  var isProcessing = false
  var frame = {
    delta: 0,
    timestamp: 0,
  }
  var stepsOrder = ['read', 'update', 'preRender', 'render', 'postRender']
  var steps = /*#__PURE__*/ stepsOrder.reduce(function (acc, key) {
    acc[key] = createRenderStep(function () {
      return (runNextFrame = true)
    })
    return acc
  }, {})
  var sync = /*#__PURE__*/ stepsOrder.reduce(function (acc, key) {
    var step = steps[key]
    acc[key] = function (process, keepAlive, immediate) {
      if (keepAlive === void 0) {
        keepAlive = false
      }
      if (immediate === void 0) {
        immediate = false
      }
      if (!runNextFrame) startLoop()
      return step.schedule(process, keepAlive, immediate)
    }
    return acc
  }, {})
  var processStep = function (stepId) {
    return steps[stepId].process(frame)
  }
  var processFrame = function (timestamp) {
    runNextFrame = false
    frame.delta = useDefaultElapsed
      ? defaultTimestep
      : Math.max(Math.min(timestamp - frame.timestamp, maxElapsed), 1)
    frame.timestamp = timestamp
    isProcessing = true
    stepsOrder.forEach(processStep)
    isProcessing = false
    if (runNextFrame) {
      useDefaultElapsed = false
      onNextFrame(processFrame)
    }
  }
  var startLoop = function () {
    runNextFrame = true
    useDefaultElapsed = true
    if (!isProcessing) onNextFrame(processFrame)
  }
  var getFrameData = function () {
    return frame
  }

  /**
   * A generic subscription manager.
   */
  class SubscriptionManager {
    constructor() {
      this.subscriptions = new Set()
    }
    add(handler) {
      this.subscriptions.add(handler)
      return () => void this.subscriptions.delete(handler)
    }
    notify(
      /**
       * Using ...args would be preferable but it's array creation and this
       * might be fired every frame.
       */
      a,
      b,
      c,
    ) {
      if (!this.subscriptions.size) return
      for (const handler of this.subscriptions) {
        handler(a, b, c)
      }
    }
    clear() {
      this.subscriptions.clear()
    }
  }

  const isFloat = (value) => {
    return !isNaN(parseFloat(value))
  }
  /**
   * `MotionValue` is used to track the state and velocity of motion values.
   */
  class MotionValue {
    /**
     * @param init - The initiating value
     * @param config - Optional configuration options
     */
    constructor(init) {
      /**
       * Duration, in milliseconds, since last updating frame.
       */
      this.timeDelta = 0
      /**
       * Timestamp of the last time this `MotionValue` was updated.
       */
      this.lastUpdated = 0
      /**
       * Functions to notify when the `MotionValue` updates.
       */
      this.updateSubscribers = new SubscriptionManager()
      /**
       * Tracks whether this value can output a velocity.
       */
      this.canTrackVelocity = false
      /**
       * Update and notify `MotionValue` subscribers.
       *
       * @param v
       * @param render
       */
      this.updateAndNotify = (v) => {
        // Update values
        this.prev = this.current
        this.current = v
        // Get frame data
        const { delta, timestamp } = getFrameData()
        // Update timestamp
        if (this.lastUpdated !== timestamp) {
          this.timeDelta = delta
          this.lastUpdated = timestamp
        }
        // Schedule velocity check post frame render
        sync.postRender(this.scheduleVelocityCheck)
        // Update subscribers
        this.updateSubscribers.notify(this.current)
      }
      /**
       * Schedule a velocity check for the next frame.
       */
      this.scheduleVelocityCheck = () => sync.postRender(this.velocityCheck)
      /**
       * Updates `prev` with `current` if the value hasn't been updated this frame.
       * This ensures velocity calculations return `0`.
       */
      this.velocityCheck = ({ timestamp }) => {
        if (!this.canTrackVelocity)
          this.canTrackVelocity = isFloat(this.current)
        if (timestamp !== this.lastUpdated) {
          this.prev = this.current
        }
      }
      this.prev = this.current = init
      this.canTrackVelocity = isFloat(this.current)
    }
    /**
     * Adds a function that will be notified when the `MotionValue` is updated.
     *
     * It returns a function that, when called, will cancel the subscription.
     */
    onChange(subscription) {
      return this.updateSubscribers.add(subscription)
    }
    clearListeners() {
      this.updateSubscribers.clear()
    }
    /**
     * Sets the state of the `MotionValue`.
     *
     * @param v
     * @param render
     */
    set(v) {
      this.updateAndNotify(v)
    }
    /**
     * Returns the latest state of `MotionValue`
     *
     * @returns - The latest state of `MotionValue`
     */
    get() {
      return this.current
    }
    /**
     * Get previous value.
     *
     * @returns - The previous latest state of `MotionValue`
     */
    getPrevious() {
      return this.prev
    }
    /**
     * Returns the latest velocity of `MotionValue`
     *
     * @returns - The latest velocity of `MotionValue`. Returns `0` if the state is non-numerical.
     */
    getVelocity() {
      // This could be isFloat(this.prev) && isFloat(this.current), but that would be wasteful
      return this.canTrackVelocity
        ? // These casts could be avoided if parseFloat would be typed better
          popmotion.velocityPerSecond(
            parseFloat(this.current) - parseFloat(this.prev),
            this.timeDelta,
          )
        : 0
    }
    /**
     * Registers a new animation to control this `MotionValue`. Only one
     * animation can drive a `MotionValue` at one time.
     */
    start(animation) {
      this.stop()
      return new Promise((resolve) => {
        const { stop } = animation(resolve)
        this.stopAnimation = stop
      }).then(() => this.clearAnimation())
    }
    /**
     * Stop the currently active animation.
     */
    stop() {
      if (this.stopAnimation) this.stopAnimation()
      this.clearAnimation()
    }
    /**
     * Returns `true` if this value is currently animating.
     */
    isAnimating() {
      return !!this.stopAnimation
    }
    /**
     * Clear the current animation reference.
     */
    clearAnimation() {
      this.stopAnimation = null
    }
    /**
     * Destroy and clean up subscribers to this `MotionValue`.
     */
    destroy() {
      this.updateSubscribers.clear()
      this.stop()
    }
  }
  function getMotionValue(init) {
    return new MotionValue(init)
  }

  const { isArray } = Array
  function useMotionValues() {
    const motionValues = {}
    const stop = (keys) => {
      // Destroy key closure
      const destroyKey = (key) => {
        if (!motionValues[key]) return
        motionValues[key].stop()
        motionValues[key].destroy()
        vueDemi.del(motionValues, key)
      }
      // Check if keys argument is defined
      if (keys) {
        if (isArray(keys)) {
          // If `keys` are an array, loop on specified keys and destroy them
          keys.forEach(destroyKey)
        } else {
          // If `keys` is a string, destroy the specified one
          destroyKey(keys)
        }
      } else {
        // No keys specified, destroy all animations
        Object.keys(motionValues).forEach(destroyKey)
      }
    }
    const get = (key, from, target) => {
      if (motionValues[key]) return motionValues[key]
      // Create motion value
      const motionValue = getMotionValue(from)
      // Set motion properties mapping
      motionValue.onChange((v) => {
        vueDemi.set(target, key, v)
      })
      // Set instance motion value
      vueDemi.set(motionValues, key, motionValue)
      return motionValue
    }
    // Ensure everything is cleared on unmount
    shared.tryOnUnmounted(stop)
    return {
      motionValues,
      get,
      stop,
    }
  }

  var clamp = function (min, max) {
    return function (v) {
      return Math.max(Math.min(v, max), min)
    }
  }
  var sanitize = function (v) {
    return v % 1 ? Number(v.toFixed(5)) : v
  }
  var floatRegex = /(-)?([\d]*\.?[\d])+/g
  var colorRegex =
    /(#[0-9a-f]{6}|#[0-9a-f]{3}|#(?:[0-9a-f]{2}){2,4}|(rgb|hsl)a?\((-?[\d\.]+%?[,\s]+){2,3}\s*\/*\s*[\d\.]+%?\))/gi
  var singleColorRegex =
    /^(#[0-9a-f]{3}|#(?:[0-9a-f]{2}){2,4}|(rgb|hsl)a?\((-?[\d\.]+%?[,\s]+){2,3}\s*\/*\s*[\d\.]+%?\))$/i
  function isString(v) {
    return typeof v === 'string'
  }

  var number = {
    test: function (v) {
      return typeof v === 'number'
    },
    parse: parseFloat,
    transform: function (v) {
      return v
    },
  }
  var alpha = __assign(__assign({}, number), { transform: clamp(0, 1) })
  var scale = __assign(__assign({}, number), { default: 1 })

  var createUnitType = function (unit) {
    return {
      test: function (v) {
        return isString(v) && v.endsWith(unit) && v.split(' ').length === 1
      },
      parse: parseFloat,
      transform: function (v) {
        return '' + v + unit
      },
    }
  }
  var degrees = createUnitType('deg')
  var percent = createUnitType('%')
  var px = createUnitType('px')
  var progressPercentage = __assign(__assign({}, percent), {
    parse: function (v) {
      return percent.parse(v) / 100
    },
    transform: function (v) {
      return percent.transform(v * 100)
    },
  })

  var isColorString = function (type, testProp) {
    return function (v) {
      return Boolean(
        (isString(v) && singleColorRegex.test(v) && v.startsWith(type)) ||
          (testProp && Object.prototype.hasOwnProperty.call(v, testProp)),
      )
    }
  }
  var splitColor = function (aName, bName, cName) {
    return function (v) {
      var _a
      if (!isString(v)) return v
      var _b = v.match(floatRegex),
        a = _b[0],
        b = _b[1],
        c = _b[2],
        alpha = _b[3]
      return (
        (_a = {}),
        (_a[aName] = parseFloat(a)),
        (_a[bName] = parseFloat(b)),
        (_a[cName] = parseFloat(c)),
        (_a.alpha = alpha !== undefined ? parseFloat(alpha) : 1),
        _a
      )
    }
  }

  var hsla = {
    test: isColorString('hsl', 'hue'),
    parse: splitColor('hue', 'saturation', 'lightness'),
    transform: function (_a) {
      var hue = _a.hue,
        saturation = _a.saturation,
        lightness = _a.lightness,
        _b = _a.alpha,
        alpha$1 = _b === void 0 ? 1 : _b
      return (
        'hsla(' +
        Math.round(hue) +
        ', ' +
        percent.transform(sanitize(saturation)) +
        ', ' +
        percent.transform(sanitize(lightness)) +
        ', ' +
        sanitize(alpha.transform(alpha$1)) +
        ')'
      )
    },
  }

  var clampRgbUnit = clamp(0, 255)
  var rgbUnit = __assign(__assign({}, number), {
    transform: function (v) {
      return Math.round(clampRgbUnit(v))
    },
  })
  var rgba = {
    test: isColorString('rgb', 'red'),
    parse: splitColor('red', 'green', 'blue'),
    transform: function (_a) {
      var red = _a.red,
        green = _a.green,
        blue = _a.blue,
        _b = _a.alpha,
        alpha$1 = _b === void 0 ? 1 : _b
      return (
        'rgba(' +
        rgbUnit.transform(red) +
        ', ' +
        rgbUnit.transform(green) +
        ', ' +
        rgbUnit.transform(blue) +
        ', ' +
        sanitize(alpha.transform(alpha$1)) +
        ')'
      )
    },
  }

  function parseHex(v) {
    var r = ''
    var g = ''
    var b = ''
    var a = ''
    if (v.length > 5) {
      r = v.substr(1, 2)
      g = v.substr(3, 2)
      b = v.substr(5, 2)
      a = v.substr(7, 2)
    } else {
      r = v.substr(1, 1)
      g = v.substr(2, 1)
      b = v.substr(3, 1)
      a = v.substr(4, 1)
      r += r
      g += g
      b += b
      a += a
    }
    return {
      red: parseInt(r, 16),
      green: parseInt(g, 16),
      blue: parseInt(b, 16),
      alpha: a ? parseInt(a, 16) / 255 : 1,
    }
  }
  var hex = {
    test: isColorString('#'),
    parse: parseHex,
    transform: rgba.transform,
  }

  var color = {
    test: function (v) {
      return rgba.test(v) || hex.test(v) || hsla.test(v)
    },
    parse: function (v) {
      if (rgba.test(v)) {
        return rgba.parse(v)
      } else if (hsla.test(v)) {
        return hsla.parse(v)
      } else {
        return hex.parse(v)
      }
    },
    transform: function (v) {
      return isString(v)
        ? v
        : v.hasOwnProperty('red')
        ? rgba.transform(v)
        : hsla.transform(v)
    },
  }

  var colorToken = '${c}'
  var numberToken = '${n}'
  function test(v) {
    var _a, _b, _c, _d
    return (
      isNaN(v) &&
      isString(v) &&
      ((_b =
        (_a = v.match(floatRegex)) === null || _a === void 0
          ? void 0
          : _a.length) !== null && _b !== void 0
        ? _b
        : 0) +
        ((_d =
          (_c = v.match(colorRegex)) === null || _c === void 0
            ? void 0
            : _c.length) !== null && _d !== void 0
          ? _d
          : 0) >
        0
    )
  }
  function analyse(v) {
    var values = []
    var numColors = 0
    var colors = v.match(colorRegex)
    if (colors) {
      numColors = colors.length
      v = v.replace(colorRegex, colorToken)
      values.push.apply(values, colors.map(color.parse))
    }
    var numbers = v.match(floatRegex)
    if (numbers) {
      v = v.replace(floatRegex, numberToken)
      values.push.apply(values, numbers.map(number.parse))
    }
    return { values: values, numColors: numColors, tokenised: v }
  }
  function parse(v) {
    return analyse(v).values
  }
  function createTransformer(v) {
    var _a = analyse(v),
      values = _a.values,
      numColors = _a.numColors,
      tokenised = _a.tokenised
    var numValues = values.length
    return function (v) {
      var output = tokenised
      for (var i = 0; i < numValues; i++) {
        output = output.replace(
          i < numColors ? colorToken : numberToken,
          i < numColors ? color.transform(v[i]) : sanitize(v[i]),
        )
      }
      return output
    }
  }
  var convertNumbersToZero = function (v) {
    return typeof v === 'number' ? 0 : v
  }
  function getAnimatableNone$1(v) {
    var parsed = parse(v)
    var transformer = createTransformer(v)
    return transformer(parsed.map(convertNumbersToZero))
  }
  var complex = {
    test: test,
    parse: parse,
    createTransformer: createTransformer,
    getAnimatableNone: getAnimatableNone$1,
  }

  var maxDefaults = new Set(['brightness', 'contrast', 'saturate', 'opacity'])
  function applyDefaultFilter(v) {
    var _a = v.slice(0, -1).split('('),
      name = _a[0],
      value = _a[1]
    if (name === 'drop-shadow') return v
    var number = (value.match(floatRegex) || [])[0]
    if (!number) return v
    var unit = value.replace(number, '')
    var defaultValue = maxDefaults.has(name) ? 1 : 0
    if (number !== value) defaultValue *= 100
    return name + '(' + defaultValue + unit + ')'
  }
  var functionRegex = /([a-z-]*)\(.*?\)/g
  var filter = __assign(__assign({}, complex), {
    getAnimatableNone: function (v) {
      var functions = v.match(functionRegex)
      return functions ? functions.map(applyDefaultFilter).join(' ') : v
    },
  })

  const isKeyframesTarget = (v) => {
    return Array.isArray(v)
  }
  const underDampedSpring = () => ({
    type: 'spring',
    stiffness: 500,
    damping: 25,
    restDelta: 0.5,
    restSpeed: 10,
  })
  const criticallyDampedSpring = (to) => ({
    type: 'spring',
    stiffness: 550,
    damping: to === 0 ? 2 * Math.sqrt(550) : 30,
    restDelta: 0.01,
    restSpeed: 10,
  })
  const overDampedSpring = (to) => ({
    type: 'spring',
    stiffness: 550,
    damping: to === 0 ? 100 : 30,
    restDelta: 0.01,
    restSpeed: 10,
  })
  const linearTween = () => ({
    type: 'keyframes',
    ease: 'linear',
    duration: 300,
  })
  const keyframes = (values) => ({
    type: 'keyframes',
    duration: 800,
    values,
  })
  const defaultTransitions = {
    default: overDampedSpring,
    x: underDampedSpring,
    y: underDampedSpring,
    z: underDampedSpring,
    rotate: underDampedSpring,
    rotateX: underDampedSpring,
    rotateY: underDampedSpring,
    rotateZ: underDampedSpring,
    scaleX: criticallyDampedSpring,
    scaleY: criticallyDampedSpring,
    scale: criticallyDampedSpring,
    backgroundColor: linearTween,
    color: linearTween,
    opacity: linearTween,
  }
  const getDefaultTransition = (valueKey, to) => {
    let transitionFactory
    if (isKeyframesTarget(to)) {
      transitionFactory = keyframes
    } else {
      transitionFactory =
        defaultTransitions[valueKey] || defaultTransitions.default
    }
    return Object.assign({ to }, transitionFactory(to))
  }

  /**
   * ValueType for ints
   */
  const int = Object.assign(Object.assign({}, number), {
    transform: Math.round,
  })
  const valueTypes = {
    // Color props
    color,
    backgroundColor: color,
    outlineColor: color,
    fill: color,
    stroke: color,
    // Border props
    borderColor: color,
    borderTopColor: color,
    borderRightColor: color,
    borderBottomColor: color,
    borderLeftColor: color,
    borderWidth: px,
    borderTopWidth: px,
    borderRightWidth: px,
    borderBottomWidth: px,
    borderLeftWidth: px,
    borderRadius: px,
    radius: px,
    borderTopLeftRadius: px,
    borderTopRightRadius: px,
    borderBottomRightRadius: px,
    borderBottomLeftRadius: px,
    // Positioning props
    width: px,
    maxWidth: px,
    height: px,
    maxHeight: px,
    size: px,
    top: px,
    right: px,
    bottom: px,
    left: px,
    // Spacing props
    padding: px,
    paddingTop: px,
    paddingRight: px,
    paddingBottom: px,
    paddingLeft: px,
    margin: px,
    marginTop: px,
    marginRight: px,
    marginBottom: px,
    marginLeft: px,
    // Transform props
    rotate: degrees,
    rotateX: degrees,
    rotateY: degrees,
    rotateZ: degrees,
    scale,
    scaleX: scale,
    scaleY: scale,
    scaleZ: scale,
    skew: degrees,
    skewX: degrees,
    skewY: degrees,
    distance: px,
    translateX: px,
    translateY: px,
    translateZ: px,
    x: px,
    y: px,
    z: px,
    perspective: px,
    transformPerspective: px,
    opacity: alpha,
    originX: progressPercentage,
    originY: progressPercentage,
    originZ: px,
    // Misc
    zIndex: int,
    filter,
    WebkitFilter: filter,
    // SVG
    fillOpacity: alpha,
    strokeOpacity: alpha,
    numOctaves: int,
  }
  /**
   * Return the value type for a key.
   *
   * @param key
   */
  const getValueType = (key) => valueTypes[key]
  /**
   * Transform the value using its value type, or return the value.
   *
   * @param value
   * @param type
   */
  const getValueAsType = (value, type) => {
    return type && typeof value === 'number' && type.transform
      ? type.transform(value)
      : value
  }
  /**
   * Get default animatable
   *
   * @param key
   * @param value
   */
  function getAnimatableNone(key, value) {
    let defaultValueType = getValueType(key)
    if (defaultValueType !== filter) defaultValueType = complex
    // If value is not recognised as animatable, ie "none", create an animatable version origin based on the target
    return defaultValueType.getAnimatableNone
      ? defaultValueType.getAnimatableNone(value)
      : undefined
  }

  // Easing map from popmotion
  const easingLookup = {
    linear: popmotion.linear,
    easeIn: popmotion.easeIn,
    easeInOut: popmotion.easeInOut,
    easeOut: popmotion.easeOut,
    circIn: popmotion.circIn,
    circInOut: popmotion.circInOut,
    circOut: popmotion.circOut,
    backIn: popmotion.backIn,
    backInOut: popmotion.backInOut,
    backOut: popmotion.backOut,
    anticipate: popmotion.anticipate,
    bounceIn: popmotion.bounceIn,
    bounceInOut: popmotion.bounceInOut,
    bounceOut: popmotion.bounceOut,
  }
  /**
   * Transform easing definition to easing function.
   *
   * @param definition
   */
  const easingDefinitionToFunction = (definition) => {
    if (Array.isArray(definition)) {
      const [x1, y1, x2, y2] = definition
      return popmotion.cubicBezier(x1, y1, x2, y2)
    } else if (typeof definition === 'string') {
      return easingLookup[definition]
    }
    return definition
  }
  /**
   * Create an easing array
   *
   * @param ease
   */
  const isEasingArray = (ease) => {
    return Array.isArray(ease) && typeof ease[0] !== 'number'
  }
  /**
   * Check if a value is animatable. Examples:
   *
   * ✅: 100, "100px", "#fff"
   * ❌: "block", "url(2.jpg)"
   * @param value
   *
   * @internal
   */
  const isAnimatable = (key, value) => {
    // If the list of keys tat might be non-animatable grows, replace with Set
    if (key === 'zIndex') return false
    // If it's a number or a keyframes array, we can animate it. We might at some point
    // need to do a deep isAnimatable check of keyframes, or let Popmotion handle this,
    // but for now lets leave it like this for performance reasons
    if (typeof value === 'number' || Array.isArray(value)) return true
    if (
      typeof value === 'string' && // It's animatable if we have a string
      complex.test(value) && // And it contains numbers and/or colors
      !value.startsWith('url(') // Unless it starts with "url("
    ) {
      return true
    }
    return false
  }
  /**
   * Hydrate keyframes from transition options.
   *
   * @param options
   */
  function hydrateKeyframes(options) {
    if (Array.isArray(options.to) && options.to[0] === null) {
      options.to = [...options.to]
      options.to[0] = options.from
    }
    return options
  }
  /**
   * Convert Transition type into Popmotion-compatible options.
   */
  function convertTransitionToAnimationOptions(_a) {
    var { ease, times, delay } = _a,
      transition = __rest(_a, ['ease', 'times', 'delay'])
    const options = Object.assign({}, transition)
    if (times) options['offset'] = times
    // Map easing names to Popmotion's easing functions
    if (ease) {
      options['ease'] = isEasingArray(ease)
        ? ease.map(easingDefinitionToFunction)
        : easingDefinitionToFunction(ease)
    }
    // Map delay to elapsed from Popmotion
    if (delay) {
      options['elapsed'] = -delay
    }
    return options
  }
  /**
   * Get PopMotion animation options from Transition definition
   *
   * @param transition
   * @param options
   * @param key
   */
  function getPopmotionAnimationOptions(transition, options, key) {
    if (Array.isArray(options.to)) {
      if (!transition.duration) transition.duration = 800
    }
    hydrateKeyframes(options)
    // Get a default transition if none is determined to be defined.
    if (!isTransitionDefined(transition)) {
      transition = Object.assign(
        Object.assign({}, transition),
        getDefaultTransition(key, options.to),
      )
    }
    return Object.assign(
      Object.assign({}, options),
      convertTransitionToAnimationOptions(transition),
    )
  }
  /**
   * Decide whether a transition is defined on a given Transition.
   * This filters out orchestration options and returns true
   * if any options are left.
   */
  function isTransitionDefined(_a) {
    var transition = __rest(_a, [
      'delay',
      'repeat',
      'repeatType',
      'repeatDelay',
      'from',
    ])
    return !!Object.keys(transition).length
  }
  /**
   * Get the transition definition for the current value.
   *
   * First search for transition nested definition (key or default),
   * then fallback on the main transition definition itself.
   *
   * @param transition
   * @param key
   */
  function getValueTransition(transition, key) {
    return transition[key] || transition['default'] || transition
  }
  /**
   * Get the animation function populated with variant values.
   */
  function getAnimation(key, value, target, transition, onComplete) {
    // Get key transition or fallback values
    const valueTransition = getValueTransition(transition, key)
    // Get origin
    let origin =
      valueTransition.from === null || valueTransition.from === undefined
        ? value.get()
        : valueTransition.from
    // Is target animatable
    const isTargetAnimatable = isAnimatable(key, target)
    // If we're trying to animate from "none", try and get an animatable version
    // of the target. This could be improved to work both ways.
    if (origin === 'none' && isTargetAnimatable && typeof target === 'string') {
      origin = getAnimatableNone(key, target)
    }
    // Is origin animatable
    const isOriginAnimatable = isAnimatable(key, origin)
    /**
     * Start the animation.
     */
    function start(complete) {
      const options = {
        from: origin,
        to: target,
        velocity: transition.velocity
          ? transition.velocity
          : value.getVelocity(),
        onUpdate: (v) => value.set(v),
      }
      return valueTransition.type === 'inertia' ||
        valueTransition.type === 'decay'
        ? popmotion.inertia(
            Object.assign(Object.assign({}, options), valueTransition),
          )
        : popmotion.animate(
            Object.assign(
              Object.assign(
                {},
                getPopmotionAnimationOptions(valueTransition, options, key),
              ),
              {
                onUpdate: (v) => {
                  options.onUpdate(v)
                  if (valueTransition.onUpdate) valueTransition.onUpdate(v)
                },
                onComplete: () => {
                  if (transition.onComplete) transition.onComplete()
                  if (onComplete) onComplete()
                  if (complete) complete()
                },
              },
            ),
          )
    }
    /**
     * Set value without transition.
     */
    function set(complete) {
      value.set(target)
      if (transition.onComplete) transition.onComplete()
      if (onComplete) onComplete()
      if (complete) complete()
      return { stop: () => {} }
    }
    return !isOriginAnimatable ||
      !isTargetAnimatable ||
      valueTransition.type === false
      ? set
      : start
  }

  /**
   * A Composable holding all the ongoing transitions in a local reference.
   */
  function useMotionTransitions() {
    const { motionValues, stop, get } = useMotionValues()
    const push = (key, value, target, transition = {}, onComplete) => {
      // Get the `from` key from target
      const from = target[key]
      // Get motion value for the target key
      const motionValue = get(key, from, target)
      // Sets the value immediately if specified
      if (transition && transition.immediate) {
        motionValue.set(value)
        return
      }
      // Create animation
      const animation = getAnimation(
        key,
        motionValue,
        value,
        transition,
        onComplete,
      )
      // Start animation
      motionValue.start(animation)
    }
    return { motionValues, stop, push }
  }

  /**
   * A Composable handling motion controls, pushing resolved variant to useMotionTransitions manager.
   *
   * @param transform
   * @param style
   * @param currentVariant
   */
  function useMotionControls(
    motionProperties,
    variants = {},
    { push, stop } = useMotionTransitions(),
  ) {
    // Variants as ref
    const _variants = vueDemi.unref(variants)
    const getVariantFromKey = (variant) => {
      if (!_variants || !_variants[variant]) {
        throw new Error(`The variant ${variant} does not exist.`)
      }
      return _variants[variant]
    }
    const apply = (variant) => {
      // If variant is a key, try to resolve it
      if (typeof variant === 'string') {
        variant = getVariantFromKey(variant)
      }
      // Return Promise chain
      return Promise.all(
        Object.entries(variant).map(([key, value]) => {
          // Skip transition key
          if (key === 'transition') return
          return new Promise((resolve) => {
            push(
              key,
              value,
              motionProperties,
              variant.transition || getDefaultTransition(key, variant[key]),
              resolve,
            )
          })
        }),
      )
    }
    const set = (variant) => {
      // Get variant data from parameter
      let variantData = core.isObject(variant)
        ? variant
        : getVariantFromKey(variant)
      // Set in chain
      Object.entries(variantData).forEach(([key, value]) => {
        // Skip transition key
        if (key === 'transition') return
        push(key, value, motionProperties, {
          immediate: true,
        })
      })
    }
    const leave = (done) =>
      __awaiter(this, void 0, void 0, function* () {
        let leaveVariant
        if (_variants) {
          if (_variants.leave) {
            leaveVariant = _variants.leave
          }
          if (!_variants.leave && _variants.initial) {
            leaveVariant = _variants.initial
          }
        }
        if (!leaveVariant) {
          done()
          return
        }
        yield apply(leaveVariant)
        done()
      })
    return {
      apply,
      set,
      stopTransitions: stop,
      leave,
    }
  }

  const isBrowser = typeof window !== 'undefined'
  const supportsPointerEvents = () => isBrowser && window.onpointerdown === null
  const supportsTouchEvents = () => isBrowser && window.ontouchstart === null
  const supportsMouseEvents = () => isBrowser && window.onmousedown === null

  function registerEventListeners({ target, state, variants, apply }) {
    const _variants = vueDemi.unref(variants)
    // State
    const hovered = vueDemi.ref(false)
    const tapped = vueDemi.ref(false)
    const focused = vueDemi.ref(false)
    const mutableKeys = vueDemi.computed(() => {
      let result = []
      if (!_variants) return result
      if (_variants.hovered) {
        result = [...result, ...Object.keys(_variants.hovered)]
      }
      if (_variants.tapped) {
        result = [...result, ...Object.keys(_variants.tapped)]
      }
      if (_variants.focused) {
        result = [...result, ...Object.keys(_variants.focused)]
      }
      return result
    })
    const computedProperties = vueDemi.computed(() => {
      const result = {}
      Object.assign(result, state.value)
      if (hovered.value && _variants.hovered) {
        Object.assign(result, _variants.hovered)
      }
      if (tapped.value && _variants.tapped) {
        Object.assign(result, _variants.tapped)
      }
      if (focused.value && _variants.focused) {
        Object.assign(result, _variants.focused)
      }
      for (const key in result) {
        if (!mutableKeys.value.includes(key)) delete result[key]
      }
      return result
    })
    vueDemi.watch(
      () => core.unrefElement(target),
      (el) => {
        if (!el || !_variants) return
        // Hovered
        if (_variants.hovered) {
          core.useEventListener(el, 'mouseenter', () => {
            hovered.value = true
          })
          core.useEventListener(el, 'mouseleave', () => {
            hovered.value = false
            tapped.value = false
          })
          core.useEventListener(el, 'mouseout', () => {
            hovered.value = false
            tapped.value = false
          })
        }
        // Tapped
        if (_variants.tapped) {
          // Mouse
          if (supportsMouseEvents()) {
            core.useEventListener(el, 'mousedown', () => {
              tapped.value = true
            })
            core.useEventListener(el, 'mouseup', () => {
              tapped.value = false
            })
          }
          // Pointer
          if (supportsPointerEvents()) {
            core.useEventListener(el, 'pointerdown', () => {
              tapped.value = true
            })
            core.useEventListener(el, 'pointerup', () => {
              tapped.value = false
            })
          }
          // Touch
          if (supportsTouchEvents()) {
            core.useEventListener(el, 'touchstart', () => {
              tapped.value = true
            })
            core.useEventListener(el, 'touchend', () => {
              tapped.value = false
            })
          }
        }
        // Focused
        if (_variants.focused) {
          core.useEventListener(el, 'focus', () => {
            focused.value = true
          })
          core.useEventListener(el, 'blur', () => {
            focused.value = false
          })
        }
      },
      {
        immediate: true,
      },
    )
    // Watch local computed variant, apply it dynamically
    vueDemi.watch(computedProperties, (newVal) => {
      apply(newVal)
    })
  }

  function registerLifeCycleHooks({ target, variants, variant }) {
    const _variants = vueDemi.unref(variants)
    const stop = vueDemi.watch(
      () => target,
      () => {
        // Lifecycle hooks bindings
        if (_variants && _variants.enter) {
          // Set initial before the element is mounted
          if (_variants.initial) variant.value = 'initial'
          // Set enter animation, once the element is mounted
          vueDemi.nextTick(() => (variant.value = 'enter'))
        }
      },
      {
        immediate: true,
        flush: 'pre',
      },
    )
    return { stop }
  }

  function registerVariantsSync({ state, apply }) {
    // Watch for variant changes and apply the new one
    const stop = vueDemi.watch(
      state,
      (newVal) => {
        if (newVal) apply(newVal)
      },
      {
        immediate: true,
      },
    )
    return { stop }
  }

  function registerVisibilityHooks({ target, variants, variant }) {
    const _variants = vueDemi.unref(variants)
    let _stopObserver = core.noop
    const _stopWatcher = vueDemi.watch(
      () => core.unrefElement(target),
      (el) => {
        if (!el) return
        // Bind intersection observer on target
        _stopObserver = core.useIntersectionObserver(
          target,
          ([{ isIntersecting }]) => {
            if (_variants && _variants.visible) {
              if (isIntersecting) {
                variant.value = 'visible'
              } else {
                variant.value = 'initial'
              }
            }
          },
        ).stop
      },
      {
        immediate: true,
      },
    )
    /**
     * Stop both the watcher and the intersection observer.
     */
    const stop = () => {
      _stopObserver()
      _stopWatcher()
    }
    return {
      stop,
    }
  }

  /**
   * A Composable executing resolved variants features from variants declarations.
   *
   * Supports:
   * - lifeCycleHooks: Bind the motion hooks to the component lifecycle hooks.
   *
   * @param variant
   * @param variants
   * @param options
   */
  function useMotionFeatures(
    instance,
    options = {
      syncVariants: true,
      lifeCycleHooks: true,
      visibilityHooks: true,
      eventListeners: true,
    },
  ) {
    // Lifecycle hooks bindings
    if (options.lifeCycleHooks) {
      registerLifeCycleHooks(instance)
    }
    if (options.syncVariants) {
      registerVariantsSync(instance)
    }
    // Visibility hooks
    if (options.visibilityHooks) {
      registerVisibilityHooks(instance)
    }
    // Event listeners
    if (options.eventListeners) {
      registerEventListeners(instance)
    }
  }

  /**
   * Reactive style object implementing all native CSS properties.
   *
   * @param props
   */
  function reactiveStyle(props = {}) {
    // Reactive StyleProperties object
    const state = vueDemi.reactive(Object.assign({}, props))
    const style = vueDemi.ref({})
    // Reactive DOM Element compatible `style` object bound to state
    vueDemi.watch(
      state,
      () => {
        // Init result object
        const result = {}
        for (const [key, value] of Object.entries(state)) {
          // Get value type for key
          const valueType = getValueType(key)
          // Get value as type for key
          const valueAsType = getValueAsType(value, valueType)
          // Append the computed style to result object
          result[key] = valueAsType
        }
        style.value = result
      },
      {
        immediate: true,
        deep: true,
      },
    )
    return {
      state,
      style,
    }
  }

  /**
   * A list of all transformable axes. We'll use this list to generated a version
   * of each axes for each transform.
   */
  const transformAxes = ['', 'X', 'Y', 'Z']
  /**
   * An ordered array of each transformable value. By default, transform values
   * will be sorted to this order.
   */
  const order = ['perspective', 'translate', 'scale', 'rotate', 'skew']
  /**
   * Generate a list of every possible transform key.
   */
  const transformProps = ['transformPerspective', 'x', 'y', 'z']
  order.forEach((operationKey) => {
    transformAxes.forEach((axesKey) => {
      const key = operationKey + axesKey
      transformProps.push(key)
    })
  })
  /**
   * A quick lookup for transform props.
   */
  const transformPropSet = new Set(transformProps)
  function isTransformProp(key) {
    return transformPropSet.has(key)
  }
  /**
   * A quick lookup for transform origin props
   */
  const transformOriginProps = new Set(['originX', 'originY', 'originZ'])
  function isTransformOriginProp(key) {
    return transformOriginProps.has(key)
  }

  /**
   * A Composable giving access to a StyleProperties object, and binding the generated style object to a target.
   *
   * @param target
   */
  function useElementStyle(target, onInit) {
    // Transform cache available before the element is mounted
    let _cache
    // Local target cache as we need to resolve the element from PermissiveTarget
    let _target = undefined
    // Create a reactive style object
    const { state, style } = reactiveStyle()
    // Sync existing style from supplied element
    const stopInitWatch = vueDemi.watch(
      () => core.unrefElement(target),
      (el) => {
        if (!el) return
        _target = el
        // Loop on style keys
        for (const key of Object.keys(valueTypes)) {
          if (
            el.style[key] === null ||
            el.style[key] === '' ||
            isTransformProp(key) ||
            isTransformOriginProp(key)
          )
            continue
          // Append a defined key to the local StyleProperties state object
          vueDemi.set(state, key, el.style[key])
        }
        // If cache is present, init the target with the current cached value
        if (_cache) {
          Object.entries(_cache).forEach(([key, value]) =>
            vueDemi.set(el.style, key, value),
          )
        }
        if (onInit) onInit(state)
      },
      {
        immediate: true,
      },
    )
    // Sync reactive style to element
    const stopSyncWatch = vueDemi.watch(
      style,
      (newVal) => {
        // Add the current value to the cache so it is set on target creation
        if (!_target) {
          _cache = newVal
          return
        }
        // Append the state object to the target style properties
        for (const key in newVal) vueDemi.set(_target.style, key, newVal[key])
      },
      {
        immediate: true,
      },
    )
    // Stop watchers
    const stop = () => {
      stopInitWatch()
      stopSyncWatch()
    }
    return {
      style: state,
      stop,
    }
  }

  /**
   * Aliases translate key for simpler API integration.
   */
  const translateAlias = {
    x: 'translateX',
    y: 'translateY',
    z: 'translateZ',
  }
  /**
   * Reactive transform string implementing all native CSS transform properties.
   *
   * @param props
   * @param enableHardwareAcceleration
   */
  function reactiveTransform(props = {}, enableHardwareAcceleration = true) {
    // Reactive TransformProperties object
    const state = vueDemi.reactive(Object.assign({}, props))
    const transform = vueDemi.ref('')
    vueDemi.watch(
      state,
      (newVal) => {
        // Init result
        let result = ''
        let hasHardwareAcceleration = false
        // Use translate3d by default has a better GPU optimization
        // And corrects scaling discrete behaviors
        if (enableHardwareAcceleration && (newVal.x || newVal.y || newVal.z)) {
          const str = [newVal.x || 0, newVal.y || 0, newVal.z || 0]
            .map(px.transform)
            .join(',')
          result += `translate3d(${str}) `
          hasHardwareAcceleration = true
        }
        // Loop on defined TransformProperties state keys
        for (const [key, value] of Object.entries(newVal)) {
          if (
            enableHardwareAcceleration &&
            (key === 'x' || key === 'y' || key === 'z')
          )
            continue
          // Get value type for key
          const valueType = getValueType(key)
          // Get value as type for key
          const valueAsType = getValueAsType(value, valueType)
          // Append the computed transform key to result string
          result += `${translateAlias[key] || key}(${valueAsType}) `
        }
        if (enableHardwareAcceleration && !hasHardwareAcceleration) {
          result += `translateZ(0px) `
        }
        transform.value = result.trim()
      },
      {
        immediate: true,
        deep: true,
      },
    )
    return {
      state,
      transform,
    }
  }

  /**
   * Return an object from a transform string.
   *
   * @param str
   */
  function parseTransform(transform) {
    // Split transform string.
    const transforms = transform.trim().split(/\) |\)/)
    // Handle "initial", "inherit", "unset".
    if (transforms.length === 1) {
      return {}
    }
    const parseValues = (value) => {
      // If value is ending with px or deg, return it as a number
      if (value.endsWith('px') || value.endsWith('deg'))
        return parseFloat(value)
      // Return as number
      if (isNaN(Number(value))) return Number(value)
      // Parsing impossible, return as string
      return value
    }
    // Reduce the result to an object and return it
    return transforms.reduce((acc, transform) => {
      if (!transform) return acc
      const [name, transformValue] = transform.split('(')
      const valueArray = transformValue.split(',')
      const values = valueArray.map((val) => {
        return parseValues(
          val.endsWith(')') ? val.replace(')', '') : val.trim(),
        )
      })
      const value = values.length === 1 ? values[0] : values
      return Object.assign(Object.assign({}, acc), { [name]: value })
    }, {})
  }
  /**
   * Sets the state from a parsed transform string.
   *
   * Used in useElementTransform init to restore element transform string in cases it does exists.
   *
   * @param state
   * @param transform
   */
  function stateFromTransform(state, transform) {
    Object.entries(parseTransform(transform)).forEach(([key, value]) => {
      // Get value w/o unit, as unit is applied later on
      value = parseFloat(value)
      // Axes reference for loops
      const axes = ['x', 'y', 'z']
      // Handle translate3d and scale3d
      if (key === 'translate3d') {
        // Loop on parsed scale / translate definition
        value.forEach((axisValue, index) => {
          vueDemi.set(state, axes[index], axisValue)
        })
        return
      }
      // Sync translateX on X
      if (key === 'translateX') {
        vueDemi.set(state, 'x', value)
        return
      }
      // Sync translateY on Y
      if (key === 'translateY') {
        vueDemi.set(state, 'y', value)
        return
      }
      // Sync translateZ on Z
      if (key === 'translateZ') {
        vueDemi.set(state, 'z', value)
        return
      }
      // Set raw value
      vueDemi.set(state, key, value)
    })
  }

  /**
   * A Composable giving access to a TransformProperties object, and binding the generated transform string to a target.
   *
   * @param target
   */
  function useElementTransform(target, onInit) {
    // Transform cache available before the element is mounted
    let _cache
    // Local target cache as we need to resolve the element from PermissiveTarget
    let _target = undefined
    // Create a reactive transform object
    const { state, transform } = reactiveTransform()
    // Cache transform until the element is alive and we can bind to it
    const stopInitWatch = vueDemi.watch(
      () => core.unrefElement(target),
      (el) => {
        if (!el) return
        _target = el
        // Parse transform properties and applies them to the current state
        if (el.style.transform) stateFromTransform(state, el.style.transform)
        // If cache is present, init the target with the current cached value
        if (_cache) {
          el.style.transform = _cache
        }
        if (onInit) onInit(state)
      },
      {
        immediate: true,
      },
    )
    // Sync reactive transform to element
    const stopSyncWatch = vueDemi.watch(
      transform,
      (newValue) => {
        // Add the current value to the cache so it is set on target creation
        if (!_target) {
          _cache = newValue
          return
        }
        // Set the transform string on the target
        _target.style.transform = newValue
      },
      {
        immediate: true,
      },
    )
    // Stop watchers
    const stop = () => {
      stopInitWatch()
      stopSyncWatch()
    }
    return {
      transform: state,
      stop,
    }
  }

  /**
   * A Composable giving access to both `transform` and `style`objects for a single element.
   *
   * @param target
   */
  function useMotionProperties(target, defaultValues) {
    // Local motion properties
    const motionProperties = vueDemi.reactive({})
    // Local mass setter
    const apply = (values) => {
      Object.entries(values).forEach(([key, value]) => {
        vueDemi.set(motionProperties, key, value)
      })
    }
    // Target element style object
    const { style, stop: stopStyleWatchers } = useElementStyle(target, apply)
    // Target element transform object
    const { transform, stop: stopTransformWatchers } = useElementTransform(
      target,
      apply,
    )
    // Watch local object and apply styling accordingly
    const stopPropertiesWatch = vueDemi.watch(
      motionProperties,
      (newVal) => {
        Object.entries(newVal).forEach(([key, value]) => {
          const target = isTransformProp(key) ? transform : style
          if (target[key] && target[key] === value) return
          vueDemi.set(target, key, value)
        })
      },
      {
        immediate: true,
        deep: true,
      },
    )
    // Apply default values once target is available
    const stopInitWatch = vueDemi.watch(
      () => core.unrefElement(target),
      (el) => {
        if (!el) return
        if (defaultValues) apply(defaultValues)
      },
      {
        immediate: true,
      },
    )
    // Stop watchers
    const stop = () => {
      stopStyleWatchers()
      stopTransformWatchers()
      stopPropertiesWatch()
      stopInitWatch()
    }
    return {
      motionProperties,
      style,
      transform,
      stop,
    }
  }

  /**
   * A Composable handling variants selection and features.
   *
   * @param variants
   * @param initial
   * @param options
   */
  function useMotionVariants(variants = {}) {
    // Unref variants
    const _variants = vueDemi.unref(variants)
    // Current variant string
    const variant = vueDemi.ref()
    // Current variant state
    const state = vueDemi.computed(() => {
      if (!variant.value) return
      return _variants[variant.value]
    })
    return {
      state,
      variant,
    }
  }

  /**
   * A Vue Composable that put your components in motion.
   *
   * @docs https://motion.vueuse.js.org
   *
   * @param target
   * @param variants
   * @param options
   */
  function useMotion(target, variants = {}, options) {
    // Reactive styling and transform
    const { motionProperties } = useMotionProperties(target)
    // Variants manager
    const { variant, state } = useMotionVariants(variants)
    // Motion controls, synchronized with motion properties and variants
    const controls = useMotionControls(motionProperties, variants)
    // Create motion instance
    const instance = Object.assign(
      { target, variant, variants, state, motionProperties },
      controls,
    )
    // Bind features
    useMotionFeatures(instance, options)
    return instance
  }

  const directivePropsKeys = [
    'initial',
    'enter',
    'leave',
    'visible',
    'hovered',
    'tapped',
    'focused',
    'delay',
  ]
  const resolveVariants = (node, variantsRef) => {
    // This is done to achieve compat with Vue 2 & 3
    // node.props = Vue 3 element props location
    // node.data.attrs = Vue 2 element props location
    const target = node.props
      ? node.props // @ts-expect-error
      : node.data && node.data.attrs // @ts-expect-error
      ? node.data.attrs
      : {}
    if (target) {
      if (target['variants'] && core.isObject(target['variants'])) {
        // If variant are passed through a single object reference, initialize with it
        variantsRef.value = Object.assign(
          Object.assign({}, variantsRef.value),
          target['variants'],
        )
      }
      // Loop on directive prop keys, add them to the local variantsRef if defined
      directivePropsKeys.forEach((key) => {
        if (key === 'delay') {
          if (target && target[key] && core.isNumber(target[key])) {
            const delay = target[key]
            if (variantsRef && variantsRef.value) {
              if (variantsRef.value.enter) {
                if (!variantsRef.value.enter.transition) {
                  variantsRef.value.enter.transition = {}
                }
                variantsRef.value.enter.transition = Object.assign(
                  Object.assign({}, variantsRef.value.enter.transition),
                  { delay },
                )
              }
              if (variantsRef.value.visible) {
                if (!variantsRef.value.visible.transition) {
                  variantsRef.value.visible.transition = {}
                }
                variantsRef.value.visible.transition = Object.assign(
                  Object.assign({}, variantsRef.value.visible.transition),
                  { delay },
                )
              }
            }
          }
          return
        }
        if (target && target[key] && core.isObject(target[key])) {
          variantsRef.value[key] = target[key]
        }
      })
    }
  }

  const directive = (variants) => {
    const register = (el, binding, node) => {
      // Initialize variants with argument
      const variantsRef = vueDemi.ref(variants || {})
      // Resolve variants from node props
      resolveVariants(node, variantsRef)
      // Create motion instance
      const motionInstance = useMotion(el, variantsRef)
      // Set the global state reference if the name is set through v-motion="`value`"
      if (binding.value) vueDemi.set(motionState, binding.value, motionInstance)
    }
    const unregister = (_, binding, __) => {
      // Check if motion state has the current element as reference
      if (binding.value && motionState[binding.value])
        vueDemi.del(motionState, binding.value)
    }
    return {
      // Vue 3 Directive Hooks
      created: register,
      unmounted: unregister,
      // Vue 2 Directive Hooks
      // For Nuxt & Vue 2 compatibility
      // @ts-expect-error
      bind: register,
      unbind: unregister,
    }
  }

  const fade = {
    initial: {
      opacity: 0,
    },
    enter: {
      opacity: 1,
    },
  }
  const fadeVisible = {
    initial: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
    },
  }

  const pop = {
    initial: {
      scale: 0,
      opacity: 0,
    },
    enter: {
      scale: 1,
      opacity: 1,
    },
  }
  const popVisible = {
    initial: {
      scale: 0,
      opacity: 0,
    },
    visible: {
      scale: 1,
      opacity: 1,
    },
  }

  // Roll from left
  const rollLeft = {
    initial: {
      x: -100,
      rotate: 90,
      opacity: 0,
    },
    enter: {
      x: 0,
      rotate: 0,
      opacity: 1,
    },
  }
  const rollVisibleLeft = {
    initial: {
      x: -100,
      rotate: 90,
      opacity: 0,
    },
    visible: {
      x: 0,
      rotate: 0,
      opacity: 1,
    },
  }
  // Roll from right
  const rollRight = {
    initial: {
      x: 100,
      rotate: -90,
      opacity: 0,
    },
    enter: {
      x: 0,
      rotate: 0,
      opacity: 1,
    },
  }
  const rollVisibleRight = {
    initial: {
      x: 100,
      rotate: -90,
      opacity: 0,
    },
    visible: {
      x: 0,
      rotate: 0,
      opacity: 1,
    },
  }
  // Roll from top
  const rollTop = {
    initial: {
      y: -100,
      rotate: -90,
      opacity: 0,
    },
    enter: {
      y: 0,
      rotate: 0,
      opacity: 1,
    },
  }
  const rollVisibleTop = {
    initial: {
      y: -100,
      rotate: -90,
      opacity: 0,
    },
    visible: {
      y: 0,
      rotate: 0,
      opacity: 1,
    },
  }
  // Roll from bottom
  const rollBottom = {
    initial: {
      y: 100,
      rotate: 90,
      opacity: 0,
    },
    enter: {
      y: 0,
      rotate: 0,
      opacity: 1,
    },
  }
  const rollVisibleBottom = {
    initial: {
      y: 100,
      rotate: 90,
      opacity: 0,
    },
    visible: {
      y: 0,
      rotate: 0,
      opacity: 1,
    },
  }

  // Slide from left
  const slideLeft = {
    initial: {
      x: -100,
      opacity: 0,
    },
    enter: {
      x: 0,
      opacity: 1,
    },
  }
  const slideVisibleLeft = {
    initial: {
      x: -100,
      opacity: 0,
    },
    visible: {
      x: 0,
      opacity: 1,
    },
  }
  // Slide from right
  const slideRight = {
    initial: {
      x: 100,
      opacity: 0,
    },
    enter: {
      x: 0,
      opacity: 1,
    },
  }
  const slideVisibleRight = {
    initial: {
      x: 100,
      opacity: 0,
    },
    visible: {
      x: 0,
      opacity: 1,
    },
  }
  // Slide from top
  const slideTop = {
    initial: {
      y: -100,
      opacity: 0,
    },
    enter: {
      y: 0,
      opacity: 1,
    },
  }
  const slideVisibleTop = {
    initial: {
      y: -100,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
    },
  }
  // Slide from bottom
  const slideBottom = {
    initial: {
      y: 100,
      opacity: 0,
    },
    enter: {
      y: 0,
      opacity: 1,
    },
  }
  const slideVisibleBottom = {
    initial: {
      y: 100,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
    },
  }

  var presets = /*#__PURE__*/ Object.freeze({
    __proto__: null,
    fade: fade,
    fadeVisible: fadeVisible,
    pop: pop,
    popVisible: popVisible,
    rollBottom: rollBottom,
    rollLeft: rollLeft,
    rollRight: rollRight,
    rollTop: rollTop,
    rollVisibleBottom: rollVisibleBottom,
    rollVisibleLeft: rollVisibleLeft,
    rollVisibleRight: rollVisibleRight,
    rollVisibleTop: rollVisibleTop,
    slideBottom: slideBottom,
    slideLeft: slideLeft,
    slideRight: slideRight,
    slideTop: slideTop,
    slideVisibleBottom: slideVisibleBottom,
    slideVisibleLeft: slideVisibleLeft,
    slideVisibleRight: slideVisibleRight,
    slideVisibleTop: slideVisibleTop,
  })

  /**
   * Convert a string to a slug.
   *
   * Source: https://gist.github.com/hagemann/382adfc57adbd5af078dc93feef01fe1
   * Credits: @hagemann
   *
   * Edited to transform camel naming to slug with `-`.
   *
   * @param str
   */
  function slugify(string) {
    const a =
      'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;'
    const b =
      'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------'
    const p = new RegExp(a.split('').join('|'), 'g')
    return string
      .toString()
      .replace(/[A-Z]/g, (s) => '-' + s) // Camel to slug
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(p, (c) => b.charAt(a.indexOf(c))) // Replace special characters
      .replace(/&/g, '-and-') // Replace & with 'and'
      .replace(/[^\w\-]+/g, '') // Remove all non-word characters
      .replace(/\-\-+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, '') // Trim - from end of text
  }

  const MotionPlugin = {
    install(app, options) {
      // Register default `v-motion` directive
      app.directive('motion', directive())
      // Register presets
      if (!options || (options && !options.excludePresets)) {
        for (const key in presets) {
          // Get preset variants
          const preset = presets[key]
          // Register the preset `v-motion-${key}` directive
          app.directive(`motion-${slugify(key)}`, directive(preset))
        }
      }
      // Register plugin-wise directives
      if (options && options.directives) {
        // Loop on options, create a custom directive for each definition
        for (const key in options.directives) {
          // Get directive variants
          const variants = options.directives[key]
          // Development warning, showing definitions missing `initial` key
          if (!variants.initial && true) {
            console.warn(
              `Your directive v-motion-${key} is missing initial variant!`,
            )
          }
          // Register the custom `v-motion-${key}` directive
          app.directive(`motion-${key}`, directive(variants))
        }
      }
    },
  }

  function useMotions() {
    return motionState
  }

  function useSpring(values, spring) {
    const { stop, get } = useMotionValues()
    return {
      values,
      stop,
      set: (properties) =>
        Promise.all(
          Object.entries(properties).map(([key, value]) => {
            const motionValue = get(key, values[key], values)
            return motionValue.start((onComplete) => {
              const options = Object.assign(
                { type: 'spring' },
                spring || getDefaultTransition(key, value),
              )
              return popmotion.animate(
                Object.assign(
                  {
                    from: motionValue.get(),
                    to: value,
                    velocity: motionValue.getVelocity(),
                    onUpdate: (v) => motionValue.set(v),
                    onComplete,
                  },
                  options,
                ),
              )
            })
          }),
        ),
    }
  }

  /**
   * Check whether an object is a Motion Instance or not.
   *
   * Can be useful while building packages based on @vueuse/motion.
   *
   * @param obj
   * @returns bool
   */
  function isMotionInstance(obj) {
    const _obj = obj
    return (
      _obj.apply !== undefined &&
      shared.isFunction(_obj.apply) &&
      _obj.set !== undefined &&
      shared.isFunction(_obj.set) &&
      _obj.stopTransitions !== undefined &&
      shared.isFunction(_obj.stopTransitions) &&
      _obj.target !== undefined &&
      vueDemi.isRef(_obj.target)
    )
  }

  /**
   * Reactive prefers-reduced-motion.
   *
   * @param options
   */
  function useReducedMotion(options = {}) {
    return core.useMediaQuery('(prefers-reduced-motion: reduce)', options)
  }

  exports.MotionDirective = directive
  exports.MotionPlugin = MotionPlugin
  exports.fade = fade
  exports.fadeVisible = fadeVisible
  exports.isMotionInstance = isMotionInstance
  exports.pop = pop
  exports.popVisible = popVisible
  exports.reactiveStyle = reactiveStyle
  exports.reactiveTransform = reactiveTransform
  exports.rollBottom = rollBottom
  exports.rollLeft = rollLeft
  exports.rollRight = rollRight
  exports.rollTop = rollTop
  exports.rollVisibleBottom = rollVisibleBottom
  exports.rollVisibleLeft = rollVisibleLeft
  exports.rollVisibleRight = rollVisibleRight
  exports.rollVisibleTop = rollVisibleTop
  exports.slideBottom = slideBottom
  exports.slideLeft = slideLeft
  exports.slideRight = slideRight
  exports.slideTop = slideTop
  exports.slideVisibleBottom = slideVisibleBottom
  exports.slideVisibleLeft = slideVisibleLeft
  exports.slideVisibleRight = slideVisibleRight
  exports.slideVisibleTop = slideVisibleTop
  exports.slugify = slugify
  exports.useElementStyle = useElementStyle
  exports.useElementTransform = useElementTransform
  exports.useMotion = useMotion
  exports.useMotionControls = useMotionControls
  exports.useMotionProperties = useMotionProperties
  exports.useMotionTransitions = useMotionTransitions
  exports.useMotionVariants = useMotionVariants
  exports.useMotions = useMotions
  exports.useReducedMotion = useReducedMotion
  exports.useSpring = useSpring

  Object.defineProperty(exports, '__esModule', { value: true })

  return exports
})({}, VueDemi, VueUse, shared, popmotion)
