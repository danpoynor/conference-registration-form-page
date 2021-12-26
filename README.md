# Interactive Conference Registration Form Prototype

Coded prototype for a fictional conference demonstrating form validation and error handling using vanilla JavaScript.

This demo centers around a JavaScript class created to validate user entered form data and present validation error messages (hints) to the user. The class has been developed to receive a set of validation rules to use for validating each field in a form either in real-time as a user interacts with the form, or after the form has been submitted. The class can be used to validate a variety of forms such as registration forms, contact forms, checkout forms, login forms, expense forms, and others.

The validation script assumes HTML5 form validation is disabled (`novalidate`) and that the form is submitted via a `submit` button. It is also assumed `<input>` fields are wrapped by a `<label>` element which are used to append error messages to.

Live Preview: [https://danpoynor.github.io/conference-registration-form-page/](https://danpoynor.github.io/conference-registration-form-page/)

---

## Screenshot

<details>
  <summary>expand/collapse</summary>
  
<img width="681" alt="Screen Shot 2022-01-20 at 12 09 10 PM" src="https://user-images.githubusercontent.com/764270/150397163-ab83dc3d-69f8-4134-90bb-4ffc48ba200b.png">
  
</details>

---

## Fields With Real-time Validations

Fields with these IDs are validated on 'input' and 'blur' events. The validations are based on the same rules as when the form is submitted.

- <code>name</code>
- <code>email</code>

---

## Fields With Conditional Validation Error Messages

The individual rules in these rule sets are evaluated based on what the user has entered into the form.

Notes

- The `activities` validator checks to make sure the user has selected at least one checkbox from a set of checkboxes.
- The validators for `cc-num`, `zip`, and `cvv` also include a condition that payment type 'credit-card' must be selected before the rule is evaluated.

<details>
  <summary><code>name</code></summary>

```javascript
'name', [
  {
    method: field => field.value.length > 0,
    message: 'Name is required'
  },
  {
    method: field => field.value.length >= 3,
    message: 'Name must be at least 3 characters long'
  },
  {
    method: field => /^[a-zA-Z\-.'\s]+$/.test(field.value),
    message: 'Name should only contain letters, spaces, hyphens, periods, and apostrophes'
  }
]
```

</details>

<details>
  <summary><code>email</code></summary>

```javascript
'email', [
  {
    method: field => field.value.length > 0,
    message: 'Email is required'
  },
  {
    method: field => field.value.indexOf('@') > -1,
    message: "Enter the 'at' symbol in the email address."
  },
  {
    method: field => field.value.indexOf('@') !== 0,
    message: "The 'at' symbol should not appear at the beginning."
  },
  {
    method: field => field.value.indexOf('.') > -1,
    message: "Enter the 'dot' symbol in the email address."
  },
  {
    method: field => field.value.indexOf('@') < field.value.indexOf('.'),
    message: "The 'at' symbol must be before the 'dot' symbol."
  },
  {
    method: field => field.value.indexOf('@') === field.value.lastIndexOf('@'),
    message: "The 'at' symbol should only appear once."
  },
  {
    // NOTE: This email regex isn't bulletproof, could edit if needed
    method: field => /^[^@]+@[^@.]+\.[a-z]+$/i.test(field.value),
    message: 'Email address must be formatted correctly'
  }
]
```

</details>

<details>
  <summary><code>activities</code></summary>

```javascript
'activities', [
  {
    method: field => {
      return field.querySelectorAll('#activities input[type="checkbox"]:checked').length > 0;
    },
    message: 'Choose at least one activity'
  }
]
```

</details>

<details>
  <summary><code>cc-num</code></summary>

```javascript
'cc-num', [
  {
    condition: () => document.getElementById('payment').value === 'credit-card',
    method: field => field.value.length > 0,
    message: 'Credit card number is required'
  },
  {
    condition: () => document.getElementById('payment').value === 'credit-card',
    method: field => !isNaN(field.value),
    message: 'Credit card number must be a number'
  },
  {
    condition: () => document.getElementById('payment').value === 'credit-card',
    method: field => /^\d{13,16}$/.test(field.value),
    message: 'Credit card number must be between 13 - 16 digits'
  }
]
```

</details>

<details>
  <summary><code>zip</code></summary>

```javascript
'zip', [
  {
    condition: () => document.getElementById('payment').value === 'credit-card',
    method: field => field.value.length > 0,
    message: 'Zip code is required'
  },
  {
    condition: () => document.getElementById('payment').value === 'credit-card',
    method: field => !isNaN(field.value),
    message: 'Zip code must be a number'
  },
  {
    condition: () => document.getElementById('payment').value === 'credit-card',
    method: field => field.value.length === 5,
    message: 'Zip code must be 5 digits'
  }
]
```

</details>

<details>
  <summary><code>cvv</code></summary>

```javascript
'cvv', [
  {
    condition: () => document.getElementById('payment').value === 'credit-card',
    method: field => field.value.length > 0,
    message: 'CVV is required'
  },
  {
    condition: () => document.getElementById('payment').value === 'credit-card',
    method: field => !isNaN(field.value),
    message: 'CVV must be a number'
  },
  {
    condition: () => document.getElementById('payment').value === 'credit-card',
    method: field => field.value.length === 3,
    message: 'CVV must be 3 digits'
  }
]
```

</details>

---

## Code Organization Walk-through

<details>
  <summary>Expand/Collapse</summary>

  <details>
    <summary>
      10,000 Foot Overview
    </summary>

```javascript
class FormValidator{
  // A generic form validator class
  // with methods for validating forms
  // and handling error messaging.
}

// Functions setting up the form
const addRegFormDefaults = () => {}
const addRegFormEventListeners = () => {}
const addRegFormValidationRules = regFormValidator => {}
const addRegFormRealTimeEventListeners = regFormValidator => {}

// Function to handle form submission using the validator class
const addRegFormSubmitEventListener = regFormValidator => {
  regForm.addEventListener('submit', ev => {
    // Reset the form before validating it again
    ev.preventDefault();
    regFormValidator.resetPageTitle();
    regFormValidator.resetErrorSummaryPanel();
    regFormValidator.removeHints();
    if (!regFormValidator.validateForm()) {
      // If validateForm() returns false, show error messages
      regFormValidator.updatePageTitle();
      regFormValidator.showErrorSummaryPanel();
      regFormValidator.showHints();
    } else {
      // Submit the form!
    }
  });
}

// Add the validation class behavior to a form
const regForm = document.forms[0];
if (regForm) {
  addRegFormDefaults();
  addRegFormEventListeners();
  const regFormValidator = new FormValidator(regForm);
  addRegFormValidationRules(regFormValidator);
  addRegFormRealTimeEventListeners(regFormValidator);
  addRegFormSubmitEventListener(regFormValidator);
};
```

  </details>

  <details>
    <summary>More Detailed Explanations</summary>

```javascript
class FormValidator {
  // FormValidator{} aims to be a generic form validation class so it might
  // be reused with other forms and validation rule sets.
  // Methods available to call on a form:
  resetPageTitle()
  resetErrorSummaryPanel()
  removeHints()
  removeHint(fieldId) // Used for real-time validations
  updatePageTitle()
  showErrorSummaryPanel()
  showHints()
  showHint(fieldId, error) // Used for real-time validations
  showValid(formElement)
  addValidator(element, rules)
  validateForm()
  validateField(fieldId) // Used for real-time validations
};

const addRegFormDefaults = () => {
  // Set up the registration forms initial 'state'.
  // - Set default visibility of form elements.
  // - Disable any form elements that are enabled dynamically.
  // - Add any additional attributes to form elements.
};

const addRegFormEventListeners = () => {
  // Attach custom event listeners needed for this form, such as:
  // - Showing/hiding form elements based on selections
  // - Enabling/disabling form elements based on selections
  // - Checking for selected activity scheduling conflicts
  // - Adjusting total cost based on selections
};

const addRegFormValidationRules = regFormValidator => {
  // Add validation rules, per form element, to FormValidator{}.
  // The `method` value in each rule will be tested if true or false.
  // Validation methods and messages are assigned to an elements `id`
  // (such as `#name`) in the format:
  regFormValidator.addValidator(
    'name', [
      {
        method: field => field.value.length > 0,
        message: 'Name is required'
      },
      {
        method: field => /^[a-zA-Z\-.'\s]+$/.test(field.value),
        message: 'Name should only contain letters, spaces, hyphens, periods, and apostrophes'
      },
      // ...
    ]
  );

  // If the method should only be evaluated if a condition is met, use something like:
  regFormValidator.addValidator(
    'cc-num', [
      {
        condition: () => document.getElementById('payment').value === 'credit-card',
        method: field => /^\d{13,16}$/.test(field.value),
        message: 'Credit card number must be between 13 - 16 digits'
      }
    ]
  );
};

const addRegFormRealTimeEventListeners = regFormValidator => {
  // Attach real-time event listeners to form elements.
  // Uses same validations rules as the 'submit' event.
  // Example:
  const email = document.getElementById('email');

  // Validate email on input and blur
  const validateEmail = () => {
    regFormValidator.validateField('email');
  };
  email.addEventListener('input', validateEmail);
  email.addEventListener('blur', validateEmail);
}

const addRegFormSubmitEventListener = regFormValidator => {
  // Validate form on submit
  // - If invalid, prevent form from submitting
  // - If valid, submit the from
  //
  // Note features can be added or remove if ever needed in cse this is used with other forms.
  // For example if you don't want to update the page title, remove its methods here.
  regForm.addEventListener('submit', ev => {
    ev.preventDefault();
    regFormValidator.resetPageTitle();
    regFormValidator.resetErrorSummaryPanel();
    regFormValidator.removeHints();
    if (!regFormValidator.validateForm()) {
      regFormValidator.updatePageTitle();
      regFormValidator.showErrorSummaryPanel();
      regFormValidator.showHints();
    } else {
      // Submit the form!
    }
  });
};

// Assign the form a name for reference
const regForm = document.forms[0];

//
// Put it all together
//
if (regForm) {
  // Set default form state
  addRegFormDefaults();

  // Add custom event listeners
  addRegFormEventListeners();

  // Assign a new instance of FormValidator{} to the regForm
  const regFormValidator = new FormValidator(regForm);

  // Add the form validation methods
  addRegFormValidationRules(regFormValidator);

  // Add real-time event listeners
  addRegFormRealTimeEventListeners(regFormValidator);

  // Add the form submit event listener
  addRegFormSubmitEventListener(regFormValidator);
};
```

</details>

</details>

---

## Special Feature Callouts

<details>
  <summary>Expand/Collapse</summary>

- The user is prevented from selecting two conference activities that occur at the same day and time.
- Multiple validation rules including contextual 'hint' messaging added to each field.
- On submit, if form is invalid:
  - An error summary panel appears at the top of the form.
    - Page scrolls to the panel so users can view list of errors.
    - Error panel includes links to scroll to invalid fields and focus cursor on it.
    - `scroll-behavior: smooth` added to prevent page jumping to/from the error summary panel.
  - The page title is updated to include number of errors.
    - Page title is the first thing read by screen readers.
    - Provides an additional visual cue to the user that there are errors.
    - Error count appears at beginning of title in case title is truncated in a browser tab.
  - `role="status"` and `aria-live="polite"` attributes included on error 'hint' messages to provide feedback to screen readers.
- Code is modularized to be easily extensible and added to other forms.
- Lots of comments included to help explain the code.
- Includes code comment explaining how to view generated array of validation objects in the console.
- Includes code comment noting how to run all the validations on 'submit' (or 'input' for real-time validated fields) instead of stopping on the first error for each field.

</details>

---

## BUGS

<details>
  <summary>Expand/Collapse</summary>

- Safari has a bug preventing select options with the 'hidden' attribute from being visually hidden.
- Safari 15.2 includes CSS `scroll-behavior` behind a feature flag, but Safari Technical Preview includes it as a standard (yay!) ([caniuse](https://caniuse.com/css-scroll-behavior)).

</details>

---

## POTENTIAL TODOs

<details>
  <summary>Expand/Collapse</summary>

- Even though we're not using HTML5 validation, perhaps `invalid` or `aria-invalid` attributes should still be added for screen readers?
- If an `<input>` is not wrapped in a parent `<label>`, match the `<input>`s `id` to a `<label>`s `for` attribute.
- Refactor as an ES6 module to allow for easier automated tree-shaking to remove any unused methods.
- Add methods for presenting a confirmation, thank-you, or success message at top of the page once the form has been successfully submitted instead of just reloading the page.
- Any other ideas please let me know at [danpoynor@gmail.com](mailto:danpoynor@gmail.com)

</details>
