import socket

class Network :
    def __init__(self) :
        self.client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.server = "192.168.1.8"
        self.port = 5050
        self.address = (self.server, self.port)
        self.position = self.connect()

    def get_position(self) :
        return self.position

    def connect(self) :
        try :
            self.client.connect(self.address)
            return self.client.recv(2048).decode()
        
        except:
            pass

    def send(self, data) :
        try :
            self.client.send(str.encode(data))
            return self.client.recv(2048).decode()
        
        except socket.error as error :
            print("Error msg: ", error)

