import http.server
import socketserver
import asyncio
import datetime
import websockets
import serial
import sys
from time import sleep

'''Automatically find USB Serial Port
jodalyst 9/2017
'''
import serial.tools.list_ports

PORT = 6306  #needs to be lined up with port specified in file

PREFERENCE_FILE = ".preference"
DEVID = 5824 #default to Teensy 3.2

if len(sys.argv)==2:
    if sys.argv[1] == "-d":
        print(
"""Choose and Enter the number of the Microcontroller you're using:
(0): Teensy 3.2
(1): Arduino Uno
(2): ESP8266 D1 Mini Pro
(3): ESP32 Dev Module (Si Labs Dev)
""")
        choice = input("")
        if float(choice) not in [0,1,2,3]:
            print("invalid device chosen. Switching to default")
        else:
            f = open(PREFERENCE_FILE,"w")
            f.write(choice)
            f.close()
try:
    f = open(PREFERENCE_FILE, "r")
    val = float(f.read())
    f.close()
    if val == 0:
        print("Ah running a Teensy. Good Taste.")
        DEVID = 5824
    elif val==1:
        print("Ah running a Uno. Good Taste.")
        DEVID = 10755
    elif val==2:
        print("Ah running a ESP8266 D1 Mini. Good Taste.")
        DEVID = 6790
    elif val == 3:
        print("Ah running an ESP32. Good Taste.")
        DEVID = 4292
    else:
        print("Invalid Preference File. Rerun with -d argument. Exiting")
        sys.exit()
except IOError:
    print("Invalid Preference File. Rerun with -d argument. Exiting")
    sys.exit()

# VIDs for various MCU dev boards
#Arduino Uno: 10755
#ESP8266: 6790
#ESP32: 4292
#Teensy: 5824

def get_usb_port():
    usb_port = list(serial.tools.list_ports.grep("USB-Serial Controller"))
    if len(usb_port) == 1:
        print("Automatically found USB-Serial Controller: {}".format(usb_port[0].description))
        return usb_port[0].device
    else:
        ports = list(serial.tools.list_ports.comports())
        port_dict = {i:[ports[i],ports[i].vid] for i in range(len(ports))}
        usb_id=None
        for p in port_dict:
            print("{}:   {} (Vendor ID: {})".format(p,port_dict[p][0],port_dict[p][1]))
            print(port_dict[p][1],DEVID)
            if port_dict[p][1]==DEVID: #for Teensy (or one type of Teensy anyways...seems to have changed)
                usb_id = p
        if usb_id== None:
            return False
        else:
            print("Found it")
            print("USB-Serial Controller: Device {}".format(p))
            return port_dict[usb_id][0].device

#use the one below later
def get_usb_ports():
    usb_ports = list(serial.tools.list_ports.grep(""))
    print(usb_ports)
    if len(usb_ports) == 1:
        print("Automatically found USB-Serial Controller: {}".format(usb_ports[0].description))
        return usb_ports[0].device
    else:
        ports = list(serial.tools.list_ports.comports())
        port_dict = {i:[ports[i],ports[i].vid] for i in range(len(ports))}
        usb_id=None
        for p in port_dict:
            print("{}:   {} (Vendor ID: {})".format(p,port_dict[p][0],port_dict[p][1]))
        return port_dict


serial_connected = False
comm_buffer = b""  #messages start with \f and end with \n.

async def connect_serial():
    global ser 
    global serial_connected     
    s = get_usb_port()
    print("USB Port: "+str(s))
    baud = 115200
    if s:
        ser = serial.Serial(port = s, 
            baudrate=115200, 
            parity=serial.PARITY_NONE, 
            stopbits=serial.STOPBITS_ONE, 
            bytesize=serial.EIGHTBITS,
            timeout=0.01) #auto-connects already I guess?
        print(ser)
        print("Serial Connected!")
        if ser.isOpen():
             #print(ser.name + ' is open...')
             serial_connected = True
             return True
    return False

ser = connect_serial()

async def send_down(message):
    global serial_connected
    if not serial_connected:
        await connect_serial()
    try:
        ser.write(message.encode('ascii'))
    except Exception as e:
        print("failing on write")
        ser.close()
        serial_connected = False

async def downlink(websocket):
    while True:
        message = await websocket.recv()
        await send_down(message)

async def uplink(websocket):
    global comm_buffer
    global serial_connected
    while True:
        if not serial_connected:
            print("c");
            await connect_serial()
        try:
            data = ser.read(100) #Larger packets improve efficiency.
            await asyncio.sleep(0.001) #Needed so page->cpu messages go.
        except Exception as e:
            print("failing on read")
            ser.close()
            serial_connected = False

        try:
            # if data != b'':
            #     print(data)
            await websocket.send(data)
        except Exception as e:
            #print(e)
            break
        
async def handler(websocket, path):
    global serial_connected
    if not serial_connected:
        await connect_serial()
    #asyncio.gather(uplink(websocket),downlink(websocket))
    page2mcu = asyncio.ensure_future(downlink(websocket))
    mcu2page = asyncio.ensure_future(uplink(websocket))
    done, pending = await asyncio.wait([page2mcu,mcu2page],return_when=asyncio.FIRST_COMPLETED)
    for task in pending:
        task.cancel()
try:
    server = websockets.serve(handler, "127.0.0.1", PORT)
    asyncio.get_event_loop().run_until_complete(server)
    asyncio.get_event_loop().run_forever()
except KeyboardInterrupt:
    print('\nCtrl-C')
finally:
    server.close()
    asyncio.get_event_loop.close()




'''
serial_connected = False
comm_buffer = b""  #l
pack_count = 0

async def connect_serial():
    global ser 
    global serial_connected     
    s = get_usb_port()
    print(s)
    baud = 115200
    if s:
        ser = serial.Serial(port = s, 
            baudrate=115200, 
            parity=serial.PARITY_NONE, 
            stopbits=serial.STOPBITS_ONE, 
            bytesize=serial.EIGHTBITS,
            timeout=0.01) #auto-connects already I guess?
        print(ser)
        print("Serial Connected!")
        if ser.isOpen():
             #print(ser.name + ' is open...')
             serial_connected = True
             return True
    return False

ser = connect_serial()

async def send_down(message):
    global serial_connected
    if not serial_connected:
        await connect_serial()
    try:
        ser.write(message.encode('ascii'))
    except Exception as e:
        print("failing on write")
        ser.close()
        serial_connected = False

async def downlink(websocket):
    while True:
        message = await websocket.recv()
        await send_down(message)



async def uplink(websocket):
    global comm_buffer
    global serial_connected
    global pack_count
    while True:
        if not serial_connected:
            await connect_serial()
        try:
            data = ser.read(5000)#.decode("ascii")
            comm_buffer+=data
        except Exception as e:
            print("failing on read")
            ser.close()
            serial_connected = False
        try:
            while True:
                start_loc = comm_buffer.find(b"\f")
                if start_loc >= 0:
                    comm_buffer = comm_buffer[start_loc:]
                    end_loc = comm_buffer.find(b"\n")
                    if comm_buffer[1]==66 and end_loc>1:
                        pack_count = 0
                        pack_count +=4 if comm_buffer[2]==b"P" or comm_buffer[2]=="N" else 0
                        pack_count += 4*comm_buffer[0:end_loc].count(b"\rP\r")
                        pack_count += 4*comm_buffer[0:end_loc].count(b"\rN\r")
                        #comm_buffer[1]=byte(66)
                    elif pack_count !=0 and end_loc != pack_count+2:
                        if len(comm_buffer)>pack_count+2:
                            end_loc = pack_count+2
                        else:
                            break
                else:
                    break
                if end_loc >= 1: #full frame!
                    to_send = comm_buffer[1:end_loc]
                    await websocket.send(to_send)
                    comm_buffer =  comm_buffer[end_loc:]
                else:
                    break
        except Exception as e:
            #print(e)
            break
        await asyncio.sleep(0.001) 


async def handler(websocket, path):
    global serial_connected
    if not serial_connected:
        await connect_serial()
    page2mcu = asyncio.ensure_future(downlink(websocket))
    mcu2page = asyncio.ensure_future(uplink(websocket))
    done, pending = await asyncio.wait([page2mcu,mcu2page],return_when=asyncio.FIRST_COMPLETED)
    for task in pending:
        task.cancel()
try:
    server = websockets.serve(handler, "127.0.0.1", PORT)
    asyncio.get_event_loop().run_until_complete(server)
    asyncio.get_event_loop().run_forever()
except KeyboardInterrupt:
    print('\nCtrl-C')
finally:
    server.close()
    asyncio.get_event_loop.close()
'''
	
