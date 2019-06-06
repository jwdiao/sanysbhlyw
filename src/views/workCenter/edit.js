import React, { Component } from 'react';
import { Input, Select, Modal,Form, } from 'antd';

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
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
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
          title={`${editDataObj.key?'编辑加工中心':'新增加工中心'}`}
          okText="确认"
          cancelText="取消"
          visible={editVisiable}
          onOk={this.handleOk}
          onCancel={onModelCancel}
        >
          <Form layout="horizontal">
            <Form.Item label="工作中心编号" {...formItemLayout}>
              {getFieldDecorator('workCenterCode', {
                initialValue: editDataObj.workCenterCode || '',
                rules: [{ required: true, message: '请输入编号!'}],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="工作中心名称" {...formItemLayout}>
              {getFieldDecorator('workCenterName', {
                initialValue: editDataObj.workCenterName || '',
                rules: [{ required: true, message: '请输入名称!'}],
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
