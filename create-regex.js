const flatmap = require('flatmap')
const {
    combine,
    either,
    capture,
    optional,
    flags,
} = require('regex-fun')

const books = require('books-of-the-bible')

module.exports = function createRegex({
	requireVerse = false,
	flags: regexFlags = 'i',
} = {}) {
	const bookNames = books.map(({ name }) => name)
	const abbreviations = flatmap(books, ({ aliases }) => {
		return flatmap(aliases, alias => [ alias, alias + '.' ])
	})

	const number = /(\d+)/
	const numberAndOptionalLetter = /(\d+)([a-z])?/
	const colonVerse = combine(':', numberAndOptionalLetter)
	const chapterAndVerse = combine(number, requireVerse ? colonVerse : optional(colonVerse))

	const secondHalfOfRange = combine('-', either(/([a-z])/, /(\d+)([a-z])/, chapterAndVerse, numberAndOptionalLetter))
	const range = combine(chapterAndVerse, optional(secondHalfOfRange))

	return flags(
		combine(
			capture(either(...bookNames, ...abbreviations)),
			' ',
			range
		),
		regexFlags
	)
}

