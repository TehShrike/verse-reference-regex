const test = require('tape')
const { createRegex, extractRangeFromMatch } = require('./')

const hasReferenceWithVerse = [
	{
		text: `Revelation 13:3`,
		expected: {
			book: 'Revelation',
			start: { chapter: 13, verse: 3, section: null },
			end: { chapter: 13, verse: 3, section: null }
		}
	}, {
		text: `Look it up on Genesis 3:55`,
		expected: {
			book: 'Genesis',
			start: { chapter: 3, verse: 55, section: null },
			end: { chapter: 3, verse: 55, section: null }
		}
	}, {
		text: `Test the Romans 44:559 out`,
		expected: {
			book: 'Romans',
			start: { chapter: 44, verse: 559, section: null },
			end: { chapter: 44, verse: 559, section: null }
		}
	}, {
		text: `Low in \nthe philippians 366:4 he lay`,
		expected: {
			book: 'Philippians',
			start: { chapter: 366, verse: 4, section: null },
			end: { chapter: 366, verse: 4, section: null }
		}
	}, {
		text: `An abbreviation is Ps 13:4 y'know`,
		expected: {
			book: 'Psalms',
			start: { chapter: 13, verse: 4, section: null },
			end: { chapter: 13, verse: 4, section: null }
		}
	}, {
		text: `Another abbreviation is Ps. 44:8`,
		expected: {
			book: 'Psalms',
			start: { chapter: 44, verse: 8, section: null },
			end: { chapter: 44, verse: 8, section: null }
		}
	}, {
		text: `Verse section: 1 sam 12:4b`,
		expected: {
			book: '1 Samuel',
			start: { chapter: 12, verse: 4, section: 'b' },
			end: { chapter: 12, verse: 4, section: 'b' }
		}
	}, {
		text: `Second bookname: 2nd sam 12:4b`,
		expected: {
			book: '2 Samuel',
			start: { chapter: 12, verse: 4, section: 'b' },
			end: { chapter: 12, verse: 4, section: 'b' }
		}
	},
]

const hasReferenceWithoutVerse = [
	{
		text: `Revelation 13`,
		expected: {
			book: 'Revelation',
			start: { chapter: 13, verse: null, section: null },
			end: { chapter: 13, verse: null, section: null }
		}
	}, {
		text: `Look it up on Genesis 3: book`,
		expected: {
			book: 'Genesis',
			start: { chapter: 3, verse: null, section: null },
			end: { chapter: 3, verse: null, section: null }
		}
	}, {
		text: `Test the Romans 44 out`,
		expected: {
			book: 'Romans',
			start: { chapter: 44, verse: null, section: null },
			end: { chapter: 44, verse: null, section: null }
		}
	}, {
		text: `Low in \nthe philippians 366 he lay`,
		expected: {
			book: 'Philippians',
			start: { chapter: 366, verse: null, section: null },
			end: { chapter: 366, verse: null, section: null }
		}
	}, {
		text: `An abbreviation is Ps 13 y'know`,
		expected: {
			book: 'Psalms',
			start: { chapter: 13, verse: null, section: null },
			end: { chapter: 13, verse: null, section: null }
		}
	}, {
		text: `Another abbreviation is Ps. 44`,
		expected: {
			book: 'Psalms',
			start: { chapter: 44, verse: null, section: null },
			end: { chapter: 44, verse: null, section: null }
		}
	},
]

const hasRangeWithVerse = [
	{
		text: `Revelation 13:3-14:4`,
		expected: {
			book: 'Revelation',
			start: { chapter: 13, verse: 3, section: null },
			end: { chapter: 14, verse: 4, section: null }
		}
	}, {
		text: `Look it up on Genesis 3:55-23:44`,
		expected: {
			book: 'Genesis',
			start: { chapter: 3, verse: 55, section: null },
			end: { chapter: 23, verse: 44, section: null }
		}
	}, {
		text: `Test the Romans 44:559-1:1 out`,
		expected: {
			book: 'Romans',
			start: { chapter: 44, verse: 559, section: null },
			end: { chapter: 1, verse: 1, section: null }
		}
	}, {
		text: `Low in \nthe philippians 366:4-12:12 he lay`,
		expected: {
			book: 'Philippians',
			start: { chapter: 366, verse: 4, section: null },
			end: { chapter: 12, verse: 12, section: null }
		}
	}, {
		text: `An abbreviation is Ps 13:4-19:19 y'know`,
		expected: {
			book: 'Psalms',
			start: { chapter: 13, verse: 4, section: null },
			end: { chapter: 19, verse: 19, section: null }
		}
	}, {
		text: `Another abbreviation is Ps. 44:8-3:3`,
		expected: {
			book: 'Psalms',
			start: { chapter: 44, verse: 8, section: null },
			end: { chapter: 3, verse: 3, section: null }
		}
	}, {
		text: `Verse section: 1 sam 12:4b-13:5a`,
		expected: {
			book: '1 Samuel',
			start: { chapter: 12, verse: 4, section: 'b' },
			end: { chapter: 13, verse: 5, section: 'a' }
		}
	},

	{
		text: `Revelation 13:3-4`,
		expected: {
			book: 'Revelation',
			start: { chapter: 13, verse: 3, section: null },
			end: { chapter: 13, verse: 4, section: null }
		}
	}, {
		text: `Look it up on Genesis 3:55-44`,
		expected: {
			book: 'Genesis',
			start: { chapter: 3, verse: 55, section: null },
			end: { chapter: 3, verse: 44, section: null }
		}
	}, {
		text: `Test the Romans 44:559-1 out`,
		expected: {
			book: 'Romans',
			start: { chapter: 44, verse: 559, section: null },
			end: { chapter: 44, verse: 1, section: null }
		}
	}, {
		text: `Low in \nthe philippians 366:4-12 he lay`,
		expected: {
			book: 'Philippians',
			start: { chapter: 366, verse: 4, section: null },
			end: { chapter: 366, verse: 12, section: null }
		}
	}, {
		text: `An abbreviation is Ps 13:4-19 y'know`,
		expected: {
			book: 'Psalms',
			start: { chapter: 13, verse: 4, section: null },
			end: { chapter: 13, verse: 19, section: null }
		}
	}, {
		text: `Another abbreviation is Ps. 44:8-3`,
		expected: {
			book: 'Psalms',
			start: { chapter: 44, verse: 8, section: null },
			end: { chapter: 44, verse: 3, section: null }
		}
	}, {
		text: `Verse section: 1 sam 12:4b-5a`,
		expected: {
			book: '1 Samuel',
			start: { chapter: 12, verse: 4, section: 'b' },
			end: { chapter: 12, verse: 5, section: 'a' }
		}
	},

	{
		text: `Verse section: 1 sam 12:4b-a`,
		expected: {
			book: '1 Samuel',
			start: { chapter: 12, verse: 4, section: 'b' },
			end: { chapter: 12, verse: 4, section: 'a' }
		}
	},
]

const hasRangeWithoutVerse = [
	{
		text: `Revelation 13-14`,
		expected: {
			book: 'Revelation',
			start: { chapter: 13, verse: null, section: null },
			end: { chapter: 14, verse: null, section: null }
		}
	}, {
		text: `Look it up on Genesis 3-99 book`,
		expected: {
			book: 'Genesis',
			start: { chapter: 3, verse: null, section: null },
			end: { chapter: 99, verse: null, section: null }
		}
	}, {
		text: `Test the Romans 44-45 out`,
		expected: {
			book: 'Romans',
			start: { chapter: 44, verse: null, section: null },
			end: { chapter: 45, verse: null, section: null }
		}
	}, {
		text: `Low in \nthe philippians 366-78 he lay`,
		expected: {
			book: 'Philippians',
			start: { chapter: 366, verse: null, section: null },
			end: { chapter: 78, verse: null, section: null }
		}
	}, {
		text: `An abbreviation is Ps 13-18 y'know`,
		expected: {
			book: 'Psalms',
			start: { chapter: 13, verse: null, section: null },
			end: { chapter: 18, verse: null, section: null }
		}
	}, {
		text: `Another abbreviation is Ps. 44-49`,
		expected: {
			book: 'Psalms',
			start: { chapter: 44, verse: null, section: null },
			end: { chapter: 49, verse: null, section: null }
		}
	},
]

const hasNoReference = [
	{
		text: `Pumpkin pie`,
		expected: null
	}, {
		text: `Test the Romans out`,
		expected: null
	}, {
		text: `Low in \nthe philharmonic 366:4 he lay`,
		expected: null
	}, {
		text: `An abbreviation is Ps y'know 44:8`,
		expected: null
	},
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
				testCaseTester({ t, expectedToFindMatch: true, regex, cases: shouldMatch, options })
				testCaseTester({ t, expectedToFindMatch: false, regex, cases: shouldNotMatch, options })
				t.end()
			})
		})

		t.end()
	})
}

runAllTests('Matches', ({ t, expectedToFindMatch, regex, cases }) => {
	const expectation = expectedToFindMatch ? 'Should' : 'Should not'
	cases.forEach(({ text }) => {
		t.equal(regex.test(text), expectedToFindMatch, `${expectation} match '${text}'`)
	})
})

runAllTests('Capturing', ({ t, expectedToFindMatch, regex, cases }) => {
	cases.forEach(({ text, expected }) => {
		const match = text.match(regex)

		if (expectedToFindMatch) {
			const output = extractRangeFromMatch(match)

			t.equal(output.book, expected.book, `Find book name in '${text}'`)
			t.deepEqual(output.start, expected.start, `Find range start in '${text}'`)
			t.deepEqual(output.end, expected.end, `Find range end in '${text}'`)
		} else {
			t.equal(match, null, `No match found in ${text}`)
		}
	})
})

