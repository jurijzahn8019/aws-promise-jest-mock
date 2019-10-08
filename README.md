# aws-promise-jest-mock

[![Build Status](https://travis-ci.org/jurijzahn8019/aws-promise-jest-mock.svg?branch=master)](https://travis-ci.org/jurijzahn8019/aws-promise-jest-mock)
[![Coverage Status](https://coveralls.io/repos/github/jurijzahn8019/aws-promise-jest-mock/badge.svg?branch=master)](https://coveralls.io/github/jurijzahn8019/aws-promise-jest-mock?branch=master)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=jurijzahn8019/aws-promise-jest-mock)](https://dependabot.com)
[![GitHub](https://img.shields.io/github/license/jurijzahn8019/aws-promise-jest-mock)](LICENSE)
![npm](https://img.shields.io/npm/v/@jurijzahn8019/aws-promise-jest-mock)
![Vulnerabilities](https://snyk.io/test/github/jurijzahn8019/aws-promise-jest-mock/badge.svg)
![David](https://img.shields.io/david/dev/jurijzahn8019/aws-promise-jest-mock)
![npm bundle size (scoped)](https://img.shields.io/bundlephobia/min/@jurijzahn8019/aws-promise-jest-mock)
![GitHub last commit](https://img.shields.io/github/last-commit/jurijzahn8019/aws-promise-jest-mock)

simple libraray for jest-tested projects to create jest mock for js aws-sdk .promise() calls

## WHY

i was tired to copy-paste my mock helpers across repos

## install

```bash
npm i -D @jurijzahn8019/aws-promise-jest-mock
```

## usage

in your code file

```typescript
export function foo() {
  return new SecretsManager().getSecretValue({ SecretId: "bar-baz" }).promise();
}
```

in your spec file

```typescript
import { SecretsManager } from "aws-sdk";
import { on } from "@jurijzahn8019/aws-promise-jest-mock";
import { foo } from "./code.ts";

jest.mock("aws-sdk");

describe("aws-mock", () => {
  it("Should succeed", async () => {
    const m = on(SecretsManager)
      .mock("getSecretValue")
      // Result type will be inferred by typescript
      .resolve({ SecretString: "foo-bar" });

    const res = foo();

    await expect(res).resolves.toMatchSnapshot("Result");
    expect(m.mock).toHaveBeenCalledTimes(1);
  });

  it("Should fail", async () => {
    const m = on(SecretsManager)
      .mock("getSecretValue")
      .reject("foo-baz");

    const res = foo();

    await expect(res).rejects.toMatchSnapshot("Result");
    expect(m.mock).toHaveBeenCalledTimes(1);
  });
});
```

## Changelog

[Changelog](CHANGELOG.md).

## License

[MIT Lizenz](https://choosealicense.com/licenses/mit/)
