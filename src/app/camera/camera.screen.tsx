import React, { useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, Dimensions } from 'react-native';
import { RNCamera } from 'react-native-camera';


const CameraPermissions = {
    title: 'Permission to use camera',
    message: 'We need your permission to use your camera',
    buttonPositive: 'Ok',
    buttonNegative: 'Cancel',
}

const AudioPermissions = {
    title: 'Permission to use audio recording',
    message: 'We need your permission to use your audio',
    buttonPositive: 'Ok',
    buttonNegative: 'Cancel',
}


const PendingView = () => (
    <View
        style={{
            flex: 1,
            backgroundColor: 'lightgreen',
            justifyContent: 'center',
            alignItems: 'center',
        }}
    >
        <Text>Waiting</Text>
    </View>
);

export function CameraScreen(props: any) {
    const { navigation, route } = props;
    const { name, params } = route;
    const [state, setState] = useState({});
    const cameraRef = useRef<RNCamera | null>();

    async function takePicture() {
        if (!cameraRef.current) return;
        const options = {};
        const data = await cameraRef.current.takePictureAsync();
        //  eslint-disable-next-line
        console.log(data);
    };
    if(Platform.OS === 'web') return (
        <View style={{flex: 1, justifyContent: 'center', alignItems:'center'}}>
            <Text>Not supported for web</Text>
        </View>
    )
    switch (params.type) {
        case "CAMERA": return <UICamera navigation={navigation} cameraRef={cameraRef} takePicture={() => takePicture()} />;
        case "QRCODE": return <UiQrCode navigation={navigation} cameraRef={cameraRef} />;
        case "BARCODE": return <UiBarCode navigation={navigation} cameraRef={cameraRef} />;
        default: return <UICamera navigation={navigation} cameraRef={cameraRef} takePicture={() => takePicture()} />;
    }

}


function UICamera(props: any) {
    const { navigation, takePicture, cameraRef } = props;
    return (
        <RNCamera
            ref={ref => {
                cameraRef.current = ref;
            }}
            style={styles.preview}
            type={RNCamera.Constants.Type.back}
            flashMode={RNCamera.Constants.FlashMode.off}
            androidCameraPermissionOptions={CameraPermissions}
            androidRecordAudioPermissionOptions={AudioPermissions}
            captureAudio={false}
        >
            <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center' }}>
                <Pressable style={({ pressed }) => ([styles.capture, {}])} onPress={takePicture}>
                    {/* <Text style={{ fontSize: 14 }}> SNAP </Text> */}
                    <View style={styles.innerCircle}></View>
                </Pressable>
            </View>
        </RNCamera>
    )
}


function UiQrCode(props: any) {
    const { navigation, cameraRef } = props;

    const { width, height } = Dimensions.get('window');

    const gridWidth = width - 40;

    return (
        <RNCamera
            ref={ref => {
                cameraRef.current = ref;
            }}
            style={styles.preview}
            type={RNCamera.Constants.Type.back}
            flashMode={RNCamera.Constants.FlashMode.off}
            androidCameraPermissionOptions={CameraPermissions}
            androidRecordAudioPermissionOptions={AudioPermissions}
            onBarCodeRead={(event) => {
                console.log(event);
                navigation.navigate("Result", { data: event?.data, type: event?.type });
            }}
        >
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, width: '100%', }}>
                <View style={{ width: gridWidth, height: gridWidth, borderWidth: 5, borderColor: '#fff' }}></View>
            </View>
        </RNCamera>
    )
}

function UiBarCode(props: any) {
    const { navigation, cameraRef } = props;

    return (
        <RNCamera
            ref={ref => {
                cameraRef.current = ref;
            }}
            style={styles.preview}
            type={RNCamera.Constants.Type.back}
            flashMode={RNCamera.Constants.FlashMode.off}
            androidCameraPermissionOptions={CameraPermissions}
            androidRecordAudioPermissionOptions={AudioPermissions}
            onBarCodeRead={(event) => {
                console.log(event);
                if (event.type == 'QR_CODE') return;
                navigation.navigate("Result", { data: event?.data, type: event?.type });
            }}
        >
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, width: '100%', }}>
                <View style={{ width: 6, height: 100, backgroundColor: '#fff', borderRadius: 5 }}></View>
                <View style={{ width: 6, height: 100, backgroundColor: '#fff', borderRadius: 5 }}></View>
            </View>
        </RNCamera>
    )
}





const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'black',
    },
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    capture: {
        flex: 0,
        padding: 5,
        alignSelf: 'center',
        margin: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        borderColor: "#fff",
        borderWidth: 5
    },

    innerCircle: {
        width: "100%",
        height: "100%",
        backgroundColor: "#fff",
        borderRadius: 25,
    }
});
