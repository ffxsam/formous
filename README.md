# Formous [![Build Status](https://travis-ci.org/ffxsam/formous.svg?branch=master)](https://travis-ci.org/ffxsam/formous)

### Simple and elegant form-handling for React

Formous strives to be a *simple*, elegant solution to handling forms in React. Formous's features and benefits:

* Allows easy testing/validation of fields.
* Can differentiate between critical (blocker) field errors and warnings (can still submit the form).
* Super simple to use. No over-engineering here!
* Unopinionated when it comes to UI. Formous just tells you what you need to know and lets you handle the rest.

## Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage](#usage)
  - [Formous Options](#formous-options)
    - [Test Object Structure](#test-object-structure)
    - [Test-Chaining](#test-chaining)
  - [Handling Form Submission](#handling-form-submission)
- [Reference](#reference)
  - [Formous-Supplied Props](#formous-supplied-props)
    - [`clearForm: Function`](#clearform-function)
    - [`fields: Object`](#fields-object)
    - [`formSubmit: (handler: Function) => Function`](#formsubmit-handler-function--function)
    - [`formState: Object`](#formstate-object)
    - [`setDefaultValues: (fields: Object)`](#setdefaultvalues-fields-object)
  - [Formous Wrapper Options](#formous-wrapper-options)
    - [`fields: Object`](#fields-object-1)
- [Planned Features](#planned-features)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

    npm i --save formous

## Quick Start

Use the code snippet below as an example to help you get started right away.

```js
import React, { Component } from 'react';
import Formous from 'formous';

class ErrorText extends Component {
  render() {
    return <div style={{ color: '#f00' }}>
      {this.props.errorText}
    </div>
  }
}

class MyComponent extends Component {
  componentWillReceiveProps(nextProps) {
  	// Set default form values (might be appropriate in a different method
  	this.props.setDefaultValues({
  	  age: 33,
  	  name: 'Sir Fluffalot',
  	});
  }
  
  handleSubmit(formStatus, fields) {
    if (!formStatus.touched) {
      alert('Please fill out the form.');
      return;
    }

    if (!formStatus.valid) {
      alert('Please address the errors in the form.');
      return;
    }

    // All good! Do something with fields.name.value and fields.age.value
    console.log(formStatus, fields);
  }

  render() {
    const {
      fields: { age, name },
      formSubmit,
    } = this.props;

    return <div>
      <form onSubmit={formSubmit(this.handleSubmit)}>
        <div>
          <input
            placeholder="Name"
            type="text"
            value={name.value}
            { ...name.events }
          />
          <ErrorText { ...name.failProps } />
        </div>
        <div>
          <input
            placeholder="Age"
            type="text"
            value={age.value}
            { ...age.events }
          />
          <ErrorText { ...age.failProps } />
        </div>
        <div>
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  }
}

const formousOptions = {
  fields: {
    name: {
      name: 'name',
      tests: [
        {
          critical: true,
          failProps: {
            errorText: 'Name is required.',
          },
          test(value) {
            return value !== '';
          },
        }
      ],
    },

    age: {
      name: 'age',
      tests: [
        {
          critical: true,
          failProps: {
            errorText: 'Age should be a number.',
          },
          test(value) {
            return /^\d*$/.test(value);
          },
        },
        {
          critical: false,
          failProps: {
            errorText: 'Are you sure you\'re that old? :o',
          },
          test(value) {
            return +value < 120;
          },
        },
      ],
    },
  },
};

export default Formous(formousOptions)(MyComponent)
```

## Usage

Formous is a [higher-order component](https://medium.com/@dan_abramov/mixins-are-dead-long-live-higher-order-components-94a0d2f9e750) that you can use to wrap your component in order to supply it with field validation, error notifications, and form submission handling.

Import Formous at the top of your component's code:

```js
import Formous from 'formous';
```

And at the bottom:

```js
export default Formous(options)(MyComponent)
```

We'll get into the the `options` in a bit. Wrapping your component with Formous provides extra props (such as `fields`) that you'll use to apply event-handlers and error-reporting to any JSX elements you wish. Let's say you have username and password fields in your component that you want Formous to handle. That could look like this:

```js
const { username, password } = this.props.fields;

return <div>
  <div>
    Username:
    <input
      type="text"
      value={username.value}
      { ...username.events }
    />
  </div>

  <div>
    Password:
    <input
      type="password"
      value={password.value}
      { ...password.events }
    />
  </div>
</div>
```

This applies `onBlur`, `onChange,` and `onFocus` handlers to the appropriate elements. These will become [controlled inputs](https://facebook.github.io/react/docs/forms.html#controlled-components), so be sure to include the `value={...}` attribute!

Formous was built to work with any UI framework (or none at all). So if, for example, you happen to be using Material UI, this would work just as well:

```js
<TextField
  floatingLabelText="Email"
  spellCheck={false}
  value={email.value}
  { ...email.events }
/>
```

### Formous Options

The `Formous` wrapper component requires a single argument, which is an object literal containing information about your fields, including tests to run in order to perform validation. The general format for the options is as follows:

```js
const options = {
  fields: {
    field1: {
      name: 'field1', // must match the property name
      tests: [
        {
          critical: true, // is this test fails, it's a blocker to submitting the form
          failProps: {
            // the props that should be applied to a given element if the test fails
          },
          test(value, fields) {
            /*
             * value: string
             *   The value of this field at the time the test is run (on blur)
             * fields: Object
             *   Access to all the values of the fields in this options object.
             *   This is used for side-effect/chained tests.
             */

            // return true if value is good, otherwise return false
          },
        },
      ],
      alsoTest: [
        // Array of field names to test after this field is tested
      ],
    },

    field2: {
      // ...
    },
  },
};
```

#### Test Object Structure

Let's cover the test object properties in detail.

**`critical: boolean`**

If this test is critical and the test fails, it's considered a blocker. This means two things: #1, the form will be considered to be in an invalid state, and #2, any subsequent tests for this field will not be run.

If the test is not critical, it's considered a warning and the form will still be in a valid state. You could use this, for example, to warn someone that their password is not strong enough but you don't want to prevent form submission.

Make sure critical tests are ***always*** placed above non-critical tests! Only a single error can be returned from Formous, so if a non-critical test is above a critical one and it fails, no more tests in the list will be performed.

**`failProps: Object`**

This object contains properties that you'd want to apply to a particular element in order to indicate to the user that the field in question failed validation. Being a collection of props, this allows the developer more freedom in handling how they want to display an error.

For instance, in Material UI, a `TextField` component can accept the props `errorText` and `errorStyle` to display an error. So in Formous, we might specify `failProps` as such:

```js
failProps: {
  errorStyle: { color: '#f00' },
  errorText: 'Email is required.',
},
```

Then we just make sure these props get applied to the `TextField` element:

```js
<TextField
  floatingLabelText="Email"
  spellCheck={false}
  value={email.value}
  { ...email.events }
  { ...email.failProps }
/>
```

**`test: (value: string, fields: Object) => boolean`**

The `test` function is called whenever the field's `onBlur` event is triggered. Two arguments are passed into `test`: the first is the value of the field at the time of the blur event, and the second is an object containing all the fields that Formous is managing. This is useful for [test-chaining](#test-chaining).

Simply perform whatever test you need on the given value, and return `true` if it's valid, or `false` if not.

#### Test-Chaining

Formous supports test-chaining, via the `alsoTest` array, which allows you to test related fields after the current field has passed its own tests. This is useful in cases where one field relies upon another, such as when a password field has been filled out but its corresponding confirmation field has not. In this example, when the user fills out the password field and tabs out of it, you wouldn't necessarily want the confirmation field to display an error because they haven't even gotten to that point yet. This is why Formous will quietly mark the confirmation field as invalid without returning an error. This effectively marks the entire form as invalid, but gives the user a chance to finish filling it out. See the example below.

```js
const passwordFilled = {
  critical: true,
  failProps: {
    errorStyle,
    errorText: 'Password is too short.',
  },
  test(value) {
    return value === '' || value.length >= 4;
  },
};

const options = {
  fields: {
    password: {
      name: 'password',
      tests: [
        passwordFilled,
      ],
      alsoTest: ['passwordConfirm'],
    },

    passwordConfirm: {
      name: 'passwordConfirm',
      tests: [
        passwordFilled,
        {
          critical: true,
          failProps: {
            errorStyle,
            errorText: 'Please confirm the password you typed above.',
          },
          test(value, fields) {
            if (!fields.password) return true; // fields not populated yet
            return fields.password.value === '' || value !== '';
          },
        },
        {
          critical: true,
          failProps: {
            errorStyle,
            errorText: 'The passwords do not match.',
          },
          test(value, fields) {
            if (!fields.password) return true;
            return value === fields.password.value;
          },
        },
      ],
    },
  },
};
```

### Handling Form Submission

Formous passes another prop into the wrapped component, called `formSubmit`. You pass `formSubmit` a single function, and it returns a bound function which should be used in your form `onSubmit` prop. For example:

```js
class MyComponent extends Component {
  handleSubmit(formStatus, fields) {   
  }
  
  render() {
    return <div>
      <form onSubmit={this.props.formSubmit(this.handleSubmit)}>
        {/* ... */}
      </form>
    </div>
  }
}
```

## Reference

All annotations use [Flow](https://flowtype.org/) syntax.

### Formous-Supplied Props

#### `clearForm: Function`

* Call with no arguments. Sets all fields to empty.

#### `fields: Object`

* `<field name>`
  * `value: string` - the current value of the field
  * `events: Object` - contains events necessary to capture field input
  * `failProps: Object` - contains the props specified in the Formous wrapper options, or an empty object if there's no error

#### `formSubmit: (handler: Function) => Function`

* `handler: (formStatus: Object, fields: Object)` - the function to be called when the user attempts to submit the form
  * `formStatus: { touched: boolean, valid: boolean }`
    * `touched` - indicates whether the form has been "touched" at all (if any fields have received focus)
    * `valid` - indicates whether the field is valid

#### `formState: Object`

* `touched: boolean` - whether the form has been touched (field focused)
* `valid: boolean` - whether the form is valid

#### `setDefaultValues: (fields: Object)`

* `fields` - name/value pairs, e.g.:

```js
this.props.setDefaultValues({
  name: 'My Name',
  age: 30,
});
```

### Formous Wrapper Options

#### `fields: Object`

* `name: string` - name of the field
* `tests: Array<Object>` - sequential list of tests to perform
  * `critical: boolean` - whether the test failure is a blocker
  * `failProps: Object` - props to pass into wrapped component in case of test failure
  * `test: (value: string, fields: Object) => boolean` - test function
    * `value` - the field's current value (at the time of the test)
    * `fields` - an object containing values of all the fields in the form
* `alsoTest: Array<string>` - a list of field names to test after this field's tests are complete

## Planned Features

* Implement support for multi-step forms.
* Give the ability for the `test` function to perform an async operation and report the result (as well as indicate when it's busy/done).
* Allow for the error message to be conveyed as a simple string instead of props.