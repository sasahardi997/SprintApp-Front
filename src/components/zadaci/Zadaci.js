import React, { Component } from 'react';
import { Button, Col, Collapse, Form, Row, Table } from 'react-bootstrap';
import TestAxios from '../../apis/TestAxios';
import {BsFillTrashFill} from 'react-icons/bs';

class Zadaci extends Component {

    constructor(props){
        super(props)

        let search = {
            sprintId: -1,
            imeZadatka: ""
        }

        let zadatak = {
            ime: "",
            zaduzeni: "",
            bodovi: "",
            stanjeId: -1,
            sprintId: -1
        }

        this.state = {
            zadaci: [],
            sprintovi: [],
            stanja: [],
            zadatak: zadatak,
            totalPages: 1,
            pageNo: 0,
            search: search,
            showSearch: false,
            showDodaj: "block",
            showIzmeni: "none",
            zadatakId: -1,
            sprintSum: ""
        }
    }

    componentDidMount(){
        this.getZadaci(0);
        this.getSprintovi();
        this.getStanja();
    }

    getSprintovi(){
        TestAxios.get("/sprintovi")
            .then(res => {
                this.setState({sprintovi: res.data})
            })
            .catch(error => {
                console.log(error)
                alert("Greska prilikom dobavljanja sprintova.")
            })
    }

    getStanja(){
        TestAxios.get("/stanja")
            .then(res => {
                this.setState({stanja: res.data})
            })
            .catch(error => {
                console.log(error)
                alert("Greska prilikom dobavaljanja stanja.")
            })
    }

    getZadaci(newPageNo){

        let config = {
            params: {
                pageNo: newPageNo
            }
        }

        if(this.state.search.sprintId != -1){
            config.params['sprintId'] = this.state.search.sprintId
        }
        if(this.state.search.imeZadatka != ""){
            config.params['imeZadatka'] = this.state.search.imeZadatka
        }
        console.log(config.params)

        TestAxios.get("/zadaci", config)
            .then(res => {
                console.log(res.data)
                const sprintSum = res.headers['sprint-sum']? res.headers['sprint-sum']: "";
                this.setState({
                    zadaci: res.data,
                    pageNo: newPageNo,
                    totalPages: res.headers['total-pages'],
                    sprintSum: sprintSum
                })
            })
            .catch(error => {
                console.log(error)
                alert("Greska prilikom dobavljanja zadatak")
            })
    }

    renderTable(){
        return this.state.zadaci.map(z => {
            return(
                <tr key={z.id}>
                    <td>{z.ime}</td>
                    <td>{z.zaduzeni}</td>
                    <td>{z.bodovi}</td>
                    <td>{z.stanjeIme}</td>
                    <td>{z.sprintIme}</td>
                    <td><Button variant="primary" disabled={z.stanjeIme==="Zavrsen"} onClick={() => this.sledeceStanje(z.id)}>Predji na sledece stanje</Button></td>
                    <td><Button variant="warning" onClick={() => this.izmeniPodaci(z.id)}>Edit</Button></td>
                    <td><Button variant="danger" onClick={() => this.obrisi(z.id)}><BsFillTrashFill/></Button></td>
                </tr>
            )
        })
    }

    sledeceStanje(id){
        TestAxios.put("/zadaci/" + id + "/action")
            .then(res => {
                this.getZadaci(0)
            })
            .catch(error => {
                console.log(error)
                alert("Greska prilikom menjanja stanja.")
            })
    }

    izmeniPodaci(id){
        TestAxios.get("/zadaci/" + id)
            .then(res => {
                this.setState({
                    zadatak: res.data,
                    showDodaj: 'none',
                    showIzmeni: 'block',
                    zadatakId: id
                })
            })
            .catch(error => {
                console.log(error)
                alert("Greska prilikom dobavljanja zadatka.")
            })
    }

    izmeni(){
        let zadatak = this.state.zadatak
        zadatak['id'] = this.state.zadatakId
        console.log(zadatak)

        if(this.proveraInputPolja() == true){
            TestAxios.put("/zadaci/" + this.state.zadatakId, zadatak)
            .then(res => {
                alert("Uspesno izmenjen zadatak.")
                let zadatak = {
                    ime: "",
                    bodovi: "",
                    zaduzeni: "",
                    sprintId: -1,
                    stanjeId: -1
                }
                this.setState({
                    zadatakId: -1,
                    zadatak: zadatak,
                    showDodaj:'block',
                    showIzmeni: 'none'
                })
                this.getZadaci(0)
            })
            .catch(error => {
                console.log(error)
                alert("Greska prilikom izmene")
            })
        }else {
            alert("Nisu popunjena sva polja.")
        }
    }

    obrisi(id){
        TestAxios.delete("/zadaci/" + id)
            .then(res => {
                this.obrisiIzState(id)
            })
            .catch(error =>{
                console.log(error)
                alert("Greska prilikom brisanja.")
            })
    }

    obrisiIzState(id){
        let zadaci = this.state.zadaci

        for(var i in zadaci){
            if(zadaci[i].id == id){
                zadaci.splice(i, 1);
            }
        }
        this.setState({zadaci: zadaci})
    }

    pretraga(){
        return(
            <div style={{marginTop: '20px'}}>
                <Form.Group>
                    <Form.Check type="checkbox" label="Prikaze formu za pretragu" onClick={(event) => this.setState({showSearch: event.target.checked})}/>
                </Form.Group>
                <Collapse in={this.state.showSearch}>
                <Row>
                        <Col md={6}>
                            <Form>
                                <Form.Group>
                                    <Form.Label>Ime zadatka</Form.Label>
                                    <Form.Control
                                        as="input"
                                        type="text"
                                        name="imeZadatka"
                                        onChange={(e) => this.onSearchChange(e)}>

                                    </Form.Control>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Sprint</Form.Label>
                                    <Form.Control
                                        as="select"
                                        name="sprintId"
                                        onChange={(e) => this.onSearchChange(e)}>
                                            <option value={-1}></option>
                                            {this.state.sprintovi.map(s => {
                                                return(                 
                                                    <option key={s.id} value={s.id}>{s.ime}</option>
                                                )
                                            })}
                                    </Form.Control>
                                </Form.Group>
                            </Form>
                            <Button variant="primary" onClick={() => this.getZadaci(0)}>Pretrazi</Button>
                        </Col>
                    </Row>
                </Collapse>
            </div>
        )
    }

    onInputChange(e){
        let name = e.target.name
        let value = e.target.value

        let zadatak = this.state.zadatak
        zadatak[name] = value
        this.setState(zadatak)
    }

    dodaj(){
        if(this.proveraInputPolja() == true){
            TestAxios.post("/zadaci", this.state.zadatak)
            .then(res => {
                let zadatak = {
                    ime: "",
                    bodovi: "",
                    zaduzeni: "",
                    sprintId: -1,
                    stanjeId: -1
                }
                this.setState({zadatak: zadatak})

                alert("Uspesno ste dodali zadatak!")
            })
            .catch(error => {
                console.log(error)
                alert("Dodavanje nije uspelo!")
            })
        } else {
            alert("Niste popunili sva polja.")
        }
    }

    proveraInputPolja(){
        let task = this.state.zadatak
        if(task.ime != "" && task.bodovi != "" && task.bodovi>0 && task.bodovi <20 && this.zaduzeni != ""
            && task.sprintId != -1 && task.stanjeId != -1){
                return true
            } else {
                return false
            }
    }

    onSearchChange(e){
        let name = e.target.name
        let value = e.target.value

        let search = this.state.search
        search[name] = value
        this.setState(search)
    }

    onInputChange(e){
        let name = e.target.name
        let value = e.target.value

        let zadatak = this.state.zadatak
        zadatak[name] = value
        this.setState(zadatak)
    }

    forma(){
        return(
            <div style={{marginTop: '20px'}}>
                <Row>
                        <Col md={6}>
                            <Form>
                                <Form.Group>
                                    <Form.Label>Ime</Form.Label>
                                    <Form.Control
                                        as="input"
                                        type="text"
                                        name="ime"
                                        value={this.state.zadatak.ime}
                                        onChange={(e) => this.onInputChange(e)}>

                                    </Form.Control>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Zaduzeni</Form.Label>
                                    <Form.Control
                                        as="input"
                                        type="text"
                                        name="zaduzeni"
                                        value={this.state.zadatak.zaduzeni}
                                        onChange={(e) => this.onInputChange(e)}>

                                    </Form.Control>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Bodovi</Form.Label>
                                    <Form.Control
                                        as="input"
                                        type="text"
                                        name="bodovi"
                                        value={this.state.zadatak.bodovi}
                                        onChange={(e) => this.onInputChange(e)}>

                                    </Form.Control>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Stanje</Form.Label>
                                    <Form.Control
                                        as="select"
                                        name="stanjeId"
                                        value={this.state.zadatak.stanjeId}
                                        onChange={(e) => this.onInputChange(e)}>
                                            <option value={-1}></option>
                                            {this.state.stanja.map(s => {
                                                return(                 
                                                    <option key={s.id} value={s.id}>{s.ime}</option>
                                                )
                                            })}
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Sprint</Form.Label>
                                    <Form.Control
                                        as="select"
                                        name="sprintId"
                                        value={this.state.zadatak.sprintId}
                                        onChange={(e) => this.onInputChange(e)}>
                                            <option value={-1}></option>
                                            {this.state.sprintovi.map(s => {
                                                return(                 
                                                    <option key={s.id} value={s.id}>{s.ime}</option>
                                                )
                                            })}
                                    </Form.Control>
                                </Form.Group>
                            </Form>
                            <Button style={{display: this.state.showDodaj}} variant="primary" onClick={() => this.dodaj()}>Dodaj</Button>
                            <Button style={{display: this.state.showIzmeni}} variant="primary" onClick={() => this.izmeni()}>Izmeni</Button>
                        </Col>
                    </Row>
            </div>
        )
    }

    render() {
        return (
            <div>

                {this.forma()}

                {this.pretraga()}
                
                <div style={{textAlign: 'right'}}>
                    <Button disabled={this.state.pageNo == 0} onClick={() => this.getZadaci(this.state.pageNo - 1)} variant="primary">Prev</Button>
                    <Button disabled={this.state.pageNo == this.state.totalPages - 1} onClick={() => this.getZadaci(this.state.pageNo + 1)} variant="primary">Next</Button>
                </div>
                <Table bordered striped style={{ marginTop: 5 }}>
                    <thead className="thead-dark">
                        <tr>
                            <th>Ime</th>
                            <th>Zaduzeni</th>
                            <th>Bodovi</th>
                            <th>Stanje</th>
                            <th>Sprint</th>
                            <th colSpan="3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.renderTable()}
                    </tbody>
                </Table>
                <div style={{paddingBottom : '20px'}}>
                    <h2 hidden={this.state.sprintSum == ""}>Suma bodova je: {this.state.sprintSum}</h2>
                </div>
            </div>
        );
    }
}

export default Zadaci;