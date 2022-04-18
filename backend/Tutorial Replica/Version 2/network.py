import socket, pickle

class Network :
    def __init__(self) :
        self.client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.server = "192.168.1.8"
        self.port = 5050
        self.address = (self.server, self.port)
        self.object = self.connect()

    def get_object(self) :
        return self.object

    def connect(self) :
        try :
            self.client.connect(self.address)
            return pickle.loads(self.client.recv(2048))
        
        except:
            pass

    def send(self, data) :
        try :
            self.client.send(pickle.dumps(data))
            return pickle.loads(self.client.recv(2048))
        
        except socket.error as error :
            print("Error msg: ", error)

