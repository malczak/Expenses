interface CategoryData {
  name: string;

  icon: string;
}

export class Category implements CategoryData {
  name: string;

  icon: string;

  static fromJSON(json: CategoryData): Category {
    const category = new Category();
    category.name = json.name;
    category.icon = json.icon;
    return category;
  }
}
