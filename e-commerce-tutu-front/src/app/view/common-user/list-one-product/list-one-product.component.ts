import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

import { ProductService } from '../../../service';
import { CommentService } from '../../../service/comment/comment-api.service';
import { ProductModel, SubProductModel } from '../../../model/product/product';
import { CommentModel } from '../../../model/comment/comment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-list-one-product',
  templateUrl: './list-one-product.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./list-one-product.component.css']
})
export class ListOneProductComponent implements OnInit {

  idProduct: number;
  rowsProduct: ProductModel;
  rowsSubProduct: any;
  productName: string;
  productPrice: number;
  productColor: string;
  productSize: any;
  productDescription: string;
  ArrImg = [];
  imgIndex: number;
  changeImgBool = false;
  installments: number;
  division: number;

  rowsComment: CommentModel;
  ratingStar: number;
  commentForm: CommentModel;
  formulario: FormGroup;
  showCommentBox = false;
  decodedToken: any;

  constructor(
    private router: Router,
    private apiService: ProductService,
    private commentService: CommentService,
    private form: FormBuilder,
    private acRoute: ActivatedRoute,
    private modalService: NgbModal,
  ) { }

  ngOnInit() {
    this.idProduct = parseInt(this.acRoute.snapshot.paramMap.get('id'), 10);

    this.formulario = this.form.group({
      id_user: [null, Validators.required],
      id_subproduct: [null, Validators.required],
      comment: [null, Validators.required],
      rating: [null, Validators.required]
    });

    this.getProducts();
    this.getComments();
  }

  getProducts() {
    this.apiService.getOne(this.idProduct).subscribe(res => {
      if (res != null) {
        this.rowsProduct = res;
        this.rowsSubProduct = res;

        for (const i of Object.keys(this.rowsSubProduct.location_aws)) {
          this.ArrImg.push({ index: i, img: this.rowsSubProduct.location_aws[i] });
          // console.log(this.ArrImg);
        }

        this.productName = this.rowsProduct.name;
        this.productPrice = this.rowsSubProduct.price;
        this.productColor = this.rowsSubProduct.color;
        this.productDescription = this.rowsProduct.description;
        this.productSize = this.rowsSubProduct.size;

        if (this.productPrice >= 80 && this.productPrice < 140) {
          this.installments = 2;
          this.division = Math.round(this.productPrice / this.installments);
        } else if (this.productPrice >= 140 && this.productPrice < 300) {
          this.installments = 3;
          this.division = Math.round(this.productPrice / this.installments);
        } else if (this.productPrice >= 300) {
          this.installments = 4;
          this.division = Math.round(this.productPrice / this.installments);
        } else {
          this.installments = 1;
        }
      }
    });
  }

  getComments() {
    this.commentService.getList(this.idProduct).subscribe((res) => {
      if (res) { this.rowsComment = res; }
      console.log(this.rowsComment);
    });
  }

  onSubmit(form: FormGroup) {
    this.getToken();

    this.formulario.get('id_user').setValue(this.decodedToken.id);
    this.formulario.get('id_subproduct').setValue(this.idProduct);
    this.formulario.get('rating').setValue(3);
    this.commentForm = form.value;
    this.commentService.create(this.commentForm).subscribe((res) => {
      if (res) {
        return alert('Comentario inserido com sucesso');
      } else { return alert('Erro ao inserir comentario'); }
    });
  }

  getToken() {
    const t = localStorage.getItem('token');

    if (t != null) {
      this.decodedToken = this.jwtDecode(t);
    }
  }

  jwtDecode(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
  }

  changeImg(index: number) {
    this.imgIndex = index;
    this.changeImgBool = true;
  }

  showBox() {
    if (this.showCommentBox === true) {
      this.showCommentBox = false;
    } else { this.showCommentBox = true; }
  }

  cart() {
    this.router.navigateByUrl('/cart');
  }

  productList() {
    this.router.navigateByUrl('/category_list/4/0');
  }

  openModal(content) {
    this.modalService.open(content, { centered: true });
  }
}
