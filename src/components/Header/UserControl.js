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

      var form = new FormData();
      form.set("username", this.state.username);
      form.set("password", this.state.password);

      const config = {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      };

      axios.post("/login", form, config)
      .then(
        response => {
          this.props.getUser();
        },
        error => {
          window.alert("Invalid Username/Password Combo");
        }
      )
    }
  }

  logout() {
    axios.delete("/login")
    .then(
      response => {
        window.location.href = '/';
      },
      error => {
        window.alert("You can never leave.");
      }
    )
  }

  render() {
    if(this.props.username === null){
      //show login form
      return (
        <div>
          <input className="mr-sm-2 username-login" type="text" placeholder="Username" name="user" value={this.state.username} onChange={this.onChange.bind(this)}></input>
          <input className="mr-sm-2 pass-login" type="password" placeholder="Password" name="pass" value={this.state.password} onChange={this.onChange.bind(this)}></input>
          <button className="btn btn-outline-success mr-sm-2 button-login" onClick={this.login.bind(this)}>Log In</button>
          <a className="fasdf" href="/signup" style={{textSize: "6px"}}>New User? Sign Up!</a>
        </div>
      );
    }
    else{
      //show currently logged in user and user setting dropdown
      return (
        <div className="row justify-content-center">
          <div className="col">
            <h3 className="text-light">{this.props.username}</h3>
          </div>
          <div className="col">
            <button className="btn btn-outline-danger mr-sm-2 button-logout" onClick={this.logout.bind(this)}>Log Out</button>
          </div>
        </div>
      );
    }
  }
}
