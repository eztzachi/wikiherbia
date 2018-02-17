const React = require('react');
const when = require('when');
const client = require('./client');


const follow = require('./follow'); // function to hop multiple links by "rel"

const root = '/api';

class HerbQuiz extends React.Component {
    constructor(props) {
		super(props);
		this.state = {questions: [], quizID: null};
	}

    loadFromServer() {
        client({
            method: 'GET',
            path: '/api/quiz',
        }).then(response => {
            this.setState({
                quizID: response.entity,
            });
        }).then(response => {
            return client({
                method: 'GET',
                path: '/api/quizzes/' + this.state.quizID,
            });
        }).done(quiz => {
            this.setState({
                questions: quiz.entity.questions,
            });
        });
    }

    componentDidMount() {
        this.loadFromServer();
    }

    render() {
        return <div>
                   <h2>Quizzzzzzz</h2>
                   <QuestionList quizID={this.state.quizID} questions={this.state.questions} />
                 </div>;
    }
}

class QuestionList extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
		    qanda: {},
		}
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleAnswerChange = this.handleAnswerChange.bind(this);
	}

	handleSubmit(e) {
    	e.preventDefault();
    	client({
            method: 'POST',
            path: '/api/quiz/submission',
            entity: {quizID: this.props.quizID, mapping: this.state.qanda},
            headers: {'Content-Type': 'application/json'}
        }).done(response => {}

        );
    }

    handleAnswerChange(id, value) {
        let qanda = this.state.qanda;
        qanda[id] = value;
        this.setState(qanda: qanda);
    }

	render() {
		var questions = this.props.questions.map(question =>
                    <Question key={question.id}
                              question={question}
                              onChange={this.handleAnswerChange}
                               />
		);

		return (
		    <form onSubmit={this.handleSubmit}>
                <div>
                    {questions}
                </div>
                <input type="submit" value="Submit" />
            </form>
		)
	}
}

class Question extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
            herb: null,
            value: '',
        };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.setState({
            herb: this.state.herb,
            value: event.target.value
        });
        this.props.onChange(this.props.question.id, event.target.value);
    }

	loadFromServer() {
        client({
            method: 'GET',
            path: this.props.question._links.herb.href,
        }).done(response => {
            this.setState({
                herb: response.entity,
                value: this.state.value
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
	    var answers = this.props.question.options.map(option =>
	        <ul key={option}>
                <input type="radio"
                    name={this.state.herb.englishName}
                    value={option}
                    onChange={this.handleChange}
                    />
                  <label>
                    {option}
                </label>
            </ul>
       );

		return (
			<div>
			    {this.props.question.textTemplate} {this.state.herb.englishName}
			    {answers}
			</div>
		)
	}
}

module.exports = HerbQuiz;