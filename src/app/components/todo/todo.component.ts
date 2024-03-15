import { Component, computed, effect, signal } from '@angular/core';
import { FilterType, TodoModel } from '../../models/todo';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.css'
})
export class TodoComponent {

  // Uso de señales

  todolist = signal<TodoModel[]>([
    {
      id: 1,
      title: 'Buy milk',
      completed: false,
      editing: false
    },
    {
      id: 2,
      title: 'Buy bread',
      completed: false,
      editing: false
    },
    {
      id: 3,
      title: 'Buy cheese',
      completed: false,
      editing: false
    }
  ])

  filter = signal<FilterType>('all');

  changeFilter(filterSting: FilterType){
    this.filter.set(filterSting)
  }

  newTodo = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(3)]
  })

  constructor(){
    effect(() => {
      // Se dispara al inicio y cada vez que el todo list se dispare
      localStorage.setItem('todos', JSON.stringify(this.todolist()))
    })
  }

  ngOnInit(): void{
    const storage = localStorage.getItem('todos');
    if ( storage){
      this.todolist.set(JSON.parse(storage))
    }
  }

  addTodo(){
    const newTodoTitle = this.newTodo.value.trim();

    if (this.newTodo.valid && newTodoTitle !== ''){
      
      this.todolist.update((prev_todos) => {
        return [
          ...prev_todos,
          {
            id: Date.now(),
            title: newTodoTitle,
            completed: false
          }
        ];
      });

      this.newTodo.reset;

    } else {
      this.newTodo.reset;
    }
  }

  toggleTodo(todoId: number){
    this.todolist.update((prev_todos) => prev_todos.map((todo) =>{
      
      return todo.id === todoId 
      ? {...todo, completed: !todo.completed}
      : todo;

      })
    );
  }

  removeTodo(todoId: number){
    this.todolist.update((prev_todos) => 
    prev_todos.filter((todo) => todo.id !== todoId)
    );
  }

  editTodo(todoId: number){
    return this.todolist.update((prev_todos) =>
      prev_todos.map((todo) => {
        return todo.id == todoId ?
        {...todo, editing: true}
        : {...todo, editing: false}
      })
    );
  }

  saveTitleToDo(todoId: number, event:Event){
    const titleNew = (event.target as HTMLInputElement).value

    return this.todolist.update((prev_todos) =>
      prev_todos.map((todo) => {
        return todo.id == todoId ?
        {...todo, title: titleNew, editing: false}
        : todo;
      })
    );
    }

  todoListFiltered = computed(() => {
    const filter = this.filter()
    const todos = this.todolist();

    switch(filter){
      case 'active':
        return todos.filter((todo) => !todo.completed);
      case 'completed':
        return todos.filter((todo) => todo.completed);
      default:
        return todos;
    }
    
  })
}
