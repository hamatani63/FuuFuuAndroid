int sensorValue; 
 
void setup() 
{ 
  Serial.begin(9600);
  pinMode(2, OUTPUT);
} 
 
void loop() 
{ 
  
  //write
  sensorValue = analogRead(A0);
  Serial.print("s"); 
  Serial.print(sensorValue, DEC);
  Serial.print("\r"); 
  delay(100);
  
  //read
  int input;
  input = Serial.read();
  
  // rotate the fan
  if(input > 0){
    digitalWrite(MOTOR_PIN, HIGH);
    delay(100);
    digitalWrite(MOTOR_PIN, LOW);
    delay(100);
  }
  delay(100);
 
} 
