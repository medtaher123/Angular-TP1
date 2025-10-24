import { Injectable,signal, Signal } from '@angular/core';
import { Cv } from '../model/cv';

@Injectable({
  providedIn: 'root',
})
export class EmbaucheService {
  private _embauchees = signal<Cv[]>([]);
  readonly embauchees: Signal<Cv[]> = this._embauchees;


  constructor() {}

  /**
   *
   * Retourne la liste des embauchees
   *
   * @returns CV[]
   *
   */
  getEmbauchees(): Cv[] {
    return this._embauchees();
  }

  /**
   *
   * Embauche une personne si elle ne l'est pas encore
   * Sinon il retourne false
   *
   * @param cv : Cv
   * @returns boolean
   */
  embauche(cv: Cv): boolean {
    const list = this._embauchees();
    if (list.indexOf(cv) === -1) {
      this._embauchees.set([...list, cv]);
      return true;
    }
    return false;
  }
}
