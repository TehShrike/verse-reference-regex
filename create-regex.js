const flatmap = require('flatmap')
const {
    sequence,
    either,
    capture,
    greedy,
    flags,
} = require('compose-regexp')

function optional(...args) {
    return greedy('?', ...args)
}

const books = require('./books')

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
	const colonVerse = sequence(':', numberAndOptionalLetter)
	const chapterAndVerse = sequence(number, requireVerse ? colonVerse : optional(colonVerse))

	const range = sequence(chapterAndVerse, optional('-', either(/([a-z])/, /(\d+)([a-z])/, chapterAndVerse, numberAndOptionalLetter)))

	return flags(regexFlags,
		sequence(
			capture(either(...bookNames, ...abbreviations)),
			' ',
			range
		)
	)
}

