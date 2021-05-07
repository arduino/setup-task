## Development workflow

### 1. Install Tools

#### Task

Common development processes are run using [the **Task** task runner tool](https://taskfile.dev/#/).

Follow the installation instructions here:<br />
https://taskfile.dev/#/installation

#### Node.js

[**npm**](https://www.npmjs.com/) is used for dependency management.

Follow the installation instructions here:<br />
https://nodejs.dev/download

#### Extras

Some optional tools used by this project:

- [**Python**](https://www.python.org/downloads/)
- [**Poetry**](https://python-poetry.org/docs/#installation)

### 2. Coding

Now you're ready to work some [TypeScript](https://www.typescriptlang.org/) magic!

Make sure to write or update tests for your work when appropriate.

### 3. Format code

Format the code to follow the standard style for the project:

```
npm run format
```

### 4. Run tests

Run the tests to ensure that the code works as expected:

```
task check
```

### 5. Build

It is necessary to compile the code before it can be used by GitHub Actions. Remember to run this command before committing any code changes:

```
task build
```

### 6. Commit

Everything is now ready to make your contribution to the project, so commit it to the repository and submit a pull request.

Thanks!

## Enable verbose logging for a pipeline
Additional log events with the prefix ::debug:: can be enabled by setting the secret `ACTIONS_STEP_DEBUG` to `true`.

See [step-debug-logs](https://github.com/actions/toolkit/blob/master/docs/action-debugging.md#step-debug-logs) for reference.

## Release workflow

Instructions for releasing a new version of the action:

1. If the release will increment the major version, update the action refs in the examples in README.md (e.g., `uses: arduino/setup-task@v1` -> `uses: arduino/setup-task@v2`).
1. Create a [GitHub release](https://docs.github.com/en/github/administering-a-repository/managing-releases-in-a-repository#creating-a-release), following the `vX.Y.Z` tag name convention. Make sure to follow [the SemVer specification](https://semver.org/).
1. Rebase the release branch for that major version (e.g., `v1` branch for the `v1.x.x` tags) on the tag. If no branch exists for the release's major version, create one.
