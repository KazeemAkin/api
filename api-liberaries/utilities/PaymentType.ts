class PaymentType {
  // service status
  static ACTIVATION = new PaymentType("ACCOUNT ACTIVATION");
  private name: string = "";

  constructor(name: string) {
    this.name = name;
  }
}

module.exports = PaymentType;
