class UserType {
  // user status
  static USER = new UserType("USER");
  public name: string = "";

  constructor(name: string) {
    this.name = name;
  }
}

export default UserType;
