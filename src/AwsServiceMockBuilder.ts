/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Service, AWSError } from "aws-sdk";
import {
  ServiceConstructor,
  MockOptions,
  ServiceMock,
  FunctionMock,
  ServiceFunction,
} from "./types";
import { AwsFunctionMockBuilder } from "./AwsFunctionMockBuilder";

/**
 * Encapsulates Service Mock build Process
 * @template S Type of the AWS Service to mock functions on
 * @template C Type of the AWS Service Constructor function
 */
export class AwsServiceMockBuilder<
  S extends object = Service,
  C extends ServiceConstructor<S> = ServiceConstructor<S>
> {
  /**
   * Service Instance or Service Prototype function
   */
  public instance: InstanceType<C>;

  /**
   * Service Constructor Function
   */
  public service: ServiceConstructor<S>;

  /**
   * If ServiceConstructor is a mockConstructor,
   * this casts it into jest.Mock
   */
  public serviceMock: ServiceMock<S>;

  /**
   * Used to configure mock creation
   */
  public options?: MockOptions;

  /**
   * Creates an instance of AwsServiceMockBuilder
   * called internally by the "on" function
   *
   * @param serviceConstructor
   * @param instance
   * @param options
   */
  public constructor(
    serviceConstructor: ServiceConstructor<S>,
    instance: InstanceType<C>,
    options?: MockOptions
  ) {
    this.service = serviceConstructor;
    this.instance = instance;
    this.serviceMock = (serviceConstructor as unknown) as ServiceMock<S>;
    this.options = options;
  }

  /**
   * Creates function mock builder providing functions
   * to create mocks on the given function
   *
   * @template F name of the AWS Service function
   * @template E type of Error can be returned by mock
   * @template N type of aws service function to mock
   * @param func function name to mock
   */
  public mock<
    F extends keyof InstanceType<C>,
    E extends Error = AWSError,
    N extends ServiceFunction<S, C, F, E> = ServiceFunction<S, C, F, E>
  >(
    func: F
  ): AwsFunctionMockBuilder<S, C, F, E, N, AwsServiceMockBuilder<S, C>> {
    const sf = this.instance[func];
    const mock: FunctionMock<S, C, F, E> = (sf !== undefined
      ? jest.spyOn(this.instance, func as any).mockReturnValue(undefined as any)
      : jest.fn()) as FunctionMock<S, C, F, E>;

    this.instance[func] = (mock as unknown) as InstanceType<C>[F];

    const res = new AwsFunctionMockBuilder<
      S,
      C,
      F,
      E,
      N,
      AwsServiceMockBuilder<S, C>
    >(this, func, mock);
    return res;
  }
}
