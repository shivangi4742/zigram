import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator} from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { concatAll, filter, map, mergeMap, takeUntil, tap } from 'rxjs/operators';
import { CocktailService } from '../services/cocktail.service';
import { StorageService } from '../services/storage.service';
import { ContentData } from '../interfaces/content-data';
import { Observable } from 'rxjs';
import { FilterItem } from '../interfaces/filter-item';
import { FormBuilder, FormGroup } from '@angular/forms';


@Component({
  selector: 'app-cocktails',
  templateUrl: './cocktails.component.html',
  styleUrls: ['./cocktails.component.css']
})
export class CocktailsComponent implements OnInit {
  public cocktails: ContentData[][] = [];
  public currentPage: ContentData[][] | any;

  @ViewChild(MatPaginator) paginator: any= MatPaginator;
  public dataSource: MatTableDataSource<any> = new MatTableDataSource<any>(this.cocktails);
  public paginatorLength: any;
  public paginatorPageIndex: any;
  public filtersForm: FormGroup = this.formBuilder.group({});
  public headingData!: Observable<Array<any>>;
  private onDestroyData: Subject<void> = new Subject<void>();
  constructor(public CocktailService: CocktailService, public storageService: StorageService, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.headingData = this.CocktailService.getFilterItems();
    this.createForm().subscribe();
    console.log(this.cocktails)
  }
  ngAfterViewInit(): void {
    this.getValues().subscribe((categories: any) => {
      this.cocktails = [...this.cocktails, categories];
      this.setPaginatorData();
    });
  }

  ngOnDestroy(): void {
    this.onDestroyData.next();
    this.onDestroyData.complete();
  }

  getValues(): Observable<ContentData[]> {
    return this.storageService.getValue()
    .pipe(
      tap(() => this.cocktails = []),
      tap(() => !!this.paginator ? this.paginator.firstPage() : null),
      filter(formValues => !!formValues),
      map(formValues => Object.entries(formValues)
        .map((el: any) => el[0] = {title: el[0], display: el[1]})
        .filter(category => category.display === true)
      ),
      mergeMap(categories => categories.map(category => this.CocktailService.getContentItems(category.title)
        .pipe(
          map(cocktails => [{...category, data: cocktails}]),
        )
      )),
      concatAll(),
      takeUntil(this.onDestroyData),
    );
  }

  setPaginatorData(): void {
    this.dataSource.paginator = this.paginator;
    this.paginatorLength = this.cocktails.length;
    this.currentPage = this.cocktails.slice(0, 1);
  }

  OnPageChange(event: any): void {
    const paginatorStartIndex = event.pageIndex;
    let paginatorEndIndex = paginatorStartIndex + event.pageSize;
    if (paginatorEndIndex > this.paginatorLength) {
      paginatorEndIndex = this.paginatorLength;
    }
    this.paginatorPageIndex = event.pageIndex;
    this.currentPage = this.cocktails.slice(paginatorStartIndex, paginatorEndIndex);
  }
  
  createForm(): Observable<FilterItem[]> {
    return this.CocktailService.getFilterItems()
    .pipe(
      filter(drinks => !!drinks),
      tap(drinks => drinks.map(drink => this.filtersForm.addControl(drink?.strCategory, this.formBuilder.control(true)))),
      takeUntil(this.onDestroyData),
    );
  }

  submitForm(): void {
    this.storageService.setValue(this.filtersForm.value);
    this.storageService.showSpinner();
  }
}
