// filepath: src/random.js
/**
 * Seeded Random Number Generator
 * Provides reproducible random numbers for simulation testing
 */

class SeededRandom {
    constructor(seed = Date.now()) {
        this.seed = seed;
    }

    // Linear Congruential Generator (LCG)
    // Using parameters from Numerical Recipes
    next() {
        this.seed = (this.seed * 1664525 + 1013904223) >>> 0;
        return this.seed / 0x100000000; // 確保結果永遠在 [0, 1) 之間
    }

    // Generate random integer in range [min, max]
    nextInt(min, max) {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }
}

// Global instance
let globalRandom = new SeededRandom();

// Export functions compatible with Math.random interface
export function random() {
    return globalRandom.next();
}

export function setSeed(seed) {
    globalRandom = new SeededRandom(seed);
    return globalRandom.seed;
}

export function getSeed() {
    return globalRandom.seed;
}

export function reset(seed) {
    if (seed !== undefined) {
        globalRandom = new SeededRandom(seed);
    }
    return globalRandom.seed;
}

// Export the class for direct use if needed
export { SeededRandom };