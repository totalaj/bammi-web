import { BammiGame } from "./bammi"

function main(): void {
    const bammi_game = new BammiGame()

    const grid = document.body.appendChild(document.createElement('div'))
    grid.id = 'game-grid'
    const cells: HTMLElement[] = []

    // Placeholder visuals
    function update_board(): void {
        cells.forEach(cell => {
            grid.removeChild(cell)
        })
        cells.length = 0

        const state = bammi_game.board_state

        for (let index = 0; index < state.areas.length; index++) {
            const element = state.areas[index]

            element.cells.forEach((cell) => {
                const cell_element = grid.appendChild(document.createElement('div'))
                cells.push(cell_element)
                cell_element.classList.add('game-cell')
                cell_element.classList.add('player-' + element.owning_player.toFixed(0))
                cell_element.style.gridColumn = (cell.column + 1).toFixed(0)
                cell_element.style.gridRow = (cell.row + 1).toFixed(0)
                cell_element.onclick = (): void => {
                    bammi_game.submit_move(cell.column, cell.row, 1 /** Debug player index */)
                    update_board()
                }
            })
        }
    }

    update_board()
}

main()