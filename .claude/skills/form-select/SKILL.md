---
name: form-select
description: Insert a custom dropdown select field into the contact form, styled identically to the navbar dropdown (nav-dropdown). Use when adding or updating any select/option field in a form on this site.
metadata:
  priority: 9
  pathPatterns:
    - 'index.html'
    - 'styles/components.css'
    - 'js/main.js'
  promptSignals:
    phrases:
      - "select field"
      - "option field"
      - "dropdown field"
      - "form select"
      - "form dropdown"
      - "service field"
retrieval:
  aliases:
    - custom select
    - form dropdown
    - option input
    - styled select
  intents:
    - add a select field to the form
    - style a dropdown like the navbar
    - insert an option picker
---

# Custom Form Select — AkkermanStroy Pattern

This project uses a **fully custom dropdown** instead of a native `<select>` so it can be styled identically to the navbar `.nav-dropdown` menu. Never use a native `<select>` element in forms on this site.

---

## Three-part implementation

Every instance requires changes to three files: HTML, CSS, JS.

---

## 1 — HTML

Place this block inside `.form-group__input-cover`. Give the wrapper a unique `id` (used by JS). Each `<li>` carries a `data-value` attribute (the submitted form value) and display text.

```html
<div class="form-group">
  <div class="form-group__label-cover">
    <label for="FIELD_ID">LABEL TEXT</label>
  </div>
  <div class="form-group__input-cover">
    <div class="form-select" id="WRAPPER_ID">
      <button type="button" class="form-select__trigger" aria-haspopup="listbox" aria-expanded="false">
        <span class="form-select__value form-select__value--placeholder">Bitte wählen...</span>
        <svg class="form-select__chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <ul class="form-select__menu" role="listbox">
        <li class="form-select__option" role="option" data-value="VALUE_1">Label 1</li>
        <li class="form-select__option" role="option" data-value="VALUE_2">Label 2</li>
        <!-- repeat for each option -->
        <li class="form-select__option" role="option" data-value="other">Sonstiges</li>
      </ul>
      <input type="hidden" name="FIELD_NAME" id="FIELD_ID" required>
    </div>
  </div>
</div>
```

**Rules:**
- The hidden `<input>` carries `name` (used in form submission) and `id` (matched by the `<label>`).
- Always include a "Sonstiges" (Other) option as the last item.
- Placeholder text is always "Bitte wählen..." — do not translate or change it.

---

## 2 — CSS

The CSS lives in `styles/components.css`. It is already present for the service field. Do **not** add it again — all `.form-select` instances share the same stylesheet rules.

If starting a new project, add this block once after the `.form-group__input-cover textarea` rules:

```css
/* --- Custom form select (mirrors nav-dropdown) --- */
.form-select {
  position: relative;
}

.form-select__trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border-input);
  border-radius: var(--radius-btn);
  font-family: var(--font-body);
  font-size: var(--text-p3);
  color: var(--color-text-heading);
  cursor: pointer;
  text-align: left;
  transition: border-color var(--ease-default);
}

.form-select__trigger[aria-expanded="true"] {
  border-color: var(--color-primary);
}

.form-select__value--placeholder {
  color: var(--color-placeholder);
}

.form-select__chevron {
  flex-shrink: 0;
  color: var(--color-nav-link);
  transition: transform 0.3s ease;
}

.form-select__trigger[aria-expanded="true"] .form-select__chevron {
  transform: rotate(180deg);
}

.form-select__menu {
  position: absolute;
  top: calc(100% + 0.375rem);
  left: 0;
  right: 0;
  background-color: var(--color-surface);
  border-radius: 0.5rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--color-border);
  list-style: none;
  margin: 0;
  padding: 0;
  z-index: 200;
  visibility: hidden;
  opacity: 0;
  pointer-events: none;
  transform: translateY(-0.375rem);
  transition: opacity 0.3s ease, transform 0.3s ease, visibility 0s linear 0.3s;
}

.form-select__menu.open {
  visibility: visible;
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
  transition: opacity 0.3s ease, transform 0.3s ease, visibility 0s linear 0s;
}

.form-select__option {
  padding: 0.875rem var(--space-lg);
  font-family: var(--font-heading);
  font-size: var(--text-p3);
  font-weight: var(--weight-semibold);
  color: var(--color-nav-link);
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
  border-bottom: 1px solid var(--color-border);
}

.form-select__option:last-child {
  border-bottom: none;
}

.form-select__option:hover,
.form-select__option[aria-selected="true"] {
  background-color: var(--color-surface-alt);
  color: var(--color-text-heading);
}

.form-select__option:first-child {
  border-radius: 0.5rem 0.5rem 0 0;
}

.form-select__option:last-child {
  border-radius: 0 0 0.5rem 0.5rem;
}
```

---

## 3 — JavaScript

One `initFormSelect` function per dropdown instance. Add it inside the IIFE in `js/main.js`, before `initSmoothScroll`. Call it from `init()`.

Replace `WRAPPER_ID` with the actual wrapper element `id`.

```js
function initFormSelect_WRAPPER_ID() {
  var wrapper = document.getElementById('WRAPPER_ID');
  if (!wrapper) return;

  var trigger = wrapper.querySelector('.form-select__trigger');
  var menu    = wrapper.querySelector('.form-select__menu');
  var valueEl = wrapper.querySelector('.form-select__value');
  var hidden  = wrapper.querySelector('input[type="hidden"]');
  var options = wrapper.querySelectorAll('.form-select__option');

  function open() {
    menu.classList.add('open');
    trigger.setAttribute('aria-expanded', 'true');
  }

  function close() {
    menu.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
  }

  trigger.addEventListener('click', function (e) {
    e.stopPropagation();
    menu.classList.contains('open') ? close() : open();
  });

  options.forEach(function (opt) {
    opt.addEventListener('click', function () {
      options.forEach(function (o) { o.removeAttribute('aria-selected'); });
      opt.setAttribute('aria-selected', 'true');
      valueEl.textContent = opt.textContent;
      valueEl.classList.remove('form-select__value--placeholder');
      hidden.value = opt.getAttribute('data-value');
      close();
    });
  });

  document.addEventListener('click', function (e) {
    if (!wrapper.contains(e.target)) close();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });
}
```

Then call it inside `init()`:

```js
initFormSelect_WRAPPER_ID();
```

**If adding a second dropdown**, duplicate the function with a different suffix and call both from `init()`. Do not attempt to share a single function across multiple wrappers — the closures must be isolated.

---

## Design decisions (do not change)

| Decision | Reason |
|---|---|
| Custom HTML, not `<select>` | Native `<select>` dropdown cannot be styled to match `.nav-dropdown__menu` |
| Hidden `<input>` for value | Participates in native form submission and `required` validation without JS overrides |
| `visibility` + `opacity` animation | Matches the exact transition used by `.nav-dropdown__menu` |
| `e.stopPropagation()` on trigger click | Prevents the document click listener from immediately closing the menu on open |
| `aria-expanded` on trigger | Drives the chevron rotation via CSS attribute selector — no JS class needed |
| `z-index: 200` on menu | Sits above form fields but below the fixed site header (`z-index: 1000`) |
