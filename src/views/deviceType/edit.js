import React, { Component } from 'react';
import { Input, Select, Modal,Form,message } from 'antd';
import { reqSaveMachineType } from '../../api'
const { Option } = Select;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
}
class EditModel extends Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }
  // 确定
  handleOk = e => {
    // console.log(e);
    const { editDataObj } = this.props
    const { resetFields } = this.props.form
    this.props.form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        //判断是更新 还是添加
        if(editDataObj.key) { // 编辑
          values.id = editDataObj.key;
        }
        const saveObj = {
          "id": values.id ? values.id: '',
          "isFlag": values.isFlag,
          "typeCode": values.deviceTypeCode,
          "typeName": values.deviceTypeName
        }
        const res = await reqSaveMachineType(saveObj)
        if (res && res.code === 200) {
          if (this.props.onOkClickedListener) {
            resetFields() // 重置表单
            this.props.onOkClickedListener()
            message.success(res.data);
          }
        } else if(res && res.code === 1011) {
          message.warning(res.msg);
          // message.warning(res.msg+'请重新输入设备类型名称！');
        } else {
          message.warning(res.msg);
        }
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

  render() {
    const { editVisiable, editDataObj } = this.props
    const { getFieldDecorator } = this.props.form;

    return (
      <div>
        <Modal
          title={`${editDataObj.key?'编辑设备类型':'新增设备类型'}`}
          okText="确认"
          cancelText="取消"
          visible={editVisiable}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          destroyOnClose={true}
        >
          <Form layout="horizontal">
            <Form.Item label="设备类型编号" {...formItemLayout}>
              {getFieldDecorator('deviceTypeCode', {
                initialValue: editDataObj.deviceTypeCode || '',
                rules: [{ required: true, message: '请输入编号!'}],
              })(<Input disabled={!!editDataObj.key}/>)}
            </Form.Item>
            <Form.Item label="设备类型名称" {...formItemLayout}>
              {getFieldDecorator('deviceTypeName', {
                initialValue: editDataObj.deviceTypeName || '',
                rules: [{ required: true, message: '请输入名称!'}],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="是否有效" {...formItemLayout}>
              {getFieldDecorator('isFlag', {
                initialValue: editDataObj.isFlag || '1',
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
