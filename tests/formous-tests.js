import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';

import Formous from '../src/formous';

function createFormComponent(options) {
  const Component = (props) => {
    return (
      <div>
        <button onClick={props.formSubmit(props.onSubmit)}></button>
      </div>
    );
  };
  return Formous(options)(Component);
}

describe('Formous', () => {
  it('has an untouched valid form when submitted', (done) => {
    const options = {
      fields: {},
    };
    const Form = createFormComponent(options);
    const wrapper = mount(<Form onSubmit={(formStatus) => {
      expect(formStatus.valid).to.be.true;
      expect(formStatus.touched).to.be.fale;
      done();
    }} />);
    wrapper.find('button').simulate('click');
  });

  it('runs validation on submit', (done) => {
    const options = {
      fields: {
        name: {
          tests: [
            {
              critical: true,
              failProps: {},
              test: () => false,
            },
          ],
        },
      },
    };
    const Form = createFormComponent(options);
    const wrapper = mount(<Form onSubmit={(formStatus) => {
      expect(formStatus.valid).to.be.false;
      done();
    }} />);
    wrapper.find('button').simulate('click');
  });

  it('does not block submit when non-critical tests fail', (done) => {
    const options = {
      fields: {
        name: {
          tests: [
            {
              critical: false,
              failProps: {},
              test: () => false,
            },
          ],
        },
      },
    };
    const Form = createFormComponent(options);
    const wrapper = mount(<Form onSubmit={(formStatus) => {
      expect(formStatus.valid).to.be.true;
      done();
    }} />);
    wrapper.find('button').simulate('click');
  });
});
