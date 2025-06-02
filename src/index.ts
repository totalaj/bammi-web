import { BammiGame, Position } from "./bammi"

function main(): void {
    const web_socket = new WebSocket("ws://localhost:3000", "bammi");

    web_socket.onopen = (event: Event): void => {
        const msg = {
            message_type: "move",
            move_cell: 3
        }
        web_socket.send(JSON.stringify(msg))
    }

    web_socket.onmessage = (event: MessageEvent<any>): void => {
        console.log("message: " + event.data)
    }

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

        for (let area_index = 0; area_index < state.areas.length; area_index++) {
            const area = state.areas[area_index]

            area.cells.forEach((cell, cell_index) => {
                const cell_element = grid.appendChild(document.createElement('div'))
                cells.push(cell_element)
                cell_element.classList.add('game-cell')
                cell_element.classList.add('player-' + area.owning_player.toFixed(0))
                cell_element.style.gridColumn = (cell.column + 1).toFixed(0)
                cell_element.style.gridRow = (cell.row + 1).toFixed(0)

                if (cell_index === 0) {
                    cell_element.textContent = `${area.slice_count}/${area.pie_size}`
                }

                cell_element.onclick = (): void => {
                    bammi_game.submit_move(cell.column, cell.row, bammi_game.get_active_player())
                    update_board()
                }
                const top_adjacent = new Position(cell.column, cell.row - 1)
                const bottom_adjacent = new Position(cell.column, cell.row + 1)
                const left_adjacent = new Position(cell.column - 1, cell.row)
                const right_adjacent = new Position(cell.column + 1, cell.row)

                if (state.get_area(top_adjacent.column, top_adjacent.row) !== area) {
                    cell_element.style.borderTopColor = 'black'
                }
                if (state.get_area(bottom_adjacent.column, bottom_adjacent.row) !== area) {
                    cell_element.style.borderBottomColor = 'black'
                }
                if (state.get_area(left_adjacent.column, left_adjacent.row) !== area) {
                    cell_element.style.borderLeftColor = 'black'
                }
                if (state.get_area(right_adjacent.column, right_adjacent.row) !== area) {
                    cell_element.style.borderRightColor = 'black'
                }
            })
        }
    }

    update_board()
}

main()
