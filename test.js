const test = require('tape')
const { createRegex, extractRangeFromMatch } = require('./')

function r(book, start, end = null) {
	return {
		book,
		start,
		end: end === null ? start : {
			chapter: end.chapter === null ? start.chapter : end.chapter,
			verse: end.verse === null ? start.verse : end.verse,
			section: end.verse === null ? start.section : end.section,
		},
	}
}

function v(chapter, verse = null, section = null) {
	return {
		chapter,
		verse,
		section
	}
}

const hasReferenceWithVerse = [
	{ text: `Revelation 13:3`, range: r('Revelation', v(13, 3)) },
	{ text: `Look it up on Genesis 3:55`, range: r('Genesis', v(3, 55)) },
	{ text: `Test the Romans 44:559 out`, range: r('Romans', v(44, 559)) },
	{ text: `Low in \nthe philippians 366:4 he lay`, range: r('Philippians', v(366, 4)) },
	{ text: `An abbreviation is Ps 13:4 y'know`, range: r('Psalms', v(13, 4)) },
	{ text: `Another abbreviation is Ps. 44:8`, range: r('Psalms', v(44, 8)) },
	{ text: `Verse section: 1 sam 12:4b`, range: r('1 Samuel', v(12, 4, 'b')) },
]

const hasReferenceWithoutVerse = [
	{ text: `Revelation 13`, range: r('Revelation', v(13)) },
	{ text: `Look it up on Genesis 3: book`, range: r('Genesis', v(3)) },
	{ text: `Test the Romans 44 out`, range: r('Romans', v(44)) },
	{ text: `Low in \nthe philippians 366 he lay`, range: r('Philippians', v(366)) },
	{ text: `An abbreviation is Ps 13 y'know`, range: r('Psalms', v(13)) },
	{ text: `Another abbreviation is Ps. 44`, range: r('Psalms', v(44)) },
]

const hasRangeWithVerse = [
	{ text: `Revelation 13:3-14:4`, range: r('Revelation', v(13, 3), v(14, 4)) },
	{ text: `Look it up on Genesis 3:55-23:44`, range: r('Genesis', v(3, 55), v(23, 44)) },
	{ text: `Test the Romans 44:559-1:1 out`, range: r('Romans', v(44, 559), v(1, 1)) },
	{ text: `Low in \nthe philippians 366:4-12:12 he lay`, range: r('Philippians', v(366, 4), v(12, 12)) },
	{ text: `An abbreviation is Ps 13:4-19:19 y'know`, range: r('Psalms', v(13, 4), v(19, 19)) },
	{ text: `Another abbreviation is Ps. 44:8-3:3`, range: r('Psalms', v(44, 8), v(3, 3)) },
	{ text: `Verse section: 1 sam 12:4b-13:5a`, range: r('1 Samuel', v(12, 4, 'b'), v(13, 5, 'a')) },

	{ text: `Revelation 13:3-4`, range: r('Revelation', v(13, 3), v(13, 4)) },
	{ text: `Look it up on Genesis 3:55-44`, range: r('Genesis', v(3, 55), v(3, 44)) },
	{ text: `Test the Romans 44:559-1 out`, range: r('Romans', v(44, 559), v(44, 1)) },
	{ text: `Low in \nthe philippians 366:4-12 he lay`, range: r('Philippians', v(366, 4), v(366, 12)) },
	{ text: `An abbreviation is Ps 13:4-19 y'know`, range: r('Psalms', v(13, 4), v(13, 19)) },
	{ text: `Another abbreviation is Ps. 44:8-3`, range: r('Psalms', v(44, 8), v(44, 3)) },
	{ text: `Verse section: 1 sam 12:4b-5a`, range: r('1 Samuel', v(12, 4, 'b'), v(12, 5, 'a')) },

	{ text: `Verse section: 1 sam 12:4b-a`, range: r('1 Samuel', v(12, 4, 'b'), v(12, 4, 'a')) },
]

const hasRangeWithoutVerse = [
	{ text: `Revelation 13-14`, range: r('Revelation', v(13), v(14)) },
	{ text: `Look it up on Genesis 3-99 book`, range: r('Genesis', v(3), v(99)) },
	{ text: `Test the Romans 44-45 out`, range: r('Romans', v(44), v(45)) },
	{ text: `Low in \nthe philippians 366-78 he lay`, range: r('Philippians', v(366), v(78)) },
	{ text: `An abbreviation is Ps 13-18 y'know`, range: r('Psalms', v(13), v(18)) },
	{ text: `Another abbreviation is Ps. 44-49`, range: r('Psalms', v(44), v(49)) },
]

const hasNoReference = [
	{ text: `Pumpkin pie`, range: null },
	{ text: `Test the Romans out`, range: null },
	{ text: `Low in \nthe philharmonic 366:4 he lay`, range: null },
	{ text: `An abbreviation is Ps y'know 44:8`, range: null },
]

const hasVerse = [ ...hasReferenceWithVerse, ...hasRangeWithVerse ]
const hasNoVerse = [ ...hasNoReference, ...hasReferenceWithoutVerse, ...hasRangeWithoutVerse ]
const hasAnyReferenceOrRange = [ ...hasReferenceWithVerse, ...hasReferenceWithoutVerse, ...hasRangeWithVerse, ...hasRangeWithoutVerse ]

const tests = [
	{ options: { requireVerse: true }, shouldMatch: hasVerse, shouldNotMatch: hasNoVerse },
	{ options: { requireVerse: false }, shouldMatch: hasAnyReferenceOrRange, shouldNotMatch: hasNoReference  },
]

function runAllTests(description, testCaseTester) {
	test(description, t => {
		tests.forEach(({ options, shouldMatch, shouldNotMatch }) => {
			t.test(`Testing options: ${JSON.stringify(options)}`, t => {
				const regex = createRegex(options)
				testCaseTester({ t, expected: true, regex, cases: shouldMatch, options })
				testCaseTester({ t, expected: false, regex, cases: shouldNotMatch, options })
				t.end()
			})
		})

		t.end()
	})
}

runAllTests('Matches', ({ t, expected, regex, cases }) => {
	const expectation = expected ? 'Should' : 'Should not'
	cases.forEach(({ text }) => {
		t.equal(regex.test(text), expected, `${expectation} match '${text}'`)
	})
})

runAllTests('Capturing', ({ t, expected, regex, cases }) => {
	cases.forEach(({ text, range }) => {
		const match = text.match(regex)

		if (expected) {
			const output = extractRangeFromMatch(match)

			t.equal(output.book, range.book, `Find book name in '${text}'`)
			t.deepEqual(output.start, range.start, `Find range start in '${text}'`)
			t.deepEqual(output.end, range.end, `Find range end in '${text}'`)
		} else {
			t.equal(match, null, `No match found in ${text}`)
		}
	})
})

