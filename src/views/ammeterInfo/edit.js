import React, { Component } from 'react';
import { Input, Select, Modal,Form, message } from 'antd';
import { reqSaveElectricityInfo } from '../../api'
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
    const { editDataObj } = this.props
    const { resetFields } = this.props.form
    this.props.form.validateFieldsAndScroll(async(err, values) => {
      if (!err) {
        console.log('values:',values)

        //判断是更新 还是添加
        if(editDataObj.key) { // 编辑
          values.id = editDataObj.key;
        }
        const res = await reqSaveElectricityInfo(values)
        // return;
        if (res && res.code === 200) {
          if (this.props.onOkClickedListener) {
            resetFields() // 重置表单
            this.props.onOkClickedListener()
            message.success(res.data);
          }
        } else if(res && res.code === 1011) {
          message.warning(res.msg);
          // message.warning(res.msg+'请重新输入电表编号！');
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
  handleChangeValid = value => {
    console.log(`selected ${value}`);
  }

  render() {
    const { editVisiable, editDataObj } = this.props
    const { getFieldDecorator } = this.props.form;

    return (
      <div>
        <Modal
          title={`${editDataObj.key?'编辑电表信息':'新增电表信息'}`}
          okText="确认"
          cancelText="取消"
          visible={editVisiable}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          destroyOnClose={true}
        >
          <Form layout="horizontal">
            <Form.Item label="电表编号" {...formItemLayout}>
              {getFieldDecorator('deviceId', {
                initialValue: editDataObj.deviceId || '',
                rules: [{ required: true, message: '请输入编号!'}],
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
