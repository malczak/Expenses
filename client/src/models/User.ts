interface UserData {
  name: string;

  email: string;

  passwd: string;
}

export class User implements UserData {
  name: string;

  email: string;

  passwd: string;

  static fromJSON(data: UserData): User {
    const user = new User();
    user.name = data.name;
    user.email = data.email;
    user.passwd = data.passwd;
    return user;
  }
}
