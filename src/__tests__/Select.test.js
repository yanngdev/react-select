import React from 'react';
import { shallow, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import cases from 'jest-in-case';

import { OPTIONS, OPTIONS_NUMBER_VALUE, OPTIONS_BOOLEAN_VALUE } from './constants';
import Select from '../Select';
import { components } from '../components';
import { A11yText } from '../primitives';

const {
  ClearIndicator,
  Control,
  IndicatorsContainer,
  Input,
  DropdownIndicator,
  Menu,
  MultiValue,
  NoOptionsMessage,
  Option,
  Placeholder,
  ValueContainer,
  SingleValue } = components;

const BASIC_PROPS = {
  onChange: jest.fn(),
  onInputChange: jest.fn(),
  onMenuClose: jest.fn(),
  onMenuOpen: jest.fn(),
  name: 'test-input-name',
  options: OPTIONS,
};

test('snapshot - defaults', () => {
  const tree = shallow(<Select />);
  expect(toJson(tree)).toMatchSnapshot();
});

test('hidden input field is not present if name is not passes', () => {
  let selectWrapper = mount(<Select options={OPTIONS} />);
  expect(selectWrapper.find('input[type="hidden"]').exists()).toBeFalsy();
});

cases('formatOptionLabel', ({ props, valueComponent, expectedOptions }) => {
  let selectWrapper = shallow(
    <Select
      {...props}
    />
  );
  let value = selectWrapper.find(valueComponent).at(0);
  expect(value.props().children).toBe(expectedOptions);
}, {
    'single select > should format label of options according to text returned by formatOptionLabel': {
      props: {
        ...BASIC_PROPS,
        formatOptionLabel: ({ label, value }, { context }) => (`${label} ${value} ${context}`),
        value: OPTIONS[0],
      },
      valueComponent: SingleValue,
      expectedOptions: '0 zero value'
    },
    'multi select > should format label of options according to text returned by formatOptionLabel': {
      props: {
        ...BASIC_PROPS,
        formatOptionLabel: ({ label, value }, { context }) => (`${label} ${value} ${context}`),
        isMulti: true,
        value: OPTIONS[0],
      },
      valueComponent: MultiValue,
      expectedOptions: '0 zero value'
    }
  });


cases('name prop', ({ expectedName, props }) => {
  let selectWrapper = shallow(<Select {...props} />);
  let input = selectWrapper.find('input');
  expect(input.props().name).toBe(expectedName);
}, {
    'single select > should assign the given name': { props: { ...BASIC_PROPS, name: 'form-field-single-select' }, expectedName: 'form-field-single-select' },
    'multi select > should assign the given name': {
      props: {
        ...BASIC_PROPS,
        name: 'form-field-multi-select',
        isMulti: true,
        value: OPTIONS[2]
      },
      expectedName: 'form-field-multi-select'
    },
  });

cases('menuIsOpen prop', ({ props = BASIC_PROPS }) => {
  let selectWrapper = shallow(<Select {...props} />);
  expect(selectWrapper.find(Menu).exists()).toBeFalsy();

  selectWrapper.setProps({ menuIsOpen: true });
  expect(selectWrapper.find(Menu).exists()).toBeTruthy();

  selectWrapper.setProps({ menuIsOpen: false });
  expect(selectWrapper.find(Menu).exists()).toBeFalsy();
}, {
    'single select > should show menu if menuIsOpen is true and hide menu if menuIsOpen prop is false': {},
    'multi select > should show menu if menuIsOpen is true and hide menu if menuIsOpen prop is false': {
      props: {
        ...BASIC_PROPS,
        isMulti: true,
      }
    }
  });

cases('filterOption() prop - should filter only if function returns truthy for value', ({ props, searchString, expectResultsLength }) => {
  let selectWrapper = shallow(<Select {...props} />);
  selectWrapper.setProps({ inputValue: searchString });
  expect(selectWrapper.find(Option).length).toBe(expectResultsLength);
}, {
    'single select > should filter all options as per searchString': {
      props: {
        ...BASIC_PROPS,
        filterOption: (value, search) => value.value.indexOf(search) > -1,
        menuIsOpen: true,
        value: OPTIONS[0],
      },
      searchString: 'o',
      expectResultsLength: 5,
    },
    'multi select > should filter all options other that options in value of select': {
      props: {
        ...BASIC_PROPS,
        filterOption: (value, search) => value.value.indexOf(search) > -1,
        isMulti: true,
        menuIsOpen: true,
        value: OPTIONS[0],
      },
      searchString: 'o',
      expectResultsLength: 4,
    },
  });

cases('filterOption prop is null', ({ props, searchString, expectResultsLength }) => {
  let selectWrapper = shallow(<Select {...props} />);
  selectWrapper.setProps({ inputValue: searchString });
  expect(selectWrapper.find(Option).length).toBe(expectResultsLength);
}, {
    'single select > should show all the options': {
      props: {
        ...BASIC_PROPS,
        filterOption: null,
        menuIsOpen: true,
        value: OPTIONS[0],
      },
      searchString: 'o',
      expectResultsLength: 17,
    },
    'multi select > should show all the options other than selected options': {
      props: {
        ...BASIC_PROPS,
        filterOption: null,
        isMulti: true,
        menuIsOpen: true,
        value: OPTIONS[0],
      },
      searchString: 'o',
      expectResultsLength: 16,
    },
  });

cases('no option found on search based on filterOption prop', ({ props, searchString }) => {
  let selectWrapper = shallow(<Select {...props} />);
  selectWrapper.setProps({ inputValue: searchString });
  expect(selectWrapper.find(NoOptionsMessage).exists()).toBeTruthy();
}, {
    'single Select > should show NoOptionsMessage': {
      props: {
        ...BASIC_PROPS,
        filterOption: (value, search) => value.value.indexOf(search) > -1,
        menuIsOpen: true,
      },
      searchString: 'some text not in options',
    },
    'multi select > should show NoOptionsMessage': {
      props: {
        ...BASIC_PROPS,
        filterOption: (value, search) => value.value.indexOf(search) > -1,
        menuIsOpen: true,
      },
      searchString: 'some text not in options',
    }
  });

cases('noOptionsMessage() function prop', ({ props, expectNoOptionsMessage, searchString }) => {
  let selectWrapper = shallow(<Select {...props} />);
  selectWrapper.setProps({ inputValue: searchString });
  expect(selectWrapper.find(NoOptionsMessage).props().children).toBe(expectNoOptionsMessage);
}, {
    'single Select > should show NoOptionsMessage returned from noOptionsMessage function prop': {
      props: {
        ...BASIC_PROPS,
        filterOption: (value, search) => value.value.indexOf(search) > -1,
        menuIsOpen: true,
        noOptionsMessage: () => 'this is custom no option message for single select',
      },
      expectNoOptionsMessage: 'this is custom no option message for single select',
      searchString: 'some text not in options',
    },
    'multi select > should show NoOptionsMessage returned from noOptionsMessage function prop': {
      props: {
        ...BASIC_PROPS,
        filterOption: (value, search) => value.value.indexOf(search) > -1,
        menuIsOpen: true,
        noOptionsMessage: () => 'this is custom no option message for multi select',
      },
      expectNoOptionsMessage: 'this is custom no option message for multi select',
      searchString: 'some text not in options',
    }
  });

cases('value prop', ({ props, expectedValue }) => {
  let selectWrapper = shallow(<Select {...props} />);
  expect(selectWrapper.state('selectValue')).toEqual(expectedValue);
}, {
    'single select > should set it as initial value': {
      props: {
        ...BASIC_PROPS,
        value: OPTIONS[2],
      },
      expectedValue: [{ label: '2', value: 'two' }],
    },
    'single select > with option values as number > should set it as initial value': {
      props: {
        ...BASIC_PROPS,
        value: OPTIONS_NUMBER_VALUE[2],
      },
      expectedValue: [{ label: '2', value: 2 }],
    },
    'multi select > should set it as initial value': {
      props: {
        ...BASIC_PROPS,
        isMulti: true,
        value: OPTIONS[1],
      },
      expectedValue: [{ label: '1', value: 'one' }],
    },
    'multi select > with option values as number > should set it as initial value': {
      props: {
        ...BASIC_PROPS,
        isMulti: true,
        value: OPTIONS_NUMBER_VALUE[1],
      },
      expectedValue: [{ label: '1', value: 1 }],
    }
  });

cases('update the value prop', ({ props = { ...BASIC_PROPS, value: OPTIONS[1] }, updateValueTo, expectedInitialValue, expectedUpdatedValue }) => {
  let selectWrapper = mount(<Select {...props} />);
  expect(selectWrapper.find('input[type="hidden"]').props().value).toEqual(expectedInitialValue);

  selectWrapper.setProps({ value: updateValueTo });
  expect(selectWrapper.find('input[type="hidden"]').props().value).toEqual(expectedUpdatedValue);
}, {
    'single select > should update the value when prop is updated': {
      updateValueTo: OPTIONS[3],
      expectedInitialValue: 'one',
      expectedUpdatedValue: 'three',
    },
    'single select > value of options is number > should update the value when prop is updated': {
      props: {
        ...BASIC_PROPS,
        options: OPTIONS_NUMBER_VALUE,
        value: OPTIONS_NUMBER_VALUE[2]
      },
      updateValueTo: OPTIONS_NUMBER_VALUE[3],
      expectedInitialValue: 2,
      expectedUpdatedValue: 3,
    },
    'multi select > should update the value when prop is updated': {
      props: {
        ...BASIC_PROPS,
        isMulti: true,
        value: OPTIONS[1],
      },
      updateValueTo: OPTIONS[3],
      expectedInitialValue: 'one',
      expectedUpdatedValue: 'three',
    },
    'multi select > value of options is number > should update the value when prop is updated': {
      props: {
        ...BASIC_PROPS,
        delimiter: ',',
        isMulti: true,
        options: OPTIONS_NUMBER_VALUE,
        value: OPTIONS_NUMBER_VALUE[2],
      },
      updateValueTo: [OPTIONS_NUMBER_VALUE[3], OPTIONS_NUMBER_VALUE[2]],
      expectedInitialValue: '2',
      expectedUpdatedValue: '3,2',
    },
  });

cases('calls onChange on selecting an option', ({ props = { ...BASIC_PROPS, menuIsOpen: true }, event, expectedSelectedOption, optionsSelected, focusedOption }) => {
  let onChangeSpy = jest.fn();
  props = { ...props, onChange: onChangeSpy };
  let selectWrapper = mount(<Select {...props} />);

  let selectOption = selectWrapper.find('div.react-select__option').findWhere(n => n.props().children === optionsSelected.label);
  selectWrapper.setState({ focusedOption });

  selectOption.simulate(...event);
  expect(onChangeSpy).toHaveBeenCalledWith(expectedSelectedOption, { action: 'select-option' });
}, {
    'single select > option is clicked > should call onChange() prop with selected option': {
      event: ['click'],
      optionsSelected: { label: '2', value: 'two' },
      expectedSelectedOption: { label: '2', value: 'two' },
    },
    'single select > option with number value > option is clicked > should call onChange() prop with selected option': {
      props: {
        ...BASIC_PROPS,
        menuIsOpen: true,
        options: OPTIONS_NUMBER_VALUE,
      },
      event: ['click'],
      optionsSelected: { label: '0', value: 0 },
      expectedSelectedOption: { label: '0', value: 0 },
    },
    'single select > option with boolean value > option is clicked > should call onChange() prop with selected option': {
      props: {
        ...BASIC_PROPS,
        menuIsOpen: true,
        options: OPTIONS_BOOLEAN_VALUE,
      },
      event: ['click'],
      optionsSelected: { label: 'true', value: true },
      expectedSelectedOption: { label: 'true', value: true },
    },
    'single select > tab key is pressed while focusing option > should call onChange() prop with selected option': {
      event: ['keyDown', { keyCode: 9, key: 'Tab' }],
      optionsSelected: { label: '1', value: 'one' },
      focusedOption: { label: '1', value: 'one' },
      expectedSelectedOption: { label: '1', value: 'one' },
    },
    'single select > enter key is pressed while focusing option > should call onChange() prop with selected option': {
      event: ['keyDown', { keyCode: 13, key: 'Enter' }],
      optionsSelected: { label: '3', value: 'three' },
      focusedOption: { label: '3', value: 'three' },
      expectedSelectedOption: { label: '3', value: 'three' },
    },
    'single select > space key is pressed while focusing option > should call onChange() prop with selected option': {
      event: ['keyDown', { keyCode: 32, Key: 'Spacebar' }],
      optionsSelected: { label: '1', value: 'one' },
      focusedOption: { label: '1', value: 'one' },
      expectedSelectedOption: { label: '1', value: 'one' },
    },
    'multi select > option is clicked > should call onChange() prop with selected option': {
      props: {
        ...BASIC_PROPS,
        isMulti: true,
        menuIsOpen: true,
        options: OPTIONS
      },
      event: ['click'],
      optionsSelected: { label: '2', value: 'two' },
      expectedSelectedOption: [{ label: '2', value: 'two' }],
    },
    'multi select > option with number value > option is clicked > should call onChange() prop with selected option': {
      props: {
        ...BASIC_PROPS,
        isMulti: true,
        menuIsOpen: true,
        options: OPTIONS_NUMBER_VALUE,
      },
      event: ['click'],
      optionsSelected: { label: '0', value: 0 },
      expectedSelectedOption: [{ label: '0', value: 0 }],
    },
    'multi select > option with boolean value > option is clicked > should call onChange() prop with selected option': {
      props: {
        ...BASIC_PROPS,
        isMulti: true,
        menuIsOpen: true,
        options: OPTIONS_BOOLEAN_VALUE,
      },
      event: ['click'],
      optionsSelected: { label: 'true', value: true },
      expectedSelectedOption: [{ label: 'true', value: true }],
    },
    'multi select > tab key is pressed while focusing option > should call onChange() prop with selected option': {
      props: {
        ...BASIC_PROPS,
        isMulti: true,
        menuIsOpen: true,
        options: OPTIONS
      },
      event: ['keyDown', { keyCode: 9, key: 'Tab' }],
      menuIsOpen: true,
      optionsSelected: { label: '1', value: 'one' },
      focusedOption: { label: '1', value: 'one' },
      expectedSelectedOption: [{ label: '1', value: 'one' }],
    },
    'multi select > enter key is pressed while focusing option > should call onChange() prop with selected option': {
      props: {
        ...BASIC_PROPS,
        isMulti: true,
        menuIsOpen: true,
        options: OPTIONS
      },
      event: ['keyDown', { keyCode: 13, key: 'Enter' }],
      optionsSelected: { label: '3', value: 'three' },
      focusedOption: { label: '3', value: 'three' },
      expectedSelectedOption: [{ label: '3', value: 'three' }],
    },
    'multi select > space key is pressed while focusing option > should call onChange() prop with selected option': {
      props: {
        ...BASIC_PROPS,
        isMulti: true,
        menuIsOpen: true,
        options: OPTIONS,
      },
      event: ['keyDown', { keyCode: 32, key: 'Spacebar' }],
      optionsSelected: { label: '1', value: 'one' },
      focusedOption: { label: '1', value: 'one' },
      expectedSelectedOption: [{ label: '1', value: 'one' }],
    },
  });

cases('hitting escape on select option', ({ props, event, focusedOption, optionsSelected }) => {
  let onChangeSpy = jest.fn();
  let selectWrapper = mount(<Select {...props} onChange={onChangeSpy} onInputChange={jest.fn()} onMenuClose={jest.fn()} />);

  let selectOption = selectWrapper.find('div.react-select__option').findWhere(n => n.props().children === optionsSelected.label);
  selectWrapper.setState({ focusedOption });

  selectOption.simulate(...event);
  expect(onChangeSpy).not.toHaveBeenCalled();
}, {
    'single select > should not call onChange prop': {
      props: {
        ...BASIC_PROPS,
        menuIsOpen: true,
      },
      optionsSelected: { label: '1', value: 'one' },
      focusedOption: { label: '1', value: 'one' },
      event: ['keyDown', { keyCode: 27 }],
    },
    'multi select > should not call onChange prop': {
      props: {
        ...BASIC_PROPS,
        isMulti: true,
        menuIsOpen: true,
      },
      optionsSelected: { label: '1', value: 'one' },
      focusedOption: { label: '1', value: 'one' },
      event: ['keyDown', { keyCode: 27 }],
    }
  });


cases('click to open select', ({ props = BASIC_PROPS, expectedToFocus }) => {
  let selectWrapper = mount(<Select {...props} onMenuOpen={() => { }} />);

  // this will get updated on input click, though click on input is not bubbling up to control component
  selectWrapper.setState({ isFocused: true });
  let controlComponent = selectWrapper.find('div.react-select__control');
  controlComponent.simulate('mouseDown', { target: { tagName: 'div' } });
  expect(selectWrapper.state('focusedOption')).toEqual(expectedToFocus);
}, {
    'single select > should focus the first option': {
      expectedToFocus: { label: '0', value: 'zero' },
    },
    'multi select > should focus the first option': {
      props: {
        ...BASIC_PROPS,
        isMulti: true,
      },
      expectedToFocus: { label: '0', value: 'zero' },
    }
  });

cases('focus on options > keyboard interaction with Menu', ({ props, selectedOption, nextFocusOption, keyEvent = [] }) => {
  let selectWrapper = mount(<Select {...props} />);

  selectWrapper.setState({ focusedOption: selectedOption });
  expect(selectWrapper.state('focusedOption')).toEqual(selectedOption);

  keyEvent.map(event => selectWrapper.find(Menu).simulate('keyDown', event));
  expect(selectWrapper.state('focusedOption')).toEqual(nextFocusOption);
}, {
    'single select > ArrowDown key on first option should focus second option': {
      props: {
        ...BASIC_PROPS,
        menuIsOpen: true,
      },
      keyEvent: [{ keyCode: 40, key: 'ArrowDown' }],
      selectedOption: OPTIONS[0],
      nextFocusOption: OPTIONS[1],
    },
    'single select > ArrowDown key on last option should focus first option': {
      props: {
        menuIsOpen: true,
        options: OPTIONS
      },
      keyEvent: [{ keyCode: 40, key: 'ArrowDown' }],
      selectedOption: OPTIONS[OPTIONS.length - 1],
      nextFocusOption: OPTIONS[0],
    },
    'single select > ArrowUp key on first option should focus last option': {
      props: {
        menuIsOpen: true,
        options: OPTIONS
      },
      keyEvent: [{ keyCode: 38, key: 'ArrowUp' }],
      selectedOption: OPTIONS[0],
      nextFocusOption: OPTIONS[OPTIONS.length - 1],
    },
    'single select > ArrowUp key on last option should focus second last option': {
      props: {
        menuIsOpen: true,
        options: OPTIONS
      },
      keyEvent: [{ keyCode: 38, key: 'ArrowUp' }],
      selectedOption: OPTIONS[OPTIONS.length - 1],
      nextFocusOption: OPTIONS[OPTIONS.length - 2],
    },
    'single select > PageDown key takes us to next page with default page size of 5': {
      props: {
        menuIsOpen: true,
        options: OPTIONS
      },
      keyEvent: [{ keyCode: 34, key: 'PageDown' }],
      selectedOption: OPTIONS[0],
      nextFocusOption: OPTIONS[5],
    },
    'single select > PageDown key takes to the last option is options below is less then page size': {
      props: {
        menuIsOpen: true,
        options: OPTIONS
      },
      keyEvent: [{ keyCode: 34, key: 'PageDown' }],
      selectedOption: OPTIONS[OPTIONS.length - 3],
      nextFocusOption: OPTIONS[OPTIONS.length - 1],
    },
    'single select > PageUp key takes us to previous page with default page size of 5': {
      props: {
        menuIsOpen: true,
        options: OPTIONS
      },
      keyEvent: [{ keyCode: 33, key: 'PageUp' }],
      selectedOption: OPTIONS[6],
      nextFocusOption: OPTIONS[1],
    },
    'single select > PageUp key takes us to first option - previous options < pageSize': {
      props: {
        menuIsOpen: true,
        options: OPTIONS
      },
      keyEvent: [{ keyCode: 33, key: 'PageUp' }],
      selectedOption: OPTIONS[1],
      nextFocusOption: OPTIONS[0],
    },
    'single select > Home key takes up to the first option': {
      props: {
        menuIsOpen: true,
        options: OPTIONS
      },
      keyEvent: [{ keyCode: 36, key: 'Home' }],
      selectedOption: OPTIONS[OPTIONS.length - 3],
      nextFocusOption: OPTIONS[0],
    },
    'single select > End key takes down to the last option': {
      props: {
        menuIsOpen: true,
        options: OPTIONS
      },
      keyEvent: [{ keyCode: 35, key: 'End' }],
      selectedOption: OPTIONS[2],
      nextFocusOption: OPTIONS[OPTIONS.length - 1],
    },
    'multi select > ArrowDown key on first option should focus second option': {
      props: {
        isMulti: true,
        menuIsOpen: true,
        options: OPTIONS
      },
      keyEvent: [{ keyCode: 40, key: 'ArrowDown' }],
      selectedOption: OPTIONS[0],
      nextFocusOption: OPTIONS[1],
    },
    'multi select > ArrowDown key on last option should focus first option': {
      props: {
        isMulti: true,
        menuIsOpen: true,
        options: OPTIONS
      },
      keyEvent: [{ keyCode: 40, key: 'ArrowDown' }],
      selectedOption: OPTIONS[OPTIONS.length - 1],
      nextFocusOption: OPTIONS[0],
    },
    'multi select > ArrowUp key on first option should focus last option': {
      props: {
        isMulti: true,
        menuIsOpen: true,
        options: OPTIONS
      },
      keyEvent: [{ keyCode: 38, key: 'ArrowUp' }],
      selectedOption: OPTIONS[0],
      nextFocusOption: OPTIONS[OPTIONS.length - 1],
    },
    'multi select > ArrowUp key on last option should focus second last option': {
      props: {
        isMulti: true,
        menuIsOpen: true,
        options: OPTIONS
      },
      keyEvent: [{ keyCode: 38, key: 'ArrowUp' }],
      selectedOption: OPTIONS[OPTIONS.length - 1],
      nextFocusOption: OPTIONS[OPTIONS.length - 2],
    },
    'multi select > PageDown key takes us to next page with default page size of 5': {
      props: {
        isMulti: true,
        menuIsOpen: true,
        options: OPTIONS
      },
      keyEvent: [{ keyCode: 34, key: 'PageDown' }],
      selectedOption: OPTIONS[0],
      nextFocusOption: OPTIONS[5],
    },
    'multi select > PageDown key takes to the last option is options below is less then page size': {
      props: {
        isMulti: true,
        menuIsOpen: true,
        options: OPTIONS
      },
      keyEvent: [{ keyCode: 34, key: 'PageDown' }],
      selectedOption: OPTIONS[OPTIONS.length - 3],
      nextFocusOption: OPTIONS[OPTIONS.length - 1],
    },
    'multi select > PageUp key takes us to previous page with default page size of 5': {
      props: {
        isMulti: true,
        menuIsOpen: true,
        options: OPTIONS
      },
      keyEvent: [{ keyCode: 33, key: 'PageUp' }],
      selectedOption: OPTIONS[6],
      nextFocusOption: OPTIONS[1],
    },
    'multi select > PageUp key takes us to first option - previous options < pageSize': {
      props: {
        isMulti: true,
        menuIsOpen: true,
        options: OPTIONS
      },
      keyEvent: [{ keyCode: 33, key: 'PageUp' }],
      selectedOption: OPTIONS[1],
      nextFocusOption: OPTIONS[0],
    },
    'multi select > Home key takes up to the first option': {
      props: {
        isMulti: true,
        menuIsOpen: true,
        options: OPTIONS
      },
      keyEvent: [{ keyCode: 36, key: 'Home' }],
      selectedOption: OPTIONS[OPTIONS.length - 3],
      nextFocusOption: OPTIONS[0],
    },
    'multi select > End key takes down to the last option': {
      props: {
        isMulti: true,
        menuIsOpen: true,
        options: OPTIONS
      },
      keyEvent: [{ keyCode: 35, key: 'End' }],
      selectedOption: OPTIONS[2],
      nextFocusOption: OPTIONS[OPTIONS.length - 1],
    },
  });

// TODO: Cover more scenario
cases('hitting escape with inputValue in select', ({ props }) => {
  let spy = jest.fn();
  let selectWrapper = mount(<Select {...props} onInputChange={spy} onMenuClose={jest.fn()} />);

  selectWrapper.simulate('keyDown', { keyCode: 27, key: 'Escape' });
  expect(spy).toHaveBeenCalledWith('', { action: 'menu-close' });
}, {
    'single select > should call onInputChange prop with empty string as inputValue': {
      props: {
        ...BASIC_PROPS,
        inputValue: 'test',
        menuIsOpen: true,
        value: OPTIONS[0],
      },
    },
    'multi select > should call onInputChange prop with empty string as inputValue': {
      props: {
        ...BASIC_PROPS,
        inputValue: 'test',
        isMulti: true,
        menuIsOpen: true,
        value: OPTIONS[0],
      },
    }
  });

cases('Clicking dropdown indicator with primary button on mouse', ({ props = BASIC_PROPS }) => {
  let onMenuOpenSpy = jest.fn();
  let onMenuCloseSpy = jest.fn();
  let selectWrapper = mount(<Select {...props} onMenuOpen={onMenuOpenSpy} onMenuClose={onMenuCloseSpy} onInputChange={jest.fn()} />);
  let downButtonWrapper = selectWrapper.find('div.react-select__dropdown-indicator');

  // opens menu if menu is closed
  expect(selectWrapper.props().menuIsOpen).toBe(false);
  downButtonWrapper.simulate('mouseDown', { button: 0 });
  expect(onMenuOpenSpy).toHaveBeenCalled();

  // closes menu if menu is opened
  selectWrapper.setProps({ menuIsOpen: true });
  downButtonWrapper.simulate('mouseDown', { button: 0 });
  expect(onMenuCloseSpy).toHaveBeenCalled();
}, {
    'single select > should call onMenuOpen prop when select is opened and onMenuClose prop when select is closed': {},
    'multi select > should call onMenuOpen prop when select is opened and onMenuClose prop when select is closed': {
      props: {
        ...BASIC_PROPS,
        isMulti: true,
      }
    }
  });

cases('clicking on select using secondary button on mouse', ({ props = BASIC_PROPS }) => {
  let onMenuOpenSpy = jest.fn();
  let onMenuCloseSpy = jest.fn();
  let selectWrapper = mount(<Select {...props} onMenuOpen={onMenuOpenSpy} onMenuClose={onMenuCloseSpy} />);
  let downButtonWrapper = selectWrapper.find('div.react-select__dropdown-indicator');

  // opens menu if menu is closed
  expect(selectWrapper.props().menuIsOpen).toBe(false);
  downButtonWrapper.simulate('mouseDown', { button: 1 });
  expect(onMenuOpenSpy).not.toHaveBeenCalled();

  // closes menu if menu is opened
  selectWrapper.setProps({ menuIsOpen: true });
  downButtonWrapper.simulate('mouseDown', { button: 1 });
  expect(onMenuCloseSpy).not.toHaveBeenCalled();
}, {
    'single select > seconday click is ignored  >should not call onMenuOpen and onMenuClose prop': {},
    'multi select > seconday click is ignored > should not call onMenuOpen and onMenuClose prop': {
      props: {
        ...BASIC_PROPS,
        isMulti: true,
      }
    }
  });

cases('required on input is not there by default', ({ props = BASIC_PROPS }) => {
  let selectWrapper = mount(<Select {...props} onInputChange={jest.fn()} />);
  let inputWrapper = selectWrapper.find('Control input');
  expect(inputWrapper.props().required).toBeUndefined();
}, {
    'single select > should not have required attribute': {},
    'multi select > should not have required attribute': {},
  });

cases('value of hidden input control', ({ props = { options: OPTIONS }, expectedValue }) => {
  let selectWrapper = mount(<Select {...props} />);
  let hiddenInput = selectWrapper.find('input[type="hidden"]');
  expect(hiddenInput.props().value).toEqual(expectedValue);
}, {
    'single select > should set value of input as value prop': {
      props: {
        ...BASIC_PROPS,
        value: OPTIONS[3],
      },
      expectedValue: 'three'
    },
    'single select > options with number values > should set value of input as value prop': {
      props: {
        ...BASIC_PROPS,
        options: OPTIONS_NUMBER_VALUE,
        value: OPTIONS_NUMBER_VALUE[3],
      },
      expectedValue: 3
    },
    'single select > options with boolean values > should set value of input as value prop': {
      props: {
        ...BASIC_PROPS,
        options: OPTIONS_BOOLEAN_VALUE,
        value: OPTIONS_BOOLEAN_VALUE[1],
      },
      expectedValue: false
    },
    'multi select > should set value of input as value prop': {
      props: {
        ...BASIC_PROPS,
        isMulti: true,
        value: OPTIONS[3],
      },
      expectedValue: 'three'
    },
    'multi select > with delimiter prop > should set value of input as value prop': {
      props: {
        ...BASIC_PROPS,
        delimiter: ', ',
        isMulti: true,
        value: [OPTIONS[3], OPTIONS[5]],
      },
      expectedValue: 'three, five',
    },
    'multi select > options with number values > should set value of input as value prop': {
      props: {
        ...BASIC_PROPS,
        isMulti: true,
        options: OPTIONS_NUMBER_VALUE,
        value: OPTIONS_NUMBER_VALUE[3],
      },
      expectedValue: 3
    },
    'multi select > with delimiter prop > options with number values > should set value of input as value prop': {
      props: {
        ...BASIC_PROPS,
        delimiter: ', ',
        isMulti: true,
        options: OPTIONS_NUMBER_VALUE,
        value: [OPTIONS_NUMBER_VALUE[3], OPTIONS_NUMBER_VALUE[1]],
      },
      expectedValue: '3, 1',
    },
    'multi select > options with boolean values > should set value of input as value prop': {
      props: {
        ...BASIC_PROPS,
        isMulti: true,
        options: OPTIONS_BOOLEAN_VALUE,
        value: OPTIONS_BOOLEAN_VALUE[1],
      },
      expectedValue: false
    },
    'multi select > with delimiter prop > options with boolean values > should set value of input as value prop': {
      props: {
        ...BASIC_PROPS,
        delimiter: ', ',
        isMulti: true,
        options: OPTIONS_BOOLEAN_VALUE,
        value: [OPTIONS_BOOLEAN_VALUE[1], OPTIONS_BOOLEAN_VALUE[0]],
      },
      expectedValue: 'false, true',
    },
  });

cases('isOptionDisabled() prop', ({ props, expectedEnabledOption, expectedDisabledOption }) => {
  let selectWrapper = mount(<Select {...props} />);

  const enabledOptions = selectWrapper.find('Option[isDisabled=false]').filterWhere(n => !n.props().isDisabled);
  const enabledOptionsValues = enabledOptions.map(option => option.text());
  enabledOptionsValues.map(option => {
    expect(expectedDisabledOption.indexOf(option)).toBe(-1);
  });

  const disabledOptions = selectWrapper.find('Option[isDisabled=false]').filterWhere(n => n.props().isDisabled);
  const disabledOptionsValues = disabledOptions.map(option => option.text());
  disabledOptionsValues.map(option => {
    expect(expectedEnabledOption.indexOf(option)).toBe(-1);
  });
}, {
    'single select > should add isDisabled as true prop only to options that are disabled': {
      props: {
        ...BASIC_PROPS,
        menuIsOpen: true,
        isOptionDisabled: (option) => ['zero', 'two', 'five', 'ten'].indexOf(option.value) > -1,
      },
      expectedEnabledOption: ['1', '3', '11'],
      expectedDisabledOption: ['0', '2', '5'],
    },
    'multi select > should add isDisabled as true prop only to options that are disabled': {
      props: {
        ...BASIC_PROPS,
        isMulti: true,
        menuIsOpen: true,
        isOptionDisabled: (option) => ['zero', 'two', 'five', 'ten'].indexOf(option.value) > -1,
      },
      expectedEnabledOption: ['1', '3', '11'],
      expectedDisabledOption: ['0', '2', '5'],
    }
  });

cases('isDisabled prop', ({ props }) => {
  let selectWrapper = mount(<Select {...props} />);
  expect(selectWrapper.props().isDisabled).toBeTruthy();

  let controlWrapper = selectWrapper.find(Control);
  expect(controlWrapper.props().isDisabled).toBeTruthy();

  let valueWrapper = selectWrapper.find(ValueContainer);
  expect(valueWrapper.props().isDisabled).toBeTruthy();

  let indicatorsContainerWrapper = selectWrapper.find(IndicatorsContainer);
  expect(indicatorsContainerWrapper.props().isDisabled).toBeTruthy();

  let DropdownIndicatorWrapper = selectWrapper.find(DropdownIndicator);
  expect(DropdownIndicatorWrapper.props().isDisabled).toBeTruthy();
}, {
    'single select > should add isDisabled prop to select components': {
      props: {
        ...BASIC_PROPS,
        isDisabled: true,
      }
    },
    'multi select > should add isDisabled prop to select components': {
      props: {
        ...BASIC_PROPS,
        isDisabled: true,
        isMulti: true,
      }
    },
  });

test('hitting tab on option should not call onChange if tabSelectsValue is false', () => {
  let spy = jest.fn();
  let selectWrapper = mount(<Select menuIsOpen options={OPTIONS} tabSelectsValue={false} onChange={spy} onInputChange={jest.fn()} onMenuClose={jest.fn()} />);

  let selectOption = selectWrapper.find('div.react-select__option').at(0);
  selectWrapper.setState({ focusedOption: { label: '2', value: 'two' } });

  selectOption.simulate('keyDown', { keyCode: 9, key: 'Tab' });
  expect(spy).not.toHaveBeenCalled();
});

test('multi select > to not show selected value in options', () => {
  let onInputChangeSpy = jest.fn();
  let onMenuCloseSpy = jest.fn();
  let selectWrapper = mount(<Select {...BASIC_PROPS} isMulti menuIsOpen onInputChange={onInputChangeSpy} onMenuClose={onMenuCloseSpy} />);

  let availableOptions = selectWrapper.find(Option).map(option => option.text());
  expect(availableOptions.indexOf('0') > -1).toBeTruthy();

  selectWrapper.setProps({ value: OPTIONS[0] });

  // Re-open Menu
  selectWrapper.find('div.react-select__dropdown-indicator').simulate('mouseDown', { button: 0 });
  availableOptions = selectWrapper.find(Option).map(option => option.text());

  expect(availableOptions.indexOf('0') > -1).toBeFalsy();
});

test('multi select > to not hide the selected options from the menu if hideSelectedOptions is false', () => {
  let selectWrapper = mount(<Select options={OPTIONS} hideSelectedOptions={false} isMulti menuIsOpen onChange={jest.fn()} onInputChange={jest.fn()} onMenuClose={jest.fn()} />);
  let firstOption = selectWrapper.find(Option).at(0);
  let secondoption = selectWrapper.find(Option).at(1);
  expect(firstOption.text()).toBe('0');
  expect(secondoption.text()).toBe('1');

  firstOption.find('div.react-select__option').simulate('click', { button: 0 });

  expect(firstOption.text()).toBe('0');
  expect(secondoption.text()).toBe('1');
});

test('multi select > call onChange with all values but last selected value and remove event on hitting backspace', () => {
  let onChangeSpy = jest.fn();
  let selectWrapper = mount(<Select {...BASIC_PROPS} isMulti value={[OPTIONS[0], OPTIONS[1], OPTIONS[2]]} onChange={onChangeSpy} />);
  expect(selectWrapper.find(Control).text()).toBe('012');

  selectWrapper.find(Control).simulate('keyDown', { keyCode: 8, key: 'Backspace' });
  expect(onChangeSpy).toHaveBeenCalledWith([{ label: '0', value: 'zero' }, { label: '1', value: 'one' }], { action: 'pop-value' });
});

test('should not call onChange on hitting backspace when backspaceRemovesValue is false', () => {
  let onChangeSpy = jest.fn();
  let selectWrapper = mount(<Select {...BASIC_PROPS} backspaceRemovesValue={false} onChange={onChangeSpy} />);
  selectWrapper.find(Control).simulate('keyDown', { keyCode: 8, key: 'Backspace' });
  expect(onChangeSpy).not.toHaveBeenCalled();
});

test('multi select > clicking on X next to option will call onChange with all options other that the clicked option', () => {
  let onChangeSpy = jest.fn();
  let selectWrapper = mount(<Select {...BASIC_PROPS} isMulti value={[OPTIONS[0], OPTIONS[2], OPTIONS[4]]} onChange={onChangeSpy} />);
  // there are 3 values in select
  expect(selectWrapper.find(MultiValue).length).toBe(3);

  const selectValueWrapper = selectWrapper.find(MultiValue).filterWhere(multiValue => multiValue.text() === '4');
  selectValueWrapper.find('div.react-select__multi-value__remove').simulate('click', { button: 0 });

  expect(onChangeSpy).toHaveBeenCalledWith([{ label: '0', value: 'zero' }, { label: '2', value: 'two' }], { action: 'remove-value' });
});


cases('accessibility - select input with defaults', ({ props = BASIC_PROPS, expectAriaHaspopup = false, expectAriaExpanded = false }) => {
  let selectWrapper = mount(<Select {...props} />);
  let selectInput = selectWrapper.find('Control input');

  expect(selectInput.props().role).toBe('combobox');
  expect(selectInput.props()['aria-haspopup']).toBe(expectAriaHaspopup);
  expect(selectInput.props()['aria-expanded']).toBe(expectAriaExpanded);
}, {
    'single select > with menu closed > input should have aria role combobox, and aria-haspopup, aria-expanded as false': {
    },
    'single select > with menu open > input should have aria role combobox, and aria-haspopup, aria-expanded as true': {
      props: {
        ...BASIC_PROPS,
        menuIsOpen: true,
      },
      expectAriaHaspopup: true,
      expectAriaExpanded: true,
    },
    'multi select > with menu closed > input should have aria role combobox, and aria-haspopup, aria-expanded as false': {
      props: {
        ...BASIC_PROPS,
        isMulti: true,
      }
    },
    'multi select > with menu open > input should have aria role combobox, and aria-haspopup, aria-expanded as true': {
      props: {
        ...BASIC_PROPS,
        isMulti: true,
        menuIsOpen: true,
      },
      expectAriaHaspopup: true,
      expectAriaExpanded: true,
    },
  });

/**
 * TODO: Need to get hightlight a menu option and then match value with aria-activedescendant prop
 */
cases('accessibility > aria-activedescendant', ({ props = { ...BASIC_PROPS } }) => {
  let selectWrapper = mount(<Select {...props} menuIsOpen />);

  selectWrapper.find(Menu).simulate('keyDown', { keyCode: 40, key: 'ArrowDown' });
  expect(selectWrapper.find('Control input').props()['aria-activedescendant']).toBe('1');
}, {
    'single select > should update aria-activedescendant as per focused uption': {
      skip: true,
    },
    'multi select > should update aria-activedescendant as per focused uption': {
      skip: true,
      props: {
        ...BASIC_PROPS,
        value: { label: '2', value: 'two' },
      }
    }
  });

cases('accessibility > passes through aria-labelledby prop', ({ props = { ...BASIC_PROPS, 'aria-labelledby': 'testing' } }) => {
  let selectWrapper = mount(<Select {...props} />);
  expect(selectWrapper.find('Control input').props()['aria-labelledby']).toBe('testing');
}, {
    'single select > should pass aria-labelledby prop down to input': {},
    'multi select > should pass aria-labelledby prop down to input': {
      props: {
        ...BASIC_PROPS,
        'aria-labelledby': 'testing',
        isMulti: true,
      }
    }
  });

cases('accessibility > passes through aria-describedby prop', ({ props = { ...BASIC_PROPS, 'aria-describedby': 'testing' } }) => {
  let selectWrapper = mount(<Select {...props} />);
  expect(selectWrapper.find('Control input').props()['aria-describedby']).toBe('testing');
}, {
    'single select > should pass aria-labelledby prop down to input': {},
    'multi select > should pass aria-labelledby prop down to input': {
      props: {
        ...BASIC_PROPS,
        'aria-describedby': 'testing',
        isMulti: true,
      }
    }
  });

cases('accessibility > passes through aria-label prop', ({ props = { ...BASIC_PROPS, 'aria-label': 'testing' } }) => {
  let selectWrapper = mount(<Select {...props} />);
  expect(selectWrapper.find('Control input').props()['aria-label']).toBe('testing');
}, {
    'single select > should pass aria-labelledby prop down to input': {},
    'multi select > should pass aria-labelledby prop down to input': {
      props: {
        ...BASIC_PROPS,
        'aria-label': 'testing',
        isMulti: true,
      }
    }
  });

test('accessibility > to show the number of options available in A11yText', () => {
  let selectWrapper = mount(<Select {...BASIC_PROPS} inputValue={''} />);
  expect(selectWrapper.find(A11yText).text()).toBe('17 results available.');

  selectWrapper.setProps({ inputValue: '0' });
  expect(selectWrapper.find(A11yText).text()).toBe('2 results available.');

  selectWrapper.setProps({ inputValue: '10' });
  expect(selectWrapper.find(A11yText).text()).toBe('1 result available.');

  selectWrapper.setProps({ inputValue: '100' });
  expect(selectWrapper.find(A11yText).text()).toBe('0 results available.');
});

/**
 * TODO: Delete after confirmation - Not a case anymore, not getting this label in V2
 */
test.skip('accessibility > multi select > remove value label', () => {
  const props = { ...BASIC_PROPS, isMulti: true, value: [OPTIONS[0], OPTIONS[1]] };
  let selectWrapper = mount(<Select {...props} />);
  expect(selectWrapper).toBeTruthy();
});

cases('autoFocus', ({ props = { ...BASIC_PROPS, autoFocus: true } }) => {
  let selectWrapper = mount(<Select {...props} />);
  expect(selectWrapper.find('Control input').props().id).toBe(document.activeElement.id);

},
  {
    'single select > should focus select on mount': {},
    'multi select > should focus select on mount': {
      props: {
        ...BASIC_PROPS,
        isMulti: true,
        autoFocus: true,
      },
    },
  }
);

/**
 * onFocus hook is not being called when component is mounted is autoFocus true
 * Reproducible here ->  https://codesandbox.io/s/71xrkj0qj
 */
cases('onFocus prop with autoFocus', ({ props = { ...BASIC_PROPS, autoFocus: true } }) => {
  let onFocusSpy = jest.fn();
  let selectWrapper = mount(<Select {...props} onFocus={onFocusSpy} />);
  expect(selectWrapper.find('Control input').props().id).toBe(document.activeElement.id);
  expect(onFocusSpy).toHaveBeenCalledTimes(1);
}, {
    'single select > should call auto focus only once when select is autoFocus': {
      skip: true,
    },
    'multi select > should call auto focus only once when select is autoFocus': {
      skip: true,
      props: {
        ...BASIC_PROPS,
        autoFocus: true,
        isMulti: true
      },
    },
  });

cases('onFocus prop is called on on focus of input', ({ props = { ...BASIC_PROPS } }) => {
  let onFocusSpy = jest.fn();
  let selectWrapper = mount(<Select {...props} onFocus={onFocusSpy} />);
  selectWrapper.find('Control input').simulate('focus');
  expect(onFocusSpy).toHaveBeenCalledTimes(1);
}, {
    'single select > should call onFocus handler on focus on input': {},
    'multi select > should call onFocus handler on focus on input': {
      props: {
        ...BASIC_PROPS,
        isMulti: true
      },
    },
  });

cases('onBlur prop', ({ props = { ...BASIC_PROPS } }) => {
  let onBlurSpy = jest.fn();
  let selectWrapper = mount(<Select {...props} onBlur={onBlurSpy} onInputChange={jest.fn()} onMenuClose={jest.fn()} />);
  selectWrapper.find('Control input').simulate('blur');
  expect(onBlurSpy).toHaveBeenCalledTimes(1);
}, {
    'single select > should call onBlur handler on blur on input': {},
    'multi select > should call onBlur handler on blur on input': {
      props: {
        ...BASIC_PROPS,
        isMulti: true
      },
    },
  });

test('onInputChange() function prop to be called on blur', () => {
  let onInputChangeSpy = jest.fn();
  let selectWrapper = mount(<Select {...BASIC_PROPS} onBlur={jest.fn()} onInputChange={onInputChangeSpy} onMenuClose={jest.fn()} />);
  selectWrapper.find('Control input').simulate('blur');
  // Once by blur and other time by menu-close
  expect(onInputChangeSpy).toHaveBeenCalledTimes(2);
});

test('onMenuClose() function prop to be called on blur', () => {
  let onMenuCloseSpy = jest.fn();
  let selectWrapper = mount(<Select {...BASIC_PROPS} onBlur={jest.fn()} onInputChange={jest.fn()} onMenuClose={onMenuCloseSpy} />);
  selectWrapper.find('Control input').simulate('blur');
  expect(onMenuCloseSpy).toHaveBeenCalledTimes(1);
});

cases('placeholder', ({ props, expectPlaceholder = 'Select...' }) => {
  let selectWrapper = mount(<Select {...props} />);
  expect(selectWrapper.find('Control').text()).toBe(expectPlaceholder);
}, {
    'single select > should display default placeholder "Select..."': {},
    'single select > should display provided placeholder': {
      props: {
        placeholder: 'single Select...',
      },
      expectPlaceholder: 'single Select...',
    },
    'multi select > should display default placeholder "Select..."': {},
    'multi select > should display provided placeholder': {
      props: {
        placeholder: 'multi Select...',
      },
      expectPlaceholder: 'multi Select...',
    }
  });


cases('display placeholder once value is removed', ({ props }) => {
  let selectWrapper = mount(<Select {...props} />);
  expect(selectWrapper.find(Placeholder).exists()).toBeFalsy();
  selectWrapper.setProps({ value: '' });
  expect(selectWrapper.find(Placeholder).exists()).toBeTruthy();
}, {
    'single select > should display placeholder once the value is removed from select': {
      props: {
        ...BASIC_PROPS,
        value: OPTIONS[0],
      },
    },
    'multi select > should display placeholder once the value is removed from select': {
      props: {
        ...BASIC_PROPS,
        value: OPTIONS[0],
      },
    },
  });

test('renders a read only input when isSearchable is false', () => {
  let selectWrapper = mount(<Select options={OPTIONS} isSearchable={false} />);
  let inputWrapper = selectWrapper.find('Control input');
  expect(inputWrapper.props().readOnly).toBe(true);
});

cases('clicking on disabled option', ({ props = BASIC_PROPS, optionsSelected }) => {
  let onChangeSpy = jest.fn();
  props = { ...props, onChange: onChangeSpy };
  let selectWrapper = mount(<Select {...props} menuIsOpen />);
  let selectOption = selectWrapper.find('div.react-select__option').findWhere(n => n.props().children === optionsSelected);
  selectOption.simulate('click', { button: 0 });
  expect(onChangeSpy).not.toHaveBeenCalled();
}, {
    'single select > should not select the disabled option': {
      props: {
        ...BASIC_PROPS,
        options: [{ label: 'option 1', value: 'opt1' }, { label: 'option 2', value: 'opt2', isDisabled: true }],
      },
      optionsSelected: 'option 2',
    },
    'multi select > should not select the disabled option': {
      props: {
        ...BASIC_PROPS,
        options: [{ label: 'option 1', value: 'opt1' }, { label: 'option 2', value: 'opt2', isDisabled: true }],
      },
      optionsSelected: 'option 2',
    },
  });

test('does not select anything when a disabled option is the only item in the list after a search', () => {
  let onChangeSpy = jest.fn();
  const options = [{ label: 'opt', value: 'opt1', isDisabled: true }, ...OPTIONS];
  const props = { ...BASIC_PROPS, onChange: onChangeSpy, options };
  // Getting error trying to change unControlled component to controlled
  // so passing inputValue
  let selectWrapper = mount(<Select {...props} menuIsOpen inputValue="" />);
  selectWrapper.setProps({ inputValue: 'opt' });
  selectWrapper.find(Menu).simulate('keyDown', { keyCode: 13, key: 'Enter' });

  expect(onChangeSpy).not.toHaveBeenCalled();
  // Menu is still open
  expect(selectWrapper.find(Option).text()).toBe('opt');
});

test('render custom Input Component', () => {
  const InputComponent = () => (<div />);
  let selectWrapper = mount(<Select {...BASIC_PROPS} components={{ Input: InputComponent }} />);

  expect(selectWrapper.find(Input).exists()).toBeFalsy();
  expect(selectWrapper.find(InputComponent).exists()).toBeTruthy();
});

test('render custom Menu Component', () => {
  const MenuComponent = () => (<div />);
  let selectWrapper = mount(<Select {...BASIC_PROPS} menuIsOpen components={{ Menu: MenuComponent }} />);

  expect(selectWrapper.find(Menu).exists()).toBeFalsy();
  expect(selectWrapper.find(MenuComponent).exists()).toBeTruthy();
});

test('render custom Option Component', () => {
  const OptionComponent = () => (<div />);
  let selectWrapper = mount(<Select {...BASIC_PROPS} menuIsOpen components={{ Option: OptionComponent }} />);

  expect(selectWrapper.find(Option).exists()).toBeFalsy();
  expect(selectWrapper.find(OptionComponent).exists()).toBeTruthy();
});

cases('isClearable is false', ({ props = BASIC_PROPS }) => {
  let selectWrapper = mount(<Select {...props} />);
  expect(selectWrapper.find(ClearIndicator).exists()).toBeFalsy();
}, {
    'single select > should not show the X (clear) button': {
      props: {
        ...BASIC_PROPS,
        isClearable: false,
        value: OPTIONS[0]
      },
    },
    'multi select > should not show X (clear) button': {
      ...BASIC_PROPS,
      isMulti: true,
      isClearable: false,
      value: [OPTIONS[0]]
    },
  });

test('clear select using clear button', () => {
  let onChangeSpy = jest.fn();
  let props = { ...BASIC_PROPS, onChange: onChangeSpy };
  let selectWrapper = mount(<Select {...props} isMulti value={[OPTIONS[0]]} />);

  expect(selectWrapper.find(MultiValue).length).toBe(1);
  selectWrapper.find('div.react-select__clear-indicator').simulate('mousedown', { button: 0 });
  expect(onChangeSpy).toBeCalledWith([], { action: 'clear' });
});

test('multi select >  calls onChange when option is selected and isSearchable is false', () => {
  let onChangeSpy = jest.fn();
  let props = { ...BASIC_PROPS, onChange: onChangeSpy };
  let selectWrapper = mount(<Select {...props} isMulti menuIsOpen delimiter="," isSearchable={false} />);
  selectWrapper.find('div.react-select__option').at(0).simulate('click', { button: 0 });
  expect(onChangeSpy).toHaveBeenCalledWith([{ label: '0', value: 'zero' }], { action: 'select-option' });
});

test('to only render groups with at least one match when filtering', () => {
  const options = [
    {
      label: 'group 1',
      options: [{ value: 1, label: '1' }, { value: 2, label: '2' }],
    },
    {
      label: 'group 2',
      options: [{ value: 3, label: '3' }, { value: 4, label: '4' }],
    },
  ];
  const selectWrapper = mount(<Select options={options} menuIsOpen inputValue="" />);
  selectWrapper.setProps({ inputValue: '1' });

  expect(selectWrapper.find('Group').length).toBe(1);
  expect(selectWrapper.find('Group').find('Option').length).toBe(1);
});

test('not render any groups when there is not a single match when filtering', () => {
  const options = [
    {
      label: 'group 1',
      options: [{ value: 1, label: '1' }, { value: 2, label: '2' }],
    },
    {
      label: 'group 2',
      options: [{ value: 3, label: '3' }, { value: 4, label: '4' }],
    },
  ];
  const selectWrapper = mount(<Select options={options} menuIsOpen inputValue="" />);
  selectWrapper.setProps({ inputValue: '5' });

  expect(selectWrapper.find('Group').length).toBe(0);
});

test('multi select > have default value delimiter seperated', () => {
  let selectWrapper = mount(<Select {...BASIC_PROPS} isMulti delimiter={';'} value={[OPTIONS[0], OPTIONS[1]]} />);
  expect(selectWrapper.find('input[type="hidden"]').props().value).toBe('zero;one');
});

test('multi select > with multi character delimiter', () => {
  let selectWrapper = mount(<Select {...BASIC_PROPS} value={[OPTIONS[0], OPTIONS[1]]} isMulti delimiter={'===&==='} />);
  expect(selectWrapper.find('input[type="hidden"]').props().value).toBe('zero===&===one');
});

test('hitting spacebar should select option if isSearchable is false', () => {
  let onChangeSpy = jest.fn();
  let props = { ...BASIC_PROPS, onChange: onChangeSpy };
  let selectWrapper = mount(<Select {...props} isSearchable menuIsOpen />);
  // focus the first option
  selectWrapper.find(Menu).simulate('keyDown', { keyCode: 40, key: 'ArrowDown' });
  selectWrapper.simulate('keyDown', { keyCode: 32, key: 'Spacebar' });
  expect(onChangeSpy).toHaveBeenCalledWith({ label: '0', value: 'zero' }, { action: 'select-option' });
});

test('hitting escape does not call onChange if menu is Open', () => {
  let onChangeSpy = jest.fn();
  let props = { ...BASIC_PROPS, onChange: onChangeSpy };
  let selectWrapper = mount(<Select {...props} menuIsOpen escapeClearsValue isClearable />);

  // focus the first option
  selectWrapper.find(Menu).simulate('keyDown', { keyCode: 40, key: 'ArrowDown' });
  selectWrapper.simulate('keyDown', { keyCode: 27, key: 'Escape' });
  expect(onChangeSpy).not.toHaveBeenCalled();
});

test('multi select > removes the selected option from the menu options when isSearchable is false', () => {
  let selectWrapper = mount(<Select {...BASIC_PROPS} isMulti menuIsOpen delimiter="," isSearchable={false} />);
  expect(selectWrapper.find(Option).length).toBe(17);
  selectWrapper.setProps({ value: OPTIONS[0] });
  // expect '0' to not be options
  selectWrapper.find(Option).map(option => {
    expect(option.text()).not.toBe('0');
  });
  expect(selectWrapper.find(Option).length).toBe(16);
});

test('hitting ArrowUp key on closed select should focus last element', () => {
  let selectWrapper = mount(<Select {...BASIC_PROPS} />);
  selectWrapper.find('div.react-select__control').simulate('keyDown', { keyCode: 38, key: 'ArrowUp' });
  expect(selectWrapper.state('focusedOption')).toEqual({ label: '16', value: 'sixteen' });
});

test('close menu on hitting escape and clear input value if menu is open even if escapeClearsValue and isClearable are true', () => {
  let onMenuCloseSpy = jest.fn();
  let onInputChangeSpy = jest.fn();
  let props = { ...BASIC_PROPS, onMenuClose: onMenuCloseSpy, onInputChange: onInputChangeSpy, value: OPTIONS[0] };
  let selectWrapper = mount(<Select {...props} menuIsOpen escapeClearsValue isClearable />);
  selectWrapper.simulate('keyDown', { keyCode: 27, key: 'Escape' });
  expect(selectWrapper.state('selectValue')).toEqual([{  label: '0', value: 'zero' }]);
  expect(onMenuCloseSpy).toHaveBeenCalled();
  // once by onMenuClose and other is direct
  expect(onInputChangeSpy).toHaveBeenCalledTimes(2);
  expect(onInputChangeSpy).toHaveBeenCalledWith('', { action : 'menu-close' });
  expect(onInputChangeSpy).toHaveBeenLastCalledWith('', { action: 'menu-close' });
});

test('to not clear value when hitting escape if escapeClearsValue is false (default) and isClearable is false', () => {
  let onChangeSpy = jest.fn();
  let props = { ...BASIC_PROPS, onChange: onChangeSpy, value: OPTIONS[0] };
  let selectWrapper = mount(<Select {...props} escapeClearsValue isClearable={false} />);
  
  selectWrapper.simulate('keyDown', { keyCode: 27, key: 'Escape' });
  expect(onChangeSpy).not.toHaveBeenCalled();
});

test('to not clear value when hitting escape if escapeClearsValue is true and isClearable is false', () => {
  let onChangeSpy = jest.fn();
  let props = { ...BASIC_PROPS, onChange: onChangeSpy, value: OPTIONS[0] };
  let selectWrapper = mount(<Select {...props} escapeClearsValue isClearable={false} />);

  selectWrapper.simulate('keyDown', { keyCode: 27, key: 'Escape' });
  expect(onChangeSpy).not.toHaveBeenCalled();
});

test('to not clear value when hitting escape if escapeClearsValue is false (default) and isClearable is true', () => {
  let onChangeSpy = jest.fn();
  let props = { ...BASIC_PROPS, onChange: onChangeSpy, value: OPTIONS[0] };
  let selectWrapper = mount(<Select {...props} isClearable />);
  
  selectWrapper.simulate('keyDown', { keyCode: 27, key: 'Escape' });
  expect(onChangeSpy).not.toHaveBeenCalled();
});

test('to clear value when hitting escape if escapeClearsValue and isClearable are true', () => {
  let onInputChangeSpy = jest.fn();
  let props = { ...BASIC_PROPS, onChange: onInputChangeSpy, value: OPTIONS[0] };
  let selectWrapper = mount(<Select {...props} isClearable escapeClearsValue />);

  selectWrapper.simulate('keyDown', { keyCode: 27, key: 'Escape' });
  expect(onInputChangeSpy).toHaveBeenCalledWith(null, { action: 'clear' });
});


cases('jump over the disabled option', ({ props = { ...BASIC_PROPS }, eventsToSimulate, expectedSelectedOption }) => {
  let selectWrapper = mount(<Select {...props} menuIsOpen />);
  // open the menu
  selectWrapper.find('div.react-select__dropdown-indicator').simulate('keyDown', { keyCode: 40, key: 'ArrowDown' });
  eventsToSimulate.map(eventToSimulate => {
    selectWrapper.find(Menu).simulate(...eventToSimulate);
  });
  expect(selectWrapper.state('focusedOption')).toEqual(expectedSelectedOption);
}, {
    'with isOptionDisabled function prop > jumps over the first option if it is disabled': {
      props: {
        ...BASIC_PROPS,
        isOptionDisabled: (option) => ['zero'].indexOf(option.value) > -1,
      },
      eventsToSimulate: [],
      expectedSelectedOption: OPTIONS[1],
    },
    'with isDisabled option value > jumps over the first option if it is disabled': {
      props: {
        ...BASIC_PROPS,
        options: [{ label: 'option 1', value: 'opt1', isDisabled: true }, ...OPTIONS],
      },
      eventsToSimulate: [],
      expectedSelectedOption: OPTIONS[0],
    },
    'with isOptionDisabled function prop > jumps over the disabled option': {
      props: {
        ...BASIC_PROPS,
        isOptionDisabled: (option) => ['two'].indexOf(option.value) > -1,
      },
      eventsToSimulate: [
        ['keyDown', { keyCode: 40, key: 'ArrowDown' }],
        ['keyDown', { keyCode: 40, key: 'ArrowDown' }],
      ],
      expectedSelectedOption: OPTIONS[3],
    },
    'with isDisabled option value > jumps over the disabled option': {
      props: {
        ...BASIC_PROPS,
        options: [{ label: 'option 1', value: 'opt1' }, { label: 'option 2', value: 'opt2', isDisabled: true }, { label: 'option 3', value: 'opt3' }],
      },
      eventsToSimulate: [
        ['keyDown', { keyCode: 40, key: 'ArrowDown' }],
      ],
      expectedSelectedOption: { label: 'option 3', value: 'opt3' },
    },
    'with isOptionDisabled function prop > skips over last option when looping round when last option is disabled': {
      props: {
        ...BASIC_PROPS,
        options: OPTIONS.slice(0, 3),
        isOptionDisabled: (option) => ['two'].indexOf(option.value) > -1,
      },
      eventsToSimulate: [
        ['keyDown', { keyCode: 40, key: 'ArrowDown' }],
        ['keyDown', { keyCode: 40, key: 'ArrowDown' }],
      ],
      expectedSelectedOption: OPTIONS[0],
    },
    'with isDisabled option value > skips over last option when looping round when last option is disabled': {
      props: {
        ...BASIC_PROPS,
        options: [{ label: 'option 1', value: 'opt1' }, { label: 'option 2', value: 'opt2' }, { label: 'option 3', value: 'opt3', isDisabled: true }],
      },
      eventsToSimulate: [
        ['keyDown', { keyCode: 40, key: 'ArrowDown' }],
        ['keyDown', { keyCode: 40, key: 'ArrowDown' }],
      ],
      expectedSelectedOption: { label: 'option 1', value: 'opt1' },
    },
    'with isOptionDisabled function prop > should not select anything when all options are disabled': {
      props: {
        ...BASIC_PROPS,
        isOptionDisabled: () => true,
      },
      eventsToSimulate: [],
      expectedSelectedOption: null,
    },
    'with isDisabled option value > should not select anything when all options are disabled': {
      props: {
        ...BASIC_PROPS,
        options: [{ label: 'option 1', value: 'opt1', isDisabled: true }, { label: 'option 2', value: 'opt2', isDisabled: true }, { label: 'option 3', value: 'opt3', isDisabled: true }],
      },
      eventsToSimulate: [],
      expectedSelectedOption: null,
    }
  });