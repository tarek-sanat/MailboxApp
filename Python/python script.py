import serial
import time
import requests
import json
import sys
import mysql.connector
from datetime import datetime
import geocoder

#Location function: gets the lattiture and longitude
#Makes API call to get the location

def location():
    location = geocoder.ip('me')
    KEY = '' # YOUR OWN MAPQUESTAPI KEY
    response = requests.get('http://www.mapquestapi.com/geocoding/v1/reverse?key=' + KEY + '&location=' +str(location.lat) +',' + str(location.lng) + '&includeRoadMetadata=true&includeNearestIntersection=true')
    
    return response.json()['results'][0]['locations'][0]['adminArea5']
    




count = 0

ser = serial.Serial('/dev/ttyACM0', 9600)    #Establish connection with arduino on port 9600

#MYSQL DB connect to the db
# USE YOUR DATABASE INFORMATION
mydb = mysql.connector.connect(
    host= '',
    user= '',
    password= '',
    database= ''
    )

location = location()                 #Get location 


while True:
    if( ser.inWaiting() > 0):
        
        line = ser.readline().decode().strip()
        print(count)
        
        if(int(line) > 10 and count == 0):
#             THIS PART OF CODE IS USED WHEN SOMEONE OPENS THE MAIL BOX
#             PUSH TIME AND INFORMATION TO DATABASE
            
            now = datetime.now()
            date = now.strftime('%Y-%m-%d')       #Get current Date
            time = now.strftime('%H:%M:%S')       #Get current Time
            
            data = ('newUser', location, date, time)                                       #Setup the data we are about to send
            insertStmt =('insert into data(username,location,date,time) values(%s, %s, %s, %s)')     #SQL query 
            
            mycursor = mydb.cursor()
            mycursor.execute(insertStmt, data)                                        #Execute the query with the data
            mydb.commit()
            count = count + 1
            
        elif(int(line) > 10 and count == 1):
#             THIS WILL HAPPEN WHEN WE OPEN THE MAILBOX TO GET THE MAIL 
            count = 0
            
            
          
        
