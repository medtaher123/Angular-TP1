import { CommonModule } from '@angular/common';
import { Component, computed, signal, WritableSignal } from '@angular/core';

@Component({
  selector: 'app-ttc',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ttc.component.html',
  styleUrl: './ttc.component.css'
})
export class TTCComponent {

  prix: WritableSignal<number> = signal(0)
  quantite : WritableSignal<number> = signal(1)
  tva: WritableSignal<number> = signal(18)
  prix_unitaire_ttc = computed(() => this.prix() * (1+this.tva()/100))
  prix_total_ttc = computed(() => this.quantite() * this.prix() * (1+this.tva()/100))
  discount = computed(()=> 0)


}
