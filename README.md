# `arduino/setup-taskfile`

This action makes the `task` binary available to Workflows.

## Usage

To get the latest stable version of Task just add this step:

```yaml
- name: Install Taskfile
  uses: arduino/setup-taskfile@main
```

If you want to pin a major or minor version you can use the `.x` wildcard:

```yaml
- name: Install Taskfile
  uses: arduino/setup-taskfile@main
  with:
    version: '2.x'
```

To pin the exact version:

```yaml
- name: Install Taskfile
  uses: arduino/setup-taskfile@main
  with:
    version: '2.6.1'
```

## Security

If you think you found a vulnerability or other security-related bug in this project, please read our
[security policy](https://github.com/arduino/setup-taskfile/security/policy) and report the bug to our Security Team 🛡️
Thank you!

e-mail contact: security@arduino.cc

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

To release a new version of the Action the workflow should be the following:

1. `npm install` to install the dependencies.
1. `npm run test` to see everything works as expected.
1. `npm run build` to build the Action under the `./lib` folder.
1. `npm run pack` to package for distribution
1. `git add src dist` to check in the code that matters.
1. open a PR and request a review.
