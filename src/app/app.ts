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

  wyniki: { nazwa: string;x: number; y: number; K: number; nazwaDrogi?: string; nazwaTani?: string; optymalny?: boolean; kwadrat?: boolean }[] = [];

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
      {nazwa: 'x * 1.5', x: xOptymlane * 1.5, y: this.P / (xOptymlane * 1.5), K: 2*this.a*(xOptymlane * 1.5) + 2*this.b*(this.P / (xOptymlane * 1.5))},
      {nazwa: 'x * 1.25', x: xOptymlane * 1.25, y: this.P / (xOptymlane * 1.25), K: 2*this.a*(xOptymlane * 1.25) + 2*this.b*(this.P / (xOptymlane * 1.25))},
      {nazwa: 'Optymalny (prostokąt)', x: xOptymlane, y: yOptymalne, K: 4*Math.sqrt(this.a * this.b * this.P), optymalny: true, nazwaDrogi: this.nazwaDrozszegoMaterialu, nazwaTani: this.nazwaTanszegoMaterialu},
      {nazwa: 'x * 0.75', x: xOptymlane * 0.75, y: this.P / (xOptymlane * 0.75), K: 2*this.a*(xOptymlane * 0.75) + 2*this.b*(this.P / (xOptymlane * 0.75))},
      {nazwa: 'x * 0.5', x: xOptymlane * 0.5, y: this.P / (xOptymlane * 0.5), K: 2*this.a*(xOptymlane * 0.5) + 2*this.b*(this.P / (xOptymlane * 0.5))}
    ]

    if (this.pokazKwadrat) {
      this.wyniki.push({
        nazwa: 'Optymalny (kwadrat)', x: bokKwadratu, y: bokKwadratu, K: 2*this.a*bokKwadratu + 2*this.b*bokKwadratu, kwadrat: true
      })
    }
  }
}