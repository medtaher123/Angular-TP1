import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  logger(something: any) {
    console.log('From Logger Service :');
    console.log(something);
  }

  error(message: string, error?: any) {
    console.error('From Logger Service - ERROR: ' + message);
    if (error) {
      console.error(error);
    }
  }
}
