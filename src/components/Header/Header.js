import React from "react";
import axios from "axios";
import {render} from "react-dom";
import ReactDOM from 'react-dom';
import {UserControl} from "./UserControl";

export class Header extends React.Component {
  constructor() {
    super();
    this.state = {
      username: "temp"
    };
  }

  getUser(){
    axios.get("/login").then(
      response => {
        //save user information
        this.setState({
          username: response.data.username
        });
      },
      error => {
        this.setState({
          username: null
        });
      }
    );
  }

  componentDidMount() {
    this.getUser();
  }

  render() {
    if(this.state.username === null){
      return (
        <div className="mb-3">
          <nav className="navbar navbar-expand-md navbar-dark bg-dark justify-content-between">
              <div className="navbar-header">
                <ul className="navbar-nav mr-auto">
                  <li className="nav-item active">
                    <a className="nav-link" href="/">Home</a>
                  </li>
                </ul>
              </div>
              <UserControl username={this.state.username} getUser={this.getUser.bind(this)}/>
          </nav>
        </div>
      );
    }
    else if(this.state.username === "temp"){
      return (
        <></>
      );
    }
    else{
      return(
        <nav className="navbar navbar-expand-md navbar-dark bg-dark justify-content-between">
            <div className="navbar-header">
              <ul className="navbar-nav mr-auto">
                <li className="nav-item active">
                  <a className="nav-link" href="/">Home</a>
                </li>
                <li className="nav-item active">
                  <a className="nav-link" href="/dashboard">Dashboard</a>
                </li>
              </ul>
            </div>
            <UserControl username={this.state.username}/>
        </nav>
      );
    }
  }
}

if(window.document.getElementById("header"))
  ReactDOM.render(<Header/>, window.document.getElementById("header"));
