import React from 'react';
import classNames from 'classnames';
import { IconProps, getIconByName } from './icons';

const RenderCategory: React.FC<{
  name: string;
  selected?: boolean;
  Icon: React.ComponentType<IconProps>;
  onClick: (category: string) => void;
}> = ({ name, selected = false, Icon, onClick }) => {
  return (
    <div
      className={classNames('categories_slider__category', {
        'categories_slider__category--selected': selected
      })}
      data-selected={selected}
      onClick={() => onClick(name)}
    >
      <Icon strokeWidth={selected ? 2 : 1} />
      <small>{name}</small>
    </div>
  );
};

type CategoryListProps = {
  category?: string;
  categories: { name: string; icon: string }[];
  onSelect?: (name: string) => void;
};

type CategoryListState = {};

export class CategoryList extends React.PureComponent<
  CategoryListProps,
  CategoryListState
> {
  containerRef = React.createRef<HTMLDivElement>();
  // -----------------------
  // Methods
  // -----------------------
  scrollToView(item: HTMLElement) {
    const container = this.containerRef && this.containerRef.current;
    if (!container || !item) {
      return;
    }

    const bounds = item.getBoundingClientRect();
    const halfWidth = bounds.width * 0.5;
    const containerBounds = container.getBoundingClientRect();
    const itemScrollLeft = bounds.left - containerBounds.left;
    if (
      itemScrollLeft + halfWidth < 0 ||
      itemScrollLeft + halfWidth > containerBounds.width
    ) {
      container.scrollLeft =
        container.scrollLeft +
        itemScrollLeft +
        bounds.width * 0.5 -
        containerBounds.width * 0.5;
    }
  }

  scrollToSelectedCategory() {
    const container = this.containerRef && this.containerRef.current;
    if (container) {
      for (const item of container.childNodes.values()) {
        if (item instanceof HTMLElement) {
          if (item.dataset.selected === 'true') {
            this.scrollToView(item);
            break;
          }
        }
      }
    }
  }

  // -----------------------
  // Handlers
  // -----------------------
  onCategoryClick = (name: string) => {
    if (this.props.category == name) {
      return;
    }

    const onSelect = this.props.onSelect;
    if (typeof onSelect == 'function') {
      onSelect(name);
    }
  };

  componentDidMount() {
    this.scrollToSelectedCategory();
  }

  componentDidUpdate() {
    this.scrollToSelectedCategory();
  }

  // -----------------------
  // Render
  // -----------------------
  render() {
    const selectedCategory = this.props.category;
    return (
      <div ref={this.containerRef} className="categories_slider">
        {(this.props.categories || []).map(category => (
          <RenderCategory
            key={category.name}
            selected={selectedCategory == category.name}
            name={category.name}
            Icon={getIconByName(category.icon)}
            onClick={this.onCategoryClick}
          />
        ))}
      </div>
    );
  }
}
