import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import Formous from '../src';

const Error = (props) => {
  return <span>{props.error}</span>
};

storiesOf('Formous', module)
  .add('simple required field', () => {
    const options = {
      fields: {
        name: {
          tests: [
            {
              critical: true,
              failProps: { error: 'Field is required' },
              test(value) {
                return value !== '';
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
            <input type="text" { ...fields.name.events } />
            <Error { ...fields.name.failProps } />
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
  .add('test chaining', () => {
    const options = {
      fields: {
        password: {
          tests: [
            {
              critical: true,
              failProps: { error: 'Password is required' },
              test(value) {
                return value !== '';
              },
            },
          ],
          alsoTest: ['confirmPass'],
        },
        confirmPass: {
          tests: [
            {
              critical: true,
              failProps: { error: 'Confirmation is required' },
              test(value, fields) {
                if (!fields.password) return true;
                return fields.password.value === '' || value !== '';
              },
            },
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
            Password: <input type="password" { ...fields.password.events } />
            <Error { ...fields.password.failProps } />
          </div>
          <div>
            Confirm: <input type="password" { ...fields.confirmPass.events } />
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
  });
