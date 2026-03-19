import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [FormsModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  P: number = 0;
  a: number = 0;
  b: number = 0;

  wyniki: { nazwa: string; x: number; y: number; K: number; nazwaDrogi?: string; nazwaTani?: string; optymalny?: boolean; kwadrat?: boolean }[] = [];
  wybrany: { nazwa: string; x:number; y: number; K: number } | null = null;

  nazwaDrozszegoMaterialu: string = '';
  nazwaTanszegoMaterialu: string = '';

  pokazKwadrat: boolean = false;

  czyPoprawneDane(): boolean {
    return this.P <= 0 || this.a <= 0 || this.b <= 0 || this.a <= this.b;
  }

  oblicz() {
    const xOptymlane = Math.sqrt(this.b * this.P / this.a);
    const yOptymalne = Math.sqrt(this.a * this.P / this.b);

    const bokKwadratu = Math.sqrt(this.P);

    this.wyniki = [
      { nazwa: '1:3', x: Math.sqrt(this.P * 1/3), y: Math.sqrt(this.P * 3/1), K: 2*this.a*Math.sqrt(this.P * 1/3) + 2*this.b*Math.sqrt(this.P * 3/1) },
      { nazwa: '1:2', x: Math.sqrt(this.P * 1/2), y: Math.sqrt(this.P * 2/1), K: 2*this.a*Math.sqrt(this.P * 1/2) + 2*this.b*Math.sqrt(this.P * 2/1) },
      { nazwa: 'Optymalny (prostokąt)', x: xOptymlane, y: yOptymalne, K: 4*Math.sqrt(this.a * this.b * this.P), optymalny: true, nazwaDrogi: this.nazwaDrozszegoMaterialu, nazwaTani: this.nazwaTanszegoMaterialu },
      { nazwa: '2:1', x: Math.sqrt(this.P * 2/1), y: Math.sqrt(this.P * 1/2), K: 2*this.a*Math.sqrt(this.P * 2/1) + 2*this.b*Math.sqrt(this.P * 1/2) },
      { nazwa: '3:1', x: Math.sqrt(this.P * 3/1), y: Math.sqrt(this.P * 1/3), K: 2*this.a*Math.sqrt(this.P * 3/1) + 2*this.b*Math.sqrt(this.P * 1/3) },
    ]

    if (this.pokazKwadrat) {
      this.wyniki.push({
        nazwa: 'Optymalny (kwadrat)', x: bokKwadratu, y: bokKwadratu, K: 2*this.a*bokKwadratu + 2*this.b*bokKwadratu, kwadrat: true
      })
    }
  }
}