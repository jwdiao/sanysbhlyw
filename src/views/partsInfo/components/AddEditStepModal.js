import React, {Component} from 'react';
import {Form, Input, InputNumber, Modal, Select, message} from "antd";
import {validStateList, http} from "../../../utils";

const _ = require('lodash')

const {Option} = Select;

const formItemLayout = {
    labelCol: {
        xs: {span: 24},
        sm: {span: 8},
    },
    wrapperCol: {
        xs: {span: 24},
        sm: {span: 14},
    },
};

class _AddStepModal extends Component {
    state={
        visibility:false,
    }

    componentWillMount() {
        this.setState({
            visibility: this.props.addStepModalVisible
        })
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (nextProps.addStepModalVisible !== this.props.addStepModalVisible) {
            this.setState({
                visibility: nextProps.addStepModalVisible
            })
        }
    }

    handleCancel = () => {
        console.log('Clicked cancel button');
        this.setState({
            visibility: false,
        });
        if (this.props.onCancelClickedListener) {
            this.props.onCancelClickedListener()
        }
    }

    // todo: 接口对接
    handleSubmit = (e) => {
        e.preventDefault();
        const {form} = this.props
        form.validateFields(async (err, values) => {
            if (!err) {
                // 网络请求
                let params = {}
                let requestUrl = ''

                this.setState({
                    visible: true,
                    confirmLoading: true,
                });

                requestUrl = '/material/save '
                params = Object.assign({}, params, {
                    // code: values.material.trim(),
                    // name: values.materialDescription.trim(),
                    // units: _unitList.filter(unit => unit.value === values.unit)[0].label,
                    // materialCode: values.material.trim(), // 传参时只传递物料号，物料名称等其他参数只做界面展示之用，不传递
                    // supplierCode: values.vendor.trim(),
                    // factoryCode: values.factory.trim(),
                })

                const result = await this.callNetworkRequest({
                    requestUrl,
                    params,
                    requestMethod: 'POST'
                })

                console.log('handleSubmit result',result)
                if (result && result.ret === '200') {
                    const addedData = {
                        // key: freshId(),
                        // // id: content.id,
                        // sanyId: factoryCode,
                        // sanyName: factoryName,
                        // status: 1,
                        // // createdAt: formatDate(content.createTime),
                    }
                    if (this.props.onOkClickedListener) {
                        this.props.onOkClickedListener()
                    }
                    message.success('操作成功！')
                } else {
                    message.error(`数据提交失败！`)
                }
                this.setState({
                    visible: false,
                    confirmLoading: false,
                });
            } else {
                message.error('请检查输入内容后再提交！')
            }
        });
    }

    // 调用网络请求
    callNetworkRequest = async ({requestUrl, params, requestMethod}) => {
        let result
        if (requestMethod === 'POST') {
            result = await http.post(requestUrl, params)
        } else {
            result = await http.get(requestUrl)
        }
        console.log(`request: ${requestUrl}`, 'params:', params, 'result:', result)
        return result
    }

    render() {
        const {form, selectedProcedureObj} = this.props
        const stepKey = _.get(selectedProcedureObj, 'key')
        const partName = _.get(selectedProcedureObj, 'partName', null) // 零件名称
        const stepName = _.get(selectedProcedureObj, 'stepName', null) // 程序名称
        const procedureNumber = _.get(selectedProcedureObj, 'procedureNumber', null) // 工序号
        const procedureName = _.get(selectedProcedureObj, 'procedureName', null) // 工序名称
        const procedureProduceDuration = _.get(selectedProcedureObj, 'procedureProduceDuration') // 工序生产时间
        const procedureMinimumDuration = _.get(selectedProcedureObj, 'procedureMinimumDuration') // 工序最短时间
        const isValid = _.get(selectedProcedureObj, 'isValid') // 是否有效

        const {
            getFieldDecorator, getFieldError, isFieldTouched,
        } = form

        const {visibility} = this.state

        const stepNameError = isFieldTouched('stepName') && getFieldError('stepName'); // 程序名称
        const procedureNumberError = isFieldTouched('procedureNumber') && getFieldError('procedureNumber'); // 工序号
        const procedureNameError = isFieldTouched('procedureName') && getFieldError('procedureName'); // 工序名称
        const procedureProduceDurationError = isFieldTouched('procedureProduceDuration') && getFieldError('procedureProduceDuration'); // 工序生产时间
        const procedureMinimumDurationError = isFieldTouched('procedureMinimumDuration') && getFieldError('procedureMinimumDuration'); // 工序最短时间
        const isValidError = isFieldTouched('isValid') && getFieldError('isValid'); // 是否有效

        console.log('render, selectedProcedureObj = ',selectedProcedureObj)
        return (
            <Modal
                title={stepKey?'编辑程序':'新增程序'}
                visible={visibility}
                onOk={this.handleSubmit}
                // confirmLoading={confirmLoading}
                onCancel={this.handleCancel}
                destroyOnClose={true}
            >
                <Form {...formItemLayout} onSubmit={this.handleSubmit}>

                    <Form.Item
                        label="零件名称:"
                    >
                        <div>{partName}</div>
                    </Form.Item>

                    <Form.Item
                        label="程序名称:"
                        validateStatus={stepNameError ? 'error' : ''}
                        help={stepNameError || ''}
                    >
                        {getFieldDecorator('stepName', {
                            rules: [{required: true, message: '请输入程序名称!'}],
                            initialValue: stepName
                        })(
                            <Input
                                style={{width:'100%'}}
                                placeholder="请输入程序名称"/>
                        )}
                    </Form.Item>

                    <Form.Item
                        label="工序号:"
                        validateStatus={procedureNumberError ? 'error' : ''}
                        help={procedureNumberError || ''}
                    >
                        {getFieldDecorator('procedureNumber', {
                            rules: [{required: true, message: '请输入工序号!'}],
                            initialValue: procedureNumber
                        })(
                            <Input
                                style={{width:'100%'}}
                                placeholder="请输入工序号"/>
                        )}
                    </Form.Item>

                    <Form.Item
                        label="工序名称:"
                        validateStatus={procedureNameError ? 'error' : ''}
                        help={procedureNameError || ''}
                    >
                        {getFieldDecorator('procedureName', {
                            rules: [{required: true, message: '请输入工序名称!'}],
                            initialValue: procedureName
                        })(
                            <Input
                                style={{width:'100%'}}
                                placeholder="请输入工序名称"/>
                        )}
                    </Form.Item>

                    <Form.Item
                        label="工序生产时间(分):"
                        validateStatus={procedureProduceDurationError ? 'error' : ''}
                        help={procedureProduceDurationError || ''}
                    >
                        {getFieldDecorator('procedureProduceDuration', {
                            rules: [{required: true, message: '请输入工序生产时间!'}],
                            initialValue: procedureProduceDuration
                        })(
                            <InputNumber
                                style={{width:'100%'}}
                                placeholder="请输入工序生产时间"
                                min={1}
                            />
                        )}
                    </Form.Item>

                    <Form.Item
                        label="工序最短时间(分):"
                        validateStatus={procedureMinimumDurationError ? 'error' : ''}
                        help={procedureMinimumDurationError || ''}
                    >
                        {getFieldDecorator('procedureMinimumDuration', {
                            rules: [{required: true, message: '请输入工序最短时间!'}],
                            initialValue: procedureMinimumDuration
                        })(
                            <InputNumber
                                style={{width:'100%'}}
                                placeholder="请输入工序最短时间"
                                min={1}
                            />
                        )}
                    </Form.Item>

                    <Form.Item
                        label="是否有效:"
                        hasFeedback
                        validateStatus={isValidError ? 'error' : ''}
                        help={isValidError || ''}
                    >
                        {getFieldDecorator('isValid', {
                            rules: [{required: true, message: '请选择有效状态!'}],
                            initialValue: isValid,
                        })(
                            <Select
                                placeholder="请选择有效状态"
                                autoClearSearchValue={true}
                            >
                                {
                                    validStateList.map(role => {
                                        return (
                                            <Option
                                                key={role.key}
                                                value={role.value}
                                            >{role.label}</Option>
                                        )
                                    })
                                }
                            </Select>
                        )}
                    </Form.Item>

                </Form>
            </Modal>
        );
    }
}

export const AddEditStepModal = Form.create()(_AddStepModal);