import io = require("@actions/io");
import path = require("path");
import os = require("os");
import fs = require("fs");
import nock = require("nock");

const toolDir = path.join(__dirname, "runner", "tools");
const tempDir = path.join(__dirname, "runner", "temp");
const dataDir = path.join(__dirname, "testdata");
const IS_WINDOWS = process.platform === "win32";

process.env["RUNNER_TEMP"] = tempDir;
process.env["RUNNER_TOOL_CACHE"] = toolDir;
import * as installer from "../src/installer";

describe("installer tests", () => {
  beforeEach(async function() {
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
    await installer.getTask("2.6.0","");
    const taskDir = path.join(toolDir, "task", "2.6.0", os.arch());

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
        .get("/repos/go-task/task/git/refs/tags")
        .replyWithFile(200, path.join(dataDir, "tags.json"));
    });

    afterEach(() => {
      nock.cleanAll();
      nock.enableNetConnect();
    });

    it("Gets the latest version of Task 2.5 using 2.5 and no matching version is installed", async () => {
      await installer.getTask("2.5","");
      const taskDir = path.join(toolDir, "task", "2.5.2", os.arch());

      expect(fs.existsSync(`${taskDir}.complete`)).toBe(true);
      if (IS_WINDOWS) {
        expect(fs.existsSync(path.join(taskDir, "bin", "task.exe"))).toBe(true);
      } else {
        expect(fs.existsSync(path.join(taskDir, "bin", "task"))).toBe(true);
      }
    });

    it("Gets latest version of Task using 2.x and no matching version is installed", async () => {
      await installer.getTask("2.x","");
      const taskdir = path.join(toolDir, "task", "2.6.0", os.arch());

      expect(fs.existsSync(`${taskdir}.complete`)).toBe(true);
      if (IS_WINDOWS) {
        expect(fs.existsSync(path.join(taskdir, "bin", "task.exe"))).toBe(true);
      } else {
        expect(fs.existsSync(path.join(taskdir, "bin", "task"))).toBe(true);
      }
    });

    it("Gets preview version of Task using 3.x and no matching version is installed", async () => {
      await installer.getTask("3.x","");
      const taskdir = path.join(toolDir, "task", "3.0.0-preview1", os.arch());

      expect(fs.existsSync(`${taskdir}.complete`)).toBe(true);
      if (IS_WINDOWS) {
        expect(fs.existsSync(path.join(taskdir, "bin", "task.exe"))).toBe(true);
      } else {
        expect(fs.existsSync(path.join(taskdir, "bin", "task"))).toBe(true);
      }
    });
  });
});
