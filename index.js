import "./style.css";
import React, { Component, useState } from "react";
import { render } from "react-dom";

import { observable, action, computed } from "mobx";
import { observer } from "mobx-react";

// Stores are where the business logic resides
class TodoStore {
  nextID = 0;
  @observable todos = [];
  @observable filterType = "all";

  @observable model = "create";
  @observable updateID = null;

  // compute a filtered list of todos
  @computed
  get filtered() {
    if (this.filterType === "all") {
      return this.todos;
    } else if (this.filterType === "completed") {
      return this.todos.filter(t => t.completed);
    } else {
      return this.todos.filter(t => !t.completed);
    }
  }

  @computed
  get filterCompleted() {
    return this.todos.filter(t => t.completed);
  }

  @computed
  get submitName () {
    if (this.model === "create") {
      return "Create Todo"
    } else {
      return "Update Todo"
    }
  }

  // set a filter type: "all", "completed" or "active"
  @action
  setFilterType(filterType) {
    this.filterType = filterType;
  }

  @action
  setModel(model) {
    this.model = model;
  }
  
  @action
  setUpdateID(id) {
    this.updateID = id;
  }

  // create a todo
  @action
  create = name => {
    let id = this.nextID;
    this.nextID += 1;
    this.todos.push({ id: id, name: name, completed: false });
  };

  // update a todo
  @action
  update = name => {
    let todo = this.todos.find(e => e.id === this.updateID);
    if (todo) {
      todo.name = name;
    }
  };

  // toggle the completion state of a todo
  @action
  toggle = id => {
    let todo = this.todos.find(e => e.id === id);
    if (todo) {
      todo.completed = !todo.completed;
    }
  };

  // remove all completed tasks
  @action
  removeAll = () => {
    this.todos = this.todos.filter(t => t.completed===false)

  };
}

@observer
class TodoForm extends Component {
  constructor(props) {
    super(props);
  }

  @observable inputValue = "";
  


  onFormSubmit = event => {
    event.preventDefault();
    if (this.props.todoStore.model==="create"){
      this.props.todoStore.create(this.inputValue);      
    } else {
      this.props.todoStore.update(this.inputValue);  
      this.props.todoStore.setModel("create")
    }
    this.inputValue = "";
  };

  @action
  handleInputChange = event => {
    this.inputValue = event.target.value;
  };

  render() {
    return (
      <form onSubmit={this.onFormSubmit}>
        <label>
          <input
            type="text"
            name="name"
            value={this.inputValue}
            onChange={this.handleInputChange}
          />
        </label>
        <input type="submit" value= {this.props.todoStore.submitName}/>
      </form>
    );
  }
}

const TodoView = ({ onClick, completed, name, onChageModel}) => (
  <tr>
    <th>
      <input
          type="checkbox"
          name="is_finish"
          value={completed}
          checked = {completed}
          onClick = {onClick}
        />
    </th>
    <th>  
    {name}
    </th>
    <th>
      <a href="#" onClick={onChageModel}>Edit</a>
    </th>
  </tr>
);

const Link = ({ active, children, onClick }) => {
  if (active) {
    return (
      <span>
        {" | "} {children}
      </span>
    );
  }

  return (
    <a href="#" onClick={onClick}>
      {" | "}
      {children}
    </a>
  );
};

const TodoFilter = observer(({ todoStore }) => (
  <span>
    <b>Filter Todos</b>:
    {["all", "completed", "active"].map((status, i) => (
      <Link
        key={i}
        active={todoStore.filterType === status}
        onClick={() => todoStore.setFilterType(status)}
      >
        {status}
      </Link>
    ))}
  </span>
));

const TodoCounter = observer(({ todoStore }) => (
  <span>
    <b>{todoStore.filterCompleted.length} of {todoStore.todos.length} Completed</b>
  </span>
));

const TodoList = observer(({ todoStore }) => (
  <table>
    <thead>
      <tr>
        <th>Status</th>
        <th>Name</th> 
      </tr>
    </thead>
    <tbody>
      {todoStore.filtered.map(t => (
        <TodoView
          key={t.id}
          name={t.name}
          completed={t.completed}
          onClick={() => {
            todoStore.toggle(t.id);
          }}
          onChageModel = {() => {
            todoStore.setModel("Edit")
            todoStore.setUpdateID(t.id)
          }}
        />
      ))}
    </tbody>
    <tfoot>
      <tr>
        <button 
        type="button"
        onClick = {todoStore.removeAll}>
        
        Remove all completed tasks
        
        </button>
      </tr>
      <tr>
        <TodoCounter todoStore={todoStore}/>
      </tr>
    </tfoot>
  </table>
));

@observer
class JSONView extends Component {
  @observable showJSON = false;

  toggleShowJSON = () => {
    this.showJSON = !this.showJSON;
  };

  render() {
    return (
      <div>
        <input
          type="checkbox"
          name="showjson"
          value={this.showJSON}
          onChange={this.toggleShowJSON}
        />
        Show JSON
        {this.showJSON && <p>{JSON.stringify(this.props.store)}</p>}
      </div>
    );
  }
}

const TodoApp = observer(() => {

  const todoStore = new TodoStore();
  document.todoStore = todoStore

  console.log('todoapp')
  return (
    <div>
      <TodoForm todoStore={todoStore} />
      <hr />
      <TodoFilter todoStore={todoStore} />
      <hr />
      <TodoList todoStore={todoStore} />
      <JSONView store={todoStore} />
    </div>)
})


render(<TodoApp />, document.getElementById("app"));
