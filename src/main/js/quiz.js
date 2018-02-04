const React = require('react');
const when = require('when');
const client = require('./client');


const follow = require('./follow'); // function to hop multiple links by "rel"

const root = '/api';

class HerbQuiz extends React.Component {
    constructor(props) {
		super(props);
		this.state = {questions: [], attributes: [], pageSize: 10, links: {}};
	}

    loadFromServer(pageSize) {
    		follow(client, root, [
    			{rel: 'herbCategoryQuestions', params: {size: pageSize}}]
    		).then(questionCollection => {
    			return client({
    				method: 'GET',
    				path: questionCollection.entity._links.profile.href,
    				headers: {'Accept': 'application/schema+json'}
    			}).then(schema => {
    				this.schema = schema.entity;
    				this.links = questionCollection.entity._links;
    				return questionCollection;
    			});
    		}).then(questionCollection => {
    			return questionCollection.entity._embedded.herbCategoryQuestions.map(question =>
                    client({
                        method: 'GET',
                        path: question._links.self.href
                    })
    			);
    		}).then(questionPromises => {
    			return when.all(questionPromises);
    		}).done(questions => {
    			this.setState({
    				questions: questions,
    				attributes: Object.keys(this.schema.properties),
    				pageSize: pageSize,
    				links: this.links
    			});
    		});
    	}

    componentDidMount() {
        this.loadFromServer(this.state.pageSize);
    }

    render() {
        return <div>
                   <h2>Quizzzzzzz</h2>
                   <QuestionList questions={this.state.questions}
                   							  links={this.state.links}
                   							  pageSize={this.state.pageSize}
                   							  attributes={this.state.attributes}/>
                 </div>;
    }
}

class QuestionList extends React.Component {

	constructor(props) {
		super(props);
	}

	render() {
		var questions = this.props.questions.map(question =>
                    <Question key={question.entity._links.self.href}
                              question={question}
                              attributes={this.props.attributes}
                               />
		);

		return (
			<div>
                {questions}
            </div>
		)
	}
}

class Question extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
            herb: null,
        };
    }

	loadFromServer() {
        client({
            method: 'GET',
            path: this.props.question.entity._links.herb.href,
        }).done(response => {
            this.setState({
                herb: response.entity
            });
        });
    }

    componentDidMount() {
        this.loadFromServer();
    }

	render() {
	    if (this.state.herb === null) {
	        return false;
	    }
	    var answers = this.props.question.entity.options.map(option =>
	        <ul key={option}>
                <input type="radio" name={this.state.herb.englishName} />
                  <label>
                    {option}
                </label>
            </ul>
       );

		return (
			<div>
			    {this.props.question.entity.textTemplate} of {this.state.herb.englishName}
			    {answers}
			</div>
		)
	}
}

module.exports = HerbQuiz;