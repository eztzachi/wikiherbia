'use strict';

const React = require('react');
const ReactDOM = require('react-dom')
const when = require('when');
const client = require('./client');

const follow = require('./follow'); // function to hop multiple links by "rel"

const root = '/api';

class App extends React.Component {

	constructor(props) {
		super(props);
		this.state = {herbs: [], attributes: [], pageSize: 10, links: {}};
		this.updatePageSize = this.updatePageSize.bind(this);
		this.onCreate = this.onCreate.bind(this);
		this.onUpdate = this.onUpdate.bind(this);
		this.onDelete = this.onDelete.bind(this);
		this.onNavigate = this.onNavigate.bind(this);
	}

	loadFromServer(pageSize) {
		follow(client, root, [
			{rel: 'herbs', params: {size: pageSize}}]
		).then(herbCollection => {
			return client({
				method: 'GET',
				path: herbCollection.entity._links.profile.href,
				headers: {'Accept': 'application/schema+json'}
			}).then(schema => {
				this.schema = schema.entity;
				this.links = herbCollection.entity._links;
				return herbCollection;
			});
		}).then(herbCollection => {
			return herbCollection.entity._embedded.herbs.map(herb =>
					client({
						method: 'GET',
						path: herb._links.self.href
					})
			);
		}).then(herbPromises => {
			return when.all(herbPromises);
		}).done(herbs => {
			this.setState({
				herbs: herbs,
				attributes: Object.keys(this.schema.properties),
				pageSize: pageSize,
				links: this.links
			});
		});
	}

	onCreate(newHerb) {
		var self = this;
		follow(client, root, ['herbs']).then(response => {
			return client({
				method: 'POST',
				path: response.entity._links.self.href,
				entity: newHerb,
				headers: {'Content-Type': 'application/json'}
			})
		}).then(response => {
			return follow(client, root, [{rel: 'herbs', params: {'size': self.state.pageSize}}]);
		}).done(response => {
			if (typeof response.entity._links.last != "undefined") {
				this.onNavigate(response.entity._links.last.href);
			} else {
				this.onNavigate(response.entity._links.self.href);
			}
		});
	}

	onUpdate(herb, updatedHerb) {
		client({
			method: 'PUT',
			path: herb.entity._links.self.href,
			entity: updatedHerb,
			headers: {
				'Content-Type': 'application/json',
				'If-Match': herb.headers.Etag
			}
		}).done(response => {
			this.loadFromServer(this.state.pageSize);
		}, response => {
			if (response.status.code === 412) {
				alert('DENIED: Unable to update ' +
					herb.entity._links.self.href + '. Your copy is stale.');
			}
		});
	}

	onDelete(herb) {
		client({method: 'DELETE', path: herb.entity._links.self.href}).done(response => {
			this.loadFromServer(this.state.pageSize);
		});
	}

	onNavigate(navUri) {
		client({
			method: 'GET',
			path: navUri
		}).then(herbCollection => {
			this.links = herbCollection.entity._links;

			return herbCollection.entity._embedded.herbs.map(herb =>
					client({
						method: 'GET',
						path: herb._links.self.href
					})
			);
		}).then(herbPromises => {
			return when.all(herbPromises);
		}).done(herbs => {
			this.setState({
				herbs: herbs,
				attributes: Object.keys(this.schema.properties),
				pageSize: this.state.pageSize,
				links: this.links
			});
		});
	}

	updatePageSize(pageSize) {
		if (pageSize !== this.state.pageSize) {
			this.loadFromServer(pageSize);
		}
	}

	componentDidMount() {
		this.loadFromServer(this.state.pageSize);
	}

	render() {
		return (
			<div>
				<CreateDialog attributes={this.state.attributes} onCreate={this.onCreate}/>
				<HerbList herbs={this.state.herbs}
							  links={this.state.links}
							  pageSize={this.state.pageSize}
							  attributes={this.state.attributes}
							  onNavigate={this.onNavigate}
							  onUpdate={this.onUpdate}
							  onDelete={this.onDelete}
							  updatePageSize={this.updatePageSize}/>
			</div>
		)
	}
}

class CreateDialog extends React.Component {

	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.state = {
          englishName: '',
          description: '',
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		e.preventDefault();
		var newHerb = {};
		this.props.attributes.forEach(attribute => {
			newHerb[attribute] = ReactDOM.findDOMNode(this.refs[attribute]).value.trim();
		});
		this.props.onCreate(newHerb);
		this.state = {
            englishName: '',
            description: '',
        };
		window.location = "#";
	}

	handleChange(event) {
        const name = event.target.name;
        const value = event.target.value;
        this.setState({[name]: value});
    }

	render() {
	    const { englishName, description } = this.state;

        const inputs = [
            <p key='englishName'>
                <input type="text" name='englishName' placeholder='englishName' ref='englishName' className="field" value={this.state.englishName} onChange={this.handleChange}/>
            </p>,
            <p key='herbCategory' placeholder='choose one'>
                <select ref='herbCategory' defaultValue=''>
                    <option value="" disabled>Select Category</option>
                    <option value="PURGE_FIRE">Purge Fire</option>
                    <option value="RESOLVE_TOXICITY">Resolve Toxicity</option>
                </select>
            </p>,
            <p key='description'>
                <input type="text" name='description' placeholder='description' ref='description' className="field" value={this.state.description} onChange={this.handleChange}/>
            </p>
        ];

        let formValid = this.state.englishName.length > 0 && this.state.description.length > 0;

		return (
			<div>
				<a href="#createHerb">Create</a>

				<div id="createHerb" className="modalDialog">
					<div>
						<a href="#" title="Close" className="close">X</a>

						<h2>Create new herb</h2>

						<form>
							{inputs}
							<button onClick={this.handleSubmit} disabled={!formValid}>Create</button>
						</form>
					</div>
				</div>
			</div>
		)
	}
};

class UpdateDialog extends React.Component {

	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		e.preventDefault();
		var updatedHerb = {};
		this.props.attributes.forEach(attribute => {
			updatedHerb[attribute] = ReactDOM.findDOMNode(this.refs[attribute]).value.trim();
		});
		this.props.onUpdate(this.props.herb, updatedHerb);
		window.location = "#";
	}

	render() {
		var inputs = this.props.attributes.map(attribute => {
            if (attribute == 'englishName' || attribute == 'description') {
                return <p key={this.props.herb.entity[attribute]}>
                    <input type="text" placeholder={attribute}
                           defaultValue={this.props.herb.entity[attribute]}
                           ref={attribute} className="field" />
                </p>
            } else if (attribute == 'herbCategory') {
                return <p key={this.props.herb.entity[attribute]}>
                    <select ref={attribute} defaultValue={this.props.herb.entity[attribute]}>
                      <option value="PURGE_FIRE">Purge Fire</option>
                      <option value="RESOLVE_TOXICITY">Resolve Toxicity</option>
                    </select>
                </p>
            }
        });

		var dialogId = "updateHerb-" + this.props.herb.entity._links.self.href;

		return (
			<div key={this.props.herb.entity._links.self.href}>
				<a href={"#" + dialogId}>Update</a>
				<div id={dialogId} className="modalDialog">
					<div>
						<a href="#" title="Close" className="close">X</a>

						<h2>Update an herb</h2>

						<form>
							{inputs}
							<button onClick={this.handleSubmit}>Update</button>
						</form>
					</div>
				</div>
			</div>
		)
	}

};


class HerbList extends React.Component {

	constructor(props) {
		super(props);
		this.handleNavFirst = this.handleNavFirst.bind(this);
		this.handleNavPrev = this.handleNavPrev.bind(this);
		this.handleNavNext = this.handleNavNext.bind(this);
		this.handleNavLast = this.handleNavLast.bind(this);
		this.handleInput = this.handleInput.bind(this);
	}

	// tag::handle-page-size-updates[]
	handleInput(e) {
		e.preventDefault();
		var pageSize = ReactDOM.findDOMNode(this.refs.pageSize).value;
		if (/^[0-9]+$/.test(pageSize)) {
			this.props.updatePageSize(pageSize);
		} else {
			ReactDOM.findDOMNode(this.refs.pageSize).value = pageSize.substring(0, pageSize.length - 1);
		}
	}
	// end::handle-page-size-updates[]

	// tag::handle-nav[]
	handleNavFirst(e){
		e.preventDefault();
		this.props.onNavigate(this.props.links.first.href);
	}
	handleNavPrev(e) {
		e.preventDefault();
		this.props.onNavigate(this.props.links.prev.href);
	}
	handleNavNext(e) {
		e.preventDefault();
		this.props.onNavigate(this.props.links.next.href);
	}
	handleNavLast(e) {
		e.preventDefault();
		this.props.onNavigate(this.props.links.last.href);
	}
	// end::handle-nav[]
	// tag::herb-list-render[]
	render() {
		var herbs = this.props.herbs.map(herb =>
				<Herb key={herb.entity._links.self.href}
						  herb={herb}
						  attributes={this.props.attributes}
						  onUpdate={this.props.onUpdate}
						  onDelete={this.props.onDelete}/>
		);

		var navLinks = [];
		if ("first" in this.props.links) {
			navLinks.push(<button key="first" onClick={this.handleNavFirst}>&lt;&lt;</button>);
		}
		if ("prev" in this.props.links) {
			navLinks.push(<button key="prev" onClick={this.handleNavPrev}>&lt;</button>);
		}
		if ("next" in this.props.links) {
			navLinks.push(<button key="next" onClick={this.handleNavNext}>&gt;</button>);
		}
		if ("last" in this.props.links) {
			navLinks.push(<button key="last" onClick={this.handleNavLast}>&gt;&gt;</button>);
		}

		return (
			<div>
				<input ref="pageSize" defaultValue={this.props.pageSize} onInput={this.handleInput}/>
				<table>
					<tbody>
						<tr>
							<th>English Name</th>
							<th>Herb Category</th>
							<th>Description</th>
							<th></th>
							<th></th>
						</tr>
						{herbs}
					</tbody>
				</table>
				<div>
					{navLinks}
				</div>
			</div>
		)
	}
}

class Herb extends React.Component {
	constructor(props) {
		super(props);
		this.handleDelete = this.handleDelete.bind(this);
	}

	handleDelete() {
		this.props.onDelete(this.props.herb);
	}

	render() {
		return (
			<tr>
				<td>{this.props.herb.entity.englishName}</td>
				<td>{this.props.herb.entity.herbCategory}</td>
				<td>{this.props.herb.entity.description}</td>
				<td>
					<UpdateDialog herb={this.props.herb}
								  attributes={this.props.attributes}
								  onUpdate={this.props.onUpdate}/>
				</td>
				<td>
					<button onClick={this.handleDelete}>Delete</button>
				</td>
			</tr>
		)
	}
}

ReactDOM.render(
	<App />,
	document.getElementById('react')
)
