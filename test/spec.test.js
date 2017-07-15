/**
 * fspp-ext spec test - BDD unit test for fspp-ext.
 *
 * @version 1.2.x
 * @author Phoenix Song (github.com/azusa0127)
 */
const fs = require(`../index`);
const path = require(`path`);
const { assert } = require(`chai`);

const TEST_SANDBOX_ROOT = path.resolve(`test/sandbox`),
  NON_EXISTING_PATH = `Q:/I_DONT_EXIST`,
  FORBIDEN_PATH = process.platform === `win32` ? `C:/Windows/System32/0000` : `/dev/root`;

describe(`Prerequisite Test Functionaily.`, () => {
  const TEST_DEEP_DIRECTORY = path.join(TEST_SANDBOX_ROOT, `Level1/Level2/Level3`);

  it(`Should be able to creat multi-level directory for test.`, () => {
    assert.isFalse(
      fs.existsSync(TEST_DEEP_DIRECTORY),
      `The Deep Sandbox Directory ${TEST_DEEP_DIRECTORY} Should not exists pre-test.`,
    );
    fs.ensureDirSync(TEST_DEEP_DIRECTORY);
    assert.isTrue(
      fs.existsSync(TEST_DEEP_DIRECTORY),
      `The Deep Sandbox Directory ${TEST_DEEP_DIRECTORY} Should exists now.`,
    );
  });

  it(`Should be able to erase multi-level directory in test sandbox.`, () => {
    fs.ensureDirSync(TEST_DEEP_DIRECTORY);
    assert.isTrue(
      fs.existsSync(TEST_DEEP_DIRECTORY),
      `The Deep Sandbox Directory ${TEST_DEEP_DIRECTORY} Should exists pre test.`,
    );
    fs.rmSync(TEST_SANDBOX_ROOT);
    assert.isFalse(
      fs.existsSync(TEST_SANDBOX_ROOT),
      `The Sandbox Directory ${TEST_SANDBOX_ROOT} Should Earsed by now.`,
    );
  });
});

describe(`fspp-ext`, () => {
  before(() => {
    if (fs.existsSync(TEST_SANDBOX_ROOT)) fs.rmSync(TEST_SANDBOX_ROOT);
    fs.ensureDirSync(TEST_SANDBOX_ROOT);
  });

  afterEach(() => {
    if (fs.existsSync(TEST_SANDBOX_ROOT)) fs.rmSync(TEST_SANDBOX_ROOT);
  });

  describe(`ensureDir Spec`, () => {
    const TEST_LEVEL1_DIR = path.join(TEST_SANDBOX_ROOT, `Level1D`),
      TEST_LEVEL2_DIR = path.join(TEST_LEVEL1_DIR, `Level2D`);

    describe(`Async version.`, () => {
      beforeEach(() => {
        if (fs.existsSync(TEST_SANDBOX_ROOT)) fs.rmSync(TEST_SANDBOX_ROOT);
        fs.ensureDirSync(TEST_SANDBOX_ROOT);
      });

      it(`Should do nothing to existing dir.`, async () => {
        assert.isTrue(fs.existsSync(TEST_SANDBOX_ROOT), `Sandbox root should exist pre-test.`);
        assert.equal(
          fs.readdirSync(TEST_SANDBOX_ROOT).length,
          0,
          `Sandbox should be empty pre-test.`,
        );
        await fs.ensureDir(TEST_SANDBOX_ROOT);
        assert.isTrue(
          fs.existsSync(TEST_SANDBOX_ROOT),
          `Sandbox root should still exist post-test.`,
        );
        assert.equal(
          fs.readdirSync(TEST_SANDBOX_ROOT).length,
          0,
          `Sandbox should still be empty post-test.`,
        );
      });

      it(`Should be able to create Level 1 dummy dir`, async () => {
        assert.isFalse(
          fs.existsSync(TEST_LEVEL1_DIR),
          `${TEST_LEVEL1_DIR} should not exist pre-test.`,
        );
        await fs.ensureDir(TEST_LEVEL1_DIR);
        assert.isTrue(fs.existsSync(TEST_LEVEL1_DIR), `${TEST_LEVEL1_DIR} should exist post-test.`);
        assert.equal(
          fs.readdirSync(TEST_LEVEL1_DIR).length,
          0,
          `${TEST_LEVEL1_DIR} should be empty post-test.`,
        );
      });

      it(`Should be able to create Level 1 dummy dir with relative path`, async () => {
        assert.isFalse(
          fs.existsSync(TEST_LEVEL1_DIR),
          `${TEST_LEVEL1_DIR} should not exist pre-test.`,
        );
        await fs.ensureDir(path.resolve(TEST_LEVEL1_DIR));
        assert.isTrue(fs.existsSync(TEST_LEVEL1_DIR), `${TEST_LEVEL1_DIR} should exist post-test.`);
        assert.equal(
          fs.readdirSync(TEST_LEVEL1_DIR).length,
          0,
          `${TEST_LEVEL1_DIR} should be empty post-test.`,
        );
      });

      it(`Should be able to create Level 2 dummy dir`, async () => {
        assert.isFalse(
          fs.existsSync(TEST_LEVEL1_DIR),
          `${TEST_LEVEL1_DIR} should not exist pre-test.`,
        );
        await fs.ensureDir(TEST_LEVEL2_DIR);
        assert.isTrue(fs.existsSync(TEST_LEVEL2_DIR), `${TEST_LEVEL2_DIR} should exist post-test.`);
        assert.equal(
          fs.readdirSync(TEST_LEVEL2_DIR).length,
          0,
          `${TEST_LEVEL2_DIR} should be empty post-test.`,
        );
      });

      it(`Should be able to create Level 2 dummy dir with relative path`, async () => {
        assert.isFalse(
          fs.existsSync(TEST_LEVEL1_DIR),
          `TEST_LEVEL1_DIR should not exist pre-test.`,
        );
        await fs.ensureDir(path.resolve(TEST_LEVEL2_DIR));
        assert.isTrue(fs.existsSync(TEST_LEVEL2_DIR), `${TEST_LEVEL2_DIR} should exist post-test.`);
        assert.equal(
          fs.readdirSync(TEST_LEVEL2_DIR).length,
          0,
          `${TEST_LEVEL2_DIR} should be empty post-test.`,
        );
      });

      it(`Should fail with existing file as dirPath but sucess when force=true`, async () => {
        const TEST_TEXT_FILE = path.join(TEST_SANDBOX_ROOT, `TEST.txt`);
        fs.writeFileSync(TEST_TEXT_FILE, `This is about to be nothing.`, `utf8`);
        assert.isTrue(fs.existsSync(TEST_TEXT_FILE), `${TEST_TEXT_FILE} should exist pre-test.`);
        assert.equal(
          fs.readdirSync(TEST_SANDBOX_ROOT).length,
          1,
          `Sandbox should contain single element.`,
        );
        try {
          await fs.ensureDir(TEST_TEXT_FILE);
        } catch (error) {
          assert.isTrue(
            fs.statSync(TEST_TEXT_FILE).isFile(),
            `${TEST_TEXT_FILE} should still be a file post-test.`,
          );
          await fs.ensureDir(TEST_TEXT_FILE, true);
          assert.isTrue(
            fs.statSync(TEST_TEXT_FILE).isDirectory(),
            `${TEST_TEXT_FILE} should now be a directory post-test.`,
          );
          assert.equal(
            fs.readdirSync(TEST_SANDBOX_ROOT).length,
            1,
            `Sandbox should still contain single element post-test.`,
          );
          return;
        }
        assert.fail(null, null, `ensureDir should fail but succeeded.`);
      });

      it(`Should fail when an intermidiate path is an existing file but sucess when force=true`, async () => {
        assert.isFalse(
          fs.existsSync(TEST_LEVEL1_DIR),
          `${TEST_LEVEL1_DIR} should not exist pre-test.`,
        );
        fs.writeFileSync(TEST_LEVEL1_DIR, `Haha, I'm a file!`, `utf8`);
        assert.isTrue(
          fs.lstatSync(TEST_LEVEL1_DIR).isFile(),
          `${TEST_LEVEL1_DIR} should now be a file.`,
        );
        try {
          await fs.ensureDir(TEST_LEVEL2_DIR);
        } catch (error) {
          await fs.ensureDir(TEST_LEVEL2_DIR, true);
          assert.isTrue(
            fs.statSync(TEST_LEVEL2_DIR).isDirectory(),
            `${TEST_LEVEL2_DIR} directory should now exist.`,
          );
          return;
        }
        assert.fail(null, null, `ensureDir should fail but succeeded.`);
      });

      it(`Should fail with non-existing driver even with force=true`, async () => {
        if (process.platform === `win32`) {
          assert.isFalse(
            fs.existsSync(NON_EXISTING_PATH),
            `${NON_EXISTING_PATH} Should not exist.`,
          );
          try {
            await fs.ensureDir(NON_EXISTING_PATH, true);
          } catch (error) {
            return;
          }
          assert.fail(null, null, `ensureDir should fail but succeeded.`);
        }
      });

      it(`Should fail with forbiden path even with force=true`, async () => {
        try {
          await fs.ensureDir(FORBIDEN_PATH, true);
        } catch (error) {
          return;
        }
        assert.fail(null, null, `ensureDir should fail but succeeded.`);
      });
    });

    describe(`Sync version.`, () => {
      beforeEach(() => {
        if (fs.existsSync(TEST_SANDBOX_ROOT)) fs.rmSync(TEST_SANDBOX_ROOT);
        fs.ensureDirSync(TEST_SANDBOX_ROOT);
      });

      it(`Should do nothing to existing dir.`, () => {
        assert.isTrue(fs.existsSync(TEST_SANDBOX_ROOT), `Sandbox root should exist pre-test.`);
        assert.equal(
          fs.readdirSync(TEST_SANDBOX_ROOT).length,
          0,
          `Sandbox should be empty pre-test.`,
        );
        fs.ensureDirSync(TEST_SANDBOX_ROOT);
        assert.isTrue(
          fs.existsSync(TEST_SANDBOX_ROOT),
          `Sandbox root should still exist post-test.`,
        );
        assert.equal(
          fs.readdirSync(TEST_SANDBOX_ROOT).length,
          0,
          `Sandbox should still be empty post-test.`,
        );
      });

      it(`Should be able to create Level 1 dummy dir`, () => {
        assert.isFalse(
          fs.existsSync(TEST_LEVEL1_DIR),
          `TEST_LEVEL1_DIR should not exist pre-test.`,
        );
        fs.ensureDirSync(TEST_LEVEL1_DIR);
        assert.isTrue(fs.existsSync(TEST_LEVEL1_DIR), `TEST_LEVEL1_DIR should exist post-test.`);
        assert.equal(
          fs.readdirSync(TEST_LEVEL1_DIR).length,
          0,
          `TEST_LEVEL1_DIR should be empty post-test.`,
        );
      });

      it(`Should be able to create Level 1 dummy dir with relative path`, () => {
        assert.isFalse(
          fs.existsSync(TEST_LEVEL1_DIR),
          `TEST_LEVEL1_DIR should not exist pre-test.`,
        );
        fs.ensureDirSync(path.resolve(TEST_LEVEL1_DIR));
        assert.isTrue(fs.existsSync(TEST_LEVEL1_DIR), `TEST_LEVEL1_DIR should exist post-test.`);
        assert.equal(
          fs.readdirSync(TEST_LEVEL1_DIR).length,
          0,
          `TEST_LEVEL1_DIR should be empty post-test.`,
        );
      });

      it(`Should be able to create Level 2 dummy dir`, () => {
        assert.isFalse(
          fs.existsSync(TEST_LEVEL1_DIR),
          `TEST_LEVEL1_DIR should not exist pre-test.`,
        );
        fs.ensureDirSync(TEST_LEVEL2_DIR);
        assert.isTrue(fs.existsSync(TEST_LEVEL2_DIR), `TEST_LEVEL2_DIR should exist post-test.`);
        assert.equal(
          fs.readdirSync(TEST_LEVEL2_DIR).length,
          0,
          `TEST_LEVEL2_DIR should be empty post-test.`,
        );
      });

      it(`Should be able to create Level 2 dummy dir with relative path`, () => {
        assert.isFalse(
          fs.existsSync(TEST_LEVEL1_DIR),
          `TEST_LEVEL1_DIR should not exist pre-test.`,
        );
        fs.ensureDirSync(path.resolve(TEST_LEVEL2_DIR));
        assert.isTrue(fs.existsSync(TEST_LEVEL2_DIR), `TEST_LEVEL2_DIR should exist post-test.`);
        assert.equal(
          fs.readdirSync(TEST_LEVEL2_DIR).length,
          0,
          `TEST_LEVEL2_DIR should be empty post-test.`,
        );
      });

      it(`Should fail with existing file as dirPath but sucess when force=true`, () => {
        const TEST_TEXT_FILE = path.join(TEST_SANDBOX_ROOT, `TEST.txt`);
        fs.writeFileSync(TEST_TEXT_FILE, `This is about to be nothing.`, `utf8`);
        assert.isTrue(fs.existsSync(TEST_TEXT_FILE), `${TEST_TEXT_FILE} should exist pre-test.`);
        assert.equal(
          fs.readdirSync(TEST_SANDBOX_ROOT).length,
          1,
          `Sandbox should contain single element.`,
        );
        try {
          fs.ensureDirSync(TEST_TEXT_FILE);
        } catch (error) {
          assert.isTrue(
            fs.statSync(TEST_TEXT_FILE).isFile(),
            `${TEST_TEXT_FILE} should still be a file post-test.`,
          );
          fs.ensureDirSync(TEST_TEXT_FILE, true);
          assert.isTrue(
            fs.statSync(TEST_TEXT_FILE).isDirectory(),
            `${TEST_TEXT_FILE} should now be a directory post-test.`,
          );
          assert.equal(
            fs.readdirSync(TEST_SANDBOX_ROOT).length,
            1,
            `Sandbox should still contain single element post-test.`,
          );
          return;
        }
        assert.fail(null, null, `ensureDirSync should fail but succeeded.`);
      });

      it(`Should fail when an intermidiate path is an existing file but sucess when force=true`, () => {
        assert.isFalse(
          fs.existsSync(TEST_LEVEL1_DIR),
          `${TEST_LEVEL1_DIR} should not exist pre-test.`,
        );
        fs.writeFileSync(TEST_LEVEL1_DIR, `Haha, I'm a file!`, `utf8`);
        assert.isTrue(
          fs.lstatSync(TEST_LEVEL1_DIR).isFile(),
          `${TEST_LEVEL1_DIR} should now be a file.`,
        );
        try {
          fs.ensureDirSync(TEST_LEVEL2_DIR);
        } catch (error) {
          fs.ensureDirSync(TEST_LEVEL2_DIR, true);
          assert.isTrue(
            fs.statSync(TEST_LEVEL2_DIR).isDirectory(),
            `${TEST_LEVEL2_DIR} directory should now exist.`,
          );
          return;
        }
        assert.fail(null, null, `ensureDirSync should fail but succeeded.`);
      });

      it(`Should fail with non-existing driver even with force=true`, () => {
        if (process.platform === `win32`) {
          assert.isFalse(
            fs.existsSync(NON_EXISTING_PATH),
            `${NON_EXISTING_PATH} Should not exist.`,
          );
          try {
            fs.ensureDirSync(NON_EXISTING_PATH, true);
          } catch (error) {
            return;
          }
          assert.fail(null, null, `ensureDirSync should fail but succeeded.`);
        }
      });

      it(`Should fail with forbiden path even with force=true`, () => {
        try {
          fs.ensureDirSync(FORBIDEN_PATH, true);
        } catch (error) {
          return;
        }
        assert.fail(null, null, `ensureDirSync should fail but succeeded.`);
      });
    });
  });
});
