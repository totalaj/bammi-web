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
    player: i32,
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

    var app = App{.allocator = allocator};

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

    pub fn clientMessage(self: *Handler, data: []const u8) !void {
        const tree = try std.json.parseFromSlice(std.json.Value, self.app.allocator, data, .{});
        defer tree.deinit();

        const obj_type = tree.value.object.get("message_type").?;
        std.debug.print("json type: {} \n", .{obj_type.integer});
        //try self.conn.write(data);
    }
};

const App = struct {
    allocator: std.mem.Allocator,
    //maybe a db pool
    //maybe a list of rooms
};
