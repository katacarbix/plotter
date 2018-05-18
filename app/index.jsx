import React from 'react';
import classNames from 'classnames';
import $ from 'jquery';
import ReactTooltip from 'react-tooltip';
var urlify = require('urlify').create({spaces:'-', toLower:true});

export default class App extends React.Component {
	constructor(props){
		super(props);
		
		var store = localStorage.getItem('plotter');
		if (store == "null" || store == null){
			this.state = {
				points: [],
				properties: {
					graphTitle: "Untitled graph",
					save: "untitled-graph",
					ptSize: 10,
					xLabel: "X axis",
					xMin: -10,
					xMax: 10,
					yLabel: "Y axis",
					yMin: -10,
					yMax: 10
				}
			};
		} else {
			this.state = JSON.parse(store);
		}
	}
	newGraph(){
		this.modifyState(this.state, (os)=>{return {
			points: [],
			properties: {
				graphTitle: "Untitled graph",
				save: "untitled-graph",
				ptSize: 10,
				xLabel: "X axis",
				xMin: -10,
				xMax: 10,
				yLabel: "Y axis",
				yMin: -10,
				yMax: 10
			}
		}});
	}
	modifyState(oldState, func){
		this.setState(
			func(oldState),
			() => {
				localStorage.setItem('plotter', JSON.stringify(this.state));
			}
		);
	}
	importGraph(selector){
		var impTAVal = $(selector).find("#import-textarea").val();
		var impFIVal = $(selector).find("#import-file")[0].files;
		
		if (impFIVal.length < 1){
			this.modifyState(JSON.parse(impTAVal), (s)=>{return s});
		} else {
			var reader = new FileReader();
			reader.onLoad = (e)=>{
				console.log(e.target.result);
				this.modifyState(JSON.parse(e.target.result), (s)=>{return s});
			};
			reader.readAsText(impFIVal[0]);
		}
	}
	exportGraph(targ){
		var selector = targ.href.substring(targ.href.indexOf('#'));
		$(selector).find('pre#export-pre').text(JSON.stringify(this.state));
		
		var downloadBtn = $(selector).find('a.export-download')[0];
		downloadBtn.href = 'data:attachment/text,' + encodeURI(JSON.stringify(this.state));
		downloadBtn.target = '_blank';
		downloadBtn.download = 'plotter-'+this.state.properties.save+'.json';
	}
	render(){
		return (
			<div className="main">
				<nav>
					<div className="nav-wrapper row">
						<div className="col s12">
							<a href="/" className="brand-logo">Graph Point Plotter</a>
							<ul id="nav-mobile" className="right hide-on-med-and-down">
								<li><a onClick={()=>{this.newGraph()}}>New</a></li>
								<li><a className="modal-trigger" href="#import-modal">Import</a></li>
								<li><a className="modal-trigger" href="#export-modal" onClick={(e)=>{this.exportGraph(e.target)}}>Export</a></li>
								<li><a href="about.html">About</a></li>
							</ul>
						</div>
					</div>
				</nav>
				
				<main className="row no-pad">
					<div id="controls-container" className="gpp-container col s12 l4">
						<Controls points={this.state.points} properties={this.state.properties} modifyState={(oldState, func) => this.modifyState(oldState, func)} />
					</div>
					<div id="graph-container" className="gpp-container col s12 l8">
						<Graph points={this.state.points} properties={this.state.properties} />
					</div>
				</main>
				
				<div id="import-modal" className="modal">
					<div className="modal-content">
						<h5>Paste your code here or upload a save file</h5>
						<textarea id="import-textarea" className="materialize-textarea"></textarea><br />
						<div className="file-field input-field">
							<div className="btn">
								<span>File</span>
								<input type="file" id="import-file" />
							</div>
							<div className="file-path-wrapper">
								<input className="file-path validate" type="text" />
							</div>
						</div>
					</div>
					<div className="modal-footer fixed-footer">
						<a onClick={()=>{this.importGraph('#import-modal')}} className="btn modal-action modal-close">Import</a>
					</div>
				</div>
				
				<div id="export-modal" className="modal">
					<div className="modal-content">
						<h5>Copy the code below or download your save file</h5>
						<pre id="export-pre">An error occurred. Please refresh the page and try again.</pre>
					</div>
					<div className="modal-footer">
						<a className="btn export-download left">Download</a>
						<a className="btn modal-action modal-close right">Close</a>
					</div>
				</div>
				
				<ReactTooltip />
			</div>
		);
	}
}

class Controls extends React.Component {
	constructor(props){
		super(props);

		this.state = {
			points: this.props.points,
			properties: this.props.properties
		}
	}
	addPoint(){
		this.props.modifyState(this.state, (prevState) => {
			prevState.points.push({
				desc: "",
				color: "",
				xpos: 0,
				ypos: 0
			});
			return prevState;
		});
	}
	removePoint(targ){
		var id = targ.id.match(/\d+/g).map(Number);
		
		this.props.modifyState(this.state, (prevState) => {
			prevState.points.splice(id, 1);
			return prevState;
		});
	}
	modifyPoint(targ){
		var id = targ.id.match(/\d+/g).map(Number);
		var prop = targ.id.split('-')[1];
		var val = targ.value;
		
		this.props.modifyState(this.state, (prevState) => {
			prevState.points[id][prop] = val;
			return prevState;
		});
	}
	listPoints(){
		var res = [];
		var pts = this.state.points;
		for (var i = 0; i < pts.length; i++){
			var pt = pts[i];
			res.push(
				<li className="collection-item" key={i}>
					<div className="row"></div>
					<div className="row">
						<div className="input-field col s8">
							<input id={'p'+i+'-desc'} type="text" value={pt.desc} onChange={(e)=>this.modifyPoint(e.target)} />
							<label htmlFor={'p'+i+'-desc'} className="active">Description</label>
						</div>
						<div className="input-field col s4">
							<input id={'p'+i+'-color'} type="text" maxLength="7" value={pt.color} onChange={(e)=>this.modifyPoint(e.target)} />
							<label htmlFor={'p'+i+'-color'} className="active">Color</label>
						</div>
					</div>
					<div className="row">
						<div className="input-field col s5">
							<input id={'p'+i+'-xpos'} type="number" step="0.1" value={pt.xpos} onChange={(e)=>this.modifyPoint(e.target)} />
							<label htmlFor={'p'+i+'-xpos'} className="active">X position</label>
						</div>
						<div className="input-field col s5">
							<input id={'p'+i+'-ypos'} type="number" step="0.1" value={pt.ypos} onChange={(e)=>this.modifyPoint(e.target)} />
							<label htmlFor={'p'+i+'-ypos'} className="active">Y position</label>
						</div>
						<div className="col s2 center">
							<a id={'p'+i+'-del'} className="btn btn-delete" style={{boxShadow: 'none'}} onClick={(e)=>this.removePoint(e.target)}>-</a>
						</div>
					</div>
				</li>
			);
		}
		return res;
	}
	modifyProp(targ){
		var prop = targ.id;
		var val = targ.value;
		
		this.props.modifyState(this.state, (prevState) => {
			prevState.properties[prop] = val;
			if (prop == 'graphTitle'){
				prevState.properties.save = urlify(val);
			}
			return prevState;
		});
	}
	render(){
		return (
			<ul className="controls collection">
				<li className="collection-item">
					<div className="row"></div>
					<div className="row">
						<div className="input-field col s8">
							<input id="graphTitle" type="text" value={this.state.properties.graphTitle} onChange={(e)=>this.modifyProp(e.target)} />
							<label htmlFor="graphTitle" className="active">Title</label>
						</div>
						<div className="input-field col s4">
							<input id="ptSize" type="number" min="1" max="25" value={this.state.properties.ptSize} onChange={(e)=>this.modifyProp(e.target)} />
							<label htmlFor="ptSize" className="active">Point size (px)</label>
						</div>
					</div>
					<div className="row">
						<div className="input-field col s6">
							<input id="xLabel" type="text" value={this.state.properties.xLabel} onChange={(e)=>this.modifyProp(e.target)} />
							<label htmlFor="xLabel" className="active">X-axis label</label>
						</div>
						<div className="input-field col s3">
							<input id="xMin" type="number" step="1" value={this.state.properties.xMin} onChange={(e)=>this.modifyProp(e.target)} />
							<label htmlFor="xMin" className="active">X min</label>
						</div>
						<div className="input-field col s3">
							<input id="xMax" type="number" step="1" value={this.state.properties.xMax} onChange={(e)=>this.modifyProp(e.target)} />
							<label htmlFor="xMax" className="active">X max</label>
						</div>
					</div>
					<div className="row">
						<div className="input-field col s6">
							<input id="yLabel" type="text" value={this.state.properties.yLabel} onChange={(e)=>this.modifyProp(e.target)} />
							<label htmlFor="yLabel" className="active">Y-axis label</label>
						</div>
						<div className="input-field col s3">
							<input id="yMin" type="number" step="1" value={this.state.properties.yMin} onChange={(e)=>this.modifyProp(e.target)} />
							<label htmlFor="yMin" className="active">Y min</label>
						</div>
						<div className="input-field col s3">
							<input id="yMax" type="number" step="1" value={this.state.properties.yMax} onChange={(e)=>this.modifyProp(e.target)} />
							<label htmlFor="yMax" className="active">Y max</label>
						</div>
					</div>
				</li>
				{ this.listPoints() }
				<div className="fixed-action-btn">
					<a className="btn-floating btn-large" onClick={()=>this.addPoint()}>
						+
					</a>
				</div>
			</ul>
		);
	}
}

class Graph extends React.Component {
	constructor(props){
		super(props);

		this.state = {
			points: this.props.points,
			properties: this.props.properties
		}
	}
	listPoints(){
		var res = [];
		var pts = this.state.points;
		for (var i = 0; i < pts.length; i++){
			var pt = pts[i];
			res.push(
				<i className="point"
					id={'p'+i} key={i}
					style={{
						bottom: ((pt.ypos - this.state.properties.yMin) / (this.state.properties.yMax - this.state.properties.yMin))*100+'%',
						left: ((pt.xpos - this.state.properties.xMin) / (this.state.properties.xMax - this.state.properties.xMin))*100+'%',
						borderWidth: this.state.properties.ptSize / 2,
						borderColor: pt.color || '#000'
					}}
					data-tip={pt.desc}>
				</i>
			);
		}
		return res;
	}
	render(){
		return (
			<div className="graph-area">
				<div className="axis x-axis" style={{bottom: ((0 - this.state.properties.yMin) / (this.state.properties.yMax - this.state.properties.yMin))*100+'%'}}>
					<span className="label x-label">{this.state.properties.xLabel}</span>
				</div>
				<div className="axis y-axis" style={{left: ((0 - this.state.properties.xMin) / (this.state.properties.xMax - this.state.properties.xMin))*100+'%'}}>
					<span className="label y-label">{this.state.properties.yLabel}</span>
				</div>
				{ this.listPoints() }
			</div>
		);
	}
}
