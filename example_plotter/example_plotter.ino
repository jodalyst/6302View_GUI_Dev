
/* For this demo, make sure the `#define S302_SERIAL` macro
   is chosen in the library. This demo should compile on the Teensy,
   ESP32, and ESP8266. */

#include "Six302.h"

// microseconds
#define STEP_TIME 10000
#define REPORT_TIME 50005

CommManager cm(STEP_TIME, REPORT_TIME);

float input;
float input2;
float output;
float output2;

void setup() {
   /* Add modules */
   Serial.begin(115200);
   cm.addSlider(&input, "Input", -5, 5, 0.1);
   cm.addSlider(&input2, "Input", -5, 5, 0.1,1);
   cm.addPlot(&output, "Output", -1, 30,40);
   cm.addPlot(&output2, "Output2", -1, 30,40);

   /* Ready to communicate over serial */
   //cm.connect(&Serial, 115200);
   cm.connect("Cat_316", "Comcastsucks99..");
}

void loop() {
   output = input * input+1;
   output2 = input2+2;
   cm.step();
}
