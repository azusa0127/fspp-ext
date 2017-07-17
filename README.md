# fspp-ext
fspp-extended - A minimal augumentation to fs module, with promise support.

## Why fspp-ext ?
- No other dependent (`fspp` is just a bare warapper for `fs` with `util.promisify` from NodeJS official).
- Cross-platform consideration (paths are dealed delicately for both Windows/Unix systems).
- Minimal style (Single file implementation, readable code with easy adaptation).
- Morden (Powered by ES7 `async/await` with `util.promisify`).
- Reliable (Carefully tested with dedicate BDD Mocha tests).

## Requirement
`NodeJS v8.0.0` and up, as `fspp` is using `util.promisify` added in v8.0.0;

## Install
```shell
npm install --save fspp-ext
```

## Usage
```javascript
const fs = require(`fspp-ext`); // fspp-ext is a drop-in replacement for fs or fspp.
```

## API
### Unique APIs

#### ensureDir( dirPath [, force] )
* `dirPath` {string|Buffer} directory path to be created, can be either a relative path or absolute path.
* `force` {bool} [*Optional*] if true, automatically remove existing file at `dirPath` with the same name (default: `false`).

Asynchronously create the `dirPath` directory and all the missing super directories.

Will do nothing if the `dirPath` is an existing *directory*.

##### *Example:*

```js
fs.ensureDir(`hello/world/and/again`)
  .then(()=> console.log(`${process.cwd()}/hello/world/and/again exists now.`))
  .catch(err => console.error(err))
});
// or
await fs.ensureDir(`hello/world/and/again`);
```

##### *Exception/Rejection Conditions:*
- When any of the super-directory is not writable by current process (e.g. `/dev/root`).
- When accessing a non-existing Driver on windows (e.g. `X:\X_DISK_DOES_NOT_EXIST`).
- When any part of `dirPath` is an existing file and `force`=false.

#### ensureDirSync( dirPath [, force] )
The synchronous version of `ensureDir(dirPath)`.

#### rm( dirPath [, force])
* `dirPath` {string|Buffer} directory path to be destroyed, can be either a relative path or absolute path.
* `force` {bool} [*Optional*] Do not prompt when dirPath does not exist and automatically accuires permissions for readonly folders (default:`false`).

Asynchronously remove `dirPath` file|directory and all of its sup-items recursively.

##### *Example:*

```js
fs.rm(`hello`)
  .then(()=> console.log(`${process.cwd()}/hello is now removed.`))
  .catch(err => console.error(err))
});
// or
await fs.rm(`/tmp/hello/world/and/again`);
```

##### *Exception/Rejection Conditions:*
- *When `dirPath` is the root directory (e.g. `/` or `D:/`), that's likely a typo.*
- When `dirPath` does not exist. (When `force`=false)
- When any of the item failed to be removed (due to permission or is activated or removed in progress).

#### rmSync( dirPath )
The synchronous version of `rm(dirPath [, force])`.

#### cp( srcPath, desPath [, force])
* `srcPath` {string|Buffer} path to the item to be copied.
* `desPath` {string|Buffer} path to the folder to be copied into.
* `force` {bool} [*Optional*] force overriding existing files. (default `false`)

Asynchronously copy everything from `srcPath` to `desPath` recursively.

*Note*: if `desPath` is an existing directory and `srcPath` is a directory with different name or a file, `srcPath` will be copied into a sub-item under `desPath` instead of been renamed into `desPath`.

##### *Example:*

```js
fs.rm(`hello`)
  .then(()=> console.log(`${process.cwd()}/hello is now removed.`))
  .catch(err => console.error(err))
});
// or
await fs.rm(`/tmp/hello/world/and/again`);
```

##### *Exception/Rejection Conditions:*
- *When `desPath` is a sub directory of `srcPath`.*
- When `srcPath` does not exist.
- When any of the item cannot be accessed (due to permission or is activated or removed in progress).

### Inherited fs/fspp APIs
Please check [`fspp`](https://github.com/azusa0127/fs-promisified-plus) and official document for [`fs`](https://nodejs.org/api/fs.html)

### Changelog
1.2.0 / 2017-07-15
  + (Added) new API ensureDir(dirPath[, force]) and ensureDirSync(dirPath[, force]).
  - (Deprecated)  ensurePath( dirPath ) and ensurePathSync( dirPath ) are now deprecated due to ambigious behaviour on existing files, please use ensureDir(dirPath[, force]) and ensureDirSync(dirPath[, force]) instead.
  + Revised rm(dirPath[, force]) and rmSync(dirPath[, force]) that now provides a force paramater flag for readonly folders and keep silent when dirPath not exist.
  * Revised and rewritten all the test cases, line coverage tools added.

1.1.0 / 2017-07-12
  * Simplefied implementation to match `fspp 1.1.0` update.

1.0.7 / 2017-07-11
  * Bug-fix for Symbolic-link handling.

1.0.6 / 2017-07-10
  * Updated `fspp` for missing `fs.write` and `fs.writeFile` inheritance.

## Lisense
Licensed under MIT
Copyright (c) 2017 Phoenix Song
