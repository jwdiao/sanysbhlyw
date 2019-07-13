import React, { Component } from 'react'
import { Select, Modal,Form,DatePicker,message, InputNumber } from 'antd';
import moment from 'moment';
import { reqDeveceFindlist, reqPartTypeList, reqPartFindAllByMPt, reqWorkPlanSave } from '../../api'
const { Option } = Select;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
}
class EditModel extends Component {
  constructor(props) {
    super(props);
    this.deviceOptions = [] // 设备名称下拉
    this.partTypeOptions = [] // 零件类型下拉

    this.state = {
      validValue: '',
      partOptions: [], // 零件名称下拉
      
      deviceOptionsValue: '', // 设备名称下拉选中值
      partTypeOptionsValue: '', // 零件类型下拉选中值
      partCode: '' // 
    }
  }
  componentWillMount() {
    // 获取设备名称下拉
    this.getDeviceOptionsFun()
    // 获取加工零件类型下拉
    this.getPartTypeOptionsFun()
  }
  componentDidMount() {

  }
  // 获取设备名称下拉
  getDeviceOptionsFun = async() => {
    const deviceRes = await reqDeveceFindlist({
      "pageNum": 0,
      "pageSize": 0,
      "query": {
        "isFlag": 1 // 是否有效（0无效，1有效）
      }
    })
    if (deviceRes && deviceRes.code === 200) {
      const deviceList = deviceRes.data.list;
      this.deviceOptions = deviceList.map(item => {
        return {
          id: item.id+Math.random(),
          label: item.machineName,
          value: item.machineNo
        }
      })
    }
  }
  // 获取加工零件类型下拉
  getPartTypeOptionsFun = async() => {
    const partTypeRes = await reqPartTypeList({
      "pageNum": 0,
      "pageSize": 0,
      "query": {
        "isFlag": 1 // 是否有效（0无效，1有效）
      }
    })
    if (partTypeRes && partTypeRes.code === 200) {
      const partTypeList = partTypeRes.data.list;
      this.partTypeOptions = partTypeList.map(item => {
        return {
          id: item.id+Math.random(),
          label: item.partTypeName,
          value: item.partTypeCode
        }
      })
    }
  }
  // 获取零件名称下拉
  getPartOptionsFun = async(machineNo, partTypeCode, partCode) => {
    // console.log('getPartOptionsFun', machineNo, partTypeCode)
    const partRes = await reqPartFindAllByMPt({
      "machineNo": machineNo, // 设备号
      "partTypeCode": partTypeCode // 零件类型号
    })
    // console.log('getPartOptionsFun', partRes)
    let partOptions = []
    if (partRes && partRes.code === 200 && partRes.data.length) {
      const partList = partRes.data;
      partOptions = partList.map(item => {
        return {
          id: item.id+Math.random(),
          label: item.partName,
          value: item.partCode
        }
      })
    }
    this.setState({
      partOptions: partOptions
    },() => {
      if (partCode) {
        this.getPartValue(partCode)
      } else {
        this.getPartValue()
      }
    })
    // console.log('partOptions:',partOptions)
    // return;
    // let partCode = partOptions.length?partOptions[0].value:''
    // let partName = partOptions.length?partOptions[0].label:''
    // this.props.form.setFieldsValue({'partCode': partCode})
  }
  getPartValue = (value) => {
    const { partOptions } = this.state
    let partValue = ''
    if (value) {
      partOptions.forEach(item => {
        if (item.value === value) {
          partValue = item.value
        }
      })
    }
    console.log('la88888888:',partValue)
    this.setState({
      partCode: partValue
    })
    this.props.form.setFieldsValue({'partCode': partValue})
  }
  componentWillReceiveProps(nextProps) {
    if(nextProps.editVisiable !== this.props.editVisiable){
      const{ editDataObj }=nextProps
      if(editDataObj.key){
        // this.getPartValue(editDataObj.partCode)
        // const { deviceOptionsValue,partTypeOptionsValue } = this.state
        this.setState({
          deviceOptionsValue: editDataObj.machineNo,
          partTypeOptionsValue: editDataObj.partTypeCode
        })
        this.getPartOptionsFun(editDataObj.machineNo, editDataObj.partTypeCode, editDataObj.partCode)
      } else {
        this.setState({
          partOptions: [],
          partCode: ''
        })
      }
    }
  }
  // 确定
  handleOk = e => {
    // console.log(e);
    const { editDataObj } = this.props
    const { resetFields } = this.props.form
    this.props.form.validateFieldsAndScroll(async (err, fieldsValue) => {
      
      if (!err) {
        const values = {
          ...fieldsValue,
          'planDate': fieldsValue['planDate'].format('YYYY-MM-DD'),
        }

        console.log('value22:',values)
        // return;
        
        const machineNo = values.machineNo;
        this.deviceOptions.forEach(item => {
          if (item.value === machineNo) {
            values.machineName = item.label
          }
        })
        const partTypeCode = values.partTypeCode;
        this.partTypeOptions.forEach(item => {
          if (item.value === partTypeCode) {
            values.partTypeName = item.label
          }
        })
        const partCode = values.partCode;
        this.state.partOptions.forEach(item => {
          if (item.value === partCode) {
            values.partName = item.label
          }
        })
        console.log('values:',values)
        
        //判断是更新 还是添加
        if(editDataObj.key) { // 编辑
          values.id = editDataObj.key;
        }
        const res = await reqWorkPlanSave(values)
        if (res && res.code === 200) {
          if (this.props.onOkClickedListener) {
            resetFields() // 重置表单
            this.props.onOkClickedListener()
          }
        }
        message.warning(res.msg);
      }
    });
  };

  // 取消
  handleCancel = e => {
    // console.log(e);
    this.setState({
      visible: false,
    });
    if (this.props.onCancelClickedListener) {
      this.props.onCancelClickedListener()
    }
  };


  // 设备名称下拉回调（获取零件类型下拉数据）
  handleSelectChange =  value => {
    console.log('deviceOptValue:',value); // 设备号
    this.setState({
      deviceOptionsValue: value
    },  () => {
      const { deviceOptionsValue, partTypeOptionsValue} = this.state
      console.log('设备名称下拉回调:', deviceOptionsValue, partTypeOptionsValue)
      if (deviceOptionsValue && partTypeOptionsValue) {
        console.log('===22', deviceOptionsValue, partTypeOptionsValue)
        // 根据设备名称和零件类型查零件名称
         this.getPartOptionsFun(deviceOptionsValue,partTypeOptionsValue)
      }
    })
  };
  // 加工零件类型下拉回调（获取零件名称回调）
  handleSelectChangePartType = async value => {
    // console.log('PartTypeOptValue:',value); // 零件类型号
    this.setState({
      partTypeOptionsValue: value
    }, () => {
      const { deviceOptionsValue, partTypeOptionsValue} = this.state
      if (deviceOptionsValue && partTypeOptionsValue) {
        console.log('加工零件类型下拉回调:', deviceOptionsValue, partTypeOptionsValue)
        // 根据设备名称和零件类型查零件名称
        this.getPartOptionsFun(deviceOptionsValue,partTypeOptionsValue)
      }
    })
  }  

  // 零秒名称下拉
  handleSelectChangePart = value => {
    console.log('PartOptValue:',value); // 零件号
  }
  render() {
    const { editVisiable, editDataObj } = this.props
    const { getFieldDecorator } = this.props.form;
    // console.log('partOptions:',this.partOptions)
    console.log('editDataObj:',editDataObj)
    const { partOptions, deviceOptionsValue, partTypeOptionsValue, partCode } = this.state
    return (
      <div>
        <Modal
          title={`${editDataObj.key?'编辑生产计划':'新增生产计划'}`}
          okText="确认"
          cancelText="取消"
          visible={editVisiable}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          destroyOnClose={true}
        >
          <Form layout="horizontal">
            <Form.Item label="日期" {...formItemLayout}>
              {getFieldDecorator('planDate', {
                initialValue: editDataObj.planDate? moment(editDataObj.planDate,'YYYY-MM-DD') : moment(new Date(),'YYYY-MM-DD'),
                rules: [{ type: 'object', required: true, message: '请选择日期!' }],
              })(<DatePicker format="YYYY-MM-DD" style={{display:'block'}}  />)}
            </Form.Item>
            <Form.Item label="设备名称"  {...formItemLayout}>
              {getFieldDecorator('machineNo', {
                initialValue: editDataObj.machineNo,
                rules: [{ required: true, message: '请选择设备!' }],
              })(
                <Select
                  placeholder="请选择设备"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  onChange={this.handleSelectChange}
                >
                  {
                    this.deviceOptions.map(item => {
                      return <Option value={item.value} key={item.id}>{item.label}</Option>
                    })
                  }
                </Select>,
              )}
            </Form.Item>
            <Form.Item label="加工零件类型"  {...formItemLayout}>
              {getFieldDecorator('partTypeCode', {
                initialValue: editDataObj.partTypeCode,
                rules: [{ required: true, message: '请选择加工零件类型!' }],
              })(
                <Select
                  placeholder="请选择加工零件类型"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  onChange={this.handleSelectChangePartType}
                >
                 {
                   this.partTypeOptions.map(item => {
                     return <Option value={item.value} key={item.id}>{item.label}</Option>
                   })
                 }
                </Select>,
              )}
            </Form.Item>
            <Form.Item label="零件名称"  {...formItemLayout}>
              {getFieldDecorator('partCode', {
                initialValue: partCode || '',
                rules: [{ required: true, message: '请选择零件!' }],
              })(
                <Select
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  placeholder="请选择零件"
                  disabled = {!deviceOptionsValue || !partTypeOptionsValue}            
                  onChange={this.handleSelectChangePart}
                >
                 {
                   partOptions.length && partOptions.map(item => {
                     return <Option value={item.value} key={item.id}>{item.label}</Option>
                   })
                 }
                </Select>
              )}
            </Form.Item>
            <Form.Item label="白班计划生产数" {...formItemLayout}>
              {getFieldDecorator('planNumDay', {
                initialValue: editDataObj.planNumDay || '',
                rules: [{ required: true, message: '白班计划生产数!'}],
              })(
                <InputNumber
                  style={{width:'100%'}}
                  placeholder="请输入白班计划生产数"
                  min={1}
                />
              )}
            </Form.Item>
            <Form.Item label="夜班计划生产数" {...formItemLayout}>
              {getFieldDecorator('planNumNight', {
                initialValue: editDataObj.planNumNight || '',
                rules: [{ required: true, message: '夜班计划生产数!'}],
              })(
                <InputNumber
                  style={{width:'100%'}}
                  placeholder="请输入夜班计划生产数"
                  min={1}
                />
              )}
            </Form.Item>
            <Form.Item label="是否有效" {...formItemLayout}>
              {getFieldDecorator('isFlag', {
                initialValue: editDataObj.isFlag || '1',
                rules: [{ required: true, message: '请选择!' }],
              })(
                <Select
                  placeholder="请选择"
                  // disabled={!editDataObj.key}
                >
                  <Option value="1">有效</Option>
                  <Option value="0">无效</Option>
                </Select>
              )}
            </Form.Item>  
          </Form>
        </Modal>
      </div>
    );
  }
}

export default Form.create()(EditModel);
