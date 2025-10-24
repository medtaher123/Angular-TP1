import { Component, inject } from '@angular/core';
import { Todo, TodoStatus } from '../model/todo';
import { TodoService } from '../service/todo.service';

import { FormsModule } from '@angular/forms';
import { ArcEnCielDirective } from 'src/app/directives/arc-en-ciel.directive';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css'],
  providers: [TodoService],
  standalone: true,
  imports: [FormsModule, ArcEnCielDirective],
})
export class TodoComponent {
  todoService = inject(TodoService);
  todo = new Todo();

  addTodo() {
    this.todoService.addTodo(this.todo);
    this.todo = new Todo();
  }

  deleteTodo(todo: Todo) {
    this.todoService.deleteTodo(todo);
  }

  updateStatus(todoId: number, event: Event) {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value as TodoStatus;
    this.todoService.updateTodoStatus(todoId, newStatus);
  }
}
