# setup-taskfile

This action makes the `task` binary available to Workflows.

## Inputs

### `version`

The version of [Task](https://taskfile.dev/#/) to install.
Can be an exact version (e.g., `3.4.2`) or a version range (e.g., `3.x`).

**Default**: `3.x`

### `repo-token`

(**Optional**) GitHub access token used for GitHub API requests.
Heavy usage of the action can result in workflow run failures caused by rate limiting. GitHub provides a more generous allowance for Authenticated API requests.

It will be convenient to use [`${{ secrets.GITHUB_TOKEN }}`](https://docs.github.com/en/actions/reference/authentication-in-a-workflow).

## Usage

To get the latest stable version of Task just add this step:

```yaml
- name: Install Taskfile
  uses: Arduino/actions/setup-taskfile@master
```

If you want to pin a major or minor version you can use the `.x` wildcard:

```yaml
- name: Install Taskfile
  uses: Arduino/actions/setup-taskfile@master
  with:
    version: '2.x'
```

To pin the exact version:

```yaml
- name: Install Taskfile
  uses: Arduino/actions/setup-taskfile@master
  with:
    version: '2.6.1'
```

## Development

To work on the codebase you have to install all the dependencies:

```sh
# npm install
```

To run the tests:

```sh
# npm run test
```

## Enable verbose logging for a pipeline
Additional log events with the prefix ::debug:: can be enabled by setting the secret `ACTIONS_STEP_DEBUG` to `true`.

See [step-debug-logs](https://github.com/actions/toolkit/blob/master/docs/action-debugging.md#step-debug-logs) for reference.

## Release

We check in the `node_modules` to provide runtime dependencies to the system
using the Action, so be careful not to `git add` all the development dependencies
you might have under your local `node_modules`. To release a new version of the
Action the workflow should be the following:

1. `npm install` to add all the dependencies, included development.
1. `npm run test` to see everything works as expected.
1. `npm run build` to build the Action under the `./lib` folder.
1. `rm -rf node_modules` to remove all the dependencies.
1. `npm install --production` to add back **only** the runtime dependencies.
1. `git add lib node_modules` to check in the code that matters.
1. open a PR and request a review.
