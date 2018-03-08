const flatmap = require('flatmap')
const {
	either,
	capture,
	flags,
} = require('regex-fun')

const canonBooks = require('books-of-the-bible')

const chapterVerseRange = require('./create-chapter-verse-range-regex.js')

module.exports = function createRegex({
	requireVerse = false,
	flags: regexFlags = 'i',
	books = canonBooks,
} = {}) {
	const bookNames = books.map(({ name }) => name)
	const abbreviations = flatmap(books, ({ aliases }) => {
		return flatmap(aliases, alias => [ alias, alias + '.' ])
	})

	const range = chapterVerseRange({ requireVerse, flags: regexFlags })

	return flags(
		regexFlags,
		capture(either(...bookNames, ...abbreviations)),
		' ',
		range
	)
}

