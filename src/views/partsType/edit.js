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
    const { onModelCancel, saveData, editDataObj } = this.props
    const { resetFields } = this.props.form
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        //判断是更新 还是添加
        if(editDataObj.key) { // 编辑
          values.id = editDataObj.key;
        }
        saveData(values) // 保存的数据
   
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
          title={`${editDataObj.key?'编辑零件类型':'新增零件类型'}`}
          okText="确认"
          cancelText="取消"
          visible={editVisiable}
          onOk={this.handleOk}
          onCancel={onModelCancel}
        >
          <Form layout="horizontal">
            <Form.Item label="零件类型编号" {...formItemLayout}>
              {getFieldDecorator('partTypeCode', {
                initialValue: editDataObj.partTypeCode || '',
                rules: [{ required: true, message: '请输入编号!'}],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="零件类型名称" {...formItemLayout}>
              {getFieldDecorator('partTypeName', {
                initialValue: editDataObj.partTypeName || '',
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
