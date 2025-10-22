export type TodoStatus = 'waiting' | 'in progress' | 'done';

export class Todo {
  static nextId = 1;
  id: number;

  constructor(
    public name = '',
    public content = '',
    public status: TodoStatus = 'waiting'
  ) {
    this.id = Todo.nextId++;
  }
}
