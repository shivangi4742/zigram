import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { FilterItem } from '../interfaces/filter-item';
import { ContentItem } from '../interfaces/content-items';

@Injectable({
  providedIn: 'root'
})
export class CocktailService {
  private drinks = "drinks";
  constructor(private http: HttpClient) { }

  getFilterItems(): Observable<Array<FilterItem>> {
    return this.http.get('https://www.thecocktaildb.com/api/json/v1/1/list.php?c=list')
      .pipe(
        map((res: any) => res[this.drinks]),
      );
  }

  getContentItems(drinkCategory: string): Observable<Array<ContentItem>> {
    return this.http.get(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?c=${drinkCategory}`)
      .pipe(
        map((res: any)  =>res[this.drinks]),
      );
  }
}
