export function* triangularGenerator(): Iterator<number> {
    var i = 1;
    while (true) {
        yield (i * (i + 1)) / 2;
        i++;
    }
}