import React from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal';
import moment from 'moment';
import './Messages.css';

class EMessages extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			show: false,
			msg: '',
			messages: [],
			entryList: [],
			callList: [],
			ctr: 10
		}
	}

	componentDidMount = () => {
		this.loadMessages();
		this.loadEntries();
		this.loadCallTypes();
	}

	loadMessages = () => {
		fetch('https://secure-earth-82827.herokuapp.com/emessages/'+this.props.user.id)
      		.then(response => response.json())
      		.then(messages => this.setState({messages: messages.filter((message => (message.status !== 'pending' || message.maybe) && (message.deleted !== 'E')))}));
	}

	loadEntries = () => {
		fetch('https://secure-earth-82827.herokuapp.com/sked/entries')
			.then(response => response.json())
			.then(entries => this.setState({entryList: entries}));
	}

	loadCallTypes = () => {
		fetch('https://secure-earth-82827.herokuapp.com/callTypes')
			.then(response => response.json())
			.then(calls => this.setState({callList: calls}));
	}

	months = moment.months(); // List of each month

	toggleShow = (route) => {
	    this.setState({ 
			show: !this.state.show,
		    msg: route
	   	});
	 };

	showMore = () => {
		this.setState({ctr: this.state.ctr+10})
	}

	showButton = (length) => {
		if (this.state.ctr < length){
			return (<Button onClick={this.showMore} className='showMore' variant="primary">Show More</Button>);
		}
	}

	entryIdToName = (id) => {
		id = parseInt(id,10);
		const arr = [...this.state.entryList, ...this.state.callList]
		for (let i = 0; i < arr.length; i++){
			if (id === arr[i].id){
				return arr[i].name;
			}
		}
	}

	dateStyler = (dates) => {
		let splitArr = [];
		let flag = false;
		if (dates.length === 1){
			splitArr = dates[0].split('/');
			return 'on ' + this.months[splitArr[0] - 1] + ' ' + splitArr[1] + ', ' + splitArr[2];
		}

		for (let i = 0; i < dates.length; i++){
			if (dates[i].charAt(4) === '/'){
				dates[i] = dates[i].substring(0,3) + '0' + dates[i].substring(3);
			}
		}

		dates.sort(function(a, b){return a.substring(3,5) - b.substring(3,5)})

		for (let i = 0; i < dates.length; i++){
			splitArr.push(dates[i].split('/'));
		}


		for (let n = 1; n < splitArr.length; n++){
			if (splitArr[n][0] !== splitArr[n-1][0] || (splitArr[n][1] - 1) !== parseInt(splitArr[n-1][1],10) || splitArr[n][2] !== splitArr[n-1][2]){
				flag = true;
				break;
			}
		}

		if (flag){
			let str = "on " + this.months[splitArr[0][0] - 1] + ' ' + splitArr[0][1] + ', ' + splitArr[0][2];
			for (let j = 1; j < splitArr.length; j++){
				str = str + ', ' + this.months[splitArr[j][0] - 1] + ' ' + splitArr[j][1] + ', ' + splitArr[j][2];
			}
			return str;
		}

		return 'from ' + this.months[splitArr[0][0] - 1] + ' ' + splitArr[0][1] + ', ' + splitArr[0][2] + ' - ' + this.months[splitArr[splitArr.length - 1][0] - 1] + ' ' + splitArr[splitArr.length - 1][1] + ', ' + splitArr[splitArr.length - 1][2]
	
	}

	sortDates = (arr) => {
		let list = [...arr];
		let index = 0;
		let currDate = [];
		let newDate = [];
		let temp;
		let len = list.length;
		let flag = false;

		for (let i = 0; i < len - 1; i++){
			index = i;
			currDate = list[i].stamp.split('/');
			for (let j = i+1; j < len; j++){
				flag = false;
				newDate = list[j].stamp.split('/');
				if (parseInt(newDate[2],10) > parseInt(currDate[2],10)){
					flag = true;
				}
				else if (parseInt(newDate[2],10) === parseInt(currDate[2],10)){
					if (parseInt(newDate[0],10) > parseInt(currDate[0],10)){
						flag = true;
					}
					else if (parseInt(newDate[0],10) === parseInt(currDate[0],10) && parseInt(newDate[1],10) > parseInt(currDate[1],10)){
						flag = true;
					}
				}

				if (flag){
					index = j;
					currDate = list[j].stamp.split('/');
				}
			}
			if (index !== i){
				temp = list[i];
				list[i] = list[index];
				list[index] = temp;
			}
		}
		return list;
	}

	deleteMessage = (id, deleted) => {
		fetch('https://secure-earth-82827.herokuapp.com/messages', {
			method: 'delete',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				id: id,
				deleted: deleted,
				user: 'E'

			})
		})
			.then(response => response.json())
			.then(message => {
				if (message){
					this.loadMessages();
				}
			})
	}

	render(){
		const {show, msg, messages, ctr} = this.state;

		let msgs = [...messages]

		msgs = this.sortDates(msgs);

		let msgList = [];

		for (let j = 0; j < (Math.min(msgs.length,ctr)); j++){
			if (msgs[j].status === 'accepted'){
				msgList.push(
					<ListGroup key={j} horizontal>
						<ListGroup.Item className='pend list' action disabled>Peter Menikefs <span className={msgs[j].status}>{msgs[j].status}</span> your request for {this.entryIdToName(msgs[j].entryid)} {this.dateStyler(msgs[j].dates)}
						</ListGroup.Item>
						<ListGroup.Item className='edates list'>{msgs[j].stamp}</ListGroup.Item>
						<ListGroup.Item ><Button onClick={() => this.deleteMessage(msgs[j].id, msgs[j].deleted)} className="deletemsg" size="sm" variant="danger">Delete</Button></ListGroup.Item>
					</ListGroup>
				)
			}
			else if (msgs[j].status === 'denied'){
				msgList.push(
					<ListGroup key={j} horizontal>
						<ListGroup.Item className='pend list' action onClick={() => this.toggleShow(msgs[j].msg)}>Peter Menikefs <span className={msgs[j].status}>{msgs[j].status}</span> your request for {this.entryIdToName(msgs[j].entryid)} {this.dateStyler(msgs[j].dates)}
						</ListGroup.Item>
						<ListGroup.Item className='edates list'>{msgs[j].stamp}</ListGroup.Item>
						<ListGroup.Item ><Button onClick={() => this.deleteMessage(msgs[j].id, msgs[j].deleted)} className="deletemsg" size="sm" variant="danger">Delete</Button></ListGroup.Item>
					</ListGroup>
				)
			}
			else {
				msgList.push(
					<ListGroup key={j} horizontal>
						<ListGroup.Item className='pend list' action onClick={() => this.toggleShow(msgs[j].msg2)}>Peter Menikefs responded with <span className='maybed'>maybe</span> to your request for {this.entryIdToName(msgs[j].entryid)} {this.dateStyler(msgs[j].dates)}
						</ListGroup.Item>
						<ListGroup.Item className='edates list'>{msgs[j].stamp2}</ListGroup.Item>
					</ListGroup>
				)
			}
		}

		return(
			<div>
				<div className='listStyleE'>
					{msgList}
				</div>
				<div>
					{this.showButton(messages.length)}
				</div>
				<div className='modal'>
					<Modal show={show} onHide={() => this.toggleShow('')}>
						<Modal.Header closeButton>
							<Modal.Title id='modalTitle'>Denied Request Explanation</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<p>{msg}</p>
						</Modal.Body>
						<Modal.Footer>
							<Button onClick={() => this.toggleShow('')} variant="secondary" >
								Close
							</Button>
						</Modal.Footer>
					</Modal>
				</div>
			</div>



		);



	}


}

export default EMessages;