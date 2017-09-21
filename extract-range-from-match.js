const canonBooks = require('books-of-the-bible')

const mapOfAliasesToCanonBookNames = makeMapOfAliases(canonBooks)

module.exports = function extractRangeFromMatch(match, books) {
	const mapOfAliasesToBookNames = books ? makeMapOfAliases(books) : mapOfAliasesToCanonBookNames
	const [ , matchBook, matchStartChapter, matchStartVerse, matchStartSection, ...matchTail ] = match
	const rangeEndValues = matchTail.filter(value => value !== undefined)

	const start = {
		chapter: int(valueOrNull(matchStartChapter)),
		verse: int(valueOrNull(matchStartVerse)),
		section: valueOrNull(matchStartSection)
	}

	const end = ifelse(rangeEndValues.length === 3, () => {
		const [ chapter, verse, section ] = rangeEndValues
		return {
			chapter: int(chapter),
			verse: int(verse),
			section: valueOrNull(section)
		}
	}, () => {
		const { numbers, section } = separateSectionFromNumbers(rangeEndValues)

		if (numbers.length === 2) {
			const [ chapter, verse ] = numbers
			return {
				chapter,
				verse,
				section
			}
		} else if (numbers.length === 1) {
			const rangeIsChapter = start.verse === null

			return rangeIsChapter ? {
				chapter: numbers[0],
				verse: null,
				section
			} : {
				chapter: start.chapter,
				verse: numbers[0],
				section
			}
		} else {
			return {
				chapter: start.chapter,
				verse: start.verse,
				section: section || start.section,
			}
		}
	})

	return {
		book: mapOfAliasesToBookNames[stripPeriod(matchBook).toLowerCase()].name,
		start,
		end
	}
}

function valueOrNull(value) {
	return valueOr(value, null)
}

function valueOr(value, defaultValue) {
	return value === undefined ? evaluate(defaultValue) : value
}

function evaluate(value) {
	return typeof value === 'function' ? value() : value
}

function int(value) {
	return value === null ? value : parseInt(value, 10)
}

function stripPeriod(str) {
	return str[str.length - 1] === '.' ? str.substr(0, str.length - 1) : str
}

function ifelse(predicate, truthyCase, falsyCase) {
	return evaluate(predicate) ? evaluate(truthyCase) : evaluate(falsyCase)
}

function separateSectionFromNumbers(ary) {
	const lastValue = ary[ary.length - 1]

	if (ary.length > 0 && isSection(lastValue)) {
		return {
			numbers: ary.slice(0, ary.length - 1).map(int),
			section: lastValue
		}
	} else {
		return {
			numbers: ary.map(int),
			section: null
		}
	}
}

function isSection(str) {
	return /[a-z]/.test(str)
}

function makeMapOfAliases(books) {
	return books.reduce((map, book) => {
		map[book.name.toLowerCase()] = book
		book.aliases.forEach(alias => map[alias.toLowerCase()] = book)
		return map
	}, Object.create(null))
}
