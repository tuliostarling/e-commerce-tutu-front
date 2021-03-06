import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators,
  AbstractControl
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';

import { CategoryModel } from '../../../../model/category/category';
import { CategoryService } from '../../../../service/category/category-api.service';

@Component({
  selector: 'app-category-register',
  templateUrl: './category-register.component.html',
  styleUrls: ['./category-register.component.css']
})
export class CategoryRegisterComponent implements OnInit {

  formulario: FormGroup;
  createCategoryModel: CategoryModel;
  idCategory: number;
  mode: string;
  rowsCategory: CategoryModel;
  imagesToUpload: any;
  LoadCurrentImg: boolean;
  imgSRC: string;


  constructor(
    private apiService: CategoryService,
    private form: FormBuilder,
    public acRoute: ActivatedRoute,
    private router: Router,
    private toastrService: ToastrService,
    private spinnerService: Ng4LoadingSpinnerService
  ) { }

  ngOnInit() {
    this.spinnerService.show();
    this.acRoute.params
      .subscribe((params: any) => {
        if (params.hasOwnProperty('id')) {
          this.idCategory = params.id;
          this.mode = 'Editar';
          this.LoadCurrentImg = true;
          this.recoverRegistry();
        } else {
          this.mode = 'Cadastrar';
          this.LoadCurrentImg = false;
        }
      });

    this.formulario = this.form.group({
      category: [null, Validators.required],
      location_aws: [null, Validators.required],
      key_aws: [null, Validators.required]
    });
  }

  recoverRegistry() {
    if (this.idCategory !== undefined) {
      this.apiService.getListOne(this.idCategory).subscribe((data) => {
        if (data) {
          this.imgSRC = data[0].location_aws;
          this.formulario = this.form.group({
            id: [data[0].id],
            category: [data[0].category, Validators.required],
            location_aws: [data[0].location_aws, Validators.required],
            key_aws: [data[0].key_aws, Validators.required]
          });
          this.spinnerService.hide();
        } else {
          this.spinnerService.hide();
          this.toastrService.error('Erro ao carregar dados', 'Erro!');
        }
      });
    }
  }

  handleFileSelect(fileInput: any) {
    this.imagesToUpload = Array.from(fileInput.target.files);

  }

  trackByFn(index) {
    return index;
  }

  removeFile(indexe, item) {
    this.imagesToUpload.splice(indexe, 1);
  }

  navToListCat() {
    this.router.navigateByUrl('category_list');
  }

  onSubmit(form) {
    this.spinnerService.show();
    this.createCategoryModel = form.value;
    const formImage = new FormData();
    const files: Array<File> = this.imagesToUpload;

    for (let i = 0; i < files.length; i++) {
      formImage.append('file', files[i]);
    }

    if (this.idCategory === undefined) {
      if (files.length > 1) {
        this.spinnerService.hide();
        return this.toastrService.warning('O Banner aceita apenas uma imagem.', 'Anteção!');
      }

      this.insertCategoryImage(formImage).then(resImg => {
        if (resImg == null) {
          this.spinnerService.hide();
          return this.toastrService.error('Erro ao cadastrar imagem', 'Erro!');
        }
        this.createCategoryModel.location_aws = resImg[0].Location;
        this.createCategoryModel.key_aws = resImg[0].Key;

        this.apiService.create(this.createCategoryModel).subscribe((res) => {
          if (res != null) {
            this.toastrService.success('Categoria cadastrada!', 'Sucesso!');
            this.spinnerService.hide();
            return this.navToListCat();
          }
          this.toastrService.error('Erro ao cadastrar categoria', 'Erro!');
        });
      });

    } else {

      if (formImage != null) {
        if (files.length > 1) {
          this.spinnerService.hide();
          return this.toastrService.warning('O Banner aceita apenas uma imagem.', 'Anteção!');
        }

        formImage.append('key_aws', this.createCategoryModel.key_aws);
        this.updateCategoryImage(formImage).then(resImg => {
          if (resImg == null) {
            this.spinnerService.hide();
            return this.toastrService.error('Erro ao atualizar imagem', 'Erro!');
          }
          this.createCategoryModel.location_aws = resImg[0].Location;
          this.createCategoryModel.key_aws = resImg[0].Key;

          this.apiService.update(this.createCategoryModel, this.idCategory).subscribe((res) => {
            if (res == null) {
              this.spinnerService.hide();
              return this.toastrService.error('Erro ao atualizar a categoria', 'Erro!');
            }
            this.spinnerService.hide();
            return this.navToListCat();
          });
        });

      } else {
        this.apiService.update(this.createCategoryModel, this.idCategory).subscribe((res) => {
          if (res == null) {
            this.spinnerService.hide();
            return this.toastrService.error('Erro ao atualizar a categoria', 'Erro!');
          }
          this.spinnerService.hide();
          return this.navToListCat();
        });
      }

    }
  }

  insertCategoryImage<T>(formImage: FormData) {
    return new Promise((resolve, reject) => {
      this.apiService.addImage(formImage)
        .subscribe(res => {
          if (res == null) { return reject(res); }
          resolve(res);
        });
    });
  }

  updateCategoryImage<T>(formImage: FormData) {
    return new Promise((resolve, reject) => {
      this.apiService.putImage(formImage)
        .subscribe(res => {
          if (res == null) { return reject(res); }
          resolve(res);
        });
    });
  }

  list() {
    this.router.navigateByUrl('/category_list');
  }
}
