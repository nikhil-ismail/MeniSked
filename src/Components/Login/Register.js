import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Logo from '../../logo512.png';
import './Login.css';

class Register extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			lastname: '',
			firstname: '',
			email: '',
			password: '',
			cPassword: '',
			code: '',
			errorShow: false,
			msg: '',
			depts: []

		}
	}

	componentDidMount = () => {
   		this.loadDepts();
   	}

   	loadDepts = () => {
   		fetch('https://secure-earth-82827.herokuapp.com/departments')
			.then(response => response.json())
			.then(departments => this.setState({depts: departments}));
   	}

	onChange = (event, type) => {
		this.setState({[type]: event.target.value})
	}

	onSubmitRegister = () => {
		const {password, cPassword, depts, code, firstname, lastname, email} = this.state;
		if (password !== cPassword){
			this.toggleErrorShow('dp');
			return false;
		}
		let flag1 = false;
		let rCode = code.replace(' Admin','');
		for (let i = 0; i < depts.length; i++){
			if (rCode === depts[i].code){
				flag1 = true;
			}
		}
		if (!flag1){
			this.toggleErrorShow('code');
			return false;
		}
		else if (
			firstname.length > 0 && 
			lastname.length > 0 &&
			this.props.validateEmail(email) &&
			password.length > 0 &&
			code.length > 0
		){

			let isadmin = false;
			if (code.includes("Admin")){
				isadmin = true;
			}
			
			fetch('https://secure-earth-82827.herokuapp.com/register', {
				method: 'post',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({
					email: email,
					password: password,
					firstname: firstname,
					lastname: lastname,
					department: code,
					isadmin: isadmin,
				})
			})
				.then(response => response.json())
				.then(user => {
					if (user.lastname){
						this.props.loadUser(user)
						this.props.onRouteChange("Personal Schedule");
					}
					else if (user === 'user with this email already exists.'){
						this.toggleErrorShow('email');
					}
				})
		}
	}

	toggleErrorShow = (type) => {
		if (type === 'dp'){
			this.setState({msg: 'The passwords you entered do not match.'})
		}
		else if (type === 'code'){
			this.setState({msg: "The department code you entered does not match our records. Please contact your department's administrator to confirm the appropriate code."})
		}
		else if (type === 'email'){
			this.setState({msg: 'A user with this email address already exists. Please use the login page to sign in.'})
		}
		this.setState({errorShow: !this.state.errorShow})
	}

	render(){
		const {errorShow, msg} = this.state;
		const {onRouteChange} = this.props;
		return(
			<div>
				<div className='test shadow-2'>
					<div className='mt-3 spacing'id='loginHeader'>
						<img style={{paddingTop:'5px', height:90, width:90}} alt='Logo' src={Logo}/> 
						<h1 id='title'>MeniSked</h1>
					</div>
					<div className='justify-content-center'id='loginBody'>
						<Form className="login-form">
							<h1 id="loginTitle">Register</h1>
							<Form.Group controlId="formBasicFName">
								<Form.Control required onChange={(e) => this.onChange(e,'firstname')} type="text" autoComplete="off" placeholder="First Name" />
							</Form.Group>
							<Form.Group controlId="formBasicLName">
								<Form.Control required onChange={(e) => this.onChange(e,'lastname')} type="text" autoComplete="off" placeholder="Last Name" />
							</Form.Group>
							<Form.Group controlId="formBasicEmail">
							    <Form.Control required onChange={(e) => this.onChange(e,'email')} type="email" autoComplete="off" placeholder="Email" />
							</Form.Group>
							<Form.Group controlId="formBasicPassword">
								<Form.Control required onChange={(e) => this.onChange(e,'password')} type="password" autoComplete="off" placeholder="Password" />
							</Form.Group>
							<Form.Group controlId="formBasicCPassword">
								<Form.Control required onChange={(e) => this.onChange(e,'cPassword')} type="password" autoComplete="off" placeholder="Confirm Password" />
							</Form.Group>
							<Form.Group controlId="formBasicCode">
								<Form.Control required onChange={(e) => this.onChange(e,'code')} type="text" autoComplete="off" placeholder="Department Code" />
							</Form.Group>
							<Button onClick={this.onSubmitRegister} id='loginButton' variant="primary" >
								Register
							</Button> 
						</Form>
					</div>
					<div className='modal'>
					<Modal show={errorShow} onHide={this.toggleErrorShow}>
        				<Modal.Header closeButton>
          					<Modal.Title id='modalTitle'>Error</Modal.Title>
       	 				</Modal.Header>
        				<Modal.Body>
        					{msg}
        				</Modal.Body>
        				<Modal.Footer>
          					<Button variant="secondary" onClick={this.toggleErrorShow}>
            					Close
          					</Button>
	        			</Modal.Footer>
      				</Modal>
				</div>
					<div className='shad spacing' id='loginFooter'>
						<p>Already a user? <span onClick={() => onRouteChange("Login", false)} className='label'>Login</span></p>
					</div>
				</div>
			</div>
		);
	}

}


export default Register;