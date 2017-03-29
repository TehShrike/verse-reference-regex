const createRegex = require('../')
const test = require('tape')

const hasReferenceWithVerse = [
	`Revelation 13:3`,
	`Look it up on Genesis 3:55`,
	`Test the Romans 44:559 out`,
	`Low in \nthe philippians 366:4 he lay`,
	`An abbreviation is Ps 13:4 y'know`,
	`Another abbreviation is Ps. 44:8`,
]

const hasReferenceWithoutVerse = [
	`Revelation 13`,
	`Look it up on Genesis 3: book`,
	`Test the Romans 44 out`,
	`Low in \nthe philippians 366 he lay`,
	`An abbreviation is Ps 13 y'know`,
	`Another abbreviation is Ps. 44`,
]

const hasRangeWithVerse = [
]

const hasRangeWithoutVerse = [
]

const hasNoReference = [
	`Pumpkin pie`,
	`Test the Romans out`,
	`Low in \nthe philharmonic 366:4 he lay`,
	`An abbreviation is Ps y'know 44:8`,
]

const hasVerse = [ ...hasReferenceWithVerse, ...hasRangeWithVerse ]
const hasNoVerse = [ ...hasNoReference, ...hasReferenceWithoutVerse, ...hasRangeWithoutVerse ]
const hasAnyReferenceOrRange = [ ...hasReferenceWithVerse, ...hasReferenceWithoutVerse, ...hasRangeWithVerse, ...hasRangeWithoutVerse ]

const tests = [
	{ options: { requireVerse: true }, shouldMatch: hasVerse, shouldNotMatch: hasNoVerse },
	{ options: { requireVerse: false }, shouldMatch: hasAnyReferenceOrRange, shouldNotMatch: hasNoReference  },
]

tests.forEach(({ options, shouldMatch, shouldNotMatch }) => {
	test(`Testing options: ${JSON.stringify(options)}`, t => {
		const regex = createRegex(options)
		// console.log(regex.source, regex.toString())
		matches(t, true, regex, shouldMatch)
		matches(t, false, regex, shouldNotMatch)
		t.end()
	})
})

function matches(t, expected, regex, cases) {
	const expectation = expected ? 'Should' : 'Should not'
	cases.forEach(str => {
		t.equal(regex.test(str), expected, `${expectation} match ${str}`)
	})
}
