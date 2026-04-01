class Status {
  // service status
  static PENDING = new Status("PENDING");
  static CONFIRMED = new Status("CONFIRMED");
  static COMPLETED = new Status("COMPLETED");
  static CANCELLED = new Status("CANCELLED");
  static FAILED = new Status("FAILED");
  public name = "";

  constructor(name: string) {
    this.name = name;
  }
}

export default Status;
