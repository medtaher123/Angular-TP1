import { Injectable, computed, inject, signal } from '@angular/core';
import { Todo, TodoStatus } from '../model/todo';
import { LoggerService } from '../../services/logger.service';

let n = 1;

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private loggerService = inject(LoggerService);

  private todos = signal<Todo[]>([]);

  waitingTodos = computed(() =>
    this.todos().filter((todo) => todo.status === 'waiting')
  );
  inProgressTodos = computed(() =>
    this.todos().filter((todo) => todo.status === 'in progress')
  );
  doneTodos = computed(() =>
    this.todos().filter((todo) => todo.status === 'done')
  );

  /**
   * elle retourne la liste des todos
   *
   * @returns Todo[]
   */
  getTodos(): Todo[] {
    return this.todos();
  }

  /**
   *Elle permet d'ajouter un todo
   *
   * @param todo: Todo
   *
   */
  addTodo(todo: Todo): void {
    this.todos.update((todos) => [...todos, todo]);
  }

  /**
   * Delete le todo s'il existe
   *
   * @param todo: Todo
   * @returns boolean
   */
  deleteTodo(todo: Todo): boolean {
    const index = this.todos().indexOf(todo);
    if (index > -1) {
      this.todos.update((todos) => todos.filter((_, i) => i !== index));
      return true;
    }
    return false;
  }

  /**
   * Elle permet de mettre à jour le status d'un todo
   *
   * @param todoId : number
   * @param status : TodoStatus
   */
  updateTodoStatus(todoId: number, status: TodoStatus): void {
    this.todos.update((todos) =>
      todos.map((todo) => (todo.id === todoId ? { ...todo, status } : todo))
    );
  }

  /**
   * Logger la liste des todos
   */
  logTodos() {
    this.loggerService.logger(this.todos);
  }
}
