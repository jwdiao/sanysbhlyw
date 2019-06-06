import React, { Component } from 'react'
import { Input, Select, Modal,Form,DatePicker } from 'antd';
import moment from 'moment';
const { Option } = Select;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
}
class EditModel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      validValue: ''
    }
  }
  // 确定
  handleOk = e => {
    // console.log(e);
    const { onModelCancel, saveData, editDataObj, updateDataHandle } = this.props
    const { resetFields } = this.props.form
    this.props.form.validateFieldsAndScroll((err, fieldsValue) => {
      
      if (!err) {
        const values = {
          ...fieldsValue,
          'date': fieldsValue['date'].format('YYYY-MM-DD'),
        }
        console.log('values:',values)

        //判断是更新 还是添加
        if(editDataObj.key) { // 编辑
          values.key = editDataObj.key;
          updateDataHandle(values)
        } else {
          // 调用新增接口
          values.key = 'add'+Math.random()*10 // key值
          saveData(values) // 保存的数据    
        }
   
        resetFields() // 重置表单
        onModelCancel() // 关闭弹窗
      }
    });
  };

  // 取消
  handleCancel = e => {
    // console.log(e);
    this.setState({
      visible: false,
    });
  };
  handleChangeValid = value => {
    console.log(`selected ${value}`);
  }

  render() {
    const { editVisiable, onModelCancel, editDataObj } = this.props
    const { getFieldDecorator } = this.props.form;

    return (
      <div>
        <Modal
          title={`${editDataObj.key?'编辑生产计划':'新增生产计划'}`}
          okText="确认"
          cancelText="取消"
          visible={editVisiable}
          onOk={this.handleOk}
          onCancel={onModelCancel}
        >
          <Form layout="horizontal">
            <Form.Item label="日期" {...formItemLayout}>
              {getFieldDecorator('date', {
                initialValue: editDataObj.date? moment(editDataObj.date,'YYYY/MM/DD') : moment(new Date(),'YYYY/MM/DD'),
                rules: [{ type: 'object', required: true, message: '请选择日期!' }],
              })(<DatePicker format="YYYY/MM/DD"  />)}
            </Form.Item>
            <Form.Item label="设备编号" {...formItemLayout}>
              {getFieldDecorator('deviceCode', {
                initialValue: editDataObj.deviceCode || '',
                rules: [{ required: true, message: '设备编号!'}],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="设备名称" {...formItemLayout}>
              {getFieldDecorator('deviceName', {
                initialValue: editDataObj.deviceName || '',
                rules: [{ required: true, message: '设备名称!'}],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="加工零件类型" {...formItemLayout}>
              {getFieldDecorator('partsType', {
                initialValue: editDataObj.partsType || '',
                rules: [{ required: true, message: '加工零件类型!'}],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="加工零件名称" {...formItemLayout}>
              {getFieldDecorator('partsName', {
                initialValue: editDataObj.partsName || '',
                rules: [{ required: true, message: '加工零件名称!'}],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="计划生产数" {...formItemLayout}>
              {getFieldDecorator('planProduceNum', {
                initialValue: editDataObj.planProduceNum || '',
                rules: [{ required: true, message: '计划生产数!'}],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="完成生产数" {...formItemLayout}>
              {getFieldDecorator('finishProduceNum', {
                initialValue: editDataObj.finishProduceNum || '',
                rules: [{ required: true, message: '完成生产数!'}],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="是否有效" {...formItemLayout}>
              {getFieldDecorator('isValid', {
                initialValue: editDataObj.isValid,
                rules: [{ required: true, message: '请选择!' }],
              })(
                <Select
                  placeholder="请选择"
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
