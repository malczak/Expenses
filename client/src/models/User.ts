interface UserData {
  name: string;

  email: string;

  passwd: string;

  color: string;
}

export class User implements UserData {
  name: string;

  email: string;

  passwd: string;

  color: string;

  static fromJSON(data: UserData): User {
    const user = new User();
    user.name = data.name;
    user.email = data.email;
    user.passwd = data.passwd;
    user.color = data.color || '#000000';
    return user;
  }
}
