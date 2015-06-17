#include <Adafruit_NeoPixel.h>
#include <avr/power.h>

#define LED_PIN 3
#define MOTOR_PIN 10

Adafruit_NeoPixel strip = Adafruit_NeoPixel(1, LED_PIN, NEO_GRB + NEO_KHZ800);
int incomingByte = 0;

// control a fan with PWM.
// pwmWidth * pwmRepeatTimes make almost 1 second.
int pwmRepeatTimes = 20000;
int pwmWidth = 36;
int pwmOffset = 0;

void setup() {
  // setup a LED (neopixel)
  strip.begin();
  strip.show();
  // moter driver pin
  pinMode(MOTOR_PIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  
  // rotate the fan
  if(Serial.available() > 0){
    incomingByte = Serial.read();
    
    // control the LED
    strip.setPixelColor(0, Wheel(map(incomingByte, 0, 255, 170, 255)));
    strip.show();

    // control the Fan
    // Notice: delayMicroseconds(0) makes huge delay, which is 16000usec. 
    // We have to use delayMicroseconds(x+1).
    int pwmStrength = map(incomingByte, 0, 255, pwmOffset, pwmWidth);    
    for (int i=0; i<pwmRepeatTimes; i++){
      digitalWrite(MOTOR_PIN, HIGH);
      delayMicroseconds(pwmStrength+1);
      digitalWrite(MOTOR_PIN, LOW);
      delayMicroseconds(pwmWidth-pwmStrength+1);
    }
    
    // say what you got:
    //Serial.print("I received: ");
    //Serial.println(incomingByte, DEC);
    
    delay(10);
  }
  
  strip.setPixelColor(0, 0);
  strip.show();

}


// Input a value 0 to 255 to get a color value.
// The colours are a transition r - g - b - back to r.
uint32_t Wheel(byte WheelPos) {
  WheelPos = 255 - WheelPos;
  if(WheelPos < 85) {
   return strip.Color(255 - WheelPos * 3, 0, WheelPos * 3);
  } else if(WheelPos < 170) {
    WheelPos -= 85;
   return strip.Color(0, WheelPos * 3, 255 - WheelPos * 3);
  } else {
   WheelPos -= 170;
   return strip.Color(WheelPos * 3, 255 - WheelPos * 3, 0);
  }
}
