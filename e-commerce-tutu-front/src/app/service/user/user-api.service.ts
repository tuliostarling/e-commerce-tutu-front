import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AppSettings } from '../../app.settings';
import { UserLoginModel } from '../../model/user/userLogin';
import { UserCreateModel } from '../../model/user/userCreate';

@Injectable()
export class UserApiService {

    API_URL: string = AppSettings.API_ENDPOINT + 'user/';
    API_AUTH_URL: string = AppSettings.API_ENDPOINT + 'auth/';

    constructor(
        private http: HttpClient
    ) { }

    loginUser(dadosForm: UserLoginModel) {
        return this.http.post<UserLoginModel>(this.API_AUTH_URL + 'authlogin/', dadosForm);
    }

    createUser(dadosForm: UserCreateModel) {
        return this.http.post<UserCreateModel>(this.API_URL + 'add/', dadosForm);
    }
}
