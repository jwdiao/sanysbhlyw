import React, {Component} from 'react';
import {Modal} from "antd";

const _ = require('lodash')

function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

class DevicePicModal extends Component {
    state = {
        visibility:false,
        previewImage: '',
    };

    async componentWillMount() {
        const {devicePicModalVisible, selectedDeviceObj} = this.props
        const file = _.get(selectedDeviceObj, 'devicePic')
        console.log('file', file)
        if (file) {
            if (!file.url && !file.preview) {
                file.preview = await getBase64(file.originFileObj);
            }

            this.setState({
                previewImage: file.url || file.preview,
                visibility: devicePicModalVisible
            });
        }
    }

    async componentWillReceiveProps(nextProps, nextContext) {
        // console.log('componentWillReceiveProps called ', nextProps)
        if (nextProps.devicePicModalVisible !== this.props.devicePicModalVisible) {
            this.setState({
                visibility: nextProps.devicePicModalVisible
            })

            if (nextProps.devicePicModalVisible){
                const {selectedDeviceObj} = nextProps
                const file = _.get(selectedDeviceObj, 'devicePic')
                if (file) {
                    if (!file.url && !file.preview) {
                        file.preview = await getBase64(file.originFileObj);
                    }

                    this.setState({
                        previewImage: file.url || file.preview,
                    });
                }
            }
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

    render() {
        const {visibility, previewImage} = this.state
        const {selectedDeviceObj} = this.props
        const deviceName = _.get(selectedDeviceObj, 'deviceName')
        return (
            <Modal
                title={deviceName?deviceName:'查看设备图片'}
                visible={visibility}
                footer={null}
                onCancel={this.handleCancel}
            >
                <img alt="example" style={{ width: '100%' }} src={previewImage} />
            </Modal>
        );
    }
}

export default DevicePicModal;