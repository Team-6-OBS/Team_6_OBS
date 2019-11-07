import React from "react";
import axios from "axios";

export class UserControl extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: ""
    };
  }

  onChange(e) {
    //determine which text input is changing
    if(e.target.name === "user"){
      if(e.target.value !== this.state.username){
        this.setState({
          username: e.target.value
        });
      }
    }
    else{
      if(e.target.value !== this.state.password){
        this.setState({
          password: e.target.value
        });
      }
    }
  }

  login() {
    if(this.state.username !== "" && this.state.password !== ""){
      axios.post('/api/user/login', {
        username: this.state.username,
        password: this.state.password
      }).then(
        response => {
          //successful login
          this.props.getUser();
        },
        error => {
          window.alert("Invalid Username/Password combination.");
        }
      )
    }
  }

  render() {
    if(this.props.username === "Anonymous"){
      //show login form
      return (
        <div>
          <input className="mr-sm-2" type="text" placeholder="Username" name="user" value={this.state.username} onChange={this.onChange.bind(this)}></input>
          <input className="mr-sm-2" type="password" placeholder="Password" name="pass" value={this.state.password} onChange={this.onChange.bind(this)}></input>
          <button className="btn btn-outline-success mr-sm-2" onClick={this.login.bind(this)}>Log In</button>
          <a className="fasdf" href="/signup" style={{textSize: "6px"}}>New User? Sign Up!</a>
        </div>
      );
    }
    else{
      //show currently logged in user and user setting dropdown
      return (
        <div>

        </div>
      );
    }
  }
}
