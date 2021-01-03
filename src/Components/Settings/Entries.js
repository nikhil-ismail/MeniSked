import React from 'react';
import Button from 'react-bootstrap/Button';
import Scroll from './../Scroll/Scroll'
import Form from 'react-bootstrap/Form'
import './Settings.css';

class Entries extends React.Component{
	constructor(){
		super();
		this.state = {
			entryList: [],
			entryName: '',
			isactive: false,
			add: true,
			id: -1
		}
	}

	componentDidMount = () => {
		this.loadEntries();
	}

	loadEntries = () => {
		fetch('https://secure-earth-82827.herokuapp.com/sked/entries')
			.then(response => response.json())
			.then(entries => this.setState({entryList: entries}));
	}

	addOrEdit = () => {
		if (this.state.add){
			this.addEntry();
		}
		else{
			this.editEntry();
		}
	}

	addEntry = () => {
		const {entryName, isactive} = this.state;
		if (entryName.length > 0){
			fetch('https://secure-earth-82827.herokuapp.com/entries', {
				method: 'post',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({
					name: entryName,
					active: isactive
				})
			})
				.then(response => response.json())
				.then(entry => {
					if (entry){
						this.loadEntries();
					}
				})
			this.setState({
				entryName: '',
				isactive: false
			})
		}
	}

	deleteCall = (e) => {
		fetch('https://secure-earth-82827.herokuapp.com/entries', {
			method: 'delete',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				id: parseInt(e.target.parentNode.id,10)
			})
		})
			.then(response => response.json())
			.then(entries => {
				if (entries){
					this.loadEntries();
				}
			})
		this.setState({
			entryName: '',
			isactive: false,
			add: true,
			id: -1
		})
	}
	
	editEntry = () => {
		const {entryName, isactive, id} = this.state;
		if (entryName.length > 0){
			fetch('https://secure-earth-82827.herokuapp.com/entries', {
				method: 'put',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({
					name: entryName,
					active: isactive,
					id: parseInt(id,10)
				})
			})
				.then(response => response.json())
				.then(entry => {
					if (entry){
						this.loadEntries();
					}
				})
			this.setState({
				entryName: '',
				isactive: false,
				add: true,
				id: -1
			})
		}
	}

	onNameChange = (e) => {
		this.setState({entryName: e.target.value});
	}

	onActiveChange = () => {
		this.setState({isactive: !this.state.isactive});
	}

	onEdit = (e) => {
		const {entryList} = this.state;
		const id = parseInt(e.target.parentNode.id,10)
		for (let i = 0; i < entryList.length; i++){
			if (entryList[i].id === id){
				this.setState({
					entryName: entryList[i].name,
					isactive: entryList[i].isactive,
					add: false,
					id: id
				})
				break;
			}
		}
	}

	onCancel = () => {
		this.setState({
			entryName: '',
			isactive: false,
			add: true,
			id: -1
		})
	}

	render(){
		const {entryList, entryName, isactive} = this.state;
		let priorityList = [];
		for (let j = 0; j < entryList.length; j++){
			priorityList.push(
				<li key={entryList[j].name} id={entryList[j].id}>
					{entryList[j].name}
					<Button key={j} onClick={this.onEdit} className="edit butn" size="sm" variant="secondary">Edit</Button>
					<Button key={-j-1} onClick={this.deleteCall} className="delete butn" size="sm" variant="danger">Delete</Button>
				</li>
			)
		}
		return(
			<div className="body">
				<div className="left">
					<div className="top">
						<h4 className="subtitle">Entry List</h4>
					</div>
					<Scroll>
						<ol className="setList">
							{priorityList}
						</ol>
					</Scroll>
				</div>
				<div className="ct right">
					<div className="top">
						<h4 className="subtitle">Add/Edit Calls</h4>
					</div>
					<Form id="callForm" >
						<div id="box" style={{border:'2px solid black', height: '125px'}}>
							<Form.Group id="name">
								<Form.Control required value={entryName} onChange={this.onNameChange} type="text" placeholder="Name" />
							</Form.Group>
						  <Form.Group  id="activeCheck" controlId="formBasicCheckbox">
						    	<Form.Check onChange={this.onActiveChange} checked={isactive} type="checkbox" label="Active"/>
						 	 </Form.Group>
						</div>
						<div className="bottom">
							<Button onClick={this.onCancel} id='callSub' variant="secondary">
								Cancel
							</Button>
							<Button id='callSub' variant="primary" onClick={this.addOrEdit}>
								Submit
							</Button>
						</div>
					</Form>
				</div>
			</div>
		);
	}
}
export default Entries;