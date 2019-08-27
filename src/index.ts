/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Service, AWSError, HttpRequest } from "aws-sdk";
import { Request } from "aws-sdk/lib/request";
import { Readable } from "stream";
import { createHash } from "crypto";

/**
 * Describes an Aws Service Constructor Function
 *
 * @export
 * @interface ServiceConstructor
 * @template S Type of the AWS Service to mock
 * @template O type of the option object passed to the constructor
 */
export interface ServiceConstructor<S extends Service, O = any> {
  new (options: O): S;
}

/**
 * Describes an AWS Service Function Mock Signature
 *
 * @export
 * @interface ServiceFunction
 * @template Input any kind of input passed to the service function
 * @template Data returned function data type
 * @template Err an error thowed by the service function
 */
export interface ServiceFunction<Input extends any[], Data, Err extends Error> {
  (...args: Input): Request<Data, Err>;
}

/**
 * Used to configure Mock Creation
 *
 * @export
 * @interface CreateMockOptions
 */
export interface CreateMockOptions {
  /**
   * Indicates whether mock function arguments should be snapshoted
   * @default true
   */
  snapshot?: boolean;
}

/**
 * Encapsulates the function mock process
 *
 * @export
 * @class AwsFunctionMockBuilder
 * @template S type of the AWS Service
 * @template F identifier of the Service Function to mock
 * @template Err Error thrown by the function
 * @template Data Data returned by the function
 * @template Input Input passed to the function
 */
export class AwsFunctionMockBuilder<
  S extends Service,
  F extends keyof S,
  Err extends Error = AWSError,
  Data = any,
  Input extends any[] = any
> {
  /**
   * Function Mock Instance
   *
   * @type {jest.Mock<Request<Data, Err>, Input>}
   * @memberof AwsFunctionMockBuilder
   */
  public mock: jest.Mock<Request<Data, Err>, Input>;

  /**
   * Service Instance or Service Protoype Function
   *
   * @type {S}
   * @memberof AwsFunctionMockBuilder
   */
  public service: S;

  /**
   * Identifier of the function to mock
   *
   * @type {F}
   * @memberof AwsFunctionMockBuilder
   */
  public func: F;

  /**
   * Instance of the service mock builder which has created this
   * function mock builder
   *
   * @type {AwsServiceMockBuilder<S, any>}
   * @memberof AwsFunctionMockBuilder
   */
  public serviceMockBuilder: AwsServiceMockBuilder<S, any>;

  /**
   * Used to configure Mock creation
   *
   * @type {(CreateMockOptions)}
   * @memberof AwsFunctionMockBuilder
   */
  public options?: CreateMockOptions;

  /**
   * Creates an instance of AwsFunctionMockBuilder.
   * Used by the AWS Mocok Builder Lib
   *
   * @param {S} service the service instance or the service prototype function
   * @param {F} func identifier of the function to mock
   * @param {jest.Mock<Request<Data, Err>, Input>} mock
   * @memberof AwsFunctionMockBuilder
   */
  public constructor(
    serviceMockBuilder: AwsServiceMockBuilder<S>,
    func: F,
    mock: jest.Mock<Request<Data, Err>, Input>
  ) {
    this.serviceMockBuilder = serviceMockBuilder;
    this.func = func;
    this.mock = mock;
    this.service = serviceMockBuilder.instance;
    this.options = serviceMockBuilder.options;
  }

  /**
   * Used by the builder internally
   *
   * @private
   * @param {*} f
   * @returns {f is Function}
   * @memberof AwsFunctionMockBuilder
   */
  private static isFunc(f: any): f is Function {
    return typeof f === "function";
  }

  /**
   * Used by the builder internally
   *
   * @private
   * @param {({
   *     result?: Partial<Data> | { (...args: Input): Partial<Data> };
   *     error?: Err;
   *     options?: CreateMockOptions;
   *   } & CreateMockOptions)} {
   *     result,
   *     error,
   *     options
   *   }
   * @returns {{ (...args: Input): Request<Data, Err> }}
   * @memberof AwsFunctionMockBuilder
   */
  private getImpl({
    result,
    error,
    options = {}
  }: {
    result?: Partial<Data> | { (...args: Input): Partial<Data> };
    error?: Err;
    options?: CreateMockOptions;
  } & CreateMockOptions): { (...args: Input): Request<Data, Err> } {
    const { snapshot = true } = { ...this.options, ...options };
    const res = {
      promise: jest.fn(),
      abort: jest.fn(),
      createReadStream: jest.fn() as jest.Mock<Readable>,
      eachPage: jest.fn(),
      isPageable: jest.fn().mockReturnValue(false) as jest.Mock<boolean>,
      send: jest.fn(),
      on: jest.fn(),
      onAsync: jest.fn(),
      startTime: new Date("2019"),
      httpRequest: (jest.fn() as unknown) as HttpRequest
    };

    return (...args: Input) => {
      if (snapshot) {
        expect(args).toMatchSnapshot(
          `${(this.service.constructor as any).serviceIdentifier ||
            /* istanbul ignore next */ "Mock"}.${this.func} (${
            error ? "reject" : "resolve"
          } mock ${AwsFunctionMockBuilder.hash(args, "sha1")})`
        );
      }

      if (error) {
        res.promise.mockRejectedValue(error);
      } else {
        res.promise.mockResolvedValue(
          AwsFunctionMockBuilder.isFunc(result) ? result(...args) : result
        );
      }

      return res;
    };
  }

  /**
   * Used internally by the mock builder to sha1 the argument list
   *
   * @private
   * @param {*} data
   * @param {string} [algorithm="sha256"]
   * @returns {string}
   * @memberof AwsFunctionMockBuilder
   */
  private static hash(
    data: any,
    /* istanbul ignore next */ algorithm = "sha256"
  ): string {
    const hasher = createHash(algorithm);
    const res = hasher.update(JSON.stringify(data)).digest("hex");
    return res;
  }

  /**
   * Creates resolving mock which returns given result
   *
   * @param {(Partial<Data> | { (...args: Input): Partial<Data> })} result Data to return by the mock
   * @param {CreateMockOptions} [options] used to override options defined on the builder instance
   * @returns {this}
   * @memberof AwsFunctionMockBuilder
   */
  public resolve(
    result: Partial<Data> | { (...args: Input): Partial<Data> },
    options?: CreateMockOptions
  ): this {
    this.mock.mockImplementation(this.getImpl({ result, options }));
    return this;
  }

  /**
   * Creates rejecting mock which throws given error
   *
   * @param {(Err | Error | string)} error error to throw
   * @param {CreateMockOptions} [options] used to override options defined on the builder instance
   * @returns {this}
   * @memberof AwsFunctionMockBuilder
   */
  public reject(
    error: Err | Error | string,
    options?: CreateMockOptions
  ): this {
    this.mock.mockImplementation(
      this.getImpl({
        error: (typeof error === "string" ? Error(error) : error) as Err,
        options
      })
    );
    return this;
  }

  /**
   * Used to chain multiple function mock cretions
   *
   * @readonly
   * @type {AwsServiceMockBuilder<S>}
   * @memberof AwsFunctionMockBuilder
   */
  public get and(): AwsServiceMockBuilder<S> {
    return this.serviceMockBuilder;
  }
}

/**
 * Encapsulates Service Mock build Process
 *
 * @export
 * @class AwsServiceMockBuilder
 * @template S Type of the AWS Service to mock
 * @template O type of the option object passed to the constructor
 */
export class AwsServiceMockBuilder<S extends Service, O = any> {
  /**
   * Service Instance or Service Prototype function
   *
   * @type {S}
   * @memberof AwsServiceMockBuilder
   */
  public instance: S;

  /**
   * Service Constructor Fucntion
   *
   * @type {ServiceConstructor<S, O>}
   * @memberof AwsServiceMockBuilder
   */
  public service: ServiceConstructor<S, O>;

  /**
   * If ServiceConstructor is a mockConstructor,
   * this casts it into jest.Mock
   *
   * @type {jest.Mock<S, [O]>}
   * @memberof AwsServiceMockBuilder
   */
  public serviceMock: jest.Mock<S, [O]>;

  /**
   * Used to configure mock creation
   *
   * @type {CreateMockOptions}
   * @memberof AwsServiceMockBuilder
   */
  public options?: CreateMockOptions;

  /**
   * Creates an instance of AwsServiceMockBuilder.
   * called internally by the "on" function

   * @param {{
   *     service: ServiceConstructor<S, O>;
   *     instance: S;
   *   }} {
   *     service,
   *     instance
   *   }
   * @memberof AwsServiceMockBuilder
   */
  public constructor({
    serviceConstructor,
    instance,
    options
  }: {
    serviceConstructor: ServiceConstructor<S, O>;
    instance: S;
    options?: CreateMockOptions;
  }) {
    this.service = serviceConstructor;
    this.instance = instance;
    this.serviceMock = (serviceConstructor as unknown) as jest.Mock<S, [O]>;
    this.options = options;
  }

  /**
   * Starts the Function Mock Builder for the given function
   *
   * @template F
   * @template Input any kind of input passed to the service function
   * @template Data returned function data type
   * @template Err an error thowed by the service function
   * @param {F} func identifier of the function which should be mocked
   * @param {{ (func: S[F]): jest.Mock<Request<Data, Err>, Input> }} inferFunc
   *   pass the infer function here, used to infer the signature of the mocked function
   * @returns {AwsFunctionMockBuilder<S, F, Err, Data, Input>}
   * @memberof AwsServiceMockBuilder
   */
  public mock<
    F extends keyof S,
    Err extends AWSError = AWSError,
    Data = any,
    Input extends any[] = any
  >(
    func: F,
    inferFunc: { (func: S[F]): jest.Mock<Request<Data, Err>, Input> }
  ): AwsFunctionMockBuilder<S, F, Err, Data, Input> {
    const mock =
      this.instance[func] !== undefined
        ? inferFunc(jest
            .spyOn(this.instance, func as any)
            .mockReturnValue(undefined as any) as any)
        : inferFunc((jest.fn() as unknown) as S[F]);
    this.instance[func] = (mock as unknown) as S[F];

    return new AwsFunctionMockBuilder<S, F, Err, Data, Input>(this, func, mock);
  }
}

/**
 * This is used in the mock call in order to infer resulting type
 * for the mock function
 *
 * ```ts
 * on(IAM)
 *  .mock("listAccessKeys", infer)
 *  .resolve(...);
 * ```
 *
 * @export
 * @template Input any kind of input passed to the service function
 * @template Data returned function data type
 * @template Err an error thowed by the service function
 * @param {ServiceFunction<Input, Data, Err>} func
 * @returns {jest.Mock<Request<Data, Err>, Input>}
 */
export function infer<
  Err extends Error = AWSError,
  Data = any,
  Input extends any[] = any
>(
  func: ServiceFunction<Input, Data, Err>
): jest.Mock<Request<Data, Err>, Input> {
  return func as jest.Mock<Request<Data, Err>, Input>;
}

/**
 * This starts the Aws Service Mock Builder
 * acts as Entrypoint in order to create a mock function
 *
 * @export
 * @template S Type of the AWS Service to mock
 * @template O type of the option object passed to the constructor
 * @param {ServiceConstructor<S, O>} serviceOrConstructor AWS Service class constructor
 *   or AWS Service instance
 * @returns {AwsServiceMockBuilder<S, O>} service mock builder instance
 *
 *
 *
 * ```ts
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
 *    .mock("listAccessKeys", infer)
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
export function on<S extends Service, O = any>(
  serviceOrConstructor: ServiceConstructor<S, O> | S,
  options?: CreateMockOptions
): AwsServiceMockBuilder<S, O> {
  if (
    serviceOrConstructor instanceof Service ||
    (serviceOrConstructor as any).name !== "mockConstructor"
  ) {
    return new AwsServiceMockBuilder({
      serviceConstructor: serviceOrConstructor.constructor as ServiceConstructor<
        S,
        O
      >,
      instance: serviceOrConstructor as S
    });
  }

  return new AwsServiceMockBuilder({
    serviceConstructor: serviceOrConstructor,
    instance: serviceOrConstructor.prototype as S,
    options
  });
}
