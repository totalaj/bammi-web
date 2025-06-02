import { Position } from "../math/position";

export function generate_checkerboard_board(width: number, height: number): Position[][]{
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
    return []
}