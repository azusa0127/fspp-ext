/**
 * fspp-ext - fspp with extended features.
 *
 * @version 1.0.7
 * @author Phoenix Song (github.com/azusa0127)
 */
const fs = require( `fspp` );
const path = require( `path` );
/**
 * Create the Path tree if not exist.
 *
 * @param {string} dirPath target directory path.
 */
const ensurePath = async dirPath => {
  dirPath = path.isAbsolute( dirPath ) ? path.normalize(dirPath) : path.resolve( dirPath );
  try {
    await fs.access( dirPath );
  } catch ( error ) {
    const pathObj = path.parse( dirPath );
    if ( process.platform === `win32` ) await fs.access( pathObj.root, fs.R_OK | fs.W_OK );
    await ensurePath( pathObj.dir );
    await fs.access( pathObj.dir, fs.R_OK | fs.W_OK );
    await fs.mkdir( dirPath );
  }
};
/**
 * Sync version of ensurePath(1)
 *
 * @param {string} dirPath target directory path.
 */
const ensurePathSync = dirPath => {
  dirPath = path.isAbsolute( dirPath ) ? path.normalize(dirPath) : path.resolve( dirPath );
  try {
    fs.accessSync( dirPath );
  } catch ( error ) {
    const pathObj = path.parse( dirPath );
    if ( process.platform === `win32` ) fs.accessSync( pathObj.root, fs.R_OK | fs.W_OK );
    ensurePathSync( pathObj.dir );
    fs.accessSync( pathObj.dir, fs.R_OK | fs.W_OK );
    fs.mkdirSync( dirPath );
  }
};
/**
 * Recursion Helper for rm(1)
 *
 * @param {string} subPath
 */
const subDestroyCall = async subPath => {
  await fs.access( subPath );
  const dstat = await fs.lstat( subPath );
  if ( dstat.isFile() || dstat.isSymbolicLink()) { await fs.unlink( subPath ); } else if ( dstat.isDirectory() ) {
    const subfiles = await fs.readdir( subPath );
    await Promise.all( subfiles.map( x => subDestroyCall( path.join( subPath, x ) ) ) );
    await fs.rmdir( subPath );
  }
};
/**
 * Remove the target dir/file recursively.
 *
 * @param {string} dirPath path to be destroyed.
 *
 * @exception {Promise.reject<Error>} When dirPath is a root path, or non-exist.
 *                    Failing in remove any of the subfiles will also trigger exception.
 */
const rm = async dirPath => {
  dirPath = path.isAbsolute( dirPath ) ? path.normalize(dirPath) : path.resolve( dirPath );
  if ( path.parse( dirPath ).root === dirPath )
    throw new Error( `Destroying the FileSystem root ${dirPath} is forbidden!` );
  return subDestroyCall( dirPath );
};
/**
 *  Recursion Helper for rmSync(1)
 *
 * @param {string} subPath
 */
const subDestroyCallSync = subPath => {
  fs.accessSync( subPath );
  const dstat = fs.lstatSync( subPath );
  if ( dstat.isFile() || dstat.isSymbolicLink() ) { fs.unlinkSync( subPath ); } else if ( dstat.isDirectory() ) {
    const subfiles = fs.readdirSync( subPath );
    subfiles.forEach( x => subDestroyCallSync( path.join( subPath, x ) ) );
    fs.rmdirSync( subPath );
  }
};
/**
 * Sync version of rm(1).
 *
 * @param {string} dirPath path to be destroyed.
 *
 * @exception {Error} When dirPath is a root path, or non-exist.
 *                    Failing in remove any of the subfiles will also trigger the error.
 */
const rmSync = dirPath => {
  dirPath = path.isAbsolute( dirPath ) ? path.normalize(dirPath) : path.resolve( dirPath );
  if ( path.parse( dirPath ).root === dirPath )
    throw new Error( `Destroying the FileSystem root ${dirPath} is forbidden!` );
  return subDestroyCallSync( dirPath );
};
/**
 * Copy single file from src to des by stream
 *
 * @param {string} src sourcefile path
 * @param {string} des destination path
 */
const filecopy = async ( src, des ) =>
  new Promise(( resolve, reject ) => {
    const srcStream = fs.createReadStream( src );
    srcStream.on( `error`, err => reject( err ) );
    const desStream = fs.createWriteStream( des );
    desStream.on( `error`, err => reject( err ) );
    srcStream.pipe( desStream ).on( `close`, () => resolve( des ) );
  } );
/**
 * Recurse Helper for cp(3)
 *
 * @param {string} subSrcPath source path
 * @param {string} subDesPath destination path
 * @param {bool} force force overriding existing target file.
 */
const subCopyCall = async ( subSrcPath, subDesPath, force = false ) => {
  await fs.access( subSrcPath );
  await ensurePath( path.dirname( subDesPath ) );
  if ( !force && await fs.exists( subDesPath ) ) throw new Error( `${subDesPath} already exists!` );
  const sstat = await fs.lstat( subSrcPath );
  if ( sstat.isFile() || sstat.isSymbolicLink() ) {
    if ( await fs.exists( subDesPath ) ) await rm( subDesPath );
    await filecopy( subSrcPath, subDesPath );
  } else if ( sstat.isDirectory() ) {
    await ensurePath( subDesPath );
    if ( !( await fs.lstat( subDesPath ) ).isDirectory() ) await rm( subDesPath );
    const subfiles = await fs.readdir( subSrcPath );
    await Promise.all( subfiles.map( x => subCopyCall( path.join( subSrcPath, x ), path.join( subDesPath, x ) ) ) );
  }
};
/**
 * Copy dir/file recursively
 *
 * @param {string} srcPath source path.
 * @param {string} desPath destination path.
 * @param {bool} force force overriding existing target file.
 *
 * @exception {Promise.reject<Error>} If srcPath does not exist or desPath is a sub-directory of srcPath.
 */
const cp = async ( srcPath, desPath, force = false ) => {
  srcPath = path.isAbsolute( srcPath ) ? path.normalize(srcPath) : path.resolve( srcPath );
  desPath = path.isAbsolute( desPath ) ? path.normalize(desPath) : path.resolve( desPath );
  if ( desPath.startsWith(srcPath) )
    throw new Error( `${desPath} is a sub-dirctory of ${srcPath}!` );
  try {
    const dstat = await fs.lstat( desPath );
    if ( dstat.isDirectory() && path.basename( srcPath ) !== path.basename( desPath ) )
      desPath = path.join( desPath, path.basename( srcPath ) );
  } catch ( e ) {
    // Do nothing.
  }
  return subCopyCall( srcPath, desPath, force );
};
// Exports
module.exports = Object.assign(fs, { ensurePath, ensurePathSync, rm, rmSync, cp });
