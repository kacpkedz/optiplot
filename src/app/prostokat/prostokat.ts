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

  P: number = 0;          // Pole
  a: number = 0;          // Cena droższego materiału
  b: number = 0;          // Cena tańszego materiału
  xOptymalny: number = 0; // Długość boku X optymalnego
  yOptymalny: number = 0; // Długość boku Y optymalnego

  wyniki: any[] = [];

  nazwaDrozszegoMaterialu: string = ''; // Nazwa droższego materiału
  nazwaTanszegoMaterialu: string = '';  // Nazwa tańszego materiału

  pokazKwadrat: boolean = false; // Czy pokazać kwadrat?

  lewy: boolean = false; // Lewy bok
  gora: boolean = true;  // Górny bok
  prawy: boolean = false; // Prawy bok
  dol: boolean = true;   // Dolny bok

  iloscDrozszychX = 0; // Ilość droższych boków X
  iloscDrozszychY = 0; // Ilość droższych boków Y
  iloscTanszychX = 0; // Ilość tańszych boków X
  iloscTanszychY = 0; // Ilość tańszych boków Y

  // Metoda wywoływana przy tworzeniu komponentu
  constructor() {
    this.zliczajBoki();
  }

  // Metoda zliczająca boki
  zliczajBoki() {
    this.iloscDrozszychX = 0;
    this.iloscDrozszychY = 0;

    if (this.gora) this.iloscDrozszychX++; // Jeśli góra jest droga, to zwiększamy licznik droższych boków X
    if (this.dol) this.iloscDrozszychX++; // Jeśli dół jest drogi, to zwiększamy licznik droższych boków X
    if (this.lewy) this.iloscDrozszychY++; // Jeśli lewy jest drogi, to zwiększamy licznik droższych boków Y
    if (this.prawy) this.iloscDrozszychY++; // Jeśli prawy jest drogi, to zwiększamy licznik droższych boków Y

    this.iloscTanszychX = 2 - this.iloscDrozszychX; // Obliczamy ilość tańszych boków X
    this.iloscTanszychY = 2 - this.iloscDrozszychY; // Obliczamy ilość tańszych boków Y
  }

  // Metoda sprawdzająca poprawność danych
  czyPoprawneDane(): boolean {
    return this.P <= 0 || this.a <= 0 || this.b <= 0 || this.a <= this.b;
  }

  // Metoda obliczająca optymalne wymiary prostokąta
  oblicz() {
    const A = this.iloscDrozszychX * this.a + this.iloscTanszychX * this.b; // Koszt materiału na bokach X
    const B = this.iloscDrozszychY * this.a + this.iloscTanszychY * this.b; // Koszt materiału na bokach Y

    const x = Math.sqrt(B * this.P / A); // Długość boku X optymalnego
    const y = Math.sqrt(A * this.P / B); // Długość boku Y optymalnego

    this.xOptymalny = x;
    this.yOptymalny = y;

    this.wyniki = [
      { nazwa: 'Optymalny', x, y, K: A * x + B * y, optymalny: true } // Obliczony koszt materiału
    ];

    // Jeśli użytkownik chce zobaczyć kwadrat, to obliczamy koszt materiału dla kwadratu
    if (this.pokazKwadrat) {
      const s = Math.sqrt(this.P); // Długość boku kwadratu
      this.wyniki.push({ nazwa: 'Kwadrat', x: s, y: s, K: A * s + B * s }); // Obliczony koszt materiału dla kwadratu
    }
  }
}
