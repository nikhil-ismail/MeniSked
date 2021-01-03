import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Logo from '../../logo512.png';
import './Login.css';

class Login extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			loginEmail: '',
			loginPassword: '',
			show: false,
			errorShow: false,
			msg: '',
			pWordShow: false,
			forgotEmail: ''
		}
	}

	onChange = (event, type) => {
		this.setState({[type]: event.target.value})
	}

	onSLogin = () => {
		const {loginEmail, loginPassword} = this.state;
		fetch('https://secure-earth-82827.herokuapp.com/login', {
			method: 'post',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				email: loginEmail,
				password: loginPassword
			})
		})
			.then(response => response.json())
			.then(user => {
				if (user.lastname){
					this.props.onRouteChange("Personal Schedule");
					this.props.loadUser(user);
				}
				else{
					this.toggleErrorShow();
				}
			})
	}

	toggleShow = () => {
		this.setState({show: !this.state.show})
	}

	toggleErrorShow = (type) => {
		if (type === 'email'){
			this.setState({msg: 'Sorry, the email address you entered does not match our records.'})
		}
		else{
			this.setState({msg: 'Sorry, the email address or password you entered does not match our records.'})
		}

		this.setState({errorShow: !this.state.errorShow})
	}

	forgotPWordShow = () => {
		this.setState({pWordShow: !this.state.pWordShow})
	}

	forgotPassword = () => {
		fetch('https://secure-earth-82827.herokuapp.com/forgot', {
			method: 'post',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				email: this.state.forgotEmail
			})
		})
		.then(response => response.json())
		.then(data => {	
			if (data === 'unable to get user'){
				this.toggleErrorShow('email');
			}
			else{
				this.toggleShow();
			}
		})
		this.setState({
			pWordShow: !this.state.pWordShow
		})
	}


	render(){
		const {show, errorShow, msg, pWordShow, forgotEmail} = this.state;
		const {onRouteChange} = this.props;
		return(
			<div>
				<div className='test shadow-2'>
					<div className='mt-5 spacing'id='loginHeader'>
						<img style={{paddingTop:'5px', height:90, width:90}} alt='Logo' src={Logo}/> 
						<h1 id='title'>MeniSked</h1>
					</div>
					<div className='justify-content-center'id='loginBody'>
						<Form className="login-form" /*onSubmit={this.onSLogin}*/ >
							<h1 id="loginTitle">Login</h1>
							<Form.Group controlId="formBasicEmail">
							    <Form.Control onChange={(e) => this.onChange(e,'loginEmail')} required type="email" autoComplete="email" placeholder="Email" />
							  </Form.Group>

							<Form.Group controlId="formBasicPassword">
								<Form.Control onChange={(e) => this.onChange(e,'loginPassword')} type="password" autoComplete="current-password" placeholder="Password" />
							</Form.Group>
							<Button onClick={this.onSLogin} /*type="submit"*/ id='loginButton' variant="primary">
								Login
							</Button>
							<Form.Group>
								<Form.Label onClick={this.forgotPWordShow} className="mt-3 label">Forgot Password?</Form.Label>
							</Form.Group>
						</Form>
					</div>
					<div className='shad spacing' id='loginFooter'>
						<p>New user? <span onClick={() => onRouteChange("Register", false)} className='label'>Register Now</span></p>
					</div>
				</div>
				<div className='modal'>
					<Modal show={show} onHide={this.toggleShow}>
        				<Modal.Header closeButton>
          					<Modal.Title id='modalTitle'>Forgot Password</Modal.Title>
       	 				</Modal.Header>
        				<Modal.Body>
        					A temporary password has been sent to {forgotEmail}. Once you have signed in please change your password in the account tab.
        				</Modal.Body>
        				<Modal.Footer>
          					<Button variant="secondary" onClick={this.toggleShow}>
            					Close
          					</Button>
	        			</Modal.Footer>
      				</Modal>
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
				<div className='modal'>
					<Modal show={pWordShow} onHide={this.forgotPWordShow}>
        				<Modal.Header closeButton>
          					<Modal.Title id='modalTitle'>Forgot Password</Modal.Title>
       	 				</Modal.Header>
        				<Form>
        					<Modal.Body>
        						<Form.Group controlId="formBasicEmail">
    								<Form.Label>Enter your email below and we'll send you instructions to retrieve your account.</Form.Label>
    								<Form.Control onChange={(e) => this.onChange(e,'forgotEmail')} required type="email" placeholder="Email" />
  								</Form.Group>
        					</Modal.Body>
        				<Modal.Footer>
          					<Button onClick={this.forgotPWordShow} variant="secondary" >
            					Close
          					</Button>
          					 <Button onClick={this.forgotPassword} variant="primary" >
            					Submit
          					</Button>
	        			</Modal.Footer>
	        			</Form>
      				</Modal>
				</div>
			</div>

		);
	}

}


export default Login;