import pygame
from player import Player
import sys
from network import Network
pygame.init()

win_width = 500
win_hight = 500

win = pygame.display.set_mode((win_width, win_hight))
pygame.display.set_caption("Client Side")

client_number = 0


def str_to_int(position) : # "(x, y)"
    position = position.split(",")
    return int(position[0]), int(position[1])

def int_to_str(position):
    return str(position[0]) + ',' + str(position[1])

def redraw_window (window, player1, player2) :
    win.fill((255,255,255))
    player1.draw(win)
    player2.draw(win)
    pygame.display.update()


def main () :
    loop = True
    clock = pygame.time.Clock()

    network = Network()
    start_position = str_to_int(network.get_position())
    
    p1 = Player(start_position[0], start_position[1], 100, 100, (255, 0, 0)) # p1 is blue

    p2  = Player(0, 0, 100, 100, (0, 0, 255)) # p2 is red

    while loop:
        p2_position = str_to_int(network.send(int_to_str((p1.x, p1.y)))) # send the position of the other player

        p2.x = p2_position[0]
        p2.y = p2_position[1]

        p2.update_rect()
        
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                loop == False
                pygame.quit()

        p1.move()
        redraw_window(win, p1, p2)
        # redraw_window(win, p2)
        clock.tick(60)
    
    sys.exit()

main()