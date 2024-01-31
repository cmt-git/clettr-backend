export class CurrencySimulator {
  private moneySupply: number;
  private velocity: number;
  private output: number;
  private exchangeRate: number;

  constructor(
    initialMoneySupply: number,
    initialVelocity: number,
    initialOutput: number,
    initialExchangeRate: number
  ) {
    this.moneySupply = initialMoneySupply;
    this.velocity = initialVelocity;
    this.output = initialOutput;
    this.exchangeRate = initialExchangeRate;
  }

  getMoneySupply(): number {
    return this.moneySupply;
  }

  getVelocity(): number {
    return this.velocity;
  }

  getOutput(): number {
    return this.output;
  }

  getExchangeRate(): number {
    return this.exchangeRate;
  }

  private calculateInflationRate(
    deltaMoneySupply: number,
    deltaVelocity: number,
    deltaOutput: number
  ): number {
    const percentDeltaM: number = (deltaMoneySupply / this.moneySupply) * 100;
    const percentDeltaV: number = (deltaVelocity / this.velocity) * 100;
    const percentDeltaQ: number = (deltaOutput / this.output) * 100;

    return percentDeltaM + percentDeltaV + percentDeltaQ;
  }

  adjustMoneySupply(deltaMoneySupply: number): void {
    const percentDeltaM: number = deltaMoneySupply / this.moneySupply;

    this.moneySupply *= 1 + percentDeltaM;
  }

  adjustDemand(deltaVelocity: number, deltaOutput: number): void {
    const percentDeltaV: number = deltaVelocity / this.velocity;
    const percentDeltaQ: number = deltaOutput / this.output;

    this.velocity *= 1 + percentDeltaV;
    this.output *= 1 + percentDeltaQ;
  }

  simulateInflation(
    deltaMoneySupply: number,
    deltaVelocity: number,
    deltaOutput: number,
    scale: number = 1
  ): number {
    const inflationRate: number = this.calculateInflationRate(
      deltaMoneySupply * scale,
      deltaVelocity * scale,
      deltaOutput * scale
    );

    console.log(inflationRate);

    this.adjustMoneySupply(deltaMoneySupply * scale);
    this.adjustDemand(deltaVelocity * scale, deltaOutput * scale);

    // Adjust the exchange rate based on compounded inflation
    this.exchangeRate /= 1 + inflationRate / 100; // Compounded adjustment

    return inflationRate;
  }

  calculatePriceInUSD(): number {
    return this.moneySupply * this.exchangeRate;
  }
}

// // Example usage
// const simulator: CurrencySimulator = new CurrencySimulator(25000, 5, 25000, 1);

// const inflationRate1: number = simulator.simulateInflation(0, 0, 0);
// console.log(`Inflation Rate (0): ${inflationRate1}%`);
// console.log(`New Money Supply: ${simulator.getMoneySupply()}`);
// console.log(
//   `Exchange Rate: ${simulator.getExchangeRate()} (1 unit of currency = ${
//     1 / simulator.getExchangeRate()
//   } USD)`
// );
// console.log(`Price in USD: ${simulator.calculatePriceInUSD()}`);

// const inflationRate2: number = simulator.simulateInflation(-2500, 0, 0);
// console.log(`Inflation Rate (500): ${inflationRate2}%`);
// console.log(`New Money Supply: ${simulator.getMoneySupply()}`);
// console.log(
//   `Exchange Rate: ${simulator.getExchangeRate()} (1 unit of currency = ${
//     1 / simulator.getExchangeRate()
//   } USD)`
// );
// console.log(`Price in USD: ${simulator.calculatePriceInUSD()}`);
