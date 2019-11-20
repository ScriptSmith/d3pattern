export function* primeGenerator(n: number): Iterator<number> {
    const primes: number[] = [2];

    for (let i = 3; i < n; i++) {
        const isq = Math.sqrt(i);
        let unbroken = true;

        for (const prime of primes) {
            if (prime > isq) {
                primes.push(i);
                unbroken = false;
                break;
            } else if (i % prime === 0) {
                unbroken = false;
                break;
            }
        }
        if (unbroken) {
            primes.push(i);
        }
    }

    for (const prime of primes) {
        yield prime;
    }
}

export function* triangularGenerator(): Iterator<number> {
    let i = 1;
    while (true) {
        yield (i * (i + 1)) / 2;
        i++;
    }
}
