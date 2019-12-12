import React from "react";
import {render} from "react-dom";
import ReactDOM from "react-dom";
import axios from "axios";

export class LogTable extends React.Component {
  constructor() {
    super();
    this.state = {
      logs: null
    }
  }

  //get all the logs
  componentDidMount(){
    axios.get('/getlogs').then(
      response => {
        this.setState({
          logs: response.data.logs.reverse()
        });
      },
      error => {
        window.alert(error.response.data);
      }
    )
  }

  render () {
    if(this.state.logs === null){
      return (
        <></>
      );
    }
    else{
      return(
        <div className="container">
          <div className="row justify-content-center">
            <div className="col col-md-8 col-md-offset-1">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Log</th>
                    <th>Timestamp</th>
                    <th>Request</th>
                    <th>Response</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.logs.map(log =>
                    <tr key={log.id}>
                      <td>{log.log}</td>
                      <td>{log.log_date}</td>
                      <td>{log.request}</td>
                      <td>{log.response}</td>
                      <td>{log.type}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }
  }
}

if(window.document.getElementById("logs"))
  ReactDOM.render(<LogTable/>, window.document.getElementById("logs"));
