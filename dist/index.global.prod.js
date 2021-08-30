/*!
 * @vueuse/motion v1.6.0
 * (c) 2021
 * @license MIT
 */
var VueuseMotion = (function (t, e, n, r, i) {
  'use strict'
  const s = {}
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
    ***************************************************************************** */ var o =
    function () {
      return (o =
        Object.assign ||
        function (t) {
          for (var e, n = 1, r = arguments.length; n < r; n++)
            for (var i in (e = arguments[n]))
              Object.prototype.hasOwnProperty.call(e, i) && (t[i] = e[i])
          return t
        }).apply(this, arguments)
    }
  function a(t, e) {
    var n = {}
    for (var r in t)
      Object.prototype.hasOwnProperty.call(t, r) &&
        e.indexOf(r) < 0 &&
        (n[r] = t[r])
    if (null != t && 'function' == typeof Object.getOwnPropertySymbols) {
      var i = 0
      for (r = Object.getOwnPropertySymbols(t); i < r.length; i++)
        e.indexOf(r[i]) < 0 &&
          Object.prototype.propertyIsEnumerable.call(t, r[i]) &&
          (n[r[i]] = t[r[i]])
    }
    return n
  }
  function c(t, e, n, r) {
    return new (n || (n = Promise))(function (i, s) {
      function o(t) {
        try {
          c(r.next(t))
        } catch (t) {
          s(t)
        }
      }
      function a(t) {
        try {
          c(r.throw(t))
        } catch (t) {
          s(t)
        }
      }
      function c(t) {
        var e
        t.done
          ? i(t.value)
          : ((e = t.value),
            e instanceof n
              ? e
              : new n(function (t) {
                  t(e)
                })).then(o, a)
      }
      c((r = r.apply(t, e || [])).next())
    })
  }
  var u = (1 / 60) * 1e3,
    l =
      'undefined' != typeof performance
        ? function () {
            return performance.now()
          }
        : function () {
            return Date.now()
          },
    p =
      'undefined' != typeof window
        ? function (t) {
            return window.requestAnimationFrame(t)
          }
        : function (t) {
            return setTimeout(function () {
              return t(l())
            }, u)
          }
  var f = !0,
    d = !1,
    m = !1,
    v = { delta: 0, timestamp: 0 },
    y = ['read', 'update', 'preRender', 'render', 'postRender'],
    h = y.reduce(function (t, e) {
      return (
        (t[e] = (function (t) {
          var e = [],
            n = [],
            r = 0,
            i = !1,
            s = new WeakSet(),
            o = {
              schedule: function (t, o, a) {
                void 0 === o && (o = !1), void 0 === a && (a = !1)
                var c = a && i,
                  u = c ? e : n
                return (
                  o && s.add(t),
                  -1 === u.indexOf(t) && (u.push(t), c && i && (r = e.length)),
                  t
                )
              },
              cancel: function (t) {
                var e = n.indexOf(t)
                ;-1 !== e && n.splice(e, 1), s.delete(t)
              },
              process: function (a) {
                var c
                if (
                  ((i = !0),
                  (e = (c = [n, e])[0]),
                  ((n = c[1]).length = 0),
                  (r = e.length))
                )
                  for (var u = 0; u < r; u++) {
                    var l = e[u]
                    l(a), s.has(l) && (o.schedule(l), t())
                  }
                i = !1
              },
            }
          return o
        })(function () {
          return (d = !0)
        })),
        t
      )
    }, {}),
    b = y.reduce(function (t, e) {
      var n = h[e]
      return (
        (t[e] = function (t, e, r) {
          return (
            void 0 === e && (e = !1),
            void 0 === r && (r = !1),
            d || w(),
            n.schedule(t, e, r)
          )
        }),
        t
      )
    }, {}),
    g = function (t) {
      return h[t].process(v)
    },
    O = function (t) {
      ;(d = !1),
        (v.delta = f ? u : Math.max(Math.min(t - v.timestamp, 40), 1)),
        (v.timestamp = t),
        (m = !0),
        y.forEach(g),
        (m = !1),
        d && ((f = !1), p(O))
    },
    w = function () {
      ;(d = !0), (f = !0), m || p(O)
    }
  class j {
    constructor() {
      this.subscriptions = new Set()
    }
    add(t) {
      return (
        this.subscriptions.add(t),
        () => {
          this.subscriptions.delete(t)
        }
      )
    }
    notify(t, e, n) {
      if (this.subscriptions.size)
        for (const r of this.subscriptions) r(t, e, n)
    }
    clear() {
      this.subscriptions.clear()
    }
  }
  const x = (t) => !isNaN(parseFloat(t))
  class k {
    constructor(t) {
      ;(this.timeDelta = 0),
        (this.lastUpdated = 0),
        (this.updateSubscribers = new j()),
        (this.canTrackVelocity = !1),
        (this.updateAndNotify = (t) => {
          ;(this.prev = this.current), (this.current = t)
          const { delta: e, timestamp: n } = v
          this.lastUpdated !== n &&
            ((this.timeDelta = e), (this.lastUpdated = n)),
            b.postRender(this.scheduleVelocityCheck),
            this.updateSubscribers.notify(this.current)
        }),
        (this.scheduleVelocityCheck = () => b.postRender(this.velocityCheck)),
        (this.velocityCheck = ({ timestamp: t }) => {
          this.canTrackVelocity || (this.canTrackVelocity = x(this.current)),
            t !== this.lastUpdated && (this.prev = this.current)
        }),
        (this.prev = this.current = t),
        (this.canTrackVelocity = x(this.current))
    }
    onChange(t) {
      return this.updateSubscribers.add(t)
    }
    clearListeners() {
      this.updateSubscribers.clear()
    }
    set(t) {
      this.updateAndNotify(t)
    }
    get() {
      return this.current
    }
    getPrevious() {
      return this.prev
    }
    getVelocity() {
      return this.canTrackVelocity
        ? i.velocityPerSecond(
            parseFloat(this.current) - parseFloat(this.prev),
            this.timeDelta,
          )
        : 0
    }
    start(t) {
      return (
        this.stop(),
        new Promise((e) => {
          const { stop: n } = t(e)
          this.stopAnimation = n
        }).then(() => this.clearAnimation())
      )
    }
    stop() {
      this.stopAnimation && this.stopAnimation(), this.clearAnimation()
    }
    isAnimating() {
      return !!this.stopAnimation
    }
    clearAnimation() {
      this.stopAnimation = null
    }
    destroy() {
      this.updateSubscribers.clear(), this.stop()
    }
  }
  const { isArray: V } = Array
  function E() {
    const t = {},
      n = (n) => {
        const r = (n) => {
          t[n] && (t[n].stop(), t[n].destroy(), e.del(t, n))
        }
        n ? (V(n) ? n.forEach(r) : r(n)) : Object.keys(t).forEach(r)
      }
    return (
      r.tryOnUnmounted(n),
      {
        motionValues: t,
        get: (n, r, i) => {
          if (t[n]) return t[n]
          const s = new k(r)
          return (
            s.onChange((t) => {
              e.set(i, n, t)
            }),
            e.set(t, n, s),
            s
          )
        },
        stop: n,
      }
    )
  }
  var A = function (t, e) {
      return function (n) {
        return Math.max(Math.min(n, e), t)
      }
    },
    T = function (t) {
      return t % 1 ? Number(t.toFixed(5)) : t
    },
    L = /(-)?([\d]*\.?[\d])+/g,
    C =
      /(#[0-9a-f]{6}|#[0-9a-f]{3}|#(?:[0-9a-f]{2}){2,4}|(rgb|hsl)a?\((-?[\d\.]+%?[,\s]+){2,3}\s*\/*\s*[\d\.]+%?\))/gi,
    I =
      /^(#[0-9a-f]{3}|#(?:[0-9a-f]{2}){2,4}|(rgb|hsl)a?\((-?[\d\.]+%?[,\s]+){2,3}\s*\/*\s*[\d\.]+%?\))$/i
  function R(t) {
    return 'string' == typeof t
  }
  var P = {
      test: function (t) {
        return 'number' == typeof t
      },
      parse: parseFloat,
      transform: function (t) {
        return t
      },
    },
    M = o(o({}, P), { transform: A(0, 1) }),
    S = o(o({}, P), { default: 1 }),
    z = function (t) {
      return {
        test: function (e) {
          return R(e) && e.endsWith(t) && 1 === e.split(' ').length
        },
        parse: parseFloat,
        transform: function (e) {
          return '' + e + t
        },
      }
    },
    F = z('deg'),
    B = z('%'),
    N = z('px'),
    W = o(o({}, B), {
      parse: function (t) {
        return B.parse(t) / 100
      },
      transform: function (t) {
        return B.transform(100 * t)
      },
    }),
    U = function (t, e) {
      return function (n) {
        return Boolean(
          (R(n) && I.test(n) && n.startsWith(t)) ||
            (e && Object.prototype.hasOwnProperty.call(n, e)),
        )
      }
    },
    X = function (t, e, n) {
      return function (r) {
        var i
        if (!R(r)) return r
        var s = r.match(L),
          o = s[1],
          a = s[2],
          c = s[3]
        return (
          ((i = {})[t] = parseFloat(s[0])),
          (i[e] = parseFloat(o)),
          (i[n] = parseFloat(a)),
          (i.alpha = void 0 !== c ? parseFloat(c) : 1),
          i
        )
      }
    },
    Y = {
      test: U('hsl', 'hue'),
      parse: X('hue', 'saturation', 'lightness'),
      transform: function (t) {
        var e = t.saturation,
          n = t.lightness,
          r = t.alpha,
          i = void 0 === r ? 1 : r
        return (
          'hsla(' +
          Math.round(t.hue) +
          ', ' +
          B.transform(T(e)) +
          ', ' +
          B.transform(T(n)) +
          ', ' +
          T(M.transform(i)) +
          ')'
        )
      },
    },
    Z = A(0, 255),
    D = o(o({}, P), {
      transform: function (t) {
        return Math.round(Z(t))
      },
    }),
    $ = {
      test: U('rgb', 'red'),
      parse: X('red', 'green', 'blue'),
      transform: function (t) {
        var e = t.green,
          n = t.blue,
          r = t.alpha,
          i = void 0 === r ? 1 : r
        return (
          'rgba(' +
          D.transform(t.red) +
          ', ' +
          D.transform(e) +
          ', ' +
          D.transform(n) +
          ', ' +
          T(M.transform(i)) +
          ')'
        )
      },
    }
  var _ = {
      test: U('#'),
      parse: function (t) {
        var e = '',
          n = '',
          r = '',
          i = ''
        return (
          t.length > 5
            ? ((e = t.substr(1, 2)),
              (n = t.substr(3, 2)),
              (r = t.substr(5, 2)),
              (i = t.substr(7, 2)))
            : ((e = t.substr(1, 1)),
              (n = t.substr(2, 1)),
              (r = t.substr(3, 1)),
              (i = t.substr(4, 1)),
              (e += e),
              (n += n),
              (r += r),
              (i += i)),
          {
            red: parseInt(e, 16),
            green: parseInt(n, 16),
            blue: parseInt(r, 16),
            alpha: i ? parseInt(i, 16) / 255 : 1,
          }
        )
      },
      transform: $.transform,
    },
    H = {
      test: function (t) {
        return $.test(t) || _.test(t) || Y.test(t)
      },
      parse: function (t) {
        return $.test(t) ? $.parse(t) : Y.test(t) ? Y.parse(t) : _.parse(t)
      },
      transform: function (t) {
        return R(t)
          ? t
          : t.hasOwnProperty('red')
          ? $.transform(t)
          : Y.transform(t)
      },
    },
    q = '${c}',
    Q = '${n}'
  function G(t) {
    var e = [],
      n = 0,
      r = t.match(C)
    r &&
      ((n = r.length), (t = t.replace(C, q)), e.push.apply(e, r.map(H.parse)))
    var i = t.match(L)
    return (
      i && ((t = t.replace(L, Q)), e.push.apply(e, i.map(P.parse))),
      { values: e, numColors: n, tokenised: t }
    )
  }
  function J(t) {
    return G(t).values
  }
  function K(t) {
    var e = G(t),
      n = e.numColors,
      r = e.tokenised,
      i = e.values.length
    return function (t) {
      for (var e = r, s = 0; s < i; s++)
        e = e.replace(s < n ? q : Q, s < n ? H.transform(t[s]) : T(t[s]))
      return e
    }
  }
  var tt = function (t) {
    return 'number' == typeof t ? 0 : t
  }
  var et = {
      test: function (t) {
        var e, n, r, i
        return (
          isNaN(t) &&
          R(t) &&
          (null !==
            (n =
              null === (e = t.match(L)) || void 0 === e ? void 0 : e.length) &&
          void 0 !== n
            ? n
            : 0) +
            (null !==
              (i =
                null === (r = t.match(C)) || void 0 === r
                  ? void 0
                  : r.length) && void 0 !== i
              ? i
              : 0) >
            0
        )
      },
      parse: J,
      createTransformer: K,
      getAnimatableNone: function (t) {
        var e = J(t)
        return K(t)(e.map(tt))
      },
    },
    nt = new Set(['brightness', 'contrast', 'saturate', 'opacity'])
  function rt(t) {
    var e = t.slice(0, -1).split('('),
      n = e[0],
      r = e[1]
    if ('drop-shadow' === n) return t
    var i = (r.match(L) || [])[0]
    if (!i) return t
    var s = r.replace(i, ''),
      o = nt.has(n) ? 1 : 0
    return i !== r && (o *= 100), n + '(' + o + s + ')'
  }
  var it = /([a-z-]*)\(.*?\)/g,
    st = o(o({}, et), {
      getAnimatableNone: function (t) {
        var e = t.match(it)
        return e ? e.map(rt).join(' ') : t
      },
    })
  const ot = () => ({
      type: 'spring',
      stiffness: 500,
      damping: 25,
      restDelta: 0.5,
      restSpeed: 10,
    }),
    at = (t) => ({
      type: 'spring',
      stiffness: 550,
      damping: 0 === t ? 2 * Math.sqrt(550) : 30,
      restDelta: 0.01,
      restSpeed: 10,
    }),
    ct = () => ({ type: 'keyframes', ease: 'linear', duration: 300 }),
    ut = (t) => ({ type: 'keyframes', duration: 800, values: t }),
    lt = {
      default: (t) => ({
        type: 'spring',
        stiffness: 550,
        damping: 0 === t ? 100 : 30,
        restDelta: 0.01,
        restSpeed: 10,
      }),
      x: ot,
      y: ot,
      z: ot,
      rotate: ot,
      rotateX: ot,
      rotateY: ot,
      rotateZ: ot,
      scaleX: at,
      scaleY: at,
      scale: at,
      backgroundColor: ct,
      color: ct,
      opacity: ct,
    },
    pt = (t, e) => {
      let n
      return (
        (n = Array.isArray(e) ? ut : lt[t] || lt.default),
        Object.assign({ to: e }, n(e))
      )
    },
    ft = Object.assign(Object.assign({}, P), { transform: Math.round }),
    dt = {
      color: H,
      backgroundColor: H,
      outlineColor: H,
      fill: H,
      stroke: H,
      borderColor: H,
      borderTopColor: H,
      borderRightColor: H,
      borderBottomColor: H,
      borderLeftColor: H,
      borderWidth: N,
      borderTopWidth: N,
      borderRightWidth: N,
      borderBottomWidth: N,
      borderLeftWidth: N,
      borderRadius: N,
      radius: N,
      borderTopLeftRadius: N,
      borderTopRightRadius: N,
      borderBottomRightRadius: N,
      borderBottomLeftRadius: N,
      width: N,
      maxWidth: N,
      height: N,
      maxHeight: N,
      size: N,
      top: N,
      right: N,
      bottom: N,
      left: N,
      padding: N,
      paddingTop: N,
      paddingRight: N,
      paddingBottom: N,
      paddingLeft: N,
      margin: N,
      marginTop: N,
      marginRight: N,
      marginBottom: N,
      marginLeft: N,
      rotate: F,
      rotateX: F,
      rotateY: F,
      rotateZ: F,
      scale: S,
      scaleX: S,
      scaleY: S,
      scaleZ: S,
      skew: F,
      skewX: F,
      skewY: F,
      distance: N,
      translateX: N,
      translateY: N,
      translateZ: N,
      x: N,
      y: N,
      z: N,
      perspective: N,
      transformPerspective: N,
      opacity: M,
      originX: W,
      originY: W,
      originZ: N,
      zIndex: ft,
      filter: st,
      WebkitFilter: st,
      fillOpacity: M,
      strokeOpacity: M,
      numOctaves: ft,
    },
    mt = (t) => dt[t],
    vt = (t, e) =>
      e && 'number' == typeof t && e.transform ? e.transform(t) : t
  const yt = {
      linear: i.linear,
      easeIn: i.easeIn,
      easeInOut: i.easeInOut,
      easeOut: i.easeOut,
      circIn: i.circIn,
      circInOut: i.circInOut,
      circOut: i.circOut,
      backIn: i.backIn,
      backInOut: i.backInOut,
      backOut: i.backOut,
      anticipate: i.anticipate,
      bounceIn: i.bounceIn,
      bounceInOut: i.bounceInOut,
      bounceOut: i.bounceOut,
    },
    ht = (t) => {
      if (Array.isArray(t)) {
        const [e, n, r, s] = t
        return i.cubicBezier(e, n, r, s)
      }
      return 'string' == typeof t ? yt[t] : t
    },
    bt = (t, e) =>
      'zIndex' !== t &&
      (!('number' != typeof e && !Array.isArray(e)) ||
        !('string' != typeof e || !et.test(e) || e.startsWith('url(')))
  function gt(t) {
    var { ease: e, times: n, delay: r } = t,
      i = a(t, ['ease', 'times', 'delay'])
    const s = Object.assign({}, i)
    return (
      n && (s.offset = n),
      e &&
        (s.ease = ((t) => Array.isArray(t) && 'number' != typeof t[0])(e)
          ? e.map(ht)
          : ht(e)),
      r && (s.elapsed = -r),
      s
    )
  }
  function Ot(t, e, n) {
    return (
      Array.isArray(e.to) && (t.duration || (t.duration = 800)),
      (function (t) {
        Array.isArray(t.to) &&
          null === t.to[0] &&
          ((t.to = [...t.to]), (t.to[0] = t.from))
      })(e),
      (function (t) {
        var e = a(t, ['delay', 'repeat', 'repeatType', 'repeatDelay', 'from'])
        return !!Object.keys(e).length
      })(t) || (t = Object.assign(Object.assign({}, t), pt(n, e.to))),
      Object.assign(Object.assign({}, e), gt(t))
    )
  }
  function wt(t, e, n, r, s) {
    const o = (function (t, e) {
      return t[e] || t.default || t
    })(r, t)
    let a = null == o.from ? e.get() : o.from
    const c = bt(t, n)
    'none' === a &&
      c &&
      'string' == typeof n &&
      (a = (function (t, e) {
        let n = mt(t)
        return (
          n !== st && (n = et),
          n.getAnimatableNone ? n.getAnimatableNone(e) : void 0
        )
      })(t, n))
    return bt(t, a) && c && !1 !== o.type
      ? function (c) {
          const u = {
            from: a,
            to: n,
            velocity: r.velocity ? r.velocity : e.getVelocity(),
            onUpdate: (t) => e.set(t),
          }
          return 'inertia' === o.type || 'decay' === o.type
            ? i.inertia(Object.assign(Object.assign({}, u), o))
            : i.animate(
                Object.assign(Object.assign({}, Ot(o, u, t)), {
                  onUpdate: (t) => {
                    u.onUpdate(t), o.onUpdate && o.onUpdate(t)
                  },
                  onComplete: () => {
                    r.onComplete && r.onComplete(), s && s(), c && c()
                  },
                }),
              )
        }
      : function (t) {
          return (
            e.set(n),
            r.onComplete && r.onComplete(),
            s && s(),
            t && t(),
            { stop: () => {} }
          )
        }
  }
  function jt() {
    const { motionValues: t, stop: e, get: n } = E()
    return {
      motionValues: t,
      stop: e,
      push: (t, e, r, i = {}, s) => {
        const o = n(t, r[t], r)
        if (i && i.immediate) return void o.set(e)
        const a = wt(t, o, e, i, s)
        o.start(a)
      },
    }
  }
  function xt(t, r = {}, { push: i, stop: s } = jt()) {
    const o = e.unref(r),
      a = (t) => {
        if (!o || !o[t]) throw new Error(`The variant ${t} does not exist.`)
        return o[t]
      },
      u = (e) => (
        'string' == typeof e && (e = a(e)),
        Promise.all(
          Object.entries(e).map(([n, r]) => {
            if ('transition' !== n)
              return new Promise((s) => {
                i(n, r, t, e.transition || pt(n, e[n]), s)
              })
          }),
        )
      )
    return {
      apply: u,
      set: (e) => {
        let r = n.isObject(e) ? e : a(e)
        Object.entries(r).forEach(([e, n]) => {
          'transition' !== e && i(e, n, t, { immediate: !0 })
        })
      },
      stopTransitions: s,
      leave: (t) =>
        c(this, void 0, void 0, function* () {
          let e
          o &&
            (o.leave && (e = o.leave),
            !o.leave && o.initial && (e = o.initial)),
            e ? (yield u(e), t()) : t()
        }),
    }
  }
  const kt = 'undefined' != typeof window
  function Vt({ target: t, state: r, variants: i, apply: s }) {
    const o = e.unref(i),
      a = e.ref(!1),
      c = e.ref(!1),
      u = e.ref(!1),
      l = e.computed(() => {
        let t = []
        return o
          ? (o.hovered && (t = [...t, ...Object.keys(o.hovered)]),
            o.tapped && (t = [...t, ...Object.keys(o.tapped)]),
            o.focused && (t = [...t, ...Object.keys(o.focused)]),
            t)
          : t
      }),
      p = e.computed(() => {
        const t = {}
        Object.assign(t, r.value),
          a.value && o.hovered && Object.assign(t, o.hovered),
          c.value && o.tapped && Object.assign(t, o.tapped),
          u.value && o.focused && Object.assign(t, o.focused)
        for (const e in t) l.value.includes(e) || delete t[e]
        return t
      })
    e.watch(
      () => n.unrefElement(t),
      (t) => {
        t &&
          o &&
          (o.hovered &&
            (n.useEventListener(t, 'mouseenter', () => {
              a.value = !0
            }),
            n.useEventListener(t, 'mouseleave', () => {
              ;(a.value = !1), (c.value = !1)
            }),
            n.useEventListener(t, 'mouseout', () => {
              ;(a.value = !1), (c.value = !1)
            })),
          o.tapped &&
            (kt &&
              null === window.onmousedown &&
              (n.useEventListener(t, 'mousedown', () => {
                c.value = !0
              }),
              n.useEventListener(t, 'mouseup', () => {
                c.value = !1
              })),
            kt &&
              null === window.onpointerdown &&
              (n.useEventListener(t, 'pointerdown', () => {
                c.value = !0
              }),
              n.useEventListener(t, 'pointerup', () => {
                c.value = !1
              })),
            kt &&
              null === window.ontouchstart &&
              (n.useEventListener(t, 'touchstart', () => {
                c.value = !0
              }),
              n.useEventListener(t, 'touchend', () => {
                c.value = !1
              }))),
          o.focused &&
            (n.useEventListener(t, 'focus', () => {
              u.value = !0
            }),
            n.useEventListener(t, 'blur', () => {
              u.value = !1
            })))
      },
      { immediate: !0 },
    ),
      e.watch(p, (t) => {
        s(t)
      })
  }
  function Et(
    t,
    r = {
      syncVariants: !0,
      lifeCycleHooks: !0,
      visibilityHooks: !0,
      eventListeners: !0,
    },
  ) {
    r.lifeCycleHooks &&
      (function ({ target: t, variants: n, variant: r }) {
        const i = e.unref(n)
        e.watch(
          () => t,
          () => {
            i &&
              i.enter &&
              (i.initial && (r.value = 'initial'),
              e.nextTick(() => (r.value = 'enter')))
          },
          { immediate: !0, flush: 'pre' },
        )
      })(t),
      r.syncVariants &&
        (function ({ state: t, apply: n }) {
          e.watch(
            t,
            (t) => {
              t && n(t)
            },
            { immediate: !0 },
          )
        })(t),
      r.visibilityHooks &&
        (function ({ target: t, variants: r, variant: i }) {
          const s = e.unref(r)
          let o = n.noop
          const a = e.watch(
            () => n.unrefElement(t),
            (e) => {
              e &&
                (o = n.useIntersectionObserver(t, ([{ isIntersecting: t }]) => {
                  s && s.visible && (i.value = t ? 'visible' : 'initial')
                }).stop)
            },
            { immediate: !0 },
          )
        })(t),
      r.eventListeners && Vt(t)
  }
  function At(t = {}) {
    const n = e.reactive(Object.assign({}, t)),
      r = e.ref({})
    return (
      e.watch(
        n,
        () => {
          const t = {}
          for (const [e, r] of Object.entries(n)) {
            const n = mt(e),
              i = vt(r, n)
            t[e] = i
          }
          r.value = t
        },
        { immediate: !0, deep: !0 },
      ),
      { state: n, style: r }
    )
  }
  const Tt = ['', 'X', 'Y', 'Z'],
    Lt = ['transformPerspective', 'x', 'y', 'z']
  ;['perspective', 'translate', 'scale', 'rotate', 'skew'].forEach((t) => {
    Tt.forEach((e) => {
      Lt.push(t + e)
    })
  })
  const Ct = new Set(Lt)
  function It(t) {
    return Ct.has(t)
  }
  const Rt = new Set(['originX', 'originY', 'originZ'])
  function Pt(t) {
    return Rt.has(t)
  }
  function Mt(t, r) {
    let i, s
    const { state: o, style: a } = At(),
      c = e.watch(
        () => n.unrefElement(t),
        (t) => {
          if (t) {
            s = t
            for (const n of Object.keys(dt))
              null === t.style[n] ||
                '' === t.style[n] ||
                It(n) ||
                Pt(n) ||
                e.set(o, n, t.style[n])
            i && Object.entries(i).forEach(([n, r]) => e.set(t.style, n, r)),
              r && r(o)
          }
        },
        { immediate: !0 },
      ),
      u = e.watch(
        a,
        (t) => {
          if (s) for (const n in t) e.set(s.style, n, t[n])
          else i = t
        },
        { immediate: !0 },
      )
    return {
      style: o,
      stop: () => {
        c(), u()
      },
    }
  }
  const St = { x: 'translateX', y: 'translateY', z: 'translateZ' }
  function zt(t = {}, n = !0) {
    const r = e.reactive(Object.assign({}, t)),
      i = e.ref('')
    return (
      e.watch(
        r,
        (t) => {
          let e = '',
            r = !1
          if (n && (t.x || t.y || t.z)) {
            ;(e += `translate3d(${[t.x || 0, t.y || 0, t.z || 0]
              .map(N.transform)
              .join(',')}) `),
              (r = !0)
          }
          for (const [r, i] of Object.entries(t)) {
            if (n && ('x' === r || 'y' === r || 'z' === r)) continue
            const t = mt(r),
              s = vt(i, t)
            e += `${St[r] || r}(${s}) `
          }
          n && !r && (e += 'translateZ(0px) '), (i.value = e.trim())
        },
        { immediate: !0, deep: !0 },
      ),
      { state: r, transform: i }
    )
  }
  function Ft(t) {
    const e = t.trim().split(/\) |\)/)
    if (1 === e.length) return {}
    return e.reduce((t, e) => {
      if (!e) return t
      const [n, r] = e.split('('),
        i = r
          .split(',')
          .map((t) =>
            ((t) =>
              t.endsWith('px') || t.endsWith('deg')
                ? parseFloat(t)
                : isNaN(Number(t))
                ? Number(t)
                : t)(t.endsWith(')') ? t.replace(')', '') : t.trim()),
          ),
        s = 1 === i.length ? i[0] : i
      return Object.assign(Object.assign({}, t), { [n]: s })
    }, {})
  }
  function Bt(t, r) {
    let i, s
    const { state: o, transform: a } = zt(),
      c = e.watch(
        () => n.unrefElement(t),
        (t) => {
          t &&
            ((s = t),
            t.style.transform &&
              (function (t, n) {
                Object.entries(Ft(n)).forEach(([n, r]) => {
                  r = parseFloat(r)
                  const i = ['x', 'y', 'z']
                  'translate3d' !== n
                    ? e.set(
                        t,
                        'translateX' !== n
                          ? 'translateY' !== n
                            ? 'translateZ' !== n
                              ? n
                              : 'z'
                            : 'y'
                          : 'x',
                        r,
                      )
                    : r.forEach((n, r) => {
                        e.set(t, i[r], n)
                      })
                })
              })(o, t.style.transform),
            i && (t.style.transform = i),
            r && r(o))
        },
        { immediate: !0 },
      ),
      u = e.watch(
        a,
        (t) => {
          s ? (s.style.transform = t) : (i = t)
        },
        { immediate: !0 },
      )
    return {
      transform: o,
      stop: () => {
        c(), u()
      },
    }
  }
  function Nt(t, r) {
    const i = e.reactive({}),
      s = (t) => {
        Object.entries(t).forEach(([t, n]) => {
          e.set(i, t, n)
        })
      },
      { style: o, stop: a } = Mt(t, s),
      { transform: c, stop: u } = Bt(t, s),
      l = e.watch(
        i,
        (t) => {
          Object.entries(t).forEach(([t, n]) => {
            const r = It(t) ? c : o
            ;(r[t] && r[t] === n) || e.set(r, t, n)
          })
        },
        { immediate: !0, deep: !0 },
      ),
      p = e.watch(
        () => n.unrefElement(t),
        (t) => {
          t && r && s(r)
        },
        { immediate: !0 },
      )
    return {
      motionProperties: i,
      style: o,
      transform: c,
      stop: () => {
        a(), u(), l(), p()
      },
    }
  }
  function Wt(t = {}) {
    const n = e.unref(t),
      r = e.ref()
    return {
      state: e.computed(() => {
        if (r.value) return n[r.value]
      }),
      variant: r,
    }
  }
  function Ut(t, e = {}, n) {
    const { motionProperties: r } = Nt(t),
      { variant: i, state: s } = Wt(e),
      o = xt(r, e),
      a = Object.assign(
        { target: t, variant: i, variants: e, state: s, motionProperties: r },
        o,
      )
    return Et(a, n), a
  }
  const Xt = [
      'initial',
      'enter',
      'leave',
      'visible',
      'hovered',
      'tapped',
      'focused',
      'delay',
    ],
    Yt = (t) => {
      const r = (r, i, o) => {
          const a = e.ref(t || {})
          ;((t, e) => {
            const r = t.props
              ? t.props
              : t.data && t.data.attrs
              ? t.data.attrs
              : {}
            r &&
              (r.variants &&
                n.isObject(r.variants) &&
                (e.value = Object.assign(
                  Object.assign({}, e.value),
                  r.variants,
                )),
              Xt.forEach((t) => {
                if ('delay' !== t)
                  r && r[t] && n.isObject(r[t]) && (e.value[t] = r[t])
                else if (r && r[t] && n.isNumber(r[t])) {
                  const n = r[t]
                  e &&
                    e.value &&
                    (e.value.enter &&
                      (e.value.enter.transition ||
                        (e.value.enter.transition = {}),
                      (e.value.enter.transition = Object.assign(
                        Object.assign({}, e.value.enter.transition),
                        { delay: n },
                      ))),
                    e.value.visible &&
                      (e.value.visible.transition ||
                        (e.value.visible.transition = {}),
                      (e.value.visible.transition = Object.assign(
                        Object.assign({}, e.value.visible.transition),
                        { delay: n },
                      ))))
                }
              }))
          })(o, a)
          const c = Ut(r, a)
          i.value && e.set(s, i.value, c)
        },
        i = (t, n, r) => {
          n.value && s[n.value] && e.del(s, n.value)
        }
      return { created: r, unmounted: i, bind: r, unbind: i }
    },
    Zt = { initial: { opacity: 0 }, enter: { opacity: 1 } },
    Dt = { initial: { opacity: 0 }, visible: { opacity: 1 } },
    $t = { initial: { scale: 0, opacity: 0 }, enter: { scale: 1, opacity: 1 } },
    _t = {
      initial: { scale: 0, opacity: 0 },
      visible: { scale: 1, opacity: 1 },
    },
    Ht = {
      initial: { x: -100, rotate: 90, opacity: 0 },
      enter: { x: 0, rotate: 0, opacity: 1 },
    },
    qt = {
      initial: { x: -100, rotate: 90, opacity: 0 },
      visible: { x: 0, rotate: 0, opacity: 1 },
    },
    Qt = {
      initial: { x: 100, rotate: -90, opacity: 0 },
      enter: { x: 0, rotate: 0, opacity: 1 },
    },
    Gt = {
      initial: { x: 100, rotate: -90, opacity: 0 },
      visible: { x: 0, rotate: 0, opacity: 1 },
    },
    Jt = {
      initial: { y: -100, rotate: -90, opacity: 0 },
      enter: { y: 0, rotate: 0, opacity: 1 },
    },
    Kt = {
      initial: { y: -100, rotate: -90, opacity: 0 },
      visible: { y: 0, rotate: 0, opacity: 1 },
    },
    te = {
      initial: { y: 100, rotate: 90, opacity: 0 },
      enter: { y: 0, rotate: 0, opacity: 1 },
    },
    ee = {
      initial: { y: 100, rotate: 90, opacity: 0 },
      visible: { y: 0, rotate: 0, opacity: 1 },
    },
    ne = { initial: { x: -100, opacity: 0 }, enter: { x: 0, opacity: 1 } },
    re = { initial: { x: -100, opacity: 0 }, visible: { x: 0, opacity: 1 } },
    ie = { initial: { x: 100, opacity: 0 }, enter: { x: 0, opacity: 1 } },
    se = { initial: { x: 100, opacity: 0 }, visible: { x: 0, opacity: 1 } },
    oe = { initial: { y: -100, opacity: 0 }, enter: { y: 0, opacity: 1 } },
    ae = { initial: { y: -100, opacity: 0 }, visible: { y: 0, opacity: 1 } },
    ce = { initial: { y: 100, opacity: 0 }, enter: { y: 0, opacity: 1 } },
    ue = { initial: { y: 100, opacity: 0 }, visible: { y: 0, opacity: 1 } }
  var le = Object.freeze({
    __proto__: null,
    fade: Zt,
    fadeVisible: Dt,
    pop: $t,
    popVisible: _t,
    rollBottom: te,
    rollLeft: Ht,
    rollRight: Qt,
    rollTop: Jt,
    rollVisibleBottom: ee,
    rollVisibleLeft: qt,
    rollVisibleRight: Gt,
    rollVisibleTop: Kt,
    slideBottom: ce,
    slideLeft: ne,
    slideRight: ie,
    slideTop: oe,
    slideVisibleBottom: ue,
    slideVisibleLeft: re,
    slideVisibleRight: se,
    slideVisibleTop: ae,
  })
  function pe(t) {
    const e =
        'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;',
      n = new RegExp(e.split('').join('|'), 'g')
    return t
      .toString()
      .replace(/[A-Z]/g, (t) => '-' + t)
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(n, (t) =>
        'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------'.charAt(
          e.indexOf(t),
        ),
      )
      .replace(/&/g, '-and-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '')
  }
  const fe = {
    install(t, e) {
      if ((t.directive('motion', Yt()), !e || (e && !e.excludePresets)))
        for (const e in le) {
          const n = le[e]
          t.directive(`motion-${pe(e)}`, Yt(n))
        }
      if (e && e.directives)
        for (const n in e.directives) {
          const r = e.directives[n]
          0, t.directive(`motion-${n}`, Yt(r))
        }
    },
  }
  return (
    (t.MotionDirective = Yt),
    (t.MotionPlugin = fe),
    (t.fade = Zt),
    (t.fadeVisible = Dt),
    (t.isMotionInstance = function (t) {
      const n = t
      return (
        void 0 !== n.apply &&
        r.isFunction(n.apply) &&
        void 0 !== n.set &&
        r.isFunction(n.set) &&
        void 0 !== n.stopTransitions &&
        r.isFunction(n.stopTransitions) &&
        void 0 !== n.target &&
        e.isRef(n.target)
      )
    }),
    (t.pop = $t),
    (t.popVisible = _t),
    (t.reactiveStyle = At),
    (t.reactiveTransform = zt),
    (t.rollBottom = te),
    (t.rollLeft = Ht),
    (t.rollRight = Qt),
    (t.rollTop = Jt),
    (t.rollVisibleBottom = ee),
    (t.rollVisibleLeft = qt),
    (t.rollVisibleRight = Gt),
    (t.rollVisibleTop = Kt),
    (t.slideBottom = ce),
    (t.slideLeft = ne),
    (t.slideRight = ie),
    (t.slideTop = oe),
    (t.slideVisibleBottom = ue),
    (t.slideVisibleLeft = re),
    (t.slideVisibleRight = se),
    (t.slideVisibleTop = ae),
    (t.slugify = pe),
    (t.useElementStyle = Mt),
    (t.useElementTransform = Bt),
    (t.useMotion = Ut),
    (t.useMotionControls = xt),
    (t.useMotionProperties = Nt),
    (t.useMotionTransitions = jt),
    (t.useMotionVariants = Wt),
    (t.useMotions = function () {
      return s
    }),
    (t.useReducedMotion = function (t = {}) {
      return n.useMediaQuery('(prefers-reduced-motion: reduce)', t)
    }),
    (t.useSpring = function (t, e) {
      const { stop: n, get: r } = E()
      return {
        values: t,
        stop: n,
        set: (n) =>
          Promise.all(
            Object.entries(n).map(([n, s]) => {
              const o = r(n, t[n], t)
              return o.start((t) => {
                const r = Object.assign({ type: 'spring' }, e || pt(n, s))
                return i.animate(
                  Object.assign(
                    {
                      from: o.get(),
                      to: s,
                      velocity: o.getVelocity(),
                      onUpdate: (t) => o.set(t),
                      onComplete: t,
                    },
                    r,
                  ),
                )
              })
            }),
          ),
      }
    }),
    Object.defineProperty(t, '__esModule', { value: !0 }),
    t
  )
})({}, VueDemi, VueUse, shared, popmotion)
