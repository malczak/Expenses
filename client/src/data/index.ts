import { Category } from 'app/models/Category';
import { User } from 'app/models/User';

import _users from '../../.users.json';
import _categories from '../../.categories.json';

export const Users = _users.map(_user => User.fromJSON(_user));

export const Categories = _categories.map(_category =>
  Category.fromJSON(_category)
);

export const getCategoryByName = (name: string) =>
  name
    ? Categories.find(
        category =>
          name.toLocaleLowerCase() == category.name.toLocaleLowerCase()
      )
    : '';
