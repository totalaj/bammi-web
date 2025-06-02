export class Position {
    public column: number
    public row: number

    constructor(column: number, row: number) {
        this.column = column
        this.row = row
    }

    public equals(other: Position): boolean {
        return this.column === other.column && this.row === other.row
    }

    /**
     * Returns false if the positions are equal
     */
    public is_adjacent(other: Position): boolean {
        if (this.equals(other)) return false
        return Math.abs(this.column - other.column) === 1
            || Math.abs(this.row - other.row) === 1
    }
}