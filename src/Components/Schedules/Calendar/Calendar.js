import React from 'react';
import moment from 'moment';
import './Calendar.css';


moment().format();


class Calendar extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			style: props.style || {}
		}
	}

	weekdays = moment.weekdays(); //List of weekdays
	weekdaysShort = moment.weekdaysShort(); //List of shortened days
	months = moment.months(); // List of each month

	year = () => {
		return this.props.dateContext.format('Y');
	}
	month = () => {
		return this.props.dateContext.format('MMMM');
	}
	daysInMonth = () => {
		return this.props.dateContext.daysInMonth();
	}
	currentDate = () => {
		return this.props.dateContext.get('date');
	}
	currentDay = () => {
		return this.props.dateContext.format('D');
	}

	firstDayofMonth = () => {
		let dateContext = this.props.dateContext;
		let firstDay = moment(dateContext).startOf('month').format('d'); //Day of week 0-6
		return firstDay;
	}

	onDayClick = (e,day) => {
		this.props.onDayClick && this.props.onDayClick(e,day);
	}

	dayType = (d) => {
		const {type} = this.props;
		if (type === "Personal"){
			return (
				<ul>
					{this.personalToday(d)}
					{this.pendingToday(d)}
				</ul>
			)
		}
		else if (type === "Call"){
			return (
				<ul>
					{this.callToday(d)}
				</ul>
				)
		}

		else{
			return (
				<ul>
					{this.workToday(d)}
					{this.noteToday(d)}
				</ul>
			)
		}
	}

	holidayToday = (d) => {
		const arr = [...this.props.holiDays]
		for (let i = 0; i < arr.length; i++){
			if (arr[i].day === d){
				return <span id="holiday">{arr[i].name}</span>
			}
		}
	}

	callToday = (d) => {
		const arr = [...this.props.callSked];
		const {dateContext} = this.props;
		let list = [];
		for (let i = 0; i < arr.length; i++){
			const splitArr = arr[i].date.split('/');
			if (splitArr[0] === dateContext.format('MM') && parseInt(splitArr[1],10) === d && splitArr[2] === dateContext.format('YYYY')){	
				list.push(<li key={i} className="call" id="call">{this.idToName(arr[i].id) + ' '}<span style={{backgroundColor:arr[i].colour}}>{arr[i].name}</span></li>);
			}
		}
		return list;
	}

	personalToday = (d) => {
		const arr = [...this.props.personalDays];
		const {dateContext} = this.props;
		for (let i = 0; i < arr.length; i++){
			const splitArr = arr[i].date.split('/');
			if (splitArr[0] === dateContext.format('MM') && parseInt(splitArr[1],10) === d && splitArr[2] === dateContext.format('YYYY')){	
				return <li key={i} className="personal" id="personal">{this.idToName(arr[i].id)}</li>
			}
		}
	}

	workToday = (d) => {
		const arr = [...this.props.sked];
		const {dateContext} = this.props;
		let list = [];
		for (let i = 0; i < arr.length; i++){
			const splitArr = arr[i].date.split('/');
			if (splitArr[0] === dateContext.format('MM') && parseInt(splitArr[1],10) === d && splitArr[2] === dateContext.format('YYYY')){	
				list.push(<li key={i} className="call" id="call">{this.idToName(arr[i].id) + ' '}<span style={{backgroundColor:arr[i].colour}}>{arr[i].name}</span></li>);
			}
		}
		return list;
	}

	noteToday = (d) => {
		const arr = [...this.props.vNotes];
		const {dateContext, testisadmin} = this.props;
		let list = [];
		for (let i = 0; i < arr.length; i++){
			const splitArr = arr[i].date.split('/');
			if (splitArr[0] === dateContext.format('MM') && parseInt(splitArr[1],10) === d && splitArr[2] === dateContext.format('YYYY')){	
				list.push(<li key={i} className="note" id="note">{arr[i].msg}</li>);
			}
		}

		if (testisadmin){
			const arr2 = [...this.props.iNotes];
			for (let i = 0; i < arr2.length; i++){
				const splitArr2 = arr2[i].date.split('/');
				if (splitArr2[0] === dateContext.format('MM') && parseInt(splitArr2[1],10) === d && splitArr2[2] === dateContext.format('YYYY')){	
					list.push(<li key={-i-1} className="note" id="iNote">{arr2[i].msg}</li>);
				}
			}
		}
		return list;
	}

	numToday = (d, id) => {
		const {numNotes, testisadmin, dateContext} = this.props;
		if (numNotes && testisadmin){
			let idVar = 'num';
			const arr = [...numNotes];
			for (let i = 0; i < arr.length; i++){
				const splitArr = arr[i].date.split('/');
				if (splitArr[0] === dateContext.format('MM') && parseInt(splitArr[1],10) === d && splitArr[2] === dateContext.format('YYYY')){	
					if (id){
						idVar = 'num2'
					}
					return <span key={i} id={idVar}>{arr[i].msg}</span>
				}
			}
		}
	}

	idToName = (id) => {
		const {callList, entries} = this.props;
		for (let n = 0; n < callList.length; n++){
			if (callList[n].id === id){
				return callList[n].name;
			}
		}
		for (let i = 0; i < entries.length; i++){
			if (entries[i].id === id){
				return entries[i].name;
			}
		}
	}

	pendingToday = (d) => {
		const arr = [...this.props.pending];
		const {dateContext} = this.props;
		for (let i = 0; i < arr.length; i++){
			for (let n = 0; n < arr[i].dates.length; n++){
				const splitArr = arr[i].dates[n].split('/');
				if (splitArr[0] === dateContext.format('MM') && parseInt(splitArr[1],10) === d && splitArr[2] === dateContext.format('YYYY')){
					if (arr[i].maybe){
						return <li key={i+n} className="maybe" id="maybe">{this.idToName(parseInt(arr[i].entryid,10))}</li>
					}
					else {
						return <li key={i+n} className="pending" id="pending">{this.idToName(parseInt(arr[i].entryid,10))}</li>
					}
				}
			}
			
		}
	}

	render(){

		//Map the weekdays as <td>
		let weekdays = this.weekdaysShort.map((day) => {
			return (
				<td key={day} className="week-day">{day}</td>
			)
		});
		let blanks = [];
		for (let i = 0; i < this.firstDayofMonth(); i++){
			blanks.push(<td key={i*80} className="emptySlot">{" "}</td>);	
		}

		let daysInMonth = [];
		for (let d = 1; d <= this.daysInMonth(); d++){
			let id = (this.holidayToday(d));
			let className = (d === this.currentDay() ? "day current-day" : "day");
			daysInMonth.push(
				<td key={d} onClick={(e) => {this.onDayClick(e,d)}} className={className}>
					<div className="spacer">
						{id}
						{this.numToday(d,id)}
						<span className="text" >{d}</span>
					</div>
					<hr/>
					{this.dayType(d)}
				</td>
			);
		}

		let len = blanks.length + daysInMonth.length;

		let extraBlanks = [];

		while ((len % 7)!== 0){
			len++;
			extraBlanks.push(<td key={len} className="emptySlot">{" "}</td>)
		}

		var totalSlots = [...blanks, ...daysInMonth, ...extraBlanks];
		let rows = [];
		let cells = [];

		totalSlots.forEach((row, i) => {
			if ((i % 7) !== 0 ) {
				cells.push(row);
			}
			else{
				let insertRow = cells.slice();
				rows.push(insertRow);
				cells = [];
				cells.push(row);
			}
			if (i === totalSlots.length -1 ){
				let insertRow = cells.slice();
				rows.push(insertRow);
			}
		});

		let trElements = rows.map((d, i) => {
			return (
				<tr key={i*100}>
					{d}
				</tr>
			);
		})

		return(
			<div className="calendar-container" style={this.state.style}>
				<table className="calendar">
					<tbody>
						<tr>
							{weekdays}
						</tr>
						{trElements}
					</tbody>
				</table>
			</div>
		);



	}


}

export default Calendar;