import React, {Component} from 'react';
import {Form, Input, Modal, Select, message, Icon, Upload} from "antd";
import {http, Durian, BASE_URL} from "../../../utils";
import {reqAmmeterList, reqCraftCheckedList, reqDeviceTypeList, reqFindCenterList} from "../../../api";

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
        visibility: false,
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

        craftList: [], // 工艺类型列表
        workCenterList: [], // 工作中心列表
        machineTypeList: [], // 生产设备类型列表
        meterList: [],// 电表信息列表
    };

    componentWillMount() {
        console.log('componentWillMount called', this.props.selectedDeviceObj)
        this.setState({
            visibility: this.props.addDeviceModalVisible,
        })

        // if (this.props.selectedDeviceObj.devicePic) {
        //     this.setState({
        //         fileList: [this.props.selectedDeviceObj.devicePic],
        //     })
        // } else {
        //     this.setState({
        //         fileList: [],
        //     })
        // }
    }

    async componentDidMount() {
        //获取列表数据I：工艺类型
        const companyCode = Durian.get('user').companyCode
        const res1 = await reqCraftCheckedList(companyCode)
        if (res1 && res1.code === 200) {
            let originalContent = res1.data;
            const craftList = originalContent.map((item, index) => {
                return {
                    key: item.firstGroupCode,// 用于列表渲染的key
                    value: item.firstGroupCode, // 工艺编号
                    label: item.firstGroupName, // 工艺名称
                }
            })
            this.setState({
                craftList,
            })
        } else if (res1 && res1.code === 1010) {
            // message.warn('工艺类型列表为空。请首先进行【工艺类型维护】。')
        } else {
            message.error('获取工艺类型列表失败！请稍候重试。')
        }

        //获取列表数据II：工作中心
        const res2 = await reqFindCenterList()
        if (res2 && res2.code === 200) {
            const originalContent = res2.data;
            const workCenterList = originalContent.map((content, index) => {
                return {
                    key: content.id,// 用于列表渲染的key
                    value: content.workCenterCode, // 工作中心编号
                    label: content.workCenterName, // 工作中心名称
                }
            })

            this.setState({
                workCenterList,
            })
        } else if (res2 && res2.code === 1010) {
            // message.warn('工作中心列表为空。请首先进行【工作中心维护】。')
        } else {
            message.error('获取工作中心列表失败！请稍候重试。')
        }

        //获取列表数据III：生产设备类型
        const res3 = await reqDeviceTypeList({
            "pageNum": 0,
            "pageSize": 0,
            "query": {}
        })
        if (res3 && res3.code === 200) {
            const originalContent = res3.data.list;
            if (!originalContent.length) return;
            const machineTypeList = originalContent.map((content, index) => {
                return {
                    key: content.id,// 用于列表渲染的key
                    value: content.typeCode, // 设备类型编号
                    label: content.typeName, // 设备类型名称
                }
            })

            this.setState({
                machineTypeList
            })
        } else if (res3 && res3.code === 1010) {
            // message.warn('生产设备类型列表为空。请首先进行【生产设备类型】维护。')
        } else {
            message.error('获取设备类型列表失败！请稍候重试。')
        }

        //获取列表数据IV：电表信息
        const res4 = await reqAmmeterList()
        if (res4 && res4.code === 200) {
            const originalContent = res4.data;
            const meterList = originalContent.map((content, index) => {
                return {
                    key: content.id,// 用于列表渲染的key
                    value: content.deviceId, // 电表编号
                    label: content.deviceId // 电表编号
                }
            })

            this.setState({
                meterList,
            })
        } else {
            // message.error('获取电表信息列表失败！请稍候重试。')
        }
    }

    componentWillReceiveProps(nextProps, nextContext) {
        console.log('componentWillReceiveProps called', nextProps.selectedDeviceObj)
        if (nextProps.addDeviceModalVisible !== this.props.addDeviceModalVisible) {
            this.setState({
                visibility: nextProps.addDeviceModalVisible,
            })
            if (nextProps.addDeviceModalVisible) {
                const {
                    craftList, // 工艺类型列表
                    workCenterList, // 工作中心列表
                    machineTypeList, // 生产设备类型列表
                } = this.state
                let warnText = ''
                if (craftList.length === 0) {
                    warnText += '【工艺类型】'
                }
                if (workCenterList.length === 0) {
                    warnText += '【工作中心】'
                }
                if (machineTypeList.length === 0) {
                    warnText += '【生产设备类型】'
                }

                if (warnText !== '') {
                    message.warn(`请首先维护 ${warnText} 列表。`)
                }
            }
            // if (nextProps.selectedDeviceObj.devicePic) {
            //     this.setState({
            //         fileList: [nextProps.selectedDeviceObj.devicePic],
            //     })
            // } else {
            //     this.setState({
            //         fileList: [],
            //     })
            // }
        }
    }

    // 点击modal取消回调
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

    // 将数据以form表单形式提交至后端
    handleSubmit = (e) => {
        e.preventDefault();
        const {form, selectedDeviceObj} = this.props
        // console.log('selectedDeviceObj', selectedDeviceObj)
        const deviceKey = _.get(selectedDeviceObj, 'key')
        const {fileList, craftList, workCenterList, machineTypeList} = this.state
        form.validateFields(async (err, values) => {
            console.log('handleSubmit called!', values)
            // console.log('craftList', craftList)
            // console.log('workCenterList', workCenterList)
            // console.log('machineTypeList', machineTypeList)
            if (!err) {
                // 网络请求
                this.setState({
                    visible: true,
                    confirmLoading: true,
                });

                let requestUrl = '/machineInfo/saveElectricityInfo'

                let formData = new FormData()

                // 如果是编辑，则需要传递id
                if (deviceKey) {
                    formData.append('id', selectedDeviceObj.id) // 产品设备名称
                }

                formData.append('firstGroupName', craftList.filter(item => item.value === values.belongingTechnique)[0].label) // 产品设备工艺名称（需要map出来）
                formData.append('firstGroupCode', values.belongingTechnique) // 产品设备工艺型号

                formData.append('workCenterName', workCenterList.filter(item => item.value === values.belongingCenterName)[0].label) // 工作中心名称（需要map出来）
                formData.append('workCenterCode', values.belongingCenterName) // 工作中心编码

                formData.append('plcType', values.plcType) // 机床类型

                formData.append('machineTypeName', machineTypeList.filter(item => item.value === values.deviceType)[0].label) // 产品设备类型名称（需要map出来）
                formData.append('machineTypeCode', values.deviceType) // 产品设备类型编号

                formData.append('machineNo', values.deviceNumber) // 产品设备编号
                formData.append('machineName', values.deviceName) // 产品设备名称
                formData.append('machineModel', values.deviceModel) // 产品设备型号
                formData.append('dataUnit', values.deviceUnit) // 单位

                if (fileList.length>0) {
                    formData.append('imgFile', fileList[0].originFileObj) // 设备图片文件
                }
                formData.append('isFlag', '1') // 是否有效

                const result = await http.postFormData(requestUrl, formData)

                // console.log('handleSubmit result', result)

                if (result.code === 200) {
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
                    previewImage: '',
                    fileList: [],
                });
            } else {
                message.error('请检查输入内容后再提交！')
            }
        });
    }

    // 取消图片预览
    handlePreviewCancel = () => this.setState({previewVisible: false});

    // 点击图片预览
    handlePreview = async file => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }

        this.setState({
            previewImage: file.url || file.preview,
            previewVisible: true,
        });
    };

    // 监听上传图片变化
    handleChange = ({fileList, file, event}) => {
        console.log('handleChange called', fileList, file, event)
        // return;
        this.setState({fileList})
    };

    render() {
        const {form, selectedDeviceObj, plcTypeList} = this.props
        const {confirmLoading} = this.state
        // console.log('===render===', selectedDeviceObj)
        const deviceKey = _.get(selectedDeviceObj, 'key')
        const belongingTechnique = _.get(selectedDeviceObj, 'belongingTechnique') // 归属工艺
        const belongingCenterName = _.get(selectedDeviceObj, 'belongingCenterName') // 归属工作中心
        const plcType = _.get(selectedDeviceObj, 'plcType') // PLC设备类型
        const deviceType = _.get(selectedDeviceObj, 'deviceTypeName') // 设备类型
        const deviceNumber = _.get(selectedDeviceObj, 'deviceNumber') // 设备编号
        const deviceName = _.get(selectedDeviceObj, 'deviceName') // 设备名称
        const deviceModel = _.get(selectedDeviceObj, 'deviceModel') // 设备型号
        const deviceUnit = _.get(selectedDeviceObj, 'deviceUnit') // 设备单位
        const meterListString = _.get(selectedDeviceObj, 'electricityStr') // 电表字符串
        const devicePicUrl = _.get(selectedDeviceObj,'devicePic.url') // 设备图片url

        const {
            getFieldDecorator, getFieldError, isFieldTouched,
        } = form

        const {visibility, previewVisible, previewImage, fileList, craftList, machineTypeList, workCenterList, meterList} = this.state

        // const belongingTechniqueError = isFieldTouched('belongingTechnique') && getFieldError('belongingTechnique'); // 归属工艺
        // const belongingCenterNameError = isFieldTouched('belongingCenterName') && getFieldError('belongingCenterName'); // 归属工作中心
        // const deviceTypeError = isFieldTouched('deviceType') && getFieldError('deviceType'); // 设备类型
        // const deviceNumberError = isFieldTouched('deviceNumber') && getFieldError('deviceNumber'); // 设备编号
        // const deviceNameError = isFieldTouched('deviceName') && getFieldError('deviceName'); // 设备名称
        // const deviceModelError = isFieldTouched('deviceModel') && getFieldError('deviceModel'); // 设备型号
        // const deviceUnitError = isFieldTouched('deviceUnit') && getFieldError('deviceUnit'); // 设备单位
        // const meterRelatedError = isFieldTouched('meterRelated') && getFieldError('meterRelated'); // 电表关联
        // const devicePicError = isFieldTouched('devicePic') && getFieldError('devicePic'); // 设备图片

        const uploadButton = (
            <div>
                <Icon type="plus"/>
                <div className="ant-upload-text">添加</div>
            </div>
        );

        // console.log('this.state', this.state)
        return (
            <Modal
                title={deviceKey ? '编辑设备' : '新增设备'}
                width='50%'
                bodyStyle={{width: '100%'}}
                visible={visibility}
                onOk={this.handleSubmit}
                confirmLoading={confirmLoading}
                onCancel={this.handleCancel}
                destroyOnClose={true}
            >
                <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                    <Form.Item
                        label="归属工艺:"
                        // hasFeedback
                    >
                        {getFieldDecorator('belongingTechnique',
                            craftList.length > 0 && craftList.findIndex(item=>item.label === belongingTechnique) >-1
                                ? {
                                    rules: [{required: true, message: '请选择归属工艺!'}],
                                    initialValue: craftList.filter(item => item.label === belongingTechnique)[0].value,
                                }
                                : {
                                    rules: [{required: true, message: '请选择归属工艺!'}],
                                }
                        )(
                            <Select
                                placeholder="请选择归属工艺"
                                autoClearSearchValue={true}
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {
                                    craftList.map(role => {
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
                        label="归属工作中心:"
                        // hasFeedback
                    >
                        {getFieldDecorator('belongingCenterName',
                            workCenterList.length > 0 && workCenterList.findIndex(item=>item.label === belongingCenterName) >-1
                                ? {
                                    rules: [{required: true, message: '请选择归属工作中心!'}],
                                    initialValue: workCenterList.filter(item => item.label === belongingCenterName)[0].value,
                                }
                                : {
                                    rules: [{required: true, message: '请选择归属工作中心!'}],
                                })(
                            <Select
                                placeholder="请选择归属工作中心"
                                autoClearSearchValue={true}
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {
                                    workCenterList.map(role => {
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
                        // hasFeedback
                    >
                        {getFieldDecorator('deviceType',
                            machineTypeList.length > 0 && machineTypeList.findIndex(item=>item.label === deviceType) >-1
                                ? {
                                    rules: [{required: true, message: '请选择零件类型名称!'}],
                                    initialValue: machineTypeList.filter(item => item.label === deviceType)[0].value,
                                }
                                : {
                                    rules: [{required: true, message: '请选择零件类型名称!'}],
                                })(
                            <Select
                                placeholder="请选择零件类型名称"
                                autoClearSearchValue={true}
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {
                                    machineTypeList.map(role => {
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
                        label="plc类型:"
                        // hasFeedback
                    >
                        {getFieldDecorator('plcType',
                            plcTypeList.length > 0 && plcTypeList.findIndex(item=>parseInt(item.value) === parseInt(plcType)) >-1
                                ? {
                                    rules: [{required: true, message: '请选择plc类型!'}],
                                    initialValue: plcTypeList.filter(item => parseInt(item.value) === parseInt(plcType))[0].value,
                                }
                                : {
                                    rules: [{required: true, message: '请选择plc类型!'}],
                                })(
                            <Select
                                placeholder="请选择plc类型"
                                autoClearSearchValue={true}
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {
                                    plcTypeList.map(role => {
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
                        {getFieldDecorator('deviceNumber', {
                            rules: [{required: true, message: '请输入设备编号!'}],
                            initialValue: deviceNumber
                        })(
                            <Input
                                style={{width: '100%'}}
                                placeholder="请输入设备编号"/>
                        )}
                    </Form.Item>
                    <Form.Item
                        label="设备名称:"
                    >
                        {getFieldDecorator('deviceName', {
                            rules: [{required: true, message: '请输入设备名称!'}],
                            initialValue: deviceName
                        })(
                            <Input
                                style={{width: '100%'}}
                                placeholder="请输入设备名称"/>
                        )}
                    </Form.Item>
                    <Form.Item
                        label="设备型号:"
                    >
                        {getFieldDecorator('deviceModel', {
                            rules: [{required: true, message: '请输入设备型号!'}],
                            initialValue: deviceModel
                        })(
                            <Input
                                style={{width: '100%'}}
                                placeholder="请输入设备型号"/>
                        )}
                    </Form.Item>
                    <Form.Item
                        label="设备单位:"
                    >
                        {getFieldDecorator('deviceUnit', {
                            rules: [{required: true, message: '请输入设备单位!'}],
                            initialValue: deviceUnit
                        })(
                            <Input
                                style={{width: '100%'}}
                                placeholder="请输入设备单位"/>
                        )}
                    </Form.Item>

                    <Form.Item
                        label="设备图片:"
                        // hasFeedback
                    >
                        {getFieldDecorator('devicePic', {
                            // 规则：如果是新增，或者是编辑但是设备图片路径为空（设备图片无效），那么就要求必须上传图片。
                            rules: [{required: (!deviceKey || (deviceKey && !devicePicUrl)), message: '请添加设备图片!'}],
                        })(
                            <div>
                                <Upload
                                    className={'upload-style'}
                                    // action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                                    action={BASE_URL + '/machineInfo/saveElectricityInfo'}
                                    accept={'.jpeg,.jpg,.png,.bmp'}
                                    listType={'picture-card'}
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
                                    <img alt="example" style={{width: '100%'}} src={previewImage}/>
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