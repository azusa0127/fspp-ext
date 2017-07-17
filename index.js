/**
 * fspp-ext - fspp with extended features.
 *
 * @version 1.2.0
 * @author Phoenix Song (github.com/azusa0127)
 */

/**
 * ============================================================================
 * Requires.
 * ============================================================================
 */
const fspp = require(`fspp`);
const path = require(`path`);
const { deprecate } = require(`util`);
/**
 * ============================================================================
 * Library.
 * ============================================================================
 */
const fsppext = Object.assign({}, fspp, {
  /**
   * Ensure dirPath is a directory, create the dirPath recursively if not exist.
   *
   * @param {string} dirPath target directory path.
   * @param {bool} force delete dirPath or any inmediate path if that is a file not a directory.
   *
   * @exception {Promise.reject<Error>} if any part of the path is an file when force=false.
   * @exception {Promise.reject<Error>} if the process has no access or permission.
   */
  async ensureDir(dirPath, force = false) {
    const subEnsureCall = async subDir => {
      if (await fspp.exists(subDir)) {
        if ((await fspp.lstat(subDir)).isDirectory()) return;
        else if (force) await fspp.unlink(subDir);
        else throw new Error(`An file ${subDir} already exists.`);
      }
      const { root, dir } = path.parse(subDir);
      if (process.platform === `win32`) await fspp.access(root);
      await subEnsureCall(dir);
      await fspp.mkdir(subDir);
    };
    return await subEnsureCall(path.resolve(dirPath));
  },

  /**
   * Sync version of ensureDir(2).
   *
   * @param {string} dirPath target directory path.
   * @param {bool} force delete dirPath or any inmediate path if that is a file not a directory.
   *
   * @exception {Error} if any part of the path is an file when force=false.
   * @exception {Error} if the process has no access or permission.
   */
  ensureDirSync(dirPath, force = false) {
    const subEnsureSyncCall = subDir => {
      if (fspp.existsSync(subDir)) {
        if (fspp.lstatSync(subDir).isDirectory()) return;
        else if (force) fspp.unlinkSync(subDir);
        else throw new Error(`An file ${subDir} already exists.`);
      }
      const { root, dir } = path.parse(subDir);
      if (process.platform === `win32`) fspp.accessSync(root);
      subEnsureSyncCall(dir);
      fspp.mkdirSync(subDir);
    };
    return subEnsureSyncCall(path.resolve(dirPath));
  },

  /**
   * Create the Path tree if not exist.
   *
   * @param {string} dirPath target directory path.
   */
  ensurePath: deprecate(async dirPath => {
    const subEnsureCall = async subDir => {
      try {
        await fspp.access(subDir);
      } catch (_ignored) {
        const pathObj = path.parse(subDir);
        if (process.platform === `win32`) await fspp.access(pathObj.root, fspp.R_OK | fspp.W_OK);
        await subEnsureCall(pathObj.dir);
        await fspp.access(pathObj.dir, fspp.R_OK | fspp.W_OK);
        await fspp.mkdir(subDir);
      }
    };
    await subEnsureCall(path.isAbsolute(dirPath) ? path.normalize(dirPath) : path.resolve(dirPath));
  }, `ensurePath() is now deprecated due to ambigious behaviour with files in path, please use ensureDir() instead from fspp-ext ^1.2.0 on, this API will be removed by fspp-ext 2.0.0.`),

  /**
   * Sync version of ensurePath(1).
   *
   * @param {string} dirPath target directory path.
   */
  ensurePathSync: deprecate(dirPath => {
    const subEnsureSyncCall = subDir => {
      try {
        fspp.accessSync(subDir);
      } catch (_ignored) {
        const pathObj = path.parse(subDir);
        if (process.platform === `win32`) fspp.accessSync(pathObj.root, fspp.R_OK | fspp.W_OK);
        subEnsureSyncCall(pathObj.dir);
        fspp.accessSync(pathObj.dir, fspp.R_OK | fspp.W_OK);
        fspp.mkdirSync(subDir);
      }
    };
    subEnsureSyncCall(path.isAbsolute(dirPath) ? path.normalize(dirPath) : path.resolve(dirPath));
  }, `ensurePathSync() is now deprecated due to ambigious behaviour with files in path, please use ensureDirSync() instead from fspp-ext ^1.2.0 on, this API will be removed by fspp-ext 2.0.0.`),

  /**
   * Remove the target dir/file recursively.
   *
   * @param {string} dirPath path to be destroyed.
   * @param {bool} [force=false] Do not prompt when dirPath does not exist and automatically accuires permissions for readonly file/folders.
   *
   * @exception {Promise.reject<Error>} When dirPath is a root path, or non-exist.
   *                    Failing in remove any of the subfiles will also trigger exception.
   */
  async rm(dirPath, force = false) {
    const subDestroyCall = async subPath => {
      // const dstat = await fspp.lstat(subPath);
      try {
        const dstat = fspp.lstatSync(subPath);
        if (dstat.isFile() || dstat.isSymbolicLink()) {
          await fspp.unlink(subPath);
        } else if (dstat.isDirectory()) {
          if (force) await fspp.chmod(subPath, 0o777);
          const subfiles = await fspp.readdir(subPath);
          await Promise.all(subfiles.map(x => subDestroyCall(path.join(subPath, x))));
          await fspp.rmdir(subPath);
        }
      } catch (error) {
        if (!force) throw error;
        switch (error.name) {
          case `EACCES`:
            const parent = path.dirname(subPath),
              originalMode = await fspp.lstat(parent).mode;
            await fspp.chmod(parent, 0o777);
            await subDestroyCall(subPath);
            await fspp.chmod(parent, originalMode);
          case `ENOENT`:
            return;
          default:
            throw error;
        }
      }
    };
    const fmtdPath = path.resolve(dirPath);
    if (path.parse(fmtdPath).root === fmtdPath)
      throw new Error(`Destroying the FileSystem root ${fmtdPath} is forbidden!`);
    await subDestroyCall(fmtdPath);
  },

  /**
   * Sync version of rm(dirPath [, force]).
   *
   * @param {string} dirPath path to be destroyed.
   * @param {bool} [force=false] Do not prompt when dirPath does not exist and automatically accuires permissions for readonly folders.
   *
   * @exception {Error} When dirPath is a root path, or non-exist.
   *                    Failing in remove any of the subfiles will also trigger the error.
   */
  rmSync(dirPath, force = false) {
    const subDestroyCallSync = subPath => {
      try {
        const dstat = fspp.lstatSync(subPath);
        if (dstat.isFile() || dstat.isSymbolicLink()) {
          fspp.unlinkSync(subPath);
        } else if (dstat.isDirectory()) {
          if (force) fspp.chmodSync(subPath, 0o777);
          const subfiles = fspp.readdirSync(subPath);
          subfiles.forEach(x => subDestroyCallSync(path.join(subPath, x)));
          fspp.rmdirSync(subPath);
        }
      } catch (error) {
        if (!force) throw error;
        switch (error.name) {
          case `EACCES`:
            const parent = path.dirname(subPath),
              originalMode = fspp.statSync(parent).mode;
            fspp.chmodSync(parent, 0o777);
            subDestroyCallSync(subPath);
            fspp.chmodSync(parent, originalMode);
          case `ENOENT`:
            return;
          default:
            throw error;
        }
      }
    };
    const fmtdPath = path.isAbsolute(dirPath) ? path.normalize(dirPath) : path.resolve(dirPath);
    if (path.parse(fmtdPath).root === fmtdPath)
      throw new Error(`Destroying the FileSystem root ${fmtdPath} is forbidden!`);
    return subDestroyCallSync(fmtdPath);
  },

  /**
   * Copy dir/file recursively
   *
   * @param {string} srcPath source path.
   * @param {string} desPath destination path.
   * @param {bool} [force=false] force overriding existing target file.
   *
   * @exception {Promise.reject<Error>} If srcPath does not exist or desPath is a sub-directory of srcPath.
   */
  async cp(srcPath, desPath, force = false) {
    const filecopy = async (src, des) =>
      new Promise((resolve, reject) => {
        const srcStream = fspp.createReadStream(src);
        srcStream.on(`error`, err => reject(err));
        const desStream = fspp.createWriteStream(des);
        desStream.on(`error`, err => reject(err));
        srcStream.pipe(desStream).on(`close`, () => resolve(des));
      });

    const subCopyCall = async (subSrcPath, subDesPath) => {
      await fspp.access(subSrcPath);
      await fsppext.ensureDir(path.dirname(subDesPath));
      if (await fspp.exists(subDesPath)) {
        if (force) await fsppext.rm(subDesPath);
        else throw new Error(`${subDesPath} already exists!`);
      }
      const sstat = await fspp.lstat(subSrcPath);
      if (sstat.isSymbolicLink()) {
        const target = await fspp.readlink(subSrcPath);
        fspp.symlink(target, subDesPath, sstat.isDirectory() ? `dir` : `file`);
      } else if (sstat.isFile()) {
        await filecopy(subSrcPath, subDesPath);
      } else if (sstat.isDirectory()) {
        await fsppext.ensureDir(subDesPath);
        const subfiles = await fspp.readdir(subSrcPath);
        await Promise.all(
          subfiles.map(x => subCopyCall(path.join(subSrcPath, x), path.join(subDesPath, x))),
        );
      }
    };
    const fmtdSrc = path.isAbsolute(srcPath) ? path.normalize(srcPath) : path.resolve(srcPath);
    let fmtdDes = path.isAbsolute(desPath) ? path.normalize(desPath) : path.resolve(desPath);
    if (fmtdDes.startsWith(fmtdSrc)) throw new Error(`${fmtdDes} is a sub-dirctory of ${fmtdSrc}!`);
    try {
      const dstat = await fspp.lstat(fmtdDes);
      if (dstat.isDirectory() && path.basename(fmtdSrc) !== path.basename(fmtdDes))
        fmtdDes = path.join(fmtdDes, path.basename(fmtdSrc));
    } catch (_ignored) {
      // Do nothing.
    }
    return subCopyCall(fmtdSrc, fmtdDes);
  },
});

/**
 * ============================================================================
 * Exports.
 * ============================================================================
 */
module.exports = fsppext;
