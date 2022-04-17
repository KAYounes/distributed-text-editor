import socket, sys
from _thread import *

def str_to_int(position) : # "(x, y)"
    position = position.split(",")
    return int(position[0]), int(position[1])

def int_to_str(position):
    return str(position[0]) + ',' + str(position[1])

player_positions = [(0,0), (100,100)] # p1 position, p2 position

PLAYER1 = 0
PLAYER2 = 1

current_player = PLAYER1

###########
server = "192.168.1.8" # ip address of machine from cmd > ipconfig
port = 5050

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
try:
    s.bind((server, port))
except socket.error as error :
    str(e)

s.listen(2) # The arguments determines the number of connections allowed, no arg means infinity connections
print("Server is up and running, Waiting for connection...")


def client_thread(connection, current_player) :
    message = int_to_str(player_positions[current_player])
    connection.send(str.encode(message))
    
    reply = ""

    while True :
        try :
            data = str_to_int(connection.recv(2048).decode())
            player_positions[current_player] = data
            ## Old code
            # data = connection.recv(2048) # number of bytes of data
            # reply = data.decode("utf-8") # we have to decode the information

            if not data : # no data
                print("No data received, Disconnecting...")
                break
            else :
                if current_player : # == 1
                    reply = player_positions[0] # send the position of the other player
                else:
                    reply = player_positions[1]

                print("Received: ", data)
                print("Sending: ", reply)

            connection.sendall(str.encode(int_to_str(reply))) # encode data
        
        except Exception as error:
            print("We should not be here: ", error)
            break

    print("Connection Lost")
    connection.close() # we need to close the connection to be able to reopen it again later



while True : #This will loop will continuouesly look for connections
    connection, address = s.accept() #accept an incomiing connection as an object, where address is the IP address
    print("Connection establieshed with ip address: ", address)


    start_new_thread(client_thread, (connection, current_player))
    
    # once a connection is accepted add 1
    current_player += 1