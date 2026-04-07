import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Punkt { x: number; y: number; }
interface BokInfo { dlugosc: number; drogi: boolean; }

@Component({
  selector: 'app-wielokat',
  imports: [CommonModule, FormsModule],
  templateUrl: './wielokat.html',
  styleUrl: './wielokat.css'
})
export class Wielokat implements OnInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  // Ustawienia początkowe cennika
  cenaTania = 50;
  cenaDroga = 200;

  punkty: Punkt[] = [];      // Lista wierzchołków narysowanej działki
  boki: BokInfo[] = [];      // Lista długości i typów płotu dla każdego boku
  zamkniety = false;         // Zmienna weryfikująca czy bryła została domknięta

  wyniki: any[] = [];        // Zmienna przechowująca tablicę dla wyników końcowych
  optCx = 1;                 // Właściwość skali X dla kształtu optymalnego
  optCy = 1;                 // Właściwość skali Y dla kształtu optymalnego

  private ctx!: CanvasRenderingContext2D;
  private readonly SNAP = 14; // Jak blisko trzeba kliknąć by "przykleić" wierzchołek i zamknąć łuk

  ngOnInit() {
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.rysuj();
  }

  // ── Główny Mechanizm Obliczeniowy ─────────────────────────────
  oblicz() {
    // Obliczamy tylko, jeśli kształt ma formę minimum trójkąta
    if (!this.zamkniety || this.punkty.length < 3) {
      this.wyniki = [];
      return;
    }

    const n = this.punkty.length;
    let P_px = 0;              // Obwód pikselowy na płótnie
    let A_px = 0;              // Pole pikselowe na płótnie
    const deltas = [];         // Przechowywanie dystansów dX i dY (potrzebne do optymalizacji)

    // 1. Obliczanie Pola na podstawie pikseli przy użyciu klasycznego wzoru na pole figury (Shoelace formula)
    for (let i = 0; i < n; i++) {
        const p1 = this.punkty[i];
        const p2 = this.punkty[(i + 1) % n];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        
        A_px += (p1.x * p2.y - p2.x * p1.y); // Suma z tzw. "sznurowadła"
        
        const len = Math.sqrt(dx * dx + dy * dy); // Twierdzenie Pitagorasa na długość kreski
        P_px += len;
        deltas.push({ dx, dy });
    }
    A_px = Math.abs(A_px) / 2;

    if (A_px === 0 || P_px === 0) return;

    // 2. Skalowanie: Powiązanie wartości wpisanych w lewym pasku i abstrakcyjnych pikseli z ekranu
    let P_user = this.boki.reduce((sum, b) => sum + (b.dlugosc || 0), 0);
    const f = P_user > 0 ? P_user / P_px : 1; 

    // Rzeczywiste Pole oraz całkowity Koszt wpisany przed chwilą przez użykownika z klawiatury
    const A_real = A_px * f * f;
    const K_orig = this.boki.reduce((sum, b) => sum + (b.dlugosc || 0) * (b.drogi ? this.cenaDroga : this.cenaTania), 0);

    // 3. Moduł: Poszukiwanie "Działki Optymalnej" (minimalizującej koszta)
    // Sprawdzamy dziesiątki form rozciągnięcia X/Y by znaleźć kształt, który ogradza to samo Pole, wydając mniej na płot
    let minKoszt = Infinity;
    let bestCx = 1;
    let bestCy = 1;

    for(let t = -3; t <= 3; t += 0.01) {
        const Cx = Math.exp(t);
        const Cy = 1 / Cx; 
        
        let kosztTestowy = 0;
        for (let i = 0; i < n; i++) {
            const dx = deltas[i].dx;
            const dy = deltas[i].dy;
            
            // Nowa długość "zdeformowanego" w pętli boku
            const px_optymalny = Math.sqrt((Cx * dx)**2 + (Cy * dy)**2);
            const real_dlug = px_optymalny * f;
            
            // Dodajemy obciążenie materiałem za tę symulowaną krawędź
            kosztTestowy += real_dlug * (this.boki[i].drogi ? this.cenaDroga : this.cenaTania);
        }
        
        // Zapis - jeśli symulacja wypadła na plusie (najtaniej!), uznaj za nowego lidera układanki
        if (kosztTestowy < minKoszt) {
            minKoszt = kosztTestowy;
            bestCx = Cx;
            bestCy = Cy;
        }
    }

    // Zapamiętanie zwycięskiej formy dla modułu Ryzującego (Canvasu)
    this.optCx = bestCx;
    this.optCy = bestCy;

    // Przesył wyników matematycznych do Tabeli podziałkowej z HTML
    this.wyniki = [
        { 
          nazwa: 'Tradycyjna Działka', 
          koszt: K_orig, 
          pole: A_real,
          info: "Koszta z narysowanej figury"
        },
        { 
          nazwa: 'Działka Optymalna', 
          koszt: minKoszt, 
          pole: A_real, 
          info: "Najtańsze wymiary zachowujące to samo Pole m²" 
        }
    ];
  }

  // ── Kontrola Przycisków (Zamykanie/Zarządzanie) ──────────────────────────
  zamknij() {
    if (this.punkty.length >= 3 && !this.zamkniety) {
      this.zamkniety = true;
      this.boki.push({ dlugosc: 0, drogi: false });

      // Automatyzator: uzupełnia wstępnie pola Metrów by ułatwić użytkownikowi zabawę (Skala = piksele / 5)
      const n = this.punkty.length;
      if (this.boki.every(b => (b.dlugosc || 0) === 0)) {
          for (let i = 0; i < n; i++) {
              const p1 = this.punkty[i];
              const p2 = this.punkty[(i + 1) % n];
              const dx = p2.x - p1.x;
              const dy = p2.y - p1.y;
              this.boki[i].dlugosc = Math.round(Math.sqrt(dx * dx + dy * dy) / 5); 
          }
      }

      this.oblicz();
      this.rysuj();
    }
  }

  cofnij() {
    if (this.zamkniety) {
      this.zamkniety = false;
      this.boki.pop();
    } else if (this.punkty.length > 0) {
      this.punkty.pop();
      if (this.boki.length > 0) {
        this.boki.pop();
      }
    }
    this.wyniki = [];
    this.rysuj();
  }

  wyczysc() {
    this.punkty = [];
    this.boki = [];
    this.zamkniety = false;
    this.wyniki = [];
    this.rysuj();
  }

  // ── Przechwytywanie z Myszki ─────────────────────────────────────────
  private getCanvasPos(e: MouseEvent): Punkt {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const c = this.canvasRef.nativeElement;
    return {
      x: (e.clientX - rect.left) * (c.width / rect.width),
      y: (e.clientY - rect.top) * (c.height / rect.height)
    };
  }

  onCanvasClick(e: MouseEvent) {
    if (this.zamkniety) return;

    const { x, y } = this.getCanvasPos(e);
    
    // Sprawdzanie czy trafiliśmy w pierwszy zielony punkt (dobicie linii do bazy, by zakończyć siatkę)
    if (this.punkty.length >= 3) {
      const p0 = this.punkty[0];
      const dist = Math.sqrt((x - p0.x) ** 2 + (y - p0.y) ** 2);
      if (dist < this.SNAP) {
        this.zamknij();
        return;
      }
    }

    this.punkty.push({ x, y });
    if (this.punkty.length > 1) {
      this.boki.push({ dlugosc: 0, drogi: false });
    }
    this.rysuj();
  }

  // ── Render ──────────────────────────────────────────────────────────
  rysuj() {
    this.oblicz();

    if (!this.ctx) return;
    const canvas = this.canvasRef.nativeElement;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const n = this.punkty.length;
    if (n === 0) return;

    // Wizualizacja Wypełnienia Tła (zielona folia w środku figury domkniętej)
    if (this.zamkniety) {
      ctx.beginPath();
      ctx.moveTo(this.punkty[0].x, this.punkty[0].y);
      for (let i = 1; i < n; i++) ctx.lineTo(this.punkty[i].x, this.punkty[i].y);
      ctx.closePath();
      ctx.fillStyle = 'rgba(25,135,84,0.08)';
      ctx.fill();
    }

    // Gruby Obrys krawędzi aktualnej działki  
    ctx.beginPath();
    ctx.moveTo(this.punkty[0].x, this.punkty[0].y);
    for (let i = 1; i < n; i++) {
        ctx.lineTo(this.punkty[i].x, this.punkty[i].y);
    }
    if (this.zamkniety) {
        ctx.closePath();
    }
    ctx.strokeStyle = '#198754';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Moduł 2D wizualizujący Działkę Optymalną
    if (this.zamkniety && this.wyniki.length > 0) {
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        this.punkty.forEach(p => {
          minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
          minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
        });
        const cx = (minX + maxX) / 2;
        const cy = (minY + maxY) / 2;

        // Skalujemy proporcję po to by idealnie wkleiła się we wnątrz nie naruszając wizualności
        const maxProp = Math.max(this.optCx, this.optCy);
        const renderScale = 1 / maxProp * 0.9; 

        ctx.beginPath();
        for (let i = 0; i < n; i++) {
            const px = cx + (this.punkty[i].x - cx) * this.optCx * renderScale;
            const py = cy + (this.punkty[i].y - cy) * this.optCy * renderScale;
            if(i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(253, 126, 20, 0.15)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(253, 126, 20, 0.5)';
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillStyle = '#fd7e14';
        ctx.font = 'bold 13px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Zoptymalizowana Siatka', cx, cy - (maxY - minY)*0.5 - 20);
    }

    // Wyścielanie Oznakowań Boków (Tekst i "Droga" Linia)
    for (let i = 0; i < this.boki.length; i++) {
        const p1 = this.punkty[i];
        const p2 = this.punkty[(i + 1) % n];
        const bok = this.boki[i];
        
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = bok.drogi ? '#fd7e14' : '#198754';
        
        if (bok.drogi) {
            ctx.setLineDash([6, 3]);
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.setLineDash([]);
        } else {
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Kafelki informacyjne z tekstami miary
        if (bok.dlugosc > 0) {
            const mx = (p1.x + p2.x) / 2;
            const my = (p1.y + p2.y) / 2;
            const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

            ctx.save();
            ctx.translate(mx, my);
            ctx.rotate(angle);
            ctx.font = '12px Arial';
            const label = bok.dlugosc + 'm';
            const tw = ctx.measureText(label).width;
            ctx.fillStyle = '#fff';
            ctx.fillRect(-tw / 2 - 2, -17, tw + 4, 14);
            ctx.fillStyle = bok.drogi ? '#a0390a' : '#0a5229';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, 0, -10);
            ctx.restore();
        }
    }

    // Malowanie punktów nawigacyjnych (kółeczka 1, 2, 3) 
    this.punkty.forEach((p, i) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, i === 0 ? 8 : 5, 0, Math.PI * 2);
      ctx.fillStyle = i === 0 ? '#198754' : '#fff';
      ctx.fill();
      ctx.strokeStyle = i === 0 ? '#0a5229' : '#0d6efd';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      ctx.font = '12px Arial';
      ctx.fillStyle = '#111';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(String(i + 1), p.x, p.y - 10);
    });
  }
}