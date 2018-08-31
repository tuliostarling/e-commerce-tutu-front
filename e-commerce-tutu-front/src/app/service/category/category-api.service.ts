import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AppSettings } from '../../app.settings';
import { CategoryModel } from '../../model/category/category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  API_URL: string = AppSettings.API_ENDPOINT + 'category/';

  constructor(
    private http: HttpClient
  ) { }

  getListAll() {
    return this.http.get<CategoryModel>(this.API_URL + 'listall/');
  }
}