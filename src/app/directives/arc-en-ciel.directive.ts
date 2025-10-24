import { Directive, HostBinding, HostListener, signal } from '@angular/core';

@Directive({
  selector: 'input[appArcEnCiel]',
  standalone: true
})
export class ArcEnCielDirective {

  static readonly COLORS: string[] = ['blue', 'red', 'green', 'yellow', 'purple', 'orange', 'pink'];

  borderColorSignal = signal(ArcEnCielDirective.COLORS[0]);
  textColorSignal = signal(ArcEnCielDirective.COLORS[0]);

  @HostBinding('style.borderColor')
  get borderColor() {
    return this.borderColorSignal();
  }

  @HostBinding('style.color')
  get color() {
    return this.textColorSignal();
  }

  @HostBinding('style.borderWidth') borderWidth = '2px';
  @HostBinding('style.borderStyle') borderStyle = 'solid';

  @HostListener('keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    const randomColor = ArcEnCielDirective.COLORS[
      Math.floor(Math.random() * ArcEnCielDirective.COLORS.length)
    ];
    this.borderColorSignal.set(randomColor);
    this.textColorSignal.set(randomColor);
  }
}
