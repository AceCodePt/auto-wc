# auto-wc

![Tests](https://img.shields.io/badge/tests-passing-brightgreen)
![Size](https://img.shields.io/badge/minified-1.23KB-blue)

Type-safe Web Components with automatic event wiring.

## The Struggle is Real

"Oh boy! Can't wait setting up listeners again!"

If you've ever written a vanilla Web Component, you know the drill. You create a class, you custom element define it, and then you spend the next 20 minutes writing `addEventListener` in `connectedCallback` and `removeEventListener` in `disconnectedCallback`. It's repetitive, it's error-prone, and quite frankly, it's boring.

**The Old Way (Yawn):**
```javascript
class MyButton extends HTMLButtonElement {
  constructor() {
    super();
    this._handleClick = this._handleClick.bind(this);
  }

  connectedCallback() {
    this.addEventListener('click', this._handleClick);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._handleClick);
  }

  _handleClick(e) {
    console.log('Clicked!');
  }
}
customElements.define('my-button', MyButton, { extends: 'button' });
```

**The auto-wc Way (Magic!):**
```javascript
defineAutoWebComponent('my-button', 'button', (Base) => class extends Base {
  onClick(e) {
    console.log('Clicked!');
  }
});
```

## Installation

```bash
# npm
npm install auto-wc

# pnpm
pnpm add auto-wc

# bun
bun add auto-wc
```

Or use via CDN:

```html
<script type="module">
  import { defineAutoWebComponent } from 'https://unpkg.com/auto-wc/dist/index.min.js';
</script>
```


## Features

- ✅ **Type-safe**: Full TypeScript support for DOM events.
- ✅ **Automatic Wiring**: Methods starting with `on` (e.g., `onClick`) are automatically bound to events.
- ✅ **Automatic Registration**: `customElements.define` is called automatically.
- ✅ **Strict**: Event handler properties are read-only to prevent runtime reassignment.
- ✅ **Cleanup**: Event listeners are automatically removed on disconnect.
- ✅ **Zero Dependencies**: Lightweight and fast.

## Usage

### TypeScript / ES Modules

```typescript
import { defineAutoWebComponent } from "auto-wc";

defineAutoWebComponent(
  "my-button",
  "button",
  (Base) =>
    class extends Base {
      // ...
    }
);
```


### Full Example

```typescript
import { defineAutoWebComponent } from "auto-wc";

defineAutoWebComponent(
  "my-button",
  "button",
  (Base) =>
    class extends Base {
      // Automatically wired to 'click' event
      onClick(e: MouseEvent) {
        console.log("Button clicked!");
      }

      // Automatically wired to 'dblclick' event
      onDblClick(e: MouseEvent) {
        console.log("Double clicked!");
      }

      // Standard lifecycle methods work as expected
      connectedCallback() {
        super.connectedCallback();
        console.log("Connected");
      }
    },
  { observedAttributes: ["disabled"] },
);
```

### HTML Usage (is="" directive)

Since this library creates **customized built-in elements**, you must use the `is` attribute on the extended standard HTML element:

```html
<!-- Correct -->
<button is="my-button">Click Me</button>

<!-- Incorrect (won't work for built-in extends) -->
<my-button>I will never work!</my-button>
```


## API

### `defineAutoWebComponent(tagName, extendsTag, factory, options)`

- `tagName`: The custom element tag name (e.g., `'my-button'`).
- `extendsTag`: The HTML tag to extend (e.g., `'button'`, `'div'`).
- `factory`: A function that receives the `Base` class and returns your implementation.
- `options`: Optional configuration object.
  - `observedAttributes`: Array of attribute names to observe.

This function automatically calls `customElements.define` with the provided `tagName` and the generated class.

## License

MIT
