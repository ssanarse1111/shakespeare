import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, catchError, debounceTime, distinctUntilChanged, switchMap, takeUntil, throwError } from 'rxjs';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit, OnDestroy {

  users: any[] = [];
  searchSubject: Subject<any> = new Subject();
  destroySubject = new Subject();

  constructor(private http: HttpClient) {
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(data => this.http.get('https://api.github.com/search/users?q=' + data)),
      takeUntil(this.destroySubject)
    ).subscribe((res: any) => {
      this.users = res.items;
    })
  }

  ngOnInit(): void {
    this.getAllUsers();
  }

  ngOnDestroy(): void {
    this.destroySubject.unsubscribe();
    this.searchSubject.unsubscribe();
  }

  getAllUsers() {
    this.http.get('https://api.github.com/users').pipe(
      catchError(this.errorHandling)
    ).subscribe((res: any) => {
      this.users = res;
    });
  }

  errorHandling(error: HttpErrorResponse) {
    return throwError(() => new Error(error.message));
  }

  searchValue(event: any) {
    if (event.target.value.trim()) {
      this.searchSubject.next(event.target.value.trim());
    }
  }

}
