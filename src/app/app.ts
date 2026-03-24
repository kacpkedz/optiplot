import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Wizualizacja } from "./wizualizacja/wizualizacja";

@Component({
  selector: 'app-root',
  imports: [FormsModule, CommonModule, Wizualizacja],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  P: number = 0;
  a: number = 0;
  b: number = 0;
  xOptymalny: number = 0;
  yOptymalny: number = 0;

  wyniki: { nazwa: string; x: number; y: number; K: number; nazwaDrogi?: string; nazwaTani?: string; optymalny?: boolean; kwadrat?: boolean }[] = [];
  wybrany: { nazwa: string; x:number; y: number; K: number } | null = null;

  nazwaDrozszegoMaterialu: string = '';
  nazwaTanszegoMaterialu: string = '';

  pokazKwadrat: boolean = false;

  lewy: boolean = false;
  gora: boolean = true;
  prawy: boolean = false;
  dol: boolean = true;

  iloscDrozszychX: number = 0;
  iloscDrozszychY: number = 0;
  iloscTanszychX: number = 0;
  iloscTanszychY: number = 0;

  constructor() {
    this.zliczajBoki();
  }

  zliczajBoki() {
    this.iloscDrozszychX = 0;
    this.iloscDrozszychY = 0;

    if (this.gora)  this.iloscDrozszychX += 1;
    if (this.dol)   this.iloscDrozszychX += 1;
    if (this.lewy)  this.iloscDrozszychY += 1;
    if (this.prawy) this.iloscDrozszychY += 1;

    this.iloscTanszychX = 2 - this.iloscDrozszychX;
    this.iloscTanszychY = 2 - this.iloscDrozszychY;
  }

  czyPoprawneDane(): boolean {
    return this.P <= 0 || this.a <= 0 || this.b <= 0 || this.a <= this.b;
  }

  oblicz() {
    const A = this.iloscDrozszychX * this.a + this.iloscTanszychX * this.b;
    const B = this.iloscDrozszychY * this.a + this.iloscTanszychY * this.b;

    const xOptymlane = Math.sqrt(B * this.P / A);
    const yOptymalne = Math.sqrt(A * this.P / B);
    const bokKwadratu = Math.sqrt(this.P);

    this.xOptymalny = xOptymlane;
    this.yOptymalny = yOptymalne;

    this.wyniki = [
      { nazwa: '1:3', x: Math.sqrt(this.P * 1/3), y: Math.sqrt(this.P * 3), K: A * Math.sqrt(this.P * 1/3) + B * Math.sqrt(this.P * 3) },
      { nazwa: '1:2', x: Math.sqrt(this.P * 1/2), y: Math.sqrt(this.P * 2), K: A * Math.sqrt(this.P * 1/2) + B * Math.sqrt(this.P * 2) },
      { nazwa: 'Optymalny (prostokąt)', x: xOptymlane, y: yOptymalne, K: A * xOptymlane + B * yOptymalne, optymalny: true, nazwaDrogi: this.nazwaDrozszegoMaterialu, nazwaTani: this.nazwaTanszegoMaterialu },
      { nazwa: '2:1', x: Math.sqrt(this.P * 2), y: Math.sqrt(this.P * 1/2), K: A * Math.sqrt(this.P * 2) + B * Math.sqrt(this.P * 1/2) },
      { nazwa: '3:1', x: Math.sqrt(this.P * 3), y: Math.sqrt(this.P * 1/3), K: A * Math.sqrt(this.P * 3) + B * Math.sqrt(this.P * 1/3) },
    ];

    if (this.pokazKwadrat) {
      this.wyniki.push({
        nazwa: 'Optymalny (kwadrat)', x: bokKwadratu, y: bokKwadratu, K: A * bokKwadratu + B * bokKwadratu, kwadrat: true
      });
    }
  }
}