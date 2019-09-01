import React from 'react';

export type IconProps = {
  width?: number | string;
  height?: number | string;
  color?: string;
  strokeWidth?: number;
};

export const Icon: React.FC<React.PropsWithChildren<IconProps>> = ({
  children,
  width = 24,
  height = 24,
  color = 'currentColor',
  strokeWidth = 1,
  ...otherProps
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...otherProps}
  >
    {children}
  </svg>
);

export const SmileIcon: React.FC<IconProps> = props => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
    <line x1="9" y1="9" x2="9.01" y2="9"></line>
    <line x1="15" y1="9" x2="15.01" y2="9"></line>
  </Icon>
);

export const CatsIcon: React.FC<IconProps> = props => (
  <Icon {...props}>
    <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z"></path>
  </Icon>
);

export const ShoppingIcon: React.FC<IconProps> = props => (
  <Icon {...props}>
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <path d="M16 10a4 4 0 0 1-8 0"></path>
  </Icon>
);

export const HouseIcon: React.FC<IconProps> = props => (
  <Icon {...props}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </Icon>
);

export const HealthIcon: React.FC<IconProps> = props => (
  <Icon {...props}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </Icon>
);

export const TruckIcon: React.FC<IconProps> = props => (
  <Icon {...props}>
    <rect x="1" y="3" width="15" height="13"></rect>
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
    <circle cx="5.5" cy="18.5" r="2.5"></circle>
    <circle cx="18.5" cy="18.5" r="2.5"></circle>
  </Icon>
);

export const BookIcon: React.FC<IconProps> = props => (
  <Icon {...props}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
  </Icon>
);

export const MusicIcon: React.FC<IconProps> = props => (
  <Icon {...props}>
    <path d="M9 18V5l12-2v13"></path>
    <circle cx="6" cy="18" r="3"></circle>
    <circle cx="18" cy="16" r="3"></circle>
  </Icon>
);

export const FoodIcon: React.FC<IconProps> = props => (
  <Icon {...props}>
    <path d="M4,12 L20,12 L20,18 C20,20.209139 18.209139,22 16,22 L8,22 C5.790861,22 4,20.209139 4,18 L4,12 Z"></path>
    <path d="M17,2 C16.4888731,3.09830729 16.4888731,4.11301491 17,5.04412287 C17.5111269,5.97523082 17.5111269,6.9605232 17,8"></path>
    <path d="M12,2 C11.4888731,3.09830729 11.4888731,4.11301491 12,5.04412287 C12.5111269,5.97523082 12.5111269,6.9605232 12,8"></path>
    <path d="M7,2 C6.48887311,3.09830729 6.48887311,4.11301491 7,5.04412287 C7.51112689,5.97523082 7.51112689,6.9605232 7,8"></path>
  </Icon>
);

export const CoffeeIcon: React.FC<IconProps> = props => (
  <Icon {...props}>
    <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
    <line x1="6" y1="1" x2="6" y2="4"></line>
    <line x1="10" y1="1" x2="10" y2="4"></line>
    <line x1="14" y1="1" x2="14" y2="4"></line>
  </Icon>
);

export const StarIcon: React.FC<IconProps> = props => (
  <Icon {...props}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </Icon>
);

export const GridIcon: React.FC<IconProps> = props => (
  <Icon {...props}>
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </Icon>
);

export const UploadIcon: React.FC<IconProps> = props => (
  <Icon {...props}>
    <polyline points="16 16 12 12 8 16"></polyline>
    <line x1="12" y1="12" x2="12" y2="21"></line>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
    <polyline points="16 16 12 12 8 16"></polyline>
  </Icon>
);

export const TagIcon: React.FC<IconProps> = props => (
  <Icon {...props}>
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
    <line x1="7" y1="7" x2="7" y2="7"></line>
  </Icon>
);

export const DeleteIcon: React.FC<IconProps> = props => (
  <Icon {...props}>
    <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
    <line x1="18" y1="9" x2="12" y2="15" />
    <line x1="12" y1="9" x2="18" y2="15" />
  </Icon>
);

export const SendIcon: React.FC<IconProps> = props => (
  <Icon {...props}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </Icon>
);

export const HashIcon: React.FC<IconProps> = props => (
  <Icon {...props}>
    <line x1="4" y1="9" x2="20" y2="9"></line>
    <line x1="4" y1="15" x2="20" y2="15"></line>
    <line x1="10" y1="3" x2="8" y2="21"></line>
    <line x1="16" y1="3" x2="14" y2="21"></line>
  </Icon>
);

export const PlusIcon: React.FC<IconProps> = props => (
  <Icon {...props}>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </Icon>
);

export const ChevronLeft: React.FC<IconProps> = props => (
  <Icon {...props}>
    <polyline points="15 18 9 12 15 6"></polyline>
  </Icon>
);

export const ChevronRight: React.FC<IconProps> = props => (
  <Icon {...props}>
    <polyline points="9 18 15 12 9 6"></polyline>
  </Icon>
);

export const ChevronDown: React.FC<IconProps> = props => (
  <Icon {...props}>
    <polyline points="6 9 12 15 18 9"></polyline>
  </Icon>
);

export const ChevronUp: React.FC<IconProps> = props => (
  <Icon {...props}>
    <polyline points="18 15 12 9 6 15"></polyline>
  </Icon>
);

export const Refresh: React.FC<IconProps> = props => (
  <Icon {...props}>
    <polyline points="1 4 1 10 7 10"></polyline>
    <polyline points="23 20 23 14 17 14"></polyline>
    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
  </Icon>
);

const IconsMap = new Map<string, React.ComponentType<IconProps>>([
  ['$default', HashIcon],
  ['smile', SmileIcon],
  ['cats', CatsIcon],
  ['shopping', ShoppingIcon],
  ['tag', TagIcon],
  ['house', HouseIcon],
  ['health', HealthIcon],
  ['truck', TruckIcon],
  ['book', BookIcon],
  ['music', MusicIcon],
  ['coffee', CoffeeIcon],
  ['food', FoodIcon],
  ['star', StarIcon],
  ['grid', GridIcon]
]);

export const getIconByName = (name: string): React.ComponentType<IconProps> =>
  IconsMap.get(name) || IconsMap.get('$default');
