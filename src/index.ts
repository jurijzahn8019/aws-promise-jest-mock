import { Service } from "aws-sdk";
import { AwsServiceMockBuilder } from "./AwsServiceMockBuilder";
import { ServiceConstructor, MockOptions } from "./types";

/**
 * This starts the Aws Service Mock Builder
 * acts as Entrypoint in order to create a mock function
 *
 * @template S Type of the AWS Service to mock
 * @template O type of the option object passed to the constructor
 * @param serviceOrConstructor AWS Service class constructor or AWS Service instance
 * @returns service mock builder instance
 *
 * ```typescript
 *
 * // mytest.ts
 *
 * export default () => new IAM().listAccessKeys().promise();
 *
 * // mytest.spec.ts
 * import { IAM } from "aws-sdk";
 * import foo from "./mytest.ts"
 *
 * describe("foo", ()=>{
 *  it("Should foo", async ()=> {
 *   const m = on(IAM)
 *    .mock("listAccessKeys")
 *    .resolve({ AccessKeyMetadata: [{ AccessKeyId: "FOO" }] })
 *
 *   const res = foo();
 *   await expect(foo).resolves.toMatchSnapshot();
 *   expect(m.mock).toHaveBeenCalledTimes(1)
 *  })
 * })
 *
 * ```
 */
export function on<
  S extends object = Service,
  C extends ServiceConstructor<S> = ServiceConstructor<S>
>(
  serviceOrConstructor: ServiceConstructor<S> | S,
  options?: MockOptions
): AwsServiceMockBuilder<S, C> {
  const sc = serviceOrConstructor as any;

  // eslint-disable-next-line no-underscore-dangle
  if (sc instanceof Service || sc._isMockFunction !== true) {
    return new AwsServiceMockBuilder<S, C>(
      sc.constructor as ServiceConstructor<S>,
      sc as InstanceType<C>,
      options
    );
  }

  return new AwsServiceMockBuilder<S, C>(
    sc,
    sc.prototype as InstanceType<C>,
    options
  );
}

export * from "./AwsFunctionMockBuilder";
export * from "./AwsServiceMockBuilder";
export * from "./types";
export * from "./utils";
