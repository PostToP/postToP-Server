import {InvalidArgumentError} from "../interface/errors";

class ValidatorMonad {
  private value: any;
  constructor(v: any) {
    this.value = v;
  }

  // Required Check
  required(error: string) {
    if (this.value) return this;
    throw new InvalidArgumentError(error);
  }

  nonRequired(defa: any) {
    if (typeof this.value === "undefined") this.value = defa;
    return this;
  }

  // Type Check
  number(error: string) {
    if (typeof this.value === "number") return this;
    if (!Number.isNaN(this.value)) {
      this.value = Number(this.value);
      return this;
    }
    throw new InvalidArgumentError(error);
  }

  string(error: string) {
    if (typeof this.value === "string") return this;
    throw new InvalidArgumentError(error);
  }

  bool(error: string) {
    if (typeof this.value === "boolean") return this;
    throw new InvalidArgumentError(error);
  }

  regex(ex: RegExp, error: string) {
    if (ex.test(this.value)) return this;
    throw new InvalidArgumentError(error);
  }

  date(error: string) {
    if (new Date(this.value).toDateString() !== "Invalid Date") return this;
    throw new InvalidArgumentError(error);
  }

  // Value Check
  lengthBetween(min: number, max: number, error: string) {
    if (this.value.length >= min && max >= this.value.length) return this;
    throw new InvalidArgumentError(error);
  }

  valueBetween(min: number, max: number, error: string) {
    if (this.value >= min && max >= this.value) return this;
    throw new InvalidArgumentError(error);
  }

  notEmpty(error: string) {
    if (this.value.trim() !== "") return this;
    throw new InvalidArgumentError(error);
  }

  min(min: number, error: string) {
    if (this.value >= min) return this;
    throw new InvalidArgumentError(error);
  }

  max(max: number, error: string) {
    if (max < this.value) return this;
    throw new InvalidArgumentError(error);
  }

  in(arr: any[], error: string) {
    if (arr.includes(this.value)) return this;
    throw new InvalidArgumentError(error);
  }

  unwrap<T>(parser?: (v: any) => T): T {
    if (parser) return parser(this.value);
    return this.value as T;
  }
}

export const Validate = (v: any) => {
  return new ValidatorMonad(v);
};
