import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import './Account.css';


class Account extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			email: '',
			firstname: '',
			lastname: '',
			cPassword: '',
			nPassword: '',
			cNPassword: '',
			show: false,
			title: '',
			msg: ''
		}
	}

	componentDidMount = () => {
		this.loadAccount();
	}

	loadAccount = () => {
		fetch('https://secure-earth-82827.herokuapp.com/account/'+this.props.user.id)
			.then(response => response.json())
			.then(user => this.setState({
				email: user.email,
				firstname: user.firstname,
				lastname: user.lastname
			}));
	}

	onChange = (event, type) => {
		this.setState({[type]: event.target.value})
	}

	toggleShow = (route) => {
		if (route === 'success'){
			this.setState({
				title: 'Success!',
				msg: 'Your account information has been successfully changed!',
				show: true
			})
		}
		else if (route === 'incorrect'){
			this.setState({
				title: 'Incorrect Password',
				msg: 'The current password you entered is incorrect.',
				show: true
			})
		}
		else if (route === 'different'){
			this.setState({
				title: 'Error',
				msg: 'The new passwords you entered do not match.',
				show: true
			})
		}
		else if (route === 'pass'){
			this.setState({
				title: 'Error',
				msg: 'Please enter a valid password.',
				show: true
			})
		}
		else if (route === 'email'){
			this.setState({
				title: 'Error',
				msg: 'Please enter a valid email address.',
				show: true
			})
		}
		else if (route === 'name'){
			this.setState({
				title: 'Error',
				msg: 'Please enter a valid email name.',
				show: true
			})
		}
		else if (route === 'error'){
			this.setState({
				title: 'Error',
				msg: 'Sorry, this email appears to already be in use.',
				show: true
			})
		}
		else{
			this.setState({
				title: '',
				msg: '',
				show: false
			})
		}
	}

	onSubmitBasic = () => {
		const {firstname, lastname, email} = this.state;

		if (
			firstname.length > 0 && 
			lastname.length > 0 &&
			this.props.validateEmail(email)
		){
			
			fetch('https://secure-earth-82827.herokuapp.com/account/'+this.props.user.id, {
				method: 'put',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({
					email: email,
					firstname: firstname,
					lastname: lastname
				})
			})
				.then(response => response.json())
				.then(user => {
					if (user.email){
						this.setState({
							email: user.email,
							firstname: user.firstname,
							lastname: user.lastname
						})
						this.props.loadUser(user);
						this.toggleShow('success');
					}
					else if (user === 'unable to edit'){
						this.toggleShow('error');
					}
				})
		}
		else if (!this.props.validateEmail(email)){
			this.toggleShow('email');
		}
		else if (firstname.length === 0 || lastname.length === 0){
			this.toggleShow('name');
		}
	}

	onSubmitAll = () => {
		const {cPassword, nPassword, cNPassword} = this.state;
		if(	
			cPassword.length > 0 && 
			nPassword.length > 0 &&
			nPassword === cNPassword
		){			
			fetch('https://secure-earth-82827.herokuapp.com/account/'+this.props.user.id, {
				method: 'post',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({
					oldPassword: cPassword,
					newPassword: nPassword
				})
			})
				.then(response => response.json())
				.then(user => {
					if (user === 'incorrect password'){
						this.toggleShow('incorrect');
					}
					else {
						this.onSubmitBasic();
						this.setState({
							cPassword: '',
							nPassword: '',
							cNPassword: ''
						})
					}
				})
		}
		else if (nPassword !== cNPassword){
			this.toggleShow('different');
		}
		else if (nPassword.length === 0){
			this.toggleShow('pass');
		}
	}

	onSubmitChoose = () => {
		if (this.state.cPassword.length > 0){
			this.onSubmitAll();
		}
		else{
			this.onSubmitBasic();
		}
	}

	render(){
		const {show, title, msg, email, firstname, lastname, cPassword, nPassword, cNPassword} = this.state;
		return(
			<div>
				<div>
					<div className='accountInfo'>
						<h5 id='text'>Email Address</h5>
						<input value={email} onChange={(e) => this.onChange(e,'email')}  type='email' name='email' className='accountInp'/>
						<h5 id='text'>First Name</h5>
						<input value={firstname} onChange={(e) => this.onChange(e,'firstname')} type='text' name='first' className='accountInp'/>
						<h5 id='text'>Last Name</h5>
						<input value={lastname} onChange={(e) => this.onChange(e,'lastname')} type='text' name='last' className='accountInp'/>
					</div>
					<div className='changePass'>
						<h2 id='header'>Change Password</h2>
						<h5 id='text'>Current Password</h5>
						<input value={cPassword} onChange={(e) => this.onChange(e,'cPassword')} type='password' name='cp' className='accountInp'/>
						<h5 id='text'>New Password</h5>
						<input value={nPassword} onChange={(e) => this.onChange(e,'nPassword')} type='password' name='np' className='accountInp'/>
						<h5 id='text'>Confirm New Password</h5>
						<input value={cNPassword} onChange={(e) => this.onChange(e,'cNPassword')} type='password' name='cnp' className='accountInp'/>
					</div>
					<Button onClick={this.onSubmitChoose} id="submit" variant="primary">Submit</Button>
				</div>
				<div className='modal'>
					<Modal show={show} onHide={this.toggleShow}>
						<Modal.Header closeButton>
							<Modal.Title id='modalTitle'>{title}</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<p>{msg}</p>
						</Modal.Body>
						<Modal.Footer>
							<Button onClick={this.toggleShow} variant="secondary" >
								Close
							</Button>
						</Modal.Footer>
					</Modal>
				</div>
			</div>
		);
	}
}

export default Account;