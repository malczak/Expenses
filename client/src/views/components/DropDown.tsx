import React from 'react';
import cn from 'classnames';
import { ChevronUp, ChevronDown } from './MoneyPad/icons';

type DropDownProps = {
  selected?: string;
  title: string | ((value: string | null) => string);
  options: { value: string; label: string }[];
  onChange?: (value: string, close?: () => void) => void;
};

type DropDownState = {
  opened: boolean;
  selected: string | null;
};

export class DropDown extends React.PureComponent<
  DropDownProps,
  DropDownState
> {
  constructor(props: DropDownProps) {
    super(props);
    this.state = {
      selected: props.selected,
      opened: false
    };
  }

  close = () => {
    this.setState({ opened: false });
  };

  // -----------------------
  // Handlers
  // -----------------------

  onOpenClick = () => {
    this.setState({ opened: !this.state.opened });
  };

  onItemClick = (value: string) => () => {
    this.setState({ selected: value }, () => {
      const { onChange } = this.props;
      if (typeof onChange === 'function') {
        onChange(this.state.selected, this.close);
      }
    });
  };

  // -----------------------
  // Render
  // -----------------------
  render() {
    const { title, options } = this.props;
    const { opened, selected } = this.state;
    const titleStr = typeof title == 'function' ? title(selected) : title;
    return (
      <div
        className={cn('dropDown', {
          'dropDown--opened': opened
        })}
      >
        <button className="navigation-bar__button" onClick={this.onOpenClick}>
          <span>{titleStr}</span> {opened ? <ChevronUp /> : <ChevronDown />}
        </button>
        <ul className="dropDown__content">
          {options.map(option => (
            <li
              className={cn('dropDown__item', {
                'dropDown__item--selected': option.value == selected
              })}
              key={option.value}
              onClick={this.onItemClick(option.value)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
