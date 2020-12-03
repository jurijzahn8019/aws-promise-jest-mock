const branch = require("git-branch").sync();

// export empty
module.exports =
  branch === "main"
    ? {
      rules: {
        "body-leading-blank": [2, "always"],
        "body-max-length": [2, "always", Infinity],
        "body-max-line-length": [2, "always", Infinity],
        "body-min-length": [2, "always", 0],
        "footer-leading-blank": [2, "always"],
        "footer-max-length": [2, "always", Infinity],
        "footer-max-line-length": [2, "always", Infinity],
        "footer-min-length": [2, "always", 0],
        "header-max-length": [2, "always", 80],
        "header-min-length": [2, "always", 0],
        "references-empty": [2, "always"],
        "scope-enum": [2, "always", []],
        "scope-case": [2, "always", "lower-case"],
        "scope-empty": [2, "never"],
        "scope-max-length": [2, "always", Infinity],
        "scope-min-length": [2, "always", 0],
        "subject-case": [2, "always", "lower-case"],
        "subject-empty": [2, "never"],
        "subject-full-stop": [2, "never"],
        "subject-max-length": [2, "always", Infinity],
        "subject-min-length": [2, "always", 0],
        "type-enum": [
          2,
          "always",
          [
            "chore",
            "feat",
            "fix",
            "docs",
            "style",
            "refactor",
            "revert",
            "test"
          ]
        ],
        "type-case": [2, "always", "lower-case"],
        "type-empty": [2, "never"],
        "type-max-length": [2, "always", Infinity],
        "type-min-length": [2, "always", 3]
      }
    }
    : {
      rules: {
        "scope-case": [2, "always", "lower-case"]
      }
    };
