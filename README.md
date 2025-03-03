# hackernews-async-ts

[Hacker News](https://news.ycombinator.com/) showcase using typescript && egg

### Requirement

- Node.js 14.x (如果Node.js版本太高出现报错，可以尝试降低版本, 但是要 >= 12.13.0)
- Typescript 2.8+

## QuickStart

### Development

```bash
$ npm i
$ npm run dev
$ open http://localhost:7001/
```

Don't tsc compile at development mode, if you had run `tsc` then you need to `npm run clean` before `npm run dev`.

### Deploy

```bash
$ npm run tsc
$ npm start
```

### Npm Scripts

- Use `npm run lint` to check code style
- Use `npm test` to run unit test
- se `npm run clean` to clean compiled js at development mode once
