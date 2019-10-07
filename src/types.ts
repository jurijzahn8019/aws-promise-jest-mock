/* eslint-disable @typescript-eslint/no-explicit-any */
import { Service } from "aws-sdk";
import { PromiseResult } from "aws-sdk/lib/request";

/**
 * Return Type of the AWS Service function
 */
export type Result<T> = T extends (...args: any) => infer R ? R : any;

/**
 * Input Type of the AWs Service Function
 *
 * @template T a function type
 */
export type Input<T> = T extends (...args: infer P) => any ? P : never;

/**
 * Used to configure Mock Creation
 */
export interface MockOptions {
  /**
   * Indicates whether mock function arguments should be snapshoted
   * @default true
   */
  snapshot?: boolean;
}

/**
 * Describes an Aws Service Constructor Function
 *
 * @template S Type of the AWS Service to mock
 */
export interface ServiceConstructor<S extends Service> {
  new (options?: any): S; // TODO: TS 3.7 ConstructorParameters<ServiceConstructor<S>>): S;
}

export interface ServiceMockBuilder<S extends Service> {
  serviceMock: ServiceMock<S>;
  instance: S;
  options?: MockOptions;
}

export type ServiceOptions<S extends Service> = ConstructorParameters<
  ServiceConstructor<S>
>;

/**
 * Service Mock Type
 */
export type ServiceMock<S extends Service> = jest.Mock<S, ServiceOptions<S>>;

/**
 * Describes a Service Function in AWS Sdk
 */
export type ServiceFunction<
  S extends Service,
  C extends ServiceConstructor<S>,
  F extends keyof InstanceType<C>,
  E extends Error
> = InstanceType<C>[F] & {
  promise(): Promise<PromiseResult<any, E>>;
};

export type FunctionMock<
  S extends Service,
  C extends ServiceConstructor<S>,
  F extends keyof InstanceType<C>,
  E extends Error
> = jest.Mock<
  Result<ServiceFunction<S, C, F, E>>,
  Input<ServiceFunction<S, C, F, E>>
>;

/**
 * Inferred Result Type from a AWS Service Function
 */
export type InferredResult<
  S extends Service,
  C extends ServiceConstructor<S>,
  F extends keyof InstanceType<C>,
  E extends Error,
  N extends ServiceFunction<S, C, F, E>
> = Input<Input<Result<Result<N>["promise"]>["then"]>[0]>[0];

/**
 * As inferred result, but all fields are optional
 */
export type MockResult<
  S extends Service,
  C extends ServiceConstructor<S>,
  F extends keyof InstanceType<C>,
  E extends Error,
  N extends ServiceFunction<S, C, F, E>
> = Partial<InferredResult<S, C, F, E, N>>;

/**
 * a function which returns mock result
 */
export type MockResultFunc<
  S extends Service,
  C extends ServiceConstructor<S>,
  F extends keyof InstanceType<C>,
  E extends Error,
  N extends ServiceFunction<S, C, F, E>
> = {
  (...args: Input<ServiceFunction<S, C, F, E>>): MockResult<S, C, F, E, N>;
};
