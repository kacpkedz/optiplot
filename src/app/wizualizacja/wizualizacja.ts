import { Component, ViewChild, ElementRef, OnChanges, Input } from '@angular/core';

@Component({
  selector: 'app-wizualizacja',
  imports: [],
  templateUrl: './wizualizacja.html',
  styleUrl: './wizualizacja.css',
})
export class Wizualizacja implements OnChanges {
  @ViewChild('canvas', { static: true }) myCanvas!: ElementRef;
  @Input() x = 0;       // Długość działki (oś x) w metrach
  @Input() y = 0;       // Szerokość działki (oś y) w metrach

  // Metoda wywoływana przy zmianie danych wejściowych
  ngOnChanges(): void {
    if (!this.x || !this.y) return;

    const ctx = (this.myCanvas.nativeElement as HTMLCanvasElement).getContext('2d')!;
    ctx.clearRect(0, 0, 500, 300);

    // Skaluje wymiary aby wizualizacja działki zmieściła się na canvasie
    const skala = Math.min(450 / this.x, 285 / this.y) * 0.9;
    const w = this.x * skala;
    const h = this.y * skala;
    // Oblicza pozycję, aby działka była wyśrodkowana na canvasie
    const sx = 25 + (450 - w) / 2;
    const sy = (285 - h) / 2;

    // Rysuje prostokąt reprezentujący działkę
    ctx.fillStyle = '#ffeecc';
    ctx.strokeStyle = '#ffaa00';
    ctx.lineWidth = 2;
    ctx.fillRect(sx, sy, w, h);
    ctx.strokeRect(sx, sy, w, h);

    // Etykieta: długość
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#1100ff';
    ctx.fillText(this.x.toFixed(2) + ' m', sx + w / 2, sy + h + 20);

    // Etykieta: szerokość
    ctx.fillStyle = '#ff0000';
    ctx.save();
    ctx.translate(sx - 35, sy + h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(this.y.toFixed(2) + ' m', 0, 20);
    ctx.restore();
  }
}