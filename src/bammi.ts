/**
 * The game of Bammi:
 * - The board is a grid of cells, distributed in areas.
 * - Each area has a pie dish.
 * - Each dish has slots equal to the number of connected areas.
 * - All dishes start empty.
 * - On your turn, click an unclaimed or your own area to add a slice to its dish and claim it.
 * - If a dish is full (slices == slots), adding a slice causes an explosion:
 *   - The dish keeps 1 slice, the rest are removed.
 *   - Each connected area gets 1 slice, and is claimed by the exploding player.
 *   - Explosions can chain if connected dishes also become full.
 * - You win by claiming all areas.
 */

/**
 * An index of 0 means no player
 */
export type PlayerIndex = number

class Position {
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

type Area = {
    owning_player: PlayerIndex,
    cells: Position[],
    pie_size: number,
    slice_count: number
}

export class BammiBoardState {
    public readonly BOARD_WIDTH: number
    public readonly BOARD_HEIGHT: number

    public areas: Area[] = []

    constructor(board_width: number, board_height: number) {
        // Construct the board and distribute areas
        this.BOARD_WIDTH = board_width
        this.BOARD_HEIGHT = board_height

        // Some arbitrary board
        // One area per column, for now
        for (let column = 0; column < this.BOARD_WIDTH; column++) {
            const cells: Position[] = []

            for (let row = 0; row < this.BOARD_HEIGHT; row++) {
                cells.push(new Position(column, row))
            }

            this.areas.push({
                owning_player: 0,
                cells: cells,
                pie_size: 0,
                slice_count: 0
            })
        }

        // Initialize pie sizes
        for (let index = 0; index < this.areas.length; index++) {
            const area = this.areas[index]
            area.pie_size = this.get_adjacent_areas(area).length
        }
    }

    public get_area(column: number, row: number): Area | undefined {
        // We could precompute a mapping for col/row to area, if we want do do this more often
        const position = new Position(column, row)
        for (let index = 0; index < this.areas.length; index++) {
            const area = this.areas[index]
            if (area.cells.some((cell) => cell.equals(position))) {
                return area
            }
        }

        return undefined
    }

    public get_adjacent_areas(area: Area): Area[] {
        const adjacent_area_set: Set<Area> = new Set()

        const cells = area.cells
            .flatMap((area_cell) =>
                [ // Gather adjacent cells from area
                    new Position(area_cell.column + 1, area_cell.row),
                    new Position(area_cell.column - 1, area_cell.row),
                    new Position(area_cell.column, area_cell.row + 1),
                    new Position(area_cell.column, area_cell.row - 1)
                ])
            .filter((cell) => !area.cells.some((area_cell) => area_cell.equals(cell))) // Remove cells that are in the original area
            .reduce<Position[]>((acc, val) => {
                if (!acc.some((pos) => pos.equals(val))) {
                    acc.push(val)
                }
                return acc
            }, [])

        cells.forEach((cell) => {
            const found_area = this.get_area(cell.column, cell.row)
            if (found_area) {
                adjacent_area_set.add(found_area)
            }
        })

        const adjacent_areas: Area[] = []

        adjacent_area_set.forEach((adjacent_area) => adjacent_areas.push(adjacent_area))

        return adjacent_areas
    }

    public get_win_state(): PlayerIndex | undefined {
        let player_index: PlayerIndex | undefined = undefined

        for (let index = 0; index < this.areas.length; index++) {
            const area = this.areas[index]
            if (player_index === undefined && area.owning_player !== 0) {
                player_index = area.owning_player
            }

            if (area.owning_player !== player_index) {
                return undefined
            }
        }

        return player_index
    }
}

export class BammiGame {
    public board_state: BammiBoardState
    private _turn_order: PlayerIndex[]
    private _turn_index: number

    constructor() {
        this._turn_order = [ 1, 2 ]
        this._turn_index = 0
        this.board_state = new BammiBoardState(10, 10)
    }

    public get_active_player(): PlayerIndex {
        return this._turn_order[this._turn_index]
    }

    public submit_move(column: number, row: number, player: PlayerIndex): void {
        if (this.board_state.get_win_state() !== undefined) {
            console.log("We already have a winner, you can't play any more")
            return
        }

        const area = this.board_state.get_area(column, row)
        if (!area) {
            console.error("Area at column", column, "and row", row, "has no area to be found!")
            return
        }

        if (area.owning_player !== 0 && area.owning_player !== player) {
            console.warn("Player", player, "cannot add to area at column", column, "and row", row)
            return
        }

        // Increment player pointer
        this._turn_index = (this._turn_index + 1) % this._turn_order.length

        let areas_to_add_to = [ area ]

        while (areas_to_add_to.length > 0) {
            const top_area = areas_to_add_to[0]
            areas_to_add_to = areas_to_add_to.slice(1) // Remove the first element
            top_area.owning_player = player

            if (top_area.slice_count >= top_area.pie_size) {
                // Explosion
                areas_to_add_to.push(...this.board_state.get_adjacent_areas(top_area))
            }
            top_area.slice_count++

            const winner = this.board_state.get_win_state()

            if (winner !== undefined) {
                console.log("We have a winner! Player with index", winner)
                return
            }
        }
    }
}

