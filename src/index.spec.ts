import { SecretsManager } from "aws-sdk";
import { on, infer } from ".";

jest.mock("aws-sdk");

describe("aws-mock", () => {
  it("Should create resolve mock from type", async () => {
    const m = on(SecretsManager)
      .mock("getSecretValue", infer)
      .resolve({ SecretString: "foo-bar" });

    const res = new SecretsManager()
      .getSecretValue({ SecretId: "bar-baz" })
      .promise();

    await expect(res).resolves.toMatchSnapshot("Result");
    expect(m.mock).toHaveBeenCalledTimes(1);
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
});
