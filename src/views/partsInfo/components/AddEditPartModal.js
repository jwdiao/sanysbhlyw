import React, {Component} from 'react';
import {Form, Input, InputNumber, Modal, Select, message} from "antd";
import {validStateList, http} from "../../../utils";

const _ = require('lodash')

const {Option} = Select;

const formItemLayout = {
    labelCol: {
        xs: {span: 24},
        sm: {span: 6},
    },
    wrapperCol: {
        xs: {span: 24},
        sm: {span: 14},
    },
};


class _AddPartModal extends Component {
    state={
        visibility:false,
    }

    componentWillMount() {
        this.setState({
            visibility: this.props.addPartModalVisible
        })
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (nextProps.addPartModalVisible !== this.props.addPartModalVisible) {
            this.setState({
                visibility: nextProps.addPartModalVisible
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
        const {form, selectedPartObj} = this.props
        const partKey = _.get(selectedPartObj, 'key')
        const partType = _.get(selectedPartObj, 'partType', null) // 零件类型名称
        const partNumber = _.get(selectedPartObj, 'partNumber', null) // 零件编号
        const partName = _.get(selectedPartObj, 'partName', null) // 零件名称
        const isValid = _.get(selectedPartObj, 'isValid') // 是否有效

        const {
            getFieldDecorator, getFieldError, isFieldTouched,
        } = form

        const {visibility} = this.state

        const partTypeError = isFieldTouched('partType') && getFieldError('partType'); // 零件类型
        const partNumberError = isFieldTouched('partNumber') && getFieldError('partNumber'); // 零件编号
        const partNameError = isFieldTouched('partName') && getFieldError('partName'); // 零件名称
        const isValidError = isFieldTouched('isValid') && getFieldError('isValid'); // 是否有效

        return (
            <Modal
                title={partKey?'编辑零件':'新增零件'}
                visible={visibility}
                onOk={this.handleSubmit}
                // confirmLoading={confirmLoading}
                onCancel={this.handleCancel}
                destroyOnClose={true}
            >
                <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                    <Form.Item
                        label="零件类型名称:"
                        hasFeedback
                        validateStatus={partTypeError ? 'error' : ''}
                        help={partTypeError || ''}
                    >
                        {getFieldDecorator('partType', {
                            rules: [{required: true, message: '请选择零件类型名称!'}],
                            initialValue: isValid,
                        })(
                            <Select
                                placeholder="请选择零件类型名称"
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
                    <Form.Item
                        label="零件编号:"
                        validateStatus={partNumberError ? 'error' : ''}
                        help={partNumberError || ''}
                    >
                        {getFieldDecorator('partNumber', {
                            rules: [{required: true, message: '请输入零件编号!'}],
                            initialValue: partNumber
                        })(
                            <Input
                                style={{width:'100%'}}
                                placeholder="请输入零件编号"/>
                        )}
                    </Form.Item>
                    <Form.Item
                        label="零件名称:"
                        validateStatus={partNameError ? 'error' : ''}
                        help={partNameError || ''}
                    >
                        {getFieldDecorator('partName', {
                            rules: [{required: true, message: '请输入零件名称!'}],
                            initialValue: partName
                        })(
                            <Input
                                style={{width:'100%'}}
                                placeholder="请输入零件名称"/>
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

export const AddEditPartModal = Form.create()(_AddPartModal);