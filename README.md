# fspp-ext
fspp-extended - A minimal augumentation to fs module, with promise support.

## Why fspp-ext ?
- No other dependent (`fspp` is just a bare warapper for `fs` with `util.promisify` from NodeJS official.)
- Cross-platform consideration (paths are dealed delicately for both Windows/Unix systems)
- Minimal style (Single file implementation, readable code with easy adaptation.)
- Morden (Powered by ES7 `async/await` with `util.promisify`.)
- Reliable (Carefully tested with dedicate BDD Mocha tests)

## Requirement
NodeJS v8.0.0 and up, as `fspp` is using `util.promisify` added in v8.0.0;

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

#### ensurePath( dirPath )
* `dirPath` {string|Buffer} directory path to be created, can be either a relative path or absolute path.

Asynchronously create the `dirPath` directory and all the super directories missing.

Will do nothing if the `dirPath` is already existing, *even if `dirpath` is a file instead of a directory*.

##### *Example:*

```js
fs.ensurePath(`hello/world/and/again`)
  .then(()=> console.log(`${process.cwd()}/hello/world/and/again exists now.`))
  .catch(err => console.error(err))
});
// or
await fs.ensurePath(`hello/world/and/again`);
```

##### *Exception/Rejection Conditions:*
- When any of the super-directory is not writable by current process (e.g. `/dev/root`).
- When accessing a non-existing Driver on windows (e.g. `X:\X_DISK_DOES_NOT_EXIST`).

#### ensurePathSync( dirPath )
The synchronous version of `ensurePath(dirPath)`.

#### rm( dirPath )
* `dirPath` {string|Buffer} directory path to be destroyed, can be either a relative path or absolute path.

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
- When `dirPath` does not exist.
- When any of the item failed to be removed (due to permission or is activated or removed in progress).
#### rmSync( dirPath )
The synchronous version of `rm(dirPath)`.

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

## Lisense
Copyright (c) 2017 Phoenix Song

Licensed under MIT
