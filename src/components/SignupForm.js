import React from "react";
import {render} from "react-dom";
import ReactDOM from "react-dom";
import axios from "axios";

export class SignupForm extends React.Component {
  constructor() {
    super();
    this.state = {
      username: "",
      password: "",
      passwordC: "",
      email: ""
    }
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
    else if(e.target.name === "pass"){
      if(e.target.value !== this.state.password){
        this.setState({
          password: e.target.value
        });
      }
    }
    else if(e.target.name === "passC"){
      if(e.target.value !== this.state.passwordC){
        this.setState({
          passwordC: e.target.value
        });
      }
    }
    else {
      if(e.target.value !== this.state.email){
        this.setState({
          email: e.target.value
        });
      }
    }
  }

  handlePost(e) {
    //verify that the account information is legal
    if(this.state.password.length < 8){
      window.alert("Password must be 8 characters minimum.");
    }
    else if(this.state.username.length < 8){
      window.alert("Username must be 8 characters minimum.");
    }
    else if(this.state.email.length < 6){
      window.alert("Email must exceed 6 characters.");
    }
    else if(this.state.password !== this.state.passwordC){
      window.alert("Passwords must match.");
    }
    else if(this.state.email.includes("@") === false || this.state.email.includes(".") === false){
      window.alert("Must be a valid email.");
    }
    else{
      //post data to signup endpoint using axios
      var form = new FormData();
      form.set('username', this.state.username);
      form.set('password', this.state.password);
      form.set('email', this.state.email);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      axios.post('/signup', form, config)
      .then(
        response => {
          window.alert("Account Created!");
        },
        error => {
          window.alert("Either the Email or Username are already in use. Please choose another.");
        }
      );
    }
  }

  render () {
    return (
      <div className="container">
        <div className="row">
          <div className="col">
            <h3>Email: </h3>
          </div>
          <div className="col">
            <input type="text" name="email" className="email-signup" placeholder="Email" value={this.state.email} onChange={this.onChange.bind(this)}></input>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <h3>Username: </h3>
          </div>
          <div className="col">
            <input type="text" name="user" className="username-signup" placeholder="Username" value={this.state.username} onChange={this.onChange.bind(this)}></input>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <h3>Password: </h3>
          </div>
          <div className="col">
            <input type="password" name="pass" className="pass-signup" placeholder="Password" value={this.state.password} onChange={this.onChange.bind(this)}></input>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <h3>Confirm Password: </h3>
          </div>
          <div className="col">
            <input type="password" name="passC" className="passConfirm-signup" placeholder="Confirm Password" value={this.state.passwordC} onChange={this.onChange.bind(this)}></input>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <button className="button-signup" onClick={this.handlePost.bind(this)}>Create Account</button>
          </div>
        </div>
      </div>
    );
  }
}

if(window.document.getElementById("signup"))
  ReactDOM.render(<SignupForm/>, window.document.getElementById("signup"));
