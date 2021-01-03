import React from 'react';
import Calendar from './Calendar/Calendar';
import MyDocument from './../PDF/MyDocument'
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { PDFDownloadLink } from '@react-pdf/renderer';
import moment from 'moment';


import './Schedules.css';

const style = {
	position: "relative",
	margin: "10px auto",
	width: "90%"
}


class PerSchedule extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			activeDocs: [],
			entries: [],
			docIndex: 0,
			entryIndex: 0,
			show: false,
			dateContext: moment(),
			radio: -1,
			day: 0,
			rHolidayList: [],
			nrHolidayList: [],
			holiDays: [],
			personalDays: [],
			render: false,
			pending: [],
			loaded: false,
			depts: [],
			stamp: moment().format("YYYY-MM-DD HH:mm")
		}
	}

	componentDidMount = () => {
   		this.loadActiveDocs();
   		this.loadEntries();
   		this.props.loadCallTypes();
   		this.loadrHolidays();
   		this.loadnrHolidays();
   		this.loadDepts();
  	}

	loadrHolidays = () => {
		fetch('https://secure-earth-82827.herokuapp.com/holiday/r')
			.then(response => response.json())
			.then(holidays => this.setState({rHolidayList: holidays.filter((holiday => holiday.isactive === true))}));
	}

	loadnrHolidays = () => {
		fetch('https://secure-earth-82827.herokuapp.com/holiday/nr')
			.then(response => response.json())
			.then(holidays => this.setState({nrHolidayList: holidays}));
	}

  	loadActiveDocs = () => {
    	fetch('https://secure-earth-82827.herokuapp.com/sked/docs')
      		.then(response => response.json())
      		.then(docs => {
      			if (!this.state.render){
      				const doctors = [...docs];
      				for (let i = 0; i < doctors.length; i++){
      					if (doctors[i].id === this.props.user.id){
      						this.loadPersonalDays(i,doctors);
      						this.setState({
      							docIndex: i
      						})
      					}
      				}
      			}
      			this.setState({activeDocs: docs})
      		});

  	}

  	loadEntries = () => {
  		fetch('https://secure-earth-82827.herokuapp.com/sked/entries')
      		.then(response => response.json())
      		.then(entries => this.setState({entries: entries.filter((entry => entry.isactive === true))}));
  	}

	loadNewDays = (dateContext) => {
		let newArr = [];
		this.state.nrHolidayList.forEach((nholiday => {
			nholiday.eventsked.forEach((date => {
				let dateArr = date.split("/");
				if (dateArr[0] === dateContext.format('MM') && dateArr[2] === dateContext.format('YYYY')){
					newArr.push({
						day: parseInt(dateArr[1],10),
						name: nholiday.name
					});
				}
			}))
		}))

		this.state.rHolidayList.forEach((holiday => {
			if (holiday.month === dateContext.format('MMMM')){
				newArr.push({
					day:holiday.day,
					name: holiday.name
				});
			}
		}))
		this.setState({
			holiDays: newArr,
			render: true}
		);
	}

	loadPersonalSked = (user) => {
		let activeDocs = [...this.state.activeDocs];
		for (let i = 0; i < activeDocs.length; i++){
			if (user.id === activeDocs[i].id){
				let currentUser = Object.assign({}, activeDocs[i]);
				currentUser.worksked = [...user.worksked];
				activeDocs[i] = currentUser;
				this.setState({
					activeDocs: activeDocs,
					personalDays: currentUser.worksked
				});
			}
		}
	}

	loadPersonalDays = (index, docs = this.state.activeDocs) => {
		this.setState({
			personalDays: [...docs[index].worksked]
		})
		
	}

	loadPending = (userid = this.props.user.id) => {
		fetch('https://secure-earth-82827.herokuapp.com/emessages/'+userid)
      		.then(response => response.json())
      		.then(messages => this.setState({pending: messages.filter((message => message.status === 'pending'))}));
	}

	loadDepts = () => {
   		fetch('https://secure-earth-82827.herokuapp.com/departments')
			.then(response => response.json())
			.then(departments => this.setState({depts: departments}));
   	}

	onDayClick = (e,day) => {
		const id = this.state.entries[this.state.entryIndex].id;
		if (id === 1){
			this.setState({day:day})
			this.toggleShow();
		}
		else{
			this.assignOrDelete(id, day);
		}
	}

	assignCall = (typeID, method, date) => {
		fetch('https://secure-earth-82827.herokuapp.com/sked/assign', {
			method: method,
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				docId: this.state.activeDocs[this.state.docIndex].id,
				typeId: typeID,
				date: date
			})
		})
		.then(response => response.json())
		.then(user => {
			if (user.lastname){
				this.loadPersonalSked(user);
			}
		})
		if (this.state.radio !== -1){
			this.toggleShow();
		}
	}

	requestCall = (typeID, date) => {
		fetch('https://secure-earth-82827.herokuapp.com/request', {
			method: 'post',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				docid: this.props.user.id,
				entryid: typeID,
				date: date,
				stamp: this.props.today.format('MM/DD/YYYY')
			})
		})
		.then(response => response.json())
		.then(message => {
			if (message){
				this.loadPending();
			}
		})
		if (this.state.radio !== -1){
			this.toggleShow();
		}
	}

	editCall = (typeID, date) => {
		fetch('https://secure-earth-82827.herokuapp.com/request', {
			method: 'put',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				docid: parseInt(this.props.user.id),
				entryid: parseInt(typeID,10),
				date: date
			})
		})
		.then(response => response.json())
		.then(message => {
			if (message){
				this.loadPending();
			}
		})
		if (this.state.radio !== -1){
			this.toggleShow();
		}
	}

	deleteCall = (typeID, date, docid = parseInt(this.props.user.id,10)) => {
		fetch('https://secure-earth-82827.herokuapp.com/drequest', {
			method: 'put',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				docid: docid,
				entryid: parseInt(typeID,10),
				date: date,
				pending: this.state.pending
			})
		})
		.then(response => response.json())
		.then(messages => {
			if (messages){
				this.loadPending();
			}
		})
		if (this.state.radio !== -1){
			this.toggleShow();
		}
	}

	assignOrDelete = (typeId, day = this.state.day) => {
		const {dateContext, personalDays, pending} = this.state;
		const {user} = this.props;
		if (typeId !== -1){
			const typeID = parseInt(typeId,10);
			const date = dateContext.format('MM')+'/'+day+'/'+dateContext.format('YYYY');
			if (user.isadmin){
				let method = 'post';
				for (let i = 0;  i < personalDays.length; i++){
					if (personalDays[i].date === date && typeID === personalDays[i].id){
						method = 'delete';
						break;
					}
				}
				this.assignCall(typeID, method, date);
				for (let j = 0; j < pending.length; j++){
					for (let n = 0; n < pending[j].dates.length; n++){
						if (pending[j].dates[n] === date){
							this.deleteCall(pending[j].entryid, date, this.state.activeDocs[this.state.docIndex].id);
							break;
						}
					}
				}

			}
			else if (!user.isadmin){
				let flag = false;
				let flag2 = false;

				for (let j = 0; j < pending.length; j++){
					for (let n = 0; n < pending[j].dates.length; n++){
						if (pending[j].dates[n] === date){
							if (parseInt(pending[j].entryid,10) === typeID){
								flag2 = true;
							}
							this.deleteCall(typeID, date);
							break;
						}
					}
				}

				if (!flag2){
					for (let i = 0; i < pending.length; i++){
						if (user.id === parseInt(pending[i].docid,10) && typeID === parseInt(pending[i].entryid,10)){
							flag = true;
						}
					}
					if (!flag){
						this.requestCall(typeID, date);
					}
					else{
						this.editCall(typeID, date)
					}
				}
			}
		}

		this.setState({
				day:0,
				radio:-1,
				typeId:-1
		})
	}

	months = moment.months(); // List of each month

	setMonth = (month) => {
		let monthNo = this.months.indexOf(month);
		let dateContext = Object.assign({}, this.state.dateContext)
		dateContext = moment(dateContext).set("month", monthNo);
		this.setState({
			dateContext: dateContext,
		});
		this.loadNewDays(dateContext);
	}

	nextMonth = () => {
		let dateContext = Object.assign({}, this.state.dateContext);
		dateContext = moment(dateContext).add(1, "month");
		if (dateContext.year() <= (this.props.today.year() + 10)){
			this.setState({
				dateContext: dateContext,
			});
			this.loadNewDays(dateContext);
		}
	}

	prevMonth = () => {
		let dateContext = Object.assign({}, this.state.dateContext);
		dateContext = moment(dateContext).subtract(1, "month");
		if (dateContext.year() >= 2020){
			this.setState({
				dateContext: dateContext,
			});
			this.loadNewDays(dateContext);
		}

	}

	nextDoc = () => {
		const {activeDocs, docIndex} = this.state;
		let i = docIndex;
		if (i !== (activeDocs.length - 1)){
			this.loadPersonalDays(i+1);
			this.loadPending(activeDocs[i+1].id);
			this.setState({docIndex: (i+1)});
		}
		else{
			this.loadPersonalDays(0);
			this.loadPending(activeDocs[0].id);
			this.setState({docIndex: 0});
		}
	}
	prevDoc = () => {
		const {docIndex, activeDocs} = this.state;
		let i = docIndex;
		if (i !== 0){
			this.loadPersonalDays(i-1);
			this.loadPending(activeDocs[i-1].id);
			this.setState({docIndex: (i-1)});
		}
		else{
			this.loadPersonalDays(activeDocs.length - 1);
			this.loadPending(activeDocs[activeDocs.length - 1].id);
			this.setState({docIndex: (activeDocs.length - 1)});
		}
	}
	nextEntry = () => {
		let i = this.state.entryIndex;
		if (i !== (this.state.entries.length - 1)){
			this.setState({entryIndex: (i+1)});
		}
		else{
			this.setState({entryIndex: 0});
		}
	}

	prevEntry = () => {
		let i = this.state.entryIndex;
		if (i !== 0){
			this.setState({entryIndex: (i-1)});

		}
		else{
			this.setState({entryIndex: (this.state.entries.length - 1)});
		}
	}

	nextYear = () => {
		if ((this.state.dateContext.year() + 1) <= (this.props.today.year() + 10)){
			let dateContext = Object.assign({}, this.state.dateContext);
			dateContext = moment(dateContext).add(1, "year");
			this.setState({
				dateContext: dateContext
			});
			this.loadNewDays(dateContext);
		}
	}

	prevYear = () => {
		if ((this.state.dateContext.year() - 1) >= 2020) {
			let dateContext = Object.assign({}, this.state.dateContext);
			dateContext = moment(dateContext).subtract(1, "year");
			this.setState({
				dateContext: dateContext
			});
			this.loadNewDays(dateContext);
		}
	}

	setYear = (year) => {
		let dateContext = Object.assign({}, this.state.dateContext);
		dateContext = moment(dateContext).set("year",year);
		this.setState({
			dateContext: dateContext
		})
		this.loadNewDays(dateContext);
	}

	onPhysicianChange = (event) => {
		const {activeDocs} = this.state;
		if (event.target.key){
			this.loadPersonalDays(event.target.key);
			this.setState({docIndex: event.target.key})
		}
		else{
			let index = -1;
			for (let i = 0; i < activeDocs.length; i++){
				if (activeDocs[i].lastname === event.target.value){
					index = i;
					break;
				}
			}
			this.loadPersonalDays(index);
			this.loadPending(activeDocs[index].id);
			this.setState({docIndex: index})
		}
	}

	onEntryChange = (event) => {
		const {entries} = this.state;
		let index = -1;
		for (let i = 0; i < entries.length; i++){
			if (entries[i].name === event.target.value){
				index = i;
				break;
			}
		}
		this.setState({entryIndex: index})
	}

	onMonthChange = (event) => {
		this.setMonth(event.target.value);
		this.setState({month: event.target.value})
	}

	onYearChange = (event) => {
		this.setYear(event.target.value);
	}

	radioChange = (event) => {
		this.setState({radio: event.target.id})
	}

	toggleShow = () => {
		this.setState({show: !this.state.show})
	}

	adminButton = () => {
		if (this.props.user.isadmin){
			return (
			<div>
				<Button onClick={this.prevDoc} className="arrow top-child" variant="secondary">&#x25C0;</Button>
				<Button onClick={this.nextDoc} className="arrow top-child" variant="secondary">&#x25B6;</Button>
			</div>
			);
		}
		else{
			return <p className="vis top-child"></p>
		}
	}

	reset = () => {
		const {today} = this.props;
		this.setState({dateContext: today});
		this.loadNewDays(today);
	}
	
	hoverSpan = () => {
		this.setState({stamp: moment().format("YYYY-MM-DD HH:mm")})
	}

	render(){
		const {show, dateContext, activeDocs, docIndex, entries, entryIndex, holiDays, nrHolidayList, render, personalDays, pending, loaded, depts, stamp} = this.state;
		const {user, today, callList} = this.props;

		if (user.id && !loaded){
			this.loadPending();
			this.setState({loaded: true})
		}

		let docSelect = activeDocs.map((doc,i) => {
			return <option key={i} value={doc.lastname}>{doc.lastname}</option>
		})

		let adminSelect = () => {
			let user = this.props.user;
			if (user.isadmin && activeDocs.length!==0){
				return (
					<select value={activeDocs[docIndex].lastname} onChange={this.onPhysicianChange} className="top-child doc selector">
  						{docSelect}
					</select>
				);
			}
			else{
				return (
					<h6 className="top-child">{user.lastname}</h6>
				);
			}
		}

		let entryFilter = entries.filter((entry) => {
			return entry.isactive;
		})

		let entrySelect = entryFilter.map((entry, i) => {
			return <option key={i} value={entry.name}>{entry.name}</option>
		})

		let eSelect = () => {
			if (entries.length !== 0){
				return (
					<select value={entries[entryIndex].name} onChange={this.onEntryChange} className="top-child types selector">
						{entrySelect}
					</select>
				);
			}
			else{
				return <p id='entriesP'>Entries</p>
			}
		}

		let yearSelect = [];
		let fYear = today.year();

		for (let i = 2020; i <= fYear + 10; i++){
			yearSelect.push(<option key={i} value={i}>{i}</option>)
		}

		let radioSelect = [];
		for (let j = 0; j < callList.length; j++){
			if (callList[j].isactive){
				radioSelect.push(
				<Form.Check required key={j} name="callType" type='radio' id={callList[j].id} label={callList[j].name}/>
				)
			}
		}

		return(
			<div className="screen">
				<Row className="labels">
					<Col><h5 className="labels-child">Physician</h5></Col>
					<Col><h5 className="labels-child">Type of Entry</h5></Col>
					<Col><h5 className="labels-child">Month</h5></Col>
					<Col><h5 className="labels-child">Year</h5></Col>
					<Col ><Button onClick={this.reset} id="today" className="top-child"variant="primary">Today</Button></Col>
				</Row>
				<Row className="header">
					<Col >{adminSelect()}</Col>
					<Col >{eSelect()}</Col>
					<Col ><select value={dateContext.format('MMMM')} onChange={this.onMonthChange} className="top-child month selector">
	  					<option value="January">January</option>
	  					<option value="February">February</option>
	  					<option value="March">March</option>
	  					<option value="April">April</option>
	  					<option value="May">May</option>
	  					<option value="June">June</option>
	  					<option value="July">July</option>
	  					<option value="August">August</option>
	  					<option value="September">September</option>
	  					<option value="October">October</option>
	  					<option value="November">November</option>
	  					<option value="December">December</option>
					</select></Col>
					<Col ><select value={dateContext.format('Y')} onChange={this.onYearChange} className="top-child year selector">
					{yearSelect}
					</select></Col>
					<Col id="smallCol"><p className="vis labels-child"></p></Col>
				</Row>
				<Row className="subheader">
					<Col>
						{this.adminButton()}
					</Col>
					<Col>
						<Button onClick={this.prevEntry} className="arrow top-child"variant="secondary">&#x25C0;</Button>
						<Button onClick={this.nextEntry} className="arrow top-child"variant="secondary">&#x25B6;</Button>
					</Col>
					<Col >
						<Button onClick={this.prevMonth} className="arrow top-child"variant="secondary">&#x25C0;</Button>
						<Button onClick={this.nextMonth} className="arrow top-child"variant="secondary">&#x25B6;</Button>
					</Col>
					<Col>
						<Button onClick={this.prevYear} className="arrow top-child"variant="secondary">&#x25C0;</Button>
						<Button onClick={this.nextYear} className="arrow top-child"variant="secondary">&#x25B6;</Button>
					</Col>
					<Col>
						<p className="vis top-child"></p>
					</Col>
				</Row>
				<Row className="labels1">
					<Col><h5 className="labels-child">Physician</h5></Col>
					<Col><h5 className="labels-child">Type of Entry</h5></Col>
				</Row>
				<Row className="header1">
					<Col >{adminSelect()}</Col>
					<Col >{eSelect()}</Col>
				</Row>

				<Row className="subheader1">
					<Col>
						{this.adminButton()}
					</Col>
					<Col>
						<Button onClick={this.prevEntry} className="arrow top-child"variant="secondary">&#x25C0;</Button>
						<Button onClick={this.nextEntry} className="arrow top-child"variant="secondary">&#x25B6;</Button>
					</Col>
				</Row>
				<Row className="labels2">
					<Col><h5 className="labels-child">Month</h5></Col>
					<Col><h5 className="labels-child">Year</h5></Col>
				</Row>
				<Row className="header2">
					<Col ><select value={dateContext.format('MMMM')} onChange={this.onMonthChange} className="top-child month selector">
	  					<option value="January">January</option>
	  					<option value="February">February</option>
	  					<option value="March">March</option>
	  					<option value="April">April</option>
	  					<option value="May">May</option>
	  					<option value="June">June</option>
	  					<option value="July">July</option>
	  					<option value="August">August</option>
	  					<option value="September">September</option>
	  					<option value="October">October</option>
	  					<option value="November">November</option>
	  					<option value="December">December</option>
					</select></Col>
					<Col ><select value={dateContext.format('Y')} onChange={this.onYearChange} className="top-child year selector">
					{yearSelect}
					</select></Col>
				</Row>
				<Row className="subheader2">
					<Col >
						<Button onClick={this.prevMonth} className="arrow top-child"variant="secondary">&#x25C0;</Button>
						<Button onClick={this.nextMonth} className="arrow top-child"variant="secondary">&#x25B6;</Button>
					</Col>
					<Col>
						<Button onClick={this.prevYear} className="arrow top-child"variant="secondary">&#x25C0;</Button>
						<Button onClick={this.nextYear} className="arrow top-child"variant="secondary">&#x25B6;</Button>
					</Col>
				</Row>
				<div className="curr">
					<h3 id='pcurr'>{dateContext.format('MMMM')+' '+dateContext.format('Y')}</h3>
					<Button onClick={this.reset} id="today1" className="top-child"variant="primary">Today</Button>
				</div>

				<div className="sked">
					{ (nrHolidayList.length > 0 && !render)
						?this.loadNewDays(this.props.today)
						: false
					}
					<Calendar pending={pending} entries={entries} callList={callList} personalDays={personalDays} holiDays={holiDays} type="Personal" dateContext={dateContext} today={today} style={style} onDayClick={(e,day) => this.onDayClick(e,day)}/>
				</div>
				<div className="bottom">
					<Col id='downloadLink'><PDFDownloadLink onMouseOver={() => console.log('hover')} document={<MyDocument colour={false} stamp={stamp} depts={depts} numNotes={[]} vNotes={[]} iNotes={[]} entries={entries} callList={callList} personalDays={personalDays} holiDays={holiDays} type={user.firstname+' '+user.lastname+"'s Personal"} dateContext={dateContext} today={today} style={style} onDayClick={(e,day) => this.onDayClick(e,day)} user={this.props.user}/>} fileName={dateContext.format('MMMM')+dateContext.format('Y')+'pesonalsked.pdf'}>
      					{({ blob, url, loading, error }) => (loading ? 'Loading document...' : <span onMouseOver={this.hoverSpan}>Download as PDF</span>)}
    				</PDFDownloadLink></Col>
				</div>

				<div className='modal'>
					<Modal show={show} onHide={this.toggleShow}>
        				<Modal.Header closeButton>
          					<Modal.Title id='modalTitle'>Select Call Type</Modal.Title>
       	 				</Modal.Header>
        				<Form>
        					<Modal.Body>
        					<Form.Group onChange={this.radioChange} controlId="formBasicRadio">
      							{radioSelect}
  							</Form.Group>
        				</Modal.Body>
        				<Modal.Footer>
          					<Button onClick={this.toggleShow} variant="secondary" >
            					Close
          					</Button>
          					 <Button onClick={() => this.assignOrDelete(this.state.radio)} variant="primary" >
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

export default PerSchedule;