const std = @import("std");
const ws = @import("websocket");

const Message = enum {
    Connect,
    Move,
};

const MessageConnect = struct {
    message_type: Message = .Connect,
    room_id: []const u8,
    player_id: []const u8,
};

const MessageMove = struct {
    message_type: Message = .Move,
    area: i32,
    player: []const u8,
};

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    const allocator = gpa.allocator();
    // Prints to stderr, ignoring potential errors.
    std.debug.print("All your {s} are belong to us.\n", .{"codebase"});

    var ws_server = try ws.Server(Handler).init(allocator, .{
        .port = 3000,
        .address = "127.0.0.1",
        .handshake = .{
            .timeout = 3,
            .max_size = 1024,
            .max_headers = 0,
        },
    });

    var app = App{
        .allocator = allocator,
        .rooms = .empty,
        .players = .empty,
    };

    try ws_server.listen(&app);
}

const Handler = struct {
    app: *App,
    conn: *ws.Conn,

    pub fn init(h: *ws.Handshake, conn: *ws.Conn, app: *App) !Handler {
        _ = h; //not used in simple case
        return .{
            .app = app,
            .conn = conn,
        };
    }

    fn parseMessage(T: type, value: *const std.json.Value, allocator: std.mem.Allocator) !T {
        const message_unwrapped = try std.json.parseFromValue(T, allocator, value.*, .{});
        defer message_unwrapped.deinit();
        const message = message_unwrapped.value;
        std.debug.print("parsed message: {}\n", .{message});
        return message;
    }

    pub fn clientMessage(self: *Handler, allocator: std.mem.Allocator, data: []const u8) !void {
        std.debug.print("data: {s}\n", .{data});
        const tree = try std.json.parseFromSlice(std.json.Value, allocator, data, .{});
        defer tree.deinit();

        const obj_type = tree.value.object.get("message_type").?;
        const msg_type: Message = @enumFromInt(obj_type.integer);
        std.debug.print("json type: {}\n", .{msg_type});

        switch (msg_type) {
            .Connect => {
                const message = try parseMessage(MessageConnect, &tree.value, allocator);

                const player = try self.app.players.getOrPut(self.app.allocator, message.player_id);
                if (!player.found_existing) {
                    player.value_ptr.* = .{
                        .id = .{ .val = message.player_id },
                        .room_id = .{ .val = message.room_id },
                        .conn = self.conn,
                    };
                }

                const room = try self.app.rooms.getOrPut(self.app.allocator, message.room_id);
                if (!room.found_existing) {
                    room.value_ptr.players = .empty;
                    try room.value_ptr.players.append(self.app.allocator, .{
                        .val = message.player_id,
                    });
                }
            },
            .Move => {
                const message = try parseMessage(MessageMove, &tree.value, allocator);
                for(self.app.rooms.get(message.player).?.players.items) |player_id| {
                    const player = self.app.players.get(player_id.val);
                    try player.?.conn.write(data);
                }
                std.debug.print("Move parsed: {}\n", .{message});
            },
        }
        //try self.conn.write(data);
    }
};

const App = struct {
    allocator: std.mem.Allocator,
    rooms: std.StringHashMapUnmanaged(Room),
    players: std.StringHashMapUnmanaged(Player),
};

const PlayerID = struct {
    val: []const u8,
};

const RoomID = struct {
    val: []const u8,
};

const Player = struct {
    id: PlayerID,
    room_id: RoomID,
    conn: *ws.Conn,
};

const Room = struct {
    id: RoomID,
    players: std.ArrayList(PlayerID),
};
