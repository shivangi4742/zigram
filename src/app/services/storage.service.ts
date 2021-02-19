import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private formValue = new BehaviorSubject<any>(null);
  public isShowSpinner = false;

  constructor() { }
  setValue(data: object): void {
    this.formValue.next(data);
  }

  getValue(): Observable<object> {
    return this.formValue.asObservable();
  }

  public showSpinner(): void {
    this.isShowSpinner = true;
    setTimeout(() => {
      this.isShowSpinner = false;
    }, 2500);
  }
}
