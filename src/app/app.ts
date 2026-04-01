import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Prostokat } from './prostokat/prostokat';
import { Wielokat } from './wielokat/wielokat';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, Prostokat, Wielokat],
  templateUrl: './app.html'
})
export class App {
  zakladka: 'prostokat' | 'wielokat' = 'prostokat';
}