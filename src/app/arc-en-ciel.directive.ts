import { Directive, HostListener, HostBinding } from '@angular/core';

@Directive({
  selector: 'input[appArcEnCiel]',
  standalone: true,
  host:{
    '(keyup)':'this.onKeyUp()',
    '[style.borderColor]': 'this.borderColor',
    '[style.color]': 'this.colorColor',

  }
})
export class ArcEnCielDirective {

  static readonly COLORS: string[] = ['blue', 'red', 'green', 'yellow', 'purple'];

  borderColor: string = ArcEnCielDirective.COLORS[0]
  colorColor: string = ArcEnCielDirective.COLORS[0];

  constructor() { }

  
  onKeyUp(event: KeyboardEvent) {
    const color = ArcEnCielDirective.COLORS[Math.floor(Math.random() * ArcEnCielDirective.COLORS.length)]
    this.borderColor = color;
    this.colorColor = color;
  }


}
