import { BammiGame } from "./game/bammi"
import { get_player_info } from "./game/player_info"
import { Position } from "./math/position"


function main(): void {
    const web_socket = new WebSocket("ws://localhost:3000", "bammi")

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

    const turn_indicator = document.body.appendChild(document.createElement('h4'))
    turn_indicator.id = 'turn-indicator'
    turn_indicator.classList.add(get_player_info(bammi_game.get_active_player()).class)

    const cells: HTMLElement[] = []

    // Placeholder visuals
    function update_board(): void {
        cells.forEach(cell => {
            grid.removeChild(cell)
        })
        cells.length = 0

        const current_player = get_player_info(bammi_game.get_active_player())

        turn_indicator.classList.forEach((class_name) => {
            if (class_name.match('player-')) {
                turn_indicator.classList.replace(class_name, current_player.class)
            }
        })

        turn_indicator.innerText = `${current_player.color}'s turn.\nTurn all pies into ${current_player.flavour} pies!`

        const state = bammi_game.board_state

        for (let area_index = 0; area_index < state.areas.length; area_index++) {
            const area = state.areas[area_index]
            const area_player = get_player_info(area.owning_player)

            area.cells.forEach((cell, cell_index) => {
                const cell_element = grid.appendChild(document.createElement('div'))
                cells.push(cell_element)
                cell_element.classList.add('game-cell', 'medium', area_player.class)
                cell_element.style.gridColumn = (cell.column + 1).toFixed(0)
                cell_element.style.gridRow = (cell.row + 1).toFixed(0)

                if (cell_index === 0 && !area_player.is_null_player) {
                    const pie = cell_element.appendChild(document.createElement('div'))
                    pie.classList.add('pie', area_player.class)
                    const fill_percentage = ((area.slice_count / area.pie_size) * 100).toPrecision(2)
                    const color_var = 'var(--highlight-color)'
                    pie.style.backgroundImage = `conic-gradient(${color_var} 0%, ${color_var} ${fill_percentage}%, transparent ${fill_percentage}%)`
                }

                cell_element.onclick = (): void => {
                    const active_player = bammi_game.get_active_player()
                    const result = bammi_game.submit_move(cell.column, cell.row, active_player)

                    for (let index = 0; index < result.explosions.length; index++) {
                        const explosion = result.explosions[index]
                        console.log("Explosion at area", explosion.exploding_area, "spreading into", explosion.adjacent_areas.length, "adjacent areas")
                    }

                    if (result.victory) {
                        console.log("Game over, the winner is", get_player_info(active_player).flavour)
                    }

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
