---
name: web3forms-contact
description: Wire up a contact form with Web3Forms — AJAX submit, hidden access_key, honeypot, AJAX-submitted success modal, and email/phone validation with inline errors. Use when adding or upgrading any contact form on a static site.
metadata:
  priority: 9
  pathPatterns:
    - '*.html'
    - 'styles/components.css'
    - 'js/main.js'
  promptSignals:
    phrases:
      - "connect web3forms"
      - "wire up the contact form"
      - "add web3forms"
      - "form submit"
      - "ajax form"
      - "contact form"
      - "form validation"
retrieval:
  aliases:
    - web3forms
    - contact form ajax
    - form success modal
    - form validation pattern
  intents:
    - connect a form to web3forms
    - add ajax submit + success popup to a form
    - add email/phone validation
---

# Web3Forms AJAX Contact Form

Web3Forms (`api.web3forms.com/submit`) is a free form-to-email backend that accepts a multipart POST and returns JSON. This skill wires a static-site contact form to it with **AJAX submit + success modal + inline validation**, no page reload.

---

## Required information from the user

Before writing any code, **ask the user for**:

1. **Web3Forms access key** — they sign up at web3forms.com and paste the UUID-style key.
2. **Submit method** — confirm AJAX (this skill) vs. native POST redirect.
3. **Scope** — which pages get the form? Often a site has the same contact form on every page; apply uniformly.

If the form is duplicated across many pages, **pair this skill with `bulk-multipage-edit`** to apply changes safely.

---

## Three-part implementation

HTML on each page (form + success modal markup), CSS once (success modal + error states), JS once (validation + AJAX + modal control).

---

## 1 — HTML on every page

### A. Form opening — add `action`, `access_key`, honeypot

Replace the form opening tag and inject two hidden inputs immediately inside:

```html
<form class="contact__form" id="contact-form" action="https://api.web3forms.com/submit" method="POST">
  <input type="hidden" name="access_key" value="USER_ACCESS_KEY_HERE">
  <input type="checkbox" name="botcheck" style="display:none" tabindex="-1" autocomplete="off">
  <!-- existing fields below -->
</form>
```

The `botcheck` honeypot is required — Web3Forms silently drops submissions where it's checked (real users never see it). Keep it `style="display:none"`, never `hidden` (some bots respect `hidden`).

### B. Inline error spans inside validatable fields

Each field that gets JS validation needs a sibling `<span>` for the error message. Place inside the same `.form-group__input-cover`:

```html
<div class="form-group__input-cover">
  <input type="email" id="contact-email" name="email" placeholder="ihre@email.de" required>
  <span class="form-group__error" id="contact-email-error" hidden>Bitte gültige E-Mail-Adresse eingeben.</span>
</div>
<div class="form-group__input-cover">
  <input type="tel" id="contact-phone" name="phone" placeholder="Ihre Rufnummer">
  <span class="form-group__error" id="contact-phone-error" hidden>Bitte gültige Telefonnummer eingeben.</span>
</div>
```

The `<span>` `id` must match the input `id` + `-error` so the JS can find it generically.

### C. Success modal — insert once per page, before `<script src="js/main.js">`

This is the markup the JS will toggle visible on `data.success`. Adapt the title/message language to the site (German below):

```html
<!-- Form success popup -->
<div class="form-success-overlay" id="form-success-overlay" aria-hidden="true">
  <div class="form-success-modal" role="dialog" aria-modal="true" aria-labelledby="form-success-title">
    <div class="form-success-modal__icon">
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="24" cy="24" r="24" fill="#1a8a3a" fill-opacity="0.12"/>
        <circle cx="24" cy="24" r="18" fill="#1a8a3a"/>
        <path d="M15 24l6.5 6.5L33 18" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <div><h3 class="form-success-modal__title" id="form-success-title">Anfrage gesendet!</h3></div>
    <div><p class="form-success-modal__msg">Vielen Dank — wir melden uns in Kürze bei Ihnen.</p></div>
    <div>
      <button class="form-success-modal__close" id="form-success-close" type="button">Verstanden</button>
    </div>
  </div>
</div>
```

---

## 2 — CSS (add once to a shared stylesheet)

Map color/radius/font tokens to whatever the project uses. The two-state overlay pattern (`visibility` + `opacity` + `transition` with delayed `visibility 0s linear 0.22s`) is the same trick `.nav-dropdown__menu` uses — keep it; it prevents the modal from blocking pointer events while fading out.

```css
/* --- Form success popup --- */
.form-success-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 29, 36, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.22s ease, visibility 0s linear 0.22s;
}

.form-success-overlay.open {
  visibility: visible;
  opacity: 1;
  transition: opacity 0.22s ease, visibility 0s linear 0s;
}

.form-success-modal {
  background: var(--color-surface);
  border-radius: var(--radius-card);
  padding: var(--space-2xl);
  max-width: 25rem;
  width: calc(100% - var(--space-lg) * 2);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  transform: translateY(0.5rem);
  transition: transform 0.22s ease;
  box-shadow: 0 1.25rem 3rem rgba(0, 0, 0, 0.18);
}

.form-success-overlay.open .form-success-modal { transform: translateY(0); }

.form-success-modal__icon svg { width: 3rem; height: 3rem; }

.form-success-modal__title {
  font-family: var(--font-heading);
  font-size: var(--text-h3);
  line-height: var(--leading-h3);
  color: var(--color-text-heading);
  font-weight: var(--weight-bold);
  margin: 0;
}

.form-success-modal__msg {
  font-size: var(--text-p2);
  line-height: var(--leading-body);
  color: var(--color-text-body);
  margin: 0;
}

.form-success-modal__close {
  margin-top: var(--space-sm);
  padding: 0.75rem var(--space-xl);
  background: var(--color-accent);
  color: var(--color-text-heading);
  border: none;
  border-radius: var(--radius-btn);
  font-family: var(--font-heading);
  font-size: var(--text-p3);
  font-weight: var(--weight-semibold);
  cursor: pointer;
  transition: background 0.2s ease;
}
.form-success-modal__close:hover { background: #e0a400; }

/* --- Inline error states (paired with field validation) --- */
.form-group__input-cover input.form-group__input--error,
.form-group__input-cover textarea.form-group__input--error {
  border-color: #c8201f;
}

.form-group__error {
  display: block;
  margin-top: var(--space-xs);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: #c8201f;
}
.form-group__error[hidden] { display: none; }
```

---

## 3 — JavaScript (add once to main.js IIFE)

Place inside the same IIFE as other init functions. The handler validates, hits Web3Forms, shows the modal, and resets the form (including any custom `form-select` widget).

```js
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function showFieldError(input, errorEl) {
  if (input)   input.classList.add('form-group__input--error');
  if (errorEl) errorEl.hidden = false;
}
function clearFieldError(input, errorEl) {
  if (input)   input.classList.remove('form-group__input--error');
  if (errorEl) errorEl.hidden = true;
}

function resetServiceSelect() {
  /* If pairing with the form-select skill, clear the custom widget here.
     Adjust placeholder text and selectors to match the project. */
  var wrapper = document.getElementById('service-select');
  if (!wrapper) return;
  var valueEl = wrapper.querySelector('.form-select__value');
  var hidden  = wrapper.querySelector('input[type="hidden"]');
  var options = wrapper.querySelectorAll('.form-select__option');
  if (valueEl) {
    valueEl.textContent = 'Bitte wählen...';
    valueEl.classList.add('form-select__value--placeholder');
  }
  if (hidden) hidden.value = '';
  options.forEach(function (o) { o.removeAttribute('aria-selected'); });
}

function showSuccessModal() {
  var overlay = document.getElementById('form-success-overlay');
  if (!overlay) return;
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
}

function handleFormSubmit(e) {
  e.preventDefault();

  /* Required-text fields: silent fail, browser handles `required` attribute focus */
  var requiredText = ['contact-firstname', 'contact-name', 'contact-message']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);
  var missing = requiredText.some(function (el) { return !el.value.trim(); });
  if (missing) return;

  /* Email — required + format */
  var email     = document.getElementById('contact-email');
  var emailErr  = document.getElementById('contact-email-error');
  var emailVal  = email.value.trim();
  var emailOk   = emailVal && EMAIL_RE.test(emailVal);
  if (!emailOk) showFieldError(email, emailErr);
  else          clearFieldError(email, emailErr);

  /* Phone — optional, but if filled must be 7-15 digits */
  var phone    = document.getElementById('contact-phone');
  var phoneErr = document.getElementById('contact-phone-error');
  var phoneVal = phone ? phone.value.trim() : '';
  var phoneOk  = true;
  if (phoneVal) {
    var digits = phoneVal.replace(/\D/g, '');
    phoneOk = digits.length >= 7 && digits.length <= 15;
  }
  if (!phoneOk) showFieldError(phone, phoneErr);
  else          clearFieldError(phone, phoneErr);

  if (!emailOk || !phoneOk) return;

  /* Submit */
  var submitBtn = contactForm.querySelector('.contact__form-submit');
  var label     = submitBtn.querySelector('.btn__label span');
  var original  = label.textContent;
  label.textContent = 'Wird gesendet...';
  submitBtn.disabled = true;

  fetch(contactForm.action, {
    method: 'POST',
    body: new FormData(contactForm),
    headers: { 'Accept': 'application/json' }
  })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (data && data.success) {
        contactForm.reset();
        resetServiceSelect();
        showSuccessModal();
      }
    })
    .catch(function () { /* silent */ })
    .then(function () {
      label.textContent = original;
      submitBtn.disabled = false;
    });
}

function initSuccessModal() {
  var overlay  = document.getElementById('form-success-overlay');
  var closeBtn = document.getElementById('form-success-close');
  if (!overlay) return;

  function close() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
  }
  if (closeBtn) closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('open')) close();
  });
}
```

Wire from `init()`:

```js
if (contactForm) {
  contactForm.addEventListener('submit', handleFormSubmit);

  /* Auto-clear errors as user types */
  var phoneInput = document.getElementById('contact-phone');
  var phoneErr   = document.getElementById('contact-phone-error');
  if (phoneInput) phoneInput.addEventListener('input', function () { clearFieldError(phoneInput, phoneErr); });

  var emailInput = document.getElementById('contact-email');
  var emailErr   = document.getElementById('contact-email-error');
  if (emailInput) emailInput.addEventListener('input', function () { clearFieldError(emailInput, emailErr); });
}
initSuccessModal();
```

---

## Design decisions (do not change)

| Decision | Reason |
|---|---|
| `style="display:none"` honeypot, not `hidden` | Some bots skip `hidden` fields; inline style is opaque to them |
| Silent fail on missing required text | Browser already focuses required-empty fields on submit; double-handling them adds noise |
| Email regex `^[^\s@]+@[^\s@]+\.[^\s@]{2,}$` | Permissive enough to allow plus-addressing and uncommon TLDs without false negatives |
| Phone: 7-15 digits | E.164-compatible range; rejects empty or junk while allowing international formats |
| Errors clear on `input`, not `blur` | Faster feedback — user sees error vanish as soon as they start fixing it |
| Reset both form **and** custom select | `form.reset()` doesn't touch external state like a custom select widget |
| `.then` + `.then` (not `.finally`) for label restore | Wider browser support without polyfills |
| Modal uses `visibility` + `opacity` + delayed `visibility` transition | Same pattern as nav dropdowns; prevents click-through during fade |

---

## Verification after install

For each page that should have the form:

```bash
grep -c "api.web3forms.com/submit" page.html        # expect 1
grep -c "name=\"botcheck\"" page.html                # expect 1
grep -c "form-success-overlay" page.html             # expect 1 (markup only — JS uses getElementById)
```

Submit a test message and confirm:
1. Submit button shows "Wird gesendet..." then restores
2. Form clears
3. Success modal appears with correct copy
4. Modal closes via button, backdrop click, and Escape
5. Web3Forms dashboard shows the submission
