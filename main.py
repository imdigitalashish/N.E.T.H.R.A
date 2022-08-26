

from asyncore import write
from datetime import datetime
from random import randrange
import eel
import csv
import ctypes

user32 = ctypes.windll.user32
screensize = user32.GetSystemMetrics(78), user32.GetSystemMetrics(79)

print(screensize)


class MainApplication():
    def __init__(self):
        self.studentsData = self.returnJsonData("records/studentrecords.csv")
        self.attendanceRecords = self.returnJsonData("records/attendancerecords.csv")
        print("started")
        print(self.studentsData)
        print(self.attendanceRecords)

    def returnJsonData(self, csvFilePath):
     
        data = {}
        
        with open(csvFilePath, encoding='utf-8') as csvf:
            csvReader = csv.DictReader(csvf)
            

            for rows in csvReader:

                
    
                key = rows['admin_no']
                data[key] = rows
                # print(rows)
    

        return data

    def addThisToCSV(self, adminNumber):
        data = self.studentsData[adminNumber]

        if(adminNumber in self.attendanceRecords.keys()):
            return data
        f = open("records/attendancerecords.csv", "a+")
        writer = csv.writer(f)
        t = datetime.now()
        arrived_time = t.strftime('%m/%d/%Y %H:%M:%S')
        data = [randrange(1,90), data["admin_no"], data["class"], data["roll_no"], data["name"], arrived_time]

        writer.writerow(data)
        f.close()

        self.attendanceRecords = self.returnJsonData("records/attendancerecords.csv")
        print(self.attendanceRecords)
        return data
        
    


application = MainApplication()

eel.init('web')

@eel.expose
def addThisFaceToCSV(admissionNumber):
    temp = application.addThisToCSV(admissionNumber)
    return temp

eel.start("index.html", size=screensize)
