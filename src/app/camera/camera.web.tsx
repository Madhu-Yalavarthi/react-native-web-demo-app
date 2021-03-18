import React from "react";
import { Text, View } from "react-native";

export function CameraWebScreen(props: any) {

    function takePhoto(e: any){

        console.log(e);
    }

    return (
        // <View style={{ flex:1, justifyContent: 'center', alignItems: 'center'}}>
        //     <Text>{`In Development`}</Text>
        // </View>

        <div style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    
            <input type="file" label={"Camera"} onChange={takePhoto} help="Click to snap a photo" accept="image/*" />

        </div>
    )
}