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
            <input id="photoInput" type="file" style={{display: 'none'}} label={"Camera"} onChange={takePhoto} help="Click to snap a photo" accept="image/*" />
            <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <a style={{
                    width: '50%',
                    height: 50,
                    backgroundColor:'#7247a2',
                    borderRadius: 10,
                    display:'flex',
                    justifyContent:'center',
                    alignItems:'center',
                    color: '#fff',
                    fontWeight: 'bold', 
                }} onClick={()=>{(document.getElementById('photoInput') as HTMLInputElement).click()}}>
                    <span>Upload</span>
                </a>
            </div>
        </div>
    )
}
