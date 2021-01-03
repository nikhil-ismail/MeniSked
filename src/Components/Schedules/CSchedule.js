import React from 'react';
import Calendar from './Calendar/Calendar';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import MyDocument from './../PDF/MyDocument'
import Modal from 'react-bootstrap/Modal';
import { PDFDownloadLink } from '@react-pdf/renderer';
import moment from 'moment';

import './Schedules.css';


const style = {
	position: "relative",
	margin: "10px auto",
	width: "90%"
}

class CSchedule extends React.Component{
	constructor(){
		super();
		this.state = {
			dateContext: moment(),
			show: false,
			holiDays: [],
			rHolidayList: [],
			nrHolidayList: [],
			render: false,
			callSked:[],
			day: -1,
			depts: [],
			stamp: moment().format("YYYY-MM-DD HH:mm")
		}
	}

	componentDidMount = () => {
   		this.loadrHolidays();
   		this.loadnrHolidays();
   		this.props.loadCallTypes();
   		this.loadCallSked();
   		this.loadDepts();
  	}

  	loadCallSked = () => {
  		const {callList} = this.props;
    	fetch('https://secure-earth-82827.herokuapp.com/people')
      		.then(response => response.json())
      		.then(docs => {
      			let arr = [];
      			let callIds = [];
      			for (let n = 0; n < callList.length; n++){
      				callIds.push(callList[n].id);
      			}
      			for (let i = 0; i < docs.length; i++){
      				for (let j = 0; j < docs[i].worksked.length; j++){
      					for (let m = 0; m < callIds.length; m++){
      						if (docs[i].worksked[j].id === callIds[m]){
      							arr.push({
	      							id: docs[i].worksked[j].id,
	      							date: docs[i].worksked[j].date,
	      							name: docs[i].lastname,
	      							colour: docs[i].colour,
	      							priority: this.priorityCheck(docs[i].worksked[j].id)
      							})
      						}
      					}
      				}
      			}
      			arr.sort(function(a, b){return a.priority - b.priority})
      			this.setState({callSked: arr})
      		});
  	}

  	priorityCheck = (id) => {
  		const {callList} = this.props;
		for (let n = 0; n < callList.length; n++){
			if (callList[n].id === id){
				return callList[n].priority;
			}
		}
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

	loadDepts = () => {
   		fetch('https://secure-earth-82827.herokuapp.com/departments')
			.then(response => response.json())
			.then(departments => this.setState({depts: departments}));
   	}

	onDayClick = (e,day) => {
		let dateContext = Object.assign({}, this.state.dateContext);
		dateContext = moment(dateContext).set("date", day);
		this.setState({
			dateContext: dateContext,
		});
		this.toggleShow(day);
	}

	toggleShow = (day) => {
		this.setState({
			show: !this.state.show,
			day: day
		});
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

	onMonthChange = (event) => {
		this.setMonth(event.target.value);
		this.setState({month: event.target.value})
	}

	onYearChange = (event) => {
		this.setYear(event.target.value);
	}
	
	reset = () => {
		const {today} = this.props;
		this.setState({dateContext: today});
		this.loadNewDays(today);
	}


	idToName = (id) => {
		const {callList} = this.props;
		for (let n = 0; n < callList.length; n++){
			if (callList[n].id === id){
				return callList[n].name;
			}
		}
	}

	hoverSpan = () => {
		this.setState({stamp: moment().format("YYYY-MM-DD HH:mm")})
	}

	render(){
		const {dateContext, show, holiDays, nrHolidayList, render, callSked, day, depts, stamp} = this.state;
		const {today, user, callList} = this.props;
		let yearSelect = [];

		let fYear = today.year();

		for (let i = 2020; i <= fYear + 10; i++){
			yearSelect.push(<option key={i} value={i}>{i}</option>)
		}

		let modalList = [];
		for (let i = 0; i < callSked.length; i++){
			const splitArr = callSked[i].date.split('/');
			if (splitArr[0] === dateContext.format('MM') && parseInt(splitArr[1],10) === day && splitArr[2] === dateContext.format('YYYY')){
				modalList.push(<li key={-i-1}>{this.idToName(callSked[i].id) + ' '}<span style={{'backgroundColor':callSked[i].colour}}>{callSked[i].name}</span></li>);
			}
		}

		return(
			<div className="screen">
				<Row className="clabels">
					<Col><h5 className="labels-child">Year</h5></Col>
					<Col><h5 className="labels-child">Month</h5></Col>
					<Col><Button onClick={this.reset} id="today" className="top-child" variant="primary">Today</Button></Col>
				</Row>
				<Row className="cheader">
					<Col ><select value={dateContext.format('Y')} onChange={this.onYearChange} className="top-child year selector">
	  					{yearSelect}
					</select></Col>
					<Col><select value={dateContext.format('MMMM')} onChange={this.onMonthChange} className="top-child month selector">
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
					<Col><p className="vis top-child"></p></Col>

				</Row>
				<Row className="csubheader">
					<Col>
						<Button onClick={this.prevYear} className="arrow top-child"variant="secondary">&#x25C0;</Button>
						<Button onClick={this.nextYear} className="arrow top-child"variant="secondary">&#x25B6;</Button>
					</Col>
					<Col>
						<Button onClick={this.prevMonth} className="arrow top-child"variant="secondary">&#x25C0;</Button>
						<Button onClick={this.nextMonth} className="arrow top-child"variant="secondary">&#x25B6;</Button>
					</Col>
					<Col>
						<p className="vis top-child"></p>
					</Col>
				</Row>
				<Row className="curr">
					<Col xl><h3>{dateContext.format('MMMM')+' '+dateContext.format('Y')}</h3></Col>
				</Row>
				<div className="sked">
					{ (nrHolidayList.length > 0 && !render)
						?this.loadNewDays(this.props.today)
						: false
					}
					<Calendar callList={callList} callSked={callSked} holiDays={holiDays} type="Call" dateContext={dateContext} today={today} style={style} onDayClick={(e,day) => this.onDayClick(e,day)}/>
				</div>
				<div className="bottom">
					<Col id='downloadLink'><PDFDownloadLink  document={<MyDocument colour={false} stamp={stamp} depts={depts} numNotes={[]} vNotes={[]} iNotes={[]} entries={[]} callList={callList} callSked={callSked} holiDays={holiDays} type="Call" dateContext={dateContext} user={user}/>} fileName={dateContext.format('MMMM')+dateContext.format('Y')+'callsked.pdf'}>
      					{({ blob, url, loading, error }) => (loading ? 'Loading document...' : <span onMouseOver={this.hoverSpan}>Download as Black & White PDF</span>)}
    				</PDFDownloadLink></Col>
    				<Col id='downloadLink'><PDFDownloadLink  document={<MyDocument colour={true} stamp={stamp} depts={depts} numNotes={[]} vNotes={[]} iNotes={[]} entries={[]} callList={callList} callSked={callSked} holiDays={holiDays} type="Call" dateContext={dateContext} user={user}/>} fileName={dateContext.format('MMMM')+dateContext.format('Y')+'callsked.pdf'}>
      					{({ blob, url, loading, error }) => (loading ? 'Loading document...' : <span onMouseOver={this.hoverSpan}>Download as Colour PDF</span>)}
    				</PDFDownloadLink></Col>
				</div>
				<div className='modal'>
					<Modal show={show} onHide={this.toggleShow} >
        				<Modal.Header closeButton>
          					<Modal.Title id='modalTitle'>{dateContext.format("MMMM DD, YYYY")}</Modal.Title>
       	 				</Modal.Header>
        				<Modal.Body>
        					<ul>
        						{modalList}
        					</ul>
        				</Modal.Body>
        				<Modal.Footer>
          					<Button variant="secondary" onClick={this.toggleShow}>
            					Close
          					</Button>
	        			</Modal.Footer>
      				</Modal>
				</div>

			</div>
		);



	}


}

export default CSchedule;