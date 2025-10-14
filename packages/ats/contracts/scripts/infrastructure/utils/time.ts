export function dateToUnixTimestamp(dateString: string): number {
    const date = new Date(dateString)

    if (isNaN(date.getTime())) {
        throw new Error('Invalid date format. Please provide a valid date.')
    }

    return Math.floor(date.getTime() / 1000)
}
