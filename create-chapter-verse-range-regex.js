const {
	combine,
	flags,
	either,
	optional,
} = require('regex-fun')

module.exports = function createChapterVerseRangeRegex({
	requireVerse = false,
	flags: regexFlags = 'i',
} = {}) {
	const number = /(\d+)/
	const numberAndOptionalLetter = /(\d+)([a-z])?/
	const colonVerse = combine(':', numberAndOptionalLetter)
	const chapterAndVerse = combine(number, requireVerse ? colonVerse : optional(colonVerse))

	const secondHalfOfRange = combine('-', either(/([a-z])/, chapterAndVerse, numberAndOptionalLetter))

	return flags(regexFlags, chapterAndVerse, optional(secondHalfOfRange))
}
