import './Register.css'
import { useState } from "react";
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import configurations from './configurations';
import Layout from './Layout'
import Row from './Row'
import Box from './Box'

function Register(props) {
    const [username, setUsername] = useState();
    const [usernameError, setUsernameError] = useState();
    const [email, setEmail] = useState();
    const [emailError, setEmailError] = useState();
    const [password, setPassword] = useState();
    const [passwordError, setPasswordError] = useState();
    const history = useHistory();
    const validEmail = new RegExp(
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
    const changeUsername = (event) => {
        setUsername(event.target.value);
        setUsernameError("");
    }

    const changeEmail = (event) => {
        setEmail(event.target.value);
        setEmailError("");
    }

    const changePassword = (event) => {
        setPassword(event.target.value);
        setPasswordError("");
    }

    const registerValidation = () => {
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

        if (!validEmail.test(email)) {
            setEmailError("email not valid");
            return false;
        }
        else {
            setEmailError("");
        }

    };

    const register = () => {
        let validRes = registerValidation();
        if (validRes === false) {
            console.log("not valid")
            return;
        }
        console.log("valid")
        axios.post(configurations.server + 'register', {
            username: username,
            email: email,
            password: password
        }, { withCredentials: true })
            .then(res => {
                console.log(res.data);
                if (res.data == true) {
                    history.push('/menu');
                }
                else if(res.data===3){
                    setUsernameError("Username is already in use!")
                }
                else if(res.data===4){
                    setEmailError("Email is already in use!")
                }
            })
            .catch(err => console.log(err));
    }

    return (
        <Layout>
            <Box>
                <Row>
                    <div>
                        <div className="Input">
                            Username <input type="text"  value={username} onChange={changeUsername}></input>
                        </div>
                        <div>{usernameError}</div>
                        <div className="Input">
                            password <input type="password"  value={password} onChange={changePassword}></input>
                        </div>
                        <div>{passwordError}</div>
                        <div className="Input">
                            email <input type="text" value={email} onChange={changeEmail}></input>
                        </div>
                        <div>{emailError}</div>
                        <Row>
                            <button onClick={register}>register</button>
                        </Row>

                    </div>
                </Row>
            </Box>
        </Layout>
    );
}

export default Register;
