/**
 * Determines if a year is a leap year
 * @param {year int} year
 */
function isLeap(year) {
    // Return true if year
    // is a multiple pf 4 and
    // not multiple of 100.
    // OR year is multiple of 400.
    return (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
}

/**
 * Validates wether a date is valid
 * @param {d int} day
 * @param {m int} month
 * @param {y int} year
 */
function isValidDate(d, m, y, validYears) {
    // If year, month and day
    // are not in given range
    if (y > validYears[1] || y < validYears[0]) return false;

    if (m < 1 || m > 12) return false;
    if (d < 1 || d > 31) return false;

    // Handle February month
    // with leap year
    if (m == 2) {
        if (isLeap(y)) return d <= 29;
        else return d <= 28;
    }

    // Months of April, June,
    // Sept and Nov must have
    // number of days less than
    // or equal to 30.
    if (m == 4 || m == 6 || m == 9 || m == 11) return d <= 30;

    return true;
}

/**
 * Inquires for input in order to create an event object
 * @param {answers Object} answers obtained via inquirer prompt
 */
function parseAnswers(answers) {
    const [shour,sminutes] = answers.startHour.split(":");
    const [ehour,eminutes] = answers.endHour.split(":");

    // TODO: missing endtime ????
    return {
        calendarId: "primary",
        resource: {
            summary: answers.name,
            location: "",
            description: answers.description,
            start: {
                dateTime: new Date(
                    answers.year,
                    answers.month,
                    answers.day,
                    shour,
                    sminutes
                ).toISOString(), //"2015-05-28T09:00:00-07:00",
                timeZone: "America/Santiago",
            },
            end: {
                dateTime: new Date(
                    answers.year,
                    answers.month,
                    answers.day,
                    ehour,
                    eminutes
                ).toISOString(), //"2015-05-28T09:00:00-07:00",
                timeZone: "America/Santiago",
            },
            recurrence: ["RRULE:FREQ=DAILY;COUNT=1"],
            attendees: [],
            reminders: {
                useDefault: false,
                overrides: [
                    { method: "email", minutes: answers.reminder * 24 * 60 },
                    { method: "popup", minutes: 60 },
                ],
            },
        },
    };
}

module.exports = {
    parseAnswers,
    isValidDate,
}

