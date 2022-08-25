

import eel

import ctypes
user32 = ctypes.windll.user32
screensize = user32.GetSystemMetrics(78), user32.GetSystemMetrics(79)

print(screensize)

eel.init('web')

@eel.expose
def returnResponse():
    return "hello World"


@eel.expose
def addThisFaceToCSV(name):
    print(name)
    return name

eel.start("index.html", size=screensize)
