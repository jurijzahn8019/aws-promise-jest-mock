/* eslint-disable @typescript-eslint/no-explicit-any */
import { Service, HttpRequest } from "aws-sdk";
import { Readable } from "stream";

import {
  ServiceMock,
  ServiceMockBuilder,
  ServiceFunction,
  ServiceConstructor,
  FunctionMock,
  MockOptions,
  MockResult,
  MockResultFunc,
  FunctionMockImpl
} from "./types";
import { hash } from "./utils";

/**
 * Encapsulates the function mock process
 *
 * @template S Type of the AWS Service to mock
 * @template C Type of the constructor function of the AWS Service
 * @template F Names of the service function which has to be mocked
 * @template E Type of the error thrown by the service function
 * @template N Type of the service function inferred by the given function name
 * @template B Type of the service mock builder which created this function builder instance
 */
export class AwsFunctionMockBuilder<
  S extends Service,
  C extends ServiceConstructor<S>,
  F extends keyof InstanceType<C>,
  E extends Error,
  N extends ServiceFunction<S, C, F, E>,
  B extends ServiceMockBuilder<S>
> {
  /**
   * Function Mock Instance
   */
  public mock: FunctionMock<S, C, F, E>;

  /**
   * Service Instance or Service Protoype Function
   */
  public service: S;

  /**
   * Identifier of the function to mock
   */
  public func: F;

  /**
   * Instance of the service mock builder which has created this
   * function mock builder
   */
  public serviceMockBuilder: B;

  /**
   * Get service mock from corresponding builder instance
   * Shortcut for this.serviceMockBuilder.serviceMock
   */
  public get serviceMock(): ServiceMock<S> {
    return this.serviceMockBuilder.serviceMock;
  }

  /**
   * Used to configure Mock creation
   */
  public options?: MockOptions;

  /**
   * Creates an instance of AwsFunctionMockBuilder.
   * Used by the AWS Mocok Builder Lib
   *
   * @param serviceMockBuilder the service instance or the service prototype function
   * @param func identifier of the function to mock
   * @param mock

   */
  public constructor(
    serviceMockBuilder: B,
    func: F,
    mock: FunctionMock<S, C, F, E>
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
   * @param value a function candidate
   * @returns a boolean value indication whether value is a function
   */
  private static isFunc(value: any): value is Function {
    return typeof value === "function";
  }

  /**
   * Used by the builder internally
   *
   * @param {
   *     result,
   *     error,
   *     options = {}
   *   }
   * @returns service function mock implementation
   */
  private getMockImpl({
    result,
    error,
    options = {}
  }: {
    result?: MockResult<S, C, F, E, N> | MockResultFunc<S, C, F, E, N>;
    error?: E;
    options?: MockOptions;
  } & MockOptions): FunctionMockImpl<S, C, F, E> {
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

    return (...args: any) => {
      if (snapshot) {
        expect(args).toMatchSnapshot(
          `${(this.service.constructor as any).serviceIdentifier ||
            /* istanbul ignore next */ "Mock"}.${this.func} (${
            error ? "reject" : "resolve"
          } mock ${hash(args, "sha1")})`
        );
      }

      if (error) {
        res.promise.mockRejectedValue(error);
      } else {
        res.promise.mockResolvedValue(
          AwsFunctionMockBuilder.isFunc(result) ? result(...args) : result
        );
      }

      return res as any;
    };
  }

  /**
   * Creates resolving mock which returns given result
   *
   * @param result Data to return by the mock
   * @param [options] used to override options defined on the builder instance
   * @returns

   */
  public resolve(
    result: MockResult<S, C, F, E, N> | MockResultFunc<S, C, F, E, N>,
    options?: MockOptions
  ): this {
    this.mock.mockImplementation(this.getMockImpl({ result, options }));
    return this;
  }

  /**
   * Creates rejecting mock which throws given error
   *
   * @param err error to throw
   * @param [options] used to override options defined on the builder instance
   * @returns

   */
  public reject(err: E | Error | string, options?: MockOptions): this {
    const error = (typeof err === "string" ? Error(err) : err) as E;
    this.mock.mockImplementation(this.getMockImpl({ error, options }));
    return this;
  }

  /**
   * Used to chain multiple function mock cretions
   */
  public get and(): B {
    return this.serviceMockBuilder;
  }
}
