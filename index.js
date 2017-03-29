const flatmap = require('flatmap')
const {
    sequence,
    either,
    capture,
    ref,
    greedy,
    flags,
    avoid
} = require('compose-regexp')

const defaultBooks = require('./books')

module.exports = function createRegex({ requireVerse = false, flags: regexFlags = 'i', books = defaultBooks }) {
	const bookNames = books.map(({ name }) => name)
	const abbreviations = flatmap(books, ({ aliases }) => {
		return flatmap(aliases, alias => [ alias, alias + '.' ])
	})

	const number = /\d+/

	const reference = requireVerse ? sequence(number, ':', number) : number

	return flags(regexFlags,
		sequence(
			either(...bookNames, ...abbreviations),
			' ',
			reference
		)
	)
}

