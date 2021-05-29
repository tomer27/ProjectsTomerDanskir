import './Login.css'
import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useHistory } from "react-router";
import configurations from './configurations';
import Layout from './Layout'
import Row from './Row'
import Box from './Box'

const Login = (props) => {
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState();
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState();

  const history = useHistory();

  const loginValidation = () => {
    if (String(username).length < 5) {
      setUsernameError("username must be at least 5 ch long");
      return false;
    } else {
      setUsernameError("");
    }
    if (String(password).length < 8) {
      setPasswordError("password must be at least 8 ch long");
      return false;
    } else {
      setPasswordError("");
    }
  };

  const login = () => {
    let validRes = loginValidation();
    if (validRes === false) {
      console.log("not valid")
      return;
    }
    console.log("valid")
    axios.post(configurations.server + 'login', {
      username: username,
      password: password
    }, { withCredentials: true })
      .then(res => {
        if (res.data == true) {
          history.push('/menu');
        }
      })
      .catch(()=>setPasswordError("username or password is wrong"));
  }

  const changeUsername = (event) => {
    setUsername(event.target.value);
    setUsernameError("")
    console.log(username);
  }

  const changePassword = (event) => {
    setPassword(event.target.value);
    setPasswordError("")
    console.log(username);
  }


  return (
    <Layout>
      <Box>
        <Row>
          <div>
            <div className="Input">
              Username <input type='text' value={username} onChange={changeUsername}/>
            </div>
            <div>{usernameError}</div>
            <div className="Input">
              Password <input type="password" value={password} onChange={changePassword} />
            </div>
            <div>{passwordError}</div>
            <Row>
              <button onClick={login}>login</button>
            </Row>
            <Row>
              <a href="register">Don't have an account yet?</a>
            </Row>
          </div>
        </Row>
      </Box>
    </Layout>

  );
}

export default Login;