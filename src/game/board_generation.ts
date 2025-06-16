import { get_area_adjacent_positions, Position } from "../math/position"

export function generate_checkerboard_board(width: number, height: number): Position[][] {
    const result: Position[][] = []

    for (let column = 0; column < width; column++) {
        for (let row = 0; row < height; row++) {
            const cells: Position[] = []
            cells.push(new Position(column, row))
            result.push(cells)
        }
    }
    return result
}

export function generate_zipf_board(width: number, height: number): Position[][] {
    const cell_groups: Position[][] = []
    let cell_set: Position[] = []

    for (let column = 0; column < width; column++) {
        for (let row = 0; row < height; row++) {
            cell_set.push(new Position(column, row))
        }
    }

    function finished(): boolean {
        return cell_set.length === 0
    }

    function get_random_point(): Position {
        return new Position(
            Math.floor(Math.random() * width),
            Math.floor(Math.random() * height)
        )
    }

    let failsafe = 1000

    do {
        failsafe--
        const random_point = get_random_point()

        const existing_group = cell_groups.find((group) => group.some((cell) => cell.equals(random_point)))

        if (existing_group) {
            // Add random in-bounds unoccupied adjacent cell
            const adjacent_cells = get_area_adjacent_positions(existing_group)
                .filter((cell) => cell.column >= 0 && cell.column < width && cell.row >= 0 && cell.row < height)
                .filter((cell) => {
                    return cell_groups.some((group) => {
                        // Only cells that aren't contained in a group
                        return group.some((group_cell) => group_cell.equals(cell))
                    }) === false
                })

            if (adjacent_cells.length > 0) {
                const random_adjacent_cell = adjacent_cells[Math.floor(Math.random() * adjacent_cells.length)]
                // Remove cell from tracking set
                cell_set = cell_set.filter((cell) => !cell.equals(random_adjacent_cell))
                existing_group.push(random_adjacent_cell)
            }
        }
        else {
            // Remove cell from tracking set
            cell_set = cell_set.filter((cell) => !cell.equals(random_point))
            cell_groups.push([ random_point ])
        }
    } while (!finished() && failsafe > 0)

    return cell_groups
}