/**
 * fspp-ext-spectest - BDD unit test for fspp-ext.
 * (Deprecated)
 *
 * @version 1.1.x
 * @author Phoenix Song (github.com/azusa0127)
 */
const path = require(`path`);
const fs = require(`fspp`);
const { assert } = require(`chai`);
const { ensurePath, ensurePathSync, rm, rmSync, cp } = require(`../index.js`);

describe(`fsextend 1.0 Spec`, () => {
  const SANDBOX_DIR_RELATIVE = `test/sandbox`,
    SANDBOX_DIR_ABSOLUTE = path.resolve(SANDBOX_DIR_RELATIVE),
    LEVEL_1_DIR_TO_BE_CREATED = `${SANDBOX_DIR_RELATIVE}/DummyL1`,
    LEVEL_1_DIR_TO_BE_CREATED_ABSOLUTE = path.resolve(LEVEL_1_DIR_TO_BE_CREATED),
    LEVEL_2_DIR_TO_BE_CREATED = `${LEVEL_1_DIR_TO_BE_CREATED}/DummyL2`,
    LEVEL_2_DIR_TO_BE_CREATED_ABSOLUTE = path.resolve(LEVEL_2_DIR_TO_BE_CREATED),
    LEVEL_3_EMPTY_DIR = `${LEVEL_2_DIR_TO_BE_CREATED}/DummyL3`,
    LEVEL_3_EMPTY_DIR_ABSOLUTE = path.resolve(LEVEL_3_EMPTY_DIR),
    LEVEL_3_TEXT_FILE_ABSOLUTE = path.join(LEVEL_2_DIR_TO_BE_CREATED_ABSOLUTE, `sample.txt`),
    NON_EXISTING_PATH = `Q:/I_DONT_EXIST`,
    FORBIDEN_PATH = process.platform === `win32` ? `C:/Windows/System32/0000` : `/dev/root`;

  before(() => {
    if (!fs.existsSync(SANDBOX_DIR_ABSOLUTE)) fs.mkdirSync(SANDBOX_DIR_ABSOLUTE);
    if (fs.existsSync(LEVEL_3_TEXT_FILE_ABSOLUTE)) fs.unlinkSync(LEVEL_3_TEXT_FILE_ABSOLUTE);
    if (fs.existsSync(LEVEL_3_EMPTY_DIR_ABSOLUTE)) rmSync(LEVEL_3_EMPTY_DIR_ABSOLUTE);
  });

  after(() => {
    if (fs.existsSync(LEVEL_3_TEXT_FILE_ABSOLUTE)) fs.unlinkSync(LEVEL_3_TEXT_FILE_ABSOLUTE);
    if (fs.existsSync(LEVEL_3_EMPTY_DIR_ABSOLUTE)) rmSync(LEVEL_3_EMPTY_DIR_ABSOLUTE);
    if (fs.existsSync(LEVEL_2_DIR_TO_BE_CREATED_ABSOLUTE))
      rmSync(LEVEL_2_DIR_TO_BE_CREATED_ABSOLUTE);
    if (fs.existsSync(LEVEL_1_DIR_TO_BE_CREATED_ABSOLUTE))
      rmSync(LEVEL_1_DIR_TO_BE_CREATED_ABSOLUTE);
    if (fs.existsSync(SANDBOX_DIR_ABSOLUTE)) rmSync(SANDBOX_DIR_ABSOLUTE);
  });

  describe(`ensurePath Spec`, () => {
    beforeEach(() => {
      assert.isTrue(fs.existsSync(SANDBOX_DIR_ABSOLUTE), `Sandbox folder should be existing.`);
      if (fs.existsSync(LEVEL_2_DIR_TO_BE_CREATED_ABSOLUTE))
        rmSync(LEVEL_2_DIR_TO_BE_CREATED_ABSOLUTE);
      if (fs.existsSync(LEVEL_1_DIR_TO_BE_CREATED_ABSOLUTE))
        rmSync(LEVEL_1_DIR_TO_BE_CREATED_ABSOLUTE);
    });

    it(`Should do nothing to existing dir.`, async () => {
      await ensurePath(SANDBOX_DIR_ABSOLUTE);
      assert.isTrue(
        fs.existsSync(SANDBOX_DIR_ABSOLUTE),
        `Sandbox folder should still be existing.`,
      );
    });

    it(`Should be able to create Level 1 dummy dir`, async () => {
      assert.isFalse(
        fs.existsSync(LEVEL_1_DIR_TO_BE_CREATED_ABSOLUTE),
        `DummyL1 folder should not exist.`,
      );
      await ensurePath(LEVEL_1_DIR_TO_BE_CREATED_ABSOLUTE);
      assert.isTrue(
        fs.existsSync(LEVEL_1_DIR_TO_BE_CREATED_ABSOLUTE),
        `DummyL1 folder should exist now.`,
      );
    });

    it(`Should be able to create Level 1 dummy dir with relative path`, async () => {
      assert.isFalse(
        fs.existsSync(LEVEL_1_DIR_TO_BE_CREATED_ABSOLUTE),
        `DummyL1 folder should not exist.`,
      );
      await ensurePath(LEVEL_1_DIR_TO_BE_CREATED);
      assert.isTrue(
        fs.existsSync(LEVEL_1_DIR_TO_BE_CREATED_ABSOLUTE),
        `DummyL1 folder should exist now.`,
      );
    });

    it(`Should be able to create Level 2 dummy dir`, async () => {
      assert.isFalse(
        fs.existsSync(LEVEL_1_DIR_TO_BE_CREATED_ABSOLUTE),
        `DummyL1 folder should not exist.`,
      );
      await ensurePath(LEVEL_2_DIR_TO_BE_CREATED_ABSOLUTE);
      assert.isTrue(
        fs.existsSync(LEVEL_2_DIR_TO_BE_CREATED_ABSOLUTE),
        `DummyL1/DummyL2 folder should exist now.`,
      );
    });

    it(`Should be able to create Level 2 dummy dir with relative path`, async () => {
      assert.isFalse(
        fs.existsSync(LEVEL_1_DIR_TO_BE_CREATED_ABSOLUTE),
        `DummyL1 folder should not exist.`,
      );
      await ensurePath(LEVEL_2_DIR_TO_BE_CREATED);
      assert.isTrue(
        fs.existsSync(LEVEL_2_DIR_TO_BE_CREATED_ABSOLUTE),
        `DummyL1/DummyL2 folder should exist now.`,
      );
    });

    it(`Should fail with non-existing driver`, async () => {
      if (process.platform === `win32`) {
        assert.isFalse(
          await fs.exists(NON_EXISTING_PATH),
          `${NON_EXISTING_PATH} Should not exist.`,
        );
        try {
          await ensurePath(NON_EXISTING_PATH);
        } catch (error) {
          return;
        }
        assert.fail(null, null, `ensurePath should fail but succeeded.`);
      }
    });

    it(`Should fail with forbiden path`, async () => {
      // await fs.access( path.dirname( FORBIDEN_PATH ), fs.R_OK | fs.W_OK ).then(() => { throw new Error( `${FORBIDEN_PATH} Should not be writable by current process.` ); }, () => null );
      try {
        await ensurePath(FORBIDEN_PATH);
      } catch (error) {
        return;
      }
      assert.fail(null, null, `ensurePath should fail but succeeded.`);
    });
  });

  describe(`ensurePathSync Spec`, () => {
    beforeEach(() => {
      assert.isTrue(fs.existsSync(SANDBOX_DIR_ABSOLUTE), `Sandbox folder should be existing.`);
      if (fs.existsSync(LEVEL_2_DIR_TO_BE_CREATED_ABSOLUTE))
        rmSync(LEVEL_2_DIR_TO_BE_CREATED_ABSOLUTE);
      if (fs.existsSync(LEVEL_1_DIR_TO_BE_CREATED_ABSOLUTE))
        rmSync(LEVEL_1_DIR_TO_BE_CREATED_ABSOLUTE);
    });

    it(`Should do nothing to existing dir.`, async () => {
      ensurePathSync(SANDBOX_DIR_ABSOLUTE);
      assert.isTrue(
        fs.existsSync(SANDBOX_DIR_ABSOLUTE),
        `Sandbox folder should still be existing.`,
      );
    });

    it(`Should be able to create Level 1 dummy dir`, async () => {
      assert.isFalse(
        fs.existsSync(LEVEL_1_DIR_TO_BE_CREATED_ABSOLUTE),
        `DummyL1 folder should not exist.`,
      );
      ensurePathSync(LEVEL_1_DIR_TO_BE_CREATED_ABSOLUTE);
      assert.isTrue(
        fs.existsSync(LEVEL_1_DIR_TO_BE_CREATED_ABSOLUTE),
        `DummyL1 folder should exist now.`,
      );
    });

    it(`Should be able to create Level 1 dummy dir with relative path`, async () => {
      assert.isFalse(
        fs.existsSync(LEVEL_1_DIR_TO_BE_CREATED_ABSOLUTE),
        `DummyL1 folder should not exist.`,
      );
      ensurePathSync(LEVEL_1_DIR_TO_BE_CREATED);
      assert.isTrue(
        fs.existsSync(LEVEL_1_DIR_TO_BE_CREATED_ABSOLUTE),
        `DummyL1 folder should exist now.`,
      );
    });

    it(`Should be able to create Level 2 dummy dir`, async () => {
      assert.isFalse(
        fs.existsSync(LEVEL_1_DIR_TO_BE_CREATED_ABSOLUTE),
        `DummyL1 folder should not exist.`,
      );
      ensurePathSync(LEVEL_2_DIR_TO_BE_CREATED_ABSOLUTE);
      assert.isTrue(
        fs.existsSync(LEVEL_2_DIR_TO_BE_CREATED_ABSOLUTE),
        `DummyL1/DummyL2 folder should exist now.`,
      );
    });

    it(`Should be able to create Level 2 dummy dir with relative path`, async () => {
      assert.isFalse(
        fs.existsSync(LEVEL_1_DIR_TO_BE_CREATED_ABSOLUTE),
        `DummyL1 folder should not exist.`,
      );
      ensurePathSync(LEVEL_2_DIR_TO_BE_CREATED);
      assert.isTrue(
        fs.existsSync(LEVEL_2_DIR_TO_BE_CREATED_ABSOLUTE),
        `DummyL1/DummyL2 folder should exist now.`,
      );
    });

    it(`Should fail with non-existing driver`, async () => {
      if (process.platform === `win32`) {
        assert.isFalse(
          await fs.exists(NON_EXISTING_PATH),
          `${NON_EXISTING_PATH} Should not exist.`,
        );
        try {
          ensurePathSync(NON_EXISTING_PATH);
        } catch (error) {
          return;
        }
        assert.fail(null, null, `ensurePath should fail but succeeded.`);
      }
    });

    it(`Should fail with forbiden path`, async () => {
      // await fs.access( path.dirname( FORBIDEN_PATH ), fs.R_OK | fs.W_OK ).then(() => { throw new Error( `${FORBIDEN_PATH} Should not be writable by current process.` ); }, () => null );
      try {
        ensurePathSync(FORBIDEN_PATH);
      } catch (error) {
        return;
      }
      assert.fail(null, null, `ensurePath should fail but succeeded.`);
    });
  });

  describe(`rm Spec`, () => {
    beforeEach(() => {
      assert.isTrue(fs.existsSync(SANDBOX_DIR_ABSOLUTE), `Sandbox folder should be existing.`);
      if (!fs.existsSync(LEVEL_1_DIR_TO_BE_CREATED_ABSOLUTE))
        fs.mkdirSync(LEVEL_1_DIR_TO_BE_CREATED_ABSOLUTE);
      if (!fs.existsSync(LEVEL_2_DIR_TO_BE_CREATED_ABSOLUTE))
        fs.mkdirSync(LEVEL_2_DIR_TO_BE_CREATED_ABSOLUTE);
      if (!fs.existsSync(LEVEL_3_TEXT_FILE_ABSOLUTE)) {
        fs.writeFileSync(
          LEVEL_3_TEXT_FILE_ABSOLUTE,
          `the quick brown fox jumped over the lazy dog.`,
        );
      }
      if (!fs.existsSync(LEVEL_3_EMPTY_DIR_ABSOLUTE)) fs.mkdirSync(LEVEL_3_EMPTY_DIR_ABSOLUTE);
    });

    it(`Should remove single file correctly`, async () => {
      assert.isTrue(
        fs.existsSync(LEVEL_3_TEXT_FILE_ABSOLUTE),
        `The sample text file should exist.`,
      );
      await rm(LEVEL_3_TEXT_FILE_ABSOLUTE);
      assert.isFalse(
        fs.existsSync(LEVEL_3_TEXT_FILE_ABSOLUTE),
        `The sample text file should be removed by now.`,
      );
    });

    it(`Should remove empty dir correctly`, async () => {
      assert.isTrue(fs.existsSync(LEVEL_3_EMPTY_DIR_ABSOLUTE), `The DummyL3 folder should exist.`);
      await rm(LEVEL_3_EMPTY_DIR_ABSOLUTE);
      assert.isFalse(
        fs.existsSync(LEVEL_3_EMPTY_DIR_ABSOLUTE),
        `The DummyL3 folder should be removed by now.`,
      );
    });

    it(`Should remove Non-Empty dir correctly`, async () => {
      assert.isTrue(fs.existsSync(LEVEL_3_EMPTY_DIR_ABSOLUTE), `The DummyL3 folder should exist.`);
      assert.isTrue(
        fs.existsSync(LEVEL_3_TEXT_FILE_ABSOLUTE),
        `The sample text file should exist.`,
      );
      await rm(LEVEL_1_DIR_TO_BE_CREATED_ABSOLUTE);
      assert.isFalse(
        fs.existsSync(LEVEL_1_DIR_TO_BE_CREATED_ABSOLUTE),
        `The DummyL1 folder should be removed by now.`,
      );
    });

    it(`Should remove Non-Empty dir correctly with relative path`, async () => {
      assert.isTrue(fs.existsSync(LEVEL_3_EMPTY_DIR_ABSOLUTE), `The DummyL3 folder should exist.`);
      assert.isTrue(
        fs.existsSync(LEVEL_3_TEXT_FILE_ABSOLUTE),
        `The sample text file should exist.`,
      );
      await rm(LEVEL_1_DIR_TO_BE_CREATED);
      assert.isFalse(
        fs.existsSync(LEVEL_1_DIR_TO_BE_CREATED_ABSOLUTE),
        `The DummyL1 folder should be removed by now.`,
      );
    });

    it(`Should fail with non-existing driver`, async () => {
      if (process.platform === `win32`) {
        assert.isFalse(fs.existsSync(NON_EXISTING_PATH), `${NON_EXISTING_PATH} Should not exist.`);
        try {
          await rm(NON_EXISTING_PATH);
        } catch (error) {
          return;
        }
        assert.fail(null, null, `rm should fail but succeeded.`);
      }
    });

    it(`Should fail with forbiden path`, async () => {
      // await fs.access( path.dirname( FORBIDEN_PATH ), fs.R_OK | fs.W_OK ).then(() => { throw new Error( `${FORBIDEN_PATH} Should not be writable by current process.` ); }, () => null );
      try {
        await rm(FORBIDEN_PATH);
      } catch (error) {
        return;
      }
      assert.fail(null, null, `rm should fail but succeeded.`);
    });
  });

  describe(`rmSync Spec`, () => {
    beforeEach(() => {
      assert.isTrue(fs.existsSync(SANDBOX_DIR_ABSOLUTE), `Sandbox folder should be existing.`);
      if (!fs.existsSync(LEVEL_1_DIR_TO_BE_CREATED_ABSOLUTE))
        fs.mkdirSync(LEVEL_1_DIR_TO_BE_CREATED_ABSOLUTE);
      if (!fs.existsSync(LEVEL_2_DIR_TO_BE_CREATED_ABSOLUTE))
        fs.mkdirSync(LEVEL_2_DIR_TO_BE_CREATED_ABSOLUTE);
      if (!fs.existsSync(LEVEL_3_TEXT_FILE_ABSOLUTE)) {
        fs.writeFileSync(
          LEVEL_3_TEXT_FILE_ABSOLUTE,
          `the quick brown fox jumped over the lazy dog.`,
        );
      }

      if (!fs.existsSync(LEVEL_3_EMPTY_DIR_ABSOLUTE)) fs.mkdirSync(LEVEL_3_EMPTY_DIR_ABSOLUTE);
    });

    it(`Should remove single file correctly`, () => {
      assert.isTrue(
        fs.existsSync(LEVEL_3_TEXT_FILE_ABSOLUTE),
        `The sample text file should exist.`,
      );
      rmSync(LEVEL_3_TEXT_FILE_ABSOLUTE);
      assert.isFalse(
        fs.existsSync(LEVEL_3_TEXT_FILE_ABSOLUTE),
        `The sample text file should be removed by now.`,
      );
    });

    it(`Should remove empty dir correctly`, () => {
      assert.isTrue(fs.existsSync(LEVEL_3_EMPTY_DIR_ABSOLUTE), `The DummyL3 folder should exist.`);
      rmSync(LEVEL_3_EMPTY_DIR_ABSOLUTE);
      assert.isFalse(
        fs.existsSync(LEVEL_3_EMPTY_DIR_ABSOLUTE),
        `The DummyL3 folder should be removed by now.`,
      );
    });

    it(`Should remove Non-Empty dir correctly`, () => {
      assert.isTrue(fs.existsSync(LEVEL_3_EMPTY_DIR_ABSOLUTE), `The DummyL3 folder should exist.`);
      assert.isTrue(
        fs.existsSync(LEVEL_3_TEXT_FILE_ABSOLUTE),
        `The sample text file should exist.`,
      );
      rmSync(LEVEL_1_DIR_TO_BE_CREATED_ABSOLUTE);
      assert.isFalse(
        fs.existsSync(LEVEL_1_DIR_TO_BE_CREATED_ABSOLUTE),
        `The DummyL1 folder should be removed by now.`,
      );
    });

    it(`Should remove Non-Empty dir correctly with relative path`, () => {
      assert.isTrue(fs.existsSync(LEVEL_3_EMPTY_DIR_ABSOLUTE), `The DummyL3 folder should exist.`);
      assert.isTrue(
        fs.existsSync(LEVEL_3_TEXT_FILE_ABSOLUTE),
        `The sample text file should exist.`,
      );
      rmSync(LEVEL_1_DIR_TO_BE_CREATED);
      assert.isFalse(
        fs.existsSync(LEVEL_1_DIR_TO_BE_CREATED_ABSOLUTE),
        `The DummyL1 folder should be removed by now.`,
      );
    });

    it(`Should fail with non-existing driver`, () => {
      if (process.platform === `win32`) {
        assert.isFalse(fs.existsSync(NON_EXISTING_PATH), `${NON_EXISTING_PATH} Should not exist.`);
        try {
          rmSync(NON_EXISTING_PATH);
        } catch (error) {
          return;
        }
        assert.fail(null, null, `rm should fail but succeeded.`);
      }
    });

    it(`Should fail with forbiden path`, () => {
      // await fs.access( path.dirname( FORBIDEN_PATH ), fs.R_OK | fs.W_OK ).then(() => { throw new Error( `${FORBIDEN_PATH} Should not be writable by current process.` ); }, () => null );
      try {
        rmSync(FORBIDEN_PATH);
      } catch (error) {
        return;
      }
      assert.fail(null, null, `rm should fail but succeeded.`);
    });
  });

  describe(`cp Spec`, () => {
    const SRC_FILE_A = `${LEVEL_1_DIR_TO_BE_CREATED}/textA.txt`,
      SRC_FILE_A_ABSOLUTE = path.resolve(SRC_FILE_A),
      SRC_FILE_B = `${LEVEL_2_DIR_TO_BE_CREATED}/textB.txt`,
      SRC_FILE_B_ABSOLUTE = path.resolve(SRC_FILE_B),
      DEST_DIR = `${LEVEL_3_EMPTY_DIR}`,
      DEST_FILE_A = `${DEST_DIR}/textA.txt`,
      // DEST_FILE_A_ABSOLUTE = path.resolve(DEST_FILE_A),
      DEST_FILE_B = `${DEST_DIR}/textB.txt`,
      // DEST_FILE_B_ABSOLUTE = path.resolve(DEST_FILE_B),
      DEST_DUMMYL1_DIR = `${SANDBOX_DIR_RELATIVE}/gummyL1`,
      DEST_DUMMYL1_DIR_ABSOLUTE = path.resolve(DEST_DUMMYL1_DIR),
      DEST_DUMMYL1_SUBDIR = `${LEVEL_2_DIR_TO_BE_CREATED}/DummyL1`;

    before(() => {
      ensurePathSync(LEVEL_2_DIR_TO_BE_CREATED_ABSOLUTE);
      fs.writeFileSync(SRC_FILE_A_ABSOLUTE, `I'm Alpha.`, `utf8`);
      fs.accessSync(SRC_FILE_A_ABSOLUTE);
      fs.writeFileSync(SRC_FILE_B_ABSOLUTE, `I'm not Beta.`, `utf8`);
      fs.accessSync(SRC_FILE_B_ABSOLUTE);
    });

    beforeEach(() => {
      if (fs.existsSync(DEST_DIR)) rmSync(DEST_DIR);
    });

    after(() => {
      if (fs.existsSync(LEVEL_1_DIR_TO_BE_CREATED_ABSOLUTE))
        rmSync(LEVEL_1_DIR_TO_BE_CREATED_ABSOLUTE);
      if (fs.existsSync(DEST_DUMMYL1_DIR_ABSOLUTE)) rmSync(DEST_DUMMYL1_DIR_ABSOLUTE);
    });

    it(`Should be able to copy Single file`, async () => {
      ensurePathSync(LEVEL_2_DIR_TO_BE_CREATED_ABSOLUTE);
      assert.isTrue(fs.existsSync(SRC_FILE_A_ABSOLUTE), `Source text file should exist.`);
      assert.isFalse(fs.existsSync(DEST_FILE_A));
      await cp(SRC_FILE_A, DEST_FILE_A);
      assert.isTrue(fs.existsSync(DEST_FILE_A));
      assert.equal(fs.readFileSync(SRC_FILE_A, `utf8`), fs.readFileSync(DEST_FILE_A, `utf8`));
    });

    it(`Should be able to copy Single file`, async () => {
      ensurePathSync(LEVEL_2_DIR_TO_BE_CREATED_ABSOLUTE);
      assert.isTrue(fs.existsSync(SRC_FILE_A_ABSOLUTE), `Source text file should exist.`);
      assert.isFalse(fs.existsSync(DEST_FILE_A), `Target text file should not exist.`);
      await cp(SRC_FILE_A, DEST_FILE_A);
      assert.isTrue(fs.existsSync(DEST_FILE_A), `Target text file should now exist.`);
      assert.equal(fs.readFileSync(SRC_FILE_A, `utf8`), fs.readFileSync(DEST_FILE_A, `utf8`));
    });

    it(`Should be able to copy Single file into a existing folder`, async () => {
      ensurePathSync(DEST_DIR);
      assert.isTrue(fs.existsSync(DEST_DIR), `Target Dir should exist.`);
      assert.isTrue(fs.existsSync(SRC_FILE_B_ABSOLUTE), `Source text file should exist.`);
      assert.isFalse(fs.existsSync(DEST_FILE_B), `Target text file should not exist.`);
      await cp(SRC_FILE_B, DEST_DIR, true);
      assert.isTrue(fs.existsSync(DEST_FILE_B), `Target text file should now exist.`);
      assert.equal(fs.readFileSync(SRC_FILE_B, `utf8`), fs.readFileSync(DEST_FILE_B, `utf8`));
    });

    it(`Should be able to copy entire folder`, async () => {
      assert.isTrue(fs.existsSync(SRC_FILE_B_ABSOLUTE), `Source text file should exist.`);
      assert.isFalse(fs.existsSync(DEST_DUMMYL1_DIR), `Target folder should not exist.`);
      await cp(LEVEL_1_DIR_TO_BE_CREATED, DEST_DUMMYL1_DIR);
      assert.isTrue(fs.existsSync(DEST_DUMMYL1_DIR), `Target text file should now exist.`);
      assert.equal(
        fs.readFileSync(path.join(DEST_DUMMYL1_DIR, `textA.txt`), `utf8`),
        fs.readFileSync(SRC_FILE_A_ABSOLUTE, `utf8`),
      );
      assert.equal(
        fs.readFileSync(path.join(DEST_DUMMYL1_DIR, `DummyL2`, `textB.txt`), `utf8`),
        fs.readFileSync(SRC_FILE_B_ABSOLUTE, `utf8`),
      );
    });

    it(`Should fail if copy entire folder to its subfolder`, async () => {
      assert.isTrue(fs.existsSync(SRC_FILE_B_ABSOLUTE), `Source text file should exist.`);
      assert.isFalse(fs.existsSync(DEST_DUMMYL1_SUBDIR), `Target folder should not exist.`);
      try {
        await cp(LEVEL_1_DIR_TO_BE_CREATED, DEST_DUMMYL1_SUBDIR);
      } catch (error) {
        return;
      }
      assert.fail(null, null, `cp should fail but succeeded.`);
    });
  });
});
