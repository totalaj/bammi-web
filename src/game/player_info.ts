import { PlayerIndex } from "./bammi"

export type PlayerInfo = {
    color: string,
    flavour: string,
    class: string,
    is_null_player?: boolean
}

const PLAYER_INDEX_TO_INFO = new Map<PlayerIndex, PlayerInfo>([
    [ 0,
        {
            color: '',
            flavour: '',
            class: 'null-player',
            is_null_player: true
        } ],
    [ 1,
        {
            color: 'blue',
            flavour: 'blueberry',
            class: 'player-1'
        } ],
    [ 2,
        {
            color: 'red',
            flavour: 'raspberry',
            class: 'player-2'
        } ],
    [ 3,
        {
            color: 'purple',
            flavour: 'grape',
            class: 'player-3'
        } ],
    [ 4,
        {
            color: 'green',
            flavour: 'key lime',
            class: 'player-4'
        } ],
    [ 5,
        {
            color: 'yellow',
            flavour: 'citrus',
            class: 'player-5'
        } ],
    [ 6,
        {
            color: 'magenta',
            flavour: 'bubblegum',
            class: 'player-6'
        } ],
    [ 7,
        {
            color: 'teal',
            flavour: 'menthol',
            class: 'player-7'
        } ],
    [ 8,
        {
            color: 'orange',
            flavour: 'orange',
            class: 'player-8'
        } ]
])

export function get_player_info(player_index: PlayerIndex): PlayerInfo {
    const player_info = PLAYER_INDEX_TO_INFO.get(player_index)
    if (!player_info) {
        console.error("Failed to get player info for player", player_index)
        return {
            color: 'ERR',
            flavour: 'ERR',
            class: ''
        }
    }

    return player_info
}