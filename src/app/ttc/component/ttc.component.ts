import { Component } from '@angular/core';

@Component({
  selector: 'app-ttc',
  templateUrl: './ttc.component.html',
  styleUrl: './ttc.component.css'
})
export class TTCComponent {

  quantite = 1;
  prix = 0;
  tva = 18;
  prix_unitaire_ttc = 0;
  prix_total_ttc = 0;
  discount = 0;

  calculate(){
    this.prix_unitaire_ttc = this.prix * (1+this.tva/100)
    this.prix_total_ttc = (this.quantite * this.prix) * (1+this.tva/100)
    this.discount = this.prix_total_ttc * (this.quantite < 10 ? 0 : this.quantite <= 15 ? 0.2 : 0.3)
  }
  

}
