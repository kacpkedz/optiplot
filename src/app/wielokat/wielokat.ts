import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Punkt { x: number; y: number; }
interface Bok { dlugosc: number; drogi: boolean; reczna: boolean; koszt: number; }

@Component({
  selector: 'app-wielokat',
  imports: [CommonModule, FormsModule],
  templateUrl: './wielokat.html',
  styleUrl: './wielokat.css'
})
export class Wielokat implements OnInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  cenaTania = 50;
  cenaDroga = 200;
  skala = 5;

  punkty: Punkt[] = [];
  zamkniety = false;
  tryb: 'rysuj' | 'zaznacz' | 'edytuj' = 'rysuj';

  drogie: boolean[] = [];
  reczneDlugosci: (number | null)[] = [];

  hovSegment: number | null = null;
  edytowanyBok: number | null = null;
  nowaDlugosc: number | null = null;

  podpowiedz = 'Kliknij na canvasie, aby dodawać wierzchołki działki.';

  private ctx!: CanvasRenderingContext2D;
  private readonly SNAP = 14;

  // Liczba metrów na piksel
  private get metrNaPiksel(): number { return this.skala / 100; }

  ngOnInit() {
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.rysuj();
  }

  setTryb(t: 'rysuj' | 'zaznacz' | 'edytuj') {
    this.tryb = t;
    this.edytowanyBok = null;
    if (t === 'rysuj')   this.podpowiedz = 'Kliknij wierzchołki. Zamknij wielokąt klikając pierwszy punkt lub przyciskiem.';
    if (t === 'zaznacz') this.podpowiedz = 'Kliknij bok, aby przełączyć go między tańszym a droższym.';
    if (t === 'edytuj')  this.podpowiedz = 'Kliknij bok, aby wpisać jego rzeczywistą długość w metrach.';
  }

  // ── Obliczenia ──────────────────────────────────────────────

  private dist(a: Punkt, b: Punkt): number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }

  private dlugoscBoku(i: number): number {
    if (this.reczneDlugosci[i] != null) return this.reczneDlugosci[i]!;
    const n = this.punkty.length;
    return this.dist(this.punkty[i], this.punkty[(i + 1) % n]) * this.metrNaPiksel;
  }

  boki(): Bok[] {
    return this.punkty.map((_, i) => {
      const dlugosc = this.dlugoscBoku(i);
      const drogi = !!this.drogie[i];
      const cena = drogi ? this.cenaDroga : this.cenaTania;
      return { dlugosc, drogi, reczna: this.reczneDlugosci[i] != null, koszt: dlugosc * cena };
    });
  }

  obwod(): number {
    const limit = this.zamkniety ? this.punkty.length : this.punkty.length - 1;
    let s = 0;
    for (let i = 0; i < limit; i++) s += this.dlugoscBoku(i);
    return s;
  }

  pole(): number {
    let s = 0;
    const n = this.punkty.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      s += this.punkty[i].x * this.punkty[j].y - this.punkty[j].x * this.punkty[i].y;
    }
    return Math.abs(s) / 2 * this.metrNaPiksel ** 2;
  }

  koszt(): number {
    return this.boki().reduce((sum, b) => sum + b.koszt, 0);
  }

  przelicz() { this.rysuj(); }

  // ── Akcje ────────────────────────────────────────────────────

  zamknij() {
    if (this.punkty.length >= 3 && !this.zamkniety) {
      this.zamkniety = true;
      this.setTryb('zaznacz');
      this.rysuj();
    }
  }

  cofnij() {
    if (this.zamkniety) {
      this.zamkniety = false;
      this.setTryb('rysuj');
    } else if (this.punkty.length > 0) {
      this.punkty.pop();
      this.drogie.pop();
      this.reczneDlugosci.pop();
    }
    this.rysuj();
  }

  wyczysc() {
    this.punkty = [];
    this.drogie = [];
    this.reczneDlugosci = [];
    this.zamkniety = false;
    this.edytowanyBok = null;
    this.setTryb('rysuj');
    this.rysuj();
  }

  zapiszDlugosc() {
    if (this.edytowanyBok !== null && this.nowaDlugosc && this.nowaDlugosc > 0) {
      this.reczneDlugosci[this.edytowanyBok] = this.nowaDlugosc;
    }
    this.edytowanyBok = null;
    this.nowaDlugosc = null;
    this.rysuj();
  }

  // ── Obsługa canvasa ──────────────────────────────────────────

  private getCanvasPos(e: MouseEvent): Punkt {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const c = this.canvasRef.nativeElement;
    return {
      x: (e.clientX - rect.left) * (c.width / rect.width),
      y: (e.clientY - rect.top) * (c.height / rect.height)
    };
  }

  onCanvasClick(e: MouseEvent) {
    const { x, y } = this.getCanvasPos(e);

    if (this.tryb === 'rysuj' && !this.zamkniety) {
      // Snap do pierwszego punktu — zamknięcie wielokąta
      if (this.punkty.length >= 3 && this.dist({ x, y }, this.punkty[0]) < this.SNAP) {
        this.zamknij();
        return;
      }
      this.punkty.push({ x, y });
      this.drogie.push(false);
      this.reczneDlugosci.push(null);
      this.rysuj();
      return;
    }

    const seg = this.nearestSegment(x, y);
    if (seg === null) return;

    if (this.tryb === 'zaznacz') {
      this.drogie[seg] = !this.drogie[seg];
      this.rysuj();
    } else if (this.tryb === 'edytuj') {
      this.edytowanyBok = seg;
      this.nowaDlugosc = parseFloat(this.dlugoscBoku(seg).toFixed(2));
    }
  }

  onCanvasMouseMove(e: MouseEvent) {
    const { x, y } = this.getCanvasPos(e);
    const prev = this.hovSegment;
    this.hovSegment = (this.tryb === 'rysuj' && !this.zamkniety)
      ? null
      : this.nearestSegment(x, y);
    if (this.hovSegment !== prev) this.rysuj();
  }

  private nearestSegment(x: number, y: number): number | null {
    const n = this.punkty.length;
    if (n < 2) return null;
    const limit = this.zamkniety ? n : n - 1;
    let best: number | null = null;
    let bestD = 18;
    for (let i = 0; i < limit; i++) {
      const a = this.punkty[i], b = this.punkty[(i + 1) % n];
      const dx = b.x - a.x, dy = b.y - a.y;
      const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / (dx * dx + dy * dy)));
      const d = this.dist({ x, y }, { x: a.x + t * dx, y: a.y + t * dy });
      if (d < bestD) { bestD = d; best = i; }
    }
    return best;
  }

  // ── Rysowanie ────────────────────────────────────────────────

  private rysuj() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const n = this.punkty.length;
    if (n === 0) return;

    // Wypełnienie zamkniętego wielokąta
    if (this.zamkniety && n >= 3) {
      ctx.beginPath();
      ctx.moveTo(this.punkty[0].x, this.punkty[0].y);
      for (let i = 1; i < n; i++) ctx.lineTo(this.punkty[i].x, this.punkty[i].y);
      ctx.closePath();
      ctx.fillStyle = 'rgba(25,135,84,0.08)';
      ctx.fill();
    }

    // Rysowanie boków
    const limit = this.zamkniety ? n : n - 1;
    for (let i = 0; i < limit; i++) {
      const a = this.punkty[i], b = this.punkty[(i + 1) % n];
      const drogi = !!this.drogie[i];
      const hov = this.hovSegment === i;

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = drogi ? '#fd7e14' : (hov ? '#0d6efd' : '#198754');
      ctx.lineWidth = hov ? 3 : 2;
      ctx.setLineDash(drogi ? [6, 3] : []);
      ctx.stroke();
      ctx.setLineDash([]);

      // Etykieta boku (długość i koszt)
      const d = this.dlugoscBoku(i);
      const cena = drogi ? this.cenaDroga : this.cenaTania;
      const label = `${d.toFixed(1)}m | ${(d * cena).toFixed(0)}zł`;
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      const angle = Math.atan2(b.y - a.y, b.x - a.x);

      ctx.save();
      ctx.translate(mx, my);
      ctx.rotate(angle);
      ctx.font = '11px Arial';
      const tw = ctx.measureText(label).width;
      ctx.fillStyle = '#fff';
      ctx.fillRect(-tw / 2 - 4, -17, tw + 8, 14);
      ctx.fillStyle = drogi ? '#a0390a' : '#0a5229';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, 0, -10);
      ctx.restore();
    }

    // Rysowanie wierzchołków
    this.punkty.forEach((p, i) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, i === 0 ? 8 : 5, 0, Math.PI * 2);
      ctx.fillStyle = i === 0 ? '#198754' : '#fff';
      ctx.fill();
      ctx.strokeStyle = i === 0 ? '#0a5229' : '#0d6efd';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.font = '11px Arial';
      ctx.fillStyle = '#444';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(String(i + 1), p.x, p.y - 10);
    });
  }
}