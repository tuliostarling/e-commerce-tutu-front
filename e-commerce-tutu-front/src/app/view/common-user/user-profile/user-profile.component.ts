import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';

import { UserApiService } from '../../../service';
import { UserCreateModel } from '../../../model/user/userCreate';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ShippingService } from '../../../service/shipping/shipping-api.service';

import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { CouponModel, RequestCouponModel } from '../../../model/discount-coupon/coupon';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  @ViewChild('openModalEle') openModalEle: ElementRef;

  formulario: FormGroup;
  formnewpass: FormGroup;
  formCoupon: FormGroup;
  id: number;
  pass: string;
  name: string;
  email: string;
  cep: number;
  cpf: number;
  num: string;
  comp: string;
  state: string;
  city: string;
  street: string;
  neighborhood: string;
  chagepassBool = false;

  update = false;

  decodedCep: string;
  token: any;

  pageArr = [];

  namePageAux = 'Minha conta';

  constructor(
    public apiService: UserApiService,
    public apiServiceCEP: ShippingService,
    private form: FormBuilder,
    public router: Router,
    private acRoute: ActivatedRoute,
    private modalService: NgbModal,
    private toastrService: ToastrService,
    private spinnerService: Ng4LoadingSpinnerService,
    private authService: AuthService
  ) { }

  public rowsUser: UserCreateModel;
  public rowsCoupom: RequestCouponModel;
  public rowsPurchases: any;
  public rowsUsers: any;

  ngOnInit() {
    this.spinnerService.show();
    this.token = this.authService.getTokenData();
    this.id = parseInt(this.acRoute.snapshot.paramMap.get('id'), 10);

    if (this.token != null) {
      this.decodedCep = this.token.cep;
    }

    if (this.decodedCep === null) {
      this.openModalEle.nativeElement.click();
    }

    this.apiService.getListOne(this.id).subscribe((res) => {
      this.rowsUser = res;
      if (res != null) {
        this.name = this.rowsUser[0].name;
        this.email = this.rowsUser[0].email;
        this.cep = this.rowsUser[0].cep;
        this.cpf = this.rowsUser[0].cpf;
        this.num = this.rowsUser[0].num;
        this.comp = this.rowsUser[0].comp;
        this.state = this.rowsUser[0].state;
        this.city = this.rowsUser[0].city;
        this.street = this.rowsUser[0].street;
        this.neighborhood = this.rowsUser[0].neighborhood;
        this.spinnerService.hide();
      }
    });

    this.formulario = this.form.group({
      id: [null],
      name: [null, Validators.required],
      email: [null],
      cpf: [null],
      cep: [null],
      state: [null],
      city: [null],
      street: [null],
      neighborhood: [null],
      num: [null],
      comp: [null]
    });

    this.formnewpass = this.form.group({
      email: [null, Validators.required],
      oldpass: [null, Validators.required],
      newpass: [null, Validators.required]
    });

    this.formCoupon = this.form.group({
      id: [this.id],
      coupon: [null, Validators.required]
    });

    this.getUserCoupon();
    this.getUserPurchases();
    this.makeArrPage();
    this.getAllUsers();
  }

  onSubmit(form) {
    this.spinnerService.show();
    this.attForm();
    this.rowsUser = form.value;

    const validaCPFbool = this.validaCPF(this.rowsUser.cpf);

    if (validaCPFbool === true) {
      this.apiService.update(this.rowsUser).subscribe((res) => {
        if (res === null) { return this.toastrService.error('Erro ao atualizar os dados', 'Erro!'); }

        this.toastrService.success('Dados atualizados!', 'Sucesso!');
        this.update = false;
        this.spinnerService.hide();
        return this.ngOnInit();
      });
    } else {
      return this.toastrService.error('CPF inválido, por favor digite novamente', 'Erro!');
    }
  }

  attForm() {
    this.formulario.patchValue({
      id: this.id,
      email: this.email,
    });
  }

  clickUpdate() {
    this.update = !this.update;
  }

  openModal(content) {
    this.modalService.open(content, { centered: true });
  }

  finishRegister() {
    this.router.navigateByUrl('/finish_register/' + this.token.id);
  }

  updatePass(form) {
    this.formnewpass.patchValue({ email: this.email });

    this.apiService.changePass(form.value).subscribe((res) => {
      if (res == null) { return this.toastrService.error('Erro ao atualizar senha.', 'Erro!'); }

      this.toastrService.success('Senha atualizada!', 'Sucesso!');
      this.chagepassBool = false;
    });
  }

  change_pass() {
    this.chagepassBool = !this.chagepassBool;
  }

  onblur(evt: any) {
    const cep = evt.target.value;

    if (this.cep !== cep) {
      this.apiServiceCEP.getCepInfo(cep).subscribe((res) => {
        this.state = res.adress.state;
        this.city = res.adress.city;
        this.street = res.adress.street;
        this.neighborhood = res.adress.neighborhood;
        this.num = '';
        this.comp = '';
      });
    }
  }

  validaCPF(cpf: any) {
    let numeros, digitos, soma, i, resultado, digitos_iguais;
    digitos_iguais = 1;

    if (cpf !== null) {
      cpf = cpf.replace(/[^a-zA-Z0-9]/g, '');

      if (cpf.length < 11) { return false; }
      for (i = 0; i < cpf.length - 1; i++) {
        if (cpf.charAt(i) !== cpf.charAt(i + 1)) {
          digitos_iguais = 0;
          break;
        }
      }
      if (!digitos_iguais) {
        numeros = cpf.substring(0, 9);
        digitos = cpf.substring(9);
        soma = 0;
        for (i = 10; i > 1; i--) {
          soma += numeros.charAt(10 - i) * i;
        }

        resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado.toString() !== digitos.charAt(0)) {
          return false;
        }

        numeros = cpf.substring(0, 10);
        soma = 0;
        for (i = 11; i > 1; i--) {
          soma += numeros.charAt(11 - i) * i;
        }

        resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado.toString() !== digitos.charAt(1)) {
          return false;
        }

        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }

  makeArrPage() {
    this.pageArr = [];

    this.pageArr.push(
      {
        active: 'active',
        name: 'Minha conta'
      },
      {
        active: '',
        name: 'Cupons'
      },
      {
        active: '',
        name: 'Minhas compras'
      },
    );

    if (this.token.admin === true) {
      this.pageArr.push(
        {
          active: '',
          name: 'Usuários'
        }
      );
    }
  }

  changePage(namePage: string) {
    if (namePage === 'Minha conta') {
      this.pageArr[0].active = 'active';
      this.pageArr[1].active = '';
      this.pageArr[2].active = '';
      this.pageArr[3].active = '';
      this.namePageAux = 'Minha conta';
    } else if (namePage === 'Cupons') {
      this.pageArr[0].active = '';
      this.pageArr[1].active = 'active';
      this.pageArr[2].active = '';
      this.pageArr[3].active = '';
      this.namePageAux = 'Cupons';
    } else if (namePage === 'Minhas compras') {
      this.pageArr[0].active = '';
      this.pageArr[1].active = '';
      this.pageArr[2].active = 'active';
      this.pageArr[3].active = '';
      this.namePageAux = 'Minhas compras';
    } else {
      this.pageArr[0].active = '';
      this.pageArr[1].active = '';
      this.pageArr[2].active = '';
      this.pageArr[3].active = 'active';
      this.namePageAux = 'Usuários';
    }
  }

  getUserCoupon() {
    this.apiService.getUserCoupon(this.id).subscribe((res) => {
      this.rowsCoupom = res;
    });
  }

  getUserPurchases() {
    this.apiService.getUserPurchases(this.id).subscribe((res) => {
      if (res != null) {
        this.rowsPurchases = res;
      }
    });
  }

  getOnePurchase(id: number) {
    this.router.navigateByUrl('order_details/' + id);
  }

  insertUserCoupon(form) {
    this.apiService.verifyCoupon({ coupon: form.value.coupon }).subscribe((data) => {
      if (data !== null) {
        this.apiService.insertUserCoupon(form.value).subscribe((res) => {
          if (res == null) { return this.toastrService.error('Erro ao inserir cupom.', 'Erro!'); }

          this.toastrService.success('Cupom inserido!', 'Sucesso!');
          return this.ngOnInit();
        });
      } else {
        this.toastrService.error('Cupom inválido', 'Erro!');
      }
    });
  }

  getAllUsers() {
    this.apiService.getAll().subscribe((res) => {
      if (res != null) {
        this.rowsUsers = res;
      }
    });
  }

  updateUserToADM(userID: number) {
    const userIDObj = { id: userID };

    this.apiService.updateUserToADM(userIDObj).subscribe((res) => {
      if (res != null) {
        this.ngOnInit();
        return this.toastrService.success('Usuário tornado ADM!', 'Sucesso!');
      }

      return this.toastrService.error('Não foi possível tornar o usuário ADM', 'Erro!');
    });
  }

  updateUserToNormal(userID: number) {
    const userIDObj = { id: userID };

    this.apiService.updateUserToNormal(userIDObj).subscribe((res) => {
      if (res != null) {
        this.ngOnInit();
        return this.toastrService.success('Usuário tornado comum novamente!', 'Sucesso!');
      }

      return this.toastrService.error('Não foi possível tornar o usuário comum', 'Erro!');
    });
  }
}
