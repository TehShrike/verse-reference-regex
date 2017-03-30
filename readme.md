# verse-reference-regex

Provides:

1. A regular expression that matches Bible verse references and ranges
2. A function that parses the captured groupings of that regular expression and returns it in a useful form

# API

## `createRegex({ requireVerse = false, flags = 'i' })`

`createRegex` takes in a map of options and returns a regular expression.

### Options

- `requireVerse`: if true, will only match references with a verse.  If false, will match references and ranges with chapter numbers only, like `Genesis 1` or `Gen. 2-3`.  Defaults to `false`.
- `flags`: flags to be used to create the [RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp).  If you want to use the regex to match more than one reference in a string, you'll probably want to pass in `'ig'`.  Defaults to `'i'`.

## `extractRangeFromMatch(match)`

Given a result array, like the ones returned by [`exec`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec) or [`match`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match), it will return an object that looks like this:

```json
{
	"book": "Genesis",
	"start": {
		"chapter": 2,
		"verse": null,
		"section": null
	},
	"end": {
		"chapter": 3,
		"verse": null,
		"section": null
	}
}
```

# Examples
<!-- js
const { createRegex, extractRangeFromMatch } = require('./')
-->

Setup for the examples:

```js
function rangeString(range) {
	const { start, end } = range
	return `${range.book} c${start.chapter}v${start.verse}s'${start.section}' to `
		+ `c${end.chapter}v${end.verse}s'${end.section}'`
}

const verseRequiringRegex = createRegex({ requireVerse: true })
```

Searching for ranges:

```js
const match = `I'm talking about Prov 30:2-3 yo`.match(verseRequiringRegex)

rangeString(extractRangeFromMatch(match)) // => `Proverbs c30v2s'null' to c30v3s'null'`

const match2 = `I'm not talking about Proverbs 30-31 at all, yo!`.match(verseRequiringRegex)

match2 // => null
```

A verse reference with no range:

```js
const match3 = `Psalm 119:120b - I am afraid of Your judgments`.match(verseRequiringRegex)

rangeString(extractRangeFromMatch(match3)) // => `Psalms c119v120s'b' to c119v120s'b'`
```

Matching verse sections identified by letters:

```js
const match4 = verseRequiringRegex.exec(`Proverbs 30:2a-b really speaks to me`)

rangeString(extractRangeFromMatch(match4)) // => `Proverbs c30v2s'a' to c30v2s'b'`
```

Matching ranges with only chapters, no verse numbers:

```js
const match5 = createRegex().exec(`Doesn't require a verse to find the range Prov. 30-31`)
const range = extractRangeFromMatch(match5)

range.book // => 'Proverbs'
range.start.chapter // => 30
range.start.verse // => null
range.end.chapter // => 31
```

Replacing verse references with arbitrary text:

```js
const replaced = `Tell me about Rev. 1:1-4a will you`.replace(verseRequiringRegex, (...args) => {
	const match = args.slice(0, args.length - 2)
	return rangeString(extractRangeFromMatch(match))
})
replaced // => `Tell me about Revelation c1v1s'null' to c1v4s'a' will you`
```

# Book names

Book aliases (including ones with trailing periods) will be matched and normalized.  You can find the list of normalized book names and their aliases in [books.js](./books.js).

# Other

If you find a verse range that you think should be matched but is not, add it to the list in [test.js](./test.js) and open a pull request.

Any changes to the book aliases will be published as minor/feature version bumps.

Licensed [WTFPL](http://wtfpl2.com).
