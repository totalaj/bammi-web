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

export function get_adjacent_positions(position: Position): Position[] {
    return [ // Gather adjacent cells from area
        new Position(position.column + 1, position.row),
        new Position(position.column - 1, position.row),
        new Position(position.column, position.row + 1),
        new Position(position.column, position.row - 1)
    ]
}

/**
 * A set of all positions that are orthogonally adjacent to any position in the input set, excluding cells in the input set
 */
export function get_area_adjacent_positions(in_positions: Position[]): Position[] {
    return in_positions
        .flatMap((in_position) => get_adjacent_positions(in_position)) // Get adjacent cells to all input cells
        .filter((position) => !in_positions.some((in_position) => in_position.equals(position))) // Remove cells that are in the original array
        .reduce<Position[]>((out_list, position) => {
            // Loop through list of positions, only adding to output list if not already in it
            if (!out_list.some((pos) => pos.equals(position))) {
                out_list.push(position)
            }
            return out_list
        }, [])
}