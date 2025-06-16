import { Area, BammiBoardState, BammiGame } from "./game/bammi"
import { get_player_info } from "./game/player_info"
import { Position } from "./math/position"


function main(): void {
    const socket = new WebSocket("ws://localhost:3000", "bammi")

    socket.onopen = (event: Event): void => {
    }

    socket.onmessage = (event: MessageEvent<any>): void => {
        console.log("message: " + event.data)
    }

    const bammi_game = new BammiGame(socket)

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
        console.log("current player", current_player)

        turn_indicator.classList.forEach((class_name) => {
            if (class_name.match('player-')) {
                turn_indicator.classList.replace(class_name, current_player.class)
            }
        })
        turn_indicator.innerText = `${current_player.flavour}'s turn`

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
                    bammi_game.submit_move(cell.column, cell.row, bammi_game.get_active_player())
                    update_board()
                }
                const top_adjacent = new Position(cell.column, cell.row - 1)
                const bottom_adjacent = new Position(cell.column, cell.row + 1)
                const left_adjacent = new Position(cell.column - 1, cell.row)
                const right_adjacent = new Position(cell.column + 1, cell.row)

		const top_area: Area | undefined = state.get_area(top_adjacent.column, top_adjacent.row)[0]
		if (top_area == null || top_area == undefined) {
		    return
		}
		const bottom_area: Area | undefined = state.get_area(bottom_adjacent.column, bottom_adjacent.row)[0]
		if (bottom_area == null || bottom_area == undefined) {
		    return
		}
		const left_area: Area | undefined = state.get_area(left_adjacent.column, left_adjacent.row)[0]
		if (left_area == null || left_area == undefined) {
		    return
		}
		const right_area: Area | undefined = state.get_area(right_adjacent.column, right_adjacent.row)[0]
		if (right_area == null || right_area == undefined) {
		    return
		}

                if (top_area !== area) {
                    cell_element.style.borderTopColor = 'black'
                }
                if (bottom_area !== area) {
                    cell_element.style.borderBottomColor = 'black'
                }
                if (left_area !== area) {
                    cell_element.style.borderLeftColor = 'black'
                }
                if (right_area !== area) {
                    cell_element.style.borderRightColor = 'black'
                }
            })
        }
    }

    update_board()
}

main()
