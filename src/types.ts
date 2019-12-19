/* eslint-disable @typescript-eslint/no-explicit-any */
import { Service } from "aws-sdk";
import { PromiseResult } from "aws-sdk/lib/request";

/**
 * Return Type of the AWS Service function
 *
 * @template T a function to infer return value from
 */
export type Result<T> = T extends (...args: any) => infer R ? R : any;

/**
 * Input Type of the AWs Service Function
 *
 * @template T a function to infer input args from
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
export interface ServiceConstructor<S extends object = Service> {
  new (options?: any): S; // TODO: TS 3.7 ConstructorParameters<ServiceConstructor<S>>): S;
}

/**
 * Interface of a service mock builder
 *
 * @template S Type of the AWS Service to mock
 */
export interface ServiceMockBuilder<S extends object = Service> {
  serviceMock: ServiceMock<S>;
  instance: S;
  options?: MockOptions;
}

/**
 * Type of options taken by the service constructor
 *
 * @template S Type of the AWS Service to mock
 */
export type ServiceOptions<S extends object = Service> = ConstructorParameters<
  ServiceConstructor<S>
>;

/**
 * Service Mock Type
 *
 * @template S Type of the AWS Service to mock
 */
export type ServiceMock<S extends object = Service> = jest.Mock<
  S,
  ServiceOptions<S>
>;

/**
 * Describes a Service Function in AWS Sdk
 *
 * @template S Type of the AWS Service to mock
 * @template C Type of the constructor function of the AWS Service
 * @template F Names of the service function which has to be mocked
 * @template E Type of the error thrown by the service function
 */
export type ServiceFunction<
  S extends object = Service,
  C extends ServiceConstructor<S> = ServiceConstructor<S>,
  F extends keyof InstanceType<C> = keyof InstanceType<C>,
  E extends Error = Error
> = InstanceType<C>[F] & {
  promise(): Promise<PromiseResult<any, E>>;
};

/**
 * Service Function mock alias
 *
 * @template S Type of the AWS Service to mock
 * @template C Type of the constructor function of the AWS Service
 * @template F Names of the service function which has to be mocked
 * @template E Type of the error thrown by the service function
 */
export type FunctionMock<
  S extends object = Service,
  C extends ServiceConstructor<S> = ServiceConstructor<S>,
  F extends keyof InstanceType<C> = keyof InstanceType<C>,
  E extends Error = Error
> = jest.Mock<
  Result<ServiceFunction<S, C, F, E>>,
  Input<ServiceFunction<S, C, F, E>>
>;

/**
 * Interface of the service function jest mock implementation
 *
 * @template S Type of the AWS Service to mock
 * @template C Type of the constructor function of the AWS Service
 * @template F Names of the service function which has to be mocked
 * @template E Type of the error thrown by the service function
 */
export type FunctionMockImpl<
  S extends object = Service,
  C extends ServiceConstructor<S> = ServiceConstructor<S>,
  F extends keyof InstanceType<C> = keyof InstanceType<C>,
  E extends Error = Error
> = (
  ...args: Input<ServiceFunction<S, C, F, E>>
) => Result<ServiceFunction<S, C, F, E>>;

/**
 * Inferred Result Type from a AWS Service Function
 *
 * @template S Type of the AWS Service to mock
 * @template C Type of the constructor function of the AWS Service
 * @template F Names of the service function which has to be mocked
 * @template E Type of the error thrown by the service function
 * @template N Type of the service function inferred by the given function name
 */
export type InferredResult<
  S extends object = Service,
  C extends ServiceConstructor<S> = ServiceConstructor<S>,
  F extends keyof InstanceType<C> = keyof InstanceType<C>,
  E extends Error = Error,
  N extends ServiceFunction<S, C, F, E> = ServiceFunction<S, C, F, E>
> = Input<Input<Result<Result<N>["promise"]>["then"]>[0]>[0];

/**
 * As inferred result, but all fields are optional
 *
 * @template S Type of the AWS Service to mock
 * @template C Type of the constructor function of the AWS Service
 * @template F Names of the service function which has to be mocked
 * @template E Type of the error thrown by the service function
 * @template N Type of the service function inferred by the given function name
 */
export type MockResult<
  S extends object = Service,
  C extends ServiceConstructor<S> = ServiceConstructor<S>,
  F extends keyof InstanceType<C> = keyof InstanceType<C>,
  E extends Error = Error,
  N extends ServiceFunction<S, C, F, E> = ServiceFunction<S, C, F, E>
> = Partial<InferredResult<S, C, F, E, N>>;

/**
 * a function which receives the service function params
 * and returns a service function promise result back
 *
 * @template S Type of the AWS Service to mock
 * @template C Type of the constructor function of the AWS Service
 * @template F Names of the service function which has to be mocked
 * @template E Type of the error thrown by the service function
 * @template N Type of the service function inferred by the given function name
 */
export type MockResultFunc<
  S extends object = Service,
  C extends ServiceConstructor<S> = ServiceConstructor<S>,
  F extends keyof InstanceType<C> = keyof InstanceType<C>,
  E extends Error = Error,
  N extends ServiceFunction<S, C, F, E> = ServiceFunction<S, C, F, E>
> = {
  (...args: Input<ServiceFunction<S, C, F, E>>): MockResult<S, C, F, E, N>;
};
