import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Form, InputNumber, Input, Button, Select } from 'antd';
import { changeStep, changeBasicNewTestDetails } from '../../../actions/testAction';
import { SecurePost } from '../../../services/axiosCall';
import './newtest.css';
import apis from '../../../services/Apis';
import { SketchPicker } from 'react-color';
const { Option } = Select;

class BasicTestFormO extends Component {
    constructor(props){
        super(props);
        this.state = {
            checkingName: "",
            prevButtonColor: localStorage.getItem('prevButtonColor') || '#009999',
            nextButtonColor: localStorage.getItem('nextButtonColor') || '#009999'
        };
    }

    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log(values)
                this.props.changeBasicNewTestDetails({
                    testType:"pre",
                    testTitle: values.title,
                    testDuration : values.duration,
                    OrganisationName: values.organisation,
                    testSubject: values.subjects,
                    passPercentage: values.passPercentage
                })
                this.props.changeStep(1);
            }
        });
    };

    handlePrevColorChange = (color) => {
        this.setState({ prevButtonColor: color.hex });
        localStorage.setItem('prevButtonColor', color.hex);
    }

    handleNextColorChange = (color) => {
        this.setState({ nextButtonColor: color.hex });
        localStorage.setItem('nextButtonColor', color.hex);
    }

    validateTestName = (rule, value, callback) => {
        if(value.length>=5){
            this.setState({
                checkingName:"validating"
            })
            SecurePost({
                url: apis.CHECK_TEST_NAME,
                data: { testname: value }
            }).then((data)=>{
                console.log(data);
                if(data.data.success){
                    if(data.data.can_use){
                        this.setState({ checkingName: "success" });
                        callback();
                    } else {
                        this.setState({ checkingName: "error" });
                        callback('Another test exists with the same name.');
                    }
                } else {
                    this.setState({ checkingName: "success" });
                    callback();
                }
            }).catch((ee)=>{
                console.log(ee);
                this.setState({ checkingName: "success" });
                callback();
            });
        } else {
            callback();
        }
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <div className="basic-test-form-outer">
                <div className="basic-test-form-inner">
                    <Form onSubmit={this.handleSubmit}>
                        <Form.Item label="Test Title" hasFeedback validateStatus={this.state.checkingName}>
                            {getFieldDecorator('title', {
                                initialValue: this.props.test.newtestFormData.testTitle,
                                rules: [
                                    { required: true, message: 'Please give the test title' },
                                    { min: 5, message: 'Title should be at least 5 characters long' },
                                    { validator: this.validateTestName }
                                ],
                            })(
                                <Input placeholder="Test Title" />
                            )}
                        </Form.Item>
                        <Form.Item label="Subjects" hasFeedback>
                            {getFieldDecorator('subjects', {
                                initialValue: this.props.test.newtestFormData.testSubject,
                                rules: [{ required: true, message: 'Please select a test type' }],
                            })(
                                <Select
                                    mode="multiple"
                                    placeholder="Select one or more subjects"
                                    style={{ width: '100%' }}
                                    allowClear={true}
                                    optionFilterProp="s"
                                >
                                    {this.props.admin.subjectTableData.map(item => (
                                        <Select.Option key={item._id} value={item._id} s={item.topic}>
                                            {item.topic}
                                        </Select.Option>
                                    ))}
                                </Select>
                            )}
                        </Form.Item>
                        <Form.Item label="Test Duration (in mins)" hasFeedback>
                            {getFieldDecorator('duration', {
                                initialValue: this.props.test.newtestFormData.testDuration,
                                rules: [{ required: true, message: 'Please give test duration' }],
                            })(
                                <InputNumber style={{ width: '100%' }} placeholder="Test Duration" min={0} max={180} />
                            )}
                        </Form.Item>
                        <Form.Item label="Organisation Name" hasFeedback>
                            {getFieldDecorator('organisation', {
                                initialValue: this.props.test.newtestFormData.OrganisationName
                            })(
                                <Input placeholder="Organisation Name" />
                            )}
                        </Form.Item>
                        <Form.Item label="Pass percentage " hasFeedback>
                            {getFieldDecorator('passPercentage', {
                                initialValue: this.props.test.newtestFormData.passPercentage
                            })(
                                <InputNumber placeholder="pass percentage" min={0} max={100} />
                            )}
                        </Form.Item>
                        <Form.Item label="Previous Button Color">
                            <SketchPicker 
                                color={this.state.prevButtonColor}
                                onChangeComplete={this.handlePrevColorChange}
                            />
                        </Form.Item>
                        <Form.Item label="Next Button Color">
                            <SketchPicker 
                                color={this.state.nextButtonColor}
                                onChangeComplete={this.handleNextColorChange}
                            />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" block>
                                Next
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        );
    }
}

const BasicTestForm = Form.create({ name: 'Basic Form' })(BasicTestFormO);

const mapStateToProps = state => ({
    test: state.test,
    admin: state.admin
});

export default connect(mapStateToProps, {
    changeStep,
    changeBasicNewTestDetails
})(BasicTestForm);
