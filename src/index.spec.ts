/* eslint-disable @typescript-eslint/no-explicit-any */
import { SecretsManager } from "aws-sdk";
import { on, infer } from ".";

jest.mock("aws-sdk");

describe("aws-mock", () => {
  it("Should create resolve mock from type", async () => {
    const m = on(SecretsManager)
      .mock("getSecretValue", infer)
      .resolve({ SecretString: "foo-bar" });

    const res = new SecretsManager({
      credentials: { accessKeyId: "rootkeyfoo" } as any
    })
      .getSecretValue({ SecretId: "bar-baz" })
      .promise();

    await expect(res).resolves.toMatchSnapshot("Result");
    expect(m.mock).toHaveBeenCalledTimes(1);
    expect(m.and.serviceMock.mock.calls[0]).toMatchSnapshot("Constructor");
  });

  it("Should create reject mock from type", async () => {
    const m = on(SecretsManager)
      .mock("getSecretValue", infer)
      .reject("foo-baz");

    const res = new SecretsManager()
      .getSecretValue({ SecretId: "bar-baz" })
      .promise();

    await expect(res).rejects.toMatchSnapshot("Result");
    expect(m.mock).toHaveBeenCalledTimes(1);
  });

  it("Should create resolve mock from instance", async () => {
    const m = on(new SecretsManager())
      .mock("getSecretValue", infer)
      .resolve({ SecretString: "foo-bar" });

    const res = m.service.getSecretValue({ SecretId: "bar-baz" }).promise();

    await expect(res).resolves.toMatchSnapshot("Result");
    expect(m.mock).toHaveBeenCalledTimes(1);
  });

  it("Should create reject mock from instance", async () => {
    const m = on(new SecretsManager())
      .mock("getSecretValue", infer)
      .reject(Error("baz-BAR"));

    const res = m.service.getSecretValue({ SecretId: "bar-baz" }).promise();

    await expect(res).rejects.toMatchSnapshot("Result");
    expect(m.mock).toHaveBeenCalledTimes(1);
  });

  it("Should not create snapshot", async () => {
    const m = on(SecretsManager)
      .mock("getSecretValue", infer)
      .resolve({ SecretString: "foo-bar" }, { snapshot: false });

    const res = new SecretsManager()
      .getSecretValue({ SecretId: "bar-baz" })
      .promise();

    await expect(res).resolves.toMatchSnapshot("Result");
    expect(m.mock).toHaveBeenCalledTimes(1);
  });

  it("Should invoke result callabck", async () => {
    const m = on(SecretsManager)
      .mock("getSecretValue", infer)
      .resolve(
        () => {
          return {
            SecretString: "FOO"
          };
        },
        { snapshot: false }
      );

    const res = new SecretsManager()
      .getSecretValue({ SecretId: "bar-baz" })
      .promise();

    await expect(res).resolves.toMatchSnapshot("Result");
    expect(m.mock).toHaveBeenCalledTimes(1);
  });

  it("Should chain mocks", async () => {
    const m = on(SecretsManager, { snapshot: false })
      .mock("getSecretValue", infer)
      .resolve(() => {
        return {
          SecretString: "FOO"
        };
      })
      .and.mock("createSecret", infer)
      .resolve({ Name: "FOO_SECRET" });

    const smm = new SecretsManager();
    smm.getSecretValue({ SecretId: "bar-baz" }).promise();

    await expect(
      smm.getSecretValue({ SecretId: "bar-baz" }).promise()
    ).resolves.toMatchSnapshot("getSecretValue");

    await expect(
      smm.createSecret({ Name: "FOO", SecretString: "BAR" }).promise()
    ).resolves.toMatchSnapshot("createSecret");

    expect(m.serviceMockBuilder.serviceMock).toHaveBeenCalledTimes(1);
  });
});
