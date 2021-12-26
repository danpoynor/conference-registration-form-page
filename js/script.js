// FormValidator{} aims to be a generic form validation class, so it might
// be reused with other forms and validation rule-sets.
class FormValidator {
  constructor(form) {
    this.form = form;
    this.validators = [];
    this.originalPageTitle = document.title;

    this.resetPageTitle = () => {
      document.title = this.originalPageTitle;
    };

    this.resetErrorSummaryPanel = () => {
      // Remove the panel is it exists
      // '?' prevents a console error if element doesn't exist (optional)
      document.getElementById('errorSummary')?.remove();
    };

    this.removeHints = () => {
      // Remove any existing hints, including any hardcoded ones in the html
      document.querySelectorAll('.hint').forEach(e => e.remove());
    };

    this.removeHint = fieldId => {
      // Used for real-time feedback on a single field
      // Remove any hints shown for the field with this id
      document.querySelectorAll(`.${fieldId}-hint`).forEach(el => el.remove());
    };

    this.updatePageTitle = () => {
      // Updating the page title since it's the first thing read by screen readers.
      // This will also provide another visual cue that the form is valid.
      // The title might appear in a browser tab and be truncated, so this
      // adds the number of errors to the beginning of the title.
      document.title = `(${this.errors.length} errors) ${this.originalPageTitle}`;
    };

    this.showErrorSummaryPanel = () => {
      const errorSummary = document.createElement('section');
      errorSummary.classList.add('error-summary');
      errorSummary.id = 'errorSummary';
      // Tabindex set to -1 so js can scroll to and focus on the panel, but not keyboard tab users
      errorSummary.setAttribute('tabindex', '-1');
      errorSummary.innerHTML = `<h2>Doh! The form submission has ${this.errors.length} errors</h2>`;
      // List the errors
      const errorList = document.createElement('ol');
      for (let i = 0; i < this.errors.length; i++) {
        const error = this.errors[i];
        const errorListItem = document.createElement('li');
        // Include link so users can scroll to and set focus on the offending field
        errorListItem.innerHTML = `<a href="#${error.fieldId}">${error.message}</a>`;
        errorList.insertAdjacentElement('beforeend', errorListItem);
      }
      errorSummary.insertAdjacentElement('beforeend', errorList);
      this.form.insertAdjacentElement('afterbegin', errorSummary);
      errorSummary.focus();
    };

    this.showHints = () => {
      for (let i = 0; i < this.errors.length; i++) {
        // For each error, add a hint to the field
        const error = this.errors[i];
        let formElement = document.getElementById(error.fieldId);
        formElement.classList.add('error');

        // If element is an <input>, update it's parent <label> element valid state instead
        formElement = formElement.tagName === 'INPUT' ? formElement.parentElement : formElement;

        // Remove the valid class in case it's been edited
        formElement.classList.remove('valid');
        formElement.classList.add('not-valid');

        // Add the message in a <span> inside the <label>, or if formElement
        // is a <fieldset>, put the hint message in a <p> instead
        const messageWrapper = formElement.tagName === 'FIELDSET' ? 'p' : 'span';
        const hint = document.createElement(messageWrapper);
        hint.classList.add('hint', `${error.fieldId}-hint`);
        hint.innerText = error.message;
        // Some screen reader users have a special command to read the current statuses
        hint.setAttribute('role', 'status');
        // To maximize compatibility, add a redundant aria-live="polite" attribute (per MDN)
        // aria-live regions announce their content when it changes
        hint.setAttribute('aria-live', 'polite');
        hint.setAttribute('style', 'display:block');
        formElement.insertAdjacentElement('beforeend', hint);
      }
    };

    this.showHint = (fieldId, error) => {
      // Used for real-time feedback on a single field
      let element = document.getElementById(fieldId);

      // Add a hint to a single field
      element.classList.add('error');

      // If element is an <input>, update it's parent <label> element valid state instead
      element = element.tagName === 'INPUT' ? element.parentElement : element;

      // Remove the valid class in case it's been edited
      element.classList.remove('valid');
      element.classList.add('not-valid');

      // Add the message in a <span> inside the <label>, or if formElement
      // is a <fieldset>, put the hint message in a <p> instead
      // const messageWrapper = element.tagName === 'FIELDSET' ? 'p' : 'span';
      const hint = document.createElement(element.tagName === 'FIELDSET' ? 'p' : 'span');
      hint.classList.add('hint', `${fieldId}-hint`);
      hint.innerText = error.message;
      // Some screen reader users have a special command to read the current statuses
      hint.setAttribute('role', 'status');
      // To maximize compatibility, add a redundant aria-live="polite" attribute (per MDN)
      // aria-live regions announce their content when it changes
      hint.setAttribute('aria-live', 'polite');
      hint.setAttribute('style', 'display:block');
      element.insertAdjacentElement('beforeend', hint);
    };

    this.showValid = formElement => {
      formElement.classList.remove('error');

      // If element is an <input>, update it's parent <label>
      formElement = formElement.tagName === 'INPUT' ? formElement.parentElement : formElement;

      // Remove the valid/not-valid classes in case form is being re-submitted
      formElement.classList.remove('valid');
      formElement.classList.remove('not-valid');

      formElement.classList.add('valid');
    };

    this.addValidator = (element, rules) => {
      // Push a validator object to the validators array
      // Note the 'field' property is populated by selecting
      // the element in the form with the id from 'element'
      this.validators.push({
        fieldId: element,
        rules: rules,
        field: this.form.elements[element]
      });
    };

    this.validateForm = () => {
      this.errors = [];

      // NOTE: To view the array of validation objects in the console,
      // uncomment the following line and submit the form again.
      // console.log('validators:', this.validators);

      // This loops through each object in the validators array
      // Each object refers to a html element and each rule for the element
      // has an optional 'condition' and 'method's to validate it.
      for (let elementIndex = 0; elementIndex < this.validators.length; elementIndex++) {
        // Store the current object
        const element = this.validators[elementIndex];

        // Loop through the rules for the current object
        for (let rulesIndex = 0; rulesIndex < element.rules.length; rulesIndex++) {
          // If current rule has a condition, and the condition isn't met (returns false), skip to the next rule
          if (element.rules[rulesIndex].condition && !element.rules[rulesIndex].condition()) {
            continue;
          }

          // If method in current rule returns false, add it to the errors array and exit loop
          if (!element.rules[rulesIndex].method(element.field)) {
            // Store the invalid field name and error message
            this.errors.push({
              fieldId: element.fieldId,
              message: element.rules[rulesIndex].message
            });

            // NOTE: To run *all* validation rules without stopping on the first error,
            // comment out this break statement and submit an empty form.
            break;
          } else {
            // If field is valid add valid class and remove error/not-valid classes
            this.showValid(element.field);
          }
        }
      }
      // Return true if there are no errors, false if there are errors
      return this.errors.length === 0;
    };

    this.validateField = fieldId => {
      // Used for real-time feedback on a single field
      const validator = this.validators.find(validator => validator.fieldId === fieldId);

      if (!validator) {
        console.warn('No validator found for field with id:', fieldId);
      } else {
        for (let rulesIndex = 0; rulesIndex < validator.rules.length; rulesIndex++) {
          // If current rule has a condition, and the condition isn't met (returns false), skip to the next rule
          if (validator.rules[rulesIndex].condition && !validator.rules[rulesIndex].condition()) {
            continue;
          }

          // If method in current rule returns false, show a hint and exit loop
          if (!validator.rules[rulesIndex].method(validator.field)) {
            // Remove any hint messages shown for the field before showing a new one
            this.removeHint(fieldId);
            this.showHint(fieldId, validator.rules[rulesIndex]);

            // NOTE: To run *all* validation rules for this field without stopping on the first error,
            // comment out the above removeHint() call and this break statement and edit the field.
            break;
          } else {
            // If field is valid add valid class and remove error/not-valid classes
            this.showValid(validator.field);
            // Remove any hint messages shown for the field
            this.removeHint(fieldId);
          }
        }
      }
    };
  }
}

const addRegFormDefaults = () => {
  // Set focus on name field
  document.getElementById('name').focus();

  // Add smooth scrolling behavior to the page
  document.documentElement.style.scrollBehavior = 'smooth';

  // Hide other job role field till user selects 'other'
  document.getElementById('other-job-role').style.display = 'none';

  // Disable t-shirt color options
  document.getElementById('color').setAttribute('disabled', '');

  // Set default paymentType option to credit card
  document.getElementById('payment').children[1].selected = true;

  // Hide other payment type details
  document.getElementById('paypal').style.display = 'none';
  document.getElementById('bitcoin').style.display = 'none';
};

const addRegFormEventListeners = () => {
  const jobTitle = document.getElementById('title');
  const otherJobRole = document.getElementById('other-job-role');
  const tShirtDesign = document.getElementById('design');
  const tShirtColor = document.getElementById('color');
  const tShirtColorOptions = document.querySelectorAll('#color option');
  const activities = document.getElementById('activities');
  const activitiesCheckboxes = document.querySelectorAll('#activities-box input');
  const activitiesCost = document.getElementById('activities-cost');
  let totalCost = 0;
  const paymentType = document.getElementById('payment');
  const creditCard = document.getElementById('credit-card');
  const paypal = document.getElementById('paypal');
  const bitcoin = document.getElementById('bitcoin');

  // Show/hide other job role field
  jobTitle.addEventListener('change', ev => {
    ev.target.value === 'other' ? otherJobRole.style.display = 'block' : otherJobRole.style.display = 'none';
  });

  // Show/hide t-shirt color options
  tShirtDesign.addEventListener('change', ev => {
    tShirtColor.removeAttribute('disabled');
    tShirtColor.options[tShirtColor.selectedIndex].selected = false;
    tShirtColorOptions.forEach((option) => {
      option.dataset.theme === ev.target.value ? option.removeAttribute('hidden') : option.setAttribute('hidden', '');
    });
    // After design is selected, color prompt doesn't need to still say 'Select a design theme above'
    tShirtColorOptions[0].textContent = 'Select color option';
  });

  // Check for activities in same time slot and disable/enable them
  // so users can't select more than one activity per time slot
  activitiesCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', ev => {
      const clickedCheckbox = ev.target;

      // Check other activities for time conflicts with the selected activity time
      activitiesCheckboxes.forEach(activity => {
        if (activity !== clickedCheckbox && activity.dataset.dayAndTime === clickedCheckbox.dataset.dayAndTime) {
          // Disable or enable conflicts depending on if selecting/unselecting an activity
          if (!clickedCheckbox.checked) {
            // Enable conflicting activities so they might be selected
            activity.removeAttribute('disabled');
            activity.parentElement.classList.remove('disabled');
          } else {
            // Disable conflicting activities so they can't be selected
            activity.setAttribute('disabled', '');
            activity.parentElement.classList.add('disabled');
          }
        }
      });
    });
  });

  // Add/subtract cost of activities to total cost
  activities.addEventListener('change', ev => {
    const clickedCheckbox = ev.target;
    const checkboxCost = parseInt(clickedCheckbox.dataset.cost, 10);
    clickedCheckbox.checked ? totalCost += checkboxCost : totalCost -= checkboxCost;
    activitiesCost.textContent = `Total: $${totalCost}`;
  });

  // Update activity label colors on focus/blur
  activitiesCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('focus', ev => {
      ev.target.parentElement.classList.add('focus');
    });
    checkbox.addEventListener('blur', ev => {
      ev.target.parentElement.classList.remove('focus');
    });
  });

  // Payment Info
  paymentType.addEventListener('change', ev => {
    [creditCard, paypal, bitcoin].forEach(div => { div.style.display = 'none'; });
    document.getElementById(ev.target.value).style.display = 'block';
  });
};

const addRegFormValidationRules = regFormValidator => {
  // Add name field validations
  regFormValidator.addValidator(
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
  );

  // Add email field validations
  regFormValidator.addValidator(
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
  );

  // Add activities validations
  regFormValidator.addValidator(
    'activities', [
      {
        method: field => {
          return field.querySelectorAll('#activities input[type="checkbox"]:checked').length > 0;
        },
        message: 'Choose at least one activity'
      }
    ]
  );

  // Add credit card number validations
  // Include a condition to check if credit card is selected
  regFormValidator.addValidator(
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
  );

  // Add zip code field validations
  regFormValidator.addValidator(
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
  );

  // Add cvv field validations
  regFormValidator.addValidator(
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
  );
};

const addRegFormRealTimeEventListeners = regFormValidator => {
  const name = document.getElementById('name');
  const email = document.getElementById('email');

  // Validate name on input and blur
  const validateName = () => {
    regFormValidator.validateField('name');
  };
  name.addEventListener('input', validateName);
  name.addEventListener('blur', validateName);

  // Validate email on input and blur
  const validateEmail = () => {
    regFormValidator.validateField('email');
  };
  email.addEventListener('input', validateEmail);
  email.addEventListener('blur', validateEmail);
};

const addRegFormSubmitEventListener = regFormValidator => {
  regForm.addEventListener('submit', ev => {
    ev.preventDefault();
    // Reset form before validating in case previously submitted
    regFormValidator.resetPageTitle();
    regFormValidator.resetErrorSummaryPanel();
    regFormValidator.removeHints();
    if (!regFormValidator.validateForm()) {
      regFormValidator.updatePageTitle();
      regFormValidator.showErrorSummaryPanel();
      regFormValidator.showHints();
    } else {
      // Submit the form!
      // Note currently nothing is actually submitted anywhere.
      // Page is just refreshed.
      location.reload();
    }
  });
};

// Select the first form on the page
const regForm = document.forms[0];

// If form exists, add behaviors to it
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
}
