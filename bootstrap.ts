export function ArrayEquals<T>(a: Array<T>, b: Array<T>): [boolean, T[]] {
  let notAmong: T[] = []
  a.forEach((i, _in) => {
    if (!b.find((bI) => (bI == i))) {
        notAmong.push(i)
    }
  })

  return [Array.isArray(a) && 
    Array.isArray(b) &&
    a.length === b.length && 
    a.every((val: T, index) => val === b[index]), notAmong]
}
