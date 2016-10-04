import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import Formous from '../src';

const Error = (props) => {
  return <span>{props.error}</span>
};

const requiredField = {
  critical: true,
  failProps: { error: 'Field is required' },
  test(value) {
    return value !== '';
  },
};

storiesOf('Formous', module)
  .add('simple required field', () => {
    const options = {
      fields: {
        name: {
          tests: [requiredField],
        },
        description: {
          tests: [requiredField],
        },
      },
    };
    const Example = ({ fields, formSubmit, clearForm }) => {
      const submit = (formStatus) => {
        action('form submit: ', JSON.stringify(formStatus));
      };

      return <div>
        <form onSubmit={formSubmit(submit)}>
          <div>
            <input
              type="text"
              value={fields.name.value}
              { ...fields.name.events }
            />
            <Error { ...fields.name.failProps } />
            <br />
            <input
              type="text"
              value={fields.description.value}
              { ...fields.description.events }
            />
            <Error { ...fields.description.failProps } />
          </div>

          <div>
            <input type="submit" />
            <button type="button" onClick={clearForm}>Reset</button>
          </div>
        </form>
      </div>
    };
    const Wrapped = Formous(options)(Example);

    return <Wrapped />
  })

  .add('update multiple fields', () => {
    const options = {
      fields: {
        name: {
          tests: [requiredField],
        },
        description: {
          tests: [requiredField],
        },
      },
    };
    const Example = ({ fields, formSubmit, clearForm, updateFormFields }) => {
      const submit = (formStatus) => {
        action('form submit: ', JSON.stringify(formStatus));
      };

      const codeBlock = `this.props.updateFormFields({
  name: '',
  description: 'this is a description',
});`

      return <div>
        <form onSubmit={formSubmit(submit)}>
          <div>
            <p>
              Use <code>this.props.updateFormFields(values: Object)</code> to
              update the value of multiple fields at once.
            </p>

            <p>This will also run validations and update the form status</p>

            <pre>
              <code>
                {codeBlock}
              </code>
            </pre>
            <button
              onClick={() => {
                updateFormFields({
                  name: '',
                  description: 'this is a description',
                });
              }}>
              set the value of multiple fields
            </button><br />
            <input
              type="text"
              value={fields.name.value}
              { ...fields.name.events }
            />
            <Error { ...fields.name.failProps } />
            <br />
            <input
              type="text"
              value={fields.description.value}
              { ...fields.description.events }
            />
            <Error { ...fields.description.failProps } />
          </div>

          <div>
            <input type="submit" />
            <button type="button" onClick={clearForm}>Reset</button>
          </div>
        </form>
      </div>
    };
    const Wrapped = Formous(options)(Example);

    return <Wrapped />
  })

  .add('test chaining', () => {
    const options = {
      fields: {
        password: {
          tests: [requiredField],
          alsoTest: ['confirmPass'],
        },
        confirmPass: {
          tests: [
            requiredField,
            {
              critical: true,
              failProps: { error: 'Passwords do not match' },
              test(value, fields) {
                if (!fields.password) return true;
                return value === fields.password.value;
              },
            },
          ],
        },
      },
    };
    const Example = ({ fields, formSubmit }) => {
      return <div>
        <form onSubmit={formSubmit(action('form submit'))}>
          <div>
            Password: <input
            type="password"
            value={fields.password.value}
            { ...fields.password.events }
          />
            <Error { ...fields.password.failProps } />
          </div>
          <div>
            Confirm: <input
            type="password"
            value={fields.confirmPass.value}
            { ...fields.confirmPass.events }
          />
            <Error { ...fields.confirmPass.failProps } />
          </div>

          <div>
            <input type="submit" />
          </div>
        </form>
      </div>
    };
    const Wrapped = Formous(options)(Example);

    return <Wrapped />
  })

  .add('default values', () => {
    const options = {
      fields: {
        name: {
          tests: [requiredField],
        },
        age: {
          tests: [
            requiredField,
            {
              critical: true,
              failProps: { error: 'Must be a number.' },
              test(value) {
                return /^\d+$/.test(value);
              },
            },
          ],
        },
      },
    };
    class Example extends React.Component {
      componentDidMount() {
        this.props.setDefaultValues({
          name: 'Your name',
          age: 28,
        });
      }

      dumpFormState = () => {
        action('form state')(this.props.formState);
      };

      render() {
        const { formSubmit, fields } = this.props;

        return <div>
          <form onSubmit={formSubmit(action('form submit'))}>
            <div>
              Name: <input
              type="text"
              value={fields.name.value}
              { ...fields.name.events }
            />
              <Error { ...fields.name.failProps } />
            </div>

            <div>
              Age: <input
              type="text"
              value={fields.age.value}
              { ...fields.age.events }
            />
              <Error { ...fields.age.failProps } />
            </div>

            <div>
              <input type="submit" />
              <button type="button" onClick={this.dumpFormState}>
                Dump formState
              </button>
            </div>
          </form>
        </div>
      }
    }
    const Wrapped = Formous(options)(Example);

    return <Wrapped />
  });
