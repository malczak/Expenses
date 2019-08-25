declare module 'cents' {
  export default class Money {
    constructor(cents?: number);

    value: number;

    cents: number;

    /**
     *  Sets new value
     */
    set(value: Money | string | number): void;

    /**
     * Returns new negated value.
     */
    negated(): Money;

    /**
     * Adds values together.
     */
    add(number: Money | number): Money;

    /**
     * Adds values together. (alias for `add`)
     */
    plus(number: Money | number): Money;

    /**
     * Subtracts value.
     */
    subtract(number: Money | number): Money;

    /**
     * Subtracts value. (alias for `subtract`)
     */
    minus(number: Money | number): Money;

    /**
     * Multiplies values.
     */
    multiply(number: number): Money;

    /**
     * Multiplies values. (alias for `multiply`)
     */
    times(number: number): Money;

    /**
     * Divides value.
     */
    divide(number: number): Money;

    /**
     * Divides value. (alias for `divide`)
     */
    dividedBy(number: number): Money;

    /**
     * Checks if values are equal
     */
    equals(value: Money | number): boolean;

    /**
     * Checks if value is 0
     */
    isZero(): boolean;

    /**
     * Checks if value is negative
     */
    isNegative(): boolean;

    /**
     * Checks if value is possitive
     */
    isPositive(): boolean;

    /**
     * Checks if value is less then given value.
     */
    lessThan(value: Money | number): boolean;

    /**
     * Checks if value is less then or equal to given value.
     */
    lessThanOrEqualTo(value: Money | number): boolean;

    /**
     * Checks if value is greater then given value.
     */
    greaterThan(value: Money | number): boolean;

    /**
     * Checks if value is greater then or equal to given value.
     */
    greaterThanOrEqualTo(value: Money | number): boolean;

    /**
     * Calculates a percent value
     */
    percent(value: number): Money;

    /**
     * Asserts value is a valid number
     */
    assertFinate(): Money;

    /**
     * Returns string representation in format (-)xx.xx
     */
    toString(): string;

    /**
     * Alias for `toString` precision is ignored
     */
    toFixed(): string;

    /**
     * Clones instance
     */
    clone(): Money;

    /**
     * New instance from value in cents
     */
    static cents(value: number): Money;

    /**
     * New value from numeric value
     */
    static from(value: Money | number | string): Money;

    /**
     * Settings
     */
    static settings: any;
  }
}
