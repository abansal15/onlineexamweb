import React from 'react';
import { connect } from 'react-redux';
import Alert from '../../common/alert';
import apis from '../../../services/Apis';
import { Post } from '../../../services/axiosCall';
import { Icon, Button, Row, Col, Radio, Checkbox } from 'antd';
import { switchQuestion, updateIsMarked, fetchTestdata } from '../../../actions/traineeAction';
import './portal.css';

class SingleQuestion extends React.Component {
    constructor(props){
        super(props);
        if(this.props.trainee.answers[this.props.trainee.activeQuestionIndex].chosenOption.length === this.props.trainee.questions[this.props.trainee.activeQuestionIndex].anscount){
            this.state = {
                AnswerSelected: true,
                options: this.props.trainee.questions[this.props.trainee.activeQuestionIndex].options,
                answers: this.props.trainee.answers[this.props.trainee.activeQuestionIndex].chosenOption,
                ticked: 0
            }
        } else {
            this.state = {
                AnswerSelected: false,
                options: this.props.trainee.questions[this.props.trainee.activeQuestionIndex].options,
                answers: this.props.trainee.answers[this.props.trainee.activeQuestionIndex].chosenOption,
                ticked: 0
            }
        }
    }

    componentWillMount(){
        this.setState((PState, Pprops) => {
            let t = 0;
            var s = PState.options.map((d, i) => {
                for(var ii = 0; ii < PState.answers.length; ii++){
                    if(PState.answers[ii] === d._id){
                        t += 1;
                        return ({
                            ...d,
                            checked: true
                        });
                    }
                }
                return ({
                    ...d,
                    checked: false
                });
            });
            return ({
                ticked: t,
                options: s
            });
        });
    }

    SaveTocloud = () => {
        Post({
            url: `${apis.UPDATE_ANSWERS}`,
            data: {
                testid: this.props.trainee.testid,
                userid: this.props.trainee.traineeid,
                qid: this.props.trainee.questions[this.props.trainee.activeQuestionIndex]._id,
                newAnswer: this.state.answers
            }
        }).then((response) => {
            if(response.data.success){
                console.log(response.data);
                var t = [...this.props.trainee.answers];
                t[this.props.trainee.activeQuestionIndex] = {
                    ...t[this.props.trainee.activeQuestionIndex],
                    chosenOption: this.state.answers,
                    isAnswered: true
                };
                this.props.updateIsMarked(t);
            } else {
                this.props.fetchTestdata(this.props.trainee.testid, this.props.trainee.traineeid);
                return Alert('error', 'Error!', response.data.message);
            }
        }).catch((err) => {
            return Alert('error', 'Error!', 'Server Error');
        });
    }

    previous = () => {
        if(this.props.trainee.activeQuestionIndex === 0){
            return null;
        }
        return (
            <Button style={{ backgroundColor: localStorage.getItem('prevButtonColor'), color: '#fff', borderColor: localStorage.getItem('prevButtonColor') }} onClick={() => { this.saveTocloud(); this.props.switchQuestion(this.props.trainee.activeQuestionIndex - 1); }}>
                Previouss
            </Button>
        )
    }

    next = () => {
        if(this.props.trainee.activeQuestionIndex === (this.props.trainee.questions.length - 1)){
            return null;
        }
        return (
            <Button style={{ backgroundColor: localStorage.getItem('nextButtonColor'), color: '#fff', borderColor: localStorage.getItem('nextButtonColor') }} onClick={() => { this.saveTocloud(); this.props.switchQuestion(this.props.trainee.activeQuestionIndex + 1); }}>
                Nextt
            </Button>
        )
    }

    OptionChanged = (index) => {
        this.setState((PState) => {
            let t = 0;
            var s = PState.options.map((d, i) => {
                if(index === i){
                    if(PState.answers.includes(d._id)){
                        var a = PState.answers.filter(v => v !== d._id);
                        this.setState({ answers: a });
                        return ({
                            ...d,
                            checked: false
                        });
                    } else {
                        this.setState({ answers: [...PState.answers, d._id] });
                        return ({
                            ...d,
                            checked: true
                        });
                    }
                } else {
                    if(PState.answers.includes(d._id)){
                        t += 1;
                        return ({
                            ...d,
                            checked: true
                        });
                    }
                    return ({
                        ...d,
                        checked: false
                    });
                }
            });
            if((PState.answers.includes(PState.options[index]._id) && (PState.ticked - 1 === PState.options[0].iscorrectcount)) || (!PState.answers.includes(PState.options[index]._id) && (PState.ticked === PState.options[0].iscorrectcount))){
                this.setState({ AnswerSelected: true });
            } else {
                this.setState({ AnswerSelected: false });
            }
            return ({
                ticked: t,
                options: s
            });
        });
    }

    render(){
        return (
            <div>
                <div className="questions-outer">
                    <div className="questions">
                        <h4>{this.props.trainee.questions[this.props.trainee.activeQuestionIndex].question}</h4>
                    </div>
                    <div className="options">
                        {this.state.options.map((d, i) => (
                            <div key={d._id} className="single-option">
                                {this.props.trainee.questions[this.props.trainee.activeQuestionIndex].anscount === 1 ?
                                    <Radio onChange={() => { this.OptionChanged(i); }} checked={d.checked}>{d.option}</Radio>
                                    :
                                    <Checkbox onChange={() => { this.OptionChanged(i); }} checked={d.checked}>{d.option}</Checkbox>
                                }
                            </div>
                        ))}
                    </div>
                </div>
                <div className="button-group">
                    <Row>
                        <Col span={12}>
                            {this.previous()}
                        </Col>
                        <Col span={12} style={{ textAlign: 'right' }}>
                            {this.next()}
                        </Col>
                    </Row>
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => ({
    trainee: state.trainee
});

export default connect(mapStateToProps, {
    switchQuestion,
    updateIsMarked,
    fetchTestdata
})(SingleQuestion);
