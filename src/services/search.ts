export class SearchIndex {
    private index: Map<string, Set<string>>;
    private recordTrigrams: Map<string, Set<string>>;

    constructor() {
        this.index = new Map<string, Set<string>>();
        this.recordTrigrams = new Map<string, Set<string>>();
    }

    // Helper function to tokenize a string into words
    private tokenize(text: string): string[] {
        return text.split(/\s+/);
    }

    // Helper function to generate trigrams from a word
    private generateTrigrams(word: string): string[] {
        const trigrams: string[] = [];
        for (let i = 0; i <= word.length - 3; i++) {
            trigrams.push(word.substring(i, i + 3));
        }
        return trigrams;
    }

    // Function to add a string to the index
    public addToIndex(id: string, text: string): void {
        this.removeFromIndex(id); // Remove old trigrams if they exist

        const tokens = this.tokenize(text);
        const trigrams = new Set<string>();

        tokens.forEach(token => {
            this.generateTrigrams(token).forEach(trigram => {
                trigrams.add(trigram);
            });
        });

        trigrams.forEach(trigram => {
            if (!this.index.has(trigram)) {
                this.index.set(trigram, new Set<string>());
            }
            this.index.get(trigram)!.add(id);
        });

        this.recordTrigrams.set(id, trigrams);
    }

    // Function to remove a record's trigrams from the index
    private removeFromIndex(id: string): void {
        if (this.recordTrigrams.has(id)) {
            const oldTrigrams = this.recordTrigrams.get(id)!;
            oldTrigrams.forEach(trigram => {
                const ids = this.index.get(trigram);
                if (ids) {
                    ids.delete(id);
                    if (ids.size === 0) {
                        this.index.delete(trigram);
                    }
                }
            });
            this.recordTrigrams.delete(id);
        }
    }

    // Function to search the index for all matching records
    public search(query: string): { id: string, score: number }[] {
        const queryTokens = this.tokenize(query);
        const queryTrigrams = new Set<string>();

        queryTokens.forEach(token => {
            this.generateTrigrams(token).forEach(trigram => {
                queryTrigrams.add(trigram);
            });
        });

        const candidateScores: Map<string, number> = new Map<string, number>();

        queryTrigrams.forEach(trigram => {
            if (this.index.has(trigram)) {
                this.index.get(trigram)!.forEach(id => {
                    if (!candidateScores.has(id)) {
                        candidateScores.set(id, 0);
                    }
                    candidateScores.set(id, candidateScores.get(id)! + 1);
                });
            }
        });

        const results: { id: string, score: number }[] = [];

        candidateScores.forEach((score, id) => {
            results.push({ id, score });
        });

        results.sort((a, b) => b.score - a.score);

        return results;
    }
}
