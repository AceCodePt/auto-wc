import { describe, it, expect, vi } from "vitest";
import { defineAutoWebComponent } from "../src/index";

describe("defineAutoWebComponent", () => {
  it("should register a custom element", () => {
    const defineSpy = vi.spyOn(customElements, "define");

    defineAutoWebComponent(
      "test-element",
      "div",
      (Base) => class extends Base {},
    );

    expect(defineSpy).toHaveBeenCalledWith(
      "test-element",
      expect.any(Function),
      { extends: "div" },
    );
  });

  it("should wire event handlers automatically", () => {
    const onClickSpy = vi.fn();

    defineAutoWebComponent(
      "event-element",
      "button",
      (Base) =>
        class extends Base {
          onClick(e: MouseEvent) {
            onClickSpy(e);
          }
        },
    );

    // JSDOM supports customized built-in elements correctly
    const element = document.createElement("button", { is: "event-element" });
    document.body.appendChild(element);

    const event = new MouseEvent("click");
    element.dispatchEvent(event);

    expect(onClickSpy).toHaveBeenCalledWith(event);

    document.body.removeChild(element);
  });

  it("should handle camelCase event names correctly", () => {
    const onDblClickSpy = vi.fn();
    const onMouseDownSpy = vi.fn();

    defineAutoWebComponent(
      "camel-case-element",
      "div",
      (Base) =>
        class extends Base {
          onDblClick(e: MouseEvent) {
            onDblClickSpy(e);
          }
          onMouseDown(e: MouseEvent) {
            onMouseDownSpy(e);
          }
        },
    );

    const element = document.createElement("div", { is: "camel-case-element" });
    document.body.appendChild(element);

    element.dispatchEvent(new MouseEvent("dblclick"));
    expect(onDblClickSpy).toHaveBeenCalled();

    element.dispatchEvent(new MouseEvent("mousedown"));
    expect(onMouseDownSpy).toHaveBeenCalled();

    document.body.removeChild(element);
  });

  it("should lock event handler properties", () => {
    let instance: any;

    defineAutoWebComponent(
      "locked-element",
      "div",
      (Base) =>
        class extends Base {
          onClick() {}
          constructor() {
            super();
            instance = this;
          }
        },
    );

    const element = document.createElement("div", { is: "locked-element" });
    document.body.appendChild(element);

    expect(() => {
      instance.onClick = () => {};
    }).toThrow();

    document.body.removeChild(element);
  });

  it("should cleanup event listeners on disconnect", () => {
    const onClickSpy = vi.fn();

    defineAutoWebComponent(
      "cleanup-element",
      "div",
      (Base) =>
        class extends Base {
          onClick(e: MouseEvent) {
            onClickSpy(e);
          }
        },
    );

    const element = document.createElement("div", { is: "cleanup-element" });

    document.body.appendChild(element);
    element.dispatchEvent(new MouseEvent("click"));
    expect(onClickSpy).toHaveBeenCalledTimes(1);

    document.body.removeChild(element);
    element.dispatchEvent(new MouseEvent("click"));
    expect(onClickSpy).toHaveBeenCalledTimes(1);
  });

  it("should handle observed attributes", () => {
    defineAutoWebComponent(
      "attr-element",
      "div",
      (Base) => class extends Base {},
      { observedAttributes: ["foo", "bar"] },
    );

    const ElementClass = customElements.get("attr-element");
    expect((ElementClass as any).observedAttributes).toEqual(["foo", "bar"]);
  });

  it("should call attributeChangedCallback when observed attribute changes", () => {
    const attributeChangedSpy = vi.fn();

    defineAutoWebComponent(
      "observed-attr-changed-element",
      "div",
      (Base) =>
        class extends Base {
          attributeChangedCallback(
            name: string,
            oldValue: string | null,
            newValue: string | null,
          ) {
            attributeChangedSpy(name, oldValue, newValue);
          }
        },
      { observedAttributes: ["test-attr"] },
    );

    const element = document.createElement("div", { is: "observed-attr-changed-element" });
    document.body.appendChild(element);

    element.setAttribute("test-attr", "value1");
    expect(attributeChangedSpy).toHaveBeenCalledWith("test-attr", null, "value1");

    element.setAttribute("test-attr", "value2");
    expect(attributeChangedSpy).toHaveBeenCalledWith("test-attr", "value1", "value2");

    document.body.removeChild(element);
  });
});
