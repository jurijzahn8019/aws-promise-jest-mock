import { createHash } from "crypto";

/**
 * produces a hash from stringified input data
 *
 * @param data data to hash
 * @param [algorithm] hash algorythm to use, defaults to sha256
 * @returns hash of the data value
 */
export function hash<T>(data: T, algorithm = "sha256"): string {
  const hasher = createHash(algorithm);
  const res = hasher.update(JSON.stringify(data)).digest("hex");
  return res;
}

/**
 * Just casts given function into a jest mock
 * Usefull by using jest.mock("module") function
 *
 * @deprecated please use `asMock` from <https://github.com/jurijzahn8019/jest-mock-inference-helper> instead
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function infer<S extends (...args: any) => any>(
  func: S
): jest.Mock<ReturnType<S>, Parameters<S>> {
  return func as unknown as jest.Mock<ReturnType<S>, Parameters<S>>;
}
