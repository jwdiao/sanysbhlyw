import React, {Component} from 'react';
import {Form, Input, InputNumber, Modal, Select, message, Icon, Upload} from "antd";
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

function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

class _AddEditDeviceModal extends Component {

    state = {
        visibility:false,
        previewVisible: false,
        previewImage: '',
        fileList: [
            // {
            //     uid: '-1',
            //     name: 'xxx.png',
            //     status: 'done',
            //     url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
            // },
        ],
    };

    componentWillMount() {
        console.log('componentWillMount called',this.props.selectedDeviceObj)
        this.setState({
            visibility: this.props.addDeviceModalVisible,
        })

        if (this.props.selectedDeviceObj.devicePic) {
            this.setState({
                fileList: [this.props.selectedDeviceObj.devicePic],
            })
        } else {
            this.setState({
                fileList: [],
            })
        }
    }

    componentWillReceiveProps(nextProps, nextContext) {
        console.log('componentWillReceiveProps called',nextProps.selectedDeviceObj)
        if (nextProps.addDeviceModalVisible !== this.props.addDeviceModalVisible) {
            this.setState({
                visibility: nextProps.addDeviceModalVisible,
            })
            if (nextProps.selectedDeviceObj.devicePic) {
                this.setState({
                    fileList: [nextProps.selectedDeviceObj.devicePic],
                })
            } else {
                this.setState({
                    fileList: [],
                })
            }
        }
    }

    handleCancel = () => {
        console.log('Clicked cancel button');
        this.setState({
            fileList: [], // 清除图片列表
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

    handlePreviewCancel = () => this.setState({ previewVisible: false });

    handlePreview = async file => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }

        this.setState({
            previewImage: file.url || file.preview,
            previewVisible: true,
        });
    };

    handleChange = ({ fileList }) => this.setState({ fileList });

    render() {
        const {form, selectedDeviceObj} = this.props
        const deviceKey = _.get(selectedDeviceObj, 'key')
        const belongingTechnique = _.get(selectedDeviceObj, 'belongingTechnique') // 归属工艺
        const belongingCenterName = _.get(selectedDeviceObj, 'belongingCenterName') // 归属中心
        const deviceType = _.get(selectedDeviceObj, 'deviceType') // 设备类型
        const deviceNumber = _.get(selectedDeviceObj, 'deviceNumber') // 设备编号
        const deviceName = _.get(selectedDeviceObj, 'deviceName') // 设备名称
        const deviceModel = _.get(selectedDeviceObj, 'deviceModel') // 设备型号
        const deviceUnit = _.get(selectedDeviceObj, 'deviceUnit') // 设备单位

        const {
            getFieldDecorator, getFieldError, isFieldTouched,
        } = form

        const {visibility, previewVisible, previewImage, fileList} = this.state

        const belongingTechniqueError = isFieldTouched('belongingTechnique') && getFieldError('belongingTechnique'); // 零件类型
        const belongingCenterNameError = isFieldTouched('belongingCenterName') && getFieldError('belongingCenterName'); // 零件编号
        const deviceTypeError = isFieldTouched('deviceType') && getFieldError('deviceType'); // 零件名称
        const deviceNumberError = isFieldTouched('deviceNumber') && getFieldError('deviceNumber'); // 是否有效
        const deviceNameError = isFieldTouched('deviceName') && getFieldError('deviceName'); // 零件名称
        const deviceModelError = isFieldTouched('deviceModel') && getFieldError('deviceModel'); // 是否有效
        const deviceUnitError = isFieldTouched('deviceUnit') && getFieldError('deviceUnit'); // 是否有效


        const uploadButton = (
            <div>
                <Icon type="plus" />
                <div className="ant-upload-text">上传</div>
            </div>
        );
        return (
            <Modal
                title={deviceKey?'编辑设备':'新增设备'}
                width='50%'
                bodyStyle={{width: '100%'}}
                visible={visibility}
                onOk={this.handleSubmit}
                // confirmLoading={confirmLoading}
                onCancel={this.handleCancel}
                destroyOnClose={true}
            >
                <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                    <Form.Item
                        label="归属工艺:"
                        hasFeedback
                        validateStatus={belongingTechniqueError ? 'error' : ''}
                        help={belongingTechniqueError || ''}
                    >
                        {getFieldDecorator('belongingTechnique', {
                            rules: [{required: true, message: '请选择归属工艺!'}],
                            initialValue: belongingTechnique,
                        })(
                            <Select
                                placeholder="请选择归属工艺"
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
                        label="归属中心:"
                        hasFeedback
                        validateStatus={belongingCenterNameError ? 'error' : ''}
                        help={belongingCenterNameError || ''}
                    >
                        {getFieldDecorator('belongingCenterName', {
                            rules: [{required: true, message: '请选择归属中心!'}],
                            initialValue: belongingCenterName,
                        })(
                            <Select
                                placeholder="请选择归属中心"
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
                        label="设备类型:"
                        hasFeedback
                        validateStatus={deviceTypeError ? 'error' : ''}
                        help={deviceTypeError || ''}
                    >
                        {getFieldDecorator('deviceType', {
                            rules: [{required: true, message: '请选择零件类型名称!'}],
                            initialValue: deviceType,
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
                        label="设备编号:"
                        validateStatus={deviceNumberError ? 'error' : ''}
                        help={deviceNumberError || ''}
                    >
                        {getFieldDecorator('deviceNumber', {
                            rules: [{required: true, message: '请输入设备编号!'}],
                            initialValue: deviceNumber
                        })(
                            <Input
                                style={{width:'100%'}}
                                placeholder="请输入设备编号"/>
                        )}
                    </Form.Item>
                    <Form.Item
                        label="设备名称:"
                        validateStatus={deviceNameError ? 'error' : ''}
                        help={deviceNameError || ''}
                    >
                        {getFieldDecorator('deviceName', {
                            rules: [{required: true, message: '请输入设备名称!'}],
                            initialValue: deviceName
                        })(
                            <Input
                                style={{width:'100%'}}
                                placeholder="请输入设备名称"/>
                        )}
                    </Form.Item>
                    <Form.Item
                        label="设备型号:"
                        validateStatus={deviceModelError ? 'error' : ''}
                        help={deviceModelError || ''}
                    >
                        {getFieldDecorator('deviceModel', {
                            rules: [{required: true, message: '请输入设备型号!'}],
                            initialValue: deviceModel
                        })(
                            <Input
                                style={{width:'100%'}}
                                placeholder="请输入设备型号"/>
                        )}
                    </Form.Item>
                    <Form.Item
                        label="设备单位:"
                        validateStatus={deviceUnitError ? 'error' : ''}
                        help={deviceUnitError || ''}
                    >
                        {getFieldDecorator('deviceUnit', {
                            rules: [{required: true, message: '请输入设备单位!'}],
                            initialValue: deviceUnit
                        })(
                            <Input
                                style={{width:'100%'}}
                                placeholder="请输入设备单位"/>
                        )}
                    </Form.Item>
                    <Form.Item
                        label="电表关联:"
                        hasFeedback
                        validateStatus={belongingTechniqueError ? 'error' : ''}
                        help={belongingTechniqueError || ''}
                    >
                        {getFieldDecorator('belongingTechnique', {
                            rules: [{required: true, message: '请选择要关联的电表!'}],
                            initialValue: deviceNumber,
                        })(
                            <Select
                                style={{width: '100%'}}
                                mode="multiple"
                                placeholder="请选择要关联的电表"
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
                        label="设备图片:"
                        hasFeedback
                        validateStatus={deviceNumberError ? 'error' : ''}
                        help={deviceNumberError || ''}
                    >
                        {getFieldDecorator('deviceNumber', {
                            rules: [{required: true, message: '请选择有效状态!'}],
                            // initialValue: deviceNumber,
                        })(
                            <div className="clearfix">
                                <Upload
                                    action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                                    listType="picture-card"
                                    fileList={fileList}
                                    onPreview={this.handlePreview}
                                    onChange={this.handleChange}
                                >
                                    {fileList.length >= 1 ? null : uploadButton}
                                </Upload>
                                <Modal
                                    title={'设备图片查看'}
                                    visible={previewVisible}
                                    footer={null}
                                    onCancel={this.handlePreviewCancel}>
                                    <img alt="example" style={{ width: '100%' }} src={previewImage} />
                                </Modal>
                            </div>
                        )}
                    </Form.Item>
                </Form>
            </Modal>
        );
    }
}

export const AddEditDeviceModal = Form.create()(_AddEditDeviceModal);