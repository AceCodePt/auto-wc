# auto-wc

![Tests](https://img.shields.io/badge/tests-passing-brightgreen)
![Size](https://img.shields.io/badge/minified-1.23KB-blue)
![AI](https://img.shields.io/badge/AI-Generated-orange)

Type-safe Web Components with automatic event wiring.

## Installation

### Node.js (npm, pnpm, bun)

```bash
# npm
npm install auto-wc

# pnpm
pnpm add auto-wc

# bun
bun add auto-wc
```

### CDN Usage

You can import `auto-wc` directly from jsDelivr or unpkg without a build step.

#### Standard (ES Modules)

```html
<script type="module">
  import { defineAutoWebComponent } from 'https://cdn.jsdelivr.net/npm/auto-wc/+esm';
</script>
```

#### Minified (Recommended for Production)

```html
<!-- unpkg -->
<script type="module">
  import { defineAutoWebComponent } from 'https://unpkg.com/auto-wc/dist/index.min.js';
</script>

<!-- jsDelivr -->
<script type="module">
  import { defineAutoWebComponent } from 'https://cdn.jsdelivr.net/npm/auto-wc/dist/index.min.js';
</script>
```

Example usage:

```html
<script type="module">
  import { defineAutoWebComponent } from 'https://unpkg.com/auto-wc/dist/index.min.js';

  defineAutoWebComponent('my-button', 'button', (Base) => class extends Base {
    onClick() {
      console.log('Clicked!');
    }
  });
</script>
```

#### Development (Unminified)

```html
<!-- jsDelivr -->
<script type="module">
  import { defineAutoWebComponent } from 'https://cdn.jsdelivr.net/npm/auto-wc/+esm';
</script>

<!-- unpkg -->
<script type="module">
  import { defineAutoWebComponent } from 'https://unpkg.com/auto-wc/dist/index.js';
</script>
```

Example usage:

```html
<script type="module">
  import { defineAutoWebComponent } from 'https://cdn.jsdelivr.net/npm/auto-wc/+esm';

  defineAutoWebComponent('my-button', 'button', (Base) => class extends Base {
    onClick() {
      console.log('Clicked!');
    }
  });
</script>
```

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

### CommonJS (require)

If you are using a legacy environment:

```javascript
const { defineAutoWebComponent } = require("auto-wc");

defineAutoWebComponent("my-button", "button", (Base) => class extends Base {
  // ...
});
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

### Using Import Maps

You can use Import Maps to manage your dependencies cleanly in the browser:

```html
<script type="importmap">
  {
    "imports": {
      "auto-wc": "https://unpkg.com/auto-wc/dist/index.min.js"
    }
  }
</script>

<script type="module">
  import { defineAutoWebComponent } from "auto-wc";

  defineAutoWebComponent("my-button", "button", (Base) => class extends Base {
    // ...
  });
</script>
```

## Features

- ✅ **Type-safe**: Full TypeScript support for DOM events.
- ✅ **Automatic Wiring**: Methods starting with `on` (e.g., `onClick`) are automatically bound to events.
- ✅ **Automatic Registration**: `customElements.define` is called automatically.
- ✅ **Strict**: Event handler properties are read-only to prevent runtime reassignment.
- ✅ **Cleanup**: Event listeners are automatically removed on disconnect.
- ✅ **Zero Dependencies**: Lightweight and fast.

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
