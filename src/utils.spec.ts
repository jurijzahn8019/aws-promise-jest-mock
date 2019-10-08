import { infer, hash } from "./utils";
import { sut } from "./__fixtures__/infer";

jest.mock("./__fixtures__/infer.ts");

describe("utils", () => {
  describe("infer", () => {
    it("should just return the given mock function", () => {
      const mock = infer(sut);
      mock.mockImplementation((a, b) => {
        return {
          a: `a: ${a}`,
          b: 100 + b
        };
      });
      expect(mock).toBe(sut);
      expect(sut("F", 20)).toMatchInlineSnapshot(`
        Object {
          "a": "a: F",
          "b": 120,
        }
      `);
    });
  });

  describe("hash", () => {
    it("should use custom hash algo", () => {
      const data = { a: "foo", b: 30 };
      const r1 = hash(data);
      const r2 = hash(data);
      const d1 = hash(data, "sha1");

      expect(r1).toEqual(r2);
      expect(d1).not.toEqual(r1);
    });
  });
});
