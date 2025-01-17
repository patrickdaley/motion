/*!
 * @vueuse/motion v1.6.0
 * (c) 2021
 * @license MIT
 */
import * as vue_demi from 'vue-demi'
import {
  CSSProperties,
  SVGAttributes,
  Ref,
  UnwrapRef,
  Directive,
  Plugin,
} from 'vue-demi'
import { VueInstance, MaybeRef, Fn } from '@vueuse/core'
import * as csstype from 'csstype'
import { MaybeRef as MaybeRef$1 } from '@vueuse/shared'

declare type GenericHandler = (...args: any) => void
/**
 * A generic subscription manager.
 */
declare class SubscriptionManager<Handler extends GenericHandler> {
  private subscriptions
  add(handler: Handler): () => undefined
  notify(
    /**
     * Using ...args would be preferable but it's array creation and this
     * might be fired every frame.
     */
    a?: Parameters<Handler>[0],
    b?: Parameters<Handler>[1],
    c?: Parameters<Handler>[2],
  ): void
  clear(): void
}

/**
 * `MotionValue` is used to track the state and velocity of motion values.
 */
declare class MotionValue<V = any> {
  /**
   * The current state of the `MotionValue`.
   */
  private current
  /**
   * The previous state of the `MotionValue`.
   */
  private prev
  /**
   * Duration, in milliseconds, since last updating frame.
   */
  private timeDelta
  /**
   * Timestamp of the last time this `MotionValue` was updated.
   */
  private lastUpdated
  /**
   * Functions to notify when the `MotionValue` updates.
   */
  updateSubscribers: SubscriptionManager<Subscriber<V>>
  /**
   * A reference to the currently-controlling Popmotion animation
   */
  private stopAnimation?
  /**
   * Tracks whether this value can output a velocity.
   */
  private canTrackVelocity
  /**
   * @param init - The initiating value
   * @param config - Optional configuration options
   */
  constructor(init: V)
  /**
   * Adds a function that will be notified when the `MotionValue` is updated.
   *
   * It returns a function that, when called, will cancel the subscription.
   */
  onChange(subscription: Subscriber<V>): () => void
  clearListeners(): void
  /**
   * Sets the state of the `MotionValue`.
   *
   * @param v
   * @param render
   */
  set(v: V): void
  /**
   * Update and notify `MotionValue` subscribers.
   *
   * @param v
   * @param render
   */
  updateAndNotify: (v: V) => void
  /**
   * Returns the latest state of `MotionValue`
   *
   * @returns - The latest state of `MotionValue`
   */
  get(): V
  /**
   * Get previous value.
   *
   * @returns - The previous latest state of `MotionValue`
   */
  getPrevious(): V
  /**
   * Returns the latest velocity of `MotionValue`
   *
   * @returns - The latest velocity of `MotionValue`. Returns `0` if the state is non-numerical.
   */
  getVelocity(): number
  /**
   * Schedule a velocity check for the next frame.
   */
  private scheduleVelocityCheck
  /**
   * Updates `prev` with `current` if the value hasn't been updated this frame.
   * This ensures velocity calculations return `0`.
   */
  private velocityCheck
  /**
   * Registers a new animation to control this `MotionValue`. Only one
   * animation can drive a `MotionValue` at one time.
   */
  start(animation: StartAnimation): Promise<void>
  /**
   * Stop the currently active animation.
   */
  stop(): void
  /**
   * Returns `true` if this value is currently animating.
   */
  isAnimating(): boolean
  /**
   * Clear the current animation reference.
   */
  private clearAnimation
  /**
   * Destroy and clean up subscribers to this `MotionValue`.
   */
  destroy(): void
}

declare type ResolvedKeyframesTarget =
  | [null, ...number[]]
  | number[]
  | [null, ...string[]]
  | string[]
declare type KeyframesTarget =
  | ResolvedKeyframesTarget
  | [null, ...CustomValueType[]]
  | CustomValueType[]
declare type ResolvedSingleTarget = string | number
declare type SingleTarget = ResolvedSingleTarget | CustomValueType
declare type ResolvedValueTarget =
  | ResolvedSingleTarget
  | ResolvedKeyframesTarget
declare type ValueTarget = SingleTarget | KeyframesTarget
declare type Props = {
  [key: string]: any
}
declare type EasingFunction = (v: number) => number
declare type Easing =
  | [number, number, number, number]
  | 'linear'
  | 'easeIn'
  | 'easeOut'
  | 'easeInOut'
  | 'circIn'
  | 'circOut'
  | 'circInOut'
  | 'backIn'
  | 'backOut'
  | 'backInOut'
  | 'anticipate'
  | EasingFunction
interface Orchestration {
  /**
   * Delay the animation by this duration (in seconds). Defaults to `0`.
   */
  delay?: number
  /**
   * Callback triggered on animation complete.
   */
  onComplete?: () => void
  /**
   * Should the value be set imediately
   */
  immediate?: boolean
}
interface Repeat {
  /**
   * The number of times to repeat the transition. Set to `Infinity` for perpetual repeating.
   *
   * Without setting `repeatType`, this will loop the animation.
   */
  repeat?: number
  /**
   * How to repeat the animation. This can be either:
   *
   * "loop": Repeats the animation from the start
   *
   * "reverse": Alternates between forward and backwards playback
   *
   * "mirror": Switchs `from` and `to` alternately
   */
  repeatType?: 'loop' | 'reverse' | 'mirror'
  /**
   * When repeating an animation, `repeatDelay` will set the
   * duration of the time to wait, in seconds, between each repetition.
   */
  repeatDelay?: number
}
/**
 * An animation that animates between two or more values over a specific duration of time.
 * This is the default animation for non-physical values like `color` and `opacity`.
 */
interface Tween extends Repeat {
  /**
   * Set `type` to `"tween"` to use a duration-based tween animation.
   * If any non-orchestration `transition` values are set without a `type` property,
   * this is used as the default animation.
   */
  type?: 'tween'
  /**
   * The duration of the tween animation. Set to `0.3` by default, 0r `0.8` if animating a series of keyframes.
   */
  duration?: number
  /**
   * The easing function to use. Set as one of the below.
   *
   * - The name of an existing easing function.
   * - An array of four numbers to define a cubic bezier curve.
   * - An easing function, that accepts and returns a value `0-1`.
   *
   * If the animating value is set as an array of multiple values for a keyframes
   * animation, `ease` can be set as an array of easing functions to set different easings between
   * each of those values.
   */
  ease?: Easing | Easing[]
  /**
   * The duration of time already elapsed in the animation. Set to `0` by
   * default.
   */
  elapsed?: number
  /**
   * When animating keyframes, `times` can be used to determine where in the animation each keyframe is reached.
   * Each value in `times` is a value between `0` and `1`, representing `duration`.
   *
   * There must be the same number of `times` as there are keyframes.
   * Defaults to an array of evenly-spread durations.
   */
  times?: number[]
  /**
   * When animating keyframes, `easings` can be used to define easing functions between each keyframe. This array should be one item fewer than the number of keyframes, as these easings apply to the transitions between the keyframes.
   */
  easings?: Easing[]
  /**
   * The value to animate from.
   * By default, this is the current state of the animating value.
   */
  from?: number | string
  to?: number | string | ValueTarget
  velocity?: number
  delay?: number
}
/**
 * An animation that simulates spring physics for realistic motion.
 * This is the default animation for physical values like `x`, `y`, `scale` and `rotate`.
 */
interface Spring extends Repeat {
  /**
   * Set `type` to `"spring"` to animate using spring physics for natural
   * movement. Type is set to `"spring"` by default.
   */
  type: 'spring'
  /**
   * Stiffness of the spring. Higher values will create more sudden movement.
   * Set to `100` by default.
   */
  stiffness?: number
  /**
   * Strength of opposing force. If set to 0, spring will oscillate
   * indefinitely. Set to `10` by default.
   */
  damping?: number
  /**
   * Mass of the moving object. Higher values will result in more lethargic
   * movement. Set to `1` by default.
   */
  mass?: number
  /**
   * The duration of the animation, defined in seconds. Spring animations can be a maximum of 10 seconds.
   *
   * If `bounce` is set, this defaults to `0.8`.
   *
   * Note: `duration` and `bounce` will be overridden if `stiffness`, `damping` or `mass` are set.
   */
  duration?: number
  /**
   * `bounce` determines the "bounciness" of a spring animation.
   *
   * `0` is no bounce, and `1` is extremely bouncy.
   *
   * If `duration` is set, this defaults to `0.25`.
   *
   * Note: `bounce` and `duration` will be overridden if `stiffness`, `damping` or `mass` are set.
   */
  bounce?: number
  /**
   * End animation if absolute speed (in units per second) drops below this
   * value and delta is smaller than `restDelta`. Set to `0.01` by default.
   */
  restSpeed?: number
  /**
   * End animation if distance is below this value and speed is below
   * `restSpeed`. When animation ends, spring gets “snapped” to. Set to
   * `0.01` by default.
   */
  restDelta?: number
  /**
   * The value to animate from.
   * By default, this is the initial state of the animating value.
   */
  from?: number | string
  to?: number | string | ValueTarget
  /**
   * The initial velocity of the spring. By default this is the current velocity of the component.
   */
  velocity?: number
  delay?: number
}
/**
 * An animation that decelerates a value based on its initial velocity,
 * usually used to implement inertial scrolling.
 *
 * Optionally, `min` and `max` boundaries can be defined, and inertia
 * will snap to these with a spring animation.
 *
 * This animation will automatically precalculate a target value,
 * which can be modified with the `modifyTarget` property.
 *
 * This allows you to add snap-to-grid or similar functionality.
 *
 * Inertia is also the animation used for `dragTransition`, and can be configured via that prop.
 */
interface Inertia {
  /**
   * Set `type` to animate using the inertia animation. Set to `"tween"` by
   * default. This can be used for natural deceleration, like momentum scrolling.
   */
  type: 'inertia'
  /**
   * A function that receives the automatically-calculated target and returns a new one. Useful for snapping the target to a grid.
   */
  modifyTarget?(v: number): number
  /**
   * If `min` or `max` is set, this affects the stiffness of the bounce
   * spring. Higher values will create more sudden movement. Set to `500` by
   * default.
   */
  bounceStiffness?: number
  /**
   * If `min` or `max` is set, this affects the damping of the bounce spring.
   * If set to `0`, spring will oscillate indefinitely. Set to `10` by
   * default.
   */
  bounceDamping?: number
  /**
   * A higher power value equals a further target. Set to `0.8` by default.
   */
  power?: number
  /**
   * Adjusting the time constant will change the duration of the
   * deceleration, thereby affecting its feel. Set to `700` by default.
   */
  timeConstant?: number
  /**
   * End the animation if the distance to the animation target is below this value, and the absolute speed is below `restSpeed`.
   * When the animation ends, the value gets snapped to the animation target. Set to `0.01` by default.
   * Generally the default values provide smooth animation endings, only in rare cases should you need to customize these.
   */
  restDelta?: number
  /**
   * Minimum constraint. If set, the value will "bump" against this value (or immediately spring to it if the animation starts as less than this value).
   */
  min?: number
  /**
   * Maximum constraint. If set, the value will "bump" against this value (or immediately snap to it, if the initial animation value exceeds this value).
   */
  max?: number
  /**
   * The value to animate from. By default, this is the current state of the animating value.
   */
  from?: number | string
  /**
   * The initial velocity of the animation.
   * By default this is the current velocity of the component.
   */
  velocity?: number
  delay?: number
}
/**
 * Keyframes tweens between multiple `values`.
 *
 * These tweens can be arranged using the `duration`, `easings`, and `times` properties.
 */
interface Keyframes {
  /**
   * Set `type` to `"keyframes"` to animate using the keyframes animation.
   * Set to `"tween"` by default. This can be used to animate between a series of values.
   */
  type: 'keyframes'
  /**
   * An array of values to animate between.
   */
  values: KeyframesTarget
  /**
   * An array of numbers between 0 and 1, where `1` represents the `total` duration.
   *
   * Each value represents at which point during the animation each item in the animation target should be hit, so the array should be the same length as `values`.
   *
   * Defaults to an array of evenly-spread durations.
   */
  times?: number[]
  /**
   * An array of easing functions for each generated tween, or a single easing function applied to all tweens.
   *
   * This array should be one item less than `values`, as these easings apply to the transitions *between* the `values`.
   */
  ease?: Easing | Easing[]
  /**
   * Popmotion's easing prop to define individual easings. `ease` will be mapped to this prop in keyframes animations.
   */
  easings?: Easing | Easing[]
  elapsed?: number
  /**
   * The total duration of the animation. Set to `0.3` by default.
   */
  duration?: number
  repeatDelay?: number
  from?: number | string
  to?: number | string | ValueTarget
  velocity?: number
  delay?: number
}
declare type PopmotionTransitionProps = Tween | Spring | Keyframes | Inertia
declare type PermissiveTransitionDefinition = {
  [key: string]: any
}
declare type TransitionDefinition =
  | Tween
  | Spring
  | Keyframes
  | Inertia
  | PermissiveTransitionDefinition
declare type TransitionMap = Orchestration & {
  [key: string]: TransitionDefinition
}
/**
 * Transition props
 */
declare type Transition =
  | (Orchestration & Repeat & TransitionDefinition)
  | (Orchestration & Repeat & TransitionMap)
declare type MakeCustomValueType<T> = {
  [K in keyof T]: T[K] | CustomValueType
}
declare type Target = MakeCustomValueType<MotionProperties>
declare type MakeKeyframes<T> = {
  [K in keyof T]: T[K] | T[K][] | [null, ...T[K][]]
}
declare type TargetWithKeyframes = MakeKeyframes<Target>
/**
 * An object that specifies values to animate to. Each value may be set either as
 * a single value, or an array of values.
 */
declare type TargetAndTransition = TargetWithKeyframes & {
  transition?: Transition
  transitionEnd?: Target
}
declare type TargetResolver = (
  custom: any,
  current: Target,
  velocity: Target,
) => TargetAndTransition
interface CustomValueType {
  mix: (from: any, to: any) => (p: number) => number | string
  toValue: () => number | string
}
declare type MotionValuesMap = {
  [key in keyof PermissiveMotionProperties]: MotionValue
}
interface MotionTransitions {
  /**
   * Stop ongoing transitions for the current element.
   */
  stop: (keys?: string | string[]) => void
  /**
   * Start a transition, push it to the `transitions` array.
   *
   * @param transition
   * @param values
   */
  push: (
    key: string,
    value: ResolvedValueTarget,
    target: MotionProperties,
    transition: Transition,
    onComplete?: () => void,
  ) => void
  /**
   * @internal Local transitions reference
   */
  motionValues: MotionValuesMap
}

/**
 * Permissive properties keys
 */
declare type PropertiesKeys = {
  [key: string]: string | number | undefined | any
}
/**
 * SVG Supported properties
 */
declare type SVGPathProperties = {
  pathLength?: number
  pathOffset?: number
  pathSpacing?: number
}
/**
 * Transform properties
 */
declare type TransformProperties = {
  x?: string | number
  y?: string | number
  z?: string | number
  translateX?: string | number
  translateY?: string | number
  translateZ?: string | number
  rotate?: string | number
  rotateX?: string | number
  rotateY?: string | number
  rotateZ?: string | number
  scale?: string | number
  scaleX?: string | number
  scaleY?: string | number
  scaleZ?: string | number
  skew?: string | number
  skewX?: string | number
  skewY?: string | number
  originX?: string | number
  originY?: string | number
  originZ?: string | number
  perspective?: string | number
  transformPerspective?: string | number
}
/**
 * Relevant styling properties
 */
declare type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
declare type StyleProperties = Omit<
  CSSProperties,
  | 'transition'
  | 'rotate'
  | 'scale'
  | 'perspective'
  | 'transform'
  | 'transformBox'
  | 'transformOrigin'
  | 'transformStyle'
>
/**
 * Available properties for useMotion variants
 */
declare type MotionProperties =
  | StyleProperties
  | SVGAttributes
  | TransformProperties
  | SVGPathProperties
/**
 * Permissive properties for useSpring
 */
declare type PermissiveMotionProperties = MotionProperties & {
  [key: string]: ResolvedSingleTarget
}
/**
 * Variant
 */
declare type Variant = {
  transition?: Transition
} & MotionProperties
/**
 * Motion variants object
 */
declare type MotionVariants = {
  initial?: Variant
  enter?: Variant
  leave?: Variant
  visible?: Variant
  hovered?: Variant
  tapped?: Variant
  focused?: Variant
  [key: string]: Variant | undefined
}

declare type PermissiveTarget = VueInstance | MotionTarget
declare type MotionTarget = HTMLElement | SVGElement | null | undefined
interface MotionInstance<T = MotionVariants> extends MotionControls {
  target: MaybeRef<PermissiveTarget>
  variants: MaybeRef<T>
  variant: Ref<keyof T>
  state: Ref<Variant | undefined>
  motionProperties: UnwrapRef<MotionProperties>
}
declare type UseMotionOptions = {
  syncVariants?: boolean
  lifeCycleHooks?: boolean
  visibilityHooks?: boolean
  eventListeners?: boolean
}
declare type MotionControls = {
  /**
   * Apply a variant declaration and execute the resolved transitions.
   *
   * @param variant
   * @returns Promise<void[]>
   */
  apply: (variant: Variant | string) => Promise<void[]> | undefined
  /**
   * Apply a variant declaration without transitions.
   *
   * @param variant
   */
  set: (variant: Variant | string) => void
  /**
   * Stop all the ongoing transitions for the current element.
   */
  stopTransitions: Fn
  /**
   * Helper to be passed to <transition> leave event.
   *
   * @param done
   */
  leave: (done: () => void) => void
}
declare type SpringControls = {
  /**
   * Apply new values with transitions.
   *
   * @param variant
   */
  set: (properties: MotionProperties) => void
  /**
   * Stop all transitions.
   *
   * @param variant
   */
  stop: (key?: string | string[]) => void
  /**
   * Object containing all the current values of the spring.
   *
   * @param
   */
  values: MotionProperties
}
declare type MotionInstanceBindings<T = MotionVariants> = {
  [key: string]: MotionInstance<T>
}
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $motions?: MotionInstanceBindings
  }
}
declare module '@vue/runtime-dom' {
  interface HTMLAttributes {
    variants?: MotionVariants
    initial?: Variant
    enter?: Variant
    leave?: Variant
    visible?: Variant
    hovered?: Variant
    tapped?: Variant
    focused?: Variant
  }
}

interface MotionPluginOptions {
  directives?: {
    [key: string]: MotionVariants
  }
  excludePresets?: boolean
}

declare type StopAnimation = {
  stop: () => void
}
declare type Transformer<T> = (v: T) => T
declare type Subscriber<T> = (v: T) => void
declare type PassiveEffect<T> = (v: T, safeSetter: (v: T) => void) => void
declare type StartAnimation = (complete?: () => void) => StopAnimation

declare const directive: (
  variants?: MotionVariants | undefined,
) => Directive<HTMLElement | SVGElement>

declare const MotionPlugin: Plugin

declare const fade: MotionVariants
declare const fadeVisible: MotionVariants

declare const pop: MotionVariants
declare const popVisible: MotionVariants

declare const rollLeft: MotionVariants
declare const rollVisibleLeft: MotionVariants
declare const rollRight: MotionVariants
declare const rollVisibleRight: MotionVariants
declare const rollTop: MotionVariants
declare const rollVisibleTop: MotionVariants
declare const rollBottom: MotionVariants
declare const rollVisibleBottom: MotionVariants

declare const slideLeft: MotionVariants
declare const slideVisibleLeft: MotionVariants
declare const slideRight: MotionVariants
declare const slideVisibleRight: MotionVariants
declare const slideTop: MotionVariants
declare const slideVisibleTop: MotionVariants
declare const slideBottom: MotionVariants
declare const slideVisibleBottom: MotionVariants

/**
 * Reactive style object implementing all native CSS properties.
 *
 * @param props
 */
declare function reactiveStyle(props?: StyleProperties): {
  state: {
    alignContent?: string | undefined
    alignItems?: string | undefined
    alignSelf?: string | undefined
    alignTracks?: string | undefined
    animationDelay?: string | undefined
    animationDirection?: string | undefined
    animationDuration?: string | undefined
    animationFillMode?: string | undefined
    animationIterationCount?:
      | csstype.AnimationIterationCountProperty
      | undefined
    animationName?: string | undefined
    animationPlayState?: string | undefined
    animationTimingFunction?: string | undefined
    appearance?: csstype.AppearanceProperty | undefined
    aspectRatio?: string | undefined
    backdropFilter?: string | undefined
    backfaceVisibility?: csstype.BackfaceVisibilityProperty | undefined
    backgroundAttachment?: string | undefined
    backgroundBlendMode?: string | undefined
    backgroundClip?: string | undefined
    backgroundColor?: string | undefined
    backgroundImage?: string | undefined
    backgroundOrigin?: string | undefined
    backgroundPositionX?:
      | csstype.BackgroundPositionXProperty<string | number>
      | undefined
    backgroundPositionY?:
      | csstype.BackgroundPositionYProperty<string | number>
      | undefined
    backgroundRepeat?: string | undefined
    backgroundSize?: csstype.BackgroundSizeProperty<string | number> | undefined
    blockOverflow?: string | undefined
    blockSize?: csstype.BlockSizeProperty<string | number> | undefined
    borderBlockColor?: string | undefined
    borderBlockEndColor?: string | undefined
    borderBlockEndStyle?: csstype.BorderBlockEndStyleProperty | undefined
    borderBlockEndWidth?:
      | csstype.BorderBlockEndWidthProperty<string | number>
      | undefined
    borderBlockStartColor?: string | undefined
    borderBlockStartStyle?: csstype.BorderBlockStartStyleProperty | undefined
    borderBlockStartWidth?:
      | csstype.BorderBlockStartWidthProperty<string | number>
      | undefined
    borderBlockStyle?: csstype.BorderBlockStyleProperty | undefined
    borderBlockWidth?:
      | csstype.BorderBlockWidthProperty<string | number>
      | undefined
    borderBottomColor?: string | undefined
    borderBottomLeftRadius?:
      | csstype.BorderBottomLeftRadiusProperty<string | number>
      | undefined
    borderBottomRightRadius?:
      | csstype.BorderBottomRightRadiusProperty<string | number>
      | undefined
    borderBottomStyle?: csstype.BorderBottomStyleProperty | undefined
    borderBottomWidth?:
      | csstype.BorderBottomWidthProperty<string | number>
      | undefined
    borderCollapse?: csstype.BorderCollapseProperty | undefined
    borderEndEndRadius?:
      | csstype.BorderEndEndRadiusProperty<string | number>
      | undefined
    borderEndStartRadius?:
      | csstype.BorderEndStartRadiusProperty<string | number>
      | undefined
    borderImageOutset?:
      | csstype.BorderImageOutsetProperty<string | number>
      | undefined
    borderImageRepeat?: string | undefined
    borderImageSlice?: csstype.BorderImageSliceProperty | undefined
    borderImageSource?: string | undefined
    borderImageWidth?:
      | csstype.BorderImageWidthProperty<string | number>
      | undefined
    borderInlineColor?: string | undefined
    borderInlineEndColor?: string | undefined
    borderInlineEndStyle?: csstype.BorderInlineEndStyleProperty | undefined
    borderInlineEndWidth?:
      | csstype.BorderInlineEndWidthProperty<string | number>
      | undefined
    borderInlineStartColor?: string | undefined
    borderInlineStartStyle?: csstype.BorderInlineStartStyleProperty | undefined
    borderInlineStartWidth?:
      | csstype.BorderInlineStartWidthProperty<string | number>
      | undefined
    borderInlineStyle?: csstype.BorderInlineStyleProperty | undefined
    borderInlineWidth?:
      | csstype.BorderInlineWidthProperty<string | number>
      | undefined
    borderLeftColor?: string | undefined
    borderLeftStyle?: csstype.BorderLeftStyleProperty | undefined
    borderLeftWidth?:
      | csstype.BorderLeftWidthProperty<string | number>
      | undefined
    borderRightColor?: string | undefined
    borderRightStyle?: csstype.BorderRightStyleProperty | undefined
    borderRightWidth?:
      | csstype.BorderRightWidthProperty<string | number>
      | undefined
    borderSpacing?: csstype.BorderSpacingProperty<string | number> | undefined
    borderStartEndRadius?:
      | csstype.BorderStartEndRadiusProperty<string | number>
      | undefined
    borderStartStartRadius?:
      | csstype.BorderStartStartRadiusProperty<string | number>
      | undefined
    borderTopColor?: string | undefined
    borderTopLeftRadius?:
      | csstype.BorderTopLeftRadiusProperty<string | number>
      | undefined
    borderTopRightRadius?:
      | csstype.BorderTopRightRadiusProperty<string | number>
      | undefined
    borderTopStyle?: csstype.BorderTopStyleProperty | undefined
    borderTopWidth?: csstype.BorderTopWidthProperty<string | number> | undefined
    bottom?: csstype.BottomProperty<string | number> | undefined
    boxDecorationBreak?: csstype.BoxDecorationBreakProperty | undefined
    boxShadow?: string | undefined
    boxSizing?: csstype.BoxSizingProperty | undefined
    breakAfter?: csstype.BreakAfterProperty | undefined
    breakBefore?: csstype.BreakBeforeProperty | undefined
    breakInside?: csstype.BreakInsideProperty | undefined
    captionSide?: csstype.CaptionSideProperty | undefined
    caretColor?: string | undefined
    clear?: csstype.ClearProperty | undefined
    clipPath?: string | undefined
    color?: string | undefined
    colorAdjust?: csstype.ColorAdjustProperty | undefined
    colorScheme?: string | undefined
    columnCount?: csstype.ColumnCountProperty | undefined
    columnFill?: csstype.ColumnFillProperty | undefined
    columnGap?: csstype.ColumnGapProperty<string | number> | undefined
    columnRuleColor?: string | undefined
    columnRuleStyle?: string | undefined
    columnRuleWidth?:
      | csstype.ColumnRuleWidthProperty<string | number>
      | undefined
    columnSpan?: csstype.ColumnSpanProperty | undefined
    columnWidth?: csstype.ColumnWidthProperty<string | number> | undefined
    contain?: string | undefined
    content?: string | undefined
    contentVisibility?: csstype.ContentVisibilityProperty | undefined
    counterIncrement?: string | undefined
    counterReset?: string | undefined
    counterSet?: string | undefined
    cursor?: string | undefined
    direction?: csstype.DirectionProperty | undefined
    display?: string | undefined
    emptyCells?: csstype.EmptyCellsProperty | undefined
    filter?: string | undefined
    flexBasis?: csstype.FlexBasisProperty<string | number> | undefined
    flexDirection?: csstype.FlexDirectionProperty | undefined
    flexGrow?: csstype.GlobalsNumber | undefined
    flexShrink?: csstype.GlobalsNumber | undefined
    flexWrap?: csstype.FlexWrapProperty | undefined
    float?: csstype.FloatProperty | undefined
    fontFamily?: string | undefined
    fontFeatureSettings?: string | undefined
    fontKerning?: csstype.FontKerningProperty | undefined
    fontLanguageOverride?: string | undefined
    fontOpticalSizing?: csstype.FontOpticalSizingProperty | undefined
    fontSize?: csstype.FontSizeProperty<string | number> | undefined
    fontSizeAdjust?: csstype.FontSizeAdjustProperty | undefined
    fontSmooth?: csstype.FontSmoothProperty<string | number> | undefined
    fontStretch?: string | undefined
    fontStyle?: string | undefined
    fontSynthesis?: string | undefined
    fontVariant?: string | undefined
    fontVariantCaps?: csstype.FontVariantCapsProperty | undefined
    fontVariantEastAsian?: string | undefined
    fontVariantLigatures?: string | undefined
    fontVariantNumeric?: string | undefined
    fontVariantPosition?: csstype.FontVariantPositionProperty | undefined
    fontVariationSettings?: string | undefined
    fontWeight?: csstype.FontWeightProperty | undefined
    forcedColorAdjust?: csstype.ForcedColorAdjustProperty | undefined
    gridAutoColumns?:
      | csstype.GridAutoColumnsProperty<string | number>
      | undefined
    gridAutoFlow?: string | undefined
    gridAutoRows?: csstype.GridAutoRowsProperty<string | number> | undefined
    gridColumnEnd?: csstype.GridColumnEndProperty | undefined
    gridColumnStart?: csstype.GridColumnStartProperty | undefined
    gridRowEnd?: csstype.GridRowEndProperty | undefined
    gridRowStart?: csstype.GridRowStartProperty | undefined
    gridTemplateAreas?: string | undefined
    gridTemplateColumns?:
      | csstype.GridTemplateColumnsProperty<string | number>
      | undefined
    gridTemplateRows?:
      | csstype.GridTemplateRowsProperty<string | number>
      | undefined
    hangingPunctuation?: string | undefined
    height?: csstype.HeightProperty<string | number> | undefined
    hyphens?: csstype.HyphensProperty | undefined
    imageOrientation?: string | undefined
    imageRendering?: csstype.ImageRenderingProperty | undefined
    imageResolution?: string | undefined
    initialLetter?: csstype.InitialLetterProperty | undefined
    inlineSize?: csstype.InlineSizeProperty<string | number> | undefined
    inset?: csstype.InsetProperty<string | number> | undefined
    insetBlock?: csstype.InsetBlockProperty<string | number> | undefined
    insetBlockEnd?: csstype.InsetBlockEndProperty<string | number> | undefined
    insetBlockStart?:
      | csstype.InsetBlockStartProperty<string | number>
      | undefined
    insetInline?: csstype.InsetInlineProperty<string | number> | undefined
    insetInlineEnd?: csstype.InsetInlineEndProperty<string | number> | undefined
    insetInlineStart?:
      | csstype.InsetInlineStartProperty<string | number>
      | undefined
    isolation?: csstype.IsolationProperty | undefined
    justifyContent?: string | undefined
    justifyItems?: string | undefined
    justifySelf?: string | undefined
    justifyTracks?: string | undefined
    left?: csstype.LeftProperty<string | number> | undefined
    letterSpacing?: csstype.LetterSpacingProperty<string | number> | undefined
    lineBreak?: csstype.LineBreakProperty | undefined
    lineHeight?: csstype.LineHeightProperty<string | number> | undefined
    lineHeightStep?: csstype.LineHeightStepProperty<string | number> | undefined
    listStyleImage?: string | undefined
    listStylePosition?: csstype.ListStylePositionProperty | undefined
    listStyleType?: string | undefined
    marginBlock?: csstype.MarginBlockProperty<string | number> | undefined
    marginBlockEnd?: csstype.MarginBlockEndProperty<string | number> | undefined
    marginBlockStart?:
      | csstype.MarginBlockStartProperty<string | number>
      | undefined
    marginBottom?: csstype.MarginBottomProperty<string | number> | undefined
    marginInline?: csstype.MarginInlineProperty<string | number> | undefined
    marginInlineEnd?:
      | csstype.MarginInlineEndProperty<string | number>
      | undefined
    marginInlineStart?:
      | csstype.MarginInlineStartProperty<string | number>
      | undefined
    marginLeft?: csstype.MarginLeftProperty<string | number> | undefined
    marginRight?: csstype.MarginRightProperty<string | number> | undefined
    marginTop?: csstype.MarginTopProperty<string | number> | undefined
    maskBorderMode?: csstype.MaskBorderModeProperty | undefined
    maskBorderOutset?:
      | csstype.MaskBorderOutsetProperty<string | number>
      | undefined
    maskBorderRepeat?: string | undefined
    maskBorderSlice?: csstype.MaskBorderSliceProperty | undefined
    maskBorderSource?: string | undefined
    maskBorderWidth?:
      | csstype.MaskBorderWidthProperty<string | number>
      | undefined
    maskClip?: string | undefined
    maskComposite?: string | undefined
    maskImage?: string | undefined
    maskMode?: string | undefined
    maskOrigin?: string | undefined
    maskPosition?: csstype.MaskPositionProperty<string | number> | undefined
    maskRepeat?: string | undefined
    maskSize?: csstype.MaskSizeProperty<string | number> | undefined
    maskType?: csstype.MaskTypeProperty | undefined
    mathStyle?: csstype.MathStyleProperty | undefined
    maxBlockSize?: csstype.MaxBlockSizeProperty<string | number> | undefined
    maxHeight?: csstype.MaxHeightProperty<string | number> | undefined
    maxInlineSize?: csstype.MaxInlineSizeProperty<string | number> | undefined
    maxLines?: csstype.MaxLinesProperty | undefined
    maxWidth?: csstype.MaxWidthProperty<string | number> | undefined
    minBlockSize?: csstype.MinBlockSizeProperty<string | number> | undefined
    minHeight?: csstype.MinHeightProperty<string | number> | undefined
    minInlineSize?: csstype.MinInlineSizeProperty<string | number> | undefined
    minWidth?: csstype.MinWidthProperty<string | number> | undefined
    mixBlendMode?: csstype.MixBlendModeProperty | undefined
    motionDistance?: csstype.OffsetDistanceProperty<string | number> | undefined
    motionPath?: string | undefined
    motionRotation?: string | undefined
    objectFit?: csstype.ObjectFitProperty | undefined
    objectPosition?: csstype.ObjectPositionProperty<string | number> | undefined
    offsetAnchor?: csstype.OffsetAnchorProperty<string | number> | undefined
    offsetDistance?: csstype.OffsetDistanceProperty<string | number> | undefined
    offsetPath?: string | undefined
    offsetRotate?: string | undefined
    offsetRotation?: string | undefined
    opacity?: csstype.OpacityProperty | undefined
    order?: csstype.GlobalsNumber | undefined
    orphans?: csstype.GlobalsNumber | undefined
    outlineColor?: string | undefined
    outlineOffset?: csstype.OutlineOffsetProperty<string | number> | undefined
    outlineStyle?: string | undefined
    outlineWidth?: csstype.OutlineWidthProperty<string | number> | undefined
    overflowAnchor?: csstype.OverflowAnchorProperty | undefined
    overflowBlock?: csstype.OverflowBlockProperty | undefined
    overflowClipBox?: csstype.OverflowClipBoxProperty | undefined
    overflowClipMargin?:
      | csstype.OverflowClipMarginProperty<string | number>
      | undefined
    overflowInline?: csstype.OverflowInlineProperty | undefined
    overflowWrap?: csstype.OverflowWrapProperty | undefined
    overflowX?: csstype.OverflowXProperty | undefined
    overflowY?: csstype.OverflowYProperty | undefined
    overscrollBehaviorBlock?:
      | csstype.OverscrollBehaviorBlockProperty
      | undefined
    overscrollBehaviorInline?:
      | csstype.OverscrollBehaviorInlineProperty
      | undefined
    overscrollBehaviorX?: csstype.OverscrollBehaviorXProperty | undefined
    overscrollBehaviorY?: csstype.OverscrollBehaviorYProperty | undefined
    paddingBlock?: csstype.PaddingBlockProperty<string | number> | undefined
    paddingBlockEnd?:
      | csstype.PaddingBlockEndProperty<string | number>
      | undefined
    paddingBlockStart?:
      | csstype.PaddingBlockStartProperty<string | number>
      | undefined
    paddingBottom?: csstype.PaddingBottomProperty<string | number> | undefined
    paddingInline?: csstype.PaddingInlineProperty<string | number> | undefined
    paddingInlineEnd?:
      | csstype.PaddingInlineEndProperty<string | number>
      | undefined
    paddingInlineStart?:
      | csstype.PaddingInlineStartProperty<string | number>
      | undefined
    paddingLeft?: csstype.PaddingLeftProperty<string | number> | undefined
    paddingRight?: csstype.PaddingRightProperty<string | number> | undefined
    paddingTop?: csstype.PaddingTopProperty<string | number> | undefined
    pageBreakAfter?: csstype.PageBreakAfterProperty | undefined
    pageBreakBefore?: csstype.PageBreakBeforeProperty | undefined
    pageBreakInside?: csstype.PageBreakInsideProperty | undefined
    paintOrder?: string | undefined
    perspectiveOrigin?:
      | csstype.PerspectiveOriginProperty<string | number>
      | undefined
    placeContent?: string | undefined
    pointerEvents?: csstype.PointerEventsProperty | undefined
    position?: csstype.PositionProperty | undefined
    quotes?: string | undefined
    resize?: csstype.ResizeProperty | undefined
    right?: csstype.RightProperty<string | number> | undefined
    rowGap?: csstype.RowGapProperty<string | number> | undefined
    rubyAlign?: csstype.RubyAlignProperty | undefined
    rubyMerge?: csstype.RubyMergeProperty | undefined
    rubyPosition?: string | undefined
    scrollBehavior?: csstype.ScrollBehaviorProperty | undefined
    scrollMargin?: csstype.ScrollMarginProperty<string | number> | undefined
    scrollMarginBlock?:
      | csstype.ScrollMarginBlockProperty<string | number>
      | undefined
    scrollMarginBlockEnd?:
      | csstype.ScrollMarginBlockEndProperty<string | number>
      | undefined
    scrollMarginBlockStart?:
      | csstype.ScrollMarginBlockStartProperty<string | number>
      | undefined
    scrollMarginBottom?:
      | csstype.ScrollMarginBottomProperty<string | number>
      | undefined
    scrollMarginInline?:
      | csstype.ScrollMarginInlineProperty<string | number>
      | undefined
    scrollMarginInlineEnd?:
      | csstype.ScrollMarginInlineEndProperty<string | number>
      | undefined
    scrollMarginInlineStart?:
      | csstype.ScrollMarginInlineStartProperty<string | number>
      | undefined
    scrollMarginLeft?:
      | csstype.ScrollMarginLeftProperty<string | number>
      | undefined
    scrollMarginRight?:
      | csstype.ScrollMarginRightProperty<string | number>
      | undefined
    scrollMarginTop?:
      | csstype.ScrollMarginTopProperty<string | number>
      | undefined
    scrollPadding?: csstype.ScrollPaddingProperty<string | number> | undefined
    scrollPaddingBlock?:
      | csstype.ScrollPaddingBlockProperty<string | number>
      | undefined
    scrollPaddingBlockEnd?:
      | csstype.ScrollPaddingBlockEndProperty<string | number>
      | undefined
    scrollPaddingBlockStart?:
      | csstype.ScrollPaddingBlockStartProperty<string | number>
      | undefined
    scrollPaddingBottom?:
      | csstype.ScrollPaddingBottomProperty<string | number>
      | undefined
    scrollPaddingInline?:
      | csstype.ScrollPaddingInlineProperty<string | number>
      | undefined
    scrollPaddingInlineEnd?:
      | csstype.ScrollPaddingInlineEndProperty<string | number>
      | undefined
    scrollPaddingInlineStart?:
      | csstype.ScrollPaddingInlineStartProperty<string | number>
      | undefined
    scrollPaddingLeft?:
      | csstype.ScrollPaddingLeftProperty<string | number>
      | undefined
    scrollPaddingRight?:
      | csstype.ScrollPaddingRightProperty<string | number>
      | undefined
    scrollPaddingTop?:
      | csstype.ScrollPaddingTopProperty<string | number>
      | undefined
    scrollSnapAlign?: string | undefined
    scrollSnapMargin?: csstype.ScrollMarginProperty<string | number> | undefined
    scrollSnapMarginBottom?:
      | csstype.ScrollMarginBottomProperty<string | number>
      | undefined
    scrollSnapMarginLeft?:
      | csstype.ScrollMarginLeftProperty<string | number>
      | undefined
    scrollSnapMarginRight?:
      | csstype.ScrollMarginRightProperty<string | number>
      | undefined
    scrollSnapMarginTop?:
      | csstype.ScrollMarginTopProperty<string | number>
      | undefined
    scrollSnapStop?: csstype.ScrollSnapStopProperty | undefined
    scrollSnapType?: string | undefined
    scrollbarColor?: string | undefined
    scrollbarGutter?: string | undefined
    scrollbarWidth?: csstype.ScrollbarWidthProperty | undefined
    shapeImageThreshold?: csstype.ShapeImageThresholdProperty | undefined
    shapeMargin?: csstype.ShapeMarginProperty<string | number> | undefined
    shapeOutside?: string | undefined
    tabSize?: csstype.TabSizeProperty<string | number> | undefined
    tableLayout?: csstype.TableLayoutProperty | undefined
    textAlign?: csstype.TextAlignProperty | undefined
    textAlignLast?: csstype.TextAlignLastProperty | undefined
    textCombineUpright?: string | undefined
    textDecorationColor?: string | undefined
    textDecorationLine?: string | undefined
    textDecorationSkip?: string | undefined
    textDecorationSkipInk?: csstype.TextDecorationSkipInkProperty | undefined
    textDecorationStyle?: csstype.TextDecorationStyleProperty | undefined
    textDecorationThickness?:
      | csstype.TextDecorationThicknessProperty<string | number>
      | undefined
    textDecorationWidth?:
      | csstype.TextDecorationThicknessProperty<string | number>
      | undefined
    textEmphasisColor?: string | undefined
    textEmphasisPosition?: string | undefined
    textEmphasisStyle?: string | undefined
    textIndent?: csstype.TextIndentProperty<string | number> | undefined
    textJustify?: csstype.TextJustifyProperty | undefined
    textOrientation?: csstype.TextOrientationProperty | undefined
    textOverflow?: string | undefined
    textRendering?: csstype.TextRenderingProperty | undefined
    textShadow?: string | undefined
    textSizeAdjust?: string | undefined
    textTransform?: csstype.TextTransformProperty | undefined
    textUnderlineOffset?:
      | csstype.TextUnderlineOffsetProperty<string | number>
      | undefined
    textUnderlinePosition?: string | undefined
    top?: csstype.TopProperty<string | number> | undefined
    touchAction?: string | undefined
    transitionDelay?: string | undefined
    transitionDuration?: string | undefined
    transitionProperty?: string | undefined
    transitionTimingFunction?: string | undefined
    translate?: csstype.TranslateProperty<string | number> | undefined
    unicodeBidi?: csstype.UnicodeBidiProperty | undefined
    userSelect?: csstype.UserSelectProperty | undefined
    verticalAlign?: csstype.VerticalAlignProperty<string | number> | undefined
    visibility?: csstype.VisibilityProperty | undefined
    whiteSpace?: csstype.WhiteSpaceProperty | undefined
    widows?: csstype.GlobalsNumber | undefined
    width?: csstype.WidthProperty<string | number> | undefined
    willChange?: string | undefined
    wordBreak?: csstype.WordBreakProperty | undefined
    wordSpacing?: csstype.WordSpacingProperty<string | number> | undefined
    wordWrap?: csstype.WordWrapProperty | undefined
    writingMode?: csstype.WritingModeProperty | undefined
    zIndex?: csstype.ZIndexProperty | undefined
    zoom?: csstype.ZoomProperty | undefined
    all?: csstype.Globals | undefined
    animation?: csstype.AnimationProperty | undefined
    background?: csstype.BackgroundProperty<string | number> | undefined
    backgroundPosition?:
      | csstype.BackgroundPositionProperty<string | number>
      | undefined
    border?: csstype.BorderProperty<string | number> | undefined
    borderBlock?: csstype.BorderBlockProperty<string | number> | undefined
    borderBlockEnd?: csstype.BorderBlockEndProperty<string | number> | undefined
    borderBlockStart?:
      | csstype.BorderBlockStartProperty<string | number>
      | undefined
    borderBottom?: csstype.BorderBottomProperty<string | number> | undefined
    borderColor?: string | undefined
    borderImage?: csstype.BorderImageProperty | undefined
    borderInline?: csstype.BorderInlineProperty<string | number> | undefined
    borderInlineEnd?:
      | csstype.BorderInlineEndProperty<string | number>
      | undefined
    borderInlineStart?:
      | csstype.BorderInlineStartProperty<string | number>
      | undefined
    borderLeft?: csstype.BorderLeftProperty<string | number> | undefined
    borderRadius?: csstype.BorderRadiusProperty<string | number> | undefined
    borderRight?: csstype.BorderRightProperty<string | number> | undefined
    borderStyle?: string | undefined
    borderTop?: csstype.BorderTopProperty<string | number> | undefined
    borderWidth?: csstype.BorderWidthProperty<string | number> | undefined
    columnRule?: csstype.ColumnRuleProperty<string | number> | undefined
    columns?: csstype.ColumnsProperty<string | number> | undefined
    flex?: csstype.FlexProperty<string | number> | undefined
    flexFlow?: string | undefined
    font?: string | undefined
    gap?: csstype.GapProperty<string | number> | undefined
    grid?: string | undefined
    gridArea?: csstype.GridAreaProperty | undefined
    gridColumn?: csstype.GridColumnProperty | undefined
    gridRow?: csstype.GridRowProperty | undefined
    gridTemplate?: string | undefined
    lineClamp?: csstype.LineClampProperty | undefined
    listStyle?: string | undefined
    margin?: csstype.MarginProperty<string | number> | undefined
    mask?: csstype.MaskProperty<string | number> | undefined
    maskBorder?: csstype.MaskBorderProperty | undefined
    motion?: csstype.OffsetProperty<string | number> | undefined
    offset?: csstype.OffsetProperty<string | number> | undefined
    outline?: csstype.OutlineProperty<string | number> | undefined
    overflow?: string | undefined
    overscrollBehavior?: string | undefined
    padding?: csstype.PaddingProperty<string | number> | undefined
    placeItems?: string | undefined
    placeSelf?: string | undefined
    textDecoration?: csstype.TextDecorationProperty<string | number> | undefined
    textEmphasis?: string | undefined
    MozAnimationDelay?: string | undefined
    MozAnimationDirection?: string | undefined
    MozAnimationDuration?: string | undefined
    MozAnimationFillMode?: string | undefined
    MozAnimationIterationCount?:
      | csstype.AnimationIterationCountProperty
      | undefined
    MozAnimationName?: string | undefined
    MozAnimationPlayState?: string | undefined
    MozAnimationTimingFunction?: string | undefined
    MozAppearance?: csstype.MozAppearanceProperty | undefined
    MozBackfaceVisibility?: csstype.BackfaceVisibilityProperty | undefined
    MozBorderBottomColors?: string | undefined
    MozBorderEndColor?: string | undefined
    MozBorderEndStyle?: csstype.BorderInlineEndStyleProperty | undefined
    MozBorderEndWidth?:
      | csstype.BorderInlineEndWidthProperty<string | number>
      | undefined
    MozBorderLeftColors?: string | undefined
    MozBorderRightColors?: string | undefined
    MozBorderStartColor?: string | undefined
    MozBorderStartStyle?: csstype.BorderInlineStartStyleProperty | undefined
    MozBorderTopColors?: string | undefined
    MozBoxSizing?: csstype.BoxSizingProperty | undefined
    MozColumnCount?: csstype.ColumnCountProperty | undefined
    MozColumnFill?: csstype.ColumnFillProperty | undefined
    MozColumnGap?: csstype.ColumnGapProperty<string | number> | undefined
    MozColumnRuleColor?: string | undefined
    MozColumnRuleStyle?: string | undefined
    MozColumnRuleWidth?:
      | csstype.ColumnRuleWidthProperty<string | number>
      | undefined
    MozColumnWidth?: csstype.ColumnWidthProperty<string | number> | undefined
    MozContextProperties?: string | undefined
    MozFontFeatureSettings?: string | undefined
    MozFontLanguageOverride?: string | undefined
    MozHyphens?: csstype.HyphensProperty | undefined
    MozImageRegion?: string | undefined
    MozMarginEnd?: csstype.MarginInlineEndProperty<string | number> | undefined
    MozMarginStart?:
      | csstype.MarginInlineStartProperty<string | number>
      | undefined
    MozOrient?: csstype.MozOrientProperty | undefined
    MozOsxFontSmoothing?:
      | csstype.FontSmoothProperty<string | number>
      | undefined
    MozPaddingEnd?:
      | csstype.PaddingInlineEndProperty<string | number>
      | undefined
    MozPaddingStart?:
      | csstype.PaddingInlineStartProperty<string | number>
      | undefined
    MozPerspective?: csstype.PerspectiveProperty<string | number> | undefined
    MozPerspectiveOrigin?:
      | csstype.PerspectiveOriginProperty<string | number>
      | undefined
    MozStackSizing?: csstype.MozStackSizingProperty | undefined
    MozTabSize?: csstype.TabSizeProperty<string | number> | undefined
    MozTextBlink?: csstype.MozTextBlinkProperty | undefined
    MozTextSizeAdjust?: string | undefined
    MozTransformOrigin?:
      | csstype.TransformOriginProperty<string | number>
      | undefined
    MozTransformStyle?: csstype.TransformStyleProperty | undefined
    MozTransitionDelay?: string | undefined
    MozTransitionDuration?: string | undefined
    MozTransitionProperty?: string | undefined
    MozTransitionTimingFunction?: string | undefined
    MozUserFocus?: csstype.MozUserFocusProperty | undefined
    MozUserModify?: csstype.MozUserModifyProperty | undefined
    MozUserSelect?: csstype.UserSelectProperty | undefined
    MozWindowDragging?: csstype.MozWindowDraggingProperty | undefined
    MozWindowShadow?: csstype.MozWindowShadowProperty | undefined
    msAccelerator?: csstype.MsAcceleratorProperty | undefined
    msAlignSelf?: string | undefined
    msBlockProgression?: csstype.MsBlockProgressionProperty | undefined
    msContentZoomChaining?: csstype.MsContentZoomChainingProperty | undefined
    msContentZoomLimitMax?: string | undefined
    msContentZoomLimitMin?: string | undefined
    msContentZoomSnapPoints?: string | undefined
    msContentZoomSnapType?: csstype.MsContentZoomSnapTypeProperty | undefined
    msContentZooming?: csstype.MsContentZoomingProperty | undefined
    msFilter?: string | undefined
    msFlexDirection?: csstype.FlexDirectionProperty | undefined
    msFlexPositive?: csstype.GlobalsNumber | undefined
    msFlowFrom?: string | undefined
    msFlowInto?: string | undefined
    msGridColumns?: csstype.MsGridColumnsProperty<string | number> | undefined
    msGridRows?: csstype.MsGridRowsProperty<string | number> | undefined
    msHighContrastAdjust?: csstype.MsHighContrastAdjustProperty | undefined
    msHyphenateLimitChars?: csstype.MsHyphenateLimitCharsProperty | undefined
    msHyphenateLimitLines?: csstype.MsHyphenateLimitLinesProperty | undefined
    msHyphenateLimitZone?:
      | csstype.MsHyphenateLimitZoneProperty<string | number>
      | undefined
    msHyphens?: csstype.HyphensProperty | undefined
    msImeAlign?: csstype.MsImeAlignProperty | undefined
    msJustifySelf?: string | undefined
    msLineBreak?: csstype.LineBreakProperty | undefined
    msOrder?: csstype.GlobalsNumber | undefined
    msOverflowStyle?: csstype.MsOverflowStyleProperty | undefined
    msOverflowX?: csstype.OverflowXProperty | undefined
    msOverflowY?: csstype.OverflowYProperty | undefined
    msScrollChaining?: csstype.MsScrollChainingProperty | undefined
    msScrollLimitXMax?:
      | csstype.MsScrollLimitXMaxProperty<string | number>
      | undefined
    msScrollLimitXMin?:
      | csstype.MsScrollLimitXMinProperty<string | number>
      | undefined
    msScrollLimitYMax?:
      | csstype.MsScrollLimitYMaxProperty<string | number>
      | undefined
    msScrollLimitYMin?:
      | csstype.MsScrollLimitYMinProperty<string | number>
      | undefined
    msScrollRails?: csstype.MsScrollRailsProperty | undefined
    msScrollSnapPointsX?: string | undefined
    msScrollSnapPointsY?: string | undefined
    msScrollSnapType?: csstype.MsScrollSnapTypeProperty | undefined
    msScrollTranslation?: csstype.MsScrollTranslationProperty | undefined
    msScrollbar3dlightColor?: string | undefined
    msScrollbarArrowColor?: string | undefined
    msScrollbarBaseColor?: string | undefined
    msScrollbarDarkshadowColor?: string | undefined
    msScrollbarFaceColor?: string | undefined
    msScrollbarHighlightColor?: string | undefined
    msScrollbarShadowColor?: string | undefined
    msTextAutospace?: csstype.MsTextAutospaceProperty | undefined
    msTextCombineHorizontal?: string | undefined
    msTextOverflow?: string | undefined
    msTouchAction?: string | undefined
    msTouchSelect?: csstype.MsTouchSelectProperty | undefined
    msTransform?: string | undefined
    msTransformOrigin?:
      | csstype.TransformOriginProperty<string | number>
      | undefined
    msTransitionDelay?: string | undefined
    msTransitionDuration?: string | undefined
    msTransitionProperty?: string | undefined
    msTransitionTimingFunction?: string | undefined
    msUserSelect?: csstype.MsUserSelectProperty | undefined
    msWordBreak?: csstype.WordBreakProperty | undefined
    msWrapFlow?: csstype.MsWrapFlowProperty | undefined
    msWrapMargin?: csstype.MsWrapMarginProperty<string | number> | undefined
    msWrapThrough?: csstype.MsWrapThroughProperty | undefined
    msWritingMode?: csstype.WritingModeProperty | undefined
    WebkitAlignContent?: string | undefined
    WebkitAlignItems?: string | undefined
    WebkitAlignSelf?: string | undefined
    WebkitAnimationDelay?: string | undefined
    WebkitAnimationDirection?: string | undefined
    WebkitAnimationDuration?: string | undefined
    WebkitAnimationFillMode?: string | undefined
    WebkitAnimationIterationCount?:
      | csstype.AnimationIterationCountProperty
      | undefined
    WebkitAnimationName?: string | undefined
    WebkitAnimationPlayState?: string | undefined
    WebkitAnimationTimingFunction?: string | undefined
    WebkitAppearance?: csstype.WebkitAppearanceProperty | undefined
    WebkitBackdropFilter?: string | undefined
    WebkitBackfaceVisibility?: csstype.BackfaceVisibilityProperty | undefined
    WebkitBackgroundClip?: string | undefined
    WebkitBackgroundOrigin?: string | undefined
    WebkitBackgroundSize?:
      | csstype.BackgroundSizeProperty<string | number>
      | undefined
    WebkitBorderBeforeColor?: string | undefined
    WebkitBorderBeforeStyle?: string | undefined
    WebkitBorderBeforeWidth?:
      | csstype.WebkitBorderBeforeWidthProperty<string | number>
      | undefined
    WebkitBorderBottomLeftRadius?:
      | csstype.BorderBottomLeftRadiusProperty<string | number>
      | undefined
    WebkitBorderBottomRightRadius?:
      | csstype.BorderBottomRightRadiusProperty<string | number>
      | undefined
    WebkitBorderImageSlice?: csstype.BorderImageSliceProperty | undefined
    WebkitBorderTopLeftRadius?:
      | csstype.BorderTopLeftRadiusProperty<string | number>
      | undefined
    WebkitBorderTopRightRadius?:
      | csstype.BorderTopRightRadiusProperty<string | number>
      | undefined
    WebkitBoxDecorationBreak?: csstype.BoxDecorationBreakProperty | undefined
    WebkitBoxReflect?:
      | csstype.WebkitBoxReflectProperty<string | number>
      | undefined
    WebkitBoxShadow?: string | undefined
    WebkitBoxSizing?: csstype.BoxSizingProperty | undefined
    WebkitClipPath?: string | undefined
    WebkitColumnCount?: csstype.ColumnCountProperty | undefined
    WebkitColumnFill?: csstype.ColumnFillProperty | undefined
    WebkitColumnGap?: csstype.ColumnGapProperty<string | number> | undefined
    WebkitColumnRuleColor?: string | undefined
    WebkitColumnRuleStyle?: string | undefined
    WebkitColumnRuleWidth?:
      | csstype.ColumnRuleWidthProperty<string | number>
      | undefined
    WebkitColumnSpan?: csstype.ColumnSpanProperty | undefined
    WebkitColumnWidth?: csstype.ColumnWidthProperty<string | number> | undefined
    WebkitFilter?: string | undefined
    WebkitFlexBasis?: csstype.FlexBasisProperty<string | number> | undefined
    WebkitFlexDirection?: csstype.FlexDirectionProperty | undefined
    WebkitFlexGrow?: csstype.GlobalsNumber | undefined
    WebkitFlexShrink?: csstype.GlobalsNumber | undefined
    WebkitFlexWrap?: csstype.FlexWrapProperty | undefined
    WebkitFontFeatureSettings?: string | undefined
    WebkitFontKerning?: csstype.FontKerningProperty | undefined
    WebkitFontSmoothing?:
      | csstype.FontSmoothProperty<string | number>
      | undefined
    WebkitFontVariantLigatures?: string | undefined
    WebkitHyphens?: csstype.HyphensProperty | undefined
    WebkitJustifyContent?: string | undefined
    WebkitLineBreak?: csstype.LineBreakProperty | undefined
    WebkitLineClamp?: csstype.WebkitLineClampProperty | undefined
    WebkitMarginEnd?:
      | csstype.MarginInlineEndProperty<string | number>
      | undefined
    WebkitMarginStart?:
      | csstype.MarginInlineStartProperty<string | number>
      | undefined
    WebkitMaskAttachment?: string | undefined
    WebkitMaskBoxImageOutset?:
      | csstype.MaskBorderOutsetProperty<string | number>
      | undefined
    WebkitMaskBoxImageRepeat?: string | undefined
    WebkitMaskBoxImageSlice?: csstype.MaskBorderSliceProperty | undefined
    WebkitMaskBoxImageSource?: string | undefined
    WebkitMaskBoxImageWidth?:
      | csstype.MaskBorderWidthProperty<string | number>
      | undefined
    WebkitMaskClip?: string | undefined
    WebkitMaskComposite?: string | undefined
    WebkitMaskImage?: string | undefined
    WebkitMaskOrigin?: string | undefined
    WebkitMaskPosition?:
      | csstype.WebkitMaskPositionProperty<string | number>
      | undefined
    WebkitMaskPositionX?:
      | csstype.WebkitMaskPositionXProperty<string | number>
      | undefined
    WebkitMaskPositionY?:
      | csstype.WebkitMaskPositionYProperty<string | number>
      | undefined
    WebkitMaskRepeat?: string | undefined
    WebkitMaskRepeatX?: csstype.WebkitMaskRepeatXProperty | undefined
    WebkitMaskRepeatY?: csstype.WebkitMaskRepeatYProperty | undefined
    WebkitMaskSize?: csstype.WebkitMaskSizeProperty<string | number> | undefined
    WebkitMaxInlineSize?:
      | csstype.MaxInlineSizeProperty<string | number>
      | undefined
    WebkitOrder?: csstype.GlobalsNumber | undefined
    WebkitOverflowScrolling?:
      | csstype.WebkitOverflowScrollingProperty
      | undefined
    WebkitPaddingEnd?:
      | csstype.PaddingInlineEndProperty<string | number>
      | undefined
    WebkitPaddingStart?:
      | csstype.PaddingInlineStartProperty<string | number>
      | undefined
    WebkitPerspective?: csstype.PerspectiveProperty<string | number> | undefined
    WebkitPerspectiveOrigin?:
      | csstype.PerspectiveOriginProperty<string | number>
      | undefined
    WebkitPrintColorAdjust?: csstype.ColorAdjustProperty | undefined
    WebkitRubyPosition?: string | undefined
    WebkitScrollSnapType?: string | undefined
    WebkitShapeMargin?: csstype.ShapeMarginProperty<string | number> | undefined
    WebkitTapHighlightColor?: string | undefined
    WebkitTextCombine?: string | undefined
    WebkitTextDecorationColor?: string | undefined
    WebkitTextDecorationLine?: string | undefined
    WebkitTextDecorationSkip?: string | undefined
    WebkitTextDecorationStyle?: csstype.TextDecorationStyleProperty | undefined
    WebkitTextEmphasisColor?: string | undefined
    WebkitTextEmphasisPosition?: string | undefined
    WebkitTextEmphasisStyle?: string | undefined
    WebkitTextFillColor?: string | undefined
    WebkitTextOrientation?: csstype.TextOrientationProperty | undefined
    WebkitTextSizeAdjust?: string | undefined
    WebkitTextStrokeColor?: string | undefined
    WebkitTextStrokeWidth?:
      | csstype.WebkitTextStrokeWidthProperty<string | number>
      | undefined
    WebkitTextUnderlinePosition?: string | undefined
    WebkitTouchCallout?: csstype.WebkitTouchCalloutProperty | undefined
    WebkitTransform?: string | undefined
    WebkitTransformOrigin?:
      | csstype.TransformOriginProperty<string | number>
      | undefined
    WebkitTransformStyle?: csstype.TransformStyleProperty | undefined
    WebkitTransitionDelay?: string | undefined
    WebkitTransitionDuration?: string | undefined
    WebkitTransitionProperty?: string | undefined
    WebkitTransitionTimingFunction?: string | undefined
    WebkitUserModify?: csstype.WebkitUserModifyProperty | undefined
    WebkitUserSelect?: csstype.UserSelectProperty | undefined
    WebkitWritingMode?: csstype.WritingModeProperty | undefined
    MozAnimation?: csstype.AnimationProperty | undefined
    MozBorderImage?: csstype.BorderImageProperty | undefined
    MozColumnRule?: csstype.ColumnRuleProperty<string | number> | undefined
    MozColumns?: csstype.ColumnsProperty<string | number> | undefined
    MozTransition?: string | undefined
    msContentZoomLimit?: string | undefined
    msContentZoomSnap?: string | undefined
    msFlex?: csstype.FlexProperty<string | number> | undefined
    msScrollLimit?: string | undefined
    msScrollSnapX?: string | undefined
    msScrollSnapY?: string | undefined
    msTransition?: string | undefined
    WebkitAnimation?: csstype.AnimationProperty | undefined
    WebkitBorderBefore?:
      | csstype.WebkitBorderBeforeProperty<string | number>
      | undefined
    WebkitBorderImage?: csstype.BorderImageProperty | undefined
    WebkitBorderRadius?:
      | csstype.BorderRadiusProperty<string | number>
      | undefined
    WebkitColumnRule?: csstype.ColumnRuleProperty<string | number> | undefined
    WebkitColumns?: csstype.ColumnsProperty<string | number> | undefined
    WebkitFlex?: csstype.FlexProperty<string | number> | undefined
    WebkitFlexFlow?: string | undefined
    WebkitMask?: csstype.WebkitMaskProperty<string | number> | undefined
    WebkitMaskBoxImage?: csstype.MaskBorderProperty | undefined
    WebkitTextEmphasis?: string | undefined
    WebkitTextStroke?:
      | csstype.WebkitTextStrokeProperty<string | number>
      | undefined
    WebkitTransition?: string | undefined
    azimuth?: string | undefined
    boxAlign?: csstype.BoxAlignProperty | undefined
    boxDirection?: csstype.BoxDirectionProperty | undefined
    boxFlex?: csstype.GlobalsNumber | undefined
    boxFlexGroup?: csstype.GlobalsNumber | undefined
    boxLines?: csstype.BoxLinesProperty | undefined
    boxOrdinalGroup?: csstype.GlobalsNumber | undefined
    boxOrient?: csstype.BoxOrientProperty | undefined
    boxPack?: csstype.BoxPackProperty | undefined
    clip?: string | undefined
    fontVariantAlternates?: string | undefined
    gridColumnGap?: csstype.GridColumnGapProperty<string | number> | undefined
    gridGap?: csstype.GridGapProperty<string | number> | undefined
    gridRowGap?: csstype.GridRowGapProperty<string | number> | undefined
    imeMode?: csstype.ImeModeProperty | undefined
    offsetBlock?: csstype.InsetBlockProperty<string | number> | undefined
    offsetBlockEnd?: csstype.InsetBlockEndProperty<string | number> | undefined
    offsetBlockStart?:
      | csstype.InsetBlockStartProperty<string | number>
      | undefined
    offsetInline?: csstype.InsetInlineProperty<string | number> | undefined
    offsetInlineEnd?:
      | csstype.InsetInlineEndProperty<string | number>
      | undefined
    offsetInlineStart?:
      | csstype.InsetInlineStartProperty<string | number>
      | undefined
    scrollSnapCoordinate?:
      | csstype.ScrollSnapCoordinateProperty<string | number>
      | undefined
    scrollSnapDestination?:
      | csstype.ScrollSnapDestinationProperty<string | number>
      | undefined
    scrollSnapPointsX?: string | undefined
    scrollSnapPointsY?: string | undefined
    scrollSnapTypeX?: csstype.ScrollSnapTypeXProperty | undefined
    scrollSnapTypeY?: csstype.ScrollSnapTypeYProperty | undefined
    scrollbarTrackColor?: string | undefined
    KhtmlBoxAlign?: csstype.BoxAlignProperty | undefined
    KhtmlBoxDirection?: csstype.BoxDirectionProperty | undefined
    KhtmlBoxFlex?: csstype.GlobalsNumber | undefined
    KhtmlBoxFlexGroup?: csstype.GlobalsNumber | undefined
    KhtmlBoxLines?: csstype.BoxLinesProperty | undefined
    KhtmlBoxOrdinalGroup?: csstype.GlobalsNumber | undefined
    KhtmlBoxOrient?: csstype.BoxOrientProperty | undefined
    KhtmlBoxPack?: csstype.BoxPackProperty | undefined
    KhtmlLineBreak?: csstype.LineBreakProperty | undefined
    KhtmlOpacity?: csstype.OpacityProperty | undefined
    KhtmlUserSelect?: csstype.UserSelectProperty | undefined
    MozBackgroundClip?: string | undefined
    MozBackgroundInlinePolicy?: csstype.BoxDecorationBreakProperty | undefined
    MozBackgroundOrigin?: string | undefined
    MozBackgroundSize?:
      | csstype.BackgroundSizeProperty<string | number>
      | undefined
    MozBinding?: string | undefined
    MozBorderRadius?: csstype.BorderRadiusProperty<string | number> | undefined
    MozBorderRadiusBottomleft?:
      | csstype.BorderBottomLeftRadiusProperty<string | number>
      | undefined
    MozBorderRadiusBottomright?:
      | csstype.BorderBottomRightRadiusProperty<string | number>
      | undefined
    MozBorderRadiusTopleft?:
      | csstype.BorderTopLeftRadiusProperty<string | number>
      | undefined
    MozBorderRadiusTopright?:
      | csstype.BorderTopRightRadiusProperty<string | number>
      | undefined
    MozBoxAlign?: csstype.BoxAlignProperty | undefined
    MozBoxDirection?: csstype.BoxDirectionProperty | undefined
    MozBoxFlex?: csstype.GlobalsNumber | undefined
    MozBoxOrdinalGroup?: csstype.GlobalsNumber | undefined
    MozBoxOrient?: csstype.BoxOrientProperty | undefined
    MozBoxPack?: csstype.BoxPackProperty | undefined
    MozBoxShadow?: string | undefined
    MozFloatEdge?: csstype.MozFloatEdgeProperty | undefined
    MozForceBrokenImageIcon?: csstype.GlobalsNumber | undefined
    MozOpacity?: csstype.OpacityProperty | undefined
    MozOutline?: csstype.OutlineProperty<string | number> | undefined
    MozOutlineColor?: string | undefined
    MozOutlineRadius?:
      | csstype.MozOutlineRadiusProperty<string | number>
      | undefined
    MozOutlineRadiusBottomleft?:
      | csstype.MozOutlineRadiusBottomleftProperty<string | number>
      | undefined
    MozOutlineRadiusBottomright?:
      | csstype.MozOutlineRadiusBottomrightProperty<string | number>
      | undefined
    MozOutlineRadiusTopleft?:
      | csstype.MozOutlineRadiusTopleftProperty<string | number>
      | undefined
    MozOutlineRadiusTopright?:
      | csstype.MozOutlineRadiusToprightProperty<string | number>
      | undefined
    MozOutlineStyle?: string | undefined
    MozOutlineWidth?: csstype.OutlineWidthProperty<string | number> | undefined
    MozTextAlignLast?: csstype.TextAlignLastProperty | undefined
    MozTextDecorationColor?: string | undefined
    MozTextDecorationLine?: string | undefined
    MozTextDecorationStyle?: csstype.TextDecorationStyleProperty | undefined
    MozUserInput?: csstype.MozUserInputProperty | undefined
    msImeMode?: csstype.ImeModeProperty | undefined
    msScrollbarTrackColor?: string | undefined
    OAnimation?: csstype.AnimationProperty | undefined
    OAnimationDelay?: string | undefined
    OAnimationDirection?: string | undefined
    OAnimationDuration?: string | undefined
    OAnimationFillMode?: string | undefined
    OAnimationIterationCount?:
      | csstype.AnimationIterationCountProperty
      | undefined
    OAnimationName?: string | undefined
    OAnimationPlayState?: string | undefined
    OAnimationTimingFunction?: string | undefined
    OBackgroundSize?:
      | csstype.BackgroundSizeProperty<string | number>
      | undefined
    OBorderImage?: csstype.BorderImageProperty | undefined
    OObjectFit?: csstype.ObjectFitProperty | undefined
    OObjectPosition?:
      | csstype.ObjectPositionProperty<string | number>
      | undefined
    OTabSize?: csstype.TabSizeProperty<string | number> | undefined
    OTextOverflow?: string | undefined
    OTransform?: string | undefined
    OTransformOrigin?:
      | csstype.TransformOriginProperty<string | number>
      | undefined
    OTransition?: string | undefined
    OTransitionDelay?: string | undefined
    OTransitionDuration?: string | undefined
    OTransitionProperty?: string | undefined
    OTransitionTimingFunction?: string | undefined
    WebkitBoxAlign?: csstype.BoxAlignProperty | undefined
    WebkitBoxDirection?: csstype.BoxDirectionProperty | undefined
    WebkitBoxFlex?: csstype.GlobalsNumber | undefined
    WebkitBoxFlexGroup?: csstype.GlobalsNumber | undefined
    WebkitBoxLines?: csstype.BoxLinesProperty | undefined
    WebkitBoxOrdinalGroup?: csstype.GlobalsNumber | undefined
    WebkitBoxOrient?: csstype.BoxOrientProperty | undefined
    WebkitBoxPack?: csstype.BoxPackProperty | undefined
    WebkitScrollSnapPointsX?: string | undefined
    WebkitScrollSnapPointsY?: string | undefined
    alignmentBaseline?: csstype.AlignmentBaselineProperty | undefined
    baselineShift?: csstype.BaselineShiftProperty<string | number> | undefined
    clipRule?: csstype.ClipRuleProperty | undefined
    colorInterpolation?: csstype.ColorInterpolationProperty | undefined
    colorRendering?: csstype.ColorRenderingProperty | undefined
    dominantBaseline?: csstype.DominantBaselineProperty | undefined
    fill?: string | undefined
    fillOpacity?: csstype.GlobalsNumber | undefined
    fillRule?: csstype.FillRuleProperty | undefined
    floodColor?: string | undefined
    floodOpacity?: csstype.GlobalsNumber | undefined
    glyphOrientationVertical?:
      | csstype.GlyphOrientationVerticalProperty
      | undefined
    lightingColor?: string | undefined
    marker?: string | undefined
    markerEnd?: string | undefined
    markerMid?: string | undefined
    markerStart?: string | undefined
    shapeRendering?: csstype.ShapeRenderingProperty | undefined
    stopColor?: string | undefined
    stopOpacity?: csstype.GlobalsNumber | undefined
    stroke?: string | undefined
    strokeDasharray?:
      | csstype.StrokeDasharrayProperty<string | number>
      | undefined
    strokeDashoffset?:
      | csstype.StrokeDashoffsetProperty<string | number>
      | undefined
    strokeLinecap?: csstype.StrokeLinecapProperty | undefined
    strokeLinejoin?: csstype.StrokeLinejoinProperty | undefined
    strokeMiterlimit?: csstype.GlobalsNumber | undefined
    strokeOpacity?: csstype.GlobalsNumber | undefined
    strokeWidth?: csstype.StrokeWidthProperty<string | number> | undefined
    textAnchor?: csstype.TextAnchorProperty | undefined
    vectorEffect?: csstype.VectorEffectProperty | undefined
  }
  style: Ref<StyleProperties>
}

/**
 * Reactive transform string implementing all native CSS transform properties.
 *
 * @param props
 * @param enableHardwareAcceleration
 */
declare function reactiveTransform(
  props?: TransformProperties,
  enableHardwareAcceleration?: boolean,
): {
  state: {
    x?: string | number | undefined
    y?: string | number | undefined
    z?: string | number | undefined
    translateX?: string | number | undefined
    translateY?: string | number | undefined
    translateZ?: string | number | undefined
    rotate?: string | number | undefined
    rotateX?: string | number | undefined
    rotateY?: string | number | undefined
    rotateZ?: string | number | undefined
    scale?: string | number | undefined
    scaleX?: string | number | undefined
    scaleY?: string | number | undefined
    scaleZ?: string | number | undefined
    skew?: string | number | undefined
    skewX?: string | number | undefined
    skewY?: string | number | undefined
    originX?: string | number | undefined
    originY?: string | number | undefined
    originZ?: string | number | undefined
    perspective?: string | number | undefined
    transformPerspective?: string | number | undefined
  }
  transform: vue_demi.Ref<string>
}

/**
 * A Composable giving access to a StyleProperties object, and binding the generated style object to a target.
 *
 * @param target
 */
declare function useElementStyle(
  target: MaybeRef<PermissiveTarget>,
  onInit?: (initData: Partial<StyleProperties>) => void,
): {
  style: {
    alignContent?: string | undefined
    alignItems?: string | undefined
    alignSelf?: string | undefined
    alignTracks?: string | undefined
    animationDelay?: string | undefined
    animationDirection?: string | undefined
    animationDuration?: string | undefined
    animationFillMode?: string | undefined
    animationIterationCount?:
      | csstype.AnimationIterationCountProperty
      | undefined
    animationName?: string | undefined
    animationPlayState?: string | undefined
    animationTimingFunction?: string | undefined
    appearance?: csstype.AppearanceProperty | undefined
    aspectRatio?: string | undefined
    backdropFilter?: string | undefined
    backfaceVisibility?: csstype.BackfaceVisibilityProperty | undefined
    backgroundAttachment?: string | undefined
    backgroundBlendMode?: string | undefined
    backgroundClip?: string | undefined
    backgroundColor?: string | undefined
    backgroundImage?: string | undefined
    backgroundOrigin?: string | undefined
    backgroundPositionX?:
      | csstype.BackgroundPositionXProperty<string | number>
      | undefined
    backgroundPositionY?:
      | csstype.BackgroundPositionYProperty<string | number>
      | undefined
    backgroundRepeat?: string | undefined
    backgroundSize?: csstype.BackgroundSizeProperty<string | number> | undefined
    blockOverflow?: string | undefined
    blockSize?: csstype.BlockSizeProperty<string | number> | undefined
    borderBlockColor?: string | undefined
    borderBlockEndColor?: string | undefined
    borderBlockEndStyle?: csstype.BorderBlockEndStyleProperty | undefined
    borderBlockEndWidth?:
      | csstype.BorderBlockEndWidthProperty<string | number>
      | undefined
    borderBlockStartColor?: string | undefined
    borderBlockStartStyle?: csstype.BorderBlockStartStyleProperty | undefined
    borderBlockStartWidth?:
      | csstype.BorderBlockStartWidthProperty<string | number>
      | undefined
    borderBlockStyle?: csstype.BorderBlockStyleProperty | undefined
    borderBlockWidth?:
      | csstype.BorderBlockWidthProperty<string | number>
      | undefined
    borderBottomColor?: string | undefined
    borderBottomLeftRadius?:
      | csstype.BorderBottomLeftRadiusProperty<string | number>
      | undefined
    borderBottomRightRadius?:
      | csstype.BorderBottomRightRadiusProperty<string | number>
      | undefined
    borderBottomStyle?: csstype.BorderBottomStyleProperty | undefined
    borderBottomWidth?:
      | csstype.BorderBottomWidthProperty<string | number>
      | undefined
    borderCollapse?: csstype.BorderCollapseProperty | undefined
    borderEndEndRadius?:
      | csstype.BorderEndEndRadiusProperty<string | number>
      | undefined
    borderEndStartRadius?:
      | csstype.BorderEndStartRadiusProperty<string | number>
      | undefined
    borderImageOutset?:
      | csstype.BorderImageOutsetProperty<string | number>
      | undefined
    borderImageRepeat?: string | undefined
    borderImageSlice?: csstype.BorderImageSliceProperty | undefined
    borderImageSource?: string | undefined
    borderImageWidth?:
      | csstype.BorderImageWidthProperty<string | number>
      | undefined
    borderInlineColor?: string | undefined
    borderInlineEndColor?: string | undefined
    borderInlineEndStyle?: csstype.BorderInlineEndStyleProperty | undefined
    borderInlineEndWidth?:
      | csstype.BorderInlineEndWidthProperty<string | number>
      | undefined
    borderInlineStartColor?: string | undefined
    borderInlineStartStyle?: csstype.BorderInlineStartStyleProperty | undefined
    borderInlineStartWidth?:
      | csstype.BorderInlineStartWidthProperty<string | number>
      | undefined
    borderInlineStyle?: csstype.BorderInlineStyleProperty | undefined
    borderInlineWidth?:
      | csstype.BorderInlineWidthProperty<string | number>
      | undefined
    borderLeftColor?: string | undefined
    borderLeftStyle?: csstype.BorderLeftStyleProperty | undefined
    borderLeftWidth?:
      | csstype.BorderLeftWidthProperty<string | number>
      | undefined
    borderRightColor?: string | undefined
    borderRightStyle?: csstype.BorderRightStyleProperty | undefined
    borderRightWidth?:
      | csstype.BorderRightWidthProperty<string | number>
      | undefined
    borderSpacing?: csstype.BorderSpacingProperty<string | number> | undefined
    borderStartEndRadius?:
      | csstype.BorderStartEndRadiusProperty<string | number>
      | undefined
    borderStartStartRadius?:
      | csstype.BorderStartStartRadiusProperty<string | number>
      | undefined
    borderTopColor?: string | undefined
    borderTopLeftRadius?:
      | csstype.BorderTopLeftRadiusProperty<string | number>
      | undefined
    borderTopRightRadius?:
      | csstype.BorderTopRightRadiusProperty<string | number>
      | undefined
    borderTopStyle?: csstype.BorderTopStyleProperty | undefined
    borderTopWidth?: csstype.BorderTopWidthProperty<string | number> | undefined
    bottom?: csstype.BottomProperty<string | number> | undefined
    boxDecorationBreak?: csstype.BoxDecorationBreakProperty | undefined
    boxShadow?: string | undefined
    boxSizing?: csstype.BoxSizingProperty | undefined
    breakAfter?: csstype.BreakAfterProperty | undefined
    breakBefore?: csstype.BreakBeforeProperty | undefined
    breakInside?: csstype.BreakInsideProperty | undefined
    captionSide?: csstype.CaptionSideProperty | undefined
    caretColor?: string | undefined
    clear?: csstype.ClearProperty | undefined
    clipPath?: string | undefined
    color?: string | undefined
    colorAdjust?: csstype.ColorAdjustProperty | undefined
    colorScheme?: string | undefined
    columnCount?: csstype.ColumnCountProperty | undefined
    columnFill?: csstype.ColumnFillProperty | undefined
    columnGap?: csstype.ColumnGapProperty<string | number> | undefined
    columnRuleColor?: string | undefined
    columnRuleStyle?: string | undefined
    columnRuleWidth?:
      | csstype.ColumnRuleWidthProperty<string | number>
      | undefined
    columnSpan?: csstype.ColumnSpanProperty | undefined
    columnWidth?: csstype.ColumnWidthProperty<string | number> | undefined
    contain?: string | undefined
    content?: string | undefined
    contentVisibility?: csstype.ContentVisibilityProperty | undefined
    counterIncrement?: string | undefined
    counterReset?: string | undefined
    counterSet?: string | undefined
    cursor?: string | undefined
    direction?: csstype.DirectionProperty | undefined
    display?: string | undefined
    emptyCells?: csstype.EmptyCellsProperty | undefined
    filter?: string | undefined
    flexBasis?: csstype.FlexBasisProperty<string | number> | undefined
    flexDirection?: csstype.FlexDirectionProperty | undefined
    flexGrow?: csstype.GlobalsNumber | undefined
    flexShrink?: csstype.GlobalsNumber | undefined
    flexWrap?: csstype.FlexWrapProperty | undefined
    float?: csstype.FloatProperty | undefined
    fontFamily?: string | undefined
    fontFeatureSettings?: string | undefined
    fontKerning?: csstype.FontKerningProperty | undefined
    fontLanguageOverride?: string | undefined
    fontOpticalSizing?: csstype.FontOpticalSizingProperty | undefined
    fontSize?: csstype.FontSizeProperty<string | number> | undefined
    fontSizeAdjust?: csstype.FontSizeAdjustProperty | undefined
    fontSmooth?: csstype.FontSmoothProperty<string | number> | undefined
    fontStretch?: string | undefined
    fontStyle?: string | undefined
    fontSynthesis?: string | undefined
    fontVariant?: string | undefined
    fontVariantCaps?: csstype.FontVariantCapsProperty | undefined
    fontVariantEastAsian?: string | undefined
    fontVariantLigatures?: string | undefined
    fontVariantNumeric?: string | undefined
    fontVariantPosition?: csstype.FontVariantPositionProperty | undefined
    fontVariationSettings?: string | undefined
    fontWeight?: csstype.FontWeightProperty | undefined
    forcedColorAdjust?: csstype.ForcedColorAdjustProperty | undefined
    gridAutoColumns?:
      | csstype.GridAutoColumnsProperty<string | number>
      | undefined
    gridAutoFlow?: string | undefined
    gridAutoRows?: csstype.GridAutoRowsProperty<string | number> | undefined
    gridColumnEnd?: csstype.GridColumnEndProperty | undefined
    gridColumnStart?: csstype.GridColumnStartProperty | undefined
    gridRowEnd?: csstype.GridRowEndProperty | undefined
    gridRowStart?: csstype.GridRowStartProperty | undefined
    gridTemplateAreas?: string | undefined
    gridTemplateColumns?:
      | csstype.GridTemplateColumnsProperty<string | number>
      | undefined
    gridTemplateRows?:
      | csstype.GridTemplateRowsProperty<string | number>
      | undefined
    hangingPunctuation?: string | undefined
    height?: csstype.HeightProperty<string | number> | undefined
    hyphens?: csstype.HyphensProperty | undefined
    imageOrientation?: string | undefined
    imageRendering?: csstype.ImageRenderingProperty | undefined
    imageResolution?: string | undefined
    initialLetter?: csstype.InitialLetterProperty | undefined
    inlineSize?: csstype.InlineSizeProperty<string | number> | undefined
    inset?: csstype.InsetProperty<string | number> | undefined
    insetBlock?: csstype.InsetBlockProperty<string | number> | undefined
    insetBlockEnd?: csstype.InsetBlockEndProperty<string | number> | undefined
    insetBlockStart?:
      | csstype.InsetBlockStartProperty<string | number>
      | undefined
    insetInline?: csstype.InsetInlineProperty<string | number> | undefined
    insetInlineEnd?: csstype.InsetInlineEndProperty<string | number> | undefined
    insetInlineStart?:
      | csstype.InsetInlineStartProperty<string | number>
      | undefined
    isolation?: csstype.IsolationProperty | undefined
    justifyContent?: string | undefined
    justifyItems?: string | undefined
    justifySelf?: string | undefined
    justifyTracks?: string | undefined
    left?: csstype.LeftProperty<string | number> | undefined
    letterSpacing?: csstype.LetterSpacingProperty<string | number> | undefined
    lineBreak?: csstype.LineBreakProperty | undefined
    lineHeight?: csstype.LineHeightProperty<string | number> | undefined
    lineHeightStep?: csstype.LineHeightStepProperty<string | number> | undefined
    listStyleImage?: string | undefined
    listStylePosition?: csstype.ListStylePositionProperty | undefined
    listStyleType?: string | undefined
    marginBlock?: csstype.MarginBlockProperty<string | number> | undefined
    marginBlockEnd?: csstype.MarginBlockEndProperty<string | number> | undefined
    marginBlockStart?:
      | csstype.MarginBlockStartProperty<string | number>
      | undefined
    marginBottom?: csstype.MarginBottomProperty<string | number> | undefined
    marginInline?: csstype.MarginInlineProperty<string | number> | undefined
    marginInlineEnd?:
      | csstype.MarginInlineEndProperty<string | number>
      | undefined
    marginInlineStart?:
      | csstype.MarginInlineStartProperty<string | number>
      | undefined
    marginLeft?: csstype.MarginLeftProperty<string | number> | undefined
    marginRight?: csstype.MarginRightProperty<string | number> | undefined
    marginTop?: csstype.MarginTopProperty<string | number> | undefined
    maskBorderMode?: csstype.MaskBorderModeProperty | undefined
    maskBorderOutset?:
      | csstype.MaskBorderOutsetProperty<string | number>
      | undefined
    maskBorderRepeat?: string | undefined
    maskBorderSlice?: csstype.MaskBorderSliceProperty | undefined
    maskBorderSource?: string | undefined
    maskBorderWidth?:
      | csstype.MaskBorderWidthProperty<string | number>
      | undefined
    maskClip?: string | undefined
    maskComposite?: string | undefined
    maskImage?: string | undefined
    maskMode?: string | undefined
    maskOrigin?: string | undefined
    maskPosition?: csstype.MaskPositionProperty<string | number> | undefined
    maskRepeat?: string | undefined
    maskSize?: csstype.MaskSizeProperty<string | number> | undefined
    maskType?: csstype.MaskTypeProperty | undefined
    mathStyle?: csstype.MathStyleProperty | undefined
    maxBlockSize?: csstype.MaxBlockSizeProperty<string | number> | undefined
    maxHeight?: csstype.MaxHeightProperty<string | number> | undefined
    maxInlineSize?: csstype.MaxInlineSizeProperty<string | number> | undefined
    maxLines?: csstype.MaxLinesProperty | undefined
    maxWidth?: csstype.MaxWidthProperty<string | number> | undefined
    minBlockSize?: csstype.MinBlockSizeProperty<string | number> | undefined
    minHeight?: csstype.MinHeightProperty<string | number> | undefined
    minInlineSize?: csstype.MinInlineSizeProperty<string | number> | undefined
    minWidth?: csstype.MinWidthProperty<string | number> | undefined
    mixBlendMode?: csstype.MixBlendModeProperty | undefined
    motionDistance?: csstype.OffsetDistanceProperty<string | number> | undefined
    motionPath?: string | undefined
    motionRotation?: string | undefined
    objectFit?: csstype.ObjectFitProperty | undefined
    objectPosition?: csstype.ObjectPositionProperty<string | number> | undefined
    offsetAnchor?: csstype.OffsetAnchorProperty<string | number> | undefined
    offsetDistance?: csstype.OffsetDistanceProperty<string | number> | undefined
    offsetPath?: string | undefined
    offsetRotate?: string | undefined
    offsetRotation?: string | undefined
    opacity?: csstype.OpacityProperty | undefined
    order?: csstype.GlobalsNumber | undefined
    orphans?: csstype.GlobalsNumber | undefined
    outlineColor?: string | undefined
    outlineOffset?: csstype.OutlineOffsetProperty<string | number> | undefined
    outlineStyle?: string | undefined
    outlineWidth?: csstype.OutlineWidthProperty<string | number> | undefined
    overflowAnchor?: csstype.OverflowAnchorProperty | undefined
    overflowBlock?: csstype.OverflowBlockProperty | undefined
    overflowClipBox?: csstype.OverflowClipBoxProperty | undefined
    overflowClipMargin?:
      | csstype.OverflowClipMarginProperty<string | number>
      | undefined
    overflowInline?: csstype.OverflowInlineProperty | undefined
    overflowWrap?: csstype.OverflowWrapProperty | undefined
    overflowX?: csstype.OverflowXProperty | undefined
    overflowY?: csstype.OverflowYProperty | undefined
    overscrollBehaviorBlock?:
      | csstype.OverscrollBehaviorBlockProperty
      | undefined
    overscrollBehaviorInline?:
      | csstype.OverscrollBehaviorInlineProperty
      | undefined
    overscrollBehaviorX?: csstype.OverscrollBehaviorXProperty | undefined
    overscrollBehaviorY?: csstype.OverscrollBehaviorYProperty | undefined
    paddingBlock?: csstype.PaddingBlockProperty<string | number> | undefined
    paddingBlockEnd?:
      | csstype.PaddingBlockEndProperty<string | number>
      | undefined
    paddingBlockStart?:
      | csstype.PaddingBlockStartProperty<string | number>
      | undefined
    paddingBottom?: csstype.PaddingBottomProperty<string | number> | undefined
    paddingInline?: csstype.PaddingInlineProperty<string | number> | undefined
    paddingInlineEnd?:
      | csstype.PaddingInlineEndProperty<string | number>
      | undefined
    paddingInlineStart?:
      | csstype.PaddingInlineStartProperty<string | number>
      | undefined
    paddingLeft?: csstype.PaddingLeftProperty<string | number> | undefined
    paddingRight?: csstype.PaddingRightProperty<string | number> | undefined
    paddingTop?: csstype.PaddingTopProperty<string | number> | undefined
    pageBreakAfter?: csstype.PageBreakAfterProperty | undefined
    pageBreakBefore?: csstype.PageBreakBeforeProperty | undefined
    pageBreakInside?: csstype.PageBreakInsideProperty | undefined
    paintOrder?: string | undefined
    perspectiveOrigin?:
      | csstype.PerspectiveOriginProperty<string | number>
      | undefined
    placeContent?: string | undefined
    pointerEvents?: csstype.PointerEventsProperty | undefined
    position?: csstype.PositionProperty | undefined
    quotes?: string | undefined
    resize?: csstype.ResizeProperty | undefined
    right?: csstype.RightProperty<string | number> | undefined
    rowGap?: csstype.RowGapProperty<string | number> | undefined
    rubyAlign?: csstype.RubyAlignProperty | undefined
    rubyMerge?: csstype.RubyMergeProperty | undefined
    rubyPosition?: string | undefined
    scrollBehavior?: csstype.ScrollBehaviorProperty | undefined
    scrollMargin?: csstype.ScrollMarginProperty<string | number> | undefined
    scrollMarginBlock?:
      | csstype.ScrollMarginBlockProperty<string | number>
      | undefined
    scrollMarginBlockEnd?:
      | csstype.ScrollMarginBlockEndProperty<string | number>
      | undefined
    scrollMarginBlockStart?:
      | csstype.ScrollMarginBlockStartProperty<string | number>
      | undefined
    scrollMarginBottom?:
      | csstype.ScrollMarginBottomProperty<string | number>
      | undefined
    scrollMarginInline?:
      | csstype.ScrollMarginInlineProperty<string | number>
      | undefined
    scrollMarginInlineEnd?:
      | csstype.ScrollMarginInlineEndProperty<string | number>
      | undefined
    scrollMarginInlineStart?:
      | csstype.ScrollMarginInlineStartProperty<string | number>
      | undefined
    scrollMarginLeft?:
      | csstype.ScrollMarginLeftProperty<string | number>
      | undefined
    scrollMarginRight?:
      | csstype.ScrollMarginRightProperty<string | number>
      | undefined
    scrollMarginTop?:
      | csstype.ScrollMarginTopProperty<string | number>
      | undefined
    scrollPadding?: csstype.ScrollPaddingProperty<string | number> | undefined
    scrollPaddingBlock?:
      | csstype.ScrollPaddingBlockProperty<string | number>
      | undefined
    scrollPaddingBlockEnd?:
      | csstype.ScrollPaddingBlockEndProperty<string | number>
      | undefined
    scrollPaddingBlockStart?:
      | csstype.ScrollPaddingBlockStartProperty<string | number>
      | undefined
    scrollPaddingBottom?:
      | csstype.ScrollPaddingBottomProperty<string | number>
      | undefined
    scrollPaddingInline?:
      | csstype.ScrollPaddingInlineProperty<string | number>
      | undefined
    scrollPaddingInlineEnd?:
      | csstype.ScrollPaddingInlineEndProperty<string | number>
      | undefined
    scrollPaddingInlineStart?:
      | csstype.ScrollPaddingInlineStartProperty<string | number>
      | undefined
    scrollPaddingLeft?:
      | csstype.ScrollPaddingLeftProperty<string | number>
      | undefined
    scrollPaddingRight?:
      | csstype.ScrollPaddingRightProperty<string | number>
      | undefined
    scrollPaddingTop?:
      | csstype.ScrollPaddingTopProperty<string | number>
      | undefined
    scrollSnapAlign?: string | undefined
    scrollSnapMargin?: csstype.ScrollMarginProperty<string | number> | undefined
    scrollSnapMarginBottom?:
      | csstype.ScrollMarginBottomProperty<string | number>
      | undefined
    scrollSnapMarginLeft?:
      | csstype.ScrollMarginLeftProperty<string | number>
      | undefined
    scrollSnapMarginRight?:
      | csstype.ScrollMarginRightProperty<string | number>
      | undefined
    scrollSnapMarginTop?:
      | csstype.ScrollMarginTopProperty<string | number>
      | undefined
    scrollSnapStop?: csstype.ScrollSnapStopProperty | undefined
    scrollSnapType?: string | undefined
    scrollbarColor?: string | undefined
    scrollbarGutter?: string | undefined
    scrollbarWidth?: csstype.ScrollbarWidthProperty | undefined
    shapeImageThreshold?: csstype.ShapeImageThresholdProperty | undefined
    shapeMargin?: csstype.ShapeMarginProperty<string | number> | undefined
    shapeOutside?: string | undefined
    tabSize?: csstype.TabSizeProperty<string | number> | undefined
    tableLayout?: csstype.TableLayoutProperty | undefined
    textAlign?: csstype.TextAlignProperty | undefined
    textAlignLast?: csstype.TextAlignLastProperty | undefined
    textCombineUpright?: string | undefined
    textDecorationColor?: string | undefined
    textDecorationLine?: string | undefined
    textDecorationSkip?: string | undefined
    textDecorationSkipInk?: csstype.TextDecorationSkipInkProperty | undefined
    textDecorationStyle?: csstype.TextDecorationStyleProperty | undefined
    textDecorationThickness?:
      | csstype.TextDecorationThicknessProperty<string | number>
      | undefined
    textDecorationWidth?:
      | csstype.TextDecorationThicknessProperty<string | number>
      | undefined
    textEmphasisColor?: string | undefined
    textEmphasisPosition?: string | undefined
    textEmphasisStyle?: string | undefined
    textIndent?: csstype.TextIndentProperty<string | number> | undefined
    textJustify?: csstype.TextJustifyProperty | undefined
    textOrientation?: csstype.TextOrientationProperty | undefined
    textOverflow?: string | undefined
    textRendering?: csstype.TextRenderingProperty | undefined
    textShadow?: string | undefined
    textSizeAdjust?: string | undefined
    textTransform?: csstype.TextTransformProperty | undefined
    textUnderlineOffset?:
      | csstype.TextUnderlineOffsetProperty<string | number>
      | undefined
    textUnderlinePosition?: string | undefined
    top?: csstype.TopProperty<string | number> | undefined
    touchAction?: string | undefined
    transitionDelay?: string | undefined
    transitionDuration?: string | undefined
    transitionProperty?: string | undefined
    transitionTimingFunction?: string | undefined
    translate?: csstype.TranslateProperty<string | number> | undefined
    unicodeBidi?: csstype.UnicodeBidiProperty | undefined
    userSelect?: csstype.UserSelectProperty | undefined
    verticalAlign?: csstype.VerticalAlignProperty<string | number> | undefined
    visibility?: csstype.VisibilityProperty | undefined
    whiteSpace?: csstype.WhiteSpaceProperty | undefined
    widows?: csstype.GlobalsNumber | undefined
    width?: csstype.WidthProperty<string | number> | undefined
    willChange?: string | undefined
    wordBreak?: csstype.WordBreakProperty | undefined
    wordSpacing?: csstype.WordSpacingProperty<string | number> | undefined
    wordWrap?: csstype.WordWrapProperty | undefined
    writingMode?: csstype.WritingModeProperty | undefined
    zIndex?: csstype.ZIndexProperty | undefined
    zoom?: csstype.ZoomProperty | undefined
    all?: csstype.Globals | undefined
    animation?: csstype.AnimationProperty | undefined
    background?: csstype.BackgroundProperty<string | number> | undefined
    backgroundPosition?:
      | csstype.BackgroundPositionProperty<string | number>
      | undefined
    border?: csstype.BorderProperty<string | number> | undefined
    borderBlock?: csstype.BorderBlockProperty<string | number> | undefined
    borderBlockEnd?: csstype.BorderBlockEndProperty<string | number> | undefined
    borderBlockStart?:
      | csstype.BorderBlockStartProperty<string | number>
      | undefined
    borderBottom?: csstype.BorderBottomProperty<string | number> | undefined
    borderColor?: string | undefined
    borderImage?: csstype.BorderImageProperty | undefined
    borderInline?: csstype.BorderInlineProperty<string | number> | undefined
    borderInlineEnd?:
      | csstype.BorderInlineEndProperty<string | number>
      | undefined
    borderInlineStart?:
      | csstype.BorderInlineStartProperty<string | number>
      | undefined
    borderLeft?: csstype.BorderLeftProperty<string | number> | undefined
    borderRadius?: csstype.BorderRadiusProperty<string | number> | undefined
    borderRight?: csstype.BorderRightProperty<string | number> | undefined
    borderStyle?: string | undefined
    borderTop?: csstype.BorderTopProperty<string | number> | undefined
    borderWidth?: csstype.BorderWidthProperty<string | number> | undefined
    columnRule?: csstype.ColumnRuleProperty<string | number> | undefined
    columns?: csstype.ColumnsProperty<string | number> | undefined
    flex?: csstype.FlexProperty<string | number> | undefined
    flexFlow?: string | undefined
    font?: string | undefined
    gap?: csstype.GapProperty<string | number> | undefined
    grid?: string | undefined
    gridArea?: csstype.GridAreaProperty | undefined
    gridColumn?: csstype.GridColumnProperty | undefined
    gridRow?: csstype.GridRowProperty | undefined
    gridTemplate?: string | undefined
    lineClamp?: csstype.LineClampProperty | undefined
    listStyle?: string | undefined
    margin?: csstype.MarginProperty<string | number> | undefined
    mask?: csstype.MaskProperty<string | number> | undefined
    maskBorder?: csstype.MaskBorderProperty | undefined
    motion?: csstype.OffsetProperty<string | number> | undefined
    offset?: csstype.OffsetProperty<string | number> | undefined
    outline?: csstype.OutlineProperty<string | number> | undefined
    overflow?: string | undefined
    overscrollBehavior?: string | undefined
    padding?: csstype.PaddingProperty<string | number> | undefined
    placeItems?: string | undefined
    placeSelf?: string | undefined
    textDecoration?: csstype.TextDecorationProperty<string | number> | undefined
    textEmphasis?: string | undefined
    MozAnimationDelay?: string | undefined
    MozAnimationDirection?: string | undefined
    MozAnimationDuration?: string | undefined
    MozAnimationFillMode?: string | undefined
    MozAnimationIterationCount?:
      | csstype.AnimationIterationCountProperty
      | undefined
    MozAnimationName?: string | undefined
    MozAnimationPlayState?: string | undefined
    MozAnimationTimingFunction?: string | undefined
    MozAppearance?: csstype.MozAppearanceProperty | undefined
    MozBackfaceVisibility?: csstype.BackfaceVisibilityProperty | undefined
    MozBorderBottomColors?: string | undefined
    MozBorderEndColor?: string | undefined
    MozBorderEndStyle?: csstype.BorderInlineEndStyleProperty | undefined
    MozBorderEndWidth?:
      | csstype.BorderInlineEndWidthProperty<string | number>
      | undefined
    MozBorderLeftColors?: string | undefined
    MozBorderRightColors?: string | undefined
    MozBorderStartColor?: string | undefined
    MozBorderStartStyle?: csstype.BorderInlineStartStyleProperty | undefined
    MozBorderTopColors?: string | undefined
    MozBoxSizing?: csstype.BoxSizingProperty | undefined
    MozColumnCount?: csstype.ColumnCountProperty | undefined
    MozColumnFill?: csstype.ColumnFillProperty | undefined
    MozColumnGap?: csstype.ColumnGapProperty<string | number> | undefined
    MozColumnRuleColor?: string | undefined
    MozColumnRuleStyle?: string | undefined
    MozColumnRuleWidth?:
      | csstype.ColumnRuleWidthProperty<string | number>
      | undefined
    MozColumnWidth?: csstype.ColumnWidthProperty<string | number> | undefined
    MozContextProperties?: string | undefined
    MozFontFeatureSettings?: string | undefined
    MozFontLanguageOverride?: string | undefined
    MozHyphens?: csstype.HyphensProperty | undefined
    MozImageRegion?: string | undefined
    MozMarginEnd?: csstype.MarginInlineEndProperty<string | number> | undefined
    MozMarginStart?:
      | csstype.MarginInlineStartProperty<string | number>
      | undefined
    MozOrient?: csstype.MozOrientProperty | undefined
    MozOsxFontSmoothing?:
      | csstype.FontSmoothProperty<string | number>
      | undefined
    MozPaddingEnd?:
      | csstype.PaddingInlineEndProperty<string | number>
      | undefined
    MozPaddingStart?:
      | csstype.PaddingInlineStartProperty<string | number>
      | undefined
    MozPerspective?: csstype.PerspectiveProperty<string | number> | undefined
    MozPerspectiveOrigin?:
      | csstype.PerspectiveOriginProperty<string | number>
      | undefined
    MozStackSizing?: csstype.MozStackSizingProperty | undefined
    MozTabSize?: csstype.TabSizeProperty<string | number> | undefined
    MozTextBlink?: csstype.MozTextBlinkProperty | undefined
    MozTextSizeAdjust?: string | undefined
    MozTransformOrigin?:
      | csstype.TransformOriginProperty<string | number>
      | undefined
    MozTransformStyle?: csstype.TransformStyleProperty | undefined
    MozTransitionDelay?: string | undefined
    MozTransitionDuration?: string | undefined
    MozTransitionProperty?: string | undefined
    MozTransitionTimingFunction?: string | undefined
    MozUserFocus?: csstype.MozUserFocusProperty | undefined
    MozUserModify?: csstype.MozUserModifyProperty | undefined
    MozUserSelect?: csstype.UserSelectProperty | undefined
    MozWindowDragging?: csstype.MozWindowDraggingProperty | undefined
    MozWindowShadow?: csstype.MozWindowShadowProperty | undefined
    msAccelerator?: csstype.MsAcceleratorProperty | undefined
    msAlignSelf?: string | undefined
    msBlockProgression?: csstype.MsBlockProgressionProperty | undefined
    msContentZoomChaining?: csstype.MsContentZoomChainingProperty | undefined
    msContentZoomLimitMax?: string | undefined
    msContentZoomLimitMin?: string | undefined
    msContentZoomSnapPoints?: string | undefined
    msContentZoomSnapType?: csstype.MsContentZoomSnapTypeProperty | undefined
    msContentZooming?: csstype.MsContentZoomingProperty | undefined
    msFilter?: string | undefined
    msFlexDirection?: csstype.FlexDirectionProperty | undefined
    msFlexPositive?: csstype.GlobalsNumber | undefined
    msFlowFrom?: string | undefined
    msFlowInto?: string | undefined
    msGridColumns?: csstype.MsGridColumnsProperty<string | number> | undefined
    msGridRows?: csstype.MsGridRowsProperty<string | number> | undefined
    msHighContrastAdjust?: csstype.MsHighContrastAdjustProperty | undefined
    msHyphenateLimitChars?: csstype.MsHyphenateLimitCharsProperty | undefined
    msHyphenateLimitLines?: csstype.MsHyphenateLimitLinesProperty | undefined
    msHyphenateLimitZone?:
      | csstype.MsHyphenateLimitZoneProperty<string | number>
      | undefined
    msHyphens?: csstype.HyphensProperty | undefined
    msImeAlign?: csstype.MsImeAlignProperty | undefined
    msJustifySelf?: string | undefined
    msLineBreak?: csstype.LineBreakProperty | undefined
    msOrder?: csstype.GlobalsNumber | undefined
    msOverflowStyle?: csstype.MsOverflowStyleProperty | undefined
    msOverflowX?: csstype.OverflowXProperty | undefined
    msOverflowY?: csstype.OverflowYProperty | undefined
    msScrollChaining?: csstype.MsScrollChainingProperty | undefined
    msScrollLimitXMax?:
      | csstype.MsScrollLimitXMaxProperty<string | number>
      | undefined
    msScrollLimitXMin?:
      | csstype.MsScrollLimitXMinProperty<string | number>
      | undefined
    msScrollLimitYMax?:
      | csstype.MsScrollLimitYMaxProperty<string | number>
      | undefined
    msScrollLimitYMin?:
      | csstype.MsScrollLimitYMinProperty<string | number>
      | undefined
    msScrollRails?: csstype.MsScrollRailsProperty | undefined
    msScrollSnapPointsX?: string | undefined
    msScrollSnapPointsY?: string | undefined
    msScrollSnapType?: csstype.MsScrollSnapTypeProperty | undefined
    msScrollTranslation?: csstype.MsScrollTranslationProperty | undefined
    msScrollbar3dlightColor?: string | undefined
    msScrollbarArrowColor?: string | undefined
    msScrollbarBaseColor?: string | undefined
    msScrollbarDarkshadowColor?: string | undefined
    msScrollbarFaceColor?: string | undefined
    msScrollbarHighlightColor?: string | undefined
    msScrollbarShadowColor?: string | undefined
    msTextAutospace?: csstype.MsTextAutospaceProperty | undefined
    msTextCombineHorizontal?: string | undefined
    msTextOverflow?: string | undefined
    msTouchAction?: string | undefined
    msTouchSelect?: csstype.MsTouchSelectProperty | undefined
    msTransform?: string | undefined
    msTransformOrigin?:
      | csstype.TransformOriginProperty<string | number>
      | undefined
    msTransitionDelay?: string | undefined
    msTransitionDuration?: string | undefined
    msTransitionProperty?: string | undefined
    msTransitionTimingFunction?: string | undefined
    msUserSelect?: csstype.MsUserSelectProperty | undefined
    msWordBreak?: csstype.WordBreakProperty | undefined
    msWrapFlow?: csstype.MsWrapFlowProperty | undefined
    msWrapMargin?: csstype.MsWrapMarginProperty<string | number> | undefined
    msWrapThrough?: csstype.MsWrapThroughProperty | undefined
    msWritingMode?: csstype.WritingModeProperty | undefined
    WebkitAlignContent?: string | undefined
    WebkitAlignItems?: string | undefined
    WebkitAlignSelf?: string | undefined
    WebkitAnimationDelay?: string | undefined
    WebkitAnimationDirection?: string | undefined
    WebkitAnimationDuration?: string | undefined
    WebkitAnimationFillMode?: string | undefined
    WebkitAnimationIterationCount?:
      | csstype.AnimationIterationCountProperty
      | undefined
    WebkitAnimationName?: string | undefined
    WebkitAnimationPlayState?: string | undefined
    WebkitAnimationTimingFunction?: string | undefined
    WebkitAppearance?: csstype.WebkitAppearanceProperty | undefined
    WebkitBackdropFilter?: string | undefined
    WebkitBackfaceVisibility?: csstype.BackfaceVisibilityProperty | undefined
    WebkitBackgroundClip?: string | undefined
    WebkitBackgroundOrigin?: string | undefined
    WebkitBackgroundSize?:
      | csstype.BackgroundSizeProperty<string | number>
      | undefined
    WebkitBorderBeforeColor?: string | undefined
    WebkitBorderBeforeStyle?: string | undefined
    WebkitBorderBeforeWidth?:
      | csstype.WebkitBorderBeforeWidthProperty<string | number>
      | undefined
    WebkitBorderBottomLeftRadius?:
      | csstype.BorderBottomLeftRadiusProperty<string | number>
      | undefined
    WebkitBorderBottomRightRadius?:
      | csstype.BorderBottomRightRadiusProperty<string | number>
      | undefined
    WebkitBorderImageSlice?: csstype.BorderImageSliceProperty | undefined
    WebkitBorderTopLeftRadius?:
      | csstype.BorderTopLeftRadiusProperty<string | number>
      | undefined
    WebkitBorderTopRightRadius?:
      | csstype.BorderTopRightRadiusProperty<string | number>
      | undefined
    WebkitBoxDecorationBreak?: csstype.BoxDecorationBreakProperty | undefined
    WebkitBoxReflect?:
      | csstype.WebkitBoxReflectProperty<string | number>
      | undefined
    WebkitBoxShadow?: string | undefined
    WebkitBoxSizing?: csstype.BoxSizingProperty | undefined
    WebkitClipPath?: string | undefined
    WebkitColumnCount?: csstype.ColumnCountProperty | undefined
    WebkitColumnFill?: csstype.ColumnFillProperty | undefined
    WebkitColumnGap?: csstype.ColumnGapProperty<string | number> | undefined
    WebkitColumnRuleColor?: string | undefined
    WebkitColumnRuleStyle?: string | undefined
    WebkitColumnRuleWidth?:
      | csstype.ColumnRuleWidthProperty<string | number>
      | undefined
    WebkitColumnSpan?: csstype.ColumnSpanProperty | undefined
    WebkitColumnWidth?: csstype.ColumnWidthProperty<string | number> | undefined
    WebkitFilter?: string | undefined
    WebkitFlexBasis?: csstype.FlexBasisProperty<string | number> | undefined
    WebkitFlexDirection?: csstype.FlexDirectionProperty | undefined
    WebkitFlexGrow?: csstype.GlobalsNumber | undefined
    WebkitFlexShrink?: csstype.GlobalsNumber | undefined
    WebkitFlexWrap?: csstype.FlexWrapProperty | undefined
    WebkitFontFeatureSettings?: string | undefined
    WebkitFontKerning?: csstype.FontKerningProperty | undefined
    WebkitFontSmoothing?:
      | csstype.FontSmoothProperty<string | number>
      | undefined
    WebkitFontVariantLigatures?: string | undefined
    WebkitHyphens?: csstype.HyphensProperty | undefined
    WebkitJustifyContent?: string | undefined
    WebkitLineBreak?: csstype.LineBreakProperty | undefined
    WebkitLineClamp?: csstype.WebkitLineClampProperty | undefined
    WebkitMarginEnd?:
      | csstype.MarginInlineEndProperty<string | number>
      | undefined
    WebkitMarginStart?:
      | csstype.MarginInlineStartProperty<string | number>
      | undefined
    WebkitMaskAttachment?: string | undefined
    WebkitMaskBoxImageOutset?:
      | csstype.MaskBorderOutsetProperty<string | number>
      | undefined
    WebkitMaskBoxImageRepeat?: string | undefined
    WebkitMaskBoxImageSlice?: csstype.MaskBorderSliceProperty | undefined
    WebkitMaskBoxImageSource?: string | undefined
    WebkitMaskBoxImageWidth?:
      | csstype.MaskBorderWidthProperty<string | number>
      | undefined
    WebkitMaskClip?: string | undefined
    WebkitMaskComposite?: string | undefined
    WebkitMaskImage?: string | undefined
    WebkitMaskOrigin?: string | undefined
    WebkitMaskPosition?:
      | csstype.WebkitMaskPositionProperty<string | number>
      | undefined
    WebkitMaskPositionX?:
      | csstype.WebkitMaskPositionXProperty<string | number>
      | undefined
    WebkitMaskPositionY?:
      | csstype.WebkitMaskPositionYProperty<string | number>
      | undefined
    WebkitMaskRepeat?: string | undefined
    WebkitMaskRepeatX?: csstype.WebkitMaskRepeatXProperty | undefined
    WebkitMaskRepeatY?: csstype.WebkitMaskRepeatYProperty | undefined
    WebkitMaskSize?: csstype.WebkitMaskSizeProperty<string | number> | undefined
    WebkitMaxInlineSize?:
      | csstype.MaxInlineSizeProperty<string | number>
      | undefined
    WebkitOrder?: csstype.GlobalsNumber | undefined
    WebkitOverflowScrolling?:
      | csstype.WebkitOverflowScrollingProperty
      | undefined
    WebkitPaddingEnd?:
      | csstype.PaddingInlineEndProperty<string | number>
      | undefined
    WebkitPaddingStart?:
      | csstype.PaddingInlineStartProperty<string | number>
      | undefined
    WebkitPerspective?: csstype.PerspectiveProperty<string | number> | undefined
    WebkitPerspectiveOrigin?:
      | csstype.PerspectiveOriginProperty<string | number>
      | undefined
    WebkitPrintColorAdjust?: csstype.ColorAdjustProperty | undefined
    WebkitRubyPosition?: string | undefined
    WebkitScrollSnapType?: string | undefined
    WebkitShapeMargin?: csstype.ShapeMarginProperty<string | number> | undefined
    WebkitTapHighlightColor?: string | undefined
    WebkitTextCombine?: string | undefined
    WebkitTextDecorationColor?: string | undefined
    WebkitTextDecorationLine?: string | undefined
    WebkitTextDecorationSkip?: string | undefined
    WebkitTextDecorationStyle?: csstype.TextDecorationStyleProperty | undefined
    WebkitTextEmphasisColor?: string | undefined
    WebkitTextEmphasisPosition?: string | undefined
    WebkitTextEmphasisStyle?: string | undefined
    WebkitTextFillColor?: string | undefined
    WebkitTextOrientation?: csstype.TextOrientationProperty | undefined
    WebkitTextSizeAdjust?: string | undefined
    WebkitTextStrokeColor?: string | undefined
    WebkitTextStrokeWidth?:
      | csstype.WebkitTextStrokeWidthProperty<string | number>
      | undefined
    WebkitTextUnderlinePosition?: string | undefined
    WebkitTouchCallout?: csstype.WebkitTouchCalloutProperty | undefined
    WebkitTransform?: string | undefined
    WebkitTransformOrigin?:
      | csstype.TransformOriginProperty<string | number>
      | undefined
    WebkitTransformStyle?: csstype.TransformStyleProperty | undefined
    WebkitTransitionDelay?: string | undefined
    WebkitTransitionDuration?: string | undefined
    WebkitTransitionProperty?: string | undefined
    WebkitTransitionTimingFunction?: string | undefined
    WebkitUserModify?: csstype.WebkitUserModifyProperty | undefined
    WebkitUserSelect?: csstype.UserSelectProperty | undefined
    WebkitWritingMode?: csstype.WritingModeProperty | undefined
    MozAnimation?: csstype.AnimationProperty | undefined
    MozBorderImage?: csstype.BorderImageProperty | undefined
    MozColumnRule?: csstype.ColumnRuleProperty<string | number> | undefined
    MozColumns?: csstype.ColumnsProperty<string | number> | undefined
    MozTransition?: string | undefined
    msContentZoomLimit?: string | undefined
    msContentZoomSnap?: string | undefined
    msFlex?: csstype.FlexProperty<string | number> | undefined
    msScrollLimit?: string | undefined
    msScrollSnapX?: string | undefined
    msScrollSnapY?: string | undefined
    msTransition?: string | undefined
    WebkitAnimation?: csstype.AnimationProperty | undefined
    WebkitBorderBefore?:
      | csstype.WebkitBorderBeforeProperty<string | number>
      | undefined
    WebkitBorderImage?: csstype.BorderImageProperty | undefined
    WebkitBorderRadius?:
      | csstype.BorderRadiusProperty<string | number>
      | undefined
    WebkitColumnRule?: csstype.ColumnRuleProperty<string | number> | undefined
    WebkitColumns?: csstype.ColumnsProperty<string | number> | undefined
    WebkitFlex?: csstype.FlexProperty<string | number> | undefined
    WebkitFlexFlow?: string | undefined
    WebkitMask?: csstype.WebkitMaskProperty<string | number> | undefined
    WebkitMaskBoxImage?: csstype.MaskBorderProperty | undefined
    WebkitTextEmphasis?: string | undefined
    WebkitTextStroke?:
      | csstype.WebkitTextStrokeProperty<string | number>
      | undefined
    WebkitTransition?: string | undefined
    azimuth?: string | undefined
    boxAlign?: csstype.BoxAlignProperty | undefined
    boxDirection?: csstype.BoxDirectionProperty | undefined
    boxFlex?: csstype.GlobalsNumber | undefined
    boxFlexGroup?: csstype.GlobalsNumber | undefined
    boxLines?: csstype.BoxLinesProperty | undefined
    boxOrdinalGroup?: csstype.GlobalsNumber | undefined
    boxOrient?: csstype.BoxOrientProperty | undefined
    boxPack?: csstype.BoxPackProperty | undefined
    clip?: string | undefined
    fontVariantAlternates?: string | undefined
    gridColumnGap?: csstype.GridColumnGapProperty<string | number> | undefined
    gridGap?: csstype.GridGapProperty<string | number> | undefined
    gridRowGap?: csstype.GridRowGapProperty<string | number> | undefined
    imeMode?: csstype.ImeModeProperty | undefined
    offsetBlock?: csstype.InsetBlockProperty<string | number> | undefined
    offsetBlockEnd?: csstype.InsetBlockEndProperty<string | number> | undefined
    offsetBlockStart?:
      | csstype.InsetBlockStartProperty<string | number>
      | undefined
    offsetInline?: csstype.InsetInlineProperty<string | number> | undefined
    offsetInlineEnd?:
      | csstype.InsetInlineEndProperty<string | number>
      | undefined
    offsetInlineStart?:
      | csstype.InsetInlineStartProperty<string | number>
      | undefined
    scrollSnapCoordinate?:
      | csstype.ScrollSnapCoordinateProperty<string | number>
      | undefined
    scrollSnapDestination?:
      | csstype.ScrollSnapDestinationProperty<string | number>
      | undefined
    scrollSnapPointsX?: string | undefined
    scrollSnapPointsY?: string | undefined
    scrollSnapTypeX?: csstype.ScrollSnapTypeXProperty | undefined
    scrollSnapTypeY?: csstype.ScrollSnapTypeYProperty | undefined
    scrollbarTrackColor?: string | undefined
    KhtmlBoxAlign?: csstype.BoxAlignProperty | undefined
    KhtmlBoxDirection?: csstype.BoxDirectionProperty | undefined
    KhtmlBoxFlex?: csstype.GlobalsNumber | undefined
    KhtmlBoxFlexGroup?: csstype.GlobalsNumber | undefined
    KhtmlBoxLines?: csstype.BoxLinesProperty | undefined
    KhtmlBoxOrdinalGroup?: csstype.GlobalsNumber | undefined
    KhtmlBoxOrient?: csstype.BoxOrientProperty | undefined
    KhtmlBoxPack?: csstype.BoxPackProperty | undefined
    KhtmlLineBreak?: csstype.LineBreakProperty | undefined
    KhtmlOpacity?: csstype.OpacityProperty | undefined
    KhtmlUserSelect?: csstype.UserSelectProperty | undefined
    MozBackgroundClip?: string | undefined
    MozBackgroundInlinePolicy?: csstype.BoxDecorationBreakProperty | undefined
    MozBackgroundOrigin?: string | undefined
    MozBackgroundSize?:
      | csstype.BackgroundSizeProperty<string | number>
      | undefined
    MozBinding?: string | undefined
    MozBorderRadius?: csstype.BorderRadiusProperty<string | number> | undefined
    MozBorderRadiusBottomleft?:
      | csstype.BorderBottomLeftRadiusProperty<string | number>
      | undefined
    MozBorderRadiusBottomright?:
      | csstype.BorderBottomRightRadiusProperty<string | number>
      | undefined
    MozBorderRadiusTopleft?:
      | csstype.BorderTopLeftRadiusProperty<string | number>
      | undefined
    MozBorderRadiusTopright?:
      | csstype.BorderTopRightRadiusProperty<string | number>
      | undefined
    MozBoxAlign?: csstype.BoxAlignProperty | undefined
    MozBoxDirection?: csstype.BoxDirectionProperty | undefined
    MozBoxFlex?: csstype.GlobalsNumber | undefined
    MozBoxOrdinalGroup?: csstype.GlobalsNumber | undefined
    MozBoxOrient?: csstype.BoxOrientProperty | undefined
    MozBoxPack?: csstype.BoxPackProperty | undefined
    MozBoxShadow?: string | undefined
    MozFloatEdge?: csstype.MozFloatEdgeProperty | undefined
    MozForceBrokenImageIcon?: csstype.GlobalsNumber | undefined
    MozOpacity?: csstype.OpacityProperty | undefined
    MozOutline?: csstype.OutlineProperty<string | number> | undefined
    MozOutlineColor?: string | undefined
    MozOutlineRadius?:
      | csstype.MozOutlineRadiusProperty<string | number>
      | undefined
    MozOutlineRadiusBottomleft?:
      | csstype.MozOutlineRadiusBottomleftProperty<string | number>
      | undefined
    MozOutlineRadiusBottomright?:
      | csstype.MozOutlineRadiusBottomrightProperty<string | number>
      | undefined
    MozOutlineRadiusTopleft?:
      | csstype.MozOutlineRadiusTopleftProperty<string | number>
      | undefined
    MozOutlineRadiusTopright?:
      | csstype.MozOutlineRadiusToprightProperty<string | number>
      | undefined
    MozOutlineStyle?: string | undefined
    MozOutlineWidth?: csstype.OutlineWidthProperty<string | number> | undefined
    MozTextAlignLast?: csstype.TextAlignLastProperty | undefined
    MozTextDecorationColor?: string | undefined
    MozTextDecorationLine?: string | undefined
    MozTextDecorationStyle?: csstype.TextDecorationStyleProperty | undefined
    MozUserInput?: csstype.MozUserInputProperty | undefined
    msImeMode?: csstype.ImeModeProperty | undefined
    msScrollbarTrackColor?: string | undefined
    OAnimation?: csstype.AnimationProperty | undefined
    OAnimationDelay?: string | undefined
    OAnimationDirection?: string | undefined
    OAnimationDuration?: string | undefined
    OAnimationFillMode?: string | undefined
    OAnimationIterationCount?:
      | csstype.AnimationIterationCountProperty
      | undefined
    OAnimationName?: string | undefined
    OAnimationPlayState?: string | undefined
    OAnimationTimingFunction?: string | undefined
    OBackgroundSize?:
      | csstype.BackgroundSizeProperty<string | number>
      | undefined
    OBorderImage?: csstype.BorderImageProperty | undefined
    OObjectFit?: csstype.ObjectFitProperty | undefined
    OObjectPosition?:
      | csstype.ObjectPositionProperty<string | number>
      | undefined
    OTabSize?: csstype.TabSizeProperty<string | number> | undefined
    OTextOverflow?: string | undefined
    OTransform?: string | undefined
    OTransformOrigin?:
      | csstype.TransformOriginProperty<string | number>
      | undefined
    OTransition?: string | undefined
    OTransitionDelay?: string | undefined
    OTransitionDuration?: string | undefined
    OTransitionProperty?: string | undefined
    OTransitionTimingFunction?: string | undefined
    WebkitBoxAlign?: csstype.BoxAlignProperty | undefined
    WebkitBoxDirection?: csstype.BoxDirectionProperty | undefined
    WebkitBoxFlex?: csstype.GlobalsNumber | undefined
    WebkitBoxFlexGroup?: csstype.GlobalsNumber | undefined
    WebkitBoxLines?: csstype.BoxLinesProperty | undefined
    WebkitBoxOrdinalGroup?: csstype.GlobalsNumber | undefined
    WebkitBoxOrient?: csstype.BoxOrientProperty | undefined
    WebkitBoxPack?: csstype.BoxPackProperty | undefined
    WebkitScrollSnapPointsX?: string | undefined
    WebkitScrollSnapPointsY?: string | undefined
    alignmentBaseline?: csstype.AlignmentBaselineProperty | undefined
    baselineShift?: csstype.BaselineShiftProperty<string | number> | undefined
    clipRule?: csstype.ClipRuleProperty | undefined
    colorInterpolation?: csstype.ColorInterpolationProperty | undefined
    colorRendering?: csstype.ColorRenderingProperty | undefined
    dominantBaseline?: csstype.DominantBaselineProperty | undefined
    fill?: string | undefined
    fillOpacity?: csstype.GlobalsNumber | undefined
    fillRule?: csstype.FillRuleProperty | undefined
    floodColor?: string | undefined
    floodOpacity?: csstype.GlobalsNumber | undefined
    glyphOrientationVertical?:
      | csstype.GlyphOrientationVerticalProperty
      | undefined
    lightingColor?: string | undefined
    marker?: string | undefined
    markerEnd?: string | undefined
    markerMid?: string | undefined
    markerStart?: string | undefined
    shapeRendering?: csstype.ShapeRenderingProperty | undefined
    stopColor?: string | undefined
    stopOpacity?: csstype.GlobalsNumber | undefined
    stroke?: string | undefined
    strokeDasharray?:
      | csstype.StrokeDasharrayProperty<string | number>
      | undefined
    strokeDashoffset?:
      | csstype.StrokeDashoffsetProperty<string | number>
      | undefined
    strokeLinecap?: csstype.StrokeLinecapProperty | undefined
    strokeLinejoin?: csstype.StrokeLinejoinProperty | undefined
    strokeMiterlimit?: csstype.GlobalsNumber | undefined
    strokeOpacity?: csstype.GlobalsNumber | undefined
    strokeWidth?: csstype.StrokeWidthProperty<string | number> | undefined
    textAnchor?: csstype.TextAnchorProperty | undefined
    vectorEffect?: csstype.VectorEffectProperty | undefined
  }
  stop: () => void
}

/**
 * A Composable giving access to a TransformProperties object, and binding the generated transform string to a target.
 *
 * @param target
 */
declare function useElementTransform(
  target: MaybeRef<PermissiveTarget>,
  onInit?: (initData: Partial<TransformProperties>) => void,
): {
  transform: {
    x?: string | number | undefined
    y?: string | number | undefined
    z?: string | number | undefined
    translateX?: string | number | undefined
    translateY?: string | number | undefined
    translateZ?: string | number | undefined
    rotate?: string | number | undefined
    rotateX?: string | number | undefined
    rotateY?: string | number | undefined
    rotateZ?: string | number | undefined
    scale?: string | number | undefined
    scaleX?: string | number | undefined
    scaleY?: string | number | undefined
    scaleZ?: string | number | undefined
    skew?: string | number | undefined
    skewX?: string | number | undefined
    skewY?: string | number | undefined
    originX?: string | number | undefined
    originY?: string | number | undefined
    originZ?: string | number | undefined
    perspective?: string | number | undefined
    transformPerspective?: string | number | undefined
  }
  stop: () => void
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
declare function useMotion<T extends MotionVariants>(
  target: MaybeRef<PermissiveTarget>,
  variants?: MaybeRef<T>,
  options?: UseMotionOptions,
): MotionInstance<T>

/**
 * A Composable handling motion controls, pushing resolved variant to useMotionTransitions manager.
 *
 * @param transform
 * @param style
 * @param currentVariant
 */
declare function useMotionControls<T extends MotionVariants>(
  motionProperties: MotionProperties,
  variants?: MaybeRef<T>,
  { push, stop }?: MotionTransitions,
): MotionControls

/**
 * A Composable giving access to both `transform` and `style`objects for a single element.
 *
 * @param target
 */
declare function useMotionProperties(
  target: MaybeRef<PermissiveTarget>,
  defaultValues?: Partial<MotionProperties>,
): {
  motionProperties:
    | {
        alignContent?: string | undefined
        alignItems?: string | undefined
        alignSelf?: string | undefined
        alignTracks?: string | undefined
        animationDelay?: string | undefined
        animationDirection?: string | undefined
        animationDuration?: string | undefined
        animationFillMode?: string | undefined
        animationIterationCount?:
          | csstype.AnimationIterationCountProperty
          | undefined
        animationName?: string | undefined
        animationPlayState?: string | undefined
        animationTimingFunction?: string | undefined
        appearance?: csstype.AppearanceProperty | undefined
        aspectRatio?: string | undefined
        backdropFilter?: string | undefined
        backfaceVisibility?: csstype.BackfaceVisibilityProperty | undefined
        backgroundAttachment?: string | undefined
        backgroundBlendMode?: string | undefined
        backgroundClip?: string | undefined
        backgroundColor?: string | undefined
        backgroundImage?: string | undefined
        backgroundOrigin?: string | undefined
        backgroundPositionX?:
          | csstype.BackgroundPositionXProperty<string | number>
          | undefined
        backgroundPositionY?:
          | csstype.BackgroundPositionYProperty<string | number>
          | undefined
        backgroundRepeat?: string | undefined
        backgroundSize?:
          | csstype.BackgroundSizeProperty<string | number>
          | undefined
        blockOverflow?: string | undefined
        blockSize?: csstype.BlockSizeProperty<string | number> | undefined
        borderBlockColor?: string | undefined
        borderBlockEndColor?: string | undefined
        borderBlockEndStyle?: csstype.BorderBlockEndStyleProperty | undefined
        borderBlockEndWidth?:
          | csstype.BorderBlockEndWidthProperty<string | number>
          | undefined
        borderBlockStartColor?: string | undefined
        borderBlockStartStyle?:
          | csstype.BorderBlockStartStyleProperty
          | undefined
        borderBlockStartWidth?:
          | csstype.BorderBlockStartWidthProperty<string | number>
          | undefined
        borderBlockStyle?: csstype.BorderBlockStyleProperty | undefined
        borderBlockWidth?:
          | csstype.BorderBlockWidthProperty<string | number>
          | undefined
        borderBottomColor?: string | undefined
        borderBottomLeftRadius?:
          | csstype.BorderBottomLeftRadiusProperty<string | number>
          | undefined
        borderBottomRightRadius?:
          | csstype.BorderBottomRightRadiusProperty<string | number>
          | undefined
        borderBottomStyle?: csstype.BorderBottomStyleProperty | undefined
        borderBottomWidth?:
          | csstype.BorderBottomWidthProperty<string | number>
          | undefined
        borderCollapse?: csstype.BorderCollapseProperty | undefined
        borderEndEndRadius?:
          | csstype.BorderEndEndRadiusProperty<string | number>
          | undefined
        borderEndStartRadius?:
          | csstype.BorderEndStartRadiusProperty<string | number>
          | undefined
        borderImageOutset?:
          | csstype.BorderImageOutsetProperty<string | number>
          | undefined
        borderImageRepeat?: string | undefined
        borderImageSlice?: csstype.BorderImageSliceProperty | undefined
        borderImageSource?: string | undefined
        borderImageWidth?:
          | csstype.BorderImageWidthProperty<string | number>
          | undefined
        borderInlineColor?: string | undefined
        borderInlineEndColor?: string | undefined
        borderInlineEndStyle?: csstype.BorderInlineEndStyleProperty | undefined
        borderInlineEndWidth?:
          | csstype.BorderInlineEndWidthProperty<string | number>
          | undefined
        borderInlineStartColor?: string | undefined
        borderInlineStartStyle?:
          | csstype.BorderInlineStartStyleProperty
          | undefined
        borderInlineStartWidth?:
          | csstype.BorderInlineStartWidthProperty<string | number>
          | undefined
        borderInlineStyle?: csstype.BorderInlineStyleProperty | undefined
        borderInlineWidth?:
          | csstype.BorderInlineWidthProperty<string | number>
          | undefined
        borderLeftColor?: string | undefined
        borderLeftStyle?: csstype.BorderLeftStyleProperty | undefined
        borderLeftWidth?:
          | csstype.BorderLeftWidthProperty<string | number>
          | undefined
        borderRightColor?: string | undefined
        borderRightStyle?: csstype.BorderRightStyleProperty | undefined
        borderRightWidth?:
          | csstype.BorderRightWidthProperty<string | number>
          | undefined
        borderSpacing?:
          | csstype.BorderSpacingProperty<string | number>
          | undefined
        borderStartEndRadius?:
          | csstype.BorderStartEndRadiusProperty<string | number>
          | undefined
        borderStartStartRadius?:
          | csstype.BorderStartStartRadiusProperty<string | number>
          | undefined
        borderTopColor?: string | undefined
        borderTopLeftRadius?:
          | csstype.BorderTopLeftRadiusProperty<string | number>
          | undefined
        borderTopRightRadius?:
          | csstype.BorderTopRightRadiusProperty<string | number>
          | undefined
        borderTopStyle?: csstype.BorderTopStyleProperty | undefined
        borderTopWidth?:
          | csstype.BorderTopWidthProperty<string | number>
          | undefined
        bottom?: csstype.BottomProperty<string | number> | undefined
        boxDecorationBreak?: csstype.BoxDecorationBreakProperty | undefined
        boxShadow?: string | undefined
        boxSizing?: csstype.BoxSizingProperty | undefined
        breakAfter?: csstype.BreakAfterProperty | undefined
        breakBefore?: csstype.BreakBeforeProperty | undefined
        breakInside?: csstype.BreakInsideProperty | undefined
        captionSide?: csstype.CaptionSideProperty | undefined
        caretColor?: string | undefined
        clear?: csstype.ClearProperty | undefined
        clipPath?: string | undefined
        color?: string | undefined
        colorAdjust?: csstype.ColorAdjustProperty | undefined
        colorScheme?: string | undefined
        columnCount?: csstype.ColumnCountProperty | undefined
        columnFill?: csstype.ColumnFillProperty | undefined
        columnGap?: csstype.ColumnGapProperty<string | number> | undefined
        columnRuleColor?: string | undefined
        columnRuleStyle?: string | undefined
        columnRuleWidth?:
          | csstype.ColumnRuleWidthProperty<string | number>
          | undefined
        columnSpan?: csstype.ColumnSpanProperty | undefined
        columnWidth?: csstype.ColumnWidthProperty<string | number> | undefined
        contain?: string | undefined
        content?: string | undefined
        contentVisibility?: csstype.ContentVisibilityProperty | undefined
        counterIncrement?: string | undefined
        counterReset?: string | undefined
        counterSet?: string | undefined
        cursor?: string | undefined
        direction?: csstype.DirectionProperty | undefined
        display?: string | undefined
        emptyCells?: csstype.EmptyCellsProperty | undefined
        filter?: string | undefined
        flexBasis?: csstype.FlexBasisProperty<string | number> | undefined
        flexDirection?: csstype.FlexDirectionProperty | undefined
        flexGrow?: csstype.GlobalsNumber | undefined
        flexShrink?: csstype.GlobalsNumber | undefined
        flexWrap?: csstype.FlexWrapProperty | undefined
        float?: csstype.FloatProperty | undefined
        fontFamily?: string | undefined
        fontFeatureSettings?: string | undefined
        fontKerning?: csstype.FontKerningProperty | undefined
        fontLanguageOverride?: string | undefined
        fontOpticalSizing?: csstype.FontOpticalSizingProperty | undefined
        fontSize?: csstype.FontSizeProperty<string | number> | undefined
        fontSizeAdjust?: csstype.FontSizeAdjustProperty | undefined
        fontSmooth?: csstype.FontSmoothProperty<string | number> | undefined
        fontStretch?: string | undefined
        fontStyle?: string | undefined
        fontSynthesis?: string | undefined
        fontVariant?: string | undefined
        fontVariantCaps?: csstype.FontVariantCapsProperty | undefined
        fontVariantEastAsian?: string | undefined
        fontVariantLigatures?: string | undefined
        fontVariantNumeric?: string | undefined
        fontVariantPosition?: csstype.FontVariantPositionProperty | undefined
        fontVariationSettings?: string | undefined
        fontWeight?: csstype.FontWeightProperty | undefined
        forcedColorAdjust?: csstype.ForcedColorAdjustProperty | undefined
        gridAutoColumns?:
          | csstype.GridAutoColumnsProperty<string | number>
          | undefined
        gridAutoFlow?: string | undefined
        gridAutoRows?: csstype.GridAutoRowsProperty<string | number> | undefined
        gridColumnEnd?: csstype.GridColumnEndProperty | undefined
        gridColumnStart?: csstype.GridColumnStartProperty | undefined
        gridRowEnd?: csstype.GridRowEndProperty | undefined
        gridRowStart?: csstype.GridRowStartProperty | undefined
        gridTemplateAreas?: string | undefined
        gridTemplateColumns?:
          | csstype.GridTemplateColumnsProperty<string | number>
          | undefined
        gridTemplateRows?:
          | csstype.GridTemplateRowsProperty<string | number>
          | undefined
        hangingPunctuation?: string | undefined
        height?: csstype.HeightProperty<string | number> | undefined
        hyphens?: csstype.HyphensProperty | undefined
        imageOrientation?: string | undefined
        imageRendering?: csstype.ImageRenderingProperty | undefined
        imageResolution?: string | undefined
        initialLetter?: csstype.InitialLetterProperty | undefined
        inlineSize?: csstype.InlineSizeProperty<string | number> | undefined
        inset?: csstype.InsetProperty<string | number> | undefined
        insetBlock?: csstype.InsetBlockProperty<string | number> | undefined
        insetBlockEnd?:
          | csstype.InsetBlockEndProperty<string | number>
          | undefined
        insetBlockStart?:
          | csstype.InsetBlockStartProperty<string | number>
          | undefined
        insetInline?: csstype.InsetInlineProperty<string | number> | undefined
        insetInlineEnd?:
          | csstype.InsetInlineEndProperty<string | number>
          | undefined
        insetInlineStart?:
          | csstype.InsetInlineStartProperty<string | number>
          | undefined
        isolation?: csstype.IsolationProperty | undefined
        justifyContent?: string | undefined
        justifyItems?: string | undefined
        justifySelf?: string | undefined
        justifyTracks?: string | undefined
        left?: csstype.LeftProperty<string | number> | undefined
        letterSpacing?:
          | csstype.LetterSpacingProperty<string | number>
          | undefined
        lineBreak?: csstype.LineBreakProperty | undefined
        lineHeight?: csstype.LineHeightProperty<string | number> | undefined
        lineHeightStep?:
          | csstype.LineHeightStepProperty<string | number>
          | undefined
        listStyleImage?: string | undefined
        listStylePosition?: csstype.ListStylePositionProperty | undefined
        listStyleType?: string | undefined
        marginBlock?: csstype.MarginBlockProperty<string | number> | undefined
        marginBlockEnd?:
          | csstype.MarginBlockEndProperty<string | number>
          | undefined
        marginBlockStart?:
          | csstype.MarginBlockStartProperty<string | number>
          | undefined
        marginBottom?: csstype.MarginBottomProperty<string | number> | undefined
        marginInline?: csstype.MarginInlineProperty<string | number> | undefined
        marginInlineEnd?:
          | csstype.MarginInlineEndProperty<string | number>
          | undefined
        marginInlineStart?:
          | csstype.MarginInlineStartProperty<string | number>
          | undefined
        marginLeft?: csstype.MarginLeftProperty<string | number> | undefined
        marginRight?: csstype.MarginRightProperty<string | number> | undefined
        marginTop?: csstype.MarginTopProperty<string | number> | undefined
        maskBorderMode?: csstype.MaskBorderModeProperty | undefined
        maskBorderOutset?:
          | csstype.MaskBorderOutsetProperty<string | number>
          | undefined
        maskBorderRepeat?: string | undefined
        maskBorderSlice?: csstype.MaskBorderSliceProperty | undefined
        maskBorderSource?: string | undefined
        maskBorderWidth?:
          | csstype.MaskBorderWidthProperty<string | number>
          | undefined
        maskClip?: string | undefined
        maskComposite?: string | undefined
        maskImage?: string | undefined
        maskMode?: string | undefined
        maskOrigin?: string | undefined
        maskPosition?: csstype.MaskPositionProperty<string | number> | undefined
        maskRepeat?: string | undefined
        maskSize?: csstype.MaskSizeProperty<string | number> | undefined
        maskType?: csstype.MaskTypeProperty | undefined
        mathStyle?: csstype.MathStyleProperty | undefined
        maxBlockSize?: csstype.MaxBlockSizeProperty<string | number> | undefined
        maxHeight?: csstype.MaxHeightProperty<string | number> | undefined
        maxInlineSize?:
          | csstype.MaxInlineSizeProperty<string | number>
          | undefined
        maxLines?: csstype.MaxLinesProperty | undefined
        maxWidth?: csstype.MaxWidthProperty<string | number> | undefined
        minBlockSize?: csstype.MinBlockSizeProperty<string | number> | undefined
        minHeight?: csstype.MinHeightProperty<string | number> | undefined
        minInlineSize?:
          | csstype.MinInlineSizeProperty<string | number>
          | undefined
        minWidth?: csstype.MinWidthProperty<string | number> | undefined
        mixBlendMode?: csstype.MixBlendModeProperty | undefined
        motionDistance?:
          | csstype.OffsetDistanceProperty<string | number>
          | undefined
        motionPath?: string | undefined
        motionRotation?: string | undefined
        objectFit?: csstype.ObjectFitProperty | undefined
        objectPosition?:
          | csstype.ObjectPositionProperty<string | number>
          | undefined
        offsetAnchor?: csstype.OffsetAnchorProperty<string | number> | undefined
        offsetDistance?:
          | csstype.OffsetDistanceProperty<string | number>
          | undefined
        offsetPath?: string | undefined
        offsetRotate?: string | undefined
        offsetRotation?: string | undefined
        opacity?: csstype.OpacityProperty | undefined
        order?: csstype.GlobalsNumber | undefined
        orphans?: csstype.GlobalsNumber | undefined
        outlineColor?: string | undefined
        outlineOffset?:
          | csstype.OutlineOffsetProperty<string | number>
          | undefined
        outlineStyle?: string | undefined
        outlineWidth?: csstype.OutlineWidthProperty<string | number> | undefined
        overflowAnchor?: csstype.OverflowAnchorProperty | undefined
        overflowBlock?: csstype.OverflowBlockProperty | undefined
        overflowClipBox?: csstype.OverflowClipBoxProperty | undefined
        overflowClipMargin?:
          | csstype.OverflowClipMarginProperty<string | number>
          | undefined
        overflowInline?: csstype.OverflowInlineProperty | undefined
        overflowWrap?: csstype.OverflowWrapProperty | undefined
        overflowX?: csstype.OverflowXProperty | undefined
        overflowY?: csstype.OverflowYProperty | undefined
        overscrollBehaviorBlock?:
          | csstype.OverscrollBehaviorBlockProperty
          | undefined
        overscrollBehaviorInline?:
          | csstype.OverscrollBehaviorInlineProperty
          | undefined
        overscrollBehaviorX?: csstype.OverscrollBehaviorXProperty | undefined
        overscrollBehaviorY?: csstype.OverscrollBehaviorYProperty | undefined
        paddingBlock?: csstype.PaddingBlockProperty<string | number> | undefined
        paddingBlockEnd?:
          | csstype.PaddingBlockEndProperty<string | number>
          | undefined
        paddingBlockStart?:
          | csstype.PaddingBlockStartProperty<string | number>
          | undefined
        paddingBottom?:
          | csstype.PaddingBottomProperty<string | number>
          | undefined
        paddingInline?:
          | csstype.PaddingInlineProperty<string | number>
          | undefined
        paddingInlineEnd?:
          | csstype.PaddingInlineEndProperty<string | number>
          | undefined
        paddingInlineStart?:
          | csstype.PaddingInlineStartProperty<string | number>
          | undefined
        paddingLeft?: csstype.PaddingLeftProperty<string | number> | undefined
        paddingRight?: csstype.PaddingRightProperty<string | number> | undefined
        paddingTop?: csstype.PaddingTopProperty<string | number> | undefined
        pageBreakAfter?: csstype.PageBreakAfterProperty | undefined
        pageBreakBefore?: csstype.PageBreakBeforeProperty | undefined
        pageBreakInside?: csstype.PageBreakInsideProperty | undefined
        paintOrder?: string | undefined
        perspectiveOrigin?:
          | csstype.PerspectiveOriginProperty<string | number>
          | undefined
        placeContent?: string | undefined
        pointerEvents?: csstype.PointerEventsProperty | undefined
        position?: csstype.PositionProperty | undefined
        quotes?: string | undefined
        resize?: csstype.ResizeProperty | undefined
        right?: csstype.RightProperty<string | number> | undefined
        rowGap?: csstype.RowGapProperty<string | number> | undefined
        rubyAlign?: csstype.RubyAlignProperty | undefined
        rubyMerge?: csstype.RubyMergeProperty | undefined
        rubyPosition?: string | undefined
        scrollBehavior?: csstype.ScrollBehaviorProperty | undefined
        scrollMargin?: csstype.ScrollMarginProperty<string | number> | undefined
        scrollMarginBlock?:
          | csstype.ScrollMarginBlockProperty<string | number>
          | undefined
        scrollMarginBlockEnd?:
          | csstype.ScrollMarginBlockEndProperty<string | number>
          | undefined
        scrollMarginBlockStart?:
          | csstype.ScrollMarginBlockStartProperty<string | number>
          | undefined
        scrollMarginBottom?:
          | csstype.ScrollMarginBottomProperty<string | number>
          | undefined
        scrollMarginInline?:
          | csstype.ScrollMarginInlineProperty<string | number>
          | undefined
        scrollMarginInlineEnd?:
          | csstype.ScrollMarginInlineEndProperty<string | number>
          | undefined
        scrollMarginInlineStart?:
          | csstype.ScrollMarginInlineStartProperty<string | number>
          | undefined
        scrollMarginLeft?:
          | csstype.ScrollMarginLeftProperty<string | number>
          | undefined
        scrollMarginRight?:
          | csstype.ScrollMarginRightProperty<string | number>
          | undefined
        scrollMarginTop?:
          | csstype.ScrollMarginTopProperty<string | number>
          | undefined
        scrollPadding?:
          | csstype.ScrollPaddingProperty<string | number>
          | undefined
        scrollPaddingBlock?:
          | csstype.ScrollPaddingBlockProperty<string | number>
          | undefined
        scrollPaddingBlockEnd?:
          | csstype.ScrollPaddingBlockEndProperty<string | number>
          | undefined
        scrollPaddingBlockStart?:
          | csstype.ScrollPaddingBlockStartProperty<string | number>
          | undefined
        scrollPaddingBottom?:
          | csstype.ScrollPaddingBottomProperty<string | number>
          | undefined
        scrollPaddingInline?:
          | csstype.ScrollPaddingInlineProperty<string | number>
          | undefined
        scrollPaddingInlineEnd?:
          | csstype.ScrollPaddingInlineEndProperty<string | number>
          | undefined
        scrollPaddingInlineStart?:
          | csstype.ScrollPaddingInlineStartProperty<string | number>
          | undefined
        scrollPaddingLeft?:
          | csstype.ScrollPaddingLeftProperty<string | number>
          | undefined
        scrollPaddingRight?:
          | csstype.ScrollPaddingRightProperty<string | number>
          | undefined
        scrollPaddingTop?:
          | csstype.ScrollPaddingTopProperty<string | number>
          | undefined
        scrollSnapAlign?: string | undefined
        scrollSnapMargin?:
          | csstype.ScrollMarginProperty<string | number>
          | undefined
        scrollSnapMarginBottom?:
          | csstype.ScrollMarginBottomProperty<string | number>
          | undefined
        scrollSnapMarginLeft?:
          | csstype.ScrollMarginLeftProperty<string | number>
          | undefined
        scrollSnapMarginRight?:
          | csstype.ScrollMarginRightProperty<string | number>
          | undefined
        scrollSnapMarginTop?:
          | csstype.ScrollMarginTopProperty<string | number>
          | undefined
        scrollSnapStop?: csstype.ScrollSnapStopProperty | undefined
        scrollSnapType?: string | undefined
        scrollbarColor?: string | undefined
        scrollbarGutter?: string | undefined
        scrollbarWidth?: csstype.ScrollbarWidthProperty | undefined
        shapeImageThreshold?: csstype.ShapeImageThresholdProperty | undefined
        shapeMargin?: csstype.ShapeMarginProperty<string | number> | undefined
        shapeOutside?: string | undefined
        tabSize?: csstype.TabSizeProperty<string | number> | undefined
        tableLayout?: csstype.TableLayoutProperty | undefined
        textAlign?: csstype.TextAlignProperty | undefined
        textAlignLast?: csstype.TextAlignLastProperty | undefined
        textCombineUpright?: string | undefined
        textDecorationColor?: string | undefined
        textDecorationLine?: string | undefined
        textDecorationSkip?: string | undefined
        textDecorationSkipInk?:
          | csstype.TextDecorationSkipInkProperty
          | undefined
        textDecorationStyle?: csstype.TextDecorationStyleProperty | undefined
        textDecorationThickness?:
          | csstype.TextDecorationThicknessProperty<string | number>
          | undefined
        textDecorationWidth?:
          | csstype.TextDecorationThicknessProperty<string | number>
          | undefined
        textEmphasisColor?: string | undefined
        textEmphasisPosition?: string | undefined
        textEmphasisStyle?: string | undefined
        textIndent?: csstype.TextIndentProperty<string | number> | undefined
        textJustify?: csstype.TextJustifyProperty | undefined
        textOrientation?: csstype.TextOrientationProperty | undefined
        textOverflow?: string | undefined
        textRendering?: csstype.TextRenderingProperty | undefined
        textShadow?: string | undefined
        textSizeAdjust?: string | undefined
        textTransform?: csstype.TextTransformProperty | undefined
        textUnderlineOffset?:
          | csstype.TextUnderlineOffsetProperty<string | number>
          | undefined
        textUnderlinePosition?: string | undefined
        top?: csstype.TopProperty<string | number> | undefined
        touchAction?: string | undefined
        transitionDelay?: string | undefined
        transitionDuration?: string | undefined
        transitionProperty?: string | undefined
        transitionTimingFunction?: string | undefined
        translate?: csstype.TranslateProperty<string | number> | undefined
        unicodeBidi?: csstype.UnicodeBidiProperty | undefined
        userSelect?: csstype.UserSelectProperty | undefined
        verticalAlign?:
          | csstype.VerticalAlignProperty<string | number>
          | undefined
        visibility?: csstype.VisibilityProperty | undefined
        whiteSpace?: csstype.WhiteSpaceProperty | undefined
        widows?: csstype.GlobalsNumber | undefined
        width?: csstype.WidthProperty<string | number> | undefined
        willChange?: string | undefined
        wordBreak?: csstype.WordBreakProperty | undefined
        wordSpacing?: csstype.WordSpacingProperty<string | number> | undefined
        wordWrap?: csstype.WordWrapProperty | undefined
        writingMode?: csstype.WritingModeProperty | undefined
        zIndex?: csstype.ZIndexProperty | undefined
        zoom?: csstype.ZoomProperty | undefined
        all?: csstype.Globals | undefined
        animation?: csstype.AnimationProperty | undefined
        background?: csstype.BackgroundProperty<string | number> | undefined
        backgroundPosition?:
          | csstype.BackgroundPositionProperty<string | number>
          | undefined
        border?: csstype.BorderProperty<string | number> | undefined
        borderBlock?: csstype.BorderBlockProperty<string | number> | undefined
        borderBlockEnd?:
          | csstype.BorderBlockEndProperty<string | number>
          | undefined
        borderBlockStart?:
          | csstype.BorderBlockStartProperty<string | number>
          | undefined
        borderBottom?: csstype.BorderBottomProperty<string | number> | undefined
        borderColor?: string | undefined
        borderImage?: csstype.BorderImageProperty | undefined
        borderInline?: csstype.BorderInlineProperty<string | number> | undefined
        borderInlineEnd?:
          | csstype.BorderInlineEndProperty<string | number>
          | undefined
        borderInlineStart?:
          | csstype.BorderInlineStartProperty<string | number>
          | undefined
        borderLeft?: csstype.BorderLeftProperty<string | number> | undefined
        borderRadius?: csstype.BorderRadiusProperty<string | number> | undefined
        borderRight?: csstype.BorderRightProperty<string | number> | undefined
        borderStyle?: string | undefined
        borderTop?: csstype.BorderTopProperty<string | number> | undefined
        borderWidth?: csstype.BorderWidthProperty<string | number> | undefined
        columnRule?: csstype.ColumnRuleProperty<string | number> | undefined
        columns?: csstype.ColumnsProperty<string | number> | undefined
        flex?: csstype.FlexProperty<string | number> | undefined
        flexFlow?: string | undefined
        font?: string | undefined
        gap?: csstype.GapProperty<string | number> | undefined
        grid?: string | undefined
        gridArea?: csstype.GridAreaProperty | undefined
        gridColumn?: csstype.GridColumnProperty | undefined
        gridRow?: csstype.GridRowProperty | undefined
        gridTemplate?: string | undefined
        lineClamp?: csstype.LineClampProperty | undefined
        listStyle?: string | undefined
        margin?: csstype.MarginProperty<string | number> | undefined
        mask?: csstype.MaskProperty<string | number> | undefined
        maskBorder?: csstype.MaskBorderProperty | undefined
        motion?: csstype.OffsetProperty<string | number> | undefined
        offset?: csstype.OffsetProperty<string | number> | undefined
        outline?: csstype.OutlineProperty<string | number> | undefined
        overflow?: string | undefined
        overscrollBehavior?: string | undefined
        padding?: csstype.PaddingProperty<string | number> | undefined
        placeItems?: string | undefined
        placeSelf?: string | undefined
        textDecoration?:
          | csstype.TextDecorationProperty<string | number>
          | undefined
        textEmphasis?: string | undefined
        MozAnimationDelay?: string | undefined
        MozAnimationDirection?: string | undefined
        MozAnimationDuration?: string | undefined
        MozAnimationFillMode?: string | undefined
        MozAnimationIterationCount?:
          | csstype.AnimationIterationCountProperty
          | undefined
        MozAnimationName?: string | undefined
        MozAnimationPlayState?: string | undefined
        MozAnimationTimingFunction?: string | undefined
        MozAppearance?: csstype.MozAppearanceProperty | undefined
        MozBackfaceVisibility?: csstype.BackfaceVisibilityProperty | undefined
        MozBorderBottomColors?: string | undefined
        MozBorderEndColor?: string | undefined
        MozBorderEndStyle?: csstype.BorderInlineEndStyleProperty | undefined
        MozBorderEndWidth?:
          | csstype.BorderInlineEndWidthProperty<string | number>
          | undefined
        MozBorderLeftColors?: string | undefined
        MozBorderRightColors?: string | undefined
        MozBorderStartColor?: string | undefined
        MozBorderStartStyle?: csstype.BorderInlineStartStyleProperty | undefined
        MozBorderTopColors?: string | undefined
        MozBoxSizing?: csstype.BoxSizingProperty | undefined
        MozColumnCount?: csstype.ColumnCountProperty | undefined
        MozColumnFill?: csstype.ColumnFillProperty | undefined
        MozColumnGap?: csstype.ColumnGapProperty<string | number> | undefined
        MozColumnRuleColor?: string | undefined
        MozColumnRuleStyle?: string | undefined
        MozColumnRuleWidth?:
          | csstype.ColumnRuleWidthProperty<string | number>
          | undefined
        MozColumnWidth?:
          | csstype.ColumnWidthProperty<string | number>
          | undefined
        MozContextProperties?: string | undefined
        MozFontFeatureSettings?: string | undefined
        MozFontLanguageOverride?: string | undefined
        MozHyphens?: csstype.HyphensProperty | undefined
        MozImageRegion?: string | undefined
        MozMarginEnd?:
          | csstype.MarginInlineEndProperty<string | number>
          | undefined
        MozMarginStart?:
          | csstype.MarginInlineStartProperty<string | number>
          | undefined
        MozOrient?: csstype.MozOrientProperty | undefined
        MozOsxFontSmoothing?:
          | csstype.FontSmoothProperty<string | number>
          | undefined
        MozPaddingEnd?:
          | csstype.PaddingInlineEndProperty<string | number>
          | undefined
        MozPaddingStart?:
          | csstype.PaddingInlineStartProperty<string | number>
          | undefined
        MozPerspective?:
          | csstype.PerspectiveProperty<string | number>
          | undefined
        MozPerspectiveOrigin?:
          | csstype.PerspectiveOriginProperty<string | number>
          | undefined
        MozStackSizing?: csstype.MozStackSizingProperty | undefined
        MozTabSize?: csstype.TabSizeProperty<string | number> | undefined
        MozTextBlink?: csstype.MozTextBlinkProperty | undefined
        MozTextSizeAdjust?: string | undefined
        MozTransformOrigin?:
          | csstype.TransformOriginProperty<string | number>
          | undefined
        MozTransformStyle?: csstype.TransformStyleProperty | undefined
        MozTransitionDelay?: string | undefined
        MozTransitionDuration?: string | undefined
        MozTransitionProperty?: string | undefined
        MozTransitionTimingFunction?: string | undefined
        MozUserFocus?: csstype.MozUserFocusProperty | undefined
        MozUserModify?: csstype.MozUserModifyProperty | undefined
        MozUserSelect?: csstype.UserSelectProperty | undefined
        MozWindowDragging?: csstype.MozWindowDraggingProperty | undefined
        MozWindowShadow?: csstype.MozWindowShadowProperty | undefined
        msAccelerator?: csstype.MsAcceleratorProperty | undefined
        msAlignSelf?: string | undefined
        msBlockProgression?: csstype.MsBlockProgressionProperty | undefined
        msContentZoomChaining?:
          | csstype.MsContentZoomChainingProperty
          | undefined
        msContentZoomLimitMax?: string | undefined
        msContentZoomLimitMin?: string | undefined
        msContentZoomSnapPoints?: string | undefined
        msContentZoomSnapType?:
          | csstype.MsContentZoomSnapTypeProperty
          | undefined
        msContentZooming?: csstype.MsContentZoomingProperty | undefined
        msFilter?: string | undefined
        msFlexDirection?: csstype.FlexDirectionProperty | undefined
        msFlexPositive?: csstype.GlobalsNumber | undefined
        msFlowFrom?: string | undefined
        msFlowInto?: string | undefined
        msGridColumns?:
          | csstype.MsGridColumnsProperty<string | number>
          | undefined
        msGridRows?: csstype.MsGridRowsProperty<string | number> | undefined
        msHighContrastAdjust?: csstype.MsHighContrastAdjustProperty | undefined
        msHyphenateLimitChars?:
          | csstype.MsHyphenateLimitCharsProperty
          | undefined
        msHyphenateLimitLines?:
          | csstype.MsHyphenateLimitLinesProperty
          | undefined
        msHyphenateLimitZone?:
          | csstype.MsHyphenateLimitZoneProperty<string | number>
          | undefined
        msHyphens?: csstype.HyphensProperty | undefined
        msImeAlign?: csstype.MsImeAlignProperty | undefined
        msJustifySelf?: string | undefined
        msLineBreak?: csstype.LineBreakProperty | undefined
        msOrder?: csstype.GlobalsNumber | undefined
        msOverflowStyle?: csstype.MsOverflowStyleProperty | undefined
        msOverflowX?: csstype.OverflowXProperty | undefined
        msOverflowY?: csstype.OverflowYProperty | undefined
        msScrollChaining?: csstype.MsScrollChainingProperty | undefined
        msScrollLimitXMax?:
          | csstype.MsScrollLimitXMaxProperty<string | number>
          | undefined
        msScrollLimitXMin?:
          | csstype.MsScrollLimitXMinProperty<string | number>
          | undefined
        msScrollLimitYMax?:
          | csstype.MsScrollLimitYMaxProperty<string | number>
          | undefined
        msScrollLimitYMin?:
          | csstype.MsScrollLimitYMinProperty<string | number>
          | undefined
        msScrollRails?: csstype.MsScrollRailsProperty | undefined
        msScrollSnapPointsX?: string | undefined
        msScrollSnapPointsY?: string | undefined
        msScrollSnapType?: csstype.MsScrollSnapTypeProperty | undefined
        msScrollTranslation?: csstype.MsScrollTranslationProperty | undefined
        msScrollbar3dlightColor?: string | undefined
        msScrollbarArrowColor?: string | undefined
        msScrollbarBaseColor?: string | undefined
        msScrollbarDarkshadowColor?: string | undefined
        msScrollbarFaceColor?: string | undefined
        msScrollbarHighlightColor?: string | undefined
        msScrollbarShadowColor?: string | undefined
        msTextAutospace?: csstype.MsTextAutospaceProperty | undefined
        msTextCombineHorizontal?: string | undefined
        msTextOverflow?: string | undefined
        msTouchAction?: string | undefined
        msTouchSelect?: csstype.MsTouchSelectProperty | undefined
        msTransform?: string | undefined
        msTransformOrigin?:
          | csstype.TransformOriginProperty<string | number>
          | undefined
        msTransitionDelay?: string | undefined
        msTransitionDuration?: string | undefined
        msTransitionProperty?: string | undefined
        msTransitionTimingFunction?: string | undefined
        msUserSelect?: csstype.MsUserSelectProperty | undefined
        msWordBreak?: csstype.WordBreakProperty | undefined
        msWrapFlow?: csstype.MsWrapFlowProperty | undefined
        msWrapMargin?: csstype.MsWrapMarginProperty<string | number> | undefined
        msWrapThrough?: csstype.MsWrapThroughProperty | undefined
        msWritingMode?: csstype.WritingModeProperty | undefined
        WebkitAlignContent?: string | undefined
        WebkitAlignItems?: string | undefined
        WebkitAlignSelf?: string | undefined
        WebkitAnimationDelay?: string | undefined
        WebkitAnimationDirection?: string | undefined
        WebkitAnimationDuration?: string | undefined
        WebkitAnimationFillMode?: string | undefined
        WebkitAnimationIterationCount?:
          | csstype.AnimationIterationCountProperty
          | undefined
        WebkitAnimationName?: string | undefined
        WebkitAnimationPlayState?: string | undefined
        WebkitAnimationTimingFunction?: string | undefined
        WebkitAppearance?: csstype.WebkitAppearanceProperty | undefined
        WebkitBackdropFilter?: string | undefined
        WebkitBackfaceVisibility?:
          | csstype.BackfaceVisibilityProperty
          | undefined
        WebkitBackgroundClip?: string | undefined
        WebkitBackgroundOrigin?: string | undefined
        WebkitBackgroundSize?:
          | csstype.BackgroundSizeProperty<string | number>
          | undefined
        WebkitBorderBeforeColor?: string | undefined
        WebkitBorderBeforeStyle?: string | undefined
        WebkitBorderBeforeWidth?:
          | csstype.WebkitBorderBeforeWidthProperty<string | number>
          | undefined
        WebkitBorderBottomLeftRadius?:
          | csstype.BorderBottomLeftRadiusProperty<string | number>
          | undefined
        WebkitBorderBottomRightRadius?:
          | csstype.BorderBottomRightRadiusProperty<string | number>
          | undefined
        WebkitBorderImageSlice?: csstype.BorderImageSliceProperty | undefined
        WebkitBorderTopLeftRadius?:
          | csstype.BorderTopLeftRadiusProperty<string | number>
          | undefined
        WebkitBorderTopRightRadius?:
          | csstype.BorderTopRightRadiusProperty<string | number>
          | undefined
        WebkitBoxDecorationBreak?:
          | csstype.BoxDecorationBreakProperty
          | undefined
        WebkitBoxReflect?:
          | csstype.WebkitBoxReflectProperty<string | number>
          | undefined
        WebkitBoxShadow?: string | undefined
        WebkitBoxSizing?: csstype.BoxSizingProperty | undefined
        WebkitClipPath?: string | undefined
        WebkitColumnCount?: csstype.ColumnCountProperty | undefined
        WebkitColumnFill?: csstype.ColumnFillProperty | undefined
        WebkitColumnGap?: csstype.ColumnGapProperty<string | number> | undefined
        WebkitColumnRuleColor?: string | undefined
        WebkitColumnRuleStyle?: string | undefined
        WebkitColumnRuleWidth?:
          | csstype.ColumnRuleWidthProperty<string | number>
          | undefined
        WebkitColumnSpan?: csstype.ColumnSpanProperty | undefined
        WebkitColumnWidth?:
          | csstype.ColumnWidthProperty<string | number>
          | undefined
        WebkitFilter?: string | undefined
        WebkitFlexBasis?: csstype.FlexBasisProperty<string | number> | undefined
        WebkitFlexDirection?: csstype.FlexDirectionProperty | undefined
        WebkitFlexGrow?: csstype.GlobalsNumber | undefined
        WebkitFlexShrink?: csstype.GlobalsNumber | undefined
        WebkitFlexWrap?: csstype.FlexWrapProperty | undefined
        WebkitFontFeatureSettings?: string | undefined
        WebkitFontKerning?: csstype.FontKerningProperty | undefined
        WebkitFontSmoothing?:
          | csstype.FontSmoothProperty<string | number>
          | undefined
        WebkitFontVariantLigatures?: string | undefined
        WebkitHyphens?: csstype.HyphensProperty | undefined
        WebkitJustifyContent?: string | undefined
        WebkitLineBreak?: csstype.LineBreakProperty | undefined
        WebkitLineClamp?: csstype.WebkitLineClampProperty | undefined
        WebkitMarginEnd?:
          | csstype.MarginInlineEndProperty<string | number>
          | undefined
        WebkitMarginStart?:
          | csstype.MarginInlineStartProperty<string | number>
          | undefined
        WebkitMaskAttachment?: string | undefined
        WebkitMaskBoxImageOutset?:
          | csstype.MaskBorderOutsetProperty<string | number>
          | undefined
        WebkitMaskBoxImageRepeat?: string | undefined
        WebkitMaskBoxImageSlice?: csstype.MaskBorderSliceProperty | undefined
        WebkitMaskBoxImageSource?: string | undefined
        WebkitMaskBoxImageWidth?:
          | csstype.MaskBorderWidthProperty<string | number>
          | undefined
        WebkitMaskClip?: string | undefined
        WebkitMaskComposite?: string | undefined
        WebkitMaskImage?: string | undefined
        WebkitMaskOrigin?: string | undefined
        WebkitMaskPosition?:
          | csstype.WebkitMaskPositionProperty<string | number>
          | undefined
        WebkitMaskPositionX?:
          | csstype.WebkitMaskPositionXProperty<string | number>
          | undefined
        WebkitMaskPositionY?:
          | csstype.WebkitMaskPositionYProperty<string | number>
          | undefined
        WebkitMaskRepeat?: string | undefined
        WebkitMaskRepeatX?: csstype.WebkitMaskRepeatXProperty | undefined
        WebkitMaskRepeatY?: csstype.WebkitMaskRepeatYProperty | undefined
        WebkitMaskSize?:
          | csstype.WebkitMaskSizeProperty<string | number>
          | undefined
        WebkitMaxInlineSize?:
          | csstype.MaxInlineSizeProperty<string | number>
          | undefined
        WebkitOrder?: csstype.GlobalsNumber | undefined
        WebkitOverflowScrolling?:
          | csstype.WebkitOverflowScrollingProperty
          | undefined
        WebkitPaddingEnd?:
          | csstype.PaddingInlineEndProperty<string | number>
          | undefined
        WebkitPaddingStart?:
          | csstype.PaddingInlineStartProperty<string | number>
          | undefined
        WebkitPerspective?:
          | csstype.PerspectiveProperty<string | number>
          | undefined
        WebkitPerspectiveOrigin?:
          | csstype.PerspectiveOriginProperty<string | number>
          | undefined
        WebkitPrintColorAdjust?: csstype.ColorAdjustProperty | undefined
        WebkitRubyPosition?: string | undefined
        WebkitScrollSnapType?: string | undefined
        WebkitShapeMargin?:
          | csstype.ShapeMarginProperty<string | number>
          | undefined
        WebkitTapHighlightColor?: string | undefined
        WebkitTextCombine?: string | undefined
        WebkitTextDecorationColor?: string | undefined
        WebkitTextDecorationLine?: string | undefined
        WebkitTextDecorationSkip?: string | undefined
        WebkitTextDecorationStyle?:
          | csstype.TextDecorationStyleProperty
          | undefined
        WebkitTextEmphasisColor?: string | undefined
        WebkitTextEmphasisPosition?: string | undefined
        WebkitTextEmphasisStyle?: string | undefined
        WebkitTextFillColor?: string | undefined
        WebkitTextOrientation?: csstype.TextOrientationProperty | undefined
        WebkitTextSizeAdjust?: string | undefined
        WebkitTextStrokeColor?: string | undefined
        WebkitTextStrokeWidth?:
          | csstype.WebkitTextStrokeWidthProperty<string | number>
          | undefined
        WebkitTextUnderlinePosition?: string | undefined
        WebkitTouchCallout?: csstype.WebkitTouchCalloutProperty | undefined
        WebkitTransform?: string | undefined
        WebkitTransformOrigin?:
          | csstype.TransformOriginProperty<string | number>
          | undefined
        WebkitTransformStyle?: csstype.TransformStyleProperty | undefined
        WebkitTransitionDelay?: string | undefined
        WebkitTransitionDuration?: string | undefined
        WebkitTransitionProperty?: string | undefined
        WebkitTransitionTimingFunction?: string | undefined
        WebkitUserModify?: csstype.WebkitUserModifyProperty | undefined
        WebkitUserSelect?: csstype.UserSelectProperty | undefined
        WebkitWritingMode?: csstype.WritingModeProperty | undefined
        MozAnimation?: csstype.AnimationProperty | undefined
        MozBorderImage?: csstype.BorderImageProperty | undefined
        MozColumnRule?: csstype.ColumnRuleProperty<string | number> | undefined
        MozColumns?: csstype.ColumnsProperty<string | number> | undefined
        MozTransition?: string | undefined
        msContentZoomLimit?: string | undefined
        msContentZoomSnap?: string | undefined
        msFlex?: csstype.FlexProperty<string | number> | undefined
        msScrollLimit?: string | undefined
        msScrollSnapX?: string | undefined
        msScrollSnapY?: string | undefined
        msTransition?: string | undefined
        WebkitAnimation?: csstype.AnimationProperty | undefined
        WebkitBorderBefore?:
          | csstype.WebkitBorderBeforeProperty<string | number>
          | undefined
        WebkitBorderImage?: csstype.BorderImageProperty | undefined
        WebkitBorderRadius?:
          | csstype.BorderRadiusProperty<string | number>
          | undefined
        WebkitColumnRule?:
          | csstype.ColumnRuleProperty<string | number>
          | undefined
        WebkitColumns?: csstype.ColumnsProperty<string | number> | undefined
        WebkitFlex?: csstype.FlexProperty<string | number> | undefined
        WebkitFlexFlow?: string | undefined
        WebkitMask?: csstype.WebkitMaskProperty<string | number> | undefined
        WebkitMaskBoxImage?: csstype.MaskBorderProperty | undefined
        WebkitTextEmphasis?: string | undefined
        WebkitTextStroke?:
          | csstype.WebkitTextStrokeProperty<string | number>
          | undefined
        WebkitTransition?: string | undefined
        azimuth?: string | undefined
        boxAlign?: csstype.BoxAlignProperty | undefined
        boxDirection?: csstype.BoxDirectionProperty | undefined
        boxFlex?: csstype.GlobalsNumber | undefined
        boxFlexGroup?: csstype.GlobalsNumber | undefined
        boxLines?: csstype.BoxLinesProperty | undefined
        boxOrdinalGroup?: csstype.GlobalsNumber | undefined
        boxOrient?: csstype.BoxOrientProperty | undefined
        boxPack?: csstype.BoxPackProperty | undefined
        clip?: string | undefined
        fontVariantAlternates?: string | undefined
        gridColumnGap?:
          | csstype.GridColumnGapProperty<string | number>
          | undefined
        gridGap?: csstype.GridGapProperty<string | number> | undefined
        gridRowGap?: csstype.GridRowGapProperty<string | number> | undefined
        imeMode?: csstype.ImeModeProperty | undefined
        offsetBlock?: csstype.InsetBlockProperty<string | number> | undefined
        offsetBlockEnd?:
          | csstype.InsetBlockEndProperty<string | number>
          | undefined
        offsetBlockStart?:
          | csstype.InsetBlockStartProperty<string | number>
          | undefined
        offsetInline?: csstype.InsetInlineProperty<string | number> | undefined
        offsetInlineEnd?:
          | csstype.InsetInlineEndProperty<string | number>
          | undefined
        offsetInlineStart?:
          | csstype.InsetInlineStartProperty<string | number>
          | undefined
        scrollSnapCoordinate?:
          | csstype.ScrollSnapCoordinateProperty<string | number>
          | undefined
        scrollSnapDestination?:
          | csstype.ScrollSnapDestinationProperty<string | number>
          | undefined
        scrollSnapPointsX?: string | undefined
        scrollSnapPointsY?: string | undefined
        scrollSnapTypeX?: csstype.ScrollSnapTypeXProperty | undefined
        scrollSnapTypeY?: csstype.ScrollSnapTypeYProperty | undefined
        scrollbarTrackColor?: string | undefined
        KhtmlBoxAlign?: csstype.BoxAlignProperty | undefined
        KhtmlBoxDirection?: csstype.BoxDirectionProperty | undefined
        KhtmlBoxFlex?: csstype.GlobalsNumber | undefined
        KhtmlBoxFlexGroup?: csstype.GlobalsNumber | undefined
        KhtmlBoxLines?: csstype.BoxLinesProperty | undefined
        KhtmlBoxOrdinalGroup?: csstype.GlobalsNumber | undefined
        KhtmlBoxOrient?: csstype.BoxOrientProperty | undefined
        KhtmlBoxPack?: csstype.BoxPackProperty | undefined
        KhtmlLineBreak?: csstype.LineBreakProperty | undefined
        KhtmlOpacity?: csstype.OpacityProperty | undefined
        KhtmlUserSelect?: csstype.UserSelectProperty | undefined
        MozBackgroundClip?: string | undefined
        MozBackgroundInlinePolicy?:
          | csstype.BoxDecorationBreakProperty
          | undefined
        MozBackgroundOrigin?: string | undefined
        MozBackgroundSize?:
          | csstype.BackgroundSizeProperty<string | number>
          | undefined
        MozBinding?: string | undefined
        MozBorderRadius?:
          | csstype.BorderRadiusProperty<string | number>
          | undefined
        MozBorderRadiusBottomleft?:
          | csstype.BorderBottomLeftRadiusProperty<string | number>
          | undefined
        MozBorderRadiusBottomright?:
          | csstype.BorderBottomRightRadiusProperty<string | number>
          | undefined
        MozBorderRadiusTopleft?:
          | csstype.BorderTopLeftRadiusProperty<string | number>
          | undefined
        MozBorderRadiusTopright?:
          | csstype.BorderTopRightRadiusProperty<string | number>
          | undefined
        MozBoxAlign?: csstype.BoxAlignProperty | undefined
        MozBoxDirection?: csstype.BoxDirectionProperty | undefined
        MozBoxFlex?: csstype.GlobalsNumber | undefined
        MozBoxOrdinalGroup?: csstype.GlobalsNumber | undefined
        MozBoxOrient?: csstype.BoxOrientProperty | undefined
        MozBoxPack?: csstype.BoxPackProperty | undefined
        MozBoxShadow?: string | undefined
        MozFloatEdge?: csstype.MozFloatEdgeProperty | undefined
        MozForceBrokenImageIcon?: csstype.GlobalsNumber | undefined
        MozOpacity?: csstype.OpacityProperty | undefined
        MozOutline?: csstype.OutlineProperty<string | number> | undefined
        MozOutlineColor?: string | undefined
        MozOutlineRadius?:
          | csstype.MozOutlineRadiusProperty<string | number>
          | undefined
        MozOutlineRadiusBottomleft?:
          | csstype.MozOutlineRadiusBottomleftProperty<string | number>
          | undefined
        MozOutlineRadiusBottomright?:
          | csstype.MozOutlineRadiusBottomrightProperty<string | number>
          | undefined
        MozOutlineRadiusTopleft?:
          | csstype.MozOutlineRadiusTopleftProperty<string | number>
          | undefined
        MozOutlineRadiusTopright?:
          | csstype.MozOutlineRadiusToprightProperty<string | number>
          | undefined
        MozOutlineStyle?: string | undefined
        MozOutlineWidth?:
          | csstype.OutlineWidthProperty<string | number>
          | undefined
        MozTextAlignLast?: csstype.TextAlignLastProperty | undefined
        MozTextDecorationColor?: string | undefined
        MozTextDecorationLine?: string | undefined
        MozTextDecorationStyle?: csstype.TextDecorationStyleProperty | undefined
        MozUserInput?: csstype.MozUserInputProperty | undefined
        msImeMode?: csstype.ImeModeProperty | undefined
        msScrollbarTrackColor?: string | undefined
        OAnimation?: csstype.AnimationProperty | undefined
        OAnimationDelay?: string | undefined
        OAnimationDirection?: string | undefined
        OAnimationDuration?: string | undefined
        OAnimationFillMode?: string | undefined
        OAnimationIterationCount?:
          | csstype.AnimationIterationCountProperty
          | undefined
        OAnimationName?: string | undefined
        OAnimationPlayState?: string | undefined
        OAnimationTimingFunction?: string | undefined
        OBackgroundSize?:
          | csstype.BackgroundSizeProperty<string | number>
          | undefined
        OBorderImage?: csstype.BorderImageProperty | undefined
        OObjectFit?: csstype.ObjectFitProperty | undefined
        OObjectPosition?:
          | csstype.ObjectPositionProperty<string | number>
          | undefined
        OTabSize?: csstype.TabSizeProperty<string | number> | undefined
        OTextOverflow?: string | undefined
        OTransform?: string | undefined
        OTransformOrigin?:
          | csstype.TransformOriginProperty<string | number>
          | undefined
        OTransition?: string | undefined
        OTransitionDelay?: string | undefined
        OTransitionDuration?: string | undefined
        OTransitionProperty?: string | undefined
        OTransitionTimingFunction?: string | undefined
        WebkitBoxAlign?: csstype.BoxAlignProperty | undefined
        WebkitBoxDirection?: csstype.BoxDirectionProperty | undefined
        WebkitBoxFlex?: csstype.GlobalsNumber | undefined
        WebkitBoxFlexGroup?: csstype.GlobalsNumber | undefined
        WebkitBoxLines?: csstype.BoxLinesProperty | undefined
        WebkitBoxOrdinalGroup?: csstype.GlobalsNumber | undefined
        WebkitBoxOrient?: csstype.BoxOrientProperty | undefined
        WebkitBoxPack?: csstype.BoxPackProperty | undefined
        WebkitScrollSnapPointsX?: string | undefined
        WebkitScrollSnapPointsY?: string | undefined
        alignmentBaseline?: csstype.AlignmentBaselineProperty | undefined
        baselineShift?:
          | csstype.BaselineShiftProperty<string | number>
          | undefined
        clipRule?: csstype.ClipRuleProperty | undefined
        colorInterpolation?: csstype.ColorInterpolationProperty | undefined
        colorRendering?: csstype.ColorRenderingProperty | undefined
        dominantBaseline?: csstype.DominantBaselineProperty | undefined
        fill?: string | undefined
        fillOpacity?: csstype.GlobalsNumber | undefined
        fillRule?: csstype.FillRuleProperty | undefined
        floodColor?: string | undefined
        floodOpacity?: csstype.GlobalsNumber | undefined
        glyphOrientationVertical?:
          | csstype.GlyphOrientationVerticalProperty
          | undefined
        lightingColor?: string | undefined
        marker?: string | undefined
        markerEnd?: string | undefined
        markerMid?: string | undefined
        markerStart?: string | undefined
        shapeRendering?: csstype.ShapeRenderingProperty | undefined
        stopColor?: string | undefined
        stopOpacity?: csstype.GlobalsNumber | undefined
        stroke?: string | undefined
        strokeDasharray?:
          | csstype.StrokeDasharrayProperty<string | number>
          | undefined
        strokeDashoffset?:
          | csstype.StrokeDashoffsetProperty<string | number>
          | undefined
        strokeLinecap?: csstype.StrokeLinecapProperty | undefined
        strokeLinejoin?: csstype.StrokeLinejoinProperty | undefined
        strokeMiterlimit?: csstype.GlobalsNumber | undefined
        strokeOpacity?: csstype.GlobalsNumber | undefined
        strokeWidth?: csstype.StrokeWidthProperty<string | number> | undefined
        textAnchor?: csstype.TextAnchorProperty | undefined
        vectorEffect?: csstype.VectorEffectProperty | undefined
      }
    | {
        innerHTML?: string | undefined
        class?: any
        style?:
          | string
          | {
              alignContent?: string | undefined
              alignItems?: string | undefined
              alignSelf?: string | undefined
              alignTracks?: string | undefined
              animationDelay?: string | undefined
              animationDirection?: string | undefined
              animationDuration?: string | undefined
              animationFillMode?: string | undefined
              animationIterationCount?:
                | csstype.AnimationIterationCountProperty
                | undefined
              animationName?: string | undefined
              animationPlayState?: string | undefined
              animationTimingFunction?: string | undefined
              appearance?: csstype.AppearanceProperty | undefined
              aspectRatio?: string | undefined
              backdropFilter?: string | undefined
              backfaceVisibility?:
                | csstype.BackfaceVisibilityProperty
                | undefined
              backgroundAttachment?: string | undefined
              backgroundBlendMode?: string | undefined
              backgroundClip?: string | undefined
              backgroundColor?: string | undefined
              backgroundImage?: string | undefined
              backgroundOrigin?: string | undefined
              backgroundPositionX?:
                | csstype.BackgroundPositionXProperty<string | number>
                | undefined
              backgroundPositionY?:
                | csstype.BackgroundPositionYProperty<string | number>
                | undefined
              backgroundRepeat?: string | undefined
              backgroundSize?:
                | csstype.BackgroundSizeProperty<string | number>
                | undefined
              blockOverflow?: string | undefined
              blockSize?: csstype.BlockSizeProperty<string | number> | undefined
              borderBlockColor?: string | undefined
              borderBlockEndColor?: string | undefined
              borderBlockEndStyle?:
                | csstype.BorderBlockEndStyleProperty
                | undefined
              borderBlockEndWidth?:
                | csstype.BorderBlockEndWidthProperty<string | number>
                | undefined
              borderBlockStartColor?: string | undefined
              borderBlockStartStyle?:
                | csstype.BorderBlockStartStyleProperty
                | undefined
              borderBlockStartWidth?:
                | csstype.BorderBlockStartWidthProperty<string | number>
                | undefined
              borderBlockStyle?: csstype.BorderBlockStyleProperty | undefined
              borderBlockWidth?:
                | csstype.BorderBlockWidthProperty<string | number>
                | undefined
              borderBottomColor?: string | undefined
              borderBottomLeftRadius?:
                | csstype.BorderBottomLeftRadiusProperty<string | number>
                | undefined
              borderBottomRightRadius?:
                | csstype.BorderBottomRightRadiusProperty<string | number>
                | undefined
              borderBottomStyle?: csstype.BorderBottomStyleProperty | undefined
              borderBottomWidth?:
                | csstype.BorderBottomWidthProperty<string | number>
                | undefined
              borderCollapse?: csstype.BorderCollapseProperty | undefined
              borderEndEndRadius?:
                | csstype.BorderEndEndRadiusProperty<string | number>
                | undefined
              borderEndStartRadius?:
                | csstype.BorderEndStartRadiusProperty<string | number>
                | undefined
              borderImageOutset?:
                | csstype.BorderImageOutsetProperty<string | number>
                | undefined
              borderImageRepeat?: string | undefined
              borderImageSlice?: csstype.BorderImageSliceProperty | undefined
              borderImageSource?: string | undefined
              borderImageWidth?:
                | csstype.BorderImageWidthProperty<string | number>
                | undefined
              borderInlineColor?: string | undefined
              borderInlineEndColor?: string | undefined
              borderInlineEndStyle?:
                | csstype.BorderInlineEndStyleProperty
                | undefined
              borderInlineEndWidth?:
                | csstype.BorderInlineEndWidthProperty<string | number>
                | undefined
              borderInlineStartColor?: string | undefined
              borderInlineStartStyle?:
                | csstype.BorderInlineStartStyleProperty
                | undefined
              borderInlineStartWidth?:
                | csstype.BorderInlineStartWidthProperty<string | number>
                | undefined
              borderInlineStyle?: csstype.BorderInlineStyleProperty | undefined
              borderInlineWidth?:
                | csstype.BorderInlineWidthProperty<string | number>
                | undefined
              borderLeftColor?: string | undefined
              borderLeftStyle?: csstype.BorderLeftStyleProperty | undefined
              borderLeftWidth?:
                | csstype.BorderLeftWidthProperty<string | number>
                | undefined
              borderRightColor?: string | undefined
              borderRightStyle?: csstype.BorderRightStyleProperty | undefined
              borderRightWidth?:
                | csstype.BorderRightWidthProperty<string | number>
                | undefined
              borderSpacing?:
                | csstype.BorderSpacingProperty<string | number>
                | undefined
              borderStartEndRadius?:
                | csstype.BorderStartEndRadiusProperty<string | number>
                | undefined
              borderStartStartRadius?:
                | csstype.BorderStartStartRadiusProperty<string | number>
                | undefined
              borderTopColor?: string | undefined
              borderTopLeftRadius?:
                | csstype.BorderTopLeftRadiusProperty<string | number>
                | undefined
              borderTopRightRadius?:
                | csstype.BorderTopRightRadiusProperty<string | number>
                | undefined
              borderTopStyle?: csstype.BorderTopStyleProperty | undefined
              borderTopWidth?:
                | csstype.BorderTopWidthProperty<string | number>
                | undefined
              bottom?: csstype.BottomProperty<string | number> | undefined
              boxDecorationBreak?:
                | csstype.BoxDecorationBreakProperty
                | undefined
              boxShadow?: string | undefined
              boxSizing?: csstype.BoxSizingProperty | undefined
              breakAfter?: csstype.BreakAfterProperty | undefined
              breakBefore?: csstype.BreakBeforeProperty | undefined
              breakInside?: csstype.BreakInsideProperty | undefined
              captionSide?: csstype.CaptionSideProperty | undefined
              caretColor?: string | undefined
              clear?: csstype.ClearProperty | undefined
              clipPath?: string | undefined
              color?: string | undefined
              colorAdjust?: csstype.ColorAdjustProperty | undefined
              colorScheme?: string | undefined
              columnCount?: csstype.ColumnCountProperty | undefined
              columnFill?: csstype.ColumnFillProperty | undefined
              columnGap?: csstype.ColumnGapProperty<string | number> | undefined
              columnRuleColor?: string | undefined
              columnRuleStyle?: string | undefined
              columnRuleWidth?:
                | csstype.ColumnRuleWidthProperty<string | number>
                | undefined
              columnSpan?: csstype.ColumnSpanProperty | undefined
              columnWidth?:
                | csstype.ColumnWidthProperty<string | number>
                | undefined
              contain?: string | undefined
              content?: string | undefined
              contentVisibility?: csstype.ContentVisibilityProperty | undefined
              counterIncrement?: string | undefined
              counterReset?: string | undefined
              counterSet?: string | undefined
              cursor?: string | undefined
              direction?: csstype.DirectionProperty | undefined
              display?: string | undefined
              emptyCells?: csstype.EmptyCellsProperty | undefined
              filter?: string | undefined
              flexBasis?: csstype.FlexBasisProperty<string | number> | undefined
              flexDirection?: csstype.FlexDirectionProperty | undefined
              flexGrow?: csstype.GlobalsNumber | undefined
              flexShrink?: csstype.GlobalsNumber | undefined
              flexWrap?: csstype.FlexWrapProperty | undefined
              float?: csstype.FloatProperty | undefined
              fontFamily?: string | undefined
              fontFeatureSettings?: string | undefined
              fontKerning?: csstype.FontKerningProperty | undefined
              fontLanguageOverride?: string | undefined
              fontOpticalSizing?: csstype.FontOpticalSizingProperty | undefined
              fontSize?: csstype.FontSizeProperty<string | number> | undefined
              fontSizeAdjust?: csstype.FontSizeAdjustProperty | undefined
              fontSmooth?:
                | csstype.FontSmoothProperty<string | number>
                | undefined
              fontStretch?: string | undefined
              fontStyle?: string | undefined
              fontSynthesis?: string | undefined
              fontVariant?: string | undefined
              fontVariantCaps?: csstype.FontVariantCapsProperty | undefined
              fontVariantEastAsian?: string | undefined
              fontVariantLigatures?: string | undefined
              fontVariantNumeric?: string | undefined
              fontVariantPosition?:
                | csstype.FontVariantPositionProperty
                | undefined
              fontVariationSettings?: string | undefined
              fontWeight?: csstype.FontWeightProperty | undefined
              forcedColorAdjust?: csstype.ForcedColorAdjustProperty | undefined
              gridAutoColumns?:
                | csstype.GridAutoColumnsProperty<string | number>
                | undefined
              gridAutoFlow?: string | undefined
              gridAutoRows?:
                | csstype.GridAutoRowsProperty<string | number>
                | undefined
              gridColumnEnd?: csstype.GridColumnEndProperty | undefined
              gridColumnStart?: csstype.GridColumnStartProperty | undefined
              gridRowEnd?: csstype.GridRowEndProperty | undefined
              gridRowStart?: csstype.GridRowStartProperty | undefined
              gridTemplateAreas?: string | undefined
              gridTemplateColumns?:
                | csstype.GridTemplateColumnsProperty<string | number>
                | undefined
              gridTemplateRows?:
                | csstype.GridTemplateRowsProperty<string | number>
                | undefined
              hangingPunctuation?: string | undefined
              height?: csstype.HeightProperty<string | number> | undefined
              hyphens?: csstype.HyphensProperty | undefined
              imageOrientation?: string | undefined
              imageRendering?: csstype.ImageRenderingProperty | undefined
              imageResolution?: string | undefined
              initialLetter?: csstype.InitialLetterProperty | undefined
              inlineSize?:
                | csstype.InlineSizeProperty<string | number>
                | undefined
              inset?: csstype.InsetProperty<string | number> | undefined
              insetBlock?:
                | csstype.InsetBlockProperty<string | number>
                | undefined
              insetBlockEnd?:
                | csstype.InsetBlockEndProperty<string | number>
                | undefined
              insetBlockStart?:
                | csstype.InsetBlockStartProperty<string | number>
                | undefined
              insetInline?:
                | csstype.InsetInlineProperty<string | number>
                | undefined
              insetInlineEnd?:
                | csstype.InsetInlineEndProperty<string | number>
                | undefined
              insetInlineStart?:
                | csstype.InsetInlineStartProperty<string | number>
                | undefined
              isolation?: csstype.IsolationProperty | undefined
              justifyContent?: string | undefined
              justifyItems?: string | undefined
              justifySelf?: string | undefined
              justifyTracks?: string | undefined
              left?: csstype.LeftProperty<string | number> | undefined
              letterSpacing?:
                | csstype.LetterSpacingProperty<string | number>
                | undefined
              lineBreak?: csstype.LineBreakProperty | undefined
              lineHeight?:
                | csstype.LineHeightProperty<string | number>
                | undefined
              lineHeightStep?:
                | csstype.LineHeightStepProperty<string | number>
                | undefined
              listStyleImage?: string | undefined
              listStylePosition?: csstype.ListStylePositionProperty | undefined
              listStyleType?: string | undefined
              marginBlock?:
                | csstype.MarginBlockProperty<string | number>
                | undefined
              marginBlockEnd?:
                | csstype.MarginBlockEndProperty<string | number>
                | undefined
              marginBlockStart?:
                | csstype.MarginBlockStartProperty<string | number>
                | undefined
              marginBottom?:
                | csstype.MarginBottomProperty<string | number>
                | undefined
              marginInline?:
                | csstype.MarginInlineProperty<string | number>
                | undefined
              marginInlineEnd?:
                | csstype.MarginInlineEndProperty<string | number>
                | undefined
              marginInlineStart?:
                | csstype.MarginInlineStartProperty<string | number>
                | undefined
              marginLeft?:
                | csstype.MarginLeftProperty<string | number>
                | undefined
              marginRight?:
                | csstype.MarginRightProperty<string | number>
                | undefined
              marginTop?: csstype.MarginTopProperty<string | number> | undefined
              maskBorderMode?: csstype.MaskBorderModeProperty | undefined
              maskBorderOutset?:
                | csstype.MaskBorderOutsetProperty<string | number>
                | undefined
              maskBorderRepeat?: string | undefined
              maskBorderSlice?: csstype.MaskBorderSliceProperty | undefined
              maskBorderSource?: string | undefined
              maskBorderWidth?:
                | csstype.MaskBorderWidthProperty<string | number>
                | undefined
              maskClip?: string | undefined
              maskComposite?: string | undefined
              maskImage?: string | undefined
              maskMode?: string | undefined
              maskOrigin?: string | undefined
              maskPosition?:
                | csstype.MaskPositionProperty<string | number>
                | undefined
              maskRepeat?: string | undefined
              maskSize?: csstype.MaskSizeProperty<string | number> | undefined
              maskType?: csstype.MaskTypeProperty | undefined
              mathStyle?: csstype.MathStyleProperty | undefined
              maxBlockSize?:
                | csstype.MaxBlockSizeProperty<string | number>
                | undefined
              maxHeight?: csstype.MaxHeightProperty<string | number> | undefined
              maxInlineSize?:
                | csstype.MaxInlineSizeProperty<string | number>
                | undefined
              maxLines?: csstype.MaxLinesProperty | undefined
              maxWidth?: csstype.MaxWidthProperty<string | number> | undefined
              minBlockSize?:
                | csstype.MinBlockSizeProperty<string | number>
                | undefined
              minHeight?: csstype.MinHeightProperty<string | number> | undefined
              minInlineSize?:
                | csstype.MinInlineSizeProperty<string | number>
                | undefined
              minWidth?: csstype.MinWidthProperty<string | number> | undefined
              mixBlendMode?: csstype.MixBlendModeProperty | undefined
              motionDistance?:
                | csstype.OffsetDistanceProperty<string | number>
                | undefined
              motionPath?: string | undefined
              motionRotation?: string | undefined
              objectFit?: csstype.ObjectFitProperty | undefined
              objectPosition?:
                | csstype.ObjectPositionProperty<string | number>
                | undefined
              offsetAnchor?:
                | csstype.OffsetAnchorProperty<string | number>
                | undefined
              offsetDistance?:
                | csstype.OffsetDistanceProperty<string | number>
                | undefined
              offsetPath?: string | undefined
              offsetRotate?: string | undefined
              offsetRotation?: string | undefined
              opacity?: csstype.OpacityProperty | undefined
              order?: csstype.GlobalsNumber | undefined
              orphans?: csstype.GlobalsNumber | undefined
              outlineColor?: string | undefined
              outlineOffset?:
                | csstype.OutlineOffsetProperty<string | number>
                | undefined
              outlineStyle?: string | undefined
              outlineWidth?:
                | csstype.OutlineWidthProperty<string | number>
                | undefined
              overflowAnchor?: csstype.OverflowAnchorProperty | undefined
              overflowBlock?: csstype.OverflowBlockProperty | undefined
              overflowClipBox?: csstype.OverflowClipBoxProperty | undefined
              overflowClipMargin?:
                | csstype.OverflowClipMarginProperty<string | number>
                | undefined
              overflowInline?: csstype.OverflowInlineProperty | undefined
              overflowWrap?: csstype.OverflowWrapProperty | undefined
              overflowX?: csstype.OverflowXProperty | undefined
              overflowY?: csstype.OverflowYProperty | undefined
              overscrollBehaviorBlock?:
                | csstype.OverscrollBehaviorBlockProperty
                | undefined
              overscrollBehaviorInline?:
                | csstype.OverscrollBehaviorInlineProperty
                | undefined
              overscrollBehaviorX?:
                | csstype.OverscrollBehaviorXProperty
                | undefined
              overscrollBehaviorY?:
                | csstype.OverscrollBehaviorYProperty
                | undefined
              paddingBlock?:
                | csstype.PaddingBlockProperty<string | number>
                | undefined
              paddingBlockEnd?:
                | csstype.PaddingBlockEndProperty<string | number>
                | undefined
              paddingBlockStart?:
                | csstype.PaddingBlockStartProperty<string | number>
                | undefined
              paddingBottom?:
                | csstype.PaddingBottomProperty<string | number>
                | undefined
              paddingInline?:
                | csstype.PaddingInlineProperty<string | number>
                | undefined
              paddingInlineEnd?:
                | csstype.PaddingInlineEndProperty<string | number>
                | undefined
              paddingInlineStart?:
                | csstype.PaddingInlineStartProperty<string | number>
                | undefined
              paddingLeft?:
                | csstype.PaddingLeftProperty<string | number>
                | undefined
              paddingRight?:
                | csstype.PaddingRightProperty<string | number>
                | undefined
              paddingTop?:
                | csstype.PaddingTopProperty<string | number>
                | undefined
              pageBreakAfter?: csstype.PageBreakAfterProperty | undefined
              pageBreakBefore?: csstype.PageBreakBeforeProperty | undefined
              pageBreakInside?: csstype.PageBreakInsideProperty | undefined
              paintOrder?: string | undefined
              perspective?:
                | csstype.PerspectiveProperty<string | number>
                | undefined
              perspectiveOrigin?:
                | csstype.PerspectiveOriginProperty<string | number>
                | undefined
              placeContent?: string | undefined
              pointerEvents?: csstype.PointerEventsProperty | undefined
              position?: csstype.PositionProperty | undefined
              quotes?: string | undefined
              resize?: csstype.ResizeProperty | undefined
              right?: csstype.RightProperty<string | number> | undefined
              rotate?: string | undefined
              rowGap?: csstype.RowGapProperty<string | number> | undefined
              rubyAlign?: csstype.RubyAlignProperty | undefined
              rubyMerge?: csstype.RubyMergeProperty | undefined
              rubyPosition?: string | undefined
              scale?: csstype.ScaleProperty | undefined
              scrollBehavior?: csstype.ScrollBehaviorProperty | undefined
              scrollMargin?:
                | csstype.ScrollMarginProperty<string | number>
                | undefined
              scrollMarginBlock?:
                | csstype.ScrollMarginBlockProperty<string | number>
                | undefined
              scrollMarginBlockEnd?:
                | csstype.ScrollMarginBlockEndProperty<string | number>
                | undefined
              scrollMarginBlockStart?:
                | csstype.ScrollMarginBlockStartProperty<string | number>
                | undefined
              scrollMarginBottom?:
                | csstype.ScrollMarginBottomProperty<string | number>
                | undefined
              scrollMarginInline?:
                | csstype.ScrollMarginInlineProperty<string | number>
                | undefined
              scrollMarginInlineEnd?:
                | csstype.ScrollMarginInlineEndProperty<string | number>
                | undefined
              scrollMarginInlineStart?:
                | csstype.ScrollMarginInlineStartProperty<string | number>
                | undefined
              scrollMarginLeft?:
                | csstype.ScrollMarginLeftProperty<string | number>
                | undefined
              scrollMarginRight?:
                | csstype.ScrollMarginRightProperty<string | number>
                | undefined
              scrollMarginTop?:
                | csstype.ScrollMarginTopProperty<string | number>
                | undefined
              scrollPadding?:
                | csstype.ScrollPaddingProperty<string | number>
                | undefined
              scrollPaddingBlock?:
                | csstype.ScrollPaddingBlockProperty<string | number>
                | undefined
              scrollPaddingBlockEnd?:
                | csstype.ScrollPaddingBlockEndProperty<string | number>
                | undefined
              scrollPaddingBlockStart?:
                | csstype.ScrollPaddingBlockStartProperty<string | number>
                | undefined
              scrollPaddingBottom?:
                | csstype.ScrollPaddingBottomProperty<string | number>
                | undefined
              scrollPaddingInline?:
                | csstype.ScrollPaddingInlineProperty<string | number>
                | undefined
              scrollPaddingInlineEnd?:
                | csstype.ScrollPaddingInlineEndProperty<string | number>
                | undefined
              scrollPaddingInlineStart?:
                | csstype.ScrollPaddingInlineStartProperty<string | number>
                | undefined
              scrollPaddingLeft?:
                | csstype.ScrollPaddingLeftProperty<string | number>
                | undefined
              scrollPaddingRight?:
                | csstype.ScrollPaddingRightProperty<string | number>
                | undefined
              scrollPaddingTop?:
                | csstype.ScrollPaddingTopProperty<string | number>
                | undefined
              scrollSnapAlign?: string | undefined
              scrollSnapMargin?:
                | csstype.ScrollMarginProperty<string | number>
                | undefined
              scrollSnapMarginBottom?:
                | csstype.ScrollMarginBottomProperty<string | number>
                | undefined
              scrollSnapMarginLeft?:
                | csstype.ScrollMarginLeftProperty<string | number>
                | undefined
              scrollSnapMarginRight?:
                | csstype.ScrollMarginRightProperty<string | number>
                | undefined
              scrollSnapMarginTop?:
                | csstype.ScrollMarginTopProperty<string | number>
                | undefined
              scrollSnapStop?: csstype.ScrollSnapStopProperty | undefined
              scrollSnapType?: string | undefined
              scrollbarColor?: string | undefined
              scrollbarGutter?: string | undefined
              scrollbarWidth?: csstype.ScrollbarWidthProperty | undefined
              shapeImageThreshold?:
                | csstype.ShapeImageThresholdProperty
                | undefined
              shapeMargin?:
                | csstype.ShapeMarginProperty<string | number>
                | undefined
              shapeOutside?: string | undefined
              tabSize?: csstype.TabSizeProperty<string | number> | undefined
              tableLayout?: csstype.TableLayoutProperty | undefined
              textAlign?: csstype.TextAlignProperty | undefined
              textAlignLast?: csstype.TextAlignLastProperty | undefined
              textCombineUpright?: string | undefined
              textDecorationColor?: string | undefined
              textDecorationLine?: string | undefined
              textDecorationSkip?: string | undefined
              textDecorationSkipInk?:
                | csstype.TextDecorationSkipInkProperty
                | undefined
              textDecorationStyle?:
                | csstype.TextDecorationStyleProperty
                | undefined
              textDecorationThickness?:
                | csstype.TextDecorationThicknessProperty<string | number>
                | undefined
              textDecorationWidth?:
                | csstype.TextDecorationThicknessProperty<string | number>
                | undefined
              textEmphasisColor?: string | undefined
              textEmphasisPosition?: string | undefined
              textEmphasisStyle?: string | undefined
              textIndent?:
                | csstype.TextIndentProperty<string | number>
                | undefined
              textJustify?: csstype.TextJustifyProperty | undefined
              textOrientation?: csstype.TextOrientationProperty | undefined
              textOverflow?: string | undefined
              textRendering?: csstype.TextRenderingProperty | undefined
              textShadow?: string | undefined
              textSizeAdjust?: string | undefined
              textTransform?: csstype.TextTransformProperty | undefined
              textUnderlineOffset?:
                | csstype.TextUnderlineOffsetProperty<string | number>
                | undefined
              textUnderlinePosition?: string | undefined
              top?: csstype.TopProperty<string | number> | undefined
              touchAction?: string | undefined
              transform?: string | undefined
              transformBox?: csstype.TransformBoxProperty | undefined
              transformOrigin?:
                | csstype.TransformOriginProperty<string | number>
                | undefined
              transformStyle?: csstype.TransformStyleProperty | undefined
              transitionDelay?: string | undefined
              transitionDuration?: string | undefined
              transitionProperty?: string | undefined
              transitionTimingFunction?: string | undefined
              translate?: csstype.TranslateProperty<string | number> | undefined
              unicodeBidi?: csstype.UnicodeBidiProperty | undefined
              userSelect?: csstype.UserSelectProperty | undefined
              verticalAlign?:
                | csstype.VerticalAlignProperty<string | number>
                | undefined
              visibility?: csstype.VisibilityProperty | undefined
              whiteSpace?: csstype.WhiteSpaceProperty | undefined
              widows?: csstype.GlobalsNumber | undefined
              width?: csstype.WidthProperty<string | number> | undefined
              willChange?: string | undefined
              wordBreak?: csstype.WordBreakProperty | undefined
              wordSpacing?:
                | csstype.WordSpacingProperty<string | number>
                | undefined
              wordWrap?: csstype.WordWrapProperty | undefined
              writingMode?: csstype.WritingModeProperty | undefined
              zIndex?: csstype.ZIndexProperty | undefined
              zoom?: csstype.ZoomProperty | undefined
              all?: csstype.Globals | undefined
              animation?: csstype.AnimationProperty | undefined
              background?:
                | csstype.BackgroundProperty<string | number>
                | undefined
              backgroundPosition?:
                | csstype.BackgroundPositionProperty<string | number>
                | undefined
              border?: csstype.BorderProperty<string | number> | undefined
              borderBlock?:
                | csstype.BorderBlockProperty<string | number>
                | undefined
              borderBlockEnd?:
                | csstype.BorderBlockEndProperty<string | number>
                | undefined
              borderBlockStart?:
                | csstype.BorderBlockStartProperty<string | number>
                | undefined
              borderBottom?:
                | csstype.BorderBottomProperty<string | number>
                | undefined
              borderColor?: string | undefined
              borderImage?: csstype.BorderImageProperty | undefined
              borderInline?:
                | csstype.BorderInlineProperty<string | number>
                | undefined
              borderInlineEnd?:
                | csstype.BorderInlineEndProperty<string | number>
                | undefined
              borderInlineStart?:
                | csstype.BorderInlineStartProperty<string | number>
                | undefined
              borderLeft?:
                | csstype.BorderLeftProperty<string | number>
                | undefined
              borderRadius?:
                | csstype.BorderRadiusProperty<string | number>
                | undefined
              borderRight?:
                | csstype.BorderRightProperty<string | number>
                | undefined
              borderStyle?: string | undefined
              borderTop?: csstype.BorderTopProperty<string | number> | undefined
              borderWidth?:
                | csstype.BorderWidthProperty<string | number>
                | undefined
              columnRule?:
                | csstype.ColumnRuleProperty<string | number>
                | undefined
              columns?: csstype.ColumnsProperty<string | number> | undefined
              flex?: csstype.FlexProperty<string | number> | undefined
              flexFlow?: string | undefined
              font?: string | undefined
              gap?: csstype.GapProperty<string | number> | undefined
              grid?: string | undefined
              gridArea?: csstype.GridAreaProperty | undefined
              gridColumn?: csstype.GridColumnProperty | undefined
              gridRow?: csstype.GridRowProperty | undefined
              gridTemplate?: string | undefined
              lineClamp?: csstype.LineClampProperty | undefined
              listStyle?: string | undefined
              margin?: csstype.MarginProperty<string | number> | undefined
              mask?: csstype.MaskProperty<string | number> | undefined
              maskBorder?: csstype.MaskBorderProperty | undefined
              motion?: csstype.OffsetProperty<string | number> | undefined
              offset?: csstype.OffsetProperty<string | number> | undefined
              outline?: csstype.OutlineProperty<string | number> | undefined
              overflow?: string | undefined
              overscrollBehavior?: string | undefined
              padding?: csstype.PaddingProperty<string | number> | undefined
              placeItems?: string | undefined
              placeSelf?: string | undefined
              textDecoration?:
                | csstype.TextDecorationProperty<string | number>
                | undefined
              textEmphasis?: string | undefined
              transition?: string | undefined
              MozAnimationDelay?: string | undefined
              MozAnimationDirection?: string | undefined
              MozAnimationDuration?: string | undefined
              MozAnimationFillMode?: string | undefined
              MozAnimationIterationCount?:
                | csstype.AnimationIterationCountProperty
                | undefined
              MozAnimationName?: string | undefined
              MozAnimationPlayState?: string | undefined
              MozAnimationTimingFunction?: string | undefined
              MozAppearance?: csstype.MozAppearanceProperty | undefined
              MozBackfaceVisibility?:
                | csstype.BackfaceVisibilityProperty
                | undefined
              MozBorderBottomColors?: string | undefined
              MozBorderEndColor?: string | undefined
              MozBorderEndStyle?:
                | csstype.BorderInlineEndStyleProperty
                | undefined
              MozBorderEndWidth?:
                | csstype.BorderInlineEndWidthProperty<string | number>
                | undefined
              MozBorderLeftColors?: string | undefined
              MozBorderRightColors?: string | undefined
              MozBorderStartColor?: string | undefined
              MozBorderStartStyle?:
                | csstype.BorderInlineStartStyleProperty
                | undefined
              MozBorderTopColors?: string | undefined
              MozBoxSizing?: csstype.BoxSizingProperty | undefined
              MozColumnCount?: csstype.ColumnCountProperty | undefined
              MozColumnFill?: csstype.ColumnFillProperty | undefined
              MozColumnGap?:
                | csstype.ColumnGapProperty<string | number>
                | undefined
              MozColumnRuleColor?: string | undefined
              MozColumnRuleStyle?: string | undefined
              MozColumnRuleWidth?:
                | csstype.ColumnRuleWidthProperty<string | number>
                | undefined
              MozColumnWidth?:
                | csstype.ColumnWidthProperty<string | number>
                | undefined
              MozContextProperties?: string | undefined
              MozFontFeatureSettings?: string | undefined
              MozFontLanguageOverride?: string | undefined
              MozHyphens?: csstype.HyphensProperty | undefined
              MozImageRegion?: string | undefined
              MozMarginEnd?:
                | csstype.MarginInlineEndProperty<string | number>
                | undefined
              MozMarginStart?:
                | csstype.MarginInlineStartProperty<string | number>
                | undefined
              MozOrient?: csstype.MozOrientProperty | undefined
              MozOsxFontSmoothing?:
                | csstype.FontSmoothProperty<string | number>
                | undefined
              MozPaddingEnd?:
                | csstype.PaddingInlineEndProperty<string | number>
                | undefined
              MozPaddingStart?:
                | csstype.PaddingInlineStartProperty<string | number>
                | undefined
              MozPerspective?:
                | csstype.PerspectiveProperty<string | number>
                | undefined
              MozPerspectiveOrigin?:
                | csstype.PerspectiveOriginProperty<string | number>
                | undefined
              MozStackSizing?: csstype.MozStackSizingProperty | undefined
              MozTabSize?: csstype.TabSizeProperty<string | number> | undefined
              MozTextBlink?: csstype.MozTextBlinkProperty | undefined
              MozTextSizeAdjust?: string | undefined
              MozTransformOrigin?:
                | csstype.TransformOriginProperty<string | number>
                | undefined
              MozTransformStyle?: csstype.TransformStyleProperty | undefined
              MozTransitionDelay?: string | undefined
              MozTransitionDuration?: string | undefined
              MozTransitionProperty?: string | undefined
              MozTransitionTimingFunction?: string | undefined
              MozUserFocus?: csstype.MozUserFocusProperty | undefined
              MozUserModify?: csstype.MozUserModifyProperty | undefined
              MozUserSelect?: csstype.UserSelectProperty | undefined
              MozWindowDragging?: csstype.MozWindowDraggingProperty | undefined
              MozWindowShadow?: csstype.MozWindowShadowProperty | undefined
              msAccelerator?: csstype.MsAcceleratorProperty | undefined
              msAlignSelf?: string | undefined
              msBlockProgression?:
                | csstype.MsBlockProgressionProperty
                | undefined
              msContentZoomChaining?:
                | csstype.MsContentZoomChainingProperty
                | undefined
              msContentZoomLimitMax?: string | undefined
              msContentZoomLimitMin?: string | undefined
              msContentZoomSnapPoints?: string | undefined
              msContentZoomSnapType?:
                | csstype.MsContentZoomSnapTypeProperty
                | undefined
              msContentZooming?: csstype.MsContentZoomingProperty | undefined
              msFilter?: string | undefined
              msFlexDirection?: csstype.FlexDirectionProperty | undefined
              msFlexPositive?: csstype.GlobalsNumber | undefined
              msFlowFrom?: string | undefined
              msFlowInto?: string | undefined
              msGridColumns?:
                | csstype.MsGridColumnsProperty<string | number>
                | undefined
              msGridRows?:
                | csstype.MsGridRowsProperty<string | number>
                | undefined
              msHighContrastAdjust?:
                | csstype.MsHighContrastAdjustProperty
                | undefined
              msHyphenateLimitChars?:
                | csstype.MsHyphenateLimitCharsProperty
                | undefined
              msHyphenateLimitLines?:
                | csstype.MsHyphenateLimitLinesProperty
                | undefined
              msHyphenateLimitZone?:
                | csstype.MsHyphenateLimitZoneProperty<string | number>
                | undefined
              msHyphens?: csstype.HyphensProperty | undefined
              msImeAlign?: csstype.MsImeAlignProperty | undefined
              msJustifySelf?: string | undefined
              msLineBreak?: csstype.LineBreakProperty | undefined
              msOrder?: csstype.GlobalsNumber | undefined
              msOverflowStyle?: csstype.MsOverflowStyleProperty | undefined
              msOverflowX?: csstype.OverflowXProperty | undefined
              msOverflowY?: csstype.OverflowYProperty | undefined
              msScrollChaining?: csstype.MsScrollChainingProperty | undefined
              msScrollLimitXMax?:
                | csstype.MsScrollLimitXMaxProperty<string | number>
                | undefined
              msScrollLimitXMin?:
                | csstype.MsScrollLimitXMinProperty<string | number>
                | undefined
              msScrollLimitYMax?:
                | csstype.MsScrollLimitYMaxProperty<string | number>
                | undefined
              msScrollLimitYMin?:
                | csstype.MsScrollLimitYMinProperty<string | number>
                | undefined
              msScrollRails?: csstype.MsScrollRailsProperty | undefined
              msScrollSnapPointsX?: string | undefined
              msScrollSnapPointsY?: string | undefined
              msScrollSnapType?: csstype.MsScrollSnapTypeProperty | undefined
              msScrollTranslation?:
                | csstype.MsScrollTranslationProperty
                | undefined
              msScrollbar3dlightColor?: string | undefined
              msScrollbarArrowColor?: string | undefined
              msScrollbarBaseColor?: string | undefined
              msScrollbarDarkshadowColor?: string | undefined
              msScrollbarFaceColor?: string | undefined
              msScrollbarHighlightColor?: string | undefined
              msScrollbarShadowColor?: string | undefined
              msTextAutospace?: csstype.MsTextAutospaceProperty | undefined
              msTextCombineHorizontal?: string | undefined
              msTextOverflow?: string | undefined
              msTouchAction?: string | undefined
              msTouchSelect?: csstype.MsTouchSelectProperty | undefined
              msTransform?: string | undefined
              msTransformOrigin?:
                | csstype.TransformOriginProperty<string | number>
                | undefined
              msTransitionDelay?: string | undefined
              msTransitionDuration?: string | undefined
              msTransitionProperty?: string | undefined
              msTransitionTimingFunction?: string | undefined
              msUserSelect?: csstype.MsUserSelectProperty | undefined
              msWordBreak?: csstype.WordBreakProperty | undefined
              msWrapFlow?: csstype.MsWrapFlowProperty | undefined
              msWrapMargin?:
                | csstype.MsWrapMarginProperty<string | number>
                | undefined
              msWrapThrough?: csstype.MsWrapThroughProperty | undefined
              msWritingMode?: csstype.WritingModeProperty | undefined
              WebkitAlignContent?: string | undefined
              WebkitAlignItems?: string | undefined
              WebkitAlignSelf?: string | undefined
              WebkitAnimationDelay?: string | undefined
              WebkitAnimationDirection?: string | undefined
              WebkitAnimationDuration?: string | undefined
              WebkitAnimationFillMode?: string | undefined
              WebkitAnimationIterationCount?:
                | csstype.AnimationIterationCountProperty
                | undefined
              WebkitAnimationName?: string | undefined
              WebkitAnimationPlayState?: string | undefined
              WebkitAnimationTimingFunction?: string | undefined
              WebkitAppearance?: csstype.WebkitAppearanceProperty | undefined
              WebkitBackdropFilter?: string | undefined
              WebkitBackfaceVisibility?:
                | csstype.BackfaceVisibilityProperty
                | undefined
              WebkitBackgroundClip?: string | undefined
              WebkitBackgroundOrigin?: string | undefined
              WebkitBackgroundSize?:
                | csstype.BackgroundSizeProperty<string | number>
                | undefined
              WebkitBorderBeforeColor?: string | undefined
              WebkitBorderBeforeStyle?: string | undefined
              WebkitBorderBeforeWidth?:
                | csstype.WebkitBorderBeforeWidthProperty<string | number>
                | undefined
              WebkitBorderBottomLeftRadius?:
                | csstype.BorderBottomLeftRadiusProperty<string | number>
                | undefined
              WebkitBorderBottomRightRadius?:
                | csstype.BorderBottomRightRadiusProperty<string | number>
                | undefined
              WebkitBorderImageSlice?:
                | csstype.BorderImageSliceProperty
                | undefined
              WebkitBorderTopLeftRadius?:
                | csstype.BorderTopLeftRadiusProperty<string | number>
                | undefined
              WebkitBorderTopRightRadius?:
                | csstype.BorderTopRightRadiusProperty<string | number>
                | undefined
              WebkitBoxDecorationBreak?:
                | csstype.BoxDecorationBreakProperty
                | undefined
              WebkitBoxReflect?:
                | csstype.WebkitBoxReflectProperty<string | number>
                | undefined
              WebkitBoxShadow?: string | undefined
              WebkitBoxSizing?: csstype.BoxSizingProperty | undefined
              WebkitClipPath?: string | undefined
              WebkitColumnCount?: csstype.ColumnCountProperty | undefined
              WebkitColumnFill?: csstype.ColumnFillProperty | undefined
              WebkitColumnGap?:
                | csstype.ColumnGapProperty<string | number>
                | undefined
              WebkitColumnRuleColor?: string | undefined
              WebkitColumnRuleStyle?: string | undefined
              WebkitColumnRuleWidth?:
                | csstype.ColumnRuleWidthProperty<string | number>
                | undefined
              WebkitColumnSpan?: csstype.ColumnSpanProperty | undefined
              WebkitColumnWidth?:
                | csstype.ColumnWidthProperty<string | number>
                | undefined
              WebkitFilter?: string | undefined
              WebkitFlexBasis?:
                | csstype.FlexBasisProperty<string | number>
                | undefined
              WebkitFlexDirection?: csstype.FlexDirectionProperty | undefined
              WebkitFlexGrow?: csstype.GlobalsNumber | undefined
              WebkitFlexShrink?: csstype.GlobalsNumber | undefined
              WebkitFlexWrap?: csstype.FlexWrapProperty | undefined
              WebkitFontFeatureSettings?: string | undefined
              WebkitFontKerning?: csstype.FontKerningProperty | undefined
              WebkitFontSmoothing?:
                | csstype.FontSmoothProperty<string | number>
                | undefined
              WebkitFontVariantLigatures?: string | undefined
              WebkitHyphens?: csstype.HyphensProperty | undefined
              WebkitJustifyContent?: string | undefined
              WebkitLineBreak?: csstype.LineBreakProperty | undefined
              WebkitLineClamp?: csstype.WebkitLineClampProperty | undefined
              WebkitMarginEnd?:
                | csstype.MarginInlineEndProperty<string | number>
                | undefined
              WebkitMarginStart?:
                | csstype.MarginInlineStartProperty<string | number>
                | undefined
              WebkitMaskAttachment?: string | undefined
              WebkitMaskBoxImageOutset?:
                | csstype.MaskBorderOutsetProperty<string | number>
                | undefined
              WebkitMaskBoxImageRepeat?: string | undefined
              WebkitMaskBoxImageSlice?:
                | csstype.MaskBorderSliceProperty
                | undefined
              WebkitMaskBoxImageSource?: string | undefined
              WebkitMaskBoxImageWidth?:
                | csstype.MaskBorderWidthProperty<string | number>
                | undefined
              WebkitMaskClip?: string | undefined
              WebkitMaskComposite?: string | undefined
              WebkitMaskImage?: string | undefined
              WebkitMaskOrigin?: string | undefined
              WebkitMaskPosition?:
                | csstype.WebkitMaskPositionProperty<string | number>
                | undefined
              WebkitMaskPositionX?:
                | csstype.WebkitMaskPositionXProperty<string | number>
                | undefined
              WebkitMaskPositionY?:
                | csstype.WebkitMaskPositionYProperty<string | number>
                | undefined
              WebkitMaskRepeat?: string | undefined
              WebkitMaskRepeatX?: csstype.WebkitMaskRepeatXProperty | undefined
              WebkitMaskRepeatY?: csstype.WebkitMaskRepeatYProperty | undefined
              WebkitMaskSize?:
                | csstype.WebkitMaskSizeProperty<string | number>
                | undefined
              WebkitMaxInlineSize?:
                | csstype.MaxInlineSizeProperty<string | number>
                | undefined
              WebkitOrder?: csstype.GlobalsNumber | undefined
              WebkitOverflowScrolling?:
                | csstype.WebkitOverflowScrollingProperty
                | undefined
              WebkitPaddingEnd?:
                | csstype.PaddingInlineEndProperty<string | number>
                | undefined
              WebkitPaddingStart?:
                | csstype.PaddingInlineStartProperty<string | number>
                | undefined
              WebkitPerspective?:
                | csstype.PerspectiveProperty<string | number>
                | undefined
              WebkitPerspectiveOrigin?:
                | csstype.PerspectiveOriginProperty<string | number>
                | undefined
              WebkitPrintColorAdjust?: csstype.ColorAdjustProperty | undefined
              WebkitRubyPosition?: string | undefined
              WebkitScrollSnapType?: string | undefined
              WebkitShapeMargin?:
                | csstype.ShapeMarginProperty<string | number>
                | undefined
              WebkitTapHighlightColor?: string | undefined
              WebkitTextCombine?: string | undefined
              WebkitTextDecorationColor?: string | undefined
              WebkitTextDecorationLine?: string | undefined
              WebkitTextDecorationSkip?: string | undefined
              WebkitTextDecorationStyle?:
                | csstype.TextDecorationStyleProperty
                | undefined
              WebkitTextEmphasisColor?: string | undefined
              WebkitTextEmphasisPosition?: string | undefined
              WebkitTextEmphasisStyle?: string | undefined
              WebkitTextFillColor?: string | undefined
              WebkitTextOrientation?:
                | csstype.TextOrientationProperty
                | undefined
              WebkitTextSizeAdjust?: string | undefined
              WebkitTextStrokeColor?: string | undefined
              WebkitTextStrokeWidth?:
                | csstype.WebkitTextStrokeWidthProperty<string | number>
                | undefined
              WebkitTextUnderlinePosition?: string | undefined
              WebkitTouchCallout?:
                | csstype.WebkitTouchCalloutProperty
                | undefined
              WebkitTransform?: string | undefined
              WebkitTransformOrigin?:
                | csstype.TransformOriginProperty<string | number>
                | undefined
              WebkitTransformStyle?: csstype.TransformStyleProperty | undefined
              WebkitTransitionDelay?: string | undefined
              WebkitTransitionDuration?: string | undefined
              WebkitTransitionProperty?: string | undefined
              WebkitTransitionTimingFunction?: string | undefined
              WebkitUserModify?: csstype.WebkitUserModifyProperty | undefined
              WebkitUserSelect?: csstype.UserSelectProperty | undefined
              WebkitWritingMode?: csstype.WritingModeProperty | undefined
              MozAnimation?: csstype.AnimationProperty | undefined
              MozBorderImage?: csstype.BorderImageProperty | undefined
              MozColumnRule?:
                | csstype.ColumnRuleProperty<string | number>
                | undefined
              MozColumns?: csstype.ColumnsProperty<string | number> | undefined
              MozTransition?: string | undefined
              msContentZoomLimit?: string | undefined
              msContentZoomSnap?: string | undefined
              msFlex?: csstype.FlexProperty<string | number> | undefined
              msScrollLimit?: string | undefined
              msScrollSnapX?: string | undefined
              msScrollSnapY?: string | undefined
              msTransition?: string | undefined
              WebkitAnimation?: csstype.AnimationProperty | undefined
              WebkitBorderBefore?:
                | csstype.WebkitBorderBeforeProperty<string | number>
                | undefined
              WebkitBorderImage?: csstype.BorderImageProperty | undefined
              WebkitBorderRadius?:
                | csstype.BorderRadiusProperty<string | number>
                | undefined
              WebkitColumnRule?:
                | csstype.ColumnRuleProperty<string | number>
                | undefined
              WebkitColumns?:
                | csstype.ColumnsProperty<string | number>
                | undefined
              WebkitFlex?: csstype.FlexProperty<string | number> | undefined
              WebkitFlexFlow?: string | undefined
              WebkitMask?:
                | csstype.WebkitMaskProperty<string | number>
                | undefined
              WebkitMaskBoxImage?: csstype.MaskBorderProperty | undefined
              WebkitTextEmphasis?: string | undefined
              WebkitTextStroke?:
                | csstype.WebkitTextStrokeProperty<string | number>
                | undefined
              WebkitTransition?: string | undefined
              azimuth?: string | undefined
              boxAlign?: csstype.BoxAlignProperty | undefined
              boxDirection?: csstype.BoxDirectionProperty | undefined
              boxFlex?: csstype.GlobalsNumber | undefined
              boxFlexGroup?: csstype.GlobalsNumber | undefined
              boxLines?: csstype.BoxLinesProperty | undefined
              boxOrdinalGroup?: csstype.GlobalsNumber | undefined
              boxOrient?: csstype.BoxOrientProperty | undefined
              boxPack?: csstype.BoxPackProperty | undefined
              clip?: string | undefined
              fontVariantAlternates?: string | undefined
              gridColumnGap?:
                | csstype.GridColumnGapProperty<string | number>
                | undefined
              gridGap?: csstype.GridGapProperty<string | number> | undefined
              gridRowGap?:
                | csstype.GridRowGapProperty<string | number>
                | undefined
              imeMode?: csstype.ImeModeProperty | undefined
              offsetBlock?:
                | csstype.InsetBlockProperty<string | number>
                | undefined
              offsetBlockEnd?:
                | csstype.InsetBlockEndProperty<string | number>
                | undefined
              offsetBlockStart?:
                | csstype.InsetBlockStartProperty<string | number>
                | undefined
              offsetInline?:
                | csstype.InsetInlineProperty<string | number>
                | undefined
              offsetInlineEnd?:
                | csstype.InsetInlineEndProperty<string | number>
                | undefined
              offsetInlineStart?:
                | csstype.InsetInlineStartProperty<string | number>
                | undefined
              scrollSnapCoordinate?:
                | csstype.ScrollSnapCoordinateProperty<string | number>
                | undefined
              scrollSnapDestination?:
                | csstype.ScrollSnapDestinationProperty<string | number>
                | undefined
              scrollSnapPointsX?: string | undefined
              scrollSnapPointsY?: string | undefined
              scrollSnapTypeX?: csstype.ScrollSnapTypeXProperty | undefined
              scrollSnapTypeY?: csstype.ScrollSnapTypeYProperty | undefined
              scrollbarTrackColor?: string | undefined
              KhtmlBoxAlign?: csstype.BoxAlignProperty | undefined
              KhtmlBoxDirection?: csstype.BoxDirectionProperty | undefined
              KhtmlBoxFlex?: csstype.GlobalsNumber | undefined
              KhtmlBoxFlexGroup?: csstype.GlobalsNumber | undefined
              KhtmlBoxLines?: csstype.BoxLinesProperty | undefined
              KhtmlBoxOrdinalGroup?: csstype.GlobalsNumber | undefined
              KhtmlBoxOrient?: csstype.BoxOrientProperty | undefined
              KhtmlBoxPack?: csstype.BoxPackProperty | undefined
              KhtmlLineBreak?: csstype.LineBreakProperty | undefined
              KhtmlOpacity?: csstype.OpacityProperty | undefined
              KhtmlUserSelect?: csstype.UserSelectProperty | undefined
              MozBackgroundClip?: string | undefined
              MozBackgroundInlinePolicy?:
                | csstype.BoxDecorationBreakProperty
                | undefined
              MozBackgroundOrigin?: string | undefined
              MozBackgroundSize?:
                | csstype.BackgroundSizeProperty<string | number>
                | undefined
              MozBinding?: string | undefined
              MozBorderRadius?:
                | csstype.BorderRadiusProperty<string | number>
                | undefined
              MozBorderRadiusBottomleft?:
                | csstype.BorderBottomLeftRadiusProperty<string | number>
                | undefined
              MozBorderRadiusBottomright?:
                | csstype.BorderBottomRightRadiusProperty<string | number>
                | undefined
              MozBorderRadiusTopleft?:
                | csstype.BorderTopLeftRadiusProperty<string | number>
                | undefined
              MozBorderRadiusTopright?:
                | csstype.BorderTopRightRadiusProperty<string | number>
                | undefined
              MozBoxAlign?: csstype.BoxAlignProperty | undefined
              MozBoxDirection?: csstype.BoxDirectionProperty | undefined
              MozBoxFlex?: csstype.GlobalsNumber | undefined
              MozBoxOrdinalGroup?: csstype.GlobalsNumber | undefined
              MozBoxOrient?: csstype.BoxOrientProperty | undefined
              MozBoxPack?: csstype.BoxPackProperty | undefined
              MozBoxShadow?: string | undefined
              MozFloatEdge?: csstype.MozFloatEdgeProperty | undefined
              MozForceBrokenImageIcon?: csstype.GlobalsNumber | undefined
              MozOpacity?: csstype.OpacityProperty | undefined
              MozOutline?: csstype.OutlineProperty<string | number> | undefined
              MozOutlineColor?: string | undefined
              MozOutlineRadius?:
                | csstype.MozOutlineRadiusProperty<string | number>
                | undefined
              MozOutlineRadiusBottomleft?:
                | csstype.MozOutlineRadiusBottomleftProperty<string | number>
                | undefined
              MozOutlineRadiusBottomright?:
                | csstype.MozOutlineRadiusBottomrightProperty<string | number>
                | undefined
              MozOutlineRadiusTopleft?:
                | csstype.MozOutlineRadiusTopleftProperty<string | number>
                | undefined
              MozOutlineRadiusTopright?:
                | csstype.MozOutlineRadiusToprightProperty<string | number>
                | undefined
              MozOutlineStyle?: string | undefined
              MozOutlineWidth?:
                | csstype.OutlineWidthProperty<string | number>
                | undefined
              MozTextAlignLast?: csstype.TextAlignLastProperty | undefined
              MozTextDecorationColor?: string | undefined
              MozTextDecorationLine?: string | undefined
              MozTextDecorationStyle?:
                | csstype.TextDecorationStyleProperty
                | undefined
              MozUserInput?: csstype.MozUserInputProperty | undefined
              msImeMode?: csstype.ImeModeProperty | undefined
              msScrollbarTrackColor?: string | undefined
              OAnimation?: csstype.AnimationProperty | undefined
              OAnimationDelay?: string | undefined
              OAnimationDirection?: string | undefined
              OAnimationDuration?: string | undefined
              OAnimationFillMode?: string | undefined
              OAnimationIterationCount?:
                | csstype.AnimationIterationCountProperty
                | undefined
              OAnimationName?: string | undefined
              OAnimationPlayState?: string | undefined
              OAnimationTimingFunction?: string | undefined
              OBackgroundSize?:
                | csstype.BackgroundSizeProperty<string | number>
                | undefined
              OBorderImage?: csstype.BorderImageProperty | undefined
              OObjectFit?: csstype.ObjectFitProperty | undefined
              OObjectPosition?:
                | csstype.ObjectPositionProperty<string | number>
                | undefined
              OTabSize?: csstype.TabSizeProperty<string | number> | undefined
              OTextOverflow?: string | undefined
              OTransform?: string | undefined
              OTransformOrigin?:
                | csstype.TransformOriginProperty<string | number>
                | undefined
              OTransition?: string | undefined
              OTransitionDelay?: string | undefined
              OTransitionDuration?: string | undefined
              OTransitionProperty?: string | undefined
              OTransitionTimingFunction?: string | undefined
              WebkitBoxAlign?: csstype.BoxAlignProperty | undefined
              WebkitBoxDirection?: csstype.BoxDirectionProperty | undefined
              WebkitBoxFlex?: csstype.GlobalsNumber | undefined
              WebkitBoxFlexGroup?: csstype.GlobalsNumber | undefined
              WebkitBoxLines?: csstype.BoxLinesProperty | undefined
              WebkitBoxOrdinalGroup?: csstype.GlobalsNumber | undefined
              WebkitBoxOrient?: csstype.BoxOrientProperty | undefined
              WebkitBoxPack?: csstype.BoxPackProperty | undefined
              WebkitScrollSnapPointsX?: string | undefined
              WebkitScrollSnapPointsY?: string | undefined
              alignmentBaseline?: csstype.AlignmentBaselineProperty | undefined
              baselineShift?:
                | csstype.BaselineShiftProperty<string | number>
                | undefined
              clipRule?: csstype.ClipRuleProperty | undefined
              colorInterpolation?:
                | csstype.ColorInterpolationProperty
                | undefined
              colorRendering?: csstype.ColorRenderingProperty | undefined
              dominantBaseline?: csstype.DominantBaselineProperty | undefined
              fill?: string | undefined
              fillOpacity?: csstype.GlobalsNumber | undefined
              fillRule?: csstype.FillRuleProperty | undefined
              floodColor?: string | undefined
              floodOpacity?: csstype.GlobalsNumber | undefined
              glyphOrientationVertical?:
                | csstype.GlyphOrientationVerticalProperty
                | undefined
              lightingColor?: string | undefined
              marker?: string | undefined
              markerEnd?: string | undefined
              markerMid?: string | undefined
              markerStart?: string | undefined
              shapeRendering?: csstype.ShapeRenderingProperty | undefined
              stopColor?: string | undefined
              stopOpacity?: csstype.GlobalsNumber | undefined
              stroke?: string | undefined
              strokeDasharray?:
                | csstype.StrokeDasharrayProperty<string | number>
                | undefined
              strokeDashoffset?:
                | csstype.StrokeDashoffsetProperty<string | number>
                | undefined
              strokeLinecap?: csstype.StrokeLinecapProperty | undefined
              strokeLinejoin?: csstype.StrokeLinejoinProperty | undefined
              strokeMiterlimit?: csstype.GlobalsNumber | undefined
              strokeOpacity?: csstype.GlobalsNumber | undefined
              strokeWidth?:
                | csstype.StrokeWidthProperty<string | number>
                | undefined
              textAnchor?: csstype.TextAnchorProperty | undefined
              vectorEffect?: csstype.VectorEffectProperty | undefined
            }
          | undefined
        color?: string | undefined
        height?: (string | number) | undefined
        id?: string | undefined
        lang?: string | undefined
        max?: (string | number) | undefined
        media?: string | undefined
        method?: string | undefined
        min?: (string | number) | undefined
        name?: string | undefined
        target?: string | undefined
        type?: string | undefined
        width?: (string | number) | undefined
        role?: string | undefined
        tabindex?: (string | number) | undefined
        'accent-height'?: (string | number) | undefined
        accumulate?: 'none' | 'sum' | undefined
        additive?: 'replace' | 'sum' | undefined
        'alignment-baseline'?:
          | 'alphabetic'
          | 'hanging'
          | 'ideographic'
          | 'mathematical'
          | 'inherit'
          | 'baseline'
          | 'auto'
          | 'middle'
          | 'after-edge'
          | 'before-edge'
          | 'central'
          | 'text-after-edge'
          | 'text-before-edge'
          | undefined
        allowReorder?: 'no' | 'yes' | undefined
        alphabetic?: (string | number) | undefined
        amplitude?: (string | number) | undefined
        'arabic-form'?:
          | 'initial'
          | 'medial'
          | 'terminal'
          | 'isolated'
          | undefined
        ascent?: (string | number) | undefined
        attributeName?: string | undefined
        attributeType?: string | undefined
        autoReverse?: (string | number) | undefined
        azimuth?: (string | number) | undefined
        baseFrequency?: (string | number) | undefined
        'baseline-shift'?: (string | number) | undefined
        baseProfile?: (string | number) | undefined
        bbox?: (string | number) | undefined
        begin?: (string | number) | undefined
        bias?: (string | number) | undefined
        by?: (string | number) | undefined
        calcMode?: (string | number) | undefined
        'cap-height'?: (string | number) | undefined
        clip?: (string | number) | undefined
        'clip-path'?: string | undefined
        clipPathUnits?: (string | number) | undefined
        'clip-rule'?: (string | number) | undefined
        'color-interpolation'?: (string | number) | undefined
        'color-interpolation-filters'?:
          | 'inherit'
          | 'auto'
          | 'linearRGB'
          | 'sRGB'
          | undefined
        'color-profile'?: (string | number) | undefined
        'color-rendering'?: (string | number) | undefined
        contentScriptType?: (string | number) | undefined
        contentStyleType?: (string | number) | undefined
        cursor?: (string | number) | undefined
        cx?: (string | number) | undefined
        cy?: (string | number) | undefined
        d?: string | undefined
        decelerate?: (string | number) | undefined
        descent?: (string | number) | undefined
        diffuseConstant?: (string | number) | undefined
        direction?: (string | number) | undefined
        display?: (string | number) | undefined
        divisor?: (string | number) | undefined
        'dominant-baseline'?: (string | number) | undefined
        dur?: (string | number) | undefined
        dx?: (string | number) | undefined
        dy?: (string | number) | undefined
        edgeMode?: (string | number) | undefined
        elevation?: (string | number) | undefined
        'enable-background'?: (string | number) | undefined
        end?: (string | number) | undefined
        exponent?: (string | number) | undefined
        externalResourcesRequired?: (string | number) | undefined
        fill?: string | undefined
        'fill-opacity'?: (string | number) | undefined
        'fill-rule'?: 'inherit' | 'evenodd' | 'nonzero' | undefined
        filter?: string | undefined
        filterRes?: (string | number) | undefined
        filterUnits?: (string | number) | undefined
        'flood-color'?: (string | number) | undefined
        'flood-opacity'?: (string | number) | undefined
        focusable?: (string | number) | undefined
        'font-family'?: string | undefined
        'font-size'?: (string | number) | undefined
        'font-size-adjust'?: (string | number) | undefined
        'font-stretch'?: (string | number) | undefined
        'font-style'?: (string | number) | undefined
        'font-variant'?: (string | number) | undefined
        'font-weight'?: (string | number) | undefined
        format?: (string | number) | undefined
        from?: (string | number) | undefined
        fx?: (string | number) | undefined
        fy?: (string | number) | undefined
        g1?: (string | number) | undefined
        g2?: (string | number) | undefined
        'glyph-name'?: (string | number) | undefined
        'glyph-orientation-horizontal'?: (string | number) | undefined
        'glyph-orientation-vertical'?: (string | number) | undefined
        glyphRef?: (string | number) | undefined
        gradientTransform?: string | undefined
        gradientUnits?: string | undefined
        hanging?: (string | number) | undefined
        'horiz-adv-x'?: (string | number) | undefined
        'horiz-origin-x'?: (string | number) | undefined
        href?: string | undefined
        ideographic?: (string | number) | undefined
        'image-rendering'?: (string | number) | undefined
        in2?: (string | number) | undefined
        in?: string | undefined
        intercept?: (string | number) | undefined
        k1?: (string | number) | undefined
        k2?: (string | number) | undefined
        k3?: (string | number) | undefined
        k4?: (string | number) | undefined
        k?: (string | number) | undefined
        kernelMatrix?: (string | number) | undefined
        kernelUnitLength?: (string | number) | undefined
        kerning?: (string | number) | undefined
        keyPoints?: (string | number) | undefined
        keySplines?: (string | number) | undefined
        keyTimes?: (string | number) | undefined
        lengthAdjust?: (string | number) | undefined
        'letter-spacing'?: (string | number) | undefined
        'lighting-color'?: (string | number) | undefined
        limitingConeAngle?: (string | number) | undefined
        local?: (string | number) | undefined
        'marker-end'?: string | undefined
        markerHeight?: (string | number) | undefined
        'marker-mid'?: string | undefined
        'marker-start'?: string | undefined
        markerUnits?: (string | number) | undefined
        markerWidth?: (string | number) | undefined
        mask?: string | undefined
        maskContentUnits?: (string | number) | undefined
        maskUnits?: (string | number) | undefined
        mathematical?: (string | number) | undefined
        mode?: (string | number) | undefined
        numOctaves?: (string | number) | undefined
        offset?: (string | number) | undefined
        opacity?: (string | number) | undefined
        operator?: (string | number) | undefined
        order?: (string | number) | undefined
        orient?: (string | number) | undefined
        orientation?: (string | number) | undefined
        origin?: (string | number) | undefined
        overflow?: (string | number) | undefined
        'overline-position'?: (string | number) | undefined
        'overline-thickness'?: (string | number) | undefined
        'paint-order'?: (string | number) | undefined
        'panose-1'?: (string | number) | undefined
        pathLength?: (string | number) | undefined
        patternContentUnits?: string | undefined
        patternTransform?: (string | number) | undefined
        patternUnits?: string | undefined
        'pointer-events'?: (string | number) | undefined
        points?: string | undefined
        pointsAtX?: (string | number) | undefined
        pointsAtY?: (string | number) | undefined
        pointsAtZ?: (string | number) | undefined
        preserveAlpha?: (string | number) | undefined
        preserveAspectRatio?: string | undefined
        primitiveUnits?: (string | number) | undefined
        r?: (string | number) | undefined
        radius?: (string | number) | undefined
        refX?: (string | number) | undefined
        refY?: (string | number) | undefined
        renderingIntent?: (string | number) | undefined
        repeatCount?: (string | number) | undefined
        repeatDur?: (string | number) | undefined
        requiredExtensions?: (string | number) | undefined
        requiredFeatures?: (string | number) | undefined
        restart?: (string | number) | undefined
        result?: string | undefined
        rotate?: (string | number) | undefined
        rx?: (string | number) | undefined
        ry?: (string | number) | undefined
        scale?: (string | number) | undefined
        seed?: (string | number) | undefined
        'shape-rendering'?: (string | number) | undefined
        slope?: (string | number) | undefined
        spacing?: (string | number) | undefined
        specularConstant?: (string | number) | undefined
        specularExponent?: (string | number) | undefined
        speed?: (string | number) | undefined
        spreadMethod?: string | undefined
        startOffset?: (string | number) | undefined
        stdDeviation?: (string | number) | undefined
        stemh?: (string | number) | undefined
        stemv?: (string | number) | undefined
        stitchTiles?: (string | number) | undefined
        'stop-color'?: string | undefined
        'stop-opacity'?: (string | number) | undefined
        'strikethrough-position'?: (string | number) | undefined
        'strikethrough-thickness'?: (string | number) | undefined
        string?: (string | number) | undefined
        stroke?: string | undefined
        'stroke-dasharray'?: (string | number) | undefined
        'stroke-dashoffset'?: (string | number) | undefined
        'stroke-linecap'?: 'inherit' | 'round' | 'butt' | 'square' | undefined
        'stroke-linejoin'?: 'inherit' | 'round' | 'bevel' | 'miter' | undefined
        'stroke-miterlimit'?: (string | number) | undefined
        'stroke-opacity'?: (string | number) | undefined
        'stroke-width'?: (string | number) | undefined
        surfaceScale?: (string | number) | undefined
        systemLanguage?: (string | number) | undefined
        tableValues?: (string | number) | undefined
        targetX?: (string | number) | undefined
        targetY?: (string | number) | undefined
        'text-anchor'?: string | undefined
        'text-decoration'?: (string | number) | undefined
        textLength?: (string | number) | undefined
        'text-rendering'?: (string | number) | undefined
        to?: (string | number) | undefined
        transform?: string | undefined
        u1?: (string | number) | undefined
        u2?: (string | number) | undefined
        'underline-position'?: (string | number) | undefined
        'underline-thickness'?: (string | number) | undefined
        unicode?: (string | number) | undefined
        'unicode-bidi'?: (string | number) | undefined
        'unicode-range'?: (string | number) | undefined
        'unitsPer-em'?: (string | number) | undefined
        'v-alphabetic'?: (string | number) | undefined
        values?: string | undefined
        'vector-effect'?: (string | number) | undefined
        version?: string | undefined
        'vert-adv-y'?: (string | number) | undefined
        'vert-origin-x'?: (string | number) | undefined
        'vert-origin-y'?: (string | number) | undefined
        'v-hanging'?: (string | number) | undefined
        'v-ideographic'?: (string | number) | undefined
        viewBox?: string | undefined
        viewTarget?: (string | number) | undefined
        visibility?: (string | number) | undefined
        'v-mathematical'?: (string | number) | undefined
        widths?: (string | number) | undefined
        'word-spacing'?: (string | number) | undefined
        'writing-mode'?: (string | number) | undefined
        x1?: (string | number) | undefined
        x2?: (string | number) | undefined
        x?: (string | number) | undefined
        xChannelSelector?: string | undefined
        'x-height'?: (string | number) | undefined
        xlinkActuate?: string | undefined
        xlinkArcrole?: string | undefined
        xlinkHref?: string | undefined
        xlinkRole?: string | undefined
        xlinkShow?: string | undefined
        xlinkTitle?: string | undefined
        xlinkType?: string | undefined
        xmlns?: string | undefined
        y1?: (string | number) | undefined
        y2?: (string | number) | undefined
        y?: (string | number) | undefined
        yChannelSelector?: string | undefined
        z?: (string | number) | undefined
        zoomAndPan?: string | undefined
        'aria-activedescendant'?: string | undefined
        'aria-atomic'?: (boolean | 'false' | 'true') | undefined
        'aria-autocomplete'?: 'both' | 'none' | 'inline' | 'list' | undefined
        'aria-busy'?: (boolean | 'false' | 'true') | undefined
        'aria-checked'?: 'mixed' | (boolean | 'false' | 'true') | undefined
        'aria-colcount'?: (string | number) | undefined
        'aria-colindex'?: (string | number) | undefined
        'aria-colspan'?: (string | number) | undefined
        'aria-controls'?: string | undefined
        'aria-current'?:
          | 'page'
          | (boolean | 'false' | 'true')
          | 'step'
          | 'location'
          | 'date'
          | 'time'
          | undefined
        'aria-describedby'?: string | undefined
        'aria-details'?: string | undefined
        'aria-disabled'?: (boolean | 'false' | 'true') | undefined
        'aria-dropeffect'?:
          | 'link'
          | 'none'
          | 'copy'
          | 'move'
          | 'execute'
          | 'popup'
          | undefined
        'aria-errormessage'?: string | undefined
        'aria-expanded'?: (boolean | 'false' | 'true') | undefined
        'aria-flowto'?: string | undefined
        'aria-grabbed'?: (boolean | 'false' | 'true') | undefined
        'aria-haspopup'?:
          | 'grid'
          | 'listbox'
          | 'menu'
          | (boolean | 'false' | 'true')
          | 'tree'
          | 'dialog'
          | undefined
        'aria-hidden'?: (boolean | 'false' | 'true') | undefined
        'aria-invalid'?:
          | (boolean | 'false' | 'true')
          | 'grammar'
          | 'spelling'
          | undefined
        'aria-keyshortcuts'?: string | undefined
        'aria-label'?: string | undefined
        'aria-labelledby'?: string | undefined
        'aria-level'?: (string | number) | undefined
        'aria-live'?: 'off' | 'assertive' | 'polite' | undefined
        'aria-modal'?: (boolean | 'false' | 'true') | undefined
        'aria-multiline'?: (boolean | 'false' | 'true') | undefined
        'aria-multiselectable'?: (boolean | 'false' | 'true') | undefined
        'aria-orientation'?: 'horizontal' | 'vertical' | undefined
        'aria-owns'?: string | undefined
        'aria-placeholder'?: string | undefined
        'aria-posinset'?: (string | number) | undefined
        'aria-pressed'?: 'mixed' | (boolean | 'false' | 'true') | undefined
        'aria-readonly'?: (boolean | 'false' | 'true') | undefined
        'aria-relevant'?:
          | 'all'
          | 'text'
          | 'additions'
          | 'additions text'
          | 'removals'
          | undefined
        'aria-required'?: (boolean | 'false' | 'true') | undefined
        'aria-roledescription'?: string | undefined
        'aria-rowcount'?: (string | number) | undefined
        'aria-rowindex'?: (string | number) | undefined
        'aria-rowspan'?: (string | number) | undefined
        'aria-selected'?: (boolean | 'false' | 'true') | undefined
        'aria-setsize'?: (string | number) | undefined
        'aria-sort'?: 'none' | 'ascending' | 'descending' | 'other' | undefined
        'aria-valuemax'?: (string | number) | undefined
        'aria-valuemin'?: (string | number) | undefined
        'aria-valuenow'?: (string | number) | undefined
        'aria-valuetext'?: string | undefined
        onCopy?: ((payload: ClipboardEvent) => void) | undefined
        onCut?: ((payload: ClipboardEvent) => void) | undefined
        onPaste?: ((payload: ClipboardEvent) => void) | undefined
        onCompositionend?: ((payload: CompositionEvent) => void) | undefined
        onCompositionstart?: ((payload: CompositionEvent) => void) | undefined
        onCompositionupdate?: ((payload: CompositionEvent) => void) | undefined
        onDrag?: ((payload: DragEvent) => void) | undefined
        onDragend?: ((payload: DragEvent) => void) | undefined
        onDragenter?: ((payload: DragEvent) => void) | undefined
        onDragexit?: ((payload: DragEvent) => void) | undefined
        onDragleave?: ((payload: DragEvent) => void) | undefined
        onDragover?: ((payload: DragEvent) => void) | undefined
        onDragstart?: ((payload: DragEvent) => void) | undefined
        onDrop?: ((payload: DragEvent) => void) | undefined
        onFocus?: ((payload: FocusEvent) => void) | undefined
        onFocusin?: ((payload: FocusEvent) => void) | undefined
        onFocusout?: ((payload: FocusEvent) => void) | undefined
        onBlur?: ((payload: FocusEvent) => void) | undefined
        onChange?: ((payload: Event) => void) | undefined
        onBeforeinput?: ((payload: Event) => void) | undefined
        onInput?: ((payload: Event) => void) | undefined
        onReset?: ((payload: Event) => void) | undefined
        onSubmit?: ((payload: Event) => void) | undefined
        onInvalid?: ((payload: Event) => void) | undefined
        onLoad?: ((payload: Event) => void) | undefined
        onError?: ((payload: Event) => void) | undefined
        onKeydown?: ((payload: KeyboardEvent) => void) | undefined
        onKeypress?: ((payload: KeyboardEvent) => void) | undefined
        onKeyup?: ((payload: KeyboardEvent) => void) | undefined
        onAuxclick?: ((payload: MouseEvent) => void) | undefined
        onClick?: ((payload: MouseEvent) => void) | undefined
        onContextmenu?: ((payload: MouseEvent) => void) | undefined
        onDblclick?: ((payload: MouseEvent) => void) | undefined
        onMousedown?: ((payload: MouseEvent) => void) | undefined
        onMouseenter?: ((payload: MouseEvent) => void) | undefined
        onMouseleave?: ((payload: MouseEvent) => void) | undefined
        onMousemove?: ((payload: MouseEvent) => void) | undefined
        onMouseout?: ((payload: MouseEvent) => void) | undefined
        onMouseover?: ((payload: MouseEvent) => void) | undefined
        onMouseup?: ((payload: MouseEvent) => void) | undefined
        onAbort?: ((payload: Event) => void) | undefined
        onCanplay?: ((payload: Event) => void) | undefined
        onCanplaythrough?: ((payload: Event) => void) | undefined
        onDurationchange?: ((payload: Event) => void) | undefined
        onEmptied?: ((payload: Event) => void) | undefined
        onEncrypted?: ((payload: Event) => void) | undefined
        onEnded?: ((payload: Event) => void) | undefined
        onLoadeddata?: ((payload: Event) => void) | undefined
        onLoadedmetadata?: ((payload: Event) => void) | undefined
        onLoadstart?: ((payload: Event) => void) | undefined
        onPause?: ((payload: Event) => void) | undefined
        onPlay?: ((payload: Event) => void) | undefined
        onPlaying?: ((payload: Event) => void) | undefined
        onProgress?: ((payload: Event) => void) | undefined
        onRatechange?: ((payload: Event) => void) | undefined
        onSeeked?: ((payload: Event) => void) | undefined
        onSeeking?: ((payload: Event) => void) | undefined
        onStalled?: ((payload: Event) => void) | undefined
        onSuspend?: ((payload: Event) => void) | undefined
        onTimeupdate?: ((payload: Event) => void) | undefined
        onVolumechange?: ((payload: Event) => void) | undefined
        onWaiting?: ((payload: Event) => void) | undefined
        onSelect?: ((payload: Event) => void) | undefined
        onScroll?: ((payload: UIEvent) => void) | undefined
        onTouchcancel?: ((payload: TouchEvent) => void) | undefined
        onTouchend?: ((payload: TouchEvent) => void) | undefined
        onTouchmove?: ((payload: TouchEvent) => void) | undefined
        onTouchstart?: ((payload: TouchEvent) => void) | undefined
        onPointerdown?: ((payload: PointerEvent) => void) | undefined
        onPointermove?: ((payload: PointerEvent) => void) | undefined
        onPointerup?: ((payload: PointerEvent) => void) | undefined
        onPointercancel?: ((payload: PointerEvent) => void) | undefined
        onPointerenter?: ((payload: PointerEvent) => void) | undefined
        onPointerleave?: ((payload: PointerEvent) => void) | undefined
        onPointerover?: ((payload: PointerEvent) => void) | undefined
        onPointerout?: ((payload: PointerEvent) => void) | undefined
        onWheel?: ((payload: WheelEvent) => void) | undefined
        onAnimationstart?: ((payload: AnimationEvent) => void) | undefined
        onAnimationend?: ((payload: AnimationEvent) => void) | undefined
        onAnimationiteration?: ((payload: AnimationEvent) => void) | undefined
        onTransitionend?: ((payload: TransitionEvent) => void) | undefined
        onTransitionstart?: ((payload: TransitionEvent) => void) | undefined
      }
    | {
        x?: string | number | undefined
        y?: string | number | undefined
        z?: string | number | undefined
        translateX?: string | number | undefined
        translateY?: string | number | undefined
        translateZ?: string | number | undefined
        rotate?: string | number | undefined
        rotateX?: string | number | undefined
        rotateY?: string | number | undefined
        rotateZ?: string | number | undefined
        scale?: string | number | undefined
        scaleX?: string | number | undefined
        scaleY?: string | number | undefined
        scaleZ?: string | number | undefined
        skew?: string | number | undefined
        skewX?: string | number | undefined
        skewY?: string | number | undefined
        originX?: string | number | undefined
        originY?: string | number | undefined
        originZ?: string | number | undefined
        perspective?: string | number | undefined
        transformPerspective?: string | number | undefined
      }
    | {
        pathLength?: number | undefined
        pathOffset?: number | undefined
        pathSpacing?: number | undefined
      }
  style: {
    alignContent?: string | undefined
    alignItems?: string | undefined
    alignSelf?: string | undefined
    alignTracks?: string | undefined
    animationDelay?: string | undefined
    animationDirection?: string | undefined
    animationDuration?: string | undefined
    animationFillMode?: string | undefined
    animationIterationCount?:
      | csstype.AnimationIterationCountProperty
      | undefined
    animationName?: string | undefined
    animationPlayState?: string | undefined
    animationTimingFunction?: string | undefined
    appearance?: csstype.AppearanceProperty | undefined
    aspectRatio?: string | undefined
    backdropFilter?: string | undefined
    backfaceVisibility?: csstype.BackfaceVisibilityProperty | undefined
    backgroundAttachment?: string | undefined
    backgroundBlendMode?: string | undefined
    backgroundClip?: string | undefined
    backgroundColor?: string | undefined
    backgroundImage?: string | undefined
    backgroundOrigin?: string | undefined
    backgroundPositionX?:
      | csstype.BackgroundPositionXProperty<string | number>
      | undefined
    backgroundPositionY?:
      | csstype.BackgroundPositionYProperty<string | number>
      | undefined
    backgroundRepeat?: string | undefined
    backgroundSize?: csstype.BackgroundSizeProperty<string | number> | undefined
    blockOverflow?: string | undefined
    blockSize?: csstype.BlockSizeProperty<string | number> | undefined
    borderBlockColor?: string | undefined
    borderBlockEndColor?: string | undefined
    borderBlockEndStyle?: csstype.BorderBlockEndStyleProperty | undefined
    borderBlockEndWidth?:
      | csstype.BorderBlockEndWidthProperty<string | number>
      | undefined
    borderBlockStartColor?: string | undefined
    borderBlockStartStyle?: csstype.BorderBlockStartStyleProperty | undefined
    borderBlockStartWidth?:
      | csstype.BorderBlockStartWidthProperty<string | number>
      | undefined
    borderBlockStyle?: csstype.BorderBlockStyleProperty | undefined
    borderBlockWidth?:
      | csstype.BorderBlockWidthProperty<string | number>
      | undefined
    borderBottomColor?: string | undefined
    borderBottomLeftRadius?:
      | csstype.BorderBottomLeftRadiusProperty<string | number>
      | undefined
    borderBottomRightRadius?:
      | csstype.BorderBottomRightRadiusProperty<string | number>
      | undefined
    borderBottomStyle?: csstype.BorderBottomStyleProperty | undefined
    borderBottomWidth?:
      | csstype.BorderBottomWidthProperty<string | number>
      | undefined
    borderCollapse?: csstype.BorderCollapseProperty | undefined
    borderEndEndRadius?:
      | csstype.BorderEndEndRadiusProperty<string | number>
      | undefined
    borderEndStartRadius?:
      | csstype.BorderEndStartRadiusProperty<string | number>
      | undefined
    borderImageOutset?:
      | csstype.BorderImageOutsetProperty<string | number>
      | undefined
    borderImageRepeat?: string | undefined
    borderImageSlice?: csstype.BorderImageSliceProperty | undefined
    borderImageSource?: string | undefined
    borderImageWidth?:
      | csstype.BorderImageWidthProperty<string | number>
      | undefined
    borderInlineColor?: string | undefined
    borderInlineEndColor?: string | undefined
    borderInlineEndStyle?: csstype.BorderInlineEndStyleProperty | undefined
    borderInlineEndWidth?:
      | csstype.BorderInlineEndWidthProperty<string | number>
      | undefined
    borderInlineStartColor?: string | undefined
    borderInlineStartStyle?: csstype.BorderInlineStartStyleProperty | undefined
    borderInlineStartWidth?:
      | csstype.BorderInlineStartWidthProperty<string | number>
      | undefined
    borderInlineStyle?: csstype.BorderInlineStyleProperty | undefined
    borderInlineWidth?:
      | csstype.BorderInlineWidthProperty<string | number>
      | undefined
    borderLeftColor?: string | undefined
    borderLeftStyle?: csstype.BorderLeftStyleProperty | undefined
    borderLeftWidth?:
      | csstype.BorderLeftWidthProperty<string | number>
      | undefined
    borderRightColor?: string | undefined
    borderRightStyle?: csstype.BorderRightStyleProperty | undefined
    borderRightWidth?:
      | csstype.BorderRightWidthProperty<string | number>
      | undefined
    borderSpacing?: csstype.BorderSpacingProperty<string | number> | undefined
    borderStartEndRadius?:
      | csstype.BorderStartEndRadiusProperty<string | number>
      | undefined
    borderStartStartRadius?:
      | csstype.BorderStartStartRadiusProperty<string | number>
      | undefined
    borderTopColor?: string | undefined
    borderTopLeftRadius?:
      | csstype.BorderTopLeftRadiusProperty<string | number>
      | undefined
    borderTopRightRadius?:
      | csstype.BorderTopRightRadiusProperty<string | number>
      | undefined
    borderTopStyle?: csstype.BorderTopStyleProperty | undefined
    borderTopWidth?: csstype.BorderTopWidthProperty<string | number> | undefined
    bottom?: csstype.BottomProperty<string | number> | undefined
    boxDecorationBreak?: csstype.BoxDecorationBreakProperty | undefined
    boxShadow?: string | undefined
    boxSizing?: csstype.BoxSizingProperty | undefined
    breakAfter?: csstype.BreakAfterProperty | undefined
    breakBefore?: csstype.BreakBeforeProperty | undefined
    breakInside?: csstype.BreakInsideProperty | undefined
    captionSide?: csstype.CaptionSideProperty | undefined
    caretColor?: string | undefined
    clear?: csstype.ClearProperty | undefined
    clipPath?: string | undefined
    color?: string | undefined
    colorAdjust?: csstype.ColorAdjustProperty | undefined
    colorScheme?: string | undefined
    columnCount?: csstype.ColumnCountProperty | undefined
    columnFill?: csstype.ColumnFillProperty | undefined
    columnGap?: csstype.ColumnGapProperty<string | number> | undefined
    columnRuleColor?: string | undefined
    columnRuleStyle?: string | undefined
    columnRuleWidth?:
      | csstype.ColumnRuleWidthProperty<string | number>
      | undefined
    columnSpan?: csstype.ColumnSpanProperty | undefined
    columnWidth?: csstype.ColumnWidthProperty<string | number> | undefined
    contain?: string | undefined
    content?: string | undefined
    contentVisibility?: csstype.ContentVisibilityProperty | undefined
    counterIncrement?: string | undefined
    counterReset?: string | undefined
    counterSet?: string | undefined
    cursor?: string | undefined
    direction?: csstype.DirectionProperty | undefined
    display?: string | undefined
    emptyCells?: csstype.EmptyCellsProperty | undefined
    filter?: string | undefined
    flexBasis?: csstype.FlexBasisProperty<string | number> | undefined
    flexDirection?: csstype.FlexDirectionProperty | undefined
    flexGrow?: csstype.GlobalsNumber | undefined
    flexShrink?: csstype.GlobalsNumber | undefined
    flexWrap?: csstype.FlexWrapProperty | undefined
    float?: csstype.FloatProperty | undefined
    fontFamily?: string | undefined
    fontFeatureSettings?: string | undefined
    fontKerning?: csstype.FontKerningProperty | undefined
    fontLanguageOverride?: string | undefined
    fontOpticalSizing?: csstype.FontOpticalSizingProperty | undefined
    fontSize?: csstype.FontSizeProperty<string | number> | undefined
    fontSizeAdjust?: csstype.FontSizeAdjustProperty | undefined
    fontSmooth?: csstype.FontSmoothProperty<string | number> | undefined
    fontStretch?: string | undefined
    fontStyle?: string | undefined
    fontSynthesis?: string | undefined
    fontVariant?: string | undefined
    fontVariantCaps?: csstype.FontVariantCapsProperty | undefined
    fontVariantEastAsian?: string | undefined
    fontVariantLigatures?: string | undefined
    fontVariantNumeric?: string | undefined
    fontVariantPosition?: csstype.FontVariantPositionProperty | undefined
    fontVariationSettings?: string | undefined
    fontWeight?: csstype.FontWeightProperty | undefined
    forcedColorAdjust?: csstype.ForcedColorAdjustProperty | undefined
    gridAutoColumns?:
      | csstype.GridAutoColumnsProperty<string | number>
      | undefined
    gridAutoFlow?: string | undefined
    gridAutoRows?: csstype.GridAutoRowsProperty<string | number> | undefined
    gridColumnEnd?: csstype.GridColumnEndProperty | undefined
    gridColumnStart?: csstype.GridColumnStartProperty | undefined
    gridRowEnd?: csstype.GridRowEndProperty | undefined
    gridRowStart?: csstype.GridRowStartProperty | undefined
    gridTemplateAreas?: string | undefined
    gridTemplateColumns?:
      | csstype.GridTemplateColumnsProperty<string | number>
      | undefined
    gridTemplateRows?:
      | csstype.GridTemplateRowsProperty<string | number>
      | undefined
    hangingPunctuation?: string | undefined
    height?: csstype.HeightProperty<string | number> | undefined
    hyphens?: csstype.HyphensProperty | undefined
    imageOrientation?: string | undefined
    imageRendering?: csstype.ImageRenderingProperty | undefined
    imageResolution?: string | undefined
    initialLetter?: csstype.InitialLetterProperty | undefined
    inlineSize?: csstype.InlineSizeProperty<string | number> | undefined
    inset?: csstype.InsetProperty<string | number> | undefined
    insetBlock?: csstype.InsetBlockProperty<string | number> | undefined
    insetBlockEnd?: csstype.InsetBlockEndProperty<string | number> | undefined
    insetBlockStart?:
      | csstype.InsetBlockStartProperty<string | number>
      | undefined
    insetInline?: csstype.InsetInlineProperty<string | number> | undefined
    insetInlineEnd?: csstype.InsetInlineEndProperty<string | number> | undefined
    insetInlineStart?:
      | csstype.InsetInlineStartProperty<string | number>
      | undefined
    isolation?: csstype.IsolationProperty | undefined
    justifyContent?: string | undefined
    justifyItems?: string | undefined
    justifySelf?: string | undefined
    justifyTracks?: string | undefined
    left?: csstype.LeftProperty<string | number> | undefined
    letterSpacing?: csstype.LetterSpacingProperty<string | number> | undefined
    lineBreak?: csstype.LineBreakProperty | undefined
    lineHeight?: csstype.LineHeightProperty<string | number> | undefined
    lineHeightStep?: csstype.LineHeightStepProperty<string | number> | undefined
    listStyleImage?: string | undefined
    listStylePosition?: csstype.ListStylePositionProperty | undefined
    listStyleType?: string | undefined
    marginBlock?: csstype.MarginBlockProperty<string | number> | undefined
    marginBlockEnd?: csstype.MarginBlockEndProperty<string | number> | undefined
    marginBlockStart?:
      | csstype.MarginBlockStartProperty<string | number>
      | undefined
    marginBottom?: csstype.MarginBottomProperty<string | number> | undefined
    marginInline?: csstype.MarginInlineProperty<string | number> | undefined
    marginInlineEnd?:
      | csstype.MarginInlineEndProperty<string | number>
      | undefined
    marginInlineStart?:
      | csstype.MarginInlineStartProperty<string | number>
      | undefined
    marginLeft?: csstype.MarginLeftProperty<string | number> | undefined
    marginRight?: csstype.MarginRightProperty<string | number> | undefined
    marginTop?: csstype.MarginTopProperty<string | number> | undefined
    maskBorderMode?: csstype.MaskBorderModeProperty | undefined
    maskBorderOutset?:
      | csstype.MaskBorderOutsetProperty<string | number>
      | undefined
    maskBorderRepeat?: string | undefined
    maskBorderSlice?: csstype.MaskBorderSliceProperty | undefined
    maskBorderSource?: string | undefined
    maskBorderWidth?:
      | csstype.MaskBorderWidthProperty<string | number>
      | undefined
    maskClip?: string | undefined
    maskComposite?: string | undefined
    maskImage?: string | undefined
    maskMode?: string | undefined
    maskOrigin?: string | undefined
    maskPosition?: csstype.MaskPositionProperty<string | number> | undefined
    maskRepeat?: string | undefined
    maskSize?: csstype.MaskSizeProperty<string | number> | undefined
    maskType?: csstype.MaskTypeProperty | undefined
    mathStyle?: csstype.MathStyleProperty | undefined
    maxBlockSize?: csstype.MaxBlockSizeProperty<string | number> | undefined
    maxHeight?: csstype.MaxHeightProperty<string | number> | undefined
    maxInlineSize?: csstype.MaxInlineSizeProperty<string | number> | undefined
    maxLines?: csstype.MaxLinesProperty | undefined
    maxWidth?: csstype.MaxWidthProperty<string | number> | undefined
    minBlockSize?: csstype.MinBlockSizeProperty<string | number> | undefined
    minHeight?: csstype.MinHeightProperty<string | number> | undefined
    minInlineSize?: csstype.MinInlineSizeProperty<string | number> | undefined
    minWidth?: csstype.MinWidthProperty<string | number> | undefined
    mixBlendMode?: csstype.MixBlendModeProperty | undefined
    motionDistance?: csstype.OffsetDistanceProperty<string | number> | undefined
    motionPath?: string | undefined
    motionRotation?: string | undefined
    objectFit?: csstype.ObjectFitProperty | undefined
    objectPosition?: csstype.ObjectPositionProperty<string | number> | undefined
    offsetAnchor?: csstype.OffsetAnchorProperty<string | number> | undefined
    offsetDistance?: csstype.OffsetDistanceProperty<string | number> | undefined
    offsetPath?: string | undefined
    offsetRotate?: string | undefined
    offsetRotation?: string | undefined
    opacity?: csstype.OpacityProperty | undefined
    order?: csstype.GlobalsNumber | undefined
    orphans?: csstype.GlobalsNumber | undefined
    outlineColor?: string | undefined
    outlineOffset?: csstype.OutlineOffsetProperty<string | number> | undefined
    outlineStyle?: string | undefined
    outlineWidth?: csstype.OutlineWidthProperty<string | number> | undefined
    overflowAnchor?: csstype.OverflowAnchorProperty | undefined
    overflowBlock?: csstype.OverflowBlockProperty | undefined
    overflowClipBox?: csstype.OverflowClipBoxProperty | undefined
    overflowClipMargin?:
      | csstype.OverflowClipMarginProperty<string | number>
      | undefined
    overflowInline?: csstype.OverflowInlineProperty | undefined
    overflowWrap?: csstype.OverflowWrapProperty | undefined
    overflowX?: csstype.OverflowXProperty | undefined
    overflowY?: csstype.OverflowYProperty | undefined
    overscrollBehaviorBlock?:
      | csstype.OverscrollBehaviorBlockProperty
      | undefined
    overscrollBehaviorInline?:
      | csstype.OverscrollBehaviorInlineProperty
      | undefined
    overscrollBehaviorX?: csstype.OverscrollBehaviorXProperty | undefined
    overscrollBehaviorY?: csstype.OverscrollBehaviorYProperty | undefined
    paddingBlock?: csstype.PaddingBlockProperty<string | number> | undefined
    paddingBlockEnd?:
      | csstype.PaddingBlockEndProperty<string | number>
      | undefined
    paddingBlockStart?:
      | csstype.PaddingBlockStartProperty<string | number>
      | undefined
    paddingBottom?: csstype.PaddingBottomProperty<string | number> | undefined
    paddingInline?: csstype.PaddingInlineProperty<string | number> | undefined
    paddingInlineEnd?:
      | csstype.PaddingInlineEndProperty<string | number>
      | undefined
    paddingInlineStart?:
      | csstype.PaddingInlineStartProperty<string | number>
      | undefined
    paddingLeft?: csstype.PaddingLeftProperty<string | number> | undefined
    paddingRight?: csstype.PaddingRightProperty<string | number> | undefined
    paddingTop?: csstype.PaddingTopProperty<string | number> | undefined
    pageBreakAfter?: csstype.PageBreakAfterProperty | undefined
    pageBreakBefore?: csstype.PageBreakBeforeProperty | undefined
    pageBreakInside?: csstype.PageBreakInsideProperty | undefined
    paintOrder?: string | undefined
    perspectiveOrigin?:
      | csstype.PerspectiveOriginProperty<string | number>
      | undefined
    placeContent?: string | undefined
    pointerEvents?: csstype.PointerEventsProperty | undefined
    position?: csstype.PositionProperty | undefined
    quotes?: string | undefined
    resize?: csstype.ResizeProperty | undefined
    right?: csstype.RightProperty<string | number> | undefined
    rowGap?: csstype.RowGapProperty<string | number> | undefined
    rubyAlign?: csstype.RubyAlignProperty | undefined
    rubyMerge?: csstype.RubyMergeProperty | undefined
    rubyPosition?: string | undefined
    scrollBehavior?: csstype.ScrollBehaviorProperty | undefined
    scrollMargin?: csstype.ScrollMarginProperty<string | number> | undefined
    scrollMarginBlock?:
      | csstype.ScrollMarginBlockProperty<string | number>
      | undefined
    scrollMarginBlockEnd?:
      | csstype.ScrollMarginBlockEndProperty<string | number>
      | undefined
    scrollMarginBlockStart?:
      | csstype.ScrollMarginBlockStartProperty<string | number>
      | undefined
    scrollMarginBottom?:
      | csstype.ScrollMarginBottomProperty<string | number>
      | undefined
    scrollMarginInline?:
      | csstype.ScrollMarginInlineProperty<string | number>
      | undefined
    scrollMarginInlineEnd?:
      | csstype.ScrollMarginInlineEndProperty<string | number>
      | undefined
    scrollMarginInlineStart?:
      | csstype.ScrollMarginInlineStartProperty<string | number>
      | undefined
    scrollMarginLeft?:
      | csstype.ScrollMarginLeftProperty<string | number>
      | undefined
    scrollMarginRight?:
      | csstype.ScrollMarginRightProperty<string | number>
      | undefined
    scrollMarginTop?:
      | csstype.ScrollMarginTopProperty<string | number>
      | undefined
    scrollPadding?: csstype.ScrollPaddingProperty<string | number> | undefined
    scrollPaddingBlock?:
      | csstype.ScrollPaddingBlockProperty<string | number>
      | undefined
    scrollPaddingBlockEnd?:
      | csstype.ScrollPaddingBlockEndProperty<string | number>
      | undefined
    scrollPaddingBlockStart?:
      | csstype.ScrollPaddingBlockStartProperty<string | number>
      | undefined
    scrollPaddingBottom?:
      | csstype.ScrollPaddingBottomProperty<string | number>
      | undefined
    scrollPaddingInline?:
      | csstype.ScrollPaddingInlineProperty<string | number>
      | undefined
    scrollPaddingInlineEnd?:
      | csstype.ScrollPaddingInlineEndProperty<string | number>
      | undefined
    scrollPaddingInlineStart?:
      | csstype.ScrollPaddingInlineStartProperty<string | number>
      | undefined
    scrollPaddingLeft?:
      | csstype.ScrollPaddingLeftProperty<string | number>
      | undefined
    scrollPaddingRight?:
      | csstype.ScrollPaddingRightProperty<string | number>
      | undefined
    scrollPaddingTop?:
      | csstype.ScrollPaddingTopProperty<string | number>
      | undefined
    scrollSnapAlign?: string | undefined
    scrollSnapMargin?: csstype.ScrollMarginProperty<string | number> | undefined
    scrollSnapMarginBottom?:
      | csstype.ScrollMarginBottomProperty<string | number>
      | undefined
    scrollSnapMarginLeft?:
      | csstype.ScrollMarginLeftProperty<string | number>
      | undefined
    scrollSnapMarginRight?:
      | csstype.ScrollMarginRightProperty<string | number>
      | undefined
    scrollSnapMarginTop?:
      | csstype.ScrollMarginTopProperty<string | number>
      | undefined
    scrollSnapStop?: csstype.ScrollSnapStopProperty | undefined
    scrollSnapType?: string | undefined
    scrollbarColor?: string | undefined
    scrollbarGutter?: string | undefined
    scrollbarWidth?: csstype.ScrollbarWidthProperty | undefined
    shapeImageThreshold?: csstype.ShapeImageThresholdProperty | undefined
    shapeMargin?: csstype.ShapeMarginProperty<string | number> | undefined
    shapeOutside?: string | undefined
    tabSize?: csstype.TabSizeProperty<string | number> | undefined
    tableLayout?: csstype.TableLayoutProperty | undefined
    textAlign?: csstype.TextAlignProperty | undefined
    textAlignLast?: csstype.TextAlignLastProperty | undefined
    textCombineUpright?: string | undefined
    textDecorationColor?: string | undefined
    textDecorationLine?: string | undefined
    textDecorationSkip?: string | undefined
    textDecorationSkipInk?: csstype.TextDecorationSkipInkProperty | undefined
    textDecorationStyle?: csstype.TextDecorationStyleProperty | undefined
    textDecorationThickness?:
      | csstype.TextDecorationThicknessProperty<string | number>
      | undefined
    textDecorationWidth?:
      | csstype.TextDecorationThicknessProperty<string | number>
      | undefined
    textEmphasisColor?: string | undefined
    textEmphasisPosition?: string | undefined
    textEmphasisStyle?: string | undefined
    textIndent?: csstype.TextIndentProperty<string | number> | undefined
    textJustify?: csstype.TextJustifyProperty | undefined
    textOrientation?: csstype.TextOrientationProperty | undefined
    textOverflow?: string | undefined
    textRendering?: csstype.TextRenderingProperty | undefined
    textShadow?: string | undefined
    textSizeAdjust?: string | undefined
    textTransform?: csstype.TextTransformProperty | undefined
    textUnderlineOffset?:
      | csstype.TextUnderlineOffsetProperty<string | number>
      | undefined
    textUnderlinePosition?: string | undefined
    top?: csstype.TopProperty<string | number> | undefined
    touchAction?: string | undefined
    transitionDelay?: string | undefined
    transitionDuration?: string | undefined
    transitionProperty?: string | undefined
    transitionTimingFunction?: string | undefined
    translate?: csstype.TranslateProperty<string | number> | undefined
    unicodeBidi?: csstype.UnicodeBidiProperty | undefined
    userSelect?: csstype.UserSelectProperty | undefined
    verticalAlign?: csstype.VerticalAlignProperty<string | number> | undefined
    visibility?: csstype.VisibilityProperty | undefined
    whiteSpace?: csstype.WhiteSpaceProperty | undefined
    widows?: csstype.GlobalsNumber | undefined
    width?: csstype.WidthProperty<string | number> | undefined
    willChange?: string | undefined
    wordBreak?: csstype.WordBreakProperty | undefined
    wordSpacing?: csstype.WordSpacingProperty<string | number> | undefined
    wordWrap?: csstype.WordWrapProperty | undefined
    writingMode?: csstype.WritingModeProperty | undefined
    zIndex?: csstype.ZIndexProperty | undefined
    zoom?: csstype.ZoomProperty | undefined
    all?: csstype.Globals | undefined
    animation?: csstype.AnimationProperty | undefined
    background?: csstype.BackgroundProperty<string | number> | undefined
    backgroundPosition?:
      | csstype.BackgroundPositionProperty<string | number>
      | undefined
    border?: csstype.BorderProperty<string | number> | undefined
    borderBlock?: csstype.BorderBlockProperty<string | number> | undefined
    borderBlockEnd?: csstype.BorderBlockEndProperty<string | number> | undefined
    borderBlockStart?:
      | csstype.BorderBlockStartProperty<string | number>
      | undefined
    borderBottom?: csstype.BorderBottomProperty<string | number> | undefined
    borderColor?: string | undefined
    borderImage?: csstype.BorderImageProperty | undefined
    borderInline?: csstype.BorderInlineProperty<string | number> | undefined
    borderInlineEnd?:
      | csstype.BorderInlineEndProperty<string | number>
      | undefined
    borderInlineStart?:
      | csstype.BorderInlineStartProperty<string | number>
      | undefined
    borderLeft?: csstype.BorderLeftProperty<string | number> | undefined
    borderRadius?: csstype.BorderRadiusProperty<string | number> | undefined
    borderRight?: csstype.BorderRightProperty<string | number> | undefined
    borderStyle?: string | undefined
    borderTop?: csstype.BorderTopProperty<string | number> | undefined
    borderWidth?: csstype.BorderWidthProperty<string | number> | undefined
    columnRule?: csstype.ColumnRuleProperty<string | number> | undefined
    columns?: csstype.ColumnsProperty<string | number> | undefined
    flex?: csstype.FlexProperty<string | number> | undefined
    flexFlow?: string | undefined
    font?: string | undefined
    gap?: csstype.GapProperty<string | number> | undefined
    grid?: string | undefined
    gridArea?: csstype.GridAreaProperty | undefined
    gridColumn?: csstype.GridColumnProperty | undefined
    gridRow?: csstype.GridRowProperty | undefined
    gridTemplate?: string | undefined
    lineClamp?: csstype.LineClampProperty | undefined
    listStyle?: string | undefined
    margin?: csstype.MarginProperty<string | number> | undefined
    mask?: csstype.MaskProperty<string | number> | undefined
    maskBorder?: csstype.MaskBorderProperty | undefined
    motion?: csstype.OffsetProperty<string | number> | undefined
    offset?: csstype.OffsetProperty<string | number> | undefined
    outline?: csstype.OutlineProperty<string | number> | undefined
    overflow?: string | undefined
    overscrollBehavior?: string | undefined
    padding?: csstype.PaddingProperty<string | number> | undefined
    placeItems?: string | undefined
    placeSelf?: string | undefined
    textDecoration?: csstype.TextDecorationProperty<string | number> | undefined
    textEmphasis?: string | undefined
    MozAnimationDelay?: string | undefined
    MozAnimationDirection?: string | undefined
    MozAnimationDuration?: string | undefined
    MozAnimationFillMode?: string | undefined
    MozAnimationIterationCount?:
      | csstype.AnimationIterationCountProperty
      | undefined
    MozAnimationName?: string | undefined
    MozAnimationPlayState?: string | undefined
    MozAnimationTimingFunction?: string | undefined
    MozAppearance?: csstype.MozAppearanceProperty | undefined
    MozBackfaceVisibility?: csstype.BackfaceVisibilityProperty | undefined
    MozBorderBottomColors?: string | undefined
    MozBorderEndColor?: string | undefined
    MozBorderEndStyle?: csstype.BorderInlineEndStyleProperty | undefined
    MozBorderEndWidth?:
      | csstype.BorderInlineEndWidthProperty<string | number>
      | undefined
    MozBorderLeftColors?: string | undefined
    MozBorderRightColors?: string | undefined
    MozBorderStartColor?: string | undefined
    MozBorderStartStyle?: csstype.BorderInlineStartStyleProperty | undefined
    MozBorderTopColors?: string | undefined
    MozBoxSizing?: csstype.BoxSizingProperty | undefined
    MozColumnCount?: csstype.ColumnCountProperty | undefined
    MozColumnFill?: csstype.ColumnFillProperty | undefined
    MozColumnGap?: csstype.ColumnGapProperty<string | number> | undefined
    MozColumnRuleColor?: string | undefined
    MozColumnRuleStyle?: string | undefined
    MozColumnRuleWidth?:
      | csstype.ColumnRuleWidthProperty<string | number>
      | undefined
    MozColumnWidth?: csstype.ColumnWidthProperty<string | number> | undefined
    MozContextProperties?: string | undefined
    MozFontFeatureSettings?: string | undefined
    MozFontLanguageOverride?: string | undefined
    MozHyphens?: csstype.HyphensProperty | undefined
    MozImageRegion?: string | undefined
    MozMarginEnd?: csstype.MarginInlineEndProperty<string | number> | undefined
    MozMarginStart?:
      | csstype.MarginInlineStartProperty<string | number>
      | undefined
    MozOrient?: csstype.MozOrientProperty | undefined
    MozOsxFontSmoothing?:
      | csstype.FontSmoothProperty<string | number>
      | undefined
    MozPaddingEnd?:
      | csstype.PaddingInlineEndProperty<string | number>
      | undefined
    MozPaddingStart?:
      | csstype.PaddingInlineStartProperty<string | number>
      | undefined
    MozPerspective?: csstype.PerspectiveProperty<string | number> | undefined
    MozPerspectiveOrigin?:
      | csstype.PerspectiveOriginProperty<string | number>
      | undefined
    MozStackSizing?: csstype.MozStackSizingProperty | undefined
    MozTabSize?: csstype.TabSizeProperty<string | number> | undefined
    MozTextBlink?: csstype.MozTextBlinkProperty | undefined
    MozTextSizeAdjust?: string | undefined
    MozTransformOrigin?:
      | csstype.TransformOriginProperty<string | number>
      | undefined
    MozTransformStyle?: csstype.TransformStyleProperty | undefined
    MozTransitionDelay?: string | undefined
    MozTransitionDuration?: string | undefined
    MozTransitionProperty?: string | undefined
    MozTransitionTimingFunction?: string | undefined
    MozUserFocus?: csstype.MozUserFocusProperty | undefined
    MozUserModify?: csstype.MozUserModifyProperty | undefined
    MozUserSelect?: csstype.UserSelectProperty | undefined
    MozWindowDragging?: csstype.MozWindowDraggingProperty | undefined
    MozWindowShadow?: csstype.MozWindowShadowProperty | undefined
    msAccelerator?: csstype.MsAcceleratorProperty | undefined
    msAlignSelf?: string | undefined
    msBlockProgression?: csstype.MsBlockProgressionProperty | undefined
    msContentZoomChaining?: csstype.MsContentZoomChainingProperty | undefined
    msContentZoomLimitMax?: string | undefined
    msContentZoomLimitMin?: string | undefined
    msContentZoomSnapPoints?: string | undefined
    msContentZoomSnapType?: csstype.MsContentZoomSnapTypeProperty | undefined
    msContentZooming?: csstype.MsContentZoomingProperty | undefined
    msFilter?: string | undefined
    msFlexDirection?: csstype.FlexDirectionProperty | undefined
    msFlexPositive?: csstype.GlobalsNumber | undefined
    msFlowFrom?: string | undefined
    msFlowInto?: string | undefined
    msGridColumns?: csstype.MsGridColumnsProperty<string | number> | undefined
    msGridRows?: csstype.MsGridRowsProperty<string | number> | undefined
    msHighContrastAdjust?: csstype.MsHighContrastAdjustProperty | undefined
    msHyphenateLimitChars?: csstype.MsHyphenateLimitCharsProperty | undefined
    msHyphenateLimitLines?: csstype.MsHyphenateLimitLinesProperty | undefined
    msHyphenateLimitZone?:
      | csstype.MsHyphenateLimitZoneProperty<string | number>
      | undefined
    msHyphens?: csstype.HyphensProperty | undefined
    msImeAlign?: csstype.MsImeAlignProperty | undefined
    msJustifySelf?: string | undefined
    msLineBreak?: csstype.LineBreakProperty | undefined
    msOrder?: csstype.GlobalsNumber | undefined
    msOverflowStyle?: csstype.MsOverflowStyleProperty | undefined
    msOverflowX?: csstype.OverflowXProperty | undefined
    msOverflowY?: csstype.OverflowYProperty | undefined
    msScrollChaining?: csstype.MsScrollChainingProperty | undefined
    msScrollLimitXMax?:
      | csstype.MsScrollLimitXMaxProperty<string | number>
      | undefined
    msScrollLimitXMin?:
      | csstype.MsScrollLimitXMinProperty<string | number>
      | undefined
    msScrollLimitYMax?:
      | csstype.MsScrollLimitYMaxProperty<string | number>
      | undefined
    msScrollLimitYMin?:
      | csstype.MsScrollLimitYMinProperty<string | number>
      | undefined
    msScrollRails?: csstype.MsScrollRailsProperty | undefined
    msScrollSnapPointsX?: string | undefined
    msScrollSnapPointsY?: string | undefined
    msScrollSnapType?: csstype.MsScrollSnapTypeProperty | undefined
    msScrollTranslation?: csstype.MsScrollTranslationProperty | undefined
    msScrollbar3dlightColor?: string | undefined
    msScrollbarArrowColor?: string | undefined
    msScrollbarBaseColor?: string | undefined
    msScrollbarDarkshadowColor?: string | undefined
    msScrollbarFaceColor?: string | undefined
    msScrollbarHighlightColor?: string | undefined
    msScrollbarShadowColor?: string | undefined
    msTextAutospace?: csstype.MsTextAutospaceProperty | undefined
    msTextCombineHorizontal?: string | undefined
    msTextOverflow?: string | undefined
    msTouchAction?: string | undefined
    msTouchSelect?: csstype.MsTouchSelectProperty | undefined
    msTransform?: string | undefined
    msTransformOrigin?:
      | csstype.TransformOriginProperty<string | number>
      | undefined
    msTransitionDelay?: string | undefined
    msTransitionDuration?: string | undefined
    msTransitionProperty?: string | undefined
    msTransitionTimingFunction?: string | undefined
    msUserSelect?: csstype.MsUserSelectProperty | undefined
    msWordBreak?: csstype.WordBreakProperty | undefined
    msWrapFlow?: csstype.MsWrapFlowProperty | undefined
    msWrapMargin?: csstype.MsWrapMarginProperty<string | number> | undefined
    msWrapThrough?: csstype.MsWrapThroughProperty | undefined
    msWritingMode?: csstype.WritingModeProperty | undefined
    WebkitAlignContent?: string | undefined
    WebkitAlignItems?: string | undefined
    WebkitAlignSelf?: string | undefined
    WebkitAnimationDelay?: string | undefined
    WebkitAnimationDirection?: string | undefined
    WebkitAnimationDuration?: string | undefined
    WebkitAnimationFillMode?: string | undefined
    WebkitAnimationIterationCount?:
      | csstype.AnimationIterationCountProperty
      | undefined
    WebkitAnimationName?: string | undefined
    WebkitAnimationPlayState?: string | undefined
    WebkitAnimationTimingFunction?: string | undefined
    WebkitAppearance?: csstype.WebkitAppearanceProperty | undefined
    WebkitBackdropFilter?: string | undefined
    WebkitBackfaceVisibility?: csstype.BackfaceVisibilityProperty | undefined
    WebkitBackgroundClip?: string | undefined
    WebkitBackgroundOrigin?: string | undefined
    WebkitBackgroundSize?:
      | csstype.BackgroundSizeProperty<string | number>
      | undefined
    WebkitBorderBeforeColor?: string | undefined
    WebkitBorderBeforeStyle?: string | undefined
    WebkitBorderBeforeWidth?:
      | csstype.WebkitBorderBeforeWidthProperty<string | number>
      | undefined
    WebkitBorderBottomLeftRadius?:
      | csstype.BorderBottomLeftRadiusProperty<string | number>
      | undefined
    WebkitBorderBottomRightRadius?:
      | csstype.BorderBottomRightRadiusProperty<string | number>
      | undefined
    WebkitBorderImageSlice?: csstype.BorderImageSliceProperty | undefined
    WebkitBorderTopLeftRadius?:
      | csstype.BorderTopLeftRadiusProperty<string | number>
      | undefined
    WebkitBorderTopRightRadius?:
      | csstype.BorderTopRightRadiusProperty<string | number>
      | undefined
    WebkitBoxDecorationBreak?: csstype.BoxDecorationBreakProperty | undefined
    WebkitBoxReflect?:
      | csstype.WebkitBoxReflectProperty<string | number>
      | undefined
    WebkitBoxShadow?: string | undefined
    WebkitBoxSizing?: csstype.BoxSizingProperty | undefined
    WebkitClipPath?: string | undefined
    WebkitColumnCount?: csstype.ColumnCountProperty | undefined
    WebkitColumnFill?: csstype.ColumnFillProperty | undefined
    WebkitColumnGap?: csstype.ColumnGapProperty<string | number> | undefined
    WebkitColumnRuleColor?: string | undefined
    WebkitColumnRuleStyle?: string | undefined
    WebkitColumnRuleWidth?:
      | csstype.ColumnRuleWidthProperty<string | number>
      | undefined
    WebkitColumnSpan?: csstype.ColumnSpanProperty | undefined
    WebkitColumnWidth?: csstype.ColumnWidthProperty<string | number> | undefined
    WebkitFilter?: string | undefined
    WebkitFlexBasis?: csstype.FlexBasisProperty<string | number> | undefined
    WebkitFlexDirection?: csstype.FlexDirectionProperty | undefined
    WebkitFlexGrow?: csstype.GlobalsNumber | undefined
    WebkitFlexShrink?: csstype.GlobalsNumber | undefined
    WebkitFlexWrap?: csstype.FlexWrapProperty | undefined
    WebkitFontFeatureSettings?: string | undefined
    WebkitFontKerning?: csstype.FontKerningProperty | undefined
    WebkitFontSmoothing?:
      | csstype.FontSmoothProperty<string | number>
      | undefined
    WebkitFontVariantLigatures?: string | undefined
    WebkitHyphens?: csstype.HyphensProperty | undefined
    WebkitJustifyContent?: string | undefined
    WebkitLineBreak?: csstype.LineBreakProperty | undefined
    WebkitLineClamp?: csstype.WebkitLineClampProperty | undefined
    WebkitMarginEnd?:
      | csstype.MarginInlineEndProperty<string | number>
      | undefined
    WebkitMarginStart?:
      | csstype.MarginInlineStartProperty<string | number>
      | undefined
    WebkitMaskAttachment?: string | undefined
    WebkitMaskBoxImageOutset?:
      | csstype.MaskBorderOutsetProperty<string | number>
      | undefined
    WebkitMaskBoxImageRepeat?: string | undefined
    WebkitMaskBoxImageSlice?: csstype.MaskBorderSliceProperty | undefined
    WebkitMaskBoxImageSource?: string | undefined
    WebkitMaskBoxImageWidth?:
      | csstype.MaskBorderWidthProperty<string | number>
      | undefined
    WebkitMaskClip?: string | undefined
    WebkitMaskComposite?: string | undefined
    WebkitMaskImage?: string | undefined
    WebkitMaskOrigin?: string | undefined
    WebkitMaskPosition?:
      | csstype.WebkitMaskPositionProperty<string | number>
      | undefined
    WebkitMaskPositionX?:
      | csstype.WebkitMaskPositionXProperty<string | number>
      | undefined
    WebkitMaskPositionY?:
      | csstype.WebkitMaskPositionYProperty<string | number>
      | undefined
    WebkitMaskRepeat?: string | undefined
    WebkitMaskRepeatX?: csstype.WebkitMaskRepeatXProperty | undefined
    WebkitMaskRepeatY?: csstype.WebkitMaskRepeatYProperty | undefined
    WebkitMaskSize?: csstype.WebkitMaskSizeProperty<string | number> | undefined
    WebkitMaxInlineSize?:
      | csstype.MaxInlineSizeProperty<string | number>
      | undefined
    WebkitOrder?: csstype.GlobalsNumber | undefined
    WebkitOverflowScrolling?:
      | csstype.WebkitOverflowScrollingProperty
      | undefined
    WebkitPaddingEnd?:
      | csstype.PaddingInlineEndProperty<string | number>
      | undefined
    WebkitPaddingStart?:
      | csstype.PaddingInlineStartProperty<string | number>
      | undefined
    WebkitPerspective?: csstype.PerspectiveProperty<string | number> | undefined
    WebkitPerspectiveOrigin?:
      | csstype.PerspectiveOriginProperty<string | number>
      | undefined
    WebkitPrintColorAdjust?: csstype.ColorAdjustProperty | undefined
    WebkitRubyPosition?: string | undefined
    WebkitScrollSnapType?: string | undefined
    WebkitShapeMargin?: csstype.ShapeMarginProperty<string | number> | undefined
    WebkitTapHighlightColor?: string | undefined
    WebkitTextCombine?: string | undefined
    WebkitTextDecorationColor?: string | undefined
    WebkitTextDecorationLine?: string | undefined
    WebkitTextDecorationSkip?: string | undefined
    WebkitTextDecorationStyle?: csstype.TextDecorationStyleProperty | undefined
    WebkitTextEmphasisColor?: string | undefined
    WebkitTextEmphasisPosition?: string | undefined
    WebkitTextEmphasisStyle?: string | undefined
    WebkitTextFillColor?: string | undefined
    WebkitTextOrientation?: csstype.TextOrientationProperty | undefined
    WebkitTextSizeAdjust?: string | undefined
    WebkitTextStrokeColor?: string | undefined
    WebkitTextStrokeWidth?:
      | csstype.WebkitTextStrokeWidthProperty<string | number>
      | undefined
    WebkitTextUnderlinePosition?: string | undefined
    WebkitTouchCallout?: csstype.WebkitTouchCalloutProperty | undefined
    WebkitTransform?: string | undefined
    WebkitTransformOrigin?:
      | csstype.TransformOriginProperty<string | number>
      | undefined
    WebkitTransformStyle?: csstype.TransformStyleProperty | undefined
    WebkitTransitionDelay?: string | undefined
    WebkitTransitionDuration?: string | undefined
    WebkitTransitionProperty?: string | undefined
    WebkitTransitionTimingFunction?: string | undefined
    WebkitUserModify?: csstype.WebkitUserModifyProperty | undefined
    WebkitUserSelect?: csstype.UserSelectProperty | undefined
    WebkitWritingMode?: csstype.WritingModeProperty | undefined
    MozAnimation?: csstype.AnimationProperty | undefined
    MozBorderImage?: csstype.BorderImageProperty | undefined
    MozColumnRule?: csstype.ColumnRuleProperty<string | number> | undefined
    MozColumns?: csstype.ColumnsProperty<string | number> | undefined
    MozTransition?: string | undefined
    msContentZoomLimit?: string | undefined
    msContentZoomSnap?: string | undefined
    msFlex?: csstype.FlexProperty<string | number> | undefined
    msScrollLimit?: string | undefined
    msScrollSnapX?: string | undefined
    msScrollSnapY?: string | undefined
    msTransition?: string | undefined
    WebkitAnimation?: csstype.AnimationProperty | undefined
    WebkitBorderBefore?:
      | csstype.WebkitBorderBeforeProperty<string | number>
      | undefined
    WebkitBorderImage?: csstype.BorderImageProperty | undefined
    WebkitBorderRadius?:
      | csstype.BorderRadiusProperty<string | number>
      | undefined
    WebkitColumnRule?: csstype.ColumnRuleProperty<string | number> | undefined
    WebkitColumns?: csstype.ColumnsProperty<string | number> | undefined
    WebkitFlex?: csstype.FlexProperty<string | number> | undefined
    WebkitFlexFlow?: string | undefined
    WebkitMask?: csstype.WebkitMaskProperty<string | number> | undefined
    WebkitMaskBoxImage?: csstype.MaskBorderProperty | undefined
    WebkitTextEmphasis?: string | undefined
    WebkitTextStroke?:
      | csstype.WebkitTextStrokeProperty<string | number>
      | undefined
    WebkitTransition?: string | undefined
    azimuth?: string | undefined
    boxAlign?: csstype.BoxAlignProperty | undefined
    boxDirection?: csstype.BoxDirectionProperty | undefined
    boxFlex?: csstype.GlobalsNumber | undefined
    boxFlexGroup?: csstype.GlobalsNumber | undefined
    boxLines?: csstype.BoxLinesProperty | undefined
    boxOrdinalGroup?: csstype.GlobalsNumber | undefined
    boxOrient?: csstype.BoxOrientProperty | undefined
    boxPack?: csstype.BoxPackProperty | undefined
    clip?: string | undefined
    fontVariantAlternates?: string | undefined
    gridColumnGap?: csstype.GridColumnGapProperty<string | number> | undefined
    gridGap?: csstype.GridGapProperty<string | number> | undefined
    gridRowGap?: csstype.GridRowGapProperty<string | number> | undefined
    imeMode?: csstype.ImeModeProperty | undefined
    offsetBlock?: csstype.InsetBlockProperty<string | number> | undefined
    offsetBlockEnd?: csstype.InsetBlockEndProperty<string | number> | undefined
    offsetBlockStart?:
      | csstype.InsetBlockStartProperty<string | number>
      | undefined
    offsetInline?: csstype.InsetInlineProperty<string | number> | undefined
    offsetInlineEnd?:
      | csstype.InsetInlineEndProperty<string | number>
      | undefined
    offsetInlineStart?:
      | csstype.InsetInlineStartProperty<string | number>
      | undefined
    scrollSnapCoordinate?:
      | csstype.ScrollSnapCoordinateProperty<string | number>
      | undefined
    scrollSnapDestination?:
      | csstype.ScrollSnapDestinationProperty<string | number>
      | undefined
    scrollSnapPointsX?: string | undefined
    scrollSnapPointsY?: string | undefined
    scrollSnapTypeX?: csstype.ScrollSnapTypeXProperty | undefined
    scrollSnapTypeY?: csstype.ScrollSnapTypeYProperty | undefined
    scrollbarTrackColor?: string | undefined
    KhtmlBoxAlign?: csstype.BoxAlignProperty | undefined
    KhtmlBoxDirection?: csstype.BoxDirectionProperty | undefined
    KhtmlBoxFlex?: csstype.GlobalsNumber | undefined
    KhtmlBoxFlexGroup?: csstype.GlobalsNumber | undefined
    KhtmlBoxLines?: csstype.BoxLinesProperty | undefined
    KhtmlBoxOrdinalGroup?: csstype.GlobalsNumber | undefined
    KhtmlBoxOrient?: csstype.BoxOrientProperty | undefined
    KhtmlBoxPack?: csstype.BoxPackProperty | undefined
    KhtmlLineBreak?: csstype.LineBreakProperty | undefined
    KhtmlOpacity?: csstype.OpacityProperty | undefined
    KhtmlUserSelect?: csstype.UserSelectProperty | undefined
    MozBackgroundClip?: string | undefined
    MozBackgroundInlinePolicy?: csstype.BoxDecorationBreakProperty | undefined
    MozBackgroundOrigin?: string | undefined
    MozBackgroundSize?:
      | csstype.BackgroundSizeProperty<string | number>
      | undefined
    MozBinding?: string | undefined
    MozBorderRadius?: csstype.BorderRadiusProperty<string | number> | undefined
    MozBorderRadiusBottomleft?:
      | csstype.BorderBottomLeftRadiusProperty<string | number>
      | undefined
    MozBorderRadiusBottomright?:
      | csstype.BorderBottomRightRadiusProperty<string | number>
      | undefined
    MozBorderRadiusTopleft?:
      | csstype.BorderTopLeftRadiusProperty<string | number>
      | undefined
    MozBorderRadiusTopright?:
      | csstype.BorderTopRightRadiusProperty<string | number>
      | undefined
    MozBoxAlign?: csstype.BoxAlignProperty | undefined
    MozBoxDirection?: csstype.BoxDirectionProperty | undefined
    MozBoxFlex?: csstype.GlobalsNumber | undefined
    MozBoxOrdinalGroup?: csstype.GlobalsNumber | undefined
    MozBoxOrient?: csstype.BoxOrientProperty | undefined
    MozBoxPack?: csstype.BoxPackProperty | undefined
    MozBoxShadow?: string | undefined
    MozFloatEdge?: csstype.MozFloatEdgeProperty | undefined
    MozForceBrokenImageIcon?: csstype.GlobalsNumber | undefined
    MozOpacity?: csstype.OpacityProperty | undefined
    MozOutline?: csstype.OutlineProperty<string | number> | undefined
    MozOutlineColor?: string | undefined
    MozOutlineRadius?:
      | csstype.MozOutlineRadiusProperty<string | number>
      | undefined
    MozOutlineRadiusBottomleft?:
      | csstype.MozOutlineRadiusBottomleftProperty<string | number>
      | undefined
    MozOutlineRadiusBottomright?:
      | csstype.MozOutlineRadiusBottomrightProperty<string | number>
      | undefined
    MozOutlineRadiusTopleft?:
      | csstype.MozOutlineRadiusTopleftProperty<string | number>
      | undefined
    MozOutlineRadiusTopright?:
      | csstype.MozOutlineRadiusToprightProperty<string | number>
      | undefined
    MozOutlineStyle?: string | undefined
    MozOutlineWidth?: csstype.OutlineWidthProperty<string | number> | undefined
    MozTextAlignLast?: csstype.TextAlignLastProperty | undefined
    MozTextDecorationColor?: string | undefined
    MozTextDecorationLine?: string | undefined
    MozTextDecorationStyle?: csstype.TextDecorationStyleProperty | undefined
    MozUserInput?: csstype.MozUserInputProperty | undefined
    msImeMode?: csstype.ImeModeProperty | undefined
    msScrollbarTrackColor?: string | undefined
    OAnimation?: csstype.AnimationProperty | undefined
    OAnimationDelay?: string | undefined
    OAnimationDirection?: string | undefined
    OAnimationDuration?: string | undefined
    OAnimationFillMode?: string | undefined
    OAnimationIterationCount?:
      | csstype.AnimationIterationCountProperty
      | undefined
    OAnimationName?: string | undefined
    OAnimationPlayState?: string | undefined
    OAnimationTimingFunction?: string | undefined
    OBackgroundSize?:
      | csstype.BackgroundSizeProperty<string | number>
      | undefined
    OBorderImage?: csstype.BorderImageProperty | undefined
    OObjectFit?: csstype.ObjectFitProperty | undefined
    OObjectPosition?:
      | csstype.ObjectPositionProperty<string | number>
      | undefined
    OTabSize?: csstype.TabSizeProperty<string | number> | undefined
    OTextOverflow?: string | undefined
    OTransform?: string | undefined
    OTransformOrigin?:
      | csstype.TransformOriginProperty<string | number>
      | undefined
    OTransition?: string | undefined
    OTransitionDelay?: string | undefined
    OTransitionDuration?: string | undefined
    OTransitionProperty?: string | undefined
    OTransitionTimingFunction?: string | undefined
    WebkitBoxAlign?: csstype.BoxAlignProperty | undefined
    WebkitBoxDirection?: csstype.BoxDirectionProperty | undefined
    WebkitBoxFlex?: csstype.GlobalsNumber | undefined
    WebkitBoxFlexGroup?: csstype.GlobalsNumber | undefined
    WebkitBoxLines?: csstype.BoxLinesProperty | undefined
    WebkitBoxOrdinalGroup?: csstype.GlobalsNumber | undefined
    WebkitBoxOrient?: csstype.BoxOrientProperty | undefined
    WebkitBoxPack?: csstype.BoxPackProperty | undefined
    WebkitScrollSnapPointsX?: string | undefined
    WebkitScrollSnapPointsY?: string | undefined
    alignmentBaseline?: csstype.AlignmentBaselineProperty | undefined
    baselineShift?: csstype.BaselineShiftProperty<string | number> | undefined
    clipRule?: csstype.ClipRuleProperty | undefined
    colorInterpolation?: csstype.ColorInterpolationProperty | undefined
    colorRendering?: csstype.ColorRenderingProperty | undefined
    dominantBaseline?: csstype.DominantBaselineProperty | undefined
    fill?: string | undefined
    fillOpacity?: csstype.GlobalsNumber | undefined
    fillRule?: csstype.FillRuleProperty | undefined
    floodColor?: string | undefined
    floodOpacity?: csstype.GlobalsNumber | undefined
    glyphOrientationVertical?:
      | csstype.GlyphOrientationVerticalProperty
      | undefined
    lightingColor?: string | undefined
    marker?: string | undefined
    markerEnd?: string | undefined
    markerMid?: string | undefined
    markerStart?: string | undefined
    shapeRendering?: csstype.ShapeRenderingProperty | undefined
    stopColor?: string | undefined
    stopOpacity?: csstype.GlobalsNumber | undefined
    stroke?: string | undefined
    strokeDasharray?:
      | csstype.StrokeDasharrayProperty<string | number>
      | undefined
    strokeDashoffset?:
      | csstype.StrokeDashoffsetProperty<string | number>
      | undefined
    strokeLinecap?: csstype.StrokeLinecapProperty | undefined
    strokeLinejoin?: csstype.StrokeLinejoinProperty | undefined
    strokeMiterlimit?: csstype.GlobalsNumber | undefined
    strokeOpacity?: csstype.GlobalsNumber | undefined
    strokeWidth?: csstype.StrokeWidthProperty<string | number> | undefined
    textAnchor?: csstype.TextAnchorProperty | undefined
    vectorEffect?: csstype.VectorEffectProperty | undefined
  }
  transform: {
    x?: string | number | undefined
    y?: string | number | undefined
    z?: string | number | undefined
    translateX?: string | number | undefined
    translateY?: string | number | undefined
    translateZ?: string | number | undefined
    rotate?: string | number | undefined
    rotateX?: string | number | undefined
    rotateY?: string | number | undefined
    rotateZ?: string | number | undefined
    scale?: string | number | undefined
    scaleX?: string | number | undefined
    scaleY?: string | number | undefined
    scaleZ?: string | number | undefined
    skew?: string | number | undefined
    skewX?: string | number | undefined
    skewY?: string | number | undefined
    originX?: string | number | undefined
    originY?: string | number | undefined
    originZ?: string | number | undefined
    perspective?: string | number | undefined
    transformPerspective?: string | number | undefined
  }
  stop: () => void
}

declare function useMotions(): MotionInstanceBindings<MotionVariants>

/**
 * A Composable holding all the ongoing transitions in a local reference.
 */
declare function useMotionTransitions(): MotionTransitions

/**
 * A Composable handling variants selection and features.
 *
 * @param variants
 * @param initial
 * @param options
 */
declare function useMotionVariants<T extends MotionVariants>(
  variants?: MaybeRef<T>,
): {
  state: vue_demi.ComputedRef<Variant | undefined>
  variant: Ref<keyof T>
}

declare type UseSpringOptions = Partial<Spring> & {
  target?: MaybeRef$1<PermissiveTarget>
}
declare function useSpring(
  values: Partial<PermissiveMotionProperties>,
  spring?: UseSpringOptions,
): SpringControls

/**
 * Check whether an object is a Motion Instance or not.
 *
 * Can be useful while building packages based on @vueuse/motion.
 *
 * @param obj
 * @returns bool
 */
declare function isMotionInstance(obj: any): obj is MotionInstance

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
declare function slugify(string: string): string

/**
 * Reactive prefers-reduced-motion.
 *
 * @param options
 */
declare function useReducedMotion(options?: { window?: Window }): Ref<boolean>

export {
  CustomValueType,
  Easing,
  EasingFunction,
  Inertia,
  Keyframes,
  KeyframesTarget,
  MakeCustomValueType,
  MakeKeyframes,
  MotionControls,
  directive as MotionDirective,
  MotionInstance,
  MotionInstanceBindings,
  MotionPlugin,
  MotionPluginOptions,
  MotionProperties,
  MotionTarget,
  MotionTransitions,
  MotionValuesMap,
  MotionVariants,
  Omit,
  Orchestration,
  PassiveEffect,
  PermissiveMotionProperties,
  PermissiveTarget,
  PermissiveTransitionDefinition,
  PopmotionTransitionProps,
  PropertiesKeys,
  Props,
  Repeat,
  ResolvedKeyframesTarget,
  ResolvedSingleTarget,
  ResolvedValueTarget,
  SVGPathProperties,
  SingleTarget,
  Spring,
  SpringControls,
  StartAnimation,
  StopAnimation,
  StyleProperties,
  Subscriber,
  Target,
  TargetAndTransition,
  TargetResolver,
  TargetWithKeyframes,
  TransformProperties,
  Transformer,
  Transition,
  TransitionDefinition,
  TransitionMap,
  Tween,
  UseMotionOptions,
  ValueTarget,
  Variant,
  fade,
  fadeVisible,
  isMotionInstance,
  pop,
  popVisible,
  reactiveStyle,
  reactiveTransform,
  rollBottom,
  rollLeft,
  rollRight,
  rollTop,
  rollVisibleBottom,
  rollVisibleLeft,
  rollVisibleRight,
  rollVisibleTop,
  slideBottom,
  slideLeft,
  slideRight,
  slideTop,
  slideVisibleBottom,
  slideVisibleLeft,
  slideVisibleRight,
  slideVisibleTop,
  slugify,
  useElementStyle,
  useElementTransform,
  useMotion,
  useMotionControls,
  useMotionProperties,
  useMotionTransitions,
  useMotionVariants,
  useMotions,
  useReducedMotion,
  useSpring,
}
