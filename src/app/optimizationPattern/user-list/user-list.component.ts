import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, Pipe, PipeTransform } from '@angular/core';
import { User } from "../users.service";

@Pipe({
  name: 'fibonacci',
  pure: true
})
export class FibonacciPipe implements PipeTransform {
  private cache = new Map<number, number>();

  transform(n: number): number {
    if (this.cache.has(n)) {
      return this.cache.get(n)!;
    }
    const result = this.fibonacci(n);
    this.cache.set(n, result);
    console.log(`Fibonacci calculé pour n=${n}: ${result}`);
    return result;
  }

  private fibonacci(n: number): number {
    if (n === 0 || n === 1) {
      return 1;
    }
    return this.fibonacci(n - 1) + this.fibonacci(n - 2);
  }
}

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent {
  @Input() usersCluster: string = '';
  @Input() users: User[] = [];
  @Output() add = new EventEmitter<string>();
  userFullName: string = '';

  addUser() {
    this.add.emit(this.userFullName);
    this.userFullName = '';
  }

  trackByUser(index: number, user: User): string {
    return user.name;
  }
}
