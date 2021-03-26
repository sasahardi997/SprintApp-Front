import React, { Component } from 'react';
import {Form, Button, Row, Col, FormGroup} from 'react-bootstrap';

import {login} from '../../services/auth';

class Login extends Component {

    state = {
        username: "",
        password: ""
    }

    onInputChanged(event){
        let name = event.target.name;
        let value = event.target.value;

        let change = {};
        change[name] = value;
        this.setState(change)
    }

    render() {
        return (
            <div>
                <h3 style={{textAlign: 'center', marginTop: "45px"}}>Please, Login!</h3>

               
                    <Row className="justify-content-center">
                        <Col md={6}>
                            <Form>
                                <FormGroup>
                                    <Form.Label>Username:</Form.Label>
                                    <Form.Control
                                        value={this.state.username}
                                        as="input"
                                        type="text"
                                        name="username"
                                        onChange={(e) => this.onInputChanged(e)}>
                                    </Form.Control>
                                </FormGroup>

                                <FormGroup>
                                    <Form.Label>Password:</Form.Label>
                                    <Form.Control
                                        value={this.state.password}
                                        as="input"
                                        type="password"
                                        name="password"
                                        onChange={(e) => this.onInputChanged(e)}>
                                    </Form.Control>
                                </FormGroup>
  
                                 <Button variant="success" onClick={() => login(this.state.username, this.state.password)}>Submit</Button>
                            </Form>
                        </Col>
                    </Row>
                
            </div>
        );
    }
}

export default Login;