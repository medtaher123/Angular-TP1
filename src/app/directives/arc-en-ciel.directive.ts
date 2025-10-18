import { Directive, HostListener, HostBinding } from '@angular/core';

@Directive({
  selector: 'input[appArcEnCiel]'
})
export class ArcEnCielDirective {

  static readonly COLORS: string[] = ['red', 'blue', 'green', 'yellow', 'purple'];

  @HostBinding('style.borderColor') borderColor: string = ArcEnCielDirective.COLORS[0]
  @HostBinding('style.color') colorColor: string = ArcEnCielDirective.COLORS[0];

  constructor() { }

  @HostListener('keyup')
  onKeyUp(event: KeyboardEvent) {
    const color = ArcEnCielDirective.COLORS[Math.floor(Math.random() * ArcEnCielDirective.COLORS.length)]
    this.borderColor = color;
    this.colorColor = color;
  }


}
