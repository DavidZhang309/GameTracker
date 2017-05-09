/**
 * Makes an array dinstinct and sorted(side effect)
 * @param array The array being processed
 * 
 * @returns An array of distinct values
 */
export function distinct(array: any[]): any[] {
    var sorted = array.slice(0).sort();
    return sorted.reduce(function(acc, item) {
        if (item != acc[acc.length - 1]) { acc.push(item) }
        return acc;
    }, [sorted[0]]);
}