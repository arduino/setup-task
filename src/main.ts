// Copyright (c) 2019 ARDUINO SA
//
// The software is released under the GNU General Public License, which covers the main body
// of the arduino/setup-taskfile code. The terms of this license can be found at:
// https://www.gnu.org/licenses/gpl-3.0.en.html
//
// You can be released from the requirements of the above licenses by purchasing
// a commercial license. Buying such a license is mandatory if you want to modify or
// otherwise use the software for commercial activities involving the Arduino
// software without disclosing the source code of your own applications. To purchase
// a commercial license, send an email to license@arduino.cc

import * as core from "@actions/core";
import * as installer from "./installer";

async function run() {
  try {
    let version = core.getInput("version");
    const repoToken = core.getInput("repo-token");
    if (!version) {
      version = "2.x";
    }

    if (version) {
      await installer.getTask(version, repoToken);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
