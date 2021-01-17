int ldrValue;
void setup(){
  Serial.begin(9600);
}

void loop()  {
  // read ldr value
  ldrValue = analogRead(A0);
  
  /*
    if the light is detected, print light value and delay for 5 seconds
    if light in not detected print light value without delay
  
  */
  if(ldrValue > 10){
      Serial.println(ldrValue);
      delay(5000); 
  } else {
      Serial.println(ldrValue); 
      delay(100); 
  }
}
