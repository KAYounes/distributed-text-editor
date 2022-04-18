import pygame
from player import Player
import sys
from network import Network
pygame.init()

win_width = 500
win_hight = 500

win = pygame.display.set_mode((win_width, win_hight))
pygame.display.set_caption("Client Side")

def redraw_window (window, player1, player2) :
    win.fill((255,255,255))
    player1.draw(win)
    player2.draw(win)
    pygame.display.update()


def main () :
    loop = True
    clock = pygame.time.Clock()

    network = Network()
   
    p1 = network.get_object()

    while loop:
        p2 = network.send(p1)
                
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