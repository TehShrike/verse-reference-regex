const canonBooks = require('books-of-the-bible')

const mapOfAliasesToCanonBookNames = makeMapOfAliases(canonBooks)

const valueOr = (value, defaultValue) => value === undefined
	? evaluate(defaultValue)
	: value
const ifelse = (predicate, truthyCase, falsyCase) => evaluate(predicate)
	? evaluate(truthyCase)
	: evaluate(falsyCase)

const valueOrNull = value => valueOr(value, null)
const evaluate = value => typeof value === 'function' ? value() : value
const int = value => value === null ? value : parseInt(value, 10)
const stripPeriod = str => str[str.length - 1] === '.' ? str.substr(0, str.length - 1) : str
const isSection = str => /[a-z]/.test(str)


module.exports = extractRangeFromMatch

function extractRangeFromMatch(match, books) {
	const mapOfAliasesToBookNames = books ? makeMapOfAliases(books) : mapOfAliasesToCanonBookNames
	const [ , matchBook, matchStartChapter, matchStartVerse, matchStartSection, ...matchTail ] = match
	const rangeEndValues = matchTail.filter(value => value !== undefined)

	const start = {
		chapter: int(valueOrNull(matchStartChapter)),
		verse: int(valueOrNull(matchStartVerse)),
		section: valueOrNull(matchStartSection),
	}

	const end = ifelse(rangeEndValues.length === 3, () => {
		const [ chapter, verse, section ] = rangeEndValues
		return {
			chapter: int(chapter),
			verse: int(verse),
			section: valueOrNull(section),
		}
	}, () => {
		const { numbers, section } = separateSectionFromNumbers(rangeEndValues)

		if (numbers.length === 2) {
			const [ chapter, verse ] = numbers
			return {
				chapter,
				verse,
				section,
			}
		} else if (numbers.length === 1) {
			const rangeIsChapter = start.verse === null

			return rangeIsChapter ? {
				chapter: numbers[0],
				verse: null,
				section,
			} : {
				chapter: start.chapter,
				verse: numbers[0],
				section,
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
		end,
	}
}

module.exports.chapterVerseRange = match => {
	const [ , ...rest ] = match
	const books = [{
		name: '',
		aliases: [],
	}]
	return Object.assign(
		extractRangeFromMatch([ null, '', ...rest ], books),
		{ book: null }
	)
}


function separateSectionFromNumbers(ary) {
	const lastValue = ary[ary.length - 1]

	if (ary.length > 0 && isSection(lastValue)) {
		return {
			numbers: ary.slice(0, ary.length - 1).map(int),
			section: lastValue,
		}
	} else {
		return {
			numbers: ary.map(int),
			section: null,
		}
	}
}

function makeMapOfAliases(books) {
	return books.reduce((map, book) => {
		map[book.name.toLowerCase()] = book
		book.aliases.forEach(alias => map[alias.toLowerCase()] = book)
		return map
	}, Object.create(null))
}
