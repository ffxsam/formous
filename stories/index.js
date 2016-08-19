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
  });
