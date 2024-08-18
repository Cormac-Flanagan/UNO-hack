from flask import Flask, render_template, jsonify, session, request
from flask_session import Session
import socket

app = Flask(__name__)

app.config["SESSION_TYPE"] = "filesystem"
# Change this to a real secret key
app.config["SECRET_KEY"] = "me"
Session(app)

users = 0


@app.route("/")
def index():
    global users
    session["user_id"] = users
    users += 1
    return render_template("index.html")


"""
fn check_color(input: &u8) -> &str {
    match input {
        0b00 => "R",
        0b01 => "B",
        0b10 => "G",
        0b11 => "Y",
        _ => "Error",
    }
}

fn check_name(input: &u8) -> &str {
    match input {
        0b00 => "Skip",
        0b01 => "Reverse",
        0b10 => "+2",
        _ => "Error",
    }
}

"""


def name(x):
    match x:
        case 0:
            return "Skip"
        case 1:
            return "Reverse"
        case 2:
            return "+2"


def meta(x):
    match x:
        case 0:
            return "Wild"
        case 1:
            return "+4"


def color(x):
    match x:
        case 0:
            return "Y"
        case 1:
            return "G"
        case 2:
            return "R"
        case 3:
            return "B"


@app.route("/command", methods=["POST"])
def command():
    data = request.json  # Get JSON data from the request
    if data is not None:
        command = data["command"]
        # Process the command as needed
        print(f"Received command: {command}")
        return jsonify({"status": "success", "message": f"Command received: {command}"})


@app.route("/data")
def fetch_data():
    code = bytearray([0x0C, 0xDE, 0x00, 0x00, 0x00, 0x00, 0x04])
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.connect(("localhost", 3000))
        s.sendall(code)
        data = s.recv(1024)

    player_data = []
    player_cards = []
    for i in range(6, len(data), 4):
        if i < len(data) - 4:
            player_cards.append(data[i: i + 4])
    print(player_cards)

    for pos, i in enumerate(player_cards):
        if i[0] == session.get("user_id") or pos == 0:
            # print(i[1])
            if int(i[1]) == 1:
                player_data.append((name(int(i[2])), color(int(i[3]))))
            elif int(i[1] == 2):
                player_data.append((meta(int(i[2])), "Black"))
            else:
                player_data.append((int(i[2]), color(int(i[3]))))

    return jsonify({"top": player_data[0], "message": (player_data[1:])})


if __name__ == "__main__":
    app.run(debug=True)
