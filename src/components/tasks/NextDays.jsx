import React, { Component } from 'react';
import AddTask from './add'
import EditOnClick from './edit'
import { Modal, Button, Icon } from 'antd';
import  moment from "moment";
const { confirm } = Modal;

const token = "78fcfd26adb47157e35612abb3649bdf71cc1400";

class TodayTasks extends Component {

  constructor() {
    super();
    this.state = {
      items: [],
      key: '',
      isAdded: false,
    }
  }

  componentDidMount() {
    this.getData();
  }

  getData = async () => {
    try {
      const res = await fetch(`https://api.todoist.com/rest/v1/tasks`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': "Bearer " + token,
        },

      });
      let result = await res.json();
      this.setState({
        isLoaded: true,
        items: result,
      });
    }
    catch (error) {
      this.setState({
        isLoaded: true,
        error
      });
    }
  }

  handleDelete = async (id) => {

    let array = [...this.state.items];
    await fetch(`https://api.todoist.com/rest/v1/tasks/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': "Bearer " + token,
      },
    });
    let newDeleted = array.filter(data => data.id !== id);
    this.setState({ items: newDeleted })
  }
 
  showDeleteConfirm = (data) => {
    confirm({
      title: 'Are you sure, you want to delete ?',
      content: `${data.content}`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: ()  => {
          this.handleDelete(data.id);         
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }

  handleAddTask = async (newData) => {

    let task = {
      content: newData.content,
      due_date: newData.due_date
    }

    if (!newData.content) return;

    const request = await fetch('https://api.todoist.com/rest/v1/tasks', {
      method: "POST",
      body: JSON.stringify(task),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    const response = await request.json();

    const items = this.state.items.slice();
    items.push(response);

    newData.content && this.setState({
      items: items,
    }, () => console.log('after adding new task, all tasks are:', this.state.items));
  }

  handleCheckboxChange = (props) => {

    const items = this.state.items.filter(item => item.id !== props.id);

    this.setState({
      items
    }, () => {
      fetch(`https://api.todoist.com/rest/v1/tasks/${props.id}/close`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).then(() => {
        console.log('remaining active tasks:', this.state.items);
      })
    });

  }

  handleAddPropagation = () => {
    this.setState({isAdded: true}, () => this.state.isAdded)
  }

//   currDate = () => {
//     var tempDate = new Date();
//     var month = new Date().getMonth()+1;
//     return (tempDate.getFullYear() + '-' + (month < 10 ? '0' + month : '' + month) + '-' + tempDate.getDate());
// }

//     handleDueDate = (item) => {
//     return (
//         Object.prototype.hasOwnProperty.call(item, 'due') ? Date.parse(item.due.date) : ""
//     );
// }

  render() {
    const filteredItems = this.state.items.filter(value => (Math.abs((moment().diff(value.due.date, 'days'))) < 7));
    return (
      <>
      {filteredItems.map(task =>
      <li className = "listOfTask" key={task.id} style={{ listStyle: 'none' }}>
        <div>
        <input type="radio" className="pretty p-defalut p-round" onChange={() => this.handleCheckboxChange(task)} defaultChecked={task.completed} />
      <EditOnClick customKey={task.id} value={ Object.prototype.hasOwnProperty.call(task, 'due') ? <span>{task.content} {task.due.date}</span> : task.content }/>
      </div>
      <Button type="link" style={{color: 'red'}} onClick={() => this.showDeleteConfirm(task)}>
      <Icon type="delete" theme="filled"/>
        Delete Task
      </Button>
      </li>
      )}
      <AddTask onAddSubmit={this.handleAddTask} isAdded={() => this.handleAddPropagation()}/>
      </>
     );
  }
}
 
export default TodayTasks;