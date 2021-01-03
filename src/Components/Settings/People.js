import React from 'react';
import Button from 'react-bootstrap/Button';
import Scroll from './../Scroll/Scroll'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import './Settings.css';

class People extends React.Component{
	constructor(){
		super();
		this.state = {
			peopleList: [


			],
			fName: '',
			lName: '',
			email: '',
			dShow: false,
			id: -1,
			eshow: false
		}
	}

	componentDidMount = () => {
		this.loadAllUsers();
	}

	loadAllUsers = () => {
		fetch('https://secure-earth-82827.herokuapp.com/people')
			.then(response => response.json())
			.then(users => this.setState({peopleList: users}));
	}

	addPerson = () => {
		const {fName, lName, email} = this.state;
		const {department} = this.props;
		if (fName.length > 0 && lName.length > 0 && email.length > 0){	
			fetch('https://secure-earth-82827.herokuapp.com/people', {
				method: 'post',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({
					firstname: fName,
					lastname: lName,
					email: email,
					department: department.replace(" Admin",'')
				})
			})
				.then(response => response.json())
				.then(person => {
					if (person.lastname){
						this.loadAllUsers();
					}
					else if (person === 'a user with this email already exists.'){
						this.toggleEShow();
					}
				})
			this.setState({
				fName: '',
				lName: '',
				email: ''
			})
		}
	}

	activeChange = (e) => {
		fetch('https://secure-earth-82827.herokuapp.com/people', {
			method: 'put',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				id: parseInt(e.target.parentNode.id,10),
				isactive: e.target.checked
			})
		})
			.then(response => response.json())
			.then(person => {
				if (person){
					this.loadAllUsers();
				}
			})
	}

	deletePerson = () => {
		const {peopleList} = this.state;
		const id = parseInt(this.state.id,10);
		let email = '';
		for (let i = 0; i < peopleList.length; i++){
			if (id === peopleList[i].id){
				email = peopleList[i].email;
				break;
			}
		}

		fetch('https://secure-earth-82827.herokuapp.com/people', {
			method: 'delete',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				email: email 
			})
		})
			.then(response => response.json())
			.then(people => {
				if (people){
					this.loadAllUsers();
				}
			})

		this.toggleDShow();
	}

	onFNameChange = (e) => {
		this.setState({fName: e.target.value})
	}

	onLNameChange = (e) => {
		this.setState({lName: e.target.value})
	}

	onEmailChange = (e) => {
		this.setState({email: e.target.value})
	}

	toggleDShow = (e) => {
		if (e){
			this.setState({id: parseInt(e.target.parentNode.id,10)})
		}
		else{
			this.setState({id: -1})
		}
		this.setState({dShow: !this.state.dShow})
	}

	toggleEShow = (e) => {
		this.setState({eShow:!this.state.eShow});
	}

	render(){
		const {peopleList, fName, lName, email, dShow, eShow} = this.state;

		let docList = [];
		for (let j = 0; j < peopleList.length; j++){
			docList.push(
				<li key={peopleList[j].id} id={peopleList[j].id}>
					{peopleList[j].lastname}, {peopleList[j].firstname}
					<input onChange={this.activeChange} checked={peopleList[j].isactive} key={j} className='inp' type="checkbox" />
					<Button key={-j-1} onClick={this.toggleDShow} className="delete butn" size="sm" variant="danger">Delete</Button>
				</li>
			)
		}

			return(
			<div className="body">
				<div className="left">
					
					<div className="top">
						<h4 className="subtitle">Staff List</h4>
					</div>
					<Scroll>
						<ul className="setList">
							{docList}
						</ul>
					</Scroll>

				</div>
				<div className="p right">
					<div className="top">
						<h4 className="subtitle">Add User</h4>
					</div>
					<Form id="callForm" >
						<div id="box" style={{border:'2px solid black', height: '180px'}}>
							<Form.Group id="name">
								<Form.Control required value={fName} type="text" onChange={this.onFNameChange} autoComplete="off" placeholder="First Name" />
							</Form.Group>
							<Form.Group id="name">
								<Form.Control required value={lName} type="text" onChange={this.onLNameChange} autoComplete="off" placeholder="Last Name" />
							</Form.Group>
							<Form.Group id="email">
    							<Form.Control required value={email} type="email" onChange={this.onEmailChange} autoComplete="off" placeholder="Email" />
  							</Form.Group>
						</div>
						<div className="bottom">
							<Button id='callSub' variant="primary" onClick={this.addPerson}>
								Submit
							</Button>
						</div>
					</Form>


				</div>
				<div className='modal'>
					<Modal show={dShow} onHide={this.toggleDShow} >
        				<Modal.Header closeButton>
          					<Modal.Title id='modalTitle'>Confirm Deletion</Modal.Title>
       	 				</Modal.Header>
        				<Form>
        					<Modal.Body>
        					<Form.Group >
      							 <Form.Label>Are you sure you want to delete this user?</Form.Label>
  							</Form.Group>
        				</Modal.Body>
        				<Modal.Footer>
          					<Button onClick={this.toggleDShow} variant="secondary" >
            					Cancel
          					</Button>
          					 <Button onClick={this.deletePerson} variant="primary" >
            					Submit
          					</Button>
	        			</Modal.Footer>
	        			</Form>
      				</Modal>
				</div>
				<div className='modal'>
					<Modal show={eShow} onHide={this.toggleEShow} >
        				<Modal.Header closeButton>
          					<Modal.Title id='modalTitle'>Error</Modal.Title>
       	 				</Modal.Header>
        				<Form>
        					<Modal.Body>
        					<Form.Group >
      							 <Form.Label>A user with this email address already exists.</Form.Label>
  							</Form.Group>
        				</Modal.Body>
        				<Modal.Footer>
          					<Button onClick={this.toggleEShow} variant="secondary" >
            					Cancel
          					</Button>
	        			</Modal.Footer>
	        			</Form>
      				</Modal>
				</div>
			</div>

		);



	}


}

export default People;