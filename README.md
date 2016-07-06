# Formous

### Simple and elegant form-handling for React

Formous strives to be a _simple_, elegant solution to handling forms in React. Formous's features and benefits:

* Allows easy testing/validation of fields.
* Can differentiate between critical (blocker) field errors and warnings (can still submit the form).
* Super simple to use. No over-engineering here!
* Unopinionated when it comes to UI. Formous just tells you what you need to know and lets you handle the rest.

## Installation

    npm i --save formous

## Quick Start

Use the code snippet below as an example to help you get started right away.

```jsx
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

export default Formous(fields)(MyComponent)
```

### Documentation coming soon.