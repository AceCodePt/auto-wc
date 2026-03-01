/**
 * @license MIT
 * Auto Web Component - Type-safe Web Components with automatic event wiring.
 */

// --- 1. Standard DOM Type Helpers ---

/**
 * Represents any valid HTML tag name (e.g., 'div', 'button', 'input').
 */
export type TagName = keyof HTMLElementTagNameMap;

/**
 * Maps a tag name to its specific HTMLElement class.
 * e.g., TagClass<'button'> resolves to HTMLButtonElement.
 */
export type TagClass<T extends TagName> = HTMLElementTagNameMap[T];

export type Constructor<T = {}> = new (...args: any[]) => T;

export interface AutoWebComponentOptions<
  ObservedAttributes extends string[] = string[],
> {
  observedAttributes?: ObservedAttributes;
}

// --- 2. Event System Configuration ---

/**
 * Interface defining all supported event interceptors.
 * Implement these methods in your class to automatically handle events.
 *
 * Naming Convention: on{EventName} -> eventname
 * Example: onClick -> click, onMouseDown -> mousedown, onDblClick -> dblclick
 */
export interface EventInterceptors {
  // Mouse
  onClick?(e: MouseEvent): void;
  onDblClick?(e: MouseEvent): void; // Maps to 'dblclick'
  onMouseDown?(e: MouseEvent): void;
  onMouseUp?(e: MouseEvent): void;
  onMouseEnter?(e: MouseEvent): void;
  onMouseLeave?(e: MouseEvent): void;
  onMouseMove?(e: MouseEvent): void;
  onMouseOver?(e: MouseEvent): void;
  onMouseOut?(e: MouseEvent): void;
  onContextMenu?(e: MouseEvent): void;

  // Keyboard
  onKeyDown?(e: KeyboardEvent): void;
  onKeyUp?(e: KeyboardEvent): void;
  onKeyPress?(e: KeyboardEvent): void;

  // Form / Input
  onInput?(e: Event): void;
  onChange?(e: Event): void;
  onSubmit?(e: SubmitEvent): void;
  onFocus?(e: FocusEvent): void;
  onBlur?(e: FocusEvent): void;
  onReset?(e: Event): void;
  onInvalid?(e: Event): void;
  onSelect?(e: Event): void;

  // Drag & Drop
  onDrag?(e: DragEvent): void;
  onDragEnd?(e: DragEvent): void;
  onDragEnter?(e: DragEvent): void;
  onDragLeave?(e: DragEvent): void;
  onDragOver?(e: DragEvent): void;
  onDragStart?(e: DragEvent): void;
  onDrop?(e: DragEvent): void;

  // Clipboard
  onCopy?(e: ClipboardEvent): void;
  onCut?(e: ClipboardEvent): void;
  onPaste?(e: ClipboardEvent): void;

  // UI / Window
  onScroll?(e: Event): void;
  onResize?(e: UIEvent): void;
  onWheel?(e: WheelEvent): void;

  // Media
  onLoad?(e: Event): void;
  onError?(e: ErrorEvent): void;
  onPlay?(e: Event): void;
  onPause?(e: Event): void;
  onEnded?(e: Event): void;

  // Details/Dialog
  onToggle?(e: Event): void;

  onPointerCancel?(e: Event): void;
  onPointerUp?(e: Event): void;
  onPointerDown?(e: PointerEvent): void;
  onPointerMove?(e: PointerEvent): void;
  onCommand?(e: Event): void;
}

// --- 3. Internal Logic ---

function isEventInterceptorMethod(method: string): boolean {
  return /^on[A-Z]/.test(method);
}

function getEventName(methodName: string): string {
  // Simple rule: strip 'on' and lowercase the rest
  // onClick -> click
  // onDblClick -> dblclick
  // onMouseDown -> mousedown
  return methodName.substring(2).toLowerCase();
}

/**
 * Mixin that adds auto event wiring to a base class.
 */
function withAutoEvents<
  T extends Constructor<
    HTMLElement & {
      connectedCallback?(): void;
      attributeChangedCallback?(
        name: string,
        oldValue: string | null,
        newValue: string | null,
      ): void;
      disconnectedCallback?(): void;
    }
  >,
>(Base: T) {
  // @ts-expect-error - Dynamic class extension
  class AutoElement extends Base implements EventInterceptors {
    private _cleanupFns: Array<() => void> = [];

    override connectedCallback() {
      super.connectedCallback?.();
      this._wireAndLockEvents();
    }
    override attributeChangedCallback(
      name: string,
      oldValue: string | null,
      newValue: string | null,
    ) {
      super.attributeChangedCallback?.(name, oldValue, newValue);
    }
    override disconnectedCallback() {
      super.disconnectedCallback?.();
      this._unwireEvents();
    }

    private _wireAndLockEvents() {
      // Scan the prototype chain for methods starting with 'on'
      const hostMethods = new Set<string>();
      let curr = this;

      // Walk up prototype chain to find methods
      while (curr && curr !== Object.prototype) {
        Object.getOwnPropertyNames(curr).forEach((prop) => {
          if (isEventInterceptorMethod(prop)) hostMethods.add(prop);
        });
        curr = Object.getPrototypeOf(curr);
      }

      for (const method of hostMethods) {
        const eventName = getEventName(method);
        const originalHostFn = this[method as keyof typeof this];

        if (typeof originalHostFn !== "function") continue;

        // 1. Wire the event
        const handler = originalHostFn.bind(this) as EventListener;
        this.addEventListener(eventName, handler);
        this._cleanupFns.push(() => {
          this.removeEventListener(eventName, handler);
        });

        // 2. Lock the property to prevent runtime reassignment
        Object.defineProperty(this, method, {
          value: originalHostFn,
          writable: false,
          configurable: true,
        });
      }
    }

    private _unwireEvents() {
      for (const cleanup of this._cleanupFns) {
        cleanup();
      }
      this._cleanupFns = [];
    }
  }

  return AutoElement as unknown as T & Constructor<EventInterceptors>;
}

// --- 4. Public API ---

/**
 * Defines a type-safe Web Component with auto event handling.
 *
 * @param tagName - The custom element tag name (e.g., 'my-button')
 * @param extendsTag - The HTML tag to extend (e.g., 'button', 'div')
 * @param factory - A function that receives the Base class and returns your implementation
 * @param options - Optional configuration (observedAttributes, etc.)
 */
export function defineAutoWebComponent<
  T extends TagName,
  ObservedAttributes extends string[] = string[],
>(
  tagName: string,
  extendsTag: T,
  factory: (
    base: Constructor<TagClass<T> & EventInterceptors>,
  ) => Constructor<TagClass<T>> & { observedAttributes?: ObservedAttributes },
  options: AutoWebComponentOptions<ObservedAttributes> = {},
): void {
  const BaseClass = document.createElement(extendsTag)
    .constructor as Constructor<TagClass<T>>;
  const ImplementationClass = factory(withAutoEvents(BaseClass));

  if (customElements.get(tagName)) {
    console.warn(`Custom element ${tagName} is already registered`);
    return;
  }

  if (options.observedAttributes) {
    ImplementationClass.observedAttributes = options.observedAttributes;
  }

  customElements.define(tagName, ImplementationClass, {
    extends: extendsTag,
  });
}
