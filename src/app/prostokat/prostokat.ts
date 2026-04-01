import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Wizualizacja } from '../wizualizacja/wizualizacja';

@Component({
  selector: 'app-prostokat',
  imports: [FormsModule, CommonModule, Wizualizacja],
  templateUrl: './prostokat.html',
  styleUrl: './prostokat.css',
})
export class Prostokat {

  P: number = 0;
  a: number = 0;
  b: number = 0;
  xOptymalny: number = 0;
  yOptymalny: number = 0;

  wyniki: any[] = [];

  nazwaDrozszegoMaterialu: string = '';
  nazwaTanszegoMaterialu: string = '';

  pokazKwadrat: boolean = false;

  lewy: boolean = false;
  gora: boolean = true;
  prawy: boolean = false;
  dol: boolean = true;

  iloscDrozszychX = 0;
  iloscDrozszychY = 0;
  iloscTanszychX = 0;
  iloscTanszychY = 0;

  constructor() {
    this.zliczajBoki();
  }

  zliczajBoki() {
    this.iloscDrozszychX = 0;
    this.iloscDrozszychY = 0;

    if (this.gora) this.iloscDrozszychX++;
    if (this.dol) this.iloscDrozszychX++;
    if (this.lewy) this.iloscDrozszychY++;
    if (this.prawy) this.iloscDrozszychY++;

    this.iloscTanszychX = 2 - this.iloscDrozszychX;
    this.iloscTanszychY = 2 - this.iloscDrozszychY;
  }

  czyPoprawneDane(): boolean {
    return this.P <= 0 || this.a <= 0 || this.b <= 0 || this.a <= this.b;
  }

  oblicz() {
    const A = this.iloscDrozszychX * this.a + this.iloscTanszychX * this.b;
    const B = this.iloscDrozszychY * this.a + this.iloscTanszychY * this.b;

    const x = Math.sqrt(B * this.P / A);
    const y = Math.sqrt(A * this.P / B);

    this.xOptymalny = x;
    this.yOptymalny = y;

    this.wyniki = [
      { nazwa: 'Optymalny', x, y, K: A * x + B * y, optymalny: true }
    ];

    if (this.pokazKwadrat) {
      const s = Math.sqrt(this.P);
      this.wyniki.push({ nazwa: 'Kwadrat', x: s, y: s, K: A*s + B*s });
    }
  }
}
