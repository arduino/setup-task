// Copyright (c) 2019 ARDUINO SA
//
// The software is released under the GNU General Public License, which covers the main body
// of the arduino/setup-task code. The terms of this license can be found at:
// https://www.gnu.org/licenses/gpl-3.0.en.html
//
// You can be released from the requirements of the above licenses by purchasing
// a commercial license. Buying such a license is mandatory if you want to modify or
// otherwise use the software for commercial activities involving the Arduino
// software without disclosing the source code of your own applications. To purchase
// a commercial license, send an email to license@arduino.cc

import path = require("path");
import os = require("os");
import fs = require("fs");
import io = require("@actions/io");
import nock = require("nock");

const toolDir = path.join(__dirname, "runner", "tools");
const tempDir = path.join(__dirname, "runner", "temp");
const dataDir = path.join(__dirname, "testdata");
const IS_WINDOWS = process.platform === "win32";

process.env.RUNNER_TEMP = tempDir;
process.env.RUNNER_TOOL_CACHE = toolDir;
import * as installer from "../src/installer"; // eslint-disable-line import/first

describe("installer tests", () => {
  beforeEach(async () => {
    await io.rmRF(toolDir);
    await io.rmRF(tempDir);
    await io.mkdirP(toolDir);
    await io.mkdirP(tempDir);
  });

  afterAll(async () => {
    try {
      await io.rmRF(toolDir);
      await io.rmRF(tempDir);
    } catch {
      console.log("Failed to remove test directories");
    }
  });

  it("Downloads version of Task if no matching version is installed", async () => {
    await installer.getTask("3.37.1", "");
    const taskDir = path.join(toolDir, "task", "3.37.1", os.arch());

    expect(fs.existsSync(`${taskDir}.complete`)).toBe(true);

    if (IS_WINDOWS) {
      expect(fs.existsSync(path.join(taskDir, "bin", "task.exe"))).toBe(true);
    } else {
      expect(fs.existsSync(path.join(taskDir, "bin", "task"))).toBe(true);
    }
  }, 100000);

  describe("Gets the latest release of Task", () => {
    beforeEach(() => {
      nock("https://api.github.com")
        .get("/repos/go-task/task/releases?per_page=100")
        .replyWithFile(200, path.join(dataDir, "releases.json"));
    });

    afterEach(() => {
      nock.cleanAll();
      nock.enableNetConnect();
    });

    it("Gets the latest version of Task 3.36 using 3.36 and no matching version is installed", async () => {
      await installer.getTask("3.36", "");
      const taskDir = path.join(toolDir, "task", "3.36.0", os.arch());

      expect(fs.existsSync(`${taskDir}.complete`)).toBe(true);
      if (IS_WINDOWS) {
        expect(fs.existsSync(path.join(taskDir, "bin", "task.exe"))).toBe(true);
      } else {
        expect(fs.existsSync(path.join(taskDir, "bin", "task"))).toBe(true);
      }
    });

    it("Gets latest version of Task using 3.x and no matching version is installed", async () => {
      await installer.getTask("3.x", "");
      const taskdir = path.join(toolDir, "task", "3.43.2", os.arch());

      expect(fs.existsSync(`${taskdir}.complete`)).toBe(true);
      if (IS_WINDOWS) {
        expect(fs.existsSync(path.join(taskdir, "bin", "task.exe"))).toBe(true);
      } else {
        expect(fs.existsSync(path.join(taskdir, "bin", "task"))).toBe(true);
      }
    });

    it("Skips version computing when a valid semver is provided", async () => {
      await installer.getTask("3.37.0", "");
      const taskdir = path.join(toolDir, "task", "3.37.0", os.arch());

      expect(fs.existsSync(`${taskdir}.complete`)).toBe(true);
      if (IS_WINDOWS) {
        expect(fs.existsSync(path.join(taskdir, "bin", "task.exe"))).toBe(true);
      } else {
        expect(fs.existsSync(path.join(taskdir, "bin", "task"))).toBe(true);
      }
    });
  });
});
