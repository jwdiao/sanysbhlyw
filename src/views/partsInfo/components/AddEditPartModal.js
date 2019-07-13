import React, {Component} from 'react';
import {Form, Input, Modal, Select, message} from "antd";
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
    state = {
        visibility: false,
        partTypeList: [],
        machineList: [],

        machineNumber: '',
        partTypeCode: '',
    }

    componentWillMount() {
        const {addPartModalVisible} = this.props
        this.setState({
            visibility: addPartModalVisible,
        })
    }

    async componentDidMount() {
        //获取列表数据：零件类型
        const result = await http.post('/productType/find/all', {
            pageNum: 0,
            pageSize: 0,
            query: {
                isFlag: '',
                partTypeName: '',
            }
        })
        if (result && result.code === 200) {
            let partTypeList = result.data.list.map(item => ({
                key: `part_${item.partTypeCode}`,
                value: item.partTypeCode,
                label: item.partTypeName
            }))
            this.setState({
                partTypeList,
            })
        } else {
            message.error('获取零件类型列表失败！请稍候重试。')
        }

        // 获取列表数据：生产设备列表
        const result1 = await http.post('/machineInfo/findlist', {
            pageNum: 0,
            pageSize: 0,
            query: {}
        })
        if (result1.code === 200) {
            let machineList = result1.data.list.map(item => ({
                key: `machine_${item.machineNo}`,
                value: item.machineNo,
                label: item.machineName
            }))
            this.setState({
                machineList,
            })
        } else {
            message.error('获取设备类型列表失败！请稍候重试。')
        }
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (nextProps.addPartModalVisible !== this.props.addPartModalVisible) {
            const {addPartModalVisible, selectedPartObj} = nextProps
            const machineNumber = _.get(selectedPartObj, 'machineNumber', null) // 设备编号
            const partTypeCode = _.get(selectedPartObj, 'partTypeCode', null) // 零件类型编号

            this.setState({
                visibility: addPartModalVisible,
                machineNumber,
                partTypeCode,
            })
        }
    }

    handleCancel = () => {
        console.log('Clicked cancel button');
        this.setState({
            visibility: false,
            machineNumber: '', // 清空state
            partTypeCode: '', // 清空state
        });
        if (this.props.onCancelClickedListener) {
            this.props.onCancelClickedListener()
        }
    }

    // 提交数据
    handleSubmit = (e) => {
        e.preventDefault();
        const {form, selectedPartObj} = this.props
        const {partTypeList, machineList, partTypeCode, machineNumber} = this.state
        // console.log('selectedPartObj', selectedPartObj)
        const partKey = _.get(selectedPartObj, 'key') // 用来判断是编辑还是新增
        const id = _.get(selectedPartObj, 'id') // 修改时传递
        form.validateFields(async (err, values) => {
            console.log('handleSubmit values', values)
            if (!err) {
                // 网络请求
                let params = {}
                let requestUrl = '/productInfo/save'

                this.setState({
                    visible: true,
                    confirmLoading: true,
                });

                params = Object.assign({}, params, {
                    partTypeCode,// 零件类型编号
                    partTypeName: partTypeList.filter(partType => partType.value === values.partTypeName)[0].label,// 零件类型名称
                    // partTypeName: '零件类型I',// (测试)零件类型名称
                    partCode: values.partCode, // 零件编号
                    partName: values.partName,// 零件名称
                    machineNo: machineNumber, // 设备编号
                    machineName: machineList.filter(partType => partType.value === values.machineName)[0].label,// 设备名称
                    // machineName: '设备I',// (测试)设备名称
                })

                // 如果是编辑，则需要传递
                if (partKey) {
                    params = Object.assign({}, params, {
                        id,// 零件ID
                        isFlag: values.isValid,// 零件是否有效
                    })
                }

                const result = await this.callNetworkRequest({
                    requestUrl,
                    params,
                    requestMethod: 'POST'
                })

                console.log('handleSubmit result', result)
                // return;
                if (result && result.code === 200) {
                    if (this.props.onOkClickedListener) {
                        this.props.onOkClickedListener()
                    }
                    message.success('操作成功！')
                    this.setState({
                        visible: false,
                        confirmLoading: false,
                        machineNumber: '', // 清空state
                        partTypeCode: '', // 清空state
                    });
                } else if (result && result.code === 1011) {
                    message.warning(result.msg)
                } else {
                    message.error(`数据提交失败！`)
                }
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
        const {confirmLoading} = this.state
        const partKey = _.get(selectedPartObj, 'key')

        const machineName = _.get(selectedPartObj, 'machineName') // 设备名称
        const partTypeName = _.get(selectedPartObj, 'partTypeName') // 零件类型名称
        const partCode = _.get(selectedPartObj, 'partCode', null) // 零件编号
        const partName = _.get(selectedPartObj, 'partName', null) // 零件名称

        const isValid = _.get(selectedPartObj, 'isValid') // 是否有效

        const {
            getFieldDecorator, getFieldError, isFieldTouched,
        } = form

        const {visibility, machineList, partTypeList, machineNumber, partTypeCode} = this.state

        const machineNameError = isFieldTouched('machineName') && getFieldError('machineName'); // 设备名称
        const partTypeNameError = isFieldTouched('partTypeName') && getFieldError('partTypeName'); // 零件类型名称
        const partCodeError = isFieldTouched('partCode') && getFieldError('partCode'); // 零件编号
        const partNameError = isFieldTouched('partName') && getFieldError('partName'); // 零件名称
        const isValidError = isFieldTouched('isValid') && getFieldError('isValid'); // 是否有效

        return (
            <Modal
                title={partKey ? '编辑零件' : '新增零件'}
                visible={visibility}
                onOk={this.handleSubmit}
                confirmLoading={confirmLoading}
                onCancel={this.handleCancel}
                destroyOnClose={true}
            >
                <Form {...formItemLayout} onSubmit={this.handleSubmit}>

                    <Form.Item
                        label="设备名称:"
                        // hasFeedback
                    >
                        {getFieldDecorator('machineName',
                            machineList.length > 0 && machineList.findIndex(item => item.label === machineName) > -1
                                ? {
                                    rules: [{required: true, message: '请选择设备名称!'}],
                                    initialValue: machineList.filter(item => item.label === machineName)[0].value,
                                }
                                : {
                                    rules: [{required: true, message: '请选择设备名称!'}],
                                }
                        )(
                            <Select
                                placeholder="请选择设备名称"
                                autoClearSearchValue={true}
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                                onChange={value => {
                                    // console.log('value', value)
                                    this.setState({
                                        machineNumber: value
                                    })
                                }}
                            >
                                {
                                    machineList.map(role => {
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
                        label="设备编号:"
                    >
                        <div style={{lineHeight:'40px'}}>{machineNumber || '--'}</div>
                    </Form.Item>
                    <Form.Item
                        label="零件类型名称:"
                        // hasFeedback
                    >
                        {getFieldDecorator('partTypeName',
                            partTypeList.length > 0 && partTypeList.findIndex(item => item.label === partTypeName) > -1
                                ? {
                                    rules: [{required: true, message: '请选择零件类型名称!'}],
                                    initialValue: partTypeList.filter(item => item.label === partTypeName)[0].value,
                                }
                                : {
                                    rules: [{required: true, message: '请选择零件类型名称!'}],
                                }
                        )(
                            <Select
                                placeholder="请选择零件类型名称"
                                autoClearSearchValue={true}
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                                onChange={value => {
                                    // console.log('value', value)
                                    this.setState({
                                        partTypeCode: value
                                    })
                                }}
                            >
                                {
                                    partTypeList.map(role => {
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
                        label="零件类型编号:"
                    >
                        <div style={{lineHeight:'40px'}}>{partTypeCode || '--'}</div>
                    </Form.Item>
                    <Form.Item
                        label="零件名称:"
                    >
                        {getFieldDecorator('partName', {
                            rules: [{required: true, message: '请输入零件名称!'}],
                            initialValue: partName
                        })(
                            <Input
                                style={{width: '100%'}}
                                placeholder="请输入零件名称"/>
                        )}
                    </Form.Item>

                    <Form.Item
                        label="零件编号:"
                    >
                        {getFieldDecorator('partCode', {
                            rules: [{required: true, message: '请输入零件编号!'}],
                            initialValue: partCode
                        })(
                            <Input
                                disabled={!!partKey}
                                style={{width: '100%'}}
                                placeholder="请输入零件编号"/>
                        )}
                    </Form.Item>

                    {
                        partKey && (
                            <Form.Item
                                label="是否有效:"
                                // hasFeedback
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
                        )
                    }
                </Form>
            </Modal>
        );
    }
}

export const AddEditPartModal = Form.create()(_AddPartModal);