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
export function on<S extends Service, C extends ServiceConstructor<S>>(
  serviceOrConstructor: ServiceConstructor<S> | S,
  options?: MockOptions
): AwsServiceMockBuilder<S, C> {
  return serviceOrConstructor instanceof Service ||
    serviceOrConstructor.name !== "mockConstructor"
    ? new AwsServiceMockBuilder<S, C>(
        serviceOrConstructor.constructor as ServiceConstructor<S>,
        serviceOrConstructor as InstanceType<C>,
        options
      )
    : new AwsServiceMockBuilder<S, C>(
        serviceOrConstructor,
        serviceOrConstructor.prototype as InstanceType<C>,
        options
      );
}

export * from "./AwsFunctionMockBuilder";
export * from "./AwsServiceMockBuilder";
export * from "./types";
export * from "./utils";
